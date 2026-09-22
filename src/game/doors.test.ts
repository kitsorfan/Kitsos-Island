import { describe, expect, it } from 'vitest'
import {
  AUTO_DOOR_REACH,
  DOOR_ADMIT,
  DOOR_AJAR,
  DOOR_OPEN,
  DOOR_SLIDE,
  autoOpens,
  doorReach,
  doorShut,
  ease,
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
