const pressed = new Set<string>()

/** Set true while a zoom button is held down; see readZoomHold. */
export const zoomHold = { in: false, out: false }

/** Set true while an on-screen turn button is held: Q's side, or E's. */
export const turnHold = { left: false, right: false }

/** Set true while the balloon's on-screen up or down is held: Shift, or Ctrl. */
export const liftHold = { up: false, down: false }

/**
 * Set true while the cape's on-screen up or down is held: Space leaned on, or
 * the dive. Its own pair rather than the balloon's, so a thumb on one can
 * never be read as the other.
 */
export const capeHold = { up: false, down: false }

/** Virtual stick written by the on-screen joystick, range -1..1. */
export const touchStick = { x: 0, y: 0, active: false }

/** Set by the on-screen A button or the keyboard, consumed by the world loop. */
let interactQueued = false

export const MOVE_KEYS: Record<string, [number, number]> = {
  KeyW: [0, 1],
  ArrowUp: [0, 1],
  KeyS: [0, -1],
  ArrowDown: [0, -1],
  KeyA: [-1, 0],
  ArrowLeft: [-1, 0],
  KeyD: [1, 0],
  ArrowRight: [1, 0],
}

/**
 * Keys that trigger the thing you are standing next to.
 *
 * Enter and nothing else. E and Z used to be in here as well, which left
 * three keys doing one job and none of them free for the camera; both of
 * them now drive it instead.
 */
export const INTERACT_KEYS = new Set(['Enter', 'NumpadEnter'])

/** Keys that turn a page of dialogue, or start the game. Space included. */
export const ADVANCE_KEYS = new Set(['Enter', 'NumpadEnter', 'Space'])

export function setKey(code: string, down: boolean) {
  if (code === 'Space') {
    if (down && !pressed.has('Space')) {
      spaceFrom = performance.now()
      spaceFor = 0
      spaceSpent = false
    } else if (!down && pressed.has('Space')) {
      spaceFor = performance.now() - spaceFrom
      spaceLet = performance.now()
    }
  }
  if (down) pressed.add(code)
  else pressed.delete(code)
}

export function clearKeys() {
  pressed.clear()
  spaceFrom = 0
  spaceFor = 0
  spaceSpent = false
  // A button still held when the window goes away would otherwise keep the
  // camera running all the way to the stop while nobody is looking.
  zoomHold.in = false
  zoomHold.out = false
  turnHold.left = false
  turnHold.right = false
  liftHold.up = false
  liftHold.down = false
  capeHold.up = false
  capeHold.down = false
}

/* ------------------------------ the long hold ---------------------------- */

/**
 * Space leaned on rather than tapped, which is the front half of a gesture
 * nothing else on the island uses. It costs nothing to track: the key still
 * hops on the way down and is ignored from then on, so a hold looks like an
 * ordinary jump right up until the moment it turns out not to be one.
 */
/**
 * When it went down, how long the last hold lasted, and when it was let go.
 *
 * Whether it is down at all is the key set's business rather than a zero in
 * here: the clock reads nought for the first millisecond of a page's life,
 * and a hold begun in that millisecond would have been a hold that never
 * started.
 */
let spaceFrom = 0
let spaceFor = 0
let spaceLet = 0
/** True once a hold has been spent, so one hold is one gesture. */
let spaceSpent = false

/** Seconds it takes, and how long after letting go it still counts. */
export const LONG_HOLD = 5
const HOLD_GRACE = 1.5

/** Seconds it has been down for this time, or 0 while it is up. */
export const spaceHeldFor = () =>
  !spaceSpent && pressed.has('Space')
    ? (performance.now() - spaceFrom) / 1000
    : 0

/** True while Space has been held long enough — or was, a moment ago. */
export function longSpace(): boolean {
  if (spaceSpent) return false
  const now = performance.now()
  if (pressed.has('Space')) return now - spaceFrom >= LONG_HOLD * 1000
  return spaceFor >= LONG_HOLD * 1000 && now - spaceLet <= HOLD_GRACE * 1000
}

/** Spent, so one long hold is one gesture and not a licence for more. */
export function forgetLongSpace() {
  spaceSpent = true
  spaceFor = 0
}

/**
 * Sprint held down by the shoe button rather than by a finger on Shift.
 * It lives here rather than in the key set because clearKeys() runs every
 * time the window loses focus, and a latch the visitor set on purpose
 * should survive alt-tabbing away and back.
 */
export const sprintLock = { on: false }

/**
 * How far back the camera sits, as a multiple of each area’s own framing.
 * A multiplier rather than a distance so indoors, outdoors and the arena —
 * which are framed quite differently — all zoom by the same feel.
 */
export const cameraZoom = { level: 1 }

/** One wheel notch, one key press, or one tap of a zoom button. */
export const ZOOM_STEP = 1.12

export const ZOOM_MIN = 0.55
export const ZOOM_MAX = 2

/**
 * Held rather than tapped. A key or a button that is being leaned on runs the
 * camera in or out steadily, after a pause long enough that a tap is still a
 * tap: the tap itself is one notch, fired on the way down, and this only
 * takes over if you are still holding it a moment later.
 */
/** Notches a second once it is running, and how long before it does. */
const ZOOM_RATE = 5
const ZOOM_DELAY = 0.3

const held = { dir: 0, time: 0 }

/** The factor to zoom by this frame, or 1 while nothing is being held. */
export function readZoomHold(delta: number) {
  let dir = 0
  if (pressed.has('KeyZ') || pressed.has('Equal') || zoomHold.in) dir += 1
  if (pressed.has('KeyC') || pressed.has('Minus') || zoomHold.out) dir -= 1

  if (dir !== held.dir) {
    held.dir = dir
    held.time = 0
  }
  if (dir === 0) return 1

  held.time += delta
  if (held.time < ZOOM_DELAY) return 1
  return Math.pow(ZOOM_STEP, -dir * ZOOM_RATE * delta)
}

export function zoomBy(factor: number) {
  cameraZoom.level = Math.max(
    ZOOM_MIN,
    Math.min(ZOOM_MAX, cameraZoom.level * factor),
  )
}

export function isDown(code: string) {
  return pressed.has(code)
}

export function queueInteract() {
  interactQueued = true
}

export function consumeInteract() {
  const q = interactQueued
  interactQueued = false
  return q
}

let jumpQueued = false

/**
 * Taps of the jump key in quick succession, however they arrive — the key or
 * the on-screen button, both of which come through here. Three of them is the
 * one gesture on the island that is written down nowhere.
 */
const TAP_GAP = 420
let taps = 0
let lastTap = 0

export function queueJump() {
  jumpQueued = true
  const now = performance.now()
  taps = now - lastTap < TAP_GAP ? taps + 1 : 1
  lastTap = now
}

export function consumeJump() {
  const q = jumpQueued
  jumpQueued = false
  return q
}

/** True once, on the third of three quick taps. */
export function consumeTripleJump() {
  if (taps < 3) return false
  taps = 0
  return true
}

/**
 * True once, on the second of two quick taps — the cape's way down.
 *
 * Deliberately does NOT reset the tap count. A double tap is the front half
 * of a triple one, and zeroing here would eat the third tap before the dive
 * off the jetty ever saw it. The flyer reads this, the jetty reads the
 * triple, and the count is left alone for whichever comes second.
 */
export function doubleTapped() {
  return taps === 2
}

/** Forget the run of taps, once a gesture has claimed it. */
export function forgetTaps() {
  taps = 0
}

/* ------------------------------- paintball ------------------------------- */

/** Keys that throw a paintball. */
export const FIRE_KEYS = new Set(['Space', 'KeyF'])
/** Keys held to crouch under incoming paint. X is the view toggle now. */
export const CROUCH_KEYS = ['ControlLeft', 'ControlRight']

/** Mouse or on-screen fire button, held rather than tapped. */
export const firePointer = { held: false }
/** Set by the on-screen crouch button. */
export const touchCrouch = { on: false }

let fireQueued = false

export function queueFire() {
  fireQueued = true
}

/** True once for a tap, or every frame while the trigger is held. */
export function consumeFire() {
  const q = fireQueued
  fireQueued = false
  return q || firePointer.held || pressed.has('Space') || pressed.has('KeyF')
}

export function isCrouching() {
  return touchCrouch.on || CROUCH_KEYS.some((k) => pressed.has(k))
}

export interface MoveAxis {
  x: number
  y: number
  run: boolean
}

/** Combined keyboard + touch movement, normalised to a unit disc. */
export function readMove(): MoveAxis {
  let x = 0
  let y = 0
  for (const [code, [ax, ay]] of Object.entries(MOVE_KEYS)) {
    if (pressed.has(code)) {
      x += ax
      y += ay
    }
  }
  if (touchStick.active) {
    x += touchStick.x
    y += touchStick.y
  }
  const len = Math.hypot(x, y)
  if (len > 1) {
    x /= len
    y /= len
  }
  const run =
    sprintLock.on || pressed.has('ShiftLeft') || pressed.has('ShiftRight')
  return { x, y, run }
}

/**
 * Camera yaw nudge, in radians per second: Q swings it one way, E the other,
 * and the turn buttons at the edges of the screen stand in for each.
 */
export function readCameraTurn() {
  let turn = 0
  if (pressed.has('KeyQ')) turn += 1
  if (pressed.has('BracketLeft')) turn += 1
  if (turnHold.left) turn += 1
  if (pressed.has('KeyE')) turn -= 1
  if (pressed.has('BracketRight')) turn -= 1
  if (turnHold.right) turn -= 1
  return turn
}

/* -------------------------------- balloon -------------------------------- */

/** Keys that let a water bomb go, and keys that throw a handful of confetti. */
export const WATER_KEYS = new Set(['Space'])
export const CONFETTI_KEYS = new Set(['KeyF', 'KeyG'])

export type Payload = 'water' | 'confetti'

/** Set while an on-screen drop button is held down. */
export const dropHeld: Record<Payload, boolean> = {
  water: false,
  confetti: false,
}

const dropQueued: Record<Payload, boolean> = { water: false, confetti: false }

export function queueDrop(kind: Payload) {
  dropQueued[kind] = true
}

/** True once for a tap, or every frame while the button is held down. */
export function consumeDrop(kind: Payload) {
  const q = dropQueued[kind]
  dropQueued[kind] = false
  if (q || dropHeld[kind]) return true
  for (const code of kind === 'water' ? WATER_KEYS : CONFETTI_KEYS) {
    if (pressed.has(code)) return true
  }
  return false
}
