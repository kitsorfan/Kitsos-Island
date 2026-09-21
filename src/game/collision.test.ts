import { describe, expect, it } from 'vitest'
import { resolveCollisions } from './collision'
import type { Bounds } from './collision'
import type { Collider } from './terrain'

/**
 * Collision is the one piece of the island every other piece leans on: the
 * player, the guard, the friends in a paintball match and the swimmers in a
 * rescue all move by asking this to put them somewhere legal. A bug here is
 * not a wrong pixel, it is walking through a wall.
 *
 * The tests are written as questions about where somebody ends up, because
 * that is the only thing the function promises. Exact push distances are
 * asserted where the geometry fixes them; elsewhere the assertion is the
 * invariant — outside the box, inside the shore — which is what the callers
 * actually depend on.
 */

/** Somewhere well clear of everything, so a test only sees what it set up. */
const FAR: Bounds = { kind: 'rect', hx: 1000, hz: 1000 }

/** Whether a point has cleared a box on at least one axis. */
const outsideBox = (at: [number, number], box: Collider, radius: number) =>
  Math.abs(at[0] - box.x) >= box.hx + radius - 1e-9 ||
  Math.abs(at[1] - box.z) >= box.hz + radius - 1e-9

describe('resolveCollisions', () => {
  it('leaves a mover that touches nothing exactly where it was', () => {
    const out: [number, number] = [5, -3]
    expect(resolveCollisions(out, 0.5, [], FAR)).toEqual([5, -3])
  })

  it('returns the very tuple it was given, rather than a copy', () => {
    const out: [number, number] = [5, -3]
    expect(resolveCollisions(out, 0.5, [], FAR)).toBe(out)
  })

  describe('axis-aligned boxes', () => {
    const wall: Collider = { x: 0, z: 0, hx: 2, hz: 2 }

    it('pushes out along the shallower axis, so corners feel natural', () => {
      // Deep in x, barely in z: the way out is over the z face.
      const out = resolveCollisions([0.5, 1.9], 0.5, [wall], FAR)
      expect(out[0]).toBeCloseTo(0.5, 6)
      expect(out[1]).toBeCloseTo(2.5, 6)
    })

    it('pushes out the near face rather than across the box', () => {
      const out = resolveCollisions([-1.9, 0.5], 0.5, [wall], FAR)
      expect(out[0]).toBeCloseTo(-2.5, 6)
      expect(out[1]).toBeCloseTo(0.5, 6)
    })

    it('accounts for the radius of the mover', () => {
      const thin = resolveCollisions([0, 2.1], 0.5, [wall], FAR)
      const wide = resolveCollisions([0, 2.1], 1.5, [wall], FAR)
      expect(thin[1]).toBeCloseTo(2.5, 6)
      expect(wide[1]).toBeCloseTo(3.5, 6)
    })

    it('leaves a mover already clear of the box untouched', () => {
      expect(resolveCollisions([9, 9], 0.5, [wall], FAR)).toEqual([9, 9])
    })

    it('ends outside the last box when several overlap', () => {
      const cluster: Collider[] = [
        { x: 0, z: 0, hx: 1, hz: 1 },
        { x: 1.5, z: 0, hx: 1, hz: 1 },
        { x: 0, z: 1.5, hx: 1, hz: 1 },
      ]
      const out = resolveCollisions([0.2, 0.2], 0.3, cluster, FAR)
      // Resolving in list order is what the frame loop relies on, so the
      // last collider is the one guaranteed to be honoured.
      expect(outsideBox(out, cluster[2], 0.3)).toBe(true)
    })
  })

  describe('height', () => {
    const fence: Collider = { x: 0, z: 0, hx: 2, hz: 2, height: 1 }

    it('bumps into a fence at ground level', () => {
      const out = resolveCollisions([0, 1.9], 0.5, [fence], FAR, 0)
      expect(out[1]).toBeCloseTo(2.5, 6)
    })

    it('clears a fence once the feet are above it', () => {
      expect(resolveCollisions([0, 1.9], 0.5, [fence], FAR, 1.2)).toEqual([
        0, 1.9,
      ])
    })

    it('treats feet exactly at the top as clear', () => {
      expect(resolveCollisions([0, 1.9], 0.5, [fence], FAR, 1)).toEqual([
        0, 1.9,
      ])
    })

    it('never clears a collider with no height, however high the feet', () => {
      const wall: Collider = { x: 0, z: 0, hx: 2, hz: 2 }
      const out = resolveCollisions([0, 1.9], 0.5, [wall], FAR, 500)
      expect(out[1]).toBeCloseTo(2.5, 6)
    })
  })

  describe('circles', () => {
    const tree: Collider = { x: 0, z: 0, hx: 1, hz: 1, circle: true }

    it('pushes straight out along the line from the centre', () => {
      const out = resolveCollisions([0.3, 0.4], 0.5, [tree], FAR)
      expect(Math.hypot(out[0], out[1])).toBeCloseTo(1.5, 6)
      expect(Math.atan2(out[1], out[0])).toBeCloseTo(Math.atan2(0.4, 0.3), 6)
    })

    it('leaves a mover outside the circle alone', () => {
      expect(resolveCollisions([3, 0], 0.5, [tree], FAR)).toEqual([3, 0])
    })

    it('picks a direction rather than dividing by zero at dead centre', () => {
      const out = resolveCollisions([0, 0], 0.5, [tree], FAR)
      expect(Number.isFinite(out[0])).toBe(true)
      expect(Number.isFinite(out[1])).toBe(true)
      expect(Math.hypot(out[0], out[1])).toBeCloseTo(1.5, 6)
    })
  })

  describe('rotated boxes', () => {
    const rotation = Math.PI / 4
    const diagonal: Collider = { x: 0, z: 0, hx: 3, hz: 0.5, rotation }

    it('resolves in the frame of the box, not the world', () => {
      const out = resolveCollisions([1, 1], 0.4, [diagonal], FAR)
      // Back into the frame of the box: it must be clear of the short side.
      const lz = out[0] * Math.sin(rotation) + out[1] * Math.cos(rotation)
      expect(Math.abs(lz)).toBeGreaterThanOrEqual(0.5 + 0.4 - 1e-6)
    })

    it('leaves alone a point only a snapped-to-axis box would have caught', () => {
      // Inside the axis-aligned bounding box of the rotated one, and well
      // outside the plank itself: it sits off the long side, three metres
      // clear, where snapping the box to the nearest axis would have caught
      // it. Nothing is a good enough approximation of a diagonal thing.
      const out = resolveCollisions([2.2, 2.2], 0.2, [diagonal], FAR)
      expect(out).toEqual([2.2, 2.2])
    })
  })

  describe('rectangular bounds', () => {
    const room: Bounds = { kind: 'rect', hx: 4, hz: 6 }

    it('clamps to the walls of a room', () => {
      expect(resolveCollisions([99, 0], 0.5, [], room)).toEqual([4, 0])
      expect(resolveCollisions([0, -99], 0.5, [], room)).toEqual([0, -6])
    })

    it('leaves somewhere inside the room alone', () => {
      expect(resolveCollisions([1, 2], 0.5, [], room)).toEqual([1, 2])
    })
  })

  describe('island bounds', () => {
    const island: Bounds = { kind: 'circle', radius: 10 }

    it('pulls a mover back to the shore on the bearing it left on', () => {
      const out = resolveCollisions([30, 40], 0.5, [], island)
      expect(Math.hypot(out[0], out[1])).toBeCloseTo(10, 6)
      expect(Math.atan2(out[1], out[0])).toBeCloseTo(Math.atan2(40, 30), 6)
    })

    it('leaves a mover inland alone', () => {
      expect(resolveCollisions([1, 1], 0.5, [], island)).toEqual([1, 1])
    })

    describe('with a jetty running out of it', () => {
      const withJetty: Bounds = {
        kind: 'circle',
        radius: 10,
        jetty: { x: 0, z: 14, hx: 1, hz: 5 },
      }

      it('lets him stand on the planks, past the shore', () => {
        expect(resolveCollisions([0, 18], 0.3, [], withJetty)).toEqual([0, 18])
      })

      it('puts him back on the planks when he steps off the side', () => {
        const out = resolveCollisions([4, 18], 0.3, [], withJetty)
        expect(out[0]).toBeCloseTo(1, 6)
        expect(out[1]).toBeCloseTo(18, 6)
      })

      it('puts him back on the shore when the shore is nearer', () => {
        const out = resolveCollisions([-30, 0], 0.3, [], withJetty)
        expect(out[0]).toBeCloseTo(-10, 6)
        expect(out[1]).toBeCloseTo(0, 6)
      })

      it('never flings him off the end of the jetty to a far beach', () => {
        // Just past the last plank: the step back must be a step, not a
        // twenty-metre jump to the nearest sand.
        const from: [number, number] = [0, 19.4]
        const out = resolveCollisions([from[0], from[1]], 0.3, [], withJetty)
        expect(Math.hypot(out[0] - from[0], out[1] - from[1])).toBeLessThan(1)
      })
    })
  })
})
