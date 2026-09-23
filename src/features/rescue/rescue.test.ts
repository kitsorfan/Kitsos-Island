import { beforeEach, describe, expect, it } from 'vitest'
import {
  ALONGSIDE,
  AT_ONCE,
  BEACH,
  BOAT_START,
  HORIZON,
  RESCUE,
  SLOW,
  SOULS,
  closeWater,
  openWater,
  stepRescue,
} from './rescue'
import type { Casualty } from './rescue'

/**
 * The sea rescue: six flares on the water and a boat with a throttle.
 *
 * The one place a light can be shone here is the difference between what the
 * engine is ordered to do and what the hull is actually doing. A raft is
 * judged against the way the boat is making, not against the throttle, so a
 * skipper who shuts the throttle and keeps sliding is not yet stopped and
 * nobody may climb aboard. That rule is what the middle of this file is about.
 *
 * The flares are lit on a timer with a random position, so every test here
 * either holds that timer off or puts its own rafts on the water. Nothing is
 * left to a coin toss.
 */

/** A raft at a known place, so a test is never waiting on a spawn. */
const raft = (over: Partial<Casualty> = {}): Casualty => ({
  id: 999,
  x: BOAT_START.x,
  z: BOAT_START.z,
  burn: 60,
  life: 72,
  aboard: 0,
  hauling: false,
  ...over,
})

/** Holds the flare timer off, so only the rafts a test put out are there. */
function quietSea() {
  openWater()
  RESCUE.nextIn = 1e6
  RESCUE.people.length = 0
}

const still = { throttle: 0, steer: 0 }

beforeEach(() => {
  closeWater()
})

describe('casting off', () => {
  it('puts the boat on its mark with everyone still to find', () => {
    openWater()
    expect(RESCUE.x).toBe(BOAT_START.x)
    expect(RESCUE.z).toBe(BOAT_START.z)
    expect(RESCUE.heading).toBe(BOAT_START.heading)
    expect(RESCUE.saved).toBe(0)
    expect(RESCUE.lit).toBe(0)
    expect(RESCUE.people).toEqual([])
    expect(RESCUE.active).toBe(true)
    expect(RESCUE.done).toBe(false)
    expect(RESCUE.won).toBe(false)
    expect(RESCUE.lost).toBeNull()
  })

  it('has the first flare already burning when she casts off', () => {
    openWater()
    expect(RESCUE.nextIn).toBeGreaterThan(0)
    expect(RESCUE.nextIn).toBeLessThan(3)
  })

  it('stops the run without tidying the water', () => {
    // Closing only takes the run out of play. What was on the water is left
    // where it was, because the next run clears it on the way in and the
    // card at the end is still reading off it in the meantime.
    openWater()
    RESCUE.people.push(raft())
    closeWater()
    expect(RESCUE.active).toBe(false)
    expect(RESCUE.people).toHaveLength(1)
  })

  it('starts a second run from the same mark as the first', () => {
    openWater()
    RESCUE.x = 0
    RESCUE.saved = 4
    openWater()
    expect(RESCUE.x).toBe(BOAT_START.x)
    expect(RESCUE.saved).toBe(0)
  })
})

describe('a step that should do nothing', () => {
  it('does nothing before the run has started', () => {
    closeWater()
    const events = stepRescue(0.1, { throttle: 1, steer: 1 })
    expect(events.over).toBe(false)
    expect(events.saved).toBe(0)
  })

  it('does nothing once the run is over', () => {
    quietSea()
    RESCUE.done = true
    const was = RESCUE.x
    stepRescue(0.1, { throttle: 1, steer: 0 })
    expect(RESCUE.x).toBe(was)
  })
})

describe('the boat', () => {
  it('makes way when the throttle is opened', () => {
    quietSea()
    for (let i = 0; i < 20; i++) stepRescue(0.05, { throttle: 1, steer: 0 })
    expect(RESCUE.way).toBeGreaterThan(0)
  })

  it('comes off the way when the throttle is shut', () => {
    quietSea()
    for (let i = 0; i < 20; i++) stepRescue(0.05, { throttle: 1, steer: 0 })
    const running = RESCUE.way
    for (let i = 0; i < 60; i++) stepRescue(0.05, still)
    expect(RESCUE.way).toBeLessThan(running)
  })

  it('turns on the helm', () => {
    quietSea()
    for (let i = 0; i < 20; i++) stepRescue(0.05, { throttle: 1, steer: 0 })
    const was = RESCUE.heading
    for (let i = 0; i < 20; i++) stepRescue(0.05, { throttle: 1, steer: 1 })
    expect(RESCUE.heading).not.toBeCloseTo(was, 3)
  })

  it('is never driven up the beach', () => {
    quietSea()
    // Point her straight at the middle of the island and hold the throttle.
    RESCUE.heading = Math.atan2(-RESCUE.x, -RESCUE.z)
    for (let i = 0; i < 400; i++) {
      stepRescue(0.05, { throttle: 1, steer: 0 })
      expect(Math.hypot(RESCUE.x, RESCUE.z)).toBeGreaterThanOrEqual(BEACH)
    }
  })

  it('is never driven over the horizon', () => {
    quietSea()
    RESCUE.heading = Math.atan2(RESCUE.x, RESCUE.z)
    for (let i = 0; i < 400; i++) {
      stepRescue(0.05, { throttle: 1, steer: 0 })
      expect(Math.hypot(RESCUE.x, RESCUE.z)).toBeLessThanOrEqual(HORIZON + 1e-6)
    }
  })

  it('costs her way on the first touch of the beach and not every frame', () => {
    quietSea()
    RESCUE.heading = Math.atan2(-RESCUE.x, -RESCUE.z)
    let touches = 0
    for (let i = 0; i < 400; i++) {
      if (stepRescue(0.05, { throttle: 1, steer: 0 }).aground) touches++
    }
    expect(touches).toBeLessThanOrEqual(1)
  })
})

describe('taking somebody aboard', () => {
  it('lets them climb alongside a boat that has stopped', () => {
    quietSea()
    RESCUE.people.push(raft({ x: RESCUE.x + 2, z: RESCUE.z }))
    stepRescue(0.1, still)
    expect(RESCUE.people[0]?.hauling).toBe(true)
  })

  it('will not let them climb a boat that is still making way', () => {
    // A hull sliding sideways with the throttle shut is not yet stopped.
    quietSea()
    RESCUE.people.push(raft({ x: RESCUE.x + 2, z: RESCUE.z }))
    for (let i = 0; i < 20; i++) stepRescue(0.05, { throttle: 1, steer: 0 })
    if (RESCUE.way >= SLOW) expect(RESCUE.people[0]?.hauling).toBe(false)
  })

  it('will not let them climb from across the water', () => {
    quietSea()
    RESCUE.people.push(raft({ x: RESCUE.x + ALONGSIDE + 20, z: RESCUE.z }))
    stepRescue(0.1, still)
    expect(RESCUE.people[0]?.hauling).toBe(false)
  })

  it('takes only one raft at a time, even with two alongside', () => {
    quietSea()
    RESCUE.people.push(
      raft({ id: 1, x: RESCUE.x + 2, z: RESCUE.z }),
      raft({ id: 2, x: RESCUE.x + 3, z: RESCUE.z }),
    )
    stepRescue(0.1, still)
    expect(RESCUE.people.filter((p) => p.hauling)).toHaveLength(1)
  })

  it('takes the nearer of two alongside', () => {
    quietSea()
    RESCUE.people.push(
      raft({ id: 1, x: RESCUE.x + 6, z: RESCUE.z }),
      raft({ id: 2, x: RESCUE.x + 1, z: RESCUE.z }),
    )
    stepRescue(0.1, still)
    expect(RESCUE.people.find((p) => p.hauling)?.id).toBe(2)
  })

  it('gets them aboard if the boat is held there', () => {
    quietSea()
    RESCUE.people.push(raft({ x: RESCUE.x + 2, z: RESCUE.z }))
    let saved = 0
    for (let i = 0; i < 100 && RESCUE.people.length; i++) {
      saved += stepRescue(0.05, still).saved
    }
    expect(saved).toBe(1)
    expect(RESCUE.saved).toBe(1)
    expect(RESCUE.people).toHaveLength(0)
  })

  it('loses the climb again, slowly, if the boat pulls away', () => {
    quietSea()
    const soul = raft({ x: RESCUE.x + 2, z: RESCUE.z })
    RESCUE.people.push(soul)
    for (let i = 0; i < 10; i++) stepRescue(0.05, still)
    const climbed = soul.aboard
    expect(climbed).toBeGreaterThan(0)
    // Put the raft out of reach: what they had climbed slips back.
    soul.x = RESCUE.x + 100
    for (let i = 0; i < 5; i++) stepRescue(0.05, still)
    expect(soul.aboard).toBeLessThan(climbed)
    expect(soul.aboard).toBeGreaterThanOrEqual(0)
  })

  it('never lets what they have climbed go below nothing', () => {
    quietSea()
    const soul = raft({ x: RESCUE.x + 200, z: RESCUE.z, aboard: 0 })
    RESCUE.people.push(soul)
    for (let i = 0; i < 50; i++) stepRescue(0.1, still)
    expect(soul.aboard).toBe(0)
  })
})

describe('the flares', () => {
  it('burns them down as the run goes on', () => {
    quietSea()
    const soul = raft({ burn: 60 })
    RESCUE.people.push(soul)
    stepRescue(1, still)
    expect(soul.burn).toBeLessThan(60)
  })

  it('says so once, and not every frame, when one starts to gutter', () => {
    quietSea()
    RESCUE.people.push(raft({ x: RESCUE.x + 300, burn: 12.4 }))
    let warned = 0
    for (let i = 0; i < 30; i++) {
      if (stepRescue(0.1, still).guttering) warned++
    }
    expect(warned).toBe(1)
  })

  it('ends the run when one goes out', () => {
    quietSea()
    const soul = raft({ x: RESCUE.x + 300, burn: 0.05 })
    RESCUE.people.push(soul)
    const events = stepRescue(0.2, still)
    expect(events.over).toBe(true)
    expect(RESCUE.done).toBe(true)
    expect(RESCUE.won).toBe(false)
    expect(RESCUE.lost).toBe(soul)
  })

  it('reports no margin at all when there is nobody on the water', () => {
    quietSea()
    stepRescue(0.1, still)
    expect(RESCUE.margin).toBe(0)
    expect(RESCUE.worry).toBeNull()
  })

  it('worries about whichever flare has the least left', () => {
    quietSea()
    RESCUE.people.push(
      raft({ id: 1, x: RESCUE.x + 300, burn: 50 }),
      raft({ id: 2, x: RESCUE.x + 320, burn: 20 }),
    )
    stepRescue(0.1, still)
    expect(RESCUE.worry?.id).toBe(2)
    expect(RESCUE.margin).toBeCloseTo(RESCUE.people[1].burn, 6)
  })
})

describe('the tide', () => {
  it('sets a raft left alone down on the island', () => {
    quietSea()
    const soul = raft({ x: 200, z: 0, burn: 1e6 })
    RESCUE.people.push(soul)
    const out = Math.hypot(soul.x, soul.z)
    for (let i = 0; i < 100; i++) stepRescue(0.1, still)
    expect(Math.hypot(soul.x, soul.z)).toBeLessThan(out)
  })

  it('never sets one all the way onto the sand', () => {
    quietSea()
    const soul = raft({ x: 140, z: 0, burn: 1e6 })
    RESCUE.people.push(soul)
    for (let i = 0; i < 2000; i++) {
      stepRescue(0.1, still)
      expect(Math.hypot(soul.x, soul.z)).toBeGreaterThan(BEACH)
    }
  })

  it('swirls them round at the same pace however far out they are', () => {
    // The swirl was an angular rate once, and at a hundred and eighty metres
    // out that came to seven metres a second: the rafts outran the boat and
    // nobody ever got aboard. It is a speed now, so near and far match.
    const travelled = (radius: number) => {
      quietSea()
      const soul = raft({ x: radius, z: 0, burn: 1e6 })
      RESCUE.people.push(soul)
      const fromAngle = Math.atan2(soul.x, soul.z)
      for (let i = 0; i < 10; i++) stepRescue(0.1, still)
      const swept = Math.atan2(soul.x, soul.z) - fromAngle
      return Math.abs(swept) * Math.hypot(soul.x, soul.z)
    }
    expect(travelled(220)).toBeCloseTo(travelled(150), 1)
  })
})

describe('bringing everyone home', () => {
  it('wins the run on the last one aboard', () => {
    quietSea()
    RESCUE.saved = SOULS - 1
    RESCUE.lit = SOULS
    RESCUE.people.push(raft({ x: RESCUE.x + 2, z: RESCUE.z }))
    let over = false
    for (let i = 0; i < 100 && !over; i++) {
      over = stepRescue(0.05, still).over
    }
    expect(over).toBe(true)
    expect(RESCUE.won).toBe(true)
    expect(RESCUE.saved).toBe(SOULS)
  })

  it('never lights more flares than there are people to find', () => {
    openWater()
    for (let i = 0; i < 4000; i++) {
      stepRescue(0.05, still)
      expect(RESCUE.lit).toBeLessThanOrEqual(SOULS)
      expect(RESCUE.people.length).toBeLessThanOrEqual(AT_ONCE)
      if (RESCUE.done) break
    }
  })
})
