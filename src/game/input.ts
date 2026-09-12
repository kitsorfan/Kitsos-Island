const pressed = new Set<string>()

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

/** Keys that trigger the thing you are standing next to. */
export const INTERACT_KEYS = new Set(['KeyE', 'Enter', 'KeyZ'])

/** Keys that turn a page of dialogue, or start the game. Space included. */
export const ADVANCE_KEYS = new Set(['KeyE', 'Space', 'Enter', 'KeyZ'])

export function setKey(code: string, down: boolean) {
  if (down) pressed.add(code)
  else pressed.delete(code)
}

export function clearKeys() {
  pressed.clear()
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

export function queueJump() {
  jumpQueued = true
}

export function consumeJump() {
  const q = jumpQueued
  jumpQueued = false
  return q
}

/* ------------------------------- paintball ------------------------------- */

/** Keys that throw a paintball. */
export const FIRE_KEYS = new Set(['Space', 'KeyF'])
/** Keys held to crouch under incoming paint. */
export const CROUCH_KEYS = ['ControlLeft', 'ControlRight', 'KeyX']

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

/** Camera yaw nudge from Q/E-style keys, in radians per second. */
export function readCameraTurn() {
  let turn = 0
  if (pressed.has('KeyQ')) turn += 1
  if (pressed.has('BracketLeft')) turn += 1
  if (pressed.has('KeyR')) turn -= 1
  if (pressed.has('BracketRight')) turn -= 1
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
