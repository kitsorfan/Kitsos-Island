let ctx: AudioContext | null = null

/** The one shared context, resumed on demand. Also used by the music. */
export function audioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as {
      webkitAudioContext?: typeof AudioContext
    }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

let muted = false

export function setMuted(value: boolean) {
  muted = value
}

export const isMuted = () => muted

function tone(
  freq: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  delay = 0,
) {
  if (muted) return
  const ac = audioContext()
  if (!ac) return
  const start = ac.currentTime + delay
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01)
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
