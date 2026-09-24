import type {
  Interior,
  InteriorLink,
  InteriorProp,
  PropKind,
  Vec2,
} from '../../types'
import type { Collider } from '../island/terrainLogic'
import { CONSOLE } from '../launch/deck'
import { LAUNCH_AREA } from '../launch/launch'

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
  bicycle: [1.3, 0.3],
  workbench: [1.9, 0.75],
  pegboard: [1.8, 0.14],
  toolChest: [0.8, 0.55],
  shelfUnit: [1.6, 0.5],
  boiler: [0.7, 0.7],
  longTable: [4.2, 1.15],
  photoWall: [2.6, 0.12],
  toyBox: [0.75, 0.6],
  toyShelf: [1.5, 0.35],
  fireplace: [1.35, 0.5],
  armchair: [0.7, 0.7],
  tv: [1.9, 0.5],
  beanbag: [0.75, 0.75],
  poster: [1.1, 0.1],
  shutter: [2.6, 0.2],
  christmasTree: [1.05, 1.05],
  /* It lies on the long table, which is already a collider. */
  feastTable: [0, 0],
  wreath: [0.8, 0.12],
  garland: [3.4, 0.12],
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
  'wreath',
  'garland',
])

/** How far a wall-mounted exhibit sticks into the room. */
const EXHIBIT_FOOTPRINT: Record<string, Vec2> = {
  board: [1.4, 0.35],
  terminal: [1.1, 0.6],
  case: [1.2, 0.6],
  radio: [1.8, 0.7],
  cv: [1.3, 0.6],
  /* Flat on the wall: the margin keeps you off it, so nothing to bump. */
  calendar: [0, 0],
  techWall: [0, 0],
  key: [0, 0],
  /* Standing on a shelf that is a collider already. */
  toy: [0, 0],
  /* Likewise: the prop it hangs on brings its own footprint. */
  prop: [0, 0],
}

function rotated(half: Vec2, rotation = 0): Vec2 {
  return Math.abs(Math.sin(rotation)) > 0.7 ? [half[1], half[0]] : half
}

/* ------------------------------ the links ------------------------------ */

/**
 * Turns a point in a link's own frame — +z pointing off the wall into the
 * room — into one in the room's.
 */
export function fromLink(link: InteriorLink, lx: number, lz: number): Vec2 {
  const c = Math.cos(link.rotation ?? 0)
  const s = Math.sin(link.rotation ?? 0)
  return [
    link.position[0] + lx * c + lz * s,
    link.position[1] - lx * s + lz * c,
  ]
}

/** And a point in the room into the link's frame. */
export function toLink(link: InteriorLink, x: number, z: number): Vec2 {
  const c = Math.cos(link.rotation ?? 0)
  const s = Math.sin(link.rotation ?? 0)
  const dx = x - link.position[0]
  const dz = z - link.position[1]
  return [dx * c - dz * s, dx * s + dz * c]
}

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

/**
 * The hole `Stairwell` draws, in the link's frame: the shaft runs from -z to
 * +z and you step into it from the +z end, where the newel posts are.
 */
export const WELL = {
  halfWidth: 1.5,
  halfLength: 1.7,
}

/** A doorway between rooms: half its clear width, and how deep its reveal is. */
const DOOR = {
  halfWidth: 1.2,
  reach: 2.2,
}

/**
 * The front doorway, cut in the south wall of the room behind the building's
 * door on the island. Full width, so the wall meshes and the threshold agree.
 */
export const DOORWAY_WIDTH = 4

/** Where a flight lands, in the room. */
export function flightTop(link: InteriorLink): Vec2 {
  return fromLink(link, 0, FLIGHT.foot - FLIGHT_RUN)
}

/**
 * How far up a flight a point is: 0 on the floor or off it, 1 at the top.
 * Past the head of the flight it is the floor again — a flight along a wall
 * has ordinary room beyond its soffit, and that is not three metres up.
 */
export function climbOf(link: InteriorLink, x: number, z: number): number {
  const [lx, lz] = toLink(link, x, z)
  if (Math.abs(lx) > FLIGHT.halfWidth) return 0
  if (lz < FLIGHT.foot - FLIGHT_RUN - 0.7) return 0
  return Math.max(0, Math.min(1, (FLIGHT.foot - lz) / FLIGHT_RUN))
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
    y = Math.max(y, climbOf(link, x, z) * FLIGHT_RISE)
  }
  return y
}

/**
 * True once the player is through: at the head of a flight, in the well of a
 * stairwell, or in the reveal of a door. A locked door is never through.
 */
export function linkReached(link: InteriorLink, x: number, z: number): boolean {
  switch (link.kind) {
    case 'locked':
      return false
    case 'stairsUp':
      return climbOf(link, x, z) >= 0.8
    case 'stairsDown': {
      const [lx, lz] = toLink(link, x, z)
      return (
        Math.abs(lx) <= WELL.halfWidth - 0.2 &&
        Math.abs(lz) <= WELL.halfLength - 0.3
      )
    }
    default: {
      const [lx, lz] = toLink(link, x, z)
      return Math.abs(lx) <= DOOR.halfWidth && lz <= DOOR.reach
    }
  }
}

/**
 * Where you stand having just come through a link from the other side: on the
 * floor at the foot of a flight, beside the open end of a well, a stride
 * inside a door. Always clear of the threshold, so you do not go straight back.
 */
export function linkArrival(link: InteriorLink): Vec2 {
  switch (link.kind) {
    case 'stairsUp':
      return fromLink(link, 0, FLIGHT.foot + 1.5)
    case 'stairsDown':
      return fromLink(link, 0, WELL.halfLength + 1.6)
    default:
      return fromLink(link, 0, DOOR.reach + 0.8)
  }
}

/** The way you face having just come through: on into the room. */
export function linkFacing(link: InteriorLink): number {
  return link.rotation ?? 0
}

/** The link in `room` that leads back to `from`, if it has one. */
export function wayBack(
  room: Interior,
  from: string,
): InteriorLink | undefined {
  return (room.links ?? []).find((link) => link.to === from)
}

/** True in the front doorway, which is the way out onto the island. */
export function doorwayReached(
  interior: Interior,
  x: number,
  z: number,
): boolean {
  return Math.abs(x) <= DOORWAY_WIDTH / 2 - 0.4 && z >= interior.half[1] - 2.3
}

/**
 * Everything a room holds, with the Christmas dressing folded in when the
 * calendar says so. One function, so the furniture that is drawn and the
 * furniture that is walked into can never disagree.
 */
export function roomProps(
  interior: Interior,
  festive: boolean,
): InteriorProp[] {
  if (!festive || !interior.festive) return interior.props
  return [...interior.props, ...interior.festive]
}

/** Everything solid in a room: furniture, exhibits and the four walls. */
export function interiorColliders(
  interior: Interior,
  festive = false,
): Collider[] {
  const out: Collider[] = []

  for (const prop of roomProps(interior, festive)) {
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

  /*
   * The flight deck's console.
   *
   * It is drawn by `FlightDeck.tsx` rather than declared as a prop - it has
   * to read the launch clock, which a line in a room's prop list cannot do -
   * so the loop above never sees it and it had no footprint at all. You
   * walked straight through five metres of instrument desk to reach a button
   * that is supposed to be on the far side of it.
   *
   * Taken off the same CONSOLE the mesh is positioned from, so the thing you
   * bump into and the thing you can see cannot drift apart. A shade narrower
   * and shallower than the 5.2 by 1.5 desk, because the player is stopped at
   * arm's length by the collider and standing to press the button should
   * still feel like reaching over it.
   */
  if (interior.id === LAUNCH_AREA) {
    out.push({ x: CONSOLE[0], z: CONSOLE[1], hx: 2.5, hz: 0.72 })
  }

  for (const link of interior.links ?? []) {
    if (link.kind === 'stairsUp') {
      // The strings either side of a staircase. Without them you can step
      // onto the middle of the flight from the side and arrive halfway up in
      // one stride; with them the only way up is up.
      const [hx, hz] = rotated([0.12, FLIGHT_RUN / 2 + 0.2], link.rotation)
      for (const side of [-1, 1]) {
        const [x, z] = fromLink(
          link,
          side * (FLIGHT.halfWidth + 0.1),
          FLIGHT.foot - FLIGHT_RUN / 2,
        )
        out.push({ x, z, hx, hz })
      }
      // And a stop across the head of it: past the top tread there is only
      // the soffit, and a floor that would otherwise stay at full height.
      const [sx, sz] = fromLink(link, 0, FLIGHT.foot - FLIGHT_RUN - 0.5)
      const [shx, shz] = rotated([FLIGHT.halfWidth + 0.2, 0.25], link.rotation)
      out.push({ x: sx, z: sz, hx: shx, hz: shz })
    }

    if (link.kind === 'stairsDown') {
      // The rail down both sides of the well. You go down a stairwell from
      // its open end, not by falling into it sideways.
      const [hx, hz] = rotated([0.12, WELL.halfLength], link.rotation)
      for (const side of [-1, 1]) {
        const [x, z] = fromLink(link, side * (WELL.halfWidth + 0.1), 0)
        out.push({ x, z, hx, hz })
      }
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

/**
 * How wide the technology wall runs, and how far along it you can stand and
 * still read it. It is a wall rather than an object, so it answers from
 * anywhere in front of it instead of only from the point it is anchored at.
 */
export const TECH_WALL_SPAN = 22
export const TECH_WALL_REACH = TECH_WALL_SPAN / 2 + 2.4
