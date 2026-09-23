import { LEVELS, audioContext, isMuted } from '../../shared/engine/audio'

/**
 * The island's soundtrack, written here rather than shipped as a file: it is
 * original by construction, so there is no licence to honour, and it costs
 * the bundle nothing.
 *
 * Every mood is its own piece rather than the same tune behind a different
 * filter — a relaxed island in D major, a colder one after dark, a party, and
 * one apiece for the four games. They all share the same clock and the same
 * handful of voices, so switching between them lands on a bar line and never
 * on a bump.
 */

export type Mood =
  | 'island'
  | 'indoor'
  | 'lighthouse'
  | 'night'
  | 'party'
  | 'hide'
  | 'paintball'
  | 'balloon'
  | 'moto'
  | 'boat'
  /** The basement, on the one day of the year it is decorated. */
  | 'christmas'

export const BPM = 104
const BEAT = 60 / BPM
const BAR = BEAT * 4
/** How far ahead notes are queued; wide enough to survive a throttled timer. */
const LOOKAHEAD = 1.6

const midi = (note: number) => 440 * Math.pow(2, (note - 69) / 12)

interface Chord {
  bass: number
  triad: number[]
}

/* ------------------------------- voices ------------------------------- */

let bus: GainNode | null = null
let filter: BiquadFilterNode | null = null
let noise: AudioBuffer | null = null
/** Context time the loop began, for the beat clock. */
let startedAt = 0
let timer = 0
let bar = 0
/** Bar the current track started on, so each piece begins at its own bar one. */
let trackFrom = 0
let nextBar = 0
let mood: Mood = 'island'
let running = false
/** Holds the loudest bars inside the rails, so nothing ever clips. */
let limiter: DynamicsCompressorNode | null = null

function noiseBuffer(ac: AudioContext) {
  if (noise) return noise
  const buffer = ac.createBuffer(1, ac.sampleRate * 0.4, ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  noise = buffer
  return buffer
}

function tone(
  ac: AudioContext,
  opts: {
    freq: number
    at: number
    duration: number
    type: OscillatorType
    level: number
    attack?: number
    detune?: number
    vibrato?: number
    /** Slides to this frequency across the note, for sirens and swells. */
    glide?: number
  },
) {
  if (!filter) return
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = opts.type
  osc.frequency.setValueAtTime(opts.freq, opts.at)
  if (opts.glide) {
    osc.frequency.exponentialRampToValueAtTime(
      opts.glide,
      opts.at + opts.duration,
    )
  }
  if (opts.detune) osc.detune.setValueAtTime(opts.detune, opts.at)

  let lfo: OscillatorNode | null = null
  let depth: GainNode | null = null
  if (opts.vibrato) {
    lfo = ac.createOscillator()
    depth = ac.createGain()
    lfo.frequency.setValueAtTime(5.2, opts.at)
    depth.gain.setValueAtTime(opts.vibrato, opts.at)
    lfo.connect(depth).connect(osc.frequency)
    lfo.start(opts.at)
    lfo.stop(opts.at + opts.duration + 0.1)
  }

  const attack = opts.attack ?? 0.012
  gain.gain.setValueAtTime(0.0001, opts.at)
  gain.gain.exponentialRampToValueAtTime(opts.level, opts.at + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, opts.at + opts.duration)

  osc.connect(gain).connect(filter)
  osc.start(opts.at)
  osc.stop(opts.at + opts.duration + 0.05)
  osc.onended = () => {
    gain.disconnect()
    depth?.disconnect()
    lfo?.disconnect()
  }
}

function thump(
  ac: AudioContext,
  at: number,
  level: number,
  from = 120,
  to = 46,
) {
  if (!filter) return
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(from, at)
  osc.frequency.exponentialRampToValueAtTime(to, at + 0.12)
  gain.gain.setValueAtTime(level, at)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.18)
  osc.connect(gain).connect(filter)
  osc.start(at)
  osc.stop(at + 0.22)
  osc.onended = () => gain.disconnect()
}

/** A band of noise: the hats, the claps and the snares are all this. */
function hit(
  ac: AudioContext,
  at: number,
  level: number,
  freq: number,
  q: number,
  decay: number,
) {
  if (!filter) return
  const src = ac.createBufferSource()
  const band = ac.createBiquadFilter()
  const gain = ac.createGain()
  src.buffer = noiseBuffer(ac)
  band.type = 'bandpass'
  band.frequency.setValueAtTime(freq, at)
  band.Q.setValueAtTime(q, at)
  gain.gain.setValueAtTime(level, at)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + decay)
  src.connect(band).connect(gain).connect(filter)
  src.start(at)
  src.stop(at + decay + 0.03)
  src.onended = () => {
    band.disconnect()
    gain.disconnect()
  }
}

const tick = (ac: AudioContext, at: number, level: number) =>
  hit(ac, at, level, 6200, 1.4, 0.055)
const clap = (ac: AudioContext, at: number, level: number) =>
  hit(ac, at, level, 1500, 0.8, 0.1)
/** Crisper and lower than a clap: the backbeat of the marching tracks. */
const snare = (ac: AudioContext, at: number, level: number) =>
  hit(ac, at, level, 2100, 0.5, 0.14)

/** A held chord, two slightly detuned voices to a note. */
function pad(
  ac: AudioContext,
  notes: number[],
  at: number,
  level: number,
  attack = 0.22,
  length = BAR * 0.98,
) {
  for (const note of notes) {
    for (const detune of [-6, 7]) {
      tone(ac, {
        freq: midi(note),
        at,
        duration: length,
        type: 'triangle',
        level,
        attack,
        detune,
      })
    }
  }
}

/* ------------------------- the island, relaxed ------------------------ */

/** Root plus triad for each bar: I – V – vi – IV, then a turnaround. */
const ISLAND: Chord[] = [
  { bass: 38, triad: [62, 66, 69] }, // D
  { bass: 33, triad: [61, 64, 69] }, // A
  { bass: 35, triad: [62, 66, 71] }, // Bm
  { bass: 31, triad: [59, 62, 67] }, // G
  { bass: 38, triad: [62, 66, 69] }, // D
  { bass: 33, triad: [61, 64, 69] }, // A
  { bass: 31, triad: [59, 62, 67] }, // G
  { bass: 33, triad: [61, 64, 69] }, // A
]

/** Eight eighth-notes per bar; null is a rest. */
const MELODY: (number | null)[][] = [
  [69, null, 66, null, 62, null, 66, null],
  [69, null, 73, null, 69, null, 66, null],
  [71, null, 74, null, 71, null, 69, null],
  [67, null, 71, null, 74, null, 71, null],
  [74, null, 71, null, 69, null, 66, null],
  [69, null, 66, null, 64, null, 61, null],
  [62, null, 64, null, 67, null, 71, null],
  [69, null, null, 71, 69, null, 66, null],
]

/** A second pass over the same chords, so the loop takes a while to notice. */
const MELODY_B: (number | null)[][] = [
  [74, null, null, 73, 71, null, 69, null],
  [73, null, 69, null, 73, null, 76, null],
  [78, null, 74, null, 71, null, 74, null],
  [71, null, 74, null, 79, null, 74, null],
  [76, null, 74, null, 71, null, 69, null],
  [73, null, 76, null, 73, null, 69, null],
  [71, null, 67, null, 71, null, 74, null],
  [73, null, 69, null, 66, null, null, null],
]

interface IslandFeel {
  arpeggio: boolean
  percussion: boolean
  /** Play every other melody note, for a more spacious feel. */
  sparse: boolean
  shimmer: boolean
}

function scheduleIsland(
  ac: AudioContext,
  index: number,
  at: number,
  feel: IslandFeel,
) {
  const chord = ISLAND[index % ISLAND.length]
  const secondPass = Math.floor(index / ISLAND.length) % 2 === 1
  const melody = (secondPass ? MELODY_B : MELODY)[index % ISLAND.length]

  pad(ac, chord.triad, at, 0.16)
  if (feel.shimmer) {
    tone(ac, {
      freq: midi(chord.triad[0] + 12),
      at,
      duration: BAR * 0.98,
      type: 'triangle',
      level: 0.07,
      attack: 0.5,
    })
  }

  // Bass: root on one and three, fifth on four.
  tone(ac, {
    freq: midi(chord.bass),
    at,
    duration: BEAT * 0.9,
    type: 'triangle',
    level: 0.34,
  })
  tone(ac, {
    freq: midi(chord.bass),
    at: at + BEAT * 2,
    duration: BEAT * 0.9,
    type: 'triangle',
    level: 0.28,
  })
  tone(ac, {
    freq: midi(chord.bass + 7),
    at: at + BEAT * 3,
    duration: BEAT * 0.8,
    type: 'triangle',
    level: 0.22,
  })

  if (feel.arpeggio) {
    const shape = [0, 1, 2, 1, 0, 1, 2, 1]
    for (let i = 0; i < 8; i++) {
      const note = chord.triad[shape[i]] + (i >= 4 ? 12 : 0)
      tone(ac, {
        freq: midi(note),
        at: at + i * (BEAT / 2),
        duration: BEAT * 0.36,
        type: 'square',
        level: 0.055,
      })
    }
  }

  for (let i = 0; i < melody.length; i++) {
    const note = melody[i]
    if (note === null) continue
    if (feel.sparse && i % 4 !== 0) continue
    tone(ac, {
      freq: midi(note),
      at: at + i * (BEAT / 2),
      duration: BEAT * (feel.sparse ? 1.6 : 0.78),
      type: 'square',
      level: 0.09,
      attack: 0.02,
      vibrato: 1.6,
    })
  }

  if (feel.percussion) {
    thump(ac, at, 0.42)
    thump(ac, at + BEAT * 2, 0.34)
    for (const beat of [0.5, 1.5, 2.5, 3.5]) tick(ac, at + beat * BEAT, 0.05)
  }
}

/* --------------------------- after dark, colder ----------------------- */

/**
 * The same island with the lights out and something not quite right about it.
 *
 * D harmonic minor, which puts a C sharp against the C natural of the key and
 * gives the whole thing its edge, over a pad that never fully settles. No
 * drum — just a low heart every other bar and a bell a long way off.
 */
const NIGHT: Chord[] = [
  { bass: 38, triad: [62, 65, 69] }, // Dm
  { bass: 38, triad: [62, 65, 68] }, // Dm b5 — the floor tilts
  { bass: 34, triad: [58, 62, 65] }, // Bb
  { bass: 33, triad: [61, 64, 69] }, // A, the sharpened seventh
]

/** A bell, high and slow, three notes to a bar at most. */
const NIGHT_BELL: (number | null)[][] = [
  [74, null, null, null, 69, null, null, null],
  [73, null, null, null, null, null, 70, null],
  [null, null, 70, null, null, null, 65, null],
  [73, null, null, 74, null, null, null, null],
]

function scheduleNight(ac: AudioContext, index: number, at: number) {
  const chord = NIGHT[index % NIGHT.length]
  const bell = NIGHT_BELL[index % NIGHT_BELL.length]

  pad(ac, chord.triad, at, 0.115, 0.9, BAR * 1.4)
  // A drone underneath the lot of it, an octave down and never resolving.
  tone(ac, {
    freq: midi(chord.bass - 12),
    at,
    duration: BAR * 1.05,
    type: 'triangle',
    level: 0.2,
    attack: 0.6,
  })
  tone(ac, {
    freq: midi(chord.bass),
    at,
    duration: BEAT * 2.6,
    type: 'triangle',
    level: 0.24,
    attack: 0.08,
  })

  for (let i = 0; i < bell.length; i++) {
    const note = bell[i]
    if (note === null) continue
    tone(ac, {
      freq: midi(note),
      at: at + i * (BEAT / 2),
      duration: BEAT * 2.2,
      type: 'sine',
      level: 0.075,
      attack: 0.03,
      vibrato: 2.4,
    })
  }

  // A heart, slow, on the odd bar only. You notice it when it stops.
  if (index % 2 === 0) {
    thump(ac, at, 0.24, 90, 38)
    thump(ac, at + BEAT * 0.62, 0.14, 84, 36)
  }
}

/* -------------------------------- party ------------------------------- */

/**
 * D minor rather than D major, a bass pumping eighths with the octave on the
 * offbeat, a kick on every beat, claps on the two and the four, hats between
 * them, and stabs off the chord.
 */
const PARTY: Chord[] = [
  { bass: 38, triad: [62, 65, 69] }, // Dm
  { bass: 34, triad: [58, 62, 65] }, // Bb
  { bass: 41, triad: [60, 65, 69] }, // F
  { bass: 36, triad: [60, 64, 67] }, // C
]

/** Eight eighths of riff per bar, as offsets into the chord. */
const PARTY_RIFF: (number | null)[][] = [
  [0, null, 2, 1, null, 2, 0, null],
  [2, null, 1, 0, null, 1, 2, null],
  [1, 2, null, 0, null, 2, 1, null],
  [0, null, 1, 2, 1, null, 0, null],
]

function scheduleParty(ac: AudioContext, index: number, at: number) {
  const chord = PARTY[index % PARTY.length]
  const riff = PARTY_RIFF[index % PARTY_RIFF.length]
  const half = BEAT / 2

  pad(ac, chord.triad, at, 0.09, 0.3)

  for (let i = 0; i < 8; i++) {
    tone(ac, {
      freq: midi(chord.bass + (i % 4 === 2 ? 12 : 0)),
      at: at + i * half,
      duration: half * 0.62,
      type: 'sawtooth',
      level: 0.3,
      attack: 0.006,
    })
  }

  for (const beat of [1.5, 3.5]) {
    for (const note of chord.triad) {
      tone(ac, {
        freq: midi(note + 12),
        at: at + beat * BEAT,
        duration: BEAT * 0.22,
        type: 'square',
        level: 0.075,
        attack: 0.006,
      })
    }
  }

  for (let i = 0; i < riff.length; i++) {
    const step = riff[i]
    if (step === null) continue
    tone(ac, {
      freq: midi(chord.triad[step] + 12),
      at: at + i * half,
      duration: half * 0.8,
      type: 'square',
      level: 0.085,
      attack: 0.01,
      vibrato: 1.2,
    })
  }

  for (let beat = 0; beat < 4; beat++) {
    thump(ac, at + beat * BEAT, beat === 0 ? 0.55 : 0.46)
  }
  clap(ac, at + BEAT, 0.09)
  clap(ac, at + BEAT * 3, 0.09)
  for (const beat of [0.5, 1.5, 2.5, 3.5]) tick(ac, at + beat * BEAT, 0.075)
  if (index % 4 === 0) tick(ac, at, 0.11)
}

/* ----------------------------- hide and seek -------------------------- */

/**
 * Agony. There is no tune in this one and there is not meant to be.
 *
 * A drone on D that never moves, a second voice a semitone above it that
 * comes and goes, a tritone where the chord ought to be, and a pulse that
 * quickens across four bars and then drops back to nothing. Nothing here
 * resolves, because the game it plays under does not either.
 */
function scheduleHide(ac: AudioContext, index: number, at: number) {
  const phase = index % 4
  const half = BEAT / 2

  // The drone. Always D, always there.
  tone(ac, {
    freq: midi(26),
    at,
    duration: BAR * 1.1,
    type: 'sawtooth',
    level: 0.11,
    attack: 0.8,
  })
  tone(ac, {
    freq: midi(38),
    at,
    duration: BAR * 1.05,
    type: 'triangle',
    level: 0.13,
    attack: 0.5,
  })

  // And the semitone above it, leaning on the drone and refusing to leave.
  if (phase === 1 || phase === 3) {
    tone(ac, {
      freq: midi(39),
      at: at + BEAT * 0.5,
      duration: BAR * 0.8,
      type: 'triangle',
      level: 0.075,
      attack: 1.1,
    })
  }

  // A tritone up top, swelling in and out over two bars.
  const colour = phase < 2 ? [62, 68] : [61, 67]
  for (const note of colour) {
    tone(ac, {
      freq: midi(note),
      at,
      duration: BAR * 1.3,
      type: 'triangle',
      level: 0.05,
      attack: 1.4,
      detune: note === colour[0] ? -9 : 11,
    })
  }

  // The pulse: two beats a bar, then three, then four, then silence.
  const hits = [2, 3, 4, 0][phase]
  for (let i = 0; i < hits; i++) {
    const when = at + (i * BAR) / Math.max(1, hits)
    thump(ac, when, 0.3 - i * 0.02, 96, 40)
  }

  // Something scraping, once a cycle, never on the beat.
  if (phase === 2) {
    hit(ac, at + BEAT * 2.7, 0.045, 3400, 0.6, 0.5)
  }
  // And a thin wire of a note sliding down out of nowhere.
  if (phase === 3) {
    tone(ac, {
      freq: midi(86),
      at: at + half,
      duration: BEAT * 3,
      type: 'sine',
      level: 0.035,
      attack: 0.4,
      glide: midi(74),
    })
  }
}

/* ------------------------------- paintball ---------------------------- */

/**
 * Adventure: a march in D major with the flattened seventh that makes
 * anything sound like it is going somewhere. Brass on the sawtooth, a snare
 * on the backbeat, and a fanfare that climbs the chord and holds the top.
 */
const PAINTBALL: Chord[] = [
  { bass: 38, triad: [62, 66, 69] }, // D
  { bass: 31, triad: [59, 62, 67] }, // G
  { bass: 36, triad: [60, 64, 67] }, // C, the flat seventh
  { bass: 38, triad: [62, 66, 69] }, // D
  { bass: 34, triad: [58, 62, 65] }, // Bb
  { bass: 36, triad: [60, 64, 67] }, // C
  { bass: 38, triad: [62, 66, 69] }, // D
  { bass: 33, triad: [61, 64, 69] }, // A
]

/** Dotted, which is what makes a march a march. */
const FANFARE: (number | null)[][] = [
  [74, null, 74, 76, 78, null, null, null],
  [79, null, null, 78, 76, null, 74, null],
  [72, null, 72, 74, 76, null, null, null],
  [78, null, null, null, 74, null, 78, null],
  [81, null, null, 79, 78, null, 76, null],
  [76, null, 76, 78, 79, null, null, null],
  [78, null, 74, null, 69, null, 74, null],
  [76, null, null, 73, 74, null, null, null],
]

function schedulePaintball(ac: AudioContext, index: number, at: number) {
  const chord = PAINTBALL[index % PAINTBALL.length]
  const line = FANFARE[index % FANFARE.length]
  const half = BEAT / 2

  pad(ac, chord.triad, at, 0.1, 0.12)

  // Bass: a marching root, on every beat, short.
  for (let beat = 0; beat < 4; beat++) {
    tone(ac, {
      freq: midi(chord.bass + (beat === 3 ? 7 : 0)),
      at: at + beat * BEAT,
      duration: BEAT * 0.5,
      type: 'sawtooth',
      level: 0.26,
      attack: 0.008,
    })
  }

  // Brass answering underneath, on the offbeats.
  for (const beat of [1.5, 3.5]) {
    for (const note of chord.triad) {
      tone(ac, {
        freq: midi(note),
        at: at + beat * BEAT,
        duration: BEAT * 0.3,
        type: 'sawtooth',
        level: 0.06,
        attack: 0.01,
      })
    }
  }

  for (let i = 0; i < line.length; i++) {
    const note = line[i]
    if (note === null) continue
    // Held where the next step is a rest, clipped where it is not.
    const held = line[i + 1] === null && line[i + 2] === null
    tone(ac, {
      freq: midi(note),
      at: at + i * half,
      duration: held ? BEAT * 1.5 : half * 0.85,
      type: 'square',
      level: 0.1,
      attack: 0.014,
      vibrato: held ? 2.2 : 0,
    })
  }

  // Kick, snare on two and four, and a roll into every eighth bar.
  thump(ac, at, 0.44)
  thump(ac, at + BEAT * 2.5, 0.3)
  snare(ac, at + BEAT, 0.085)
  snare(ac, at + BEAT * 3, 0.085)
  for (const beat of [0.5, 1.5, 2.5, 3.5]) tick(ac, at + beat * BEAT, 0.04)
  if (index % 8 === 7) {
    for (let i = 0; i < 4; i++) {
      snare(ac, at + BEAT * 3 + i * (BEAT / 4), 0.05 + i * 0.02)
    }
  }
}

/* -------------------------------- balloon ----------------------------- */

/**
 * Travel: a wide, rolling thing in G, played in triplets so it lilts rather
 * than marches. Warm, unhurried, and it keeps opening out — which is roughly
 * what the island looks like from up there.
 */
const BALLOON: Chord[] = [
  { bass: 31, triad: [59, 62, 66] }, // G
  { bass: 36, triad: [60, 64, 67] }, // C
  { bass: 33, triad: [61, 64, 69] }, // Am7-ish
  { bass: 38, triad: [62, 66, 69] }, // D
  { bass: 28, triad: [59, 64, 67] }, // Em
  { bass: 36, triad: [60, 64, 67] }, // C
  { bass: 31, triad: [59, 62, 66] }, // G
  { bass: 38, triad: [61, 66, 69] }, // D7
]

/** Twelve triplet eighths a bar, as offsets into the chord. */
const DRIFT: (number | null)[][] = [
  [0, 1, 2, null, 1, 2, 3, null, 2, 1, 0, null],
  [0, 1, 2, null, 3, 2, 1, null, 0, 1, 2, null],
  [2, 1, 0, null, 1, 2, 3, null, 2, null, 1, null],
  [0, 2, 3, null, 2, 1, 0, null, 1, 2, null, null],
]

function scheduleBalloon(ac: AudioContext, index: number, at: number) {
  const chord = BALLOON[index % BALLOON.length]
  const drift = DRIFT[index % DRIFT.length]
  // Four beats to a bar, three notes to a beat.
  const trip = BEAT / 3

  pad(ac, chord.triad, at, 0.125, 0.4, BAR * 1.1)
  tone(ac, {
    freq: midi(chord.triad[0] + 12),
    at,
    duration: BAR * 1.1,
    type: 'triangle',
    level: 0.05,
    attack: 0.9,
  })

  // Bass on the one and the three, long and round.
  tone(ac, {
    freq: midi(chord.bass),
    at,
    duration: BEAT * 1.7,
    type: 'triangle',
    level: 0.3,
    attack: 0.03,
  })
  tone(ac, {
    freq: midi(chord.bass + 7),
    at: at + BEAT * 2,
    duration: BEAT * 1.7,
    type: 'triangle',
    level: 0.22,
    attack: 0.03,
  })

  // The lilt: an arpeggio in triplets, climbing and falling.
  const ladder = [...chord.triad, chord.triad[0] + 12]
  for (let i = 0; i < drift.length; i++) {
    const step = drift[i]
    if (step === null) continue
    tone(ac, {
      freq: midi(ladder[step] + 12),
      at: at + i * trip,
      duration: trip * 1.5,
      type: 'triangle',
      level: 0.07,
      attack: 0.02,
    })
  }

  // A long horn over the top of every other bar, sailing across the chord.
  if (index % 2 === 0) {
    tone(ac, {
      freq: midi(chord.triad[2] + 12),
      at: at + BEAT * 0.5,
      duration: BEAT * 3.2,
      type: 'square',
      level: 0.06,
      attack: 0.3,
      vibrato: 2.6,
    })
  }

  // Barely any percussion: a soft heart on one, and a brush on the three.
  thump(ac, at, 0.2, 100, 44)
  hit(ac, at + BEAT * 2, 0.03, 4200, 0.7, 0.2)
}

/* ------------------------------- motorcycle --------------------------- */

/**
 * Action: E minor, sixteenths on a distorted-sounding bass, a kick pattern
 * that never sits still and a riff that runs up the scale and falls off the
 * end of it. Same tempo as everything else and it feels twice as fast,
 * because everything is half the length.
 */
const MOTO: Chord[] = [
  { bass: 28, triad: [59, 64, 67] }, // Em
  { bass: 28, triad: [59, 64, 67] }, // Em
  { bass: 31, triad: [59, 62, 67] }, // G
  { bass: 26, triad: [57, 62, 66] }, // D
  { bass: 28, triad: [59, 64, 67] }, // Em
  { bass: 24, triad: [55, 60, 64] }, // C
  { bass: 31, triad: [59, 62, 67] }, // G
  { bass: 26, triad: [57, 62, 66] }, // D
]

/** Sixteen sixteenths of riff, as scale degrees off the root. */
const RIDE_RIFF: (number | null)[][] = [
  [0, null, 3, 5, null, 3, 0, null, 7, null, 5, 3, null, 5, null, null],
  [0, null, 3, 5, null, 7, 8, null, 7, null, 5, null, 3, null, 0, null],
  [5, null, 7, 8, null, 7, 5, null, 3, null, 5, 7, null, 5, 3, null],
  [7, null, 5, 3, null, 0, 3, null, 5, null, 7, null, 8, 7, 5, null],
]

function scheduleMoto(ac: AudioContext, index: number, at: number) {
  const chord = MOTO[index % MOTO.length]
  const riff = RIDE_RIFF[index % RIDE_RIFF.length]
  const six = BEAT / 4

  pad(ac, chord.triad, at, 0.07, 0.05, BAR * 0.9)

  // Sixteenths on the root, clipped short so it chugs.
  for (let i = 0; i < 16; i++) {
    // A gap on the last sixteenth of every beat gives it its gallop.
    if (i % 4 === 3 && i % 8 !== 7) continue
    tone(ac, {
      freq: midi(chord.bass + (i % 8 === 6 ? 12 : 0)),
      at: at + i * six,
      duration: six * 0.72,
      type: 'sawtooth',
      level: 0.24,
      attack: 0.004,
    })
  }

  // The riff, an octave and a half up, in the natural minor.
  const scale = [0, 2, 3, 5, 7, 8, 10, 12, 14]
  for (let i = 0; i < riff.length; i++) {
    const step = riff[i]
    if (step === null) continue
    tone(ac, {
      freq: midi(chord.bass + 24 + scale[step]),
      at: at + i * six,
      duration: six * 1.1,
      type: 'square',
      level: 0.085,
      attack: 0.005,
    })
  }

  // Kick on one and the and-of-two, snare on the backbeat, hats throughout.
  thump(ac, at, 0.5)
  thump(ac, at + BEAT * 1.75, 0.36)
  thump(ac, at + BEAT * 2.5, 0.3)
  snare(ac, at + BEAT, 0.1)
  snare(ac, at + BEAT * 3, 0.1)
  for (let i = 0; i < 8; i++) {
    tick(ac, at + i * (BEAT / 2), i % 2 === 0 ? 0.055 : 0.035)
  }
  // A crash to open, and a fill to close the phrase.
  if (index % 4 === 0) hit(ac, at, 0.09, 5200, 0.4, 0.5)
  if (index % 8 === 7) {
    for (let i = 0; i < 6; i++)
      snare(ac, at + BEAT * 3 + i * (BEAT / 6), 0.04 + i * 0.016)
  }
}

/* ---------------------------------- boat ------------------------------ */

/**
 * Work, with something under it. D minor over a swell: a bass that rises and
 * falls in fours like a boat on a long sea, a bell every other bar, and a
 * pulse that will not quite settle — because the tide is coming in whatever
 * you are doing about it.
 */
const BOAT: Chord[] = [
  { bass: 38, triad: [62, 65, 69] }, // Dm
  { bass: 36, triad: [60, 65, 67] }, // C add
  { bass: 34, triad: [58, 62, 65] }, // Bb
  { bass: 33, triad: [61, 64, 69] }, // A
  { bass: 38, triad: [62, 65, 69] }, // Dm
  { bass: 31, triad: [59, 62, 67] }, // Gm-ish
  { bass: 34, triad: [58, 62, 65] }, // Bb
  { bass: 33, triad: [61, 64, 69] }, // A
]

/** Eight eighths, as offsets into the chord; the line keeps looking ahead. */
const WATCH: (number | null)[][] = [
  [0, null, 1, null, 2, null, 1, null],
  [2, null, 1, null, 0, null, null, null],
  [1, null, 2, null, 3, null, 2, null],
  [2, null, null, 1, 0, null, null, null],
]

function scheduleBoat(ac: AudioContext, index: number, at: number) {
  const chord = BOAT[index % BOAT.length]
  const line = WATCH[index % WATCH.length]
  const half = BEAT / 2

  pad(ac, chord.triad, at, 0.115, 0.45, BAR * 1.1)

  // The swell: the bass walks up and back down across the bar, so the whole
  // thing lifts and drops the way a hull does.
  const swell = [0, 7, 12, 7]
  for (let beat = 0; beat < 4; beat++) {
    tone(ac, {
      freq: midi(chord.bass + swell[beat]),
      at: at + beat * BEAT,
      duration: BEAT * 0.92,
      type: 'triangle',
      level: beat === 0 ? 0.3 : 0.2,
      attack: 0.04,
    })
  }

  // A bell off the water, every other bar, high and unhurried.
  if (index % 2 === 0) {
    const ladder = [...chord.triad, chord.triad[0] + 12]
    for (let i = 0; i < line.length; i++) {
      const step = line[i]
      if (step === null) continue
      tone(ac, {
        freq: midi(ladder[step] + 12),
        at: at + i * half,
        duration: BEAT * 1.4,
        type: 'sine',
        level: 0.07,
        attack: 0.03,
        vibrato: 1.8,
      })
    }
  }

  // And the engine: a steady four under all of it, with a brush between.
  for (let beat = 0; beat < 4; beat++) {
    thump(ac, at + beat * BEAT, beat % 2 === 0 ? 0.32 : 0.22, 104, 42)
  }
  for (const beat of [0.5, 1.5, 2.5, 3.5]) {
    hit(ac, at + beat * BEAT, 0.028, 3800, 0.6, 0.14)
  }
  // Every eighth bar the tide gets a word in.
  if (index % 8 === 7) hit(ac, at + BEAT * 3, 0.05, 900, 0.4, 0.6)
}

/* --------------------------- the twenty-fifth -------------------------- */

/**
 * The basement on Christmas Day.
 *
 * An original piece in the idiom rather than a carol: everything on this
 * island is written here so there is no licence to honour, and that holds for
 * this too, however tempting the obvious tune was.
 *
 * G major, which is the warmest key the voices here have; a plagal turn
 * through IV and back, which is the sound of every carol ever written without
 * being any of them; bells two octaves up rather than the square lead; and a
 * shaker on the offbeats standing in for sleigh bells. The lilt is in the
 * rhythm — a long-short dotted pair on each beat, which is what makes it
 * swing rather than march.
 */
const CHRISTMAS: Chord[] = [
  { bass: 43, triad: [67, 71, 74] }, // G
  { bass: 48, triad: [67, 72, 76] }, // C, the plagal step out
  { bass: 43, triad: [67, 71, 74] }, // G
  { bass: 38, triad: [66, 69, 74] }, // D, and the step home
  { bass: 40, triad: [67, 71, 76] }, // Em
  { bass: 48, triad: [67, 72, 76] }, // C
  { bass: 45, triad: [69, 72, 76] }, // Am
  { bass: 38, triad: [66, 69, 74] }, // D
]

/**
 * Eight eighths of carol per bar. It rises to the octave over the first half
 * and comes down the long way, which is the shape everybody already knows
 * without being able to name a tune it belongs to.
 */
const CAROL: (number | null)[][] = [
  [74, null, 74, 76, 74, null, 71, null],
  [72, null, 72, 74, 72, null, 67, null],
  [74, null, 76, 79, 78, null, 76, null],
  [74, null, null, 73, 74, null, null, null],
  [76, null, 76, 74, 71, null, 74, null],
  [72, null, 74, 76, 72, null, 67, null],
  [69, null, 72, 74, 76, null, 74, null],
  [71, null, null, 74, 71, null, null, null],
]

function scheduleChristmas(ac: AudioContext, index: number, at: number) {
  const chord = CHRISTMAS[index % CHRISTMAS.length]
  const line = CAROL[index % CAROL.length]

  pad(ac, chord.triad, at, 0.13, 0.3)

  // Bass on one and three, and the fifth lifting into the next bar.
  tone(ac, {
    freq: midi(chord.bass),
    at,
    duration: BEAT * 1.7,
    type: 'triangle',
    level: 0.3,
  })
  tone(ac, {
    freq: midi(chord.bass),
    at: at + BEAT * 2,
    duration: BEAT * 0.9,
    type: 'triangle',
    level: 0.24,
  })
  tone(ac, {
    freq: midi(chord.bass + 7),
    at: at + BEAT * 3.5,
    duration: BEAT * 0.45,
    type: 'triangle',
    level: 0.18,
  })

  // The tune, dotted: the note on the beat is held long and the one after it
  // is clipped, which is the whole difference between a lilt and a march.
  for (let i = 0; i < line.length; i++) {
    const note = line[i]
    if (note === null) continue
    const onBeat = i % 2 === 0
    tone(ac, {
      freq: midi(note),
      at: at + i * (BEAT / 2) + (onBeat ? 0 : BEAT * 0.16),
      duration: BEAT * (onBeat ? 0.62 : 0.2),
      type: 'triangle',
      level: onBeat ? 0.1 : 0.07,
      attack: 0.015,
      vibrato: 1.2,
    })
  }

  // A glockenspiel two octaves over the chord, one note a bar, so the room
  // has something bright in it that is not the tune.
  tone(ac, {
    freq: midi(chord.triad[index % 3] + 24),
    at: at + BEAT * (index % 2 === 0 ? 0 : 2),
    duration: BEAT * 2.4,
    type: 'sine',
    level: 0.055,
    attack: 0.01,
  })

  // Sleigh bells: a shaker on every offbeat, with the accent on the four.
  for (const beat of [0.5, 1.5, 2.5, 3.5]) {
    hit(ac, at + beat * BEAT, beat === 3.5 ? 0.055 : 0.034, 7200, 0.9, 0.075)
  }
  thump(ac, at, 0.26, 96, 44)
  thump(ac, at + BEAT * 2, 0.2, 92, 42)
}

/* -------------------------------- tracks ------------------------------ */

interface Track {
  gain: number
  cutoff: number
  play: (ac: AudioContext, index: number, at: number) => void
}

const RELAXED: IslandFeel = {
  arpeggio: true,
  percussion: true,
  sparse: false,
  shimmer: false,
}

const TRACKS: Record<Mood, Track> = {
  island: {
    gain: 0.13,
    cutoff: 2600,
    play: (ac, i, at) => scheduleIsland(ac, i, at, RELAXED),
  },
  indoor: {
    gain: 0.085,
    cutoff: 850,
    play: (ac, i, at) =>
      scheduleIsland(ac, i, at, { ...RELAXED, percussion: false }),
  },
  lighthouse: {
    gain: 0.115,
    cutoff: 1700,
    play: (ac, i, at) =>
      scheduleIsland(ac, i, at, {
        arpeggio: true,
        percussion: false,
        sparse: true,
        shimmer: true,
      }),
  },
  night: { gain: 0.115, cutoff: 1500, play: scheduleNight },
  party: { gain: 0.3, cutoff: 7500, play: scheduleParty },
  hide: { gain: 0.16, cutoff: 1250, play: scheduleHide },
  paintball: { gain: 0.15, cutoff: 4200, play: schedulePaintball },
  balloon: { gain: 0.14, cutoff: 3200, play: scheduleBalloon },
  moto: { gain: 0.15, cutoff: 5200, play: scheduleMoto },
  boat: { gain: 0.14, cutoff: 2400, play: scheduleBoat },
  christmas: { gain: 0.125, cutoff: 3400, play: scheduleChristmas },
}

/* ------------------------------ sequencing ---------------------------- */

function pump() {
  const ac = audioContext()
  if (!ac || !running) return
  while (nextBar < ac.currentTime + LOOKAHEAD) {
    // A tab that slept can leave nextBar far behind; catch up rather than
    // scheduling a burst of overlapping bars.
    if (nextBar < ac.currentTime) nextBar = ac.currentTime + 0.05
    TRACKS[mood].play(ac, bar - trackFrom, nextBar)
    nextBar += BAR
    bar++
  }
}

/* -------------------------------- control ----------------------------- */

let level = LEVELS

/** Same curve as the effects: see the note on theirs. */
const scale = () => (level / LEVELS) ** 1.5

/** Where the bus should sit for the current mood at the current level. */
const target = () => Math.max(0.0001, TRACKS[mood].gain * scale())

/**
 * Nothing to fade to at zero — an exponential ramp cannot reach silence, so
 * the track stops outright and starts again when a level comes back.
 */
export function setMusicLevel(next: number) {
  level = Math.max(0, Math.min(LEVELS, Math.round(next)))
  if (level === 0) {
    stopMusic()
    return
  }
  const ac = audioContext()
  if (!ac || !bus) return
  bus.gain.cancelScheduledValues(ac.currentTime)
  bus.gain.setTargetAtTime(target(), ac.currentTime, 0.12)
}

export const musicLevel = () => level

export function startMusic() {
  if (running || isMuted() || level === 0) return
  const ac = audioContext()
  if (!ac) return

  bus = ac.createGain()
  filter = ac.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(TRACKS[mood].cutoff, ac.currentTime)
  filter.Q.setValueAtTime(0.6, ac.currentTime)

  // The party mixes far hotter than the island does, so the last thing in
  // the chain is a limiter rather than a hope.
  limiter = ac.createDynamicsCompressor()
  limiter.threshold.setValueAtTime(-7, ac.currentTime)
  limiter.knee.setValueAtTime(6, ac.currentTime)
  limiter.ratio.setValueAtTime(12, ac.currentTime)
  limiter.attack.setValueAtTime(0.004, ac.currentTime)
  limiter.release.setValueAtTime(0.18, ac.currentTime)

  filter.connect(bus).connect(limiter).connect(ac.destination)

  bus.gain.setValueAtTime(0.0001, ac.currentTime)
  bus.gain.exponentialRampToValueAtTime(target(), ac.currentTime + 2.5)

  running = true
  bar = 0
  trackFrom = 0
  startedAt = ac.currentTime + 0.15
  nextBar = startedAt
  pump()
  timer = window.setInterval(pump, 260)
}

export function stopMusic() {
  if (!running) return
  running = false
  const dyingLimiter = limiter
  limiter = null
  if (dyingLimiter) {
    window.setTimeout(() => dyingLimiter.disconnect(), 1200)
  }
  window.clearInterval(timer)
  const ac = audioContext()
  if (ac && bus) {
    bus.gain.cancelScheduledValues(ac.currentTime)
    bus.gain.setValueAtTime(Math.max(bus.gain.value, 0.0001), ac.currentTime)
    bus.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.8)
    const dying = bus
    window.setTimeout(() => dying.disconnect(), 1200)
  }
  bus = null
  filter = null
}

export function setMusicEnabled(on: boolean) {
  if (on) startMusic()
  else stopMusic()
}

export const isMusicRunning = () => running

/**
 * Beats since the loop started, or null when nothing is playing. Fractional,
 * so anything that wants to move on the beat can read the half beats too.
 */
export function musicBeats(): number | null {
  const ac = audioContext()
  if (!ac || !running) return null
  // The loop is queued a moment ahead, so clamp the first fraction of a
  // second rather than handing out a negative beat.
  return Math.max(0, (ac.currentTime - startedAt) / BEAT)
}

/**
 * Changes the piece. The new one starts at its own first bar on the next bar
 * line, so a switch never lands in the middle of a phrase.
 */
export function setMood(next: Mood) {
  if (mood === next) return
  mood = next
  trackFrom = bar
  const ac = audioContext()
  if (!ac || !bus || !filter) return
  bus.gain.cancelScheduledValues(ac.currentTime)
  bus.gain.setTargetAtTime(target(), ac.currentTime, 0.5)
  filter.frequency.setTargetAtTime(TRACKS[next].cutoff, ac.currentTime, 0.5)
}
