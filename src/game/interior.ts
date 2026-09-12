import type { Interior, InteriorLink, PropKind, Vec2 } from '../types'
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
  car: [2.2, 0.95],
  bicycle: [0.9, 0.3],
  workbench: [1.9, 0.75],
  pegboard: [1.8, 0.14],
  toolChest: [0.8, 0.55],
  shelfUnit: [1.6, 0.5],
  boiler: [0.7, 0.7],
  longTable: [4.2, 1.15],
  photoWall: [2.6, 0.12],
  armchair: [0.7, 0.7],
  tv: [1.9, 0.5],
  beanbag: [0.75, 0.75],
  poster: [1.1, 0.1],
  shutter: [2.6, 0.2],
  stairwell: [1.6, 1.8],
}

/** Flat or wall-mounted pieces you should be able to walk past. */
const PASSABLE = new Set<PropKind>([
  'rug',
  'monitor',
  'painting',
  'pegboard',
  'poster',
  'photoWall',
  'shutter',
  /* You walk onto it to go down it. */
  'stairwell',
])

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

/* ------------------------------ staircases ----------------------------- */

/**
 * The flight `UpFlight` draws, measured in the link's own frame: it starts at
 * `foot` and climbs towards -z. The mesh, the walker and the handrails all
 * read these numbers, so a step you can see is a step you can stand on.
 */
export const FLIGHT = {
  treads: 8,
  rise: 0.44,
  going: 0.46,
  /** Half the clear width between the strings. */
  halfWidth: 1.4,
  /** Local z of the front edge of the bottom tread. */
  foot: 1.86,
}

export const FLIGHT_RUN = FLIGHT.treads * FLIGHT.going
export const FLIGHT_RISE = FLIGHT.treads * FLIGHT.rise

/** Turns a point in the flight's own frame into one in the room's. */
function fromFlight(link: InteriorLink, lx: number, lz: number): Vec2 {
  const c = Math.cos(link.rotation ?? 0)
  const s = Math.sin(link.rotation ?? 0)
  return [
    link.position[0] + lx * c + lz * s,
    link.position[1] - lx * s + lz * c,
  ]
}

/** Where a flight lands. This is the point you take the stairs from. */
export function flightTop(link: InteriorLink): Vec2 {
  return fromFlight(link, 0, FLIGHT.foot - FLIGHT_RUN)
}

/**
 * Floor height at a point in a room. Rooms are flat apart from the staircase,
 * which is a ramp you walk up rather than a prop you stand beside.
 */
export function interiorFloor(
  interior: Interior,
  x: number,
  z: number,
): number {
  let y = 0
  for (const link of interior.links ?? []) {
    if (link.kind !== 'stairsUp') continue
    const c = Math.cos(link.rotation ?? 0)
    const s = Math.sin(link.rotation ?? 0)
    const dx = x - link.position[0]
    const dz = z - link.position[1]
    const lx = dx * c - dz * s
    const lz = dx * s + dz * c
    if (Math.abs(lx) > FLIGHT.halfWidth) continue
    const climbed = (FLIGHT.foot - lz) / FLIGHT_RUN
    if (climbed <= 0) continue
    y = Math.max(y, Math.min(1, climbed) * FLIGHT_RISE)
  }
  return y
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

  // The strings either side of a staircase. Without them you can step onto
  // the middle of the flight from the side and arrive halfway up in one
  // stride; with them the only way up is up.
  for (const link of interior.links ?? []) {
    if (link.kind !== 'stairsUp') continue
    const [hx, hz] = rotated([0.12, FLIGHT_RUN / 2 + 0.2], link.rotation)
    for (const side of [-1, 1]) {
      const [x, z] = fromFlight(
        link,
        side * (FLIGHT.halfWidth + 0.1),
        FLIGHT.foot - FLIGHT_RUN / 2,
      )
      out.push({ x, z, hx, hz })
    }
  }

  return out
}

/**
 * How close to the wall the player may stand. Wide enough that a wall-mounted
 * exhibit always pushes the player inward rather than trapping them behind it.
 */
export const INTERIOR_MARGIN = 1.6

export const WALL_HEIGHT = 5.4
