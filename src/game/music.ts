import { audioContext, isMuted } from './audio'

/**
 * The island's soundtrack, written here rather than shipped as a file: it is
 * original by construction, so there is no licence to honour, and it costs the
 * bundle nothing. A chord loop in D major with a bass, an arpeggio, a sparse
 * melody and a little percussion, scheduled a bar or two ahead of the clock.
 */

export type Mood = 'island' | 'indoor' | 'lighthouse' | 'night' | 'party'

export const BPM = 104
const BEAT = 60 / BPM
const BAR = BEAT * 4
/** How far ahead notes are queued; wide enough to survive a throttled timer. */
const LOOKAHEAD = 1.6

const midi = (note: number) => 440 * Math.pow(2, (note - 69) / 12)

/** Root plus triad for each bar: I – V – vi – IV, then a turnaround. */
const PROGRESSION: { bass: number; triad: number[] }[] = [
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

interface MoodConfig {
  gain: number
  cutoff: number
  arpeggio: boolean
  percussion: boolean
  /** Play every other melody note, for a more spacious feel. */
  sparse: boolean
  shimmer: boolean
}

const MOODS: Record<Mood, MoodConfig> = {
  island: {
    gain: 0.13,
    cutoff: 2600,
    arpeggio: true,
    percussion: true,
    sparse: false,
    shimmer: false,
  },
  indoor: {
    gain: 0.085,
    cutoff: 850,
    arpeggio: false,
    percussion: false,
    sparse: false,
    shimmer: false,
  },
  lighthouse: {
    gain: 0.115,
    cutoff: 1700,
    arpeggio: true,
    percussion: false,
    sparse: true,
    shimmer: true,
  },
  /** The same island with the lights out: no drum, and the top taken off. */
  night: {
    gain: 0.1,
    cutoff: 1150,
    arpeggio: true,
    percussion: false,
    sparse: true,
    shimmer: true,
  },
  /**
   * Its own tune, not the island's turned up: see schedulePartyBar. Loud,
   * with the filter all the way open.
   */
  party: {
    gain: 0.3,
    cutoff: 7500,
    arpeggio: true,
    percussion: true,
    sparse: false,
    shimmer: true,
  },
}

let bus: GainNode | null = null
let filter: BiquadFilterNode | null = null
let noise: AudioBuffer | null = null
/** Context time the loop began, for the beat clock. */
let startedAt = 0
let timer = 0
let bar = 0
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

/* ------------------------------- voices ------------------------------- */

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
  },
) {
  if (!filter) return
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = opts.type
  osc.frequency.setValueAtTime(opts.freq, opts.at)
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

function thump(ac: AudioContext, at: number, level: number) {
  if (!filter) return
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(120, at)
  osc.frequency.exponentialRampToValueAtTime(46, at + 0.12)
  gain.gain.setValueAtTime(level, at)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.18)
  osc.connect(gain).connect(filter)
  osc.start(at)
  osc.stop(at + 0.22)
  osc.onended = () => gain.disconnect()
}

function tick(ac: AudioContext, at: number, level: number) {
  if (!filter) return
  const src = ac.createBufferSource()
  const band = ac.createBiquadFilter()
  const gain = ac.createGain()
  src.buffer = noiseBuffer(ac)
  band.type = 'bandpass'
  band.frequency.setValueAtTime(6200, at)
  band.Q.setValueAtTime(1.4, at)
  gain.gain.setValueAtTime(level, at)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.055)
  src.connect(band).connect(gain).connect(filter)
  src.start(at)
  src.stop(at + 0.08)
  src.onended = () => {
    band.disconnect()
    gain.disconnect()
  }
}

/** Wider and longer than a hat: the two and the four. */
function clap(ac: AudioContext, at: number, level: number) {
  if (!filter) return
  const src = ac.createBufferSource()
  const band = ac.createBiquadFilter()
  const gain = ac.createGain()
  src.buffer = noiseBuffer(ac)
  band.type = 'bandpass'
  band.frequency.setValueAtTime(1500, at)
  band.Q.setValueAtTime(0.8, at)
  gain.gain.setValueAtTime(level, at)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.1)
  src.connect(band).connect(gain).connect(filter)
  src.start(at)
  src.stop(at + 0.14)
  src.onended = () => {
    band.disconnect()
    gain.disconnect()
  }
}

/* ------------------------------ sequencing ---------------------------- */

function scheduleBar(ac: AudioContext, index: number, at: number) {
  const config = MOODS[mood]
  const chord = PROGRESSION[index % PROGRESSION.length]
  const secondPass = Math.floor(index / PROGRESSION.length) % 2 === 1
  const melody = (secondPass ? MELODY_B : MELODY)[index % PROGRESSION.length]

  // Pad: the triad held across the bar, two slightly detuned voices each.
  for (const note of chord.triad) {
    for (const detune of [-6, 7]) {
      tone(ac, {
        freq: midi(note),
        at,
        duration: BAR * 0.98,
        type: 'triangle',
        level: 0.16,
        attack: 0.22,
        detune,
      })
    }
  }
  if (config.shimmer) {
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
  tone(ac, { freq: midi(chord.bass), at, duration: BEAT * 0.9, type: 'triangle', level: 0.34 })
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

  // Arpeggio: eighth notes climbing the chord and back.
  if (config.arpeggio) {
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

  // Melody.
  for (let i = 0; i < melody.length; i++) {
    const note = melody[i]
    if (note === null) continue
    if (config.sparse && i % 4 !== 0) continue
    tone(ac, {
      freq: midi(note),
      at: at + i * (BEAT / 2),
      duration: BEAT * (config.sparse ? 1.6 : 0.78),
      type: 'square',
      level: 0.09,
      attack: 0.02,
      vibrato: 1.6,
    })
  }

  if (config.percussion) {
    thump(ac, at, 0.42)
    thump(ac, at + BEAT * 2, 0.34)
    for (const beat of [0.5, 1.5, 2.5, 3.5]) {
      tick(ac, at + beat * BEAT, 0.05)
    }
  }
}

/* -------------------------------- party ------------------------------- */

/**
 * The party's own track: D minor rather than D major, a bass pumping eighths
 * with the octave on the offbeat, a kick on every beat, claps on the two and
 * the four, hats between them, and stabs off the chord. Same tempo as the
 * island, so anything dancing to one is dancing to the other.
 */
const PARTY_PROGRESSION: { bass: number; triad: number[] }[] = [
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

function schedulePartyBar(ac: AudioContext, index: number, at: number) {
  const chord = PARTY_PROGRESSION[index % PARTY_PROGRESSION.length]
  const riff = PARTY_RIFF[index % PARTY_RIFF.length]
  const half = BEAT / 2

  // Pad, held long and low in the mix so the rest can sit on top of it.
  for (const note of chord.triad) {
    for (const detune of [-8, 9]) {
      tone(ac, {
        freq: midi(note),
        at,
        duration: BAR * 0.98,
        type: 'triangle',
        level: 0.09,
        attack: 0.3,
        detune,
      })
    }
  }

  // Bass: eighths on the root, with the octave on every other one.
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

  // Stabs: the triad, short, off the beat.
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

  // Riff over the top.
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

  // Four on the floor, claps on two and four, hats in between.
  for (let beat = 0; beat < 4; beat++) {
    thump(ac, at + beat * BEAT, beat === 0 ? 0.55 : 0.46)
  }
  clap(ac, at + BEAT, 0.09)
  clap(ac, at + BEAT * 3, 0.09)
  for (const beat of [0.5, 1.5, 2.5, 3.5]) {
    tick(ac, at + beat * BEAT, 0.075)
  }
  // A crash to open every fourth bar.
  if (index % 4 === 0) tick(ac, at, 0.11)
}

function pump() {
  const ac = audioContext()
  if (!ac || !running) return
  while (nextBar < ac.currentTime + LOOKAHEAD) {
    // A tab that slept can leave nextBar far behind; catch up rather than
    // scheduling a burst of overlapping bars.
    if (nextBar < ac.currentTime) nextBar = ac.currentTime + 0.05
    if (mood === 'party') schedulePartyBar(ac, bar, nextBar)
    else scheduleBar(ac, bar, nextBar)
    nextBar += BAR
    bar++
  }
}

/* -------------------------------- control ----------------------------- */

export function startMusic() {
  if (running || isMuted()) return
  const ac = audioContext()
  if (!ac) return

  bus = ac.createGain()
  filter = ac.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(MOODS[mood].cutoff, ac.currentTime)
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
  bus.gain.exponentialRampToValueAtTime(MOODS[mood].gain, ac.currentTime + 2.5)

  running = true
  bar = 0
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

/** Softens the arrangement indoors and opens it up again outside. */
export function setMood(next: Mood) {
  if (mood === next) return
  mood = next
  const ac = audioContext()
  if (!ac || !bus || !filter) return
  bus.gain.cancelScheduledValues(ac.currentTime)
  bus.gain.setTargetAtTime(MOODS[next].gain, ac.currentTime, 0.5)
  filter.frequency.setTargetAtTime(MOODS[next].cutoff, ac.currentTime, 0.5)
}
