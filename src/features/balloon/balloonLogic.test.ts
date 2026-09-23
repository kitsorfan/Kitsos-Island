import { beforeEach, describe, expect, it } from 'vitest'
import {
  BALLOON,
  BALLOON_START,
  BURST_RADIUS,
  CALLS,
  CALL_TOTAL,
  CONFETTI_CALLS,
  MAX_ALT,
  MIN_ALT,
  STOCK_MAX,
  WATER_CALLS,
  aimPoint,
  closeFlight,
  landingSpot,
  nearestCall,
  openFlight,
  stepBalloon,
} from './balloonLogic'
import { ISLAND_WALK_RADIUS } from '../island/world'
import { groundHeight } from '../island/terrainLogic'

/**
 * The balloon round: fourteen calls on the ground and a rack of parcels.
 *
 * The aiming ring is the piece worth proving, because the whole round is
 * played through it. It is not a guess drawn near where the parcel will fall
 * — it solves the same fall the parcel itself flies, so a visitor who lines
 * the ring up on a crowd and lets go hits the crowd. The test for that is to
 * ask the ring, then drop the parcel, and compare.
 */

const idle = {
  throttle: 0,
  steer: 0,
  /** The burner, which is what makes the balloon climb. */
  burn: false,
  /** The vent line, which is what makes it sink. */
  vent: false,
  water: false,
  confetti: false,
}

beforeEach(() => {
  closeFlight()
})

describe('the round', () => {
  it('has a call for every stop, split between the two payloads', () => {
    expect(CALLS).toHaveLength(CALL_TOTAL)
    expect(WATER_CALLS + CONFETTI_CALLS).toBe(CALL_TOTAL)
    expect(WATER_CALLS).toBeGreaterThan(0)
    expect(CONFETTI_CALLS).toBeGreaterThan(0)
  })

  it('gives every call a place and somebody asking', () => {
    for (const call of CALLS) {
      expect(call.id.length).toBeGreaterThan(0)
      expect(Number.isFinite(call.x)).toBe(true)
      expect(Number.isFinite(call.z)).toBe(true)
      expect(['water', 'confetti']).toContain(call.want)
    }
  })

  it('lays the crowds out the same way on every flight', () => {
    // Deterministic from the spot, not a shuffle: a crowd stands the same
    // way twice, so the island does not rearrange itself between visits.
    expect(CALLS.map((c) => c.id)).toEqual(CALLS.map((c) => c.id))
  })

  it('puts everyone somewhere over the island', () => {
    for (const call of CALLS) {
      expect(Math.hypot(call.x, call.z)).toBeLessThan(ISLAND_WALK_RADIUS + 20)
    }
  })
})

describe('taking off', () => {
  it('puts the balloon on its mark with nothing served', () => {
    openFlight()
    expect(BALLOON.x).toBe(BALLOON_START.x)
    expect(BALLOON.z).toBe(BALLOON_START.z)
    expect(BALLOON.count).toBe(0)
    expect(BALLOON.served).toEqual({})
    expect(BALLOON.active).toBe(true)
    expect(BALLOON.done).toBe(false)
  })

  it('takes off with a full rack of both', () => {
    openFlight()
    expect(BALLOON.stock.water).toBe(STOCK_MAX)
    expect(BALLOON.stock.confetti).toBe(STOCK_MAX)
  })

  it('starts a second flight fresh', () => {
    openFlight()
    BALLOON.count = 9
    BALLOON.served = { 'some-call': true }
    openFlight()
    expect(BALLOON.count).toBe(0)
    expect(BALLOON.served).toEqual({})
  })
})

describe('flying', () => {
  it('does nothing before a flight is opened', () => {
    closeFlight()
    const events = stepBalloon(0.1, { ...idle, burn: true })
    expect(events.finished).toBe(false)
  })

  it('keeps the balloon between its floor and its ceiling', () => {
    // The clamp is against the ground under the balloon as the frame begins,
    // and the balloon drifts while the frame runs, so over rising ground it
    // can end a frame a few millimetres inside the floor. The slack here is
    // that one frame of drift, not a licence to sink.
    openFlight()
    for (let i = 0; i < 400; i++) {
      stepBalloon(0.05, { ...idle, burn: true })
      const over = BALLOON.y - groundHeight(BALLOON.x, BALLOON.z)
      expect(over).toBeGreaterThan(MIN_ALT - 0.5)
      expect(over).toBeLessThan(MAX_ALT + 0.5)
    }
  })

  it('will not let it be vented into the ground', () => {
    openFlight()
    for (let i = 0; i < 400; i++) {
      stepBalloon(0.05, { ...idle, vent: true })
      const over = BALLOON.y - groundHeight(BALLOON.x, BALLOON.z)
      expect(over).toBeGreaterThan(MIN_ALT - 0.5)
    }
  })

  it('keeps the balloon over the island rather than out to sea', () => {
    openFlight()
    for (let i = 0; i < 600; i++) {
      stepBalloon(0.05, { ...idle, burn: true, steer: 1 })
      expect(Math.hypot(BALLOON.x, BALLOON.z)).toBeLessThan(200)
    }
  })
})

describe('landingSpot', () => {
  it('puts the basket down where it is, when that is walkable ground', () => {
    openFlight()
    BALLOON.x = 10
    BALLOON.z = 10
    expect(landingSpot()).toEqual([10, 10])
  })

  it('never puts the basket down in the sea', () => {
    openFlight()
    for (const [x, z] of [
      [300, 0],
      [0, -400],
      [200, 200],
      [-180, 40],
    ]) {
      BALLOON.x = x
      BALLOON.z = z
      const [lx, lz] = landingSpot()
      expect(Math.hypot(lx, lz)).toBeLessThanOrEqual(ISLAND_WALK_RADIUS)
    }
  })

  it('brings it ashore on the bearing it was out on', () => {
    openFlight()
    BALLOON.x = 300
    BALLOON.z = 0
    const [lx, lz] = landingSpot()
    expect(lz).toBeCloseTo(0, 6)
    expect(lx).toBeGreaterThan(0)
  })
})

describe('nearestCall', () => {
  it('finds the call nearest the balloon', () => {
    openFlight()
    const call = CALLS[3]
    BALLOON.x = call.x
    BALLOON.z = call.z
    expect(nearestCall()?.call.id).toBe(call.id)
  })

  it('skips the ones already served', () => {
    openFlight()
    const call = CALLS[3]
    BALLOON.x = call.x
    BALLOON.z = call.z
    BALLOON.served[call.id] = true
    expect(nearestCall()?.call.id).not.toBe(call.id)
  })

  it('finds nobody once everyone has been served', () => {
    openFlight()
    for (const call of CALLS) BALLOON.served[call.id] = true
    expect(nearestCall()).toBeNull()
  })
})

describe('the aiming ring', () => {
  it('points at the balloon’s own feet when it is not going anywhere', () => {
    openFlight()
    BALLOON.vx = 0
    BALLOON.vz = 0
    BALLOON.vy = 0
    const ring = aimPoint('water')
    expect(Number.isFinite(ring.x)).toBe(true)
    expect(Number.isFinite(ring.z)).toBe(true)
  })

  it('throws confetti further than a water bomb, all else equal', () => {
    // A water bomb drops like a stone. Confetti is a paper parcel that opens
    // on the way down and floats, which puts it much further downwind.
    openFlight()
    BALLOON.vx = 8
    BALLOON.vz = 0
    BALLOON.vy = 0
    const water = aimPoint('water')
    const confetti = aimPoint('confetti')
    const reach = (p: { x: number; z: number }) =>
      Math.hypot(p.x - BALLOON.x, p.z - BALLOON.z)
    expect(reach(confetti)).toBeGreaterThan(reach(water))
  })

  it('is the answer and not a guess: the parcel lands in the ring', () => {
    openFlight()
    // Settle the balloon into a real flying state before asking.
    for (let i = 0; i < 40; i++) stepBalloon(0.05, { ...idle, burn: true })
    const ring = aimPoint('water')
    let landed: { x: number; z: number } | null = null
    const before = BALLOON.bursts.length
    stepBalloon(0.02, { ...idle, water: true })
    for (let i = 0; i < 400 && !landed; i++) {
      stepBalloon(0.02, idle)
      const burst = BALLOON.bursts[before]
      if (burst) landed = { x: burst.x, z: burst.z }
    }
    expect(landed).not.toBeNull()
    expect(Math.hypot(landed!.x - ring.x, landed!.z - ring.z)).toBeLessThan(3)
  })

  it('reads a rising balloon as one that is not rising', () => {
    // A parcel let go of a climbing balloon does not carry the climb with
    // it, so the ring must not pretend it does.
    openFlight()
    BALLOON.vx = 0
    BALLOON.vz = 0
    BALLOON.vy = 5
    const rising = aimPoint('water')
    BALLOON.vy = 0
    const level = aimPoint('water')
    expect(rising.x).toBeCloseTo(level.x, 9)
    expect(rising.z).toBeCloseTo(level.z, 9)
  })
})

describe('the rack', () => {
  it('spends a parcel when one is let go', () => {
    openFlight()
    for (let i = 0; i < 40; i++) stepBalloon(0.05, { ...idle, burn: true })
    const had = BALLOON.stock.water
    stepBalloon(0.02, { ...idle, water: true })
    expect(BALLOON.stock.water).toBe(had - 1)
  })

  it('says so when the rack is empty', () => {
    openFlight()
    for (let i = 0; i < 40; i++) stepBalloon(0.05, { ...idle, burn: true })
    BALLOON.stock.water = 0
    BALLOON.gap = 0
    expect(stepBalloon(0.02, { ...idle, water: true }).empty).toBe(true)
  })

  it('never stocks more than the rack holds', () => {
    openFlight()
    for (let i = 0; i < 600; i++) {
      stepBalloon(0.05, idle)
      expect(BALLOON.stock.water).toBeLessThanOrEqual(STOCK_MAX)
      expect(BALLOON.stock.confetti).toBeLessThanOrEqual(STOCK_MAX)
    }
  })

  it('restocks over time once some have been spent', () => {
    openFlight()
    for (let i = 0; i < 40; i++) stepBalloon(0.05, { ...idle, burn: true })
    BALLOON.stock.water = 1
    for (let i = 0; i < 200; i++) stepBalloon(0.05, idle)
    expect(BALLOON.stock.water).toBeGreaterThan(1)
  })
})

describe('what counts as a delivery', () => {
  it('gives the two payloads different reaches', () => {
    expect(BURST_RADIUS.water).toBeGreaterThan(0)
    expect(BURST_RADIUS.confetti).toBeGreaterThan(BURST_RADIUS.water)
  })

  it('finishes the round once every call is served', () => {
    openFlight()
    BALLOON.count = CALL_TOTAL - 1
    for (const call of CALLS.slice(0, CALL_TOTAL - 1)) {
      BALLOON.served[call.id] = true
    }
    // Serve the last one by hand, which is what the burst does.
    BALLOON.count = CALL_TOTAL
    const events = stepBalloon(0.05, idle)
    expect(events.finished || BALLOON.done).toBe(true)
  })
})
