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

export const INTERACT_KEYS = new Set(['KeyE', 'Space', 'Enter', 'KeyZ'])

export function setKey(code: string, down: boolean) {
  if (down) pressed.add(code)
  else pressed.delete(code)
}

export function clearKeys() {
  pressed.clear()
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
  const run = pressed.has('ShiftLeft') || pressed.has('ShiftRight')
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
