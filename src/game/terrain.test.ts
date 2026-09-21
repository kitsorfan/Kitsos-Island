import { describe, expect, it } from 'vitest'
import {
  PATH_WIDTH,
  PROP_COLLIDERS,
  ROCKS,
  ROCK_COLLIDERS,
  STATIC_COLLIDERS,
  TREES,
  TREE_COLLIDERS,
  WATER_LEVEL,
  clamp,
  distToSegment,
  groundHeight,
  lerp,
  nearPath,
  probeCamera,
  smoothstep,
  terrainHeight,
} from './terrain'
import {
  ISLAND_FLAT_RADIUS,
  ISLAND_SHORE_RADIUS,
  ISLAND_WALK_RADIUS,
  PATHS,
  RAMPS,
} from '../data/world'

/**
 * The shape of the ground, and what stands on it.
 *
 * The one promise worth holding this to above all others is that the mesh and
 * the player controller read the same numbers — the island is drawn from
 * `terrainHeight` and walked with it, so a disagreement between them is a
 * visitor standing in the air or buried to the knee. That makes the flat
 * radius the load-bearing case: everywhere anybody actually walks is exactly
 * nought, not nearly nought.
 */

describe('the small maths', () => {
  it('eases smoothstep between its ends', () => {
    expect(smoothstep(0)).toBe(0)
    expect(smoothstep(1)).toBe(1)
    expect(smoothstep(0.5)).toBeCloseTo(0.5, 10)
  })

  it('clamps smoothstep rather than running off either end', () => {
    expect(smoothstep(-5)).toBe(0)
    expect(smoothstep(5)).toBe(1)
  })

  it('rises without ever turning back', () => {
    let last = -Infinity
    for (let t = 0; t <= 1.0001; t += 0.05) {
      const value = smoothstep(t)
      expect(value).toBeGreaterThanOrEqual(last)
      last = value
    }
  })

  it('clamps a value between two ends', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-5, 0, 10)).toBe(0)
    expect(clamp(50, 0, 10)).toBe(10)
  })

  it('interpolates, and extrapolates past the ends', () => {
    expect(lerp(0, 10, 0.5)).toBe(5)
    expect(lerp(0, 10, 0)).toBe(0)
    expect(lerp(0, 10, 1)).toBe(10)
    expect(lerp(0, 10, 2)).toBe(20)
  })
})

describe('distToSegment', () => {
  it('measures to a point on the segment when one is square on', () => {
    expect(distToSegment(0, 5, [-10, 0], [10, 0])).toBeCloseTo(5, 10)
  })

  it('measures to the nearer end, not to the infinite line', () => {
    // Off the end of the segment: the line would say 5, the segment says more.
    expect(distToSegment(30, 5, [-10, 0], [10, 0])).toBeCloseTo(
      Math.hypot(20, 5),
      10,
    )
  })

  it('is nought on the segment itself', () => {
    expect(distToSegment(3, 0, [-10, 0], [10, 0])).toBeCloseTo(0, 10)
  })

  it('measures to the point when the segment has no length', () => {
    expect(distToSegment(3, 4, [0, 0], [0, 0])).toBeCloseTo(5, 10)
  })
})

describe('terrainHeight', () => {
  it('is exactly flat everywhere anyone walks', () => {
    // Not nearly nought: the mesh and the controller both read this, and a
    // ripple under the plaza would be a visitor sunk into the paving. The
    // radii stop a whisker inside the flat edge rather than landing on it,
    // because a point built from cos and sin lands either side of a radius
    // by a rounding error and the branch there is a slope, not the plateau.
    expect(terrainHeight(0, 0)).toBe(0)
    for (let a = 0; a < Math.PI * 2; a += 0.3) {
      for (const r of [0, 20, 60, 100, ISLAND_FLAT_RADIUS - 0.001]) {
        expect(terrainHeight(Math.cos(a) * r, Math.sin(a) * r)).toBe(0)
      }
    }
  })

  it('stays above the waterline all the way to the walking edge', () => {
    // The player can be pushed out to the walking radius by the bounds. Dry
    // land has to reach at least that far, or the edge of the island is a
    // place you stand in the sea.
    for (let a = 0; a < Math.PI * 2; a += 0.25) {
      const x = Math.cos(a) * ISLAND_WALK_RADIUS
      const z = Math.sin(a) * ISLAND_WALK_RADIUS
      expect(terrainHeight(x, z)).toBeGreaterThan(WATER_LEVEL)
    }
  })

  it('keeps the ripple out past where anything is ever placed', () => {
    // The ripple is gated to start a little beyond the flat radius, so the
    // first few metres of beach are a clean slope down and not a washboard.
    // Round the ring at that radius the height must be the same everywhere.
    const ring: number[] = []
    for (let a = 0; a < Math.PI * 2; a += 0.2) {
      const r = ISLAND_FLAT_RADIUS + 3
      ring.push(terrainHeight(Math.cos(a) * r, Math.sin(a) * r))
    }
    for (const h of ring) expect(h).toBeCloseTo(ring[0], 10)
    expect(ring[0]).toBeLessThan(0)
  })

  it('does undulate out where nobody walks', () => {
    // Past the gate the sea bed is not a cone. Somewhere on this ring must
    // differ from somewhere else on it.
    const far: number[] = []
    for (let a = 0; a < Math.PI * 2; a += 0.2) {
      far.push(terrainHeight(Math.cos(a) * 130, Math.sin(a) * 130))
    }
    expect(Math.max(...far) - Math.min(...far)).toBeGreaterThan(0.1)
  })

  it('falls away from the shore into the water', () => {
    const shore = terrainHeight(ISLAND_SHORE_RADIUS + 5, 0)
    const deep = terrainHeight(ISLAND_SHORE_RADIUS + 40, 0)
    expect(shore).toBeLessThan(0)
    expect(deep).toBeLessThan(shore)
  })

  it('is under the waterline once the beach runs out', () => {
    expect(terrainHeight(ISLAND_SHORE_RADIUS + 30, 0)).toBeLessThan(WATER_LEVEL)
  })

  it('reads the same at the same place, however it is reached', () => {
    expect(terrainHeight(130, 40)).toBe(terrainHeight(130, 40))
  })

  it('is a number everywhere, however far out', () => {
    for (const r of [0, 50, 120, 200, 1000]) {
      expect(Number.isFinite(terrainHeight(r, r))).toBe(true)
    }
  })
})

describe('groundHeight', () => {
  it('is the terrain where nothing is built on top of it', () => {
    expect(groundHeight(0, 0)).toBe(terrainHeight(0, 0))
    expect(groundHeight(130, 40)).toBeCloseTo(terrainHeight(130, 40), 10)
  })

  it('is never lower than the terrain under it', () => {
    for (let x = -120; x <= 120; x += 17) {
      for (let z = -120; z <= 120; z += 17) {
        expect(groundHeight(x, z)).toBeGreaterThanOrEqual(
          terrainHeight(x, z) - 1e-9,
        )
      }
    }
  })

  it('climbs a ramp from its foot to its head', () => {
    const ramp = RAMPS[0]
    const foot = groundHeight(ramp.from[0], ramp.from[1])
    const head = groundHeight(ramp.to[0], ramp.to[1])
    const middle = groundHeight(
      (ramp.from[0] + ramp.to[0]) / 2,
      (ramp.from[1] + ramp.to[1]) / 2,
    )
    expect(head).toBeGreaterThan(foot)
    expect(middle).toBeGreaterThan(foot)
    expect(middle).toBeLessThan(head)
  })

  it('leaves the ground alone off the side of a ramp', () => {
    const ramp = RAMPS[0]
    const aside = groundHeight(
      ramp.to[0] + ramp.halfWidth + 6,
      (ramp.from[1] + ramp.to[1]) / 2,
    )
    expect(aside).toBeCloseTo(
      terrainHeight(
        ramp.to[0] + ramp.halfWidth + 6,
        (ramp.from[1] + ramp.to[1]) / 2,
      ),
      10,
    )
  })
})

describe('nearPath', () => {
  it('is true standing on a path', () => {
    const [[ax, az], [bx, bz]] = PATHS[0]
    expect(nearPath((ax + bx) / 2, (az + bz) / 2)).toBe(true)
  })

  it('measures against the width of a path unless told otherwise', () => {
    // A point a good way off to the side of the first path: outside at a
    // hand's breadth, inside once the margin is opened up to reach it.
    const [[ax, az], [bx, bz]] = PATHS[0]
    const midX = (ax + bx) / 2
    const midZ = (az + bz) / 2
    const off = midX + PATH_WIDTH + 3
    expect(nearPath(off, midZ, 0.5)).toBe(false)
    expect(nearPath(off, midZ, PATH_WIDTH + 4)).toBe(true)
  })

  it('is false far out to sea, whatever the margin', () => {
    expect(nearPath(900, 900)).toBe(false)
    expect(nearPath(900, 900, 20)).toBe(false)
  })

  it('never shrinks its answer as the margin grows', () => {
    for (const [x, z] of [
      [0, 0],
      [10, 30],
      [-40, 12],
      [60, -60],
    ]) {
      if (nearPath(x, z, 2)) expect(nearPath(x, z, 20)).toBe(true)
    }
  })
})

describe('probeCamera', () => {
  it('reports a clear boom when nothing is in the way', () => {
    // Straight up out of the middle of the island, above every roof.
    const clear = probeCamera(0, 200, 0, 0, 50, 0)
    expect(clear).toEqual({ span: 1, blocker: null })
  })

  it('never pulls the camera closer than the floor it promises', () => {
    // The span is documented as 0.45–1; anything tighter is a camera inside
    // the player's head.
    for (let a = 0; a < Math.PI * 2; a += 0.4) {
      const probe = probeCamera(
        0,
        1.6,
        26,
        Math.cos(a) * 40,
        6,
        Math.sin(a) * 40,
      )
      expect(probe.span).toBeGreaterThanOrEqual(0.45)
      expect(probe.span).toBeLessThanOrEqual(1)
    }
  })

  it('answers with a blocker exactly when the boom is cut short', () => {
    for (let a = 0; a < Math.PI * 2; a += 0.4) {
      const probe = probeCamera(
        0,
        1.6,
        26,
        Math.cos(a) * 40,
        6,
        Math.sin(a) * 40,
      )
      expect(probe.blocker === null).toBe(probe.span === 1)
    }
  })
})

describe('what the island is scattered with', () => {
  it('places the same trees and rocks on every visit', () => {
    // Seeded, not random: the island a visitor comes back to is the one they
    // left, and two people comparing notes are looking at the same island.
    expect(TREES.length).toBeGreaterThan(0)
    expect(TREES[0]).toEqual(TREES[0])
    expect(ROCKS.length).toBeGreaterThan(0)
  })

  it('gives every tree something to bump into', () => {
    expect(TREE_COLLIDERS).toHaveLength(TREES.length)
    for (const c of TREE_COLLIDERS) expect(c.circle).toBe(true)
  })

  it('leaves the pebbles out, so the island is not an obstacle course', () => {
    expect(ROCK_COLLIDERS.length).toBeLessThan(ROCKS.length)
    for (const c of ROCK_COLLIDERS) {
      expect(Math.hypot(c.x, c.z)).toBeLessThan(ISLAND_WALK_RADIUS + 4)
    }
  })

  it('collects the props into one list for the frame loop', () => {
    expect(PROP_COLLIDERS.length).toBeGreaterThan(ROCK_COLLIDERS.length)
    for (const c of PROP_COLLIDERS) {
      expect(Number.isFinite(c.x)).toBe(true)
      expect(Number.isFinite(c.z)).toBe(true)
      expect(c.hx).toBeGreaterThan(0)
      expect(c.hz).toBeGreaterThan(0)
    }
  })

  it('gives every static collider a real footprint', () => {
    expect(STATIC_COLLIDERS.length).toBeGreaterThan(0)
    for (const c of STATIC_COLLIDERS) {
      expect(c.hx).toBeGreaterThan(0)
      expect(c.hz).toBeGreaterThan(0)
    }
  })
})
