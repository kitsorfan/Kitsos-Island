import { describe, expect, it } from 'vitest'
import {
  NOTICE,
  REVEAL_LINES,
  REVEAL_TOTAL,
  SHED,
  revealPhase,
} from './revealLogic'

/** A reveal that set off at zero, so `now` reads as seconds into it. */
const at = (now: number) => revealPhase({ started: 0 }, now)

describe('the reveal on the doorstep', () => {
  it('runs notice, shed, rocket, enter in that order', () => {
    expect(at(0).stage).toBe('notice')
    expect(at(NOTICE + 0.1).stage).toBe('shed')
    expect(at(NOTICE + SHED + 0.1).stage).toBe('rocket')
    expect(at(REVEAL_TOTAL - 0.1).stage).toBe('enter')
  })

  it('puts the mark up before anything it could be a reaction to', () => {
    /*
     * The whole job of the mark is to say the man has noticed, so it has to
     * land before the thing he noticed starts happening. A mark that fades
     * up alongside the reveal reads as part of the scenery.
     */
    const early = at(0.4)
    expect(early.mark).toBeGreaterThan(0.5)
    expect(early.shed).toBe(0)
    expect(early.ship).toBe(0)
  })

  it('overlaps the paint coming off with the ship coming up', () => {
    /*
     * Both on screen at once for a moment, which is what makes it read as
     * one thing turning into another rather than a swap.
     */
    const mid = at(NOTICE + SHED * 0.5)
    expect(mid.shed).toBeGreaterThan(0)
    expect(mid.shed).toBeLessThan(1)
    expect(mid.ship).toBeGreaterThan(0)
  })

  it('leaves the paint gone and the ship whole by the end', () => {
    const late = at(NOTICE + SHED + 0.5)
    expect(late.shed).toBe(1)
    expect(late.ship).toBe(1)
  })

  it('fades out only at the very end', () => {
    expect(at(NOTICE + SHED + 0.5).fade).toBe(0)
    expect(at(REVEAL_TOTAL).fade).toBe(1)
  })

  it('is done exactly once the whole thing has run', () => {
    expect(at(REVEAL_TOTAL - 0.01).done).toBe(false)
    expect(at(REVEAL_TOTAL).done).toBe(true)
    /* And stays done, however long the frame that notices takes to arrive. */
    expect(at(REVEAL_TOTAL + 30).done).toBe(true)
  })

  it('never runs backwards, whatever the clock does', () => {
    expect(at(-20).stage).toBe('notice')
    expect(at(-20).t).toBe(0)
    expect(at(-20).shed).toBe(0)
  })

  it('says the line on the card that is showing the rocket', () => {
    /* The joke only works once there is a rocket on screen to point at. */
    expect(REVEAL_LINES.rocket).toContain('not a lighthouse')
    expect(REVEAL_LINES.rocket).toContain('rocket')
    expect(REVEAL_LINES.notice).toBeUndefined()
  })

  it('is short enough to sit through', () => {
    /* It stands between him and a door he has just unlocked five times
       over, so it has to be a beat rather than a film. */
    expect(REVEAL_TOTAL).toBeLessThan(8)
  })
})
