let ctx: AudioContext | null = null

/** The one shared context, resumed on demand. Also used by the music. */
export function audioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (
        window as unknown as {
          webkitAudioContext?: typeof AudioContext
        }
      ).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

let muted = false

export function setMuted(value: boolean) {
  muted = value
  refreshEngine()
}

export const isMuted = () => muted

/** Loudest step. Levels run 0 (silent) to here. */
export const LEVELS = 5

let level = LEVELS

/**
 * Amplitude for a step. Loudness is not heard in proportion to amplitude —
 * halving the number is nowhere near half as loud — so the steps are spaced
 * on a curve. Linear spacing puts almost the whole audible range between the
 * top two steps and leaves the bottom three sounding much the same.
 */
const scale = () => (level / LEVELS) ** 1.5

export function setSfxLevel(next: number) {
  level = Math.max(0, Math.min(LEVELS, Math.round(next)))
  refreshEngine()
}

export const sfxLevel = () => level

function tone(
  freq: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  delay = 0,
) {
  if (muted || level === 0) return
  const ac = audioContext()
  if (!ac) return
  const start = ac.currentTime + delay
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume * scale(), start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain).connect(ac.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

/** Short text-scroll click, pitched slightly at random. */
export function blip() {
  tone(660 + Math.random() * 90, 0.045, 'square', 0.035)
}

export function confirm() {
  tone(523.25, 0.07, 'square', 0.05)
  tone(783.99, 0.09, 'square', 0.045, 0.06)
}

export function cancel() {
  tone(392, 0.09, 'square', 0.04)
}

/** Short rising blip for a jump. */
export function hop() {
  tone(520, 0.09, 'square', 0.028)
  tone(700, 0.07, 'square', 0.022, 0.045)
}

/** Fanfare for a new journal entry. */
export function jingle() {
  tone(659.25, 0.09, 'square', 0.045)
  tone(783.99, 0.09, 'square', 0.045, 0.09)
  tone(1046.5, 0.22, 'square', 0.05, 0.18)
}

/** Dry pop of a marker firing. */
export function pop() {
  tone(210, 0.06, 'square', 0.035)
  tone(880, 0.035, 'triangle', 0.03, 0.01)
}

/** Wet slap of paint finding someone. */
export function splat() {
  tone(150, 0.13, 'sawtooth', 0.045)
  tone(94, 0.18, 'square', 0.03, 0.03)
}

/** You took one. Two falling notes. */
export function hurt() {
  tone(330, 0.12, 'square', 0.05)
  tone(196, 0.2, 'square', 0.045, 0.1)
}

/** Click-clack of a fresh hopper. */
export function reload() {
  tone(440, 0.05, 'square', 0.03)
  tone(660, 0.07, 'square', 0.035, 0.07)
}

/** Empty trigger. */
export function dry() {
  tone(120, 0.05, 'square', 0.025)
}

/** Bright two-note chime for a coin. */
export function coin() {
  tone(988, 0.06, 'square', 0.035)
  tone(1319, 0.12, 'square', 0.03, 0.05)
}

/** The bike putting a wheel wrong. */
export function thud() {
  tone(90, 0.22, 'sawtooth', 0.05)
  tone(140, 0.12, 'square', 0.03, 0.04)
}

/** A water bomb finding the road: a short wet slap with a tail. */
export function splash() {
  tone(320, 0.09, 'sine', 0.045)
  tone(160, 0.2, 'sine', 0.035, 0.03)
  tone(90, 0.24, 'triangle', 0.025, 0.06)
}

/** A sentry's whistle: two shrill blasts, and you stop where you are. */
export function whistle() {
  for (const at of [0, 0.22]) {
    tone(2080, 0.15, 'square', 0.022, at)
    tone(2460, 0.13, 'square', 0.02, at + 0.02)
  }
}

/**
 * The hide-and-seek proximity thump. Low and soft, and it climbs a little as
 * you close on somebody — but it is the same in every direction, which is
 * the whole point of it.
 */
export function pulse(warmth: number) {
  const base = 150 + warmth * 130
  tone(base, 0.1, 'sine', 0.05)
  tone(base * 0.5, 0.16, 'triangle', 0.03, 0.02)
}

/** Confetti going up: three bright notes, quick. */
export function fizz() {
  tone(880, 0.05, 'triangle', 0.03)
  tone(1175, 0.05, 'triangle', 0.028, 0.04)
  tone(1568, 0.1, 'triangle', 0.026, 0.08)
}

/* -------------------------------- engine --------------------------------- */

/**
 * The motorcycle, which is the first thing on the island that is a note held
 * for as long as you are on it rather than a sound that gets fired.
 *
 * Two sawtooths a hair apart through a lowpass. The beat between them is most
 * of what makes a small engine sound like an engine; the filter opening as
 * the revs climb is the rest of it. Off the tarmac both are dragged down and
 * pulled further apart, which is as close to a tyre in the grass as two
 * oscillators get.
 *
 * A third oscillator wobbles the pitch of the other two. It is barely there
 * running straight and opens up as the bike leans, so the note flutters
 * through a corner instead of holding flat — which at maximum speed, where
 * the revs have nowhere left to climb, is the only thing left that moves.
 */
let engine: {
  a: OscillatorNode
  b: OscillatorNode
  /** The wobble, and how far it swings the note. */
  flutter: OscillatorNode
  flutterDepth: GainNode
  filter: BiquadFilterNode
  gain: GainNode
  /** Last values asked for, so a change of volume can be re-applied. */
  revs: number
  load: number
} | null = null

/** Fundamental at a standstill, and flat out. */
const IDLE_HZ = 47
const PEAK_HZ = 196

function engineGain(revs: number, load: number) {
  if (muted || level === 0) return 0.0001
  return Math.max(0.0001, (0.04 + revs * 0.06 + load * 0.018) * scale())
}

/** Re-applies the volume after a mute or a level change, mid-race. */
function refreshEngine() {
  const e = engine
  const ac = e && audioContext()
  if (!e || !ac) return
  e.gain.gain.setTargetAtTime(engineGain(e.revs, e.load), ac.currentTime, 0.05)
}

export function engineStart() {
  if (engine) return
  const ac = audioContext()
  if (!ac) return
  const now = ac.currentTime

  const a = ac.createOscillator()
  const b = ac.createOscillator()
  a.type = 'sawtooth'
  b.type = 'sawtooth'
  a.frequency.setValueAtTime(IDLE_HZ, now)
  b.frequency.setValueAtTime(IDLE_HZ * 1.012, now)

  const filter = ac.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(420, now)
  filter.Q.value = 5

  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.0001, now)

  // The wobble is wired into both frequencies rather than applied per frame,
  // so it keeps its own steady rate however the game is running.
  const flutter = ac.createOscillator()
  flutter.type = 'sine'
  flutter.frequency.setValueAtTime(9, now)
  const flutterDepth = ac.createGain()
  flutterDepth.gain.setValueAtTime(0, now)
  flutter.connect(flutterDepth)
  flutterDepth.connect(a.frequency)
  flutterDepth.connect(b.frequency)

  a.connect(filter)
  b.connect(filter)
  filter.connect(gain).connect(ac.destination)
  a.start()
  b.start()
  flutter.start()

  engine = { a, b, flutter, flutterDepth, filter, gain, revs: 0, load: 0 }
  engineRevs(0, 0, false, 0)
}

/**
 * `revs` 0 to 1 is how hard it is turning over, `load` how much throttle is
 * behind it, `rough` whether the wheels are on grass, and `lean` how far over
 * it is in a corner — which is what the note flutters with.
 */
export function engineRevs(
  revs: number,
  load: number,
  rough = false,
  lean = 0,
) {
  const e = engine
  const ac = e && audioContext()
  if (!e || !ac) return
  e.revs = revs
  e.load = load

  const now = ac.currentTime
  const hz = IDLE_HZ + (PEAK_HZ - IDLE_HZ) * revs
  const spread = rough ? 1.045 : 1.012
  e.a.frequency.setTargetAtTime(hz, now, 0.05)
  e.b.frequency.setTargetAtTime(hz * spread, now, 0.05)
  e.filter.frequency.setTargetAtTime(
    (360 + revs * 1850 + load * 620) * (rough ? 0.55 : 1),
    now,
    0.06,
  )
  e.gain.gain.setTargetAtTime(engineGain(revs, load), now, 0.05)

  // Swing in Hz, as a share of the note, so it stays proportionate all the
  // way up the range instead of turning into a warble at the bottom of it.
  const swing = Math.max(0, Math.min(1, Math.abs(lean)))
  e.flutterDepth.gain.setTargetAtTime(hz * 0.014 * (0.25 + swing), now, 0.08)
  e.flutter.frequency.setTargetAtTime(8 + revs * 5 + swing * 4, now, 0.08)
}

export function engineStop() {
  const e = engine
  engine = null
  const ac = e && audioContext()
  if (!e || !ac) return
  const now = ac.currentTime
  e.gain.gain.cancelScheduledValues(now)
  e.gain.gain.setTargetAtTime(0.0001, now, 0.07)
  e.a.stop(now + 0.4)
  e.b.stop(now + 0.4)
  e.flutter.stop(now + 0.4)
}
