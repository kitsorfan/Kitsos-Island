import type { Interior, PropKind, Vec2 } from '../types'
import type { Collider } from './terrain'

/** Half-extents each furniture kind occupies on the floor, before rotation. */
export const PROP_FOOTPRINT: Record<PropKind, Vec2> = {
  desk: [1.7, 0.85],
  chair: [0.42, 0.42],
  bookshelf: [1.5, 0.45],
  locker: [0.9, 0.45],
  bunk: [1.9, 0.95],
  monitor: [0.5, 0.3],
  serverRack: [1.15, 0.7],
  rug: [0, 0],
  plant: [0.55, 0.55],
  whiteboard: [1.7, 0.22],
  crate: [0.75, 0.75],
  table: [1.25, 0.85],
  sofa: [1.95, 0.85],
  bed: [1.95, 1.15],
  counter: [1.85, 0.7],
  pillar: [0.65, 0.65],
  lamp: [0.38, 0.38],
  schoolDesk: [1.15, 0.75],
  blackboard: [3.2, 0.25],
  kitchen: [1.95, 0.8],
  console: [1.9, 0.95],
  stove: [0.95, 0.8],
  weightBench: [1.45, 0.65],
  sandbag: [0.85, 0.55],
  globe: [0.5, 0.5],
  painting: [1.3, 0.15],
  stairs: [1.7, 1.7],
  chessTable: [0.95, 0.95],
  greekFlag: [0.42, 0.42],
  lectern: [0.85, 0.6],
}

/** Flat or wall-mounted pieces you should be able to walk past. */
const PASSABLE = new Set<PropKind>(['rug', 'monitor', 'painting'])

/** How far a wall-mounted exhibit sticks into the room. */
const EXHIBIT_FOOTPRINT: Record<string, Vec2> = {
  board: [1.4, 0.35],
  terminal: [1.1, 0.6],
  case: [1.2, 0.6],
  radio: [1.8, 0.7],
  cv: [1.3, 0.6],
  key: [0, 0],
}

function rotated(half: Vec2, rotation = 0): Vec2 {
  return Math.abs(Math.sin(rotation)) > 0.7 ? [half[1], half[0]] : half
}

/** Everything solid in a room: furniture, exhibits and the four walls. */
export function interiorColliders(interior: Interior): Collider[] {
  const out: Collider[] = []

  for (const prop of interior.props) {
    if (prop.solid === false || PASSABLE.has(prop.kind)) continue
    const base = PROP_FOOTPRINT[prop.kind]
    if (!base || (base[0] === 0 && base[1] === 0)) continue
    const scale = prop.scale ?? 1
    const [hx, hz] = rotated(base, prop.rotation)
    out.push({
      x: prop.position[0],
      z: prop.position[1],
      hx: hx * scale,
      hz: hz * scale,
    })
  }

  for (const exhibit of interior.exhibits) {
    const base = EXHIBIT_FOOTPRINT[exhibit.kind]
    if (!base || (base[0] === 0 && base[1] === 0)) continue
    const [hx, hz] = rotated(base, exhibit.rotation)
    out.push({ x: exhibit.position[0], z: exhibit.position[1], hx, hz })
  }

  return out
}

/**
 * How close to the wall the player may stand. Wide enough that a wall-mounted
 * exhibit always pushes the player inward rather than trapping them behind it.
 */
export const INTERIOR_MARGIN = 1.6

export const WALL_HEIGHT = 5.4
