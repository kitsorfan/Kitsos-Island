import type { Vec2 } from '../types'
import {
  BUILDINGS,
  FOUNTAIN,
  FOUNTAIN_RADIUS,
  ISLAND_EDGE,
  ISLAND_FLAT_RADIUS,
  ISLAND_SHORE_RADIUS,
  LEDGES,
  NPCS,
  PATHS,
  PLAZA_RADIUS,
  RAMPS,
  SIGNS,
} from '../data/world'
import type { Ramp } from '../data/world'
import { BOARD } from '../data/minigames'
import { PARTY_BUTTON } from '../data/party'

export const WATER_LEVEL = -1.2
export const PATH_WIDTH = 5

export const smoothstep = (t: number) => {
  const c = Math.min(1, Math.max(0, t))
  return c * c * (3 - 2 * c)
}

export const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v))

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Deterministic ground height, shared by the mesh and the player controller. */
export function terrainHeight(x: number, z: number): number {
  const r = Math.hypot(x, z)
  if (r <= ISLAND_FLAT_RADIUS) return 0

  let h: number
  if (r <= ISLAND_SHORE_RADIUS) {
    h =
      -2.4 *
      smoothstep(
        (r - ISLAND_FLAT_RADIUS) / (ISLAND_SHORE_RADIUS - ISLAND_FLAT_RADIUS),
      )
  } else {
    h = -2.4 - 7 * smoothstep((r - ISLAND_SHORE_RADIUS) / 34)
  }

  // Gentle undulation, only where nothing is ever placed or walked on.
  const ripple = 1.1 * Math.sin(x * 0.11) * Math.cos(z * 0.09)
  return h + ripple * smoothstep((r - ISLAND_FLAT_RADIUS - 4) / 14)
}

/** Height of a ramp at a point, or null if the point is off it. */
function rampHeight(x: number, z: number, ramp: Ramp): number | null {
  const dx = ramp.to[0] - ramp.from[0]
  const dz = ramp.to[1] - ramp.from[1]
  const len2 = dx * dx + dz * dz
  if (len2 === 0) return null

  const t = ((x - ramp.from[0]) * dx + (z - ramp.from[1]) * dz) / len2
  if (t < 0 || t > 1) return null

  const alongX = ramp.from[0] + dx * t
  const alongZ = ramp.from[1] + dz * t
  if (Math.hypot(x - alongX, z - alongZ) > ramp.halfWidth) return null

  return lerp(ramp.fromHeight, ramp.toHeight, t)
}

/**
 * Walkable ground: the terrain, plus any steps or landings built on top of it.
 * Everything that stands on the island uses this rather than terrainHeight.
 */
export function groundHeight(x: number, z: number): number {
  let h = terrainHeight(x, z)

  for (const ledge of LEDGES) {
    if (
      Math.abs(x - ledge.x) < ledge.hx &&
      Math.abs(z - ledge.z) < ledge.hz &&
      ledge.height > h
    ) {
      h = ledge.height
    }
  }

  for (const ramp of RAMPS) {
    const rh = rampHeight(x, z, ramp)
    if (rh !== null && rh > h) h = rh
  }

  return h
}

/** Distance from a point to a segment, on the XZ plane. */
export function distToSegment(
  px: number,
  pz: number,
  [ax, az]: Vec2,
  [bx, bz]: Vec2,
): number {
  const dx = bx - ax
  const dz = bz - az
  const len = dx * dx + dz * dz
  const t = len === 0 ? 0 : clamp(((px - ax) * dx + (pz - az) * dz) / len, 0, 1)
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz))
}

export const nearPath = (x: number, z: number, margin = PATH_WIDTH) =>
  PATHS.some(([a, b]) => distToSegment(x, z, a, b) < margin)

/** Decorative hills; they are meshes on flat ground, not terrain deformation. */
export const HILLS: { position: Vec2; radius: number; height: number }[] = [
  { position: [42, -72], radius: 14, height: 12 },
  { position: [-38, -80], radius: 13, height: 11 },
  { position: [92, 8], radius: 12, height: 10 },
  { position: [34, 84], radius: 11, height: 9 },
  { position: [-36, 86], radius: 11, height: 9 },
  { position: [-88, -52], radius: 10, height: 12 },
]

export interface Collider {
  x: number
  z: number
  /** Half-extents for boxes; for circles both are the radius. */
  hx: number
  hz: number
  circle?: boolean
}

export const STATIC_COLLIDERS: Collider[] = [
  ...BUILDINGS.map((b) => ({
    x: b.position[0],
    z: b.position[1],
    hx: b.half[0],
    hz: b.half[1],
  })),
  ...HILLS.map((h) => ({
    x: h.position[0],
    z: h.position[1],
    hx: h.radius * 0.82,
    hz: h.radius * 0.82,
    circle: true,
  })),
  {
    x: FOUNTAIN[0],
    z: FOUNTAIN[1],
    hx: FOUNTAIN_RADIUS,
    hz: FOUNTAIN_RADIUS,
    circle: true,
  },
  // The Academy's foundation stone stands clear of the building's own box.
  { x: -14.1, z: -65.6, hx: 2.3, hz: 1 },
  // The games board in the plaza.
  {
    x: BOARD.position[0],
    z: BOARD.position[1],
    hx: BOARD.half[0],
    hz: BOARD.half[1],
  },
  // And the button on the other side of the road from it.
  {
    x: PARTY_BUTTON.position[0],
    z: PARTY_BUTTON.position[1],
    hx: PARTY_BUTTON.half[0],
    hz: PARTY_BUTTON.half[1],
    circle: true,
  },
]

export interface Occluder {
  x: number
  z: number
  hx: number
  hz: number
  height: number
}

/** Anything solid enough to stand between the camera and the player. */
export const OCCLUDERS: Occluder[] = [
  ...BUILDINGS.map((b) => ({
    x: b.position[0],
    z: b.position[1],
    hx: b.half[0],
    hz: b.half[1],
    height: b.height,
  })),
  ...HILLS.map((h) => ({
    x: h.position[0],
    z: h.position[1],
    hx: h.radius * 0.78,
    hz: h.radius * 0.78,
    height: h.height,
  })),
]

/** Slack around a building when testing the camera boom. */
const PAD = 0.8

export interface CameraBlock {
  /** Fraction of the boom that still sees the player, 0.45–1. */
  span: number
  /** The building in the way, if any. */
  blocker: Occluder | null
}

/**
 * Marches from the player out along the camera boom and reports the first
 * building that would come between the two. Buildings the player is already
 * standing flush against are ignored — those are never really in the way.
 */
export function probeCamera(
  px: number,
  py: number,
  pz: number,
  dx: number,
  dy: number,
  dz: number,
): CameraBlock {
  const steps = 12
  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    const x = px + dx * t
    const y = py + dy * t
    const z = pz + dz * t
    for (const o of OCCLUDERS) {
      if (y >= o.height) continue
      if (Math.abs(x - o.x) >= o.hx + PAD) continue
      if (Math.abs(z - o.z) >= o.hz + PAD) continue
      if (Math.abs(px - o.x) < o.hx + PAD && Math.abs(pz - o.z) < o.hz + PAD) {
        continue
      }
      return { span: Math.max(0.45, (i - 1) / steps), blocker: o }
    }
  }
  return { span: 1, blocker: null }
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const insideBuilding = (x: number, z: number, pad: number) =>
  BUILDINGS.some(
    (b) =>
      Math.abs(x - b.position[0]) < b.half[0] + pad &&
      Math.abs(z - b.position[1]) < b.half[1] + pad,
  )

const nearDoor = (x: number, z: number, pad: number) =>
  BUILDINGS.some((b) => Math.hypot(x - b.door[0], z - b.door[1]) < pad)

const nearPeople = (x: number, z: number, pad: number) =>
  NPCS.some(
    (n) =>
      n.area === 'island' &&
      (n.route ?? [n.position]).some(
        (p) => Math.hypot(x - p[0], z - p[1]) < pad,
      ),
  ) || SIGNS.some((s) => Math.hypot(x - s.position[0], z - s.position[1]) < pad)

const nearHill = (x: number, z: number, pad: number) =>
  HILLS.some(
    (h) => Math.hypot(x - h.position[0], z - h.position[1]) < h.radius + pad,
  )

export interface Scatter {
  position: Vec2
  y: number
  scale: number
  rotation: number
  variant: number
}

function scatter(
  count: number,
  seed: number,
  opts: {
    minRadius: number
    maxRadius: number
    pathMargin: number
    buildingPad: number
    variants?: number
    minScale?: number
    maxScale?: number
    avoidHills?: boolean
  },
): Scatter[] {
  const rand = mulberry32(seed)
  const out: Scatter[] = []
  let guard = 0
  while (out.length < count && guard++ < count * 40) {
    const angle = rand() * Math.PI * 2
    const radius =
      opts.minRadius + Math.sqrt(rand()) * (opts.maxRadius - opts.minRadius)
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius

    if (insideBuilding(x, z, opts.buildingPad)) continue
    if (nearPath(x, z, opts.pathMargin)) continue
    if (nearDoor(x, z, 8)) continue
    if (nearPeople(x, z, 4)) continue
    if (opts.avoidHills !== false && nearHill(x, z, 2)) continue

    out.push({
      position: [x, z],
      y: terrainHeight(x, z),
      scale: lerp(opts.minScale ?? 0.85, opts.maxScale ?? 1.25, rand()),
      rotation: rand() * Math.PI * 2,
      variant: Math.floor(rand() * (opts.variants ?? 1)),
    })
  }
  return out
}

const TREE_MIN = PLAZA_RADIUS + 7

export const TREES = scatter(620, 1337, {
  minRadius: TREE_MIN,
  maxRadius: 104,
  pathMargin: 6,
  buildingPad: 5,
  variants: 3,
  minScale: 0.95,
  maxScale: 1.75,
})

/** Pines planted on the decorative hills. */
export const HILL_TREES: Scatter[] = HILLS.flatMap((hill, hi) => {
  const rand = mulberry32(900 + hi * 31)
  return Array.from({ length: 12 }, () => {
    const angle = rand() * Math.PI * 2
    const radius = hill.radius * (0.25 + rand() * 0.55)
    const x = hill.position[0] + Math.cos(angle) * radius
    const z = hill.position[1] + Math.sin(angle) * radius
    const t = radius / hill.radius
    return {
      position: [x, z] as Vec2,
      y: hill.height * Math.cos((t * Math.PI) / 2) * 0.9,
      scale: 0.8 + rand() * 0.5,
      rotation: rand() * Math.PI * 2,
      variant: 2,
    }
  })
})

export const ROCKS = scatter(230, 24, {
  minRadius: 26,
  maxRadius: 124,
  pathMargin: 4,
  buildingPad: 3,
  variants: 3,
  minScale: 0.6,
  maxScale: 2.2,
  avoidHills: false,
})

export const FLOWERS = scatter(420, 77, {
  minRadius: 12,
  maxRadius: 104,
  pathMargin: 3,
  buildingPad: 2,
  variants: 4,
  minScale: 0.8,
  maxScale: 1.3,
})

export const TUFTS = scatter(520, 512, {
  minRadius: 12,
  maxRadius: 118,
  pathMargin: 2.6,
  buildingPad: 1.5,
  variants: 2,
  minScale: 0.7,
  maxScale: 1.5,
})

export const TREE_COLLIDERS: Collider[] = TREES.map((t) => ({
  x: t.position[0],
  z: t.position[1],
  hx: 0.7,
  hz: 0.7,
  circle: true,
}))

export { ISLAND_EDGE }
