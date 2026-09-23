import { describe, expect, it } from 'vitest'
import {
  CLIMB,
  HOLD,
  IGNITION,
  LAUNCH_TOTAL,
  STAGE_LINES,
  launchPhase,
} from './launch'

/** A launch that set off at zero, so `now` reads as seconds into the flight. */
const at = (now: number) => launchPhase({ started: 0 }, now)

describe('the launch clock', () => {
  it('runs hold, ignition, climb, orbit in that order', () => {
    expect(at(0).stage).toBe('hold')
    expect(at(HOLD - 0.01).stage).toBe('hold')
    expect(at(HOLD).stage).toBe('ignition')
    expect(at(HOLD + IGNITION).stage).toBe('climb')
    expect(at(LAUNCH_TOTAL).stage).toBe('orbit')
  })

  it('adds up to the whole flight', () => {
    expect(LAUNCH_TOTAL).toBe(HOLD + IGNITION + CLIMB)
  })

  it('counts down whole seconds and reaches zero as the engines light', () => {
    /* The count reads the second he is in, not the one just finished: it
       shows 1 for the whole of the last second rather than 0. */
    expect(at(0).count).toBe(HOLD)
    expect(at(HOLD - 0.5).count).toBe(1)
    expect(at(HOLD).count).toBe(0)
    expect(at(HOLD + 4).count).toBe(0)
  })

  it('does not shake on the pad, and shakes hardest at ignition', () => {
    expect(at(1).shake).toBe(0)
    expect(at(HOLD + 0.1).shake).toBe(1)
    /* It thins out across the climb rather than stopping dead. */
    const early = at(HOLD + IGNITION + 1).shake
    const late = at(HOLD + IGNITION + CLIMB - 1).shake
    expect(early).toBeGreaterThan(late)
    expect(at(LAUNCH_TOTAL).shake).toBe(0)
  })

  it('gains altitude only once it is off the pad', () => {
    expect(at(0).altitude).toBe(0)
    expect(at(HOLD + 1).altitude).toBe(0)
    const mid = at(HOLD + IGNITION + CLIMB / 2).altitude
    expect(mid).toBeGreaterThan(0)
    expect(mid).toBeLessThan(1)
    expect(at(LAUNCH_TOTAL).altitude).toBe(1)
  })

  it('arrives exactly once the climb is over, and stays arrived', () => {
    expect(at(LAUNCH_TOTAL - 0.01).arrived).toBe(false)
    expect(at(LAUNCH_TOTAL).arrived).toBe(true)
    /* A tab left open for an hour is still in orbit, not past the end of it. */
    expect(at(LAUNCH_TOTAL + 3600).arrived).toBe(true)
    expect(at(LAUNCH_TOTAL + 3600).stage).toBe('orbit')
    expect(at(LAUNCH_TOTAL + 3600).t).toBe(1)
  })

  it('never runs backwards, whatever the clock does', () => {
    /* A clock that jumps behind the start — a tab restored, a machine that
       slept — reads as the very beginning rather than as a negative flight. */
    expect(at(-50).stage).toBe('hold')
    expect(at(-50).altitude).toBe(0)
    expect(at(-50).t).toBe(0)
  })

  it('has a line for every stage', () => {
    for (const stage of ['hold', 'ignition', 'climb', 'orbit'] as const) {
      expect(STAGE_LINES[stage]).toBeTruthy()
    }
  })
})
