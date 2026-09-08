let ctx: AudioContext | null = null

function context(): AudioContext | null {
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

function tone(
  freq: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  delay = 0,
) {
  if (muted) return
  const ac = context()
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

/** Fanfare for a new journal entry. */
export function jingle() {
  tone(659.25, 0.09, 'square', 0.045)
  tone(783.99, 0.09, 'square', 0.045, 0.09)
  tone(1046.5, 0.22, 'square', 0.05, 0.18)
}
