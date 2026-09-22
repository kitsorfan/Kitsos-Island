import { describe, expect, it } from 'vitest'
import {
  CAR_DEPTH,
  CAR_STEP_OUT,
  LIFT_DOORS,
  LIFT_PER_FLOOR,
  liftArrival,
  liftPhase,
  liftStance,
} from './lift'
import type { InteriorLink } from '../types'
import { INTERIOR_MARGIN } from './interior'
import { testLink, testRoom } from '../test/rooms'

/**
 * The lift is the one way between floors that takes time, and the one the
 * visitor cannot get out of halfway — a lift you can step out of mid-shaft is
 * a door. So what is worth holding it to is that a ride always finishes, that
 * the number over the doors is never a floor the building has not got, and
 * that stepping out puts you at the lift on the far side rather than in the
 * stairwell up the other corner.
 */

const ride = (over: Partial<Parameters<typeof liftPhase>[0]> = {}) => ({
  started: 0,
  duration: LIFT_DOORS * 2 + LIFT_PER_FLOOR * 3,
  from: 0,
  to: 3,
  ...over,
})

describe('liftPhase', () => {
  it('starts with the doors wide and nothing done', () => {
    const at = liftPhase(ride(), 0)
    expect(at.t).toBe(0)
    expect(at.open).toBe(1)
    expect(at.floor).toBe(0)
    expect(at.done).toBe(false)
  })

  it('shuts the doors before the car moves', () => {
    const shutting = liftPhase(ride(), LIFT_DOORS / 2)
    expect(shutting.open).toBeGreaterThan(0)
    expect(shutting.open).toBeLessThan(1)
    expect(shutting.floor).toBe(0)
  })

  it('travels with the doors shut', () => {
    const moving = liftPhase(ride(), LIFT_DOORS + LIFT_PER_FLOOR)
    expect(moving.open).toBe(0)
    expect(moving.done).toBe(false)
  })

  it('has the doors wide again, and the ride done, at the end', () => {
    const r = ride()
    const arrived = liftPhase(r, r.duration)
    expect(arrived.t).toBe(1)
    expect(arrived.open).toBeCloseTo(1, 9)
    expect(arrived.floor).toBe(r.to)
    expect(arrived.done).toBe(true)
  })

  it('stays finished however long anyone leaves it', () => {
    const r = ride()
    const later = liftPhase(r, r.duration + 500)
    expect(later.t).toBe(1)
    expect(later.open).toBe(1)
    expect(later.floor).toBe(r.to)
    expect(later.done).toBe(true)
  })

  it('never reads a floor outside the two ends of the ride', () => {
    const r = ride({ from: 1, to: 5 })
    for (let now = 0; now <= r.duration + 1; now += 0.05) {
      const at = liftPhase(r, now)
      expect(at.floor).toBeGreaterThanOrEqual(1)
      expect(at.floor).toBeLessThanOrEqual(5)
      expect(Number.isInteger(at.floor)).toBe(true)
    }
  })

  it('ticks the indicator over between floors, not at the ends', () => {
    // A real indicator counts as it passes each floor. Halfway through the
    // travel of a four-floor ride it should be reading the middle of the
    // building, not still the floor it left.
    const r = ride({ from: 0, to: 4 })
    const travel = r.duration - LIFT_DOORS * 2
    const halfway = liftPhase(r, LIFT_DOORS + travel / 2)
    expect(halfway.floor).toBe(2)
  })

  it('counts down for a ride that goes down', () => {
    const r = ride({ from: 5, to: 1 })
    const travel = r.duration - LIFT_DOORS * 2
    const halfway = liftPhase(r, LIFT_DOORS + travel / 2)
    expect(halfway.floor).toBe(3)
    expect(liftPhase(r, r.duration).floor).toBe(1)
  })

  it('arrives with the doors still shut, and opens them after', () => {
    /*
     * The gap these two mark out is the whole of the arrival: the car has
     * stopped, the doors have not opened yet, and that is when the room has
     * to change. Collapse them and the far floor inherits doors already wide.
     */
    const r = ride()
    const travel = r.duration - LIFT_DOORS * 2
    const stopped = liftPhase(r, LIFT_DOORS + travel)
    expect(stopped.arrived).toBe(true)
    expect(stopped.done).toBe(false)
    expect(stopped.open).toBeCloseTo(0, 9)
    expect(stopped.floor).toBe(r.to)

    /* And the doors are seen to open across the gap that follows. */
    const opening = liftPhase(r, LIFT_DOORS + travel + LIFT_DOORS / 2)
    expect(opening.arrived).toBe(true)
    expect(opening.done).toBe(false)
    expect(opening.open).toBeGreaterThan(0)
    expect(opening.open).toBeLessThan(1)
  })

  it('has not arrived while the car is still moving', () => {
    const r = ride()
    expect(liftPhase(r, 0).arrived).toBe(false)
    expect(liftPhase(r, LIFT_DOORS).arrived).toBe(false)
    expect(liftPhase(r, LIFT_DOORS + LIFT_PER_FLOOR).arrived).toBe(false)
  })

  it('never reports done without having arrived', () => {
    const r = ride({ from: 2, to: 6 })
    for (let now = -1; now <= r.duration + 2; now += 0.03) {
      const at = liftPhase(r, now)
      if (at.done) expect(at.arrived).toBe(true)
    }
  })

  it('keeps open and t inside their own ranges throughout', () => {
    const r = ride({ from: 0, to: 2 })
    for (let now = -2; now <= r.duration + 2; now += 0.05) {
      const at = liftPhase(r, now)
      expect(at.open).toBeGreaterThanOrEqual(0)
      expect(at.open).toBeLessThanOrEqual(1)
      expect(at.t).toBeGreaterThanOrEqual(0)
      expect(at.t).toBeLessThanOrEqual(1)
    }
  })

  it('treats a clock reading before the start as the start', () => {
    const at = liftPhase(ride({ started: 10 }), 4)
    expect(at.t).toBe(0)
    expect(at.open).toBe(1)
  })

  it('survives a ride between neighbouring floors, where travel is short', () => {
    // The doors alone are longer than the whole nominal ride here. It must
    // still finish rather than divide by a travel time of nought.
    const r = ride({ duration: 0.5, from: 1, to: 2 })
    for (let now = 0; now <= 1; now += 0.05) {
      const at = liftPhase(r, now)
      expect(Number.isFinite(at.open)).toBe(true)
      expect(Number.isFinite(at.floor)).toBe(true)
    }
    expect(liftPhase(r, 0.5).done).toBe(true)
  })
})

describe('liftArrival', () => {
  const car = testLink({
    id: 'the-lift',
    to: 'floor-1',
    kind: 'lift',
    position: [5, -5],
    rotation: Math.PI / 2,
  })
  const stairs = testLink({
    id: 'the-stairs',
    to: 'floor-1',
    kind: 'stairsDown',
    position: [-5, -5],
  })

  const floor = (links: InteriorLink[]) =>
    testRoom({ id: 'floor-2', name: 'Second floor', half: [10, 10], links })

  /** The car the player stepped into, on the floor they left. */
  const calledFrom = testLink({ to: 'floor-2', kind: 'lift', position: [0, 0] })

  it('puts him out at the lift on the far floor', () => {
    // Not merely at a way back to the room he came from: the shaft runs up
    // one corner and the stairs up the other, so taking the first link home
    // would have him step out of the car and into the stairwell.
    const out = liftArrival(floor([stairs, car]), 'floor-1', calledFrom)
    /* In front of that car — off towards +x, the way its doors face — and
       nowhere near the stairwell in the other corner. */
    expect(out.at[0]).toBeCloseTo(5 + CAR_STEP_OUT, 6)
    expect(out.at[0]).toBeGreaterThan(0)
    expect(out.facing).toBe(car.rotation)
  })

  it('uses the spot the link names, when it names one', () => {
    const out = liftArrival(
      floor([car]),
      'floor-1',
      testLink({
        to: 'floor-2',
        kind: 'lift',
        position: [0, 0],
        arrive: [2, 3],
      }),
    )
    expect(out.at).toEqual([2, 3])
  })

  it('falls back to a way home on a floor with no lift of its own', () => {
    const out = liftArrival(floor([stairs]), 'floor-1', calledFrom)
    expect(out.at).not.toEqual([0, 0])
    expect(Number.isFinite(out.at[0])).toBe(true)
  })

  it('falls back to where the room puts anybody, if all else fails', () => {
    const out = liftArrival(floor([]), 'nowhere', calledFrom)
    expect(out.at).toEqual([0, 0])
  })
})

describe('how long a ride takes', () => {
  it('spends longer crossing more floors', () => {
    const near = LIFT_DOORS * 2 + LIFT_PER_FLOOR
    const far = LIFT_DOORS * 2 + LIFT_PER_FLOOR * 5
    expect(far).toBeGreaterThan(near)
  })

  it('always leaves room for the doors at both ends', () => {
    expect(LIFT_DOORS).toBeGreaterThan(0)
    expect(LIFT_PER_FLOOR).toBeGreaterThan(0)
  })
})

describe('liftStance', () => {
  /**
   * Getting in and getting out. These have to be opposites about the door
   * line: he steps back into the shaft, and out into the room. A stance that
   * put both on the same side would walk him into the wall, and one that drew
   * them from different origins would drift a ride at a time.
   */
  it('stands him at the doors, and steps him back from them', () => {
    const car = testLink({ kind: 'lift', position: [0, 0], rotation: 0 })
    const { inside, outside } = liftStance(car)

    /* +z runs off the wall into the room, so both are in front of the door
       line — the shaft itself is a recess he cannot stand in. */
    expect(inside[1]).toBeCloseTo(CAR_DEPTH, 6)
    expect(outside[1]).toBeCloseTo(CAR_STEP_OUT, 6)
    expect(inside[1]).toBeGreaterThan(0)
    expect(outside[1]).toBeGreaterThan(inside[1])
  })

  it('turns with the car, so a rotated lift is not entered sideways', () => {
    const car = testLink({
      kind: 'lift',
      position: [4, -2],
      rotation: Math.PI / 2,
    })
    const { inside, outside, facing } = liftStance(car)

    /* Rotated a quarter turn, the room lies off towards +x. */
    expect(inside[0]).toBeCloseTo(4 + CAR_DEPTH, 6)
    expect(outside[0]).toBeCloseTo(4 + CAR_STEP_OUT, 6)
    expect(outside[1]).toBeCloseTo(-2, 6)
    expect(facing).toBe(Math.PI / 2)
  })

  it('keeps both marks on floor he is allowed to walk on', () => {
    /*
     * The bug this exists for: a lift is set into a wall, and the walker is
     * held a margin clear of every wall. A mark measured off the lift landed
     * in that margin, he walked at it forever without arriving, and the
     * controls never came back. Given the room, both marks are pulled inside
     * it.
     */
    const car = testLink({ kind: 'lift', position: [9, -12.6], rotation: 0 })
    const room = testRoom({
      id: 'floor-1',
      name: 'First',
      half: [17, 13],
      links: [car],
    })
    const limit = 13 - INTERIOR_MARGIN
    const { inside, outside } = liftStance(car, room)

    expect(inside[1]).toBeGreaterThanOrEqual(-limit)
    expect(outside[1]).toBeGreaterThanOrEqual(-limit)
    /* And the near mark really is the near one, not both clamped onto each
       other — a step that goes nowhere is not a step. */
    expect(inside[1]).toBeLessThan(outside[1])
  })

  it('agrees with where a ride puts him down', () => {
    /* Arriving on a floor and backing out of the car on it are the same
       spot, or a round trip would not land where it started. */
    const car = testLink({ kind: 'lift', position: [1, 3], rotation: 0 })
    const room = testRoom({
      id: 'floor-2',
      name: 'Second',
      half: [10, 10],
      links: [car],
    })
    const out = liftArrival(room, 'floor-1', testLink({ kind: 'lift' }))
    expect(out.at).toEqual(liftStance(car).outside)
  })
})
