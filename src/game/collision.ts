import type { Collider } from './terrain'

/** A rectangle of ground, for a bound that is not a disc. */
export interface Box {
  x: number
  z: number
  hx: number
  hz: number
}

export type Bounds =
  /**
   * The island: a disc, with an optional strip running out of it for the
   * jetty. The two are a union — anywhere inside either one is somewhere he
   * may stand — so walking off the side of the planks puts him back on them
   * rather than flinging him twenty metres to the nearest beach.
   */
  | { kind: 'circle'; radius: number; jetty?: Box }
  | { kind: 'rect'; hx: number; hz: number }

/**
 * Pushes a circle of `radius` out of every collider it overlaps and keeps it
 * inside `bounds`. Mutates and returns the given tuple.
 *
 * `feetY` is how far the mover is off the ground. Anything with a `height`
 * shorter than that is cleared rather than bumped into, which is what makes a
 * garden fence something you hop over instead of something you walk round.
 */
export function resolveCollisions(
  out: [number, number],
  radius: number,
  colliders: Collider[],
  bounds: Bounds,
  feetY = 0,
): [number, number] {
  for (const c of colliders) {
    if (c.height !== undefined && feetY >= c.height) continue

    const dx = out[0] - c.x
    const dz = out[1] - c.z

    if (c.circle) {
      const min = c.hx + radius
      const dist = Math.hypot(dx, dz)
      if (dist < min) {
        if (dist < 1e-4) {
          out[0] = c.x + min
        } else {
          out[0] = c.x + (dx / dist) * min
          out[1] = c.z + (dz / dist) * min
        }
      }
      continue
    }

    if (c.rotation) {
      // Into the box's own frame, resolve there, and back out again.
      const cos = Math.cos(c.rotation)
      const sin = Math.sin(c.rotation)
      const lx = dx * cos - dz * sin
      const lz = dx * sin + dz * cos
      const overlapX = c.hx + radius - Math.abs(lx)
      const overlapZ = c.hz + radius - Math.abs(lz)
      if (overlapX > 0 && overlapZ > 0) {
        let px = 0
        let pz = 0
        if (overlapX < overlapZ) px = lx >= 0 ? overlapX : -overlapX
        else pz = lz >= 0 ? overlapZ : -overlapZ
        out[0] += px * cos + pz * sin
        out[1] += -px * sin + pz * cos
      }
      continue
    }

    const overlapX = c.hx + radius - Math.abs(dx)
    const overlapZ = c.hz + radius - Math.abs(dz)
    if (overlapX > 0 && overlapZ > 0) {
      // Push along the shallower axis so corners feel natural.
      if (overlapX < overlapZ) {
        out[0] += dx >= 0 ? overlapX : -overlapX
      } else {
        out[1] += dz >= 0 ? overlapZ : -overlapZ
      }
    }
  }

  if (bounds.kind === 'circle') {
    const r = Math.hypot(out[0], out[1])
    const jetty = bounds.jetty
    const onJetty =
      jetty !== undefined &&
      Math.abs(out[0] - jetty.x) <= jetty.hx &&
      Math.abs(out[1] - jetty.z) <= jetty.hz
    if (r > bounds.radius && !onJetty) {
      // The nearest way back inside the shore, and — where there is a jetty
      // — the nearest way back onto its planks. The shorter of the two wins,
      // which is what keeps the join between them a step rather than a jump.
      let bx = (out[0] / r) * bounds.radius
      let bz = (out[1] / r) * bounds.radius
      if (jetty) {
        const jx = Math.min(
          jetty.x + jetty.hx,
          Math.max(jetty.x - jetty.hx, out[0]),
        )
        const jz = Math.min(
          jetty.z + jetty.hz,
          Math.max(jetty.z - jetty.hz, out[1]),
        )
        if (
          Math.hypot(out[0] - jx, out[1] - jz) <
          Math.hypot(out[0] - bx, out[1] - bz)
        ) {
          bx = jx
          bz = jz
        }
      }
      out[0] = bx
      out[1] = bz
    }
  } else {
    out[0] = Math.min(bounds.hx, Math.max(-bounds.hx, out[0]))
    out[1] = Math.min(bounds.hz, Math.max(-bounds.hz, out[1]))
  }
  return out
}
