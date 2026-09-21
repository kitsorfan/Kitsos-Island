import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CALL_RADIUS,
  DESCENT_SECONDS,
  PARTNER_GAP,
  PARTY,
  SKY_HEIGHT,
  atCentre,
  callAmalia,
  danceSpot,
  entranceHeight,
  onFloor,
  partnerSpot,
  startParty,
  stepEntrance,
  stopParty,
} from './party'
import { DANCEFLOOR } from '../data/party'

/**
 * The party on the dancefloor.
 *
 * `danceSpot` is the piece that has to be right: two rings facing in, worked
 * out from the dancer's number alone, so the floor fills from the middle out,
 * nobody ends up behind anybody, and a dancer keeps the same spot for the
 * whole party rather than shuffling about between frames.
 */

beforeEach(() => {
  stopParty()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('the middle of the floor', () => {
  it('knows when somebody is standing on the spot', () => {
    expect(atCentre(0, 0)).toBe(true)
    expect(atCentre(CALL_RADIUS + 1, 0)).toBe(false)
  })

  it('knows the floor from the rest of the room', () => {
    expect(onFloor(0, 0)).toBe(true)
    expect(onFloor(DANCEFLOOR.radius + 5, 0)).toBe(false)
  })
})

describe('calling her down', () => {
  it('is called once, when the player reaches the middle', () => {
    callAmalia()
    expect(PARTY.called).toBe(true)
    expect(PARTY.entrance).toBe(0)
  })

  it('is not called twice by somebody standing there', () => {
    callAmalia()
    stepEntrance(1)
    const partway = PARTY.entrance
    callAmalia()
    expect(PARTY.entrance).toBe(partway)
  })

  it('does not begin before she is called', () => {
    stepEntrance(1)
    expect(PARTY.entrance).toBe(0)
  })

  it('brings her all the way down and no further', () => {
    callAmalia()
    for (let i = 0; i < 100; i++) stepEntrance(0.1)
    expect(PARTY.entrance).toBe(1)
  })

  it('takes about as long as it says it will', () => {
    callAmalia()
    stepEntrance(DESCENT_SECONDS)
    expect(PARTY.entrance).toBeCloseTo(1, 6)
  })

  it('settles rather than lands', () => {
    // Eased out: she slows as she arrives instead of stopping dead.
    callAmalia()
    const heights: number[] = [entranceHeight()]
    for (let i = 0; i < 10; i++) {
      stepEntrance(DESCENT_SECONDS / 10)
      heights.push(entranceHeight())
    }
    expect(heights[0]).toBeCloseTo(SKY_HEIGHT, 6)
    expect(heights.at(-1)).toBeCloseTo(0, 6)
    // The last step covers less ground than the first.
    const first = heights[0] - heights[1]
    const last = heights.at(-2)! - heights.at(-1)!
    expect(last).toBeLessThan(first)
  })

  it('never goes back up', () => {
    callAmalia()
    let last = Infinity
    for (let i = 0; i < 40; i++) {
      stepEntrance(0.1)
      const height = entranceHeight()
      expect(height).toBeLessThanOrEqual(last + 1e-9)
      last = height
    }
  })
})

describe('starting and stopping', () => {
  it('starts the party', () => {
    startParty()
    expect(PARTY.active).toBe(true)
    expect(PARTY.called).toBe(false)
    expect(PARTY.entrance).toBe(0)
  })

  it('stops it again and puts her away', () => {
    startParty()
    callAmalia()
    stepEntrance(1)
    stopParty()
    expect(PARTY.active).toBe(false)
    expect(PARTY.called).toBe(false)
    expect(PARTY.entrance).toBe(0)
  })
})

describe('danceSpot', () => {
  it('gives the same dancer the same spot every time it is asked', () => {
    // A dancer who moved between frames would be a dancer who teleported.
    for (const i of [0, 1, 5, 11]) {
      expect(danceSpot(i)).toEqual(danceSpot(i))
    }
  })

  it('keeps everybody on the floor', () => {
    for (let i = 0; i < 24; i++) {
      const spot = danceSpot(i)
      expect(
        Math.hypot(spot.x - DANCEFLOOR.x, spot.z - DANCEFLOOR.z),
      ).toBeLessThan(DANCEFLOOR.radius)
    }
  })

  it('fills the floor from the middle out, in two rings', () => {
    const radii: number[] = []
    for (let i = 0; i < 18; i++) {
      const spot = danceSpot(i)
      radii.push(Math.hypot(spot.x - DANCEFLOOR.x, spot.z - DANCEFLOOR.z))
    }
    // Two clusters of distance from the middle, not one spread.
    expect(Math.max(...radii)).toBeGreaterThan(Math.min(...radii) + 1)
  })

  it('does not stand anybody on top of anybody else', () => {
    // Eleven: everybody on the island who might turn up. The two rings seat
    // fourteen between them, and the seats are handed out in turn, so as
    // long as the crowd fits nobody shares a spot.
    const spots = Array.from({ length: 11 }, (_, i) => danceSpot(i))
    for (let i = 0; i < spots.length; i++) {
      for (let j = i + 1; j < spots.length; j++) {
        const apart = Math.hypot(
          spots[i].x - spots[j].x,
          spots[i].z - spots[j].z,
        )
        expect(apart).toBeGreaterThan(0.6)
      }
    }
  })
})

describe('partnerSpot', () => {
  it('keeps her an arm’s length from him', () => {
    for (const seconds of [0, 1, 2.5, 7]) {
      const her = partnerSpot(0, 0, seconds)
      expect(Math.hypot(her.x, her.z)).toBeCloseTo(PARTNER_GAP, 6)
    }
  })

  it('turns slowly around him, which makes it a pair', () => {
    const first = partnerSpot(0, 0, 0)
    const later = partnerSpot(0, 0, 3)
    expect(Math.hypot(first.x - later.x, first.z - later.z)).toBeGreaterThan(0)
  })

  it('holds the middle if he walks off the floor', () => {
    const away = DANCEFLOOR.radius + 30
    const her = partnerSpot(away, away, 1)
    expect(Math.hypot(her.x - DANCEFLOOR.x, her.z - DANCEFLOOR.z)).toBeCloseTo(
      PARTNER_GAP,
      6,
    )
  })

  it('dances with him while he is on it', () => {
    const her = partnerSpot(3, 3, 1)
    expect(Math.hypot(her.x - 3, her.z - 3)).toBeCloseTo(PARTNER_GAP, 6)
  })
})
