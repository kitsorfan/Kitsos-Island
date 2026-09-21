import { beforeEach, describe, expect, it } from 'vitest'
import {
  GRADES,
  GRADE_BY_ID,
  LAPS,
  LAP_CHOICES,
  LAP_LENGTH,
  MAX_SPEED,
  MOTO,
  MOTO_START,
  RIVALS,
  ROAD_HALF,
  closeRide,
  gradeOf,
  openRide,
  pointAt,
  project,
  standings,
  stepMoto,
} from './moto'
import type { Difficulty } from './moto'

/**
 * The motocross circuit.
 *
 * `pointAt` and `project` are the two halves of one idea — where you are on
 * the line, and where the line is from where you are — so the sharpest thing
 * to hold them to is that they undo each other. Everything the race does with
 * position, from the lap counter to the standings, is built on that.
 *
 * The lap gate is the other thing worth pinning down: the circuit is a loop
 * and a lap only counts if you actually went round it, which is what stops a
 * rider scoring three laps by turning circles across the start line.
 */

const idle = { throttle: 0, steer: 0, brake: false, wheelie: false }

beforeEach(() => {
  closeRide()
})

describe('the shape of the circuit', () => {
  it('is a closed loop with a real length', () => {
    expect(LAP_LENGTH).toBeGreaterThan(0)
  })

  it('comes back round to where it started', () => {
    const start = pointAt(0)
    const round = pointAt(LAP_LENGTH)
    expect(round.x).toBeCloseTo(start.x, 6)
    expect(round.z).toBeCloseTo(start.z, 6)
  })

  it('reads the same point a lap further on, however many laps', () => {
    for (const d of [0, 37, 128.5, LAP_LENGTH - 1]) {
      for (const laps of [1, 2, 5]) {
        const here = pointAt(d)
        const later = pointAt(d + LAP_LENGTH * laps)
        expect(later.x).toBeCloseTo(here.x, 6)
        expect(later.z).toBeCloseTo(here.z, 6)
      }
    }
  })

  it('takes a distance from before the start line', () => {
    const back = pointAt(-20)
    const round = pointAt(LAP_LENGTH - 20)
    expect(back.x).toBeCloseTo(round.x, 6)
    expect(back.z).toBeCloseTo(round.z, 6)
  })

  it('gives every point on the line a heading to follow', () => {
    for (let d = 0; d < LAP_LENGTH; d += LAP_LENGTH / 32) {
      expect(Number.isFinite(pointAt(d).heading)).toBe(true)
    }
  })
})

describe('project', () => {
  it('undoes pointAt: the line is nought away from itself', () => {
    for (let d = 0; d < LAP_LENGTH; d += LAP_LENGTH / 24) {
      const on = pointAt(d)
      const back = project(on.x, on.z)
      expect(back.gap).toBeCloseTo(0, 4)
      expect(back.progress).toBeCloseTo(d, 3)
    }
  })

  it('measures how far off the middle of the road you are', () => {
    const on = pointAt(LAP_LENGTH / 4)
    // Step off square to the line: the gap is the step.
    const across = on.heading + Math.PI / 2
    const off = project(
      on.x + Math.sin(across) * 2,
      on.z + Math.cos(across) * 2,
    )
    expect(off.gap).toBeCloseTo(2, 3)
  })

  it('never reports a negative gap, whichever side you are', () => {
    for (let d = 0; d < LAP_LENGTH; d += LAP_LENGTH / 16) {
      const on = pointAt(d)
      const across = on.heading + Math.PI / 2
      for (const side of [-4, 4]) {
        const off = project(
          on.x + Math.sin(across) * side,
          on.z + Math.cos(across) * side,
        )
        expect(off.gap).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('signs the two sides of the road differently', () => {
    const on = pointAt(LAP_LENGTH / 3)
    const across = on.heading + Math.PI / 2
    const left = project(
      on.x + Math.sin(across) * 3,
      on.z + Math.cos(across) * 3,
    )
    const right = project(
      on.x - Math.sin(across) * 3,
      on.z - Math.cos(across) * 3,
    )
    expect(Math.sign(left.side)).toBe(-Math.sign(right.side))
  })

  it('keeps progress inside one lap of the circuit', () => {
    for (const [x, z] of [
      [0, 0],
      [500, 500],
      [-90, 40],
      [12, -300],
    ]) {
      const at = project(x, z)
      expect(at.progress).toBeGreaterThanOrEqual(0)
      expect(at.progress).toBeLessThanOrEqual(LAP_LENGTH)
    }
  })
})

describe('the grades', () => {
  it('finds each one by its id', () => {
    for (const grade of GRADES) {
      expect(gradeOf(grade.id)).toBe(grade)
      expect(GRADE_BY_ID.get(grade.id)).toBe(grade)
    }
  })

  it('falls back to the middle one for a grade nobody has', () => {
    expect(gradeOf('trophy' as Difficulty)).toBe(GRADES[1])
  })

  it('gets quicker in pace and nerve as the rank goes up', () => {
    const byRank = [...GRADES].sort((a, b) => a.rank - b.rank)
    for (let i = 1; i < byRank.length; i++) {
      expect(byRank[i].pace).toBeGreaterThanOrEqual(byRank[i - 1].pace)
      expect(byRank[i].nerve).toBeGreaterThanOrEqual(byRank[i - 1].nerve)
    }
  })

  it('brakes later as the rank goes up, which is the knob that matters', () => {
    // Pace and nerve both cap at the tarmac's own limit. No amount of either
    // gets a bike round quickly if it starts shedding speed fifty metres
    // before the corner — so on this one, lower is faster.
    const byRank = [...GRADES].sort((a, b) => a.rank - b.rank)
    for (let i = 1; i < byRank.length; i++) {
      expect(byRank[i].brake).toBeLessThan(byRank[i - 1].brake)
    }
  })

  it('offers a rider only as easy as their weaker number', () => {
    for (let i = 1; i < RIVALS.length; i++) {
      expect(RIVALS[i].pace).toBeLessThanOrEqual(RIVALS[i - 1].pace)
      expect(RIVALS[i].nerve).toBeLessThanOrEqual(RIVALS[i - 1].nerve)
    }
  })
})

describe('opening a ride', () => {
  it('puts everyone on the grid with the player at the back', () => {
    openRide()
    expect(MOTO.active).toBe(true)
    expect(MOTO.rivals).toHaveLength(RIVALS.length)
    expect(MOTO.place).toBe(MOTO.rivals.length + 1)
    expect(MOTO.x).toBeCloseTo(MOTO_START.x, 6)
    expect(MOTO.z).toBeCloseTo(MOTO_START.z, 6)
  })

  it('races the number of laps it is given', () => {
    openRide(5)
    expect(MOTO.laps).toBe(5)
  })

  it('never races fewer than one lap, whatever it is handed', () => {
    openRide(0)
    expect(MOTO.laps).toBe(1)
    openRide(-8)
    expect(MOTO.laps).toBe(1)
  })

  it('rounds a fractional lap count', () => {
    openRide(2.4)
    expect(MOTO.laps).toBe(2)
  })

  it('races the default when nobody chooses', () => {
    openRide()
    expect(MOTO.laps).toBe(LAPS)
    expect(LAP_CHOICES).toContain(LAPS)
  })

  it('scales the rivals by the grade chosen', () => {
    openRide(3, 'easy')
    const easy = MOTO.rivals.map((r) => r.pace)
    openRide(3, 'hard')
    const hard = MOTO.rivals.map((r) => r.pace)
    for (let i = 0; i < easy.length; i++) {
      expect(hard[i]).toBeGreaterThan(easy[i])
    }
  })

  it('starts everyone stopped, on lap one, with the lights still on', () => {
    openRide()
    expect(MOTO.speed).toBe(0)
    expect(MOTO.lap).toBe(1)
    expect(MOTO.countdown).toBeGreaterThan(0)
    expect(MOTO.done).toBe(false)
  })
})

describe('the lights', () => {
  it('holds everybody still until they go green', () => {
    openRide()
    stepMoto(0.1, { ...idle, throttle: 1 })
    expect(MOTO.speed).toBe(0)
  })

  it('goes green exactly once', () => {
    openRide()
    let greens = 0
    for (let i = 0; i < 200; i++) {
      if (stepMoto(0.05, idle).green) greens++
    }
    expect(greens).toBe(1)
  })

  it('lets the bike go once they do', () => {
    openRide()
    while (MOTO.countdown > 0) stepMoto(0.05, idle)
    for (let i = 0; i < 20; i++) stepMoto(0.05, { ...idle, throttle: 1 })
    expect(MOTO.speed).toBeGreaterThan(0)
  })
})

describe('riding', () => {
  const green = () => {
    openRide(3, 'normal')
    while (MOTO.countdown > 0) stepMoto(0.05, idle)
  }

  it('does nothing at all before a ride is opened', () => {
    closeRide()
    const events = stepMoto(0.1, { ...idle, throttle: 1 })
    expect(events.finished).toBe(false)
  })

  it('holds the bike to a lower speed while it is off the road', () => {
    // The grass has a lower ceiling than the tarmac, so a bike carrying more
    // than the grass will take into the rough is cut back to it. Set above
    // both ceilings and step once, which is the rule without the long run-up.
    openRide(3, 'normal')
    while (MOTO.countdown > 0) stepMoto(0.05, idle)
    const at = pointAt(MOTO.progress)
    const across = at.heading + Math.PI / 2
    MOTO.x = at.x + Math.sin(across) * (ROAD_HALF + 10)
    MOTO.z = at.z + Math.cos(across) * (ROAD_HALF + 10)
    MOTO.heading = at.heading
    // Two steps: the first is what notices the bike is in the grass, and the
    // ceiling that notice sets is what the next one is held to.
    MOTO.speed = MAX_SPEED
    stepMoto(0.02, { ...idle, throttle: 1 })
    expect(MOTO.offRoad).toBe(true)
    MOTO.speed = MAX_SPEED
    stepMoto(0.02, { ...idle, throttle: 1 })
    expect(MOTO.speed).toBeLessThan(MAX_SPEED)
  })

  it('lets the bike reach the top of the road’s own speed', () => {
    openRide(3, 'normal')
    while (MOTO.countdown > 0) stepMoto(0.05, idle)
    MOTO.speed = MAX_SPEED
    stepMoto(0.02, { ...idle, throttle: 1 })
    expect(MOTO.offRoad).toBe(false)
    expect(MOTO.speed).toBeGreaterThanOrEqual(MAX_SPEED)
  })

  it('knows when it is off the road', () => {
    openRide(3, 'normal')
    while (MOTO.countdown > 0) stepMoto(0.05, idle)
    const at = pointAt(MOTO.progress)
    const across = at.heading + Math.PI / 2
    MOTO.x = at.x + Math.sin(across) * (ROAD_HALF + 10)
    MOTO.z = at.z + Math.cos(across) * (ROAD_HALF + 10)
    stepMoto(0.05, idle)
    expect(MOTO.offRoad).toBe(true)
  })

  it('never lets the bike run backwards faster than it walks', () => {
    green()
    for (let i = 0; i < 200; i++) {
      stepMoto(0.05, { ...idle, throttle: -1 })
      expect(MOTO.speed).toBeGreaterThan(-20)
    }
  })

  it('will not bank a lap for turning circles on the start line', () => {
    // The circuit is gated into sectors you have to pass through in order,
    // so a lap only counts if you actually went round. Laps read from one,
    // so still being on the first one is the whole assertion.
    green()
    for (let i = 0; i < 400; i++) {
      stepMoto(0.05, { ...idle, throttle: 1, steer: 1 })
    }
    expect(MOTO.lap).toBe(1)
  })
})

describe('standings', () => {
  it('lists everybody in the race', () => {
    openRide()
    const order = standings()
    expect(order).toHaveLength(MOTO.rivals.length + 1)
    expect(order.some((r) => r.id === 'player')).toBe(true)
  })

  it('gives the leader no gap to itself', () => {
    openRide()
    expect(standings()[0].gap).toBe(0)
  })

  it('never puts somebody behind ahead of somebody in front', () => {
    openRide()
    while (MOTO.countdown > 0) stepMoto(0.05, idle)
    for (let i = 0; i < 200; i++) stepMoto(0.05, { ...idle, throttle: 1 })
    const gaps = standings().map((r) => r.gap)
    for (let i = 1; i < gaps.length; i++) {
      expect(gaps[i]).toBeGreaterThanOrEqual(gaps[i - 1])
    }
  })

  it('puts the player somewhere in the field, always', () => {
    openRide()
    while (MOTO.countdown > 0) stepMoto(0.05, idle)
    for (let i = 0; i < 300; i++) {
      stepMoto(0.05, { ...idle, throttle: 1 })
      expect(MOTO.place).toBeGreaterThanOrEqual(1)
      expect(MOTO.place).toBeLessThanOrEqual(MOTO.rivals.length + 1)
    }
  })
})
