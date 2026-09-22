import { describe, expect, it } from 'vitest'
import {
  AUTO_DOOR_REACH,
  DOOR_ADMIT,
  DOOR_AJAR,
  DOOR_OPEN,
  DOOR_SLIDE,
  autoOpens,
  doorAtRest,
  doorReach,
  doorShut,
  ease,
  slideDoor,
} from './doors'
import { BUILDINGS } from '../data/world'
import type { Building } from '../types'

/**
 * Which doors open by themselves.
 *
 * The rule worth pinning down is that an automatic door is a courtesy and
 * never a trap: it may only ever do for you what pressing Enter would have
 * done anyway. The moment it can turn you away by itself — a dark lobby, a
 * lock you have not opened — it has stopped being a convenience.
 *
 * And it opens. That is the whole of it. It does not walk you in, and it does
 * not take you in: an earlier version did both, on a scripted step across the
 * threshold, and the animation read as a hitch however it was timed, because
 * a door that takes your feet away from you is not a door you are walking
 * through. So the glass slides and the walking stays yours.
 */

const WORK = BUILDINGS.find((b) => b.id === 'work')!
const DAY = { night: false, lighthouseOpen: false }
const NIGHT = { night: true, lighthouseOpen: false }

describe('the doors that open by themselves', () => {
  it('slides the office open in the morning', () => {
    expect(WORK.autoDoor).toBe(true)
    expect(autoOpens(WORK, DAY)).toBe(true)
  })

  it('wants a press once the office is shut for the night', () => {
    /* There is a refusal waiting behind it, and being told no is something
       you should have chosen to ask for. */
    expect(doorShut(WORK, NIGHT)).toBe(true)
    expect(autoOpens(WORK, NIGHT)).toBe(false)
  })

  it('leaves every other door on the island to a press', () => {
    const automatic = BUILDINGS.filter((b) => b.autoDoor).map((b) => b.id)
    expect(automatic).toEqual(['work'])
  })

  it('never opens a door that would turn you away', () => {
    /* The invariant, over every building and both hours of the day. */
    for (const b of BUILDINGS) {
      for (const state of [
        DAY,
        NIGHT,
        { night: false, lighthouseOpen: true },
      ]) {
        if (autoOpens(b, state)) expect(doorShut(b, state)).toBe(false)
      }
    }
  })

  it('will not open a locked door on its own, however it is flagged', () => {
    /* No building is both today, but the rule has to hold if one ever is:
       five locks are five locks, whatever the door is made of. */
    const locked: Building = { ...WORK, autoDoor: true, locksWith: 5 }
    expect(autoOpens(locked, DAY)).toBe(false)
    expect(autoOpens(locked, { night: false, lighthouseOpen: true })).toBe(true)
  })

  it('opens the glass wide, and only parts it for a passer-by', () => {
    /* Two states and no third: noticed, and being walked through. */
    expect(DOOR_AJAR).toBeGreaterThan(0)
    expect(DOOR_AJAR).toBeLessThan(DOOR_OPEN)
    expect(DOOR_OPEN).toBe(1)
  })

  it('slides in a beat rather than a breath', () => {
    /*
     * Short enough that arriving at a walk never means waiting on the glass
     * — the complaint that killed the scripted entrance — and long enough
     * that the leaves are seen to travel rather than blinking open.
     */
    expect(DOOR_SLIDE).toBeGreaterThan(0.15)
    expect(DOOR_SLIDE).toBeLessThan(0.4)
  })

  it('eases the leaves off and onto their stops', () => {
    /* Smoothstep: pinned at both ends, gentle at both ends, halfway at the
       halfway point — a door, rather than a rectangle changing position. */
    expect(ease(0)).toBe(0)
    expect(ease(1)).toBe(1)
    expect(ease(0.5)).toBeCloseTo(0.5, 5)
    expect(ease(0.1)).toBeLessThan(0.1)
    expect(ease(0.9)).toBeGreaterThan(0.9)
    /* And it never reports a door further than fully open, however it is
       asked — the leaves are positioned straight off this. */
    expect(ease(-1)).toBe(0)
    expect(ease(2)).toBe(1)
  })

  it('can actually be reached on a straight walk at the door', () => {
    /*
     * The bug this is here for, and the one the geometry hides.
     *
     * A doorstep is a mark on the approach, not the doorway: Work's sits
     * 3.1 m out from its own facade. The whole footprint is a collider, so
     * walking straight at that door stops his centre 2.6 m short of the mark
     * — and both the reach that opens the glass and the line that admits him
     * are measured from the mark. Set either below 2.6 and it cannot fire
     * head-on; it fires only when you clip the corner diagonally, which is
     * exactly backwards for a door you are walking into.
     */
    const radius = 0.5
    expect(doorReach(WORK, radius)).toBeCloseTo(2.6, 5)
    for (const b of BUILDINGS) {
      if (!b.autoDoor) continue
      const floor = doorReach(b, radius)
      expect(
        AUTO_DOOR_REACH,
        `${b.id}: the glass cannot be reached head-on`,
      ).toBeGreaterThan(floor)
      expect(
        DOOR_ADMIT,
        `${b.id}: the threshold cannot be reached head-on`,
      ).toBeGreaterThan(floor)
    }
  })

  it('notices him further out than it admits him', () => {
    /*
     * The two were once one number, which is why walking past the Work
     * District pulled you into its lobby: anything that noticed you also
     * swallowed you. The glass opens across the plaza; going in is a line
     * you cross yourself.
     */
    expect(DOOR_ADMIT).toBeLessThan(AUTO_DOOR_REACH)
    /*
     * And by a clear margin, not a few centimetres. Set them nearly equal and
     * the door opens and admits on the same stride — which on a slow frame is
     * the same frame, so the glass is never seen to move and the lobby simply
     * appears. A metre is about a stride: time enough to watch it slide.
     */
    expect(AUTO_DOOR_REACH - DOOR_ADMIT).toBeGreaterThanOrEqual(1)
  })

  it('opens well inside the radius that offers the prompt', () => {
    /* Otherwise the door fires the instant its label appears, and walking
       past the plaza becomes walking into the lobby. */
    const prompt = WORK.sentries ? 7 : 4.2
    expect(AUTO_DOOR_REACH).toBeLessThan(prompt)
  })
})

describe('slideDoor', () => {
  /** Runs a door towards `target` for `seconds` at `fps`, in whole frames. */
  const run = (
    move: ReturnType<typeof doorAtRest>,
    target: number,
    seconds: number,
    fps = 60,
  ) => {
    const delta = 1 / fps
    let open = 0
    for (let i = 0; i < Math.round(seconds * fps); i++) {
      open = slideDoor(move, target, delta)
    }
    return open
  }

  it('starts shut and still', () => {
    const m = doorAtRest()
    expect(slideDoor(m, 0, 0)).toBe(0)
  })

  it('arrives fully open, rather than creeping towards it forever', () => {
    /*
     * The bug this is here for. The old travel closed a fixed fraction of the
     * remaining gap each frame — an exponential, which approaches its target
     * and never reaches it. The leaves stopped a hair short of the jamb and
     * stayed there, which is what read as a door jammed part-way.
     */
    const m = doorAtRest()
    expect(run(m, DOOR_OPEN, DOOR_SLIDE)).toBe(DOOR_OPEN)
  })

  it('arrives fully shut, too', () => {
    const m = doorAtRest()
    run(m, DOOR_OPEN, DOOR_SLIDE)
    expect(run(m, 0, DOOR_SLIDE)).toBe(0)
  })

  it('takes DOOR_SLIDE to travel, whatever the frame rate', () => {
    /*
     * The other half of the same bug: a per-frame fraction moves the glass
     * further on a fast machine than a slow one, so the harder the scene was
     * to draw, the more the door looked stuck.
     */
    for (const fps of [15, 30, 60, 144]) {
      /* A whole frame's grace: DOOR_SLIDE rarely divides into a frame time
         exactly, so the stop is reached on the frame that crosses it. */
      const m = doorAtRest()
      expect(run(m, DOOR_OPEN, DOOR_SLIDE + 1 / fps, fps)).toBe(DOOR_OPEN)
      /* And it is plainly still travelling at half the time. */
      const half = doorAtRest()
      const mid = run(half, DOOR_OPEN, DOOR_SLIDE / 2, fps)
      expect(mid).toBeGreaterThan(0)
      expect(mid).toBeLessThan(DOOR_OPEN)
    }
  })

  it('stands ajar without overshooting to wide', () => {
    const m = doorAtRest()
    expect(run(m, DOOR_AJAR, DOOR_SLIDE)).toBeCloseTo(DOOR_AJAR, 9)
  })

  it('never reports an opening outside the two stops', () => {
    const m = doorAtRest()
    for (const target of [DOOR_OPEN, 0, DOOR_AJAR, DOOR_OPEN, 0]) {
      for (let i = 0; i < 40; i++) {
        const open = slideDoor(m, target, 1 / 60)
        expect(open).toBeGreaterThanOrEqual(0)
        expect(open).toBeLessThanOrEqual(DOOR_OPEN)
      }
    }
  })

  it('carries on from where it was when it is reversed halfway', () => {
    /* Walk off mid-open and the glass shuts from where it had got to — not
       from wide, and with no jump back to a stop it had already left. */
    const m = doorAtRest()
    const part = run(m, DOOR_OPEN, DOOR_SLIDE / 2)
    const next = slideDoor(m, 0, 1 / 60)
    expect(next).toBeLessThan(part)
    expect(next).toBeGreaterThan(part - 0.2)
    /* And it still closes the whole way. */
    expect(run(m, 0, DOOR_SLIDE)).toBe(0)
  })

  it('settles onto its stops rather than arriving at speed', () => {
    /* Smoothstep: the last stretch of the travel is slower than the middle,
       which is what stops the leaves hitting the jamb flat. */
    const m = doorAtRest()
    const mid = run(m, DOOR_OPEN, DOOR_SLIDE / 2)
    const nearlyThere = run(m, DOOR_OPEN, DOOR_SLIDE * 0.4)
    const middleStep = mid
    const endStep = DOOR_OPEN - nearlyThere
    expect(endStep).toBeLessThan(middleStep)
  })

  it('does not run backwards on a zero or negative delta', () => {
    const m = doorAtRest()
    const part = run(m, DOOR_OPEN, DOOR_SLIDE / 2)
    expect(slideDoor(m, DOOR_OPEN, 0)).toBeCloseTo(part, 9)
    expect(slideDoor(m, DOOR_OPEN, -1)).toBeCloseTo(part, 9)
  })
})
