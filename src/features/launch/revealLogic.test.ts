import { describe, expect, it } from 'vitest'
import {
  BANDS,
  NOTICE,
  REVEAL_LINES,
  REVEAL_TOTAL,
  SHED,
  bandShed,
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

  it('sheds the bands one after another from the bottom up', () => {
    /* All at once is a texture fading out; in sequence is a tower coming
       apart, which is the whole point of the shot. */
    const early = bandShed(0, 0.3)
    const late = bandShed(BANDS - 1, 0.3)
    expect(early).toBeGreaterThan(late)
  })

  it('has every band gone by the end of the shed', () => {
    for (let i = 0; i < BANDS; i++) {
      expect(bandShed(i, 1)).toBe(1)
      expect(bandShed(i, 0)).toBe(0)
    }
  })

  it('keeps more than one band in the air at a time', () => {
    /* They overlap. One-at-a-time-in-full would read as a machine
       unbolting itself rather than a shell breaking up. */
    const midway = Array.from({ length: BANDS }, (_, i) => bandShed(i, 0.45))
    const moving = midway.filter((v) => v > 0 && v < 1)
    expect(moving.length).toBeGreaterThan(1)
  })

  it('shakes hardest as the shell goes, not at the end', () => {
    const shedding = at(NOTICE + SHED * 0.5).rumble
    expect(shedding).toBeGreaterThan(0.5)
    expect(at(0.5).rumble).toBe(0)
    /* It has died away under the rocket. */
    expect(at(REVEAL_TOTAL - 0.2).rumble).toBeLessThan(0.1)
  })

  it('lights the seams only while the shell is splitting', () => {
    expect(at(0.5).seam).toBe(0)
    expect(at(NOTICE + SHED * 0.5).seam).toBeGreaterThan(0.8)
    expect(at(NOTICE + SHED + 0.5).seam).toBe(0)
  })

  it('is short enough to sit through more than once', () => {
    /*
     * It plays every single time he walks in, not just the first, so the
     * budget is tighter than it would be for a one-off: long enough to
     * watch, short enough that the fourth viewing is not a toll on the door.
     */
    expect(REVEAL_TOTAL).toBeLessThan(7.5)
    /* And long enough that the shed is not a flicker. */
    expect(SHED).toBeGreaterThan(2)
  })
})
