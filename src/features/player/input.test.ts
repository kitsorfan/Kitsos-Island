import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ADVANCE_KEYS,
  INTERACT_KEYS,
  LONG_HOLD,
  MOVE_KEYS,
  ZOOM_MAX,
  ZOOM_MIN,
  cameraZoom,
  clearKeys,
  consumeDrop,
  consumeFire,
  consumeInteract,
  consumeJump,
  consumeTripleJump,
  doubleTapped,
  forgetTaps,
  forgetLongSpace,
  isCrouching,
  isDown,
  longSpace,
  queueDrop,
  queueFire,
  queueInteract,
  queueJump,
  readCameraTurn,
  readMove,
  setKey,
  sprintLock,
  touchStick,
  turnHold,
  zoomBy,
} from './input'

/**
 * What the keys and the sticks are saying this frame.
 *
 * Everything here is a latch of some kind, and latches are where input bugs
 * live: a queued press that is read twice is a door opened twice, and one
 * that is never cleared is a door that will not stop opening. So most of
 * these tests press something once and then ask twice.
 *
 * The clock is stubbed wherever it matters. A hold measured against the real
 * wall clock would be a test that passes or fails depending on how busy the
 * machine was.
 */

beforeEach(() => {
  clearKeys()
  sprintLock.on = false
  touchStick.x = 0
  touchStick.y = 0
  touchStick.active = false
  cameraZoom.level = 1
  // Drain anything a previous test left latched.
  consumeInteract()
  consumeJump()
  consumeTripleJump()
  consumeFire()
  consumeDrop('water')
  consumeDrop('confetti')
  forgetLongSpace()
  /*
   * The tap count is the one latch the drain above cannot clear:
   * consumeTripleJump only zeroes it once it has reached three, so a test
   * that queued one or two jumps hands its count to the next test and the
   * third tap arrives a tap early.
   *
   * It has no reset of its own, and it should not grow one for the tests'
   * sake. The only thing that zeroes it is consumeTripleJump on a count of
   * three, so three quick taps are spent here and read off, which leaves it
   * at nought however many the last test left behind. The clock is stubbed
   * for it so the three are always inside TAP_GAP, however fast the tests
   * run, and restored after so each test starts from the real one.
   */
  vi.restoreAllMocks()
  const gap = vi.spyOn(performance, 'now')
  gap.mockImplementation(() => RESET_CLOCK)
  queueJump()
  queueJump()
  queueJump()
  consumeJump()
  consumeTripleJump()
  gap.mockRestore()
})

/**
 * The clock the reset above spends its three taps on. Far enough past the
 * 1000 the tests stub that the tap before it is always outside TAP_GAP.
 */
const RESET_CLOCK = 1_000_000

describe('which key does what', () => {
  it('walks on both the letters and the arrows', () => {
    expect(MOVE_KEYS.KeyW).toEqual(MOVE_KEYS.ArrowUp)
    expect(MOVE_KEYS.KeyS).toEqual(MOVE_KEYS.ArrowDown)
    expect(MOVE_KEYS.KeyA).toEqual(MOVE_KEYS.ArrowLeft)
    expect(MOVE_KEYS.KeyD).toEqual(MOVE_KEYS.ArrowRight)
  })

  it('opens things with Enter and nothing else', () => {
    // E and Z used to be in here as well, which left three keys doing one job
    // and none of them free for the camera; both of them drive it now.
    expect([...INTERACT_KEYS].sort()).toEqual(['Enter', 'NumpadEnter'])
  })

  it('turns a page with Space as well as Enter', () => {
    expect(ADVANCE_KEYS.has('Space')).toBe(true)
    expect(ADVANCE_KEYS.has('Enter')).toBe(true)
  })
})

describe('readMove', () => {
  it('stands still with nothing held', () => {
    expect(readMove()).toEqual({ x: 0, y: 0, run: false })
  })

  it('walks the way the key points', () => {
    setKey('KeyW', true)
    expect(readMove()).toMatchObject({ x: 0, y: 1 })
  })

  it('cancels two keys that fight each other', () => {
    setKey('KeyW', true)
    setKey('KeyS', true)
    expect(readMove()).toMatchObject({ x: 0, y: 0 })
  })

  it('never walks faster on the diagonal than straight ahead', () => {
    setKey('KeyW', true)
    setKey('KeyD', true)
    const move = readMove()
    expect(Math.hypot(move.x, move.y)).toBeCloseTo(1, 9)
  })

  it('keeps a stick that is only half pushed at half speed', () => {
    touchStick.active = true
    touchStick.x = 0.3
    touchStick.y = 0
    expect(Math.hypot(readMove().x, readMove().y)).toBeCloseTo(0.3, 9)
  })

  it('ignores a stick nobody is touching', () => {
    touchStick.active = false
    touchStick.x = 1
    expect(readMove().x).toBe(0)
  })

  it('runs on shift, and on the latch', () => {
    setKey('ShiftLeft', true)
    expect(readMove().run).toBe(true)
    setKey('ShiftLeft', false)
    expect(readMove().run).toBe(false)
    sprintLock.on = true
    expect(readMove().run).toBe(true)
  })
})

describe('readCameraTurn', () => {
  it('is still with nothing held', () => {
    expect(readCameraTurn()).toBe(0)
  })

  it('turns each way on its own key', () => {
    setKey('KeyQ', true)
    expect(readCameraTurn()).toBeGreaterThan(0)
    setKey('KeyQ', false)
    setKey('KeyE', true)
    expect(readCameraTurn()).toBeLessThan(0)
  })

  it('cancels two keys that fight each other', () => {
    setKey('KeyQ', true)
    setKey('KeyE', true)
    expect(readCameraTurn()).toBe(0)
  })

  it('turns with the buttons at the screen edges, the same way as the keys', () => {
    turnHold.left = true
    expect(Math.sign(readCameraTurn())).toBe(1)
    turnHold.left = false
    turnHold.right = true
    expect(Math.sign(readCameraTurn())).toBe(-1)
  })
})

describe('the latches', () => {
  it('reads a press to open something exactly once', () => {
    queueInteract()
    expect(consumeInteract()).toBe(true)
    expect(consumeInteract()).toBe(false)
  })

  it('reads a jump exactly once', () => {
    queueJump()
    expect(consumeJump()).toBe(true)
    expect(consumeJump()).toBe(false)
  })

  it('reads nothing at all when nothing was pressed', () => {
    expect(consumeInteract()).toBe(false)
    expect(consumeJump()).toBe(false)
  })
})

describe('the triple tap', () => {
  it('fires on the third of three quick taps', () => {
    const now = vi.spyOn(performance, 'now')
    let clock = 1000
    now.mockImplementation(() => clock)
    queueJump()
    clock += 100
    queueJump()
    expect(consumeTripleJump()).toBe(false)
    clock += 100
    queueJump()
    expect(consumeTripleJump()).toBe(true)
  })

  it('does not fire for three taps spread out over a walk', () => {
    const now = vi.spyOn(performance, 'now')
    let clock = 1000
    now.mockImplementation(() => clock)
    for (let i = 0; i < 3; i++) {
      queueJump()
      clock += 5000
    }
    expect(consumeTripleJump()).toBe(false)
  })

  it('fires once, not on every tap after the third', () => {
    const now = vi.spyOn(performance, 'now')
    let clock = 1000
    now.mockImplementation(() => clock)
    for (let i = 0; i < 3; i++) {
      queueJump()
      clock += 100
    }
    expect(consumeTripleJump()).toBe(true)
    expect(consumeTripleJump()).toBe(false)
  })
})

describe('the double tap', () => {
  it('reads on the second of two quick taps', () => {
    const now = vi.spyOn(performance, 'now')
    let clock = 1000
    now.mockImplementation(() => clock)
    queueJump()
    expect(doubleTapped()).toBe(false)
    clock += 100
    queueJump()
    expect(doubleTapped()).toBe(true)
  })

  it('does not read for two taps spread out over a walk', () => {
    const now = vi.spyOn(performance, 'now')
    let clock = 1000
    now.mockImplementation(() => clock)
    queueJump()
    clock += 5000
    queueJump()
    expect(doubleTapped()).toBe(false)
  })

  it('leaves the count alone, so the third tap still dives', () => {
    /*
     * The one that matters. A double tap is the front half of a triple one:
     * the cape reads the second tap to go down, and the jetty reads the
     * third to go over the side. If reading the double spent the count,
     * the dive would lose the tap it was waiting for and never fire.
     */
    const now = vi.spyOn(performance, 'now')
    let clock = 1000
    now.mockImplementation(() => clock)
    queueJump()
    clock += 100
    queueJump()
    expect(doubleTapped()).toBe(true)
    clock += 100
    queueJump()
    expect(consumeTripleJump()).toBe(true)
  })

  it('stops reading once the gesture has claimed the taps', () => {
    const now = vi.spyOn(performance, 'now')
    let clock = 1000
    now.mockImplementation(() => clock)
    queueJump()
    clock += 100
    queueJump()
    expect(doubleTapped()).toBe(true)
    forgetTaps()
    expect(doubleTapped()).toBe(false)
  })
})

describe('holding Space', () => {
  it('is not a long hold the instant it goes down', () => {
    const now = vi.spyOn(performance, 'now')
    now.mockReturnValue(1000)
    setKey('Space', true)
    expect(longSpace()).toBe(false)
  })

  it('becomes one once it has been held long enough', () => {
    const now = vi.spyOn(performance, 'now')
    let clock = 1000
    now.mockImplementation(() => clock)
    setKey('Space', true)
    clock += LONG_HOLD * 1000 + 100
    expect(longSpace()).toBe(true)
  })

  it('is one gesture rather than a licence for more', () => {
    const now = vi.spyOn(performance, 'now')
    let clock = 1000
    now.mockImplementation(() => clock)
    setKey('Space', true)
    clock += LONG_HOLD * 1000 + 100
    expect(longSpace()).toBe(true)
    forgetLongSpace()
    expect(longSpace()).toBe(false)
  })

  it('does not restart the hold while a key repeats', () => {
    const now = vi.spyOn(performance, 'now')
    let clock = 1000
    now.mockImplementation(() => clock)
    setKey('Space', true)
    clock += 3000
    // The browser repeating the key must not put the clock back.
    setKey('Space', true)
    clock += LONG_HOLD * 1000 - 2500
    expect(longSpace()).toBe(true)
  })
})

describe('the trigger', () => {
  it('fires once for a tap', () => {
    queueFire()
    expect(consumeFire()).toBe(true)
    expect(consumeFire()).toBe(false)
  })

  it('keeps firing while the key is held', () => {
    setKey('KeyF', true)
    expect(consumeFire()).toBe(true)
    expect(consumeFire()).toBe(true)
  })
})

describe('crouching', () => {
  it('is down on either control key', () => {
    expect(isCrouching()).toBe(false)
    setKey('ControlLeft', true)
    expect(isCrouching()).toBe(true)
    setKey('ControlLeft', false)
    expect(isCrouching()).toBe(false)
  })
})

describe('dropping something from the balloon', () => {
  it('drops once for a tap', () => {
    queueDrop('water')
    expect(consumeDrop('water')).toBe(true)
    expect(consumeDrop('water')).toBe(false)
  })

  it('keeps the two payloads apart', () => {
    queueDrop('confetti')
    expect(consumeDrop('water')).toBe(false)
    expect(consumeDrop('confetti')).toBe(true)
  })
})

describe('the zoom', () => {
  it('zooms in and out a notch at a time', () => {
    const was = cameraZoom.level
    zoomBy(1.5)
    expect(cameraZoom.level).toBeGreaterThan(was)
    zoomBy(1 / 1.5)
    expect(cameraZoom.level).toBeCloseTo(was, 9)
  })

  it('never zooms past either stop, however long it is held', () => {
    for (let i = 0; i < 50; i++) zoomBy(2)
    expect(cameraZoom.level).toBeLessThanOrEqual(ZOOM_MAX)
    for (let i = 0; i < 50; i++) zoomBy(0.5)
    expect(cameraZoom.level).toBeGreaterThanOrEqual(ZOOM_MIN)
  })

  it('is a multiplier, so every place is zoomed by the same feel', () => {
    // Indoors, outdoors and the arena are framed quite differently, and a
    // distance that suited one of them would be wrong in the other two.
    expect(ZOOM_MIN).toBeLessThan(1)
    expect(ZOOM_MAX).toBeGreaterThan(1)
  })
})

describe('clearKeys', () => {
  it('lets go of everything when the window goes away', () => {
    setKey('KeyW', true)
    setKey('ControlLeft', true)
    clearKeys()
    expect(isDown('KeyW')).toBe(false)
    expect(isCrouching()).toBe(false)
    expect(readMove()).toMatchObject({ x: 0, y: 0 })
  })

  it('lets go of a turn button still held', () => {
    // Otherwise the camera would keep going round while nobody is looking.
    turnHold.left = true
    clearKeys()
    expect(readCameraTurn()).toBe(0)
  })

  it('keeps a latch the visitor set on purpose', () => {
    // Alt-tabbing away and back should not quietly turn running off.
    sprintLock.on = true
    clearKeys()
    expect(sprintLock.on).toBe(true)
  })
})
