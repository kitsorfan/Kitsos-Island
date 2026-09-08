import type { Collider } from './terrain'

export type Bounds =
  | { kind: 'circle'; radius: number }
  | { kind: 'rect'; hx: number; hz: number }

/**
 * Pushes a circle of `radius` out of every collider it overlaps and keeps it
 * inside `bounds`. Mutates and returns the given tuple.
 */
export function resolveCollisions(
  out: [number, number],
  radius: number,
  colliders: Collider[],
  bounds: Bounds,
): [number, number] {
  for (const c of colliders) {
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
    if (r > bounds.radius) {
      out[0] = (out[0] / r) * bounds.radius
      out[1] = (out[1] / r) * bounds.radius
    }
  } else {
    out[0] = Math.min(bounds.hx, Math.max(-bounds.hx, out[0]))
    out[1] = Math.min(bounds.hz, Math.max(-bounds.hz, out[1]))
  }
  return out
}
