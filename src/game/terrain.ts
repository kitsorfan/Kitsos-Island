import type { Vec2 } from '../types'
import {
  BUILDINGS,
  FOUNTAIN,
  FOUNTAIN_RADIUS,
  ISLAND_FLAT_RADIUS,
  ISLAND_SHORE_RADIUS,
  NPCS,
  PATHS,
  SIGNS,
} from '../data/world'

export const WATER_LEVEL = -1.2
export const ISLAND_EDGE = 58
export const PATH_WIDTH = 3.2

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
    h = -2.4 * smoothstep((r - ISLAND_FLAT_RADIUS) / (ISLAND_SHORE_RADIUS - ISLAND_FLAT_RADIUS))
  } else {
    h = -2.4 - 6.5 * smoothstep((r - ISLAND_SHORE_RADIUS) / 11)
  }

  // Gentle undulation, only where nothing is ever placed or walked on.
  const ripple = 0.45 * Math.sin(x * 0.31) * Math.cos(z * 0.27)
  return h + ripple * smoothstep((r - ISLAND_FLAT_RADIUS - 2) / 6)
}

/** Squared distance from a point to a segment, on the XZ plane. */
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
  { position: [-26, -23], radius: 7.5, height: 6.5 },
  { position: [27, -26], radius: 6, height: 5 },
  { position: [-30, 25], radius: 5.5, height: 4 },
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
    hx: h.radius * 0.8,
    hz: h.radius * 0.8,
    circle: true,
  })),
  {
    x: FOUNTAIN[0],
    z: FOUNTAIN[1],
    hx: FOUNTAIN_RADIUS,
    hz: FOUNTAIN_RADIUS,
    circle: true,
  },
]

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
  NPCS.some((n) => Math.hypot(x - n.position[0], z - n.position[1]) < pad) ||
  SIGNS.some((s) => Math.hypot(x - s.position[0], z - s.position[1]) < pad)

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
  while (out.length < count && guard++ < count * 60) {
    const angle = rand() * Math.PI * 2
    const radius =
      opts.minRadius +
      Math.sqrt(rand()) * (opts.maxRadius - opts.minRadius)
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius

    if (insideBuilding(x, z, opts.buildingPad)) continue
    if (nearPath(x, z, opts.pathMargin)) continue
    if (nearDoor(x, z, 5)) continue
    if (nearPeople(x, z, 2.5)) continue
    if (opts.avoidHills !== false && nearHill(x, z, 1.5)) continue

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

export const TREES = scatter(104, 1337, {
  minRadius: 13,
  maxRadius: 35,
  pathMargin: 4.6,
  buildingPad: 3,
  variants: 3,
  minScale: 0.8,
  maxScale: 1.35,
})

/** Pines planted on the decorative hills. */
export const HILL_TREES: Scatter[] = HILLS.flatMap((hill, hi) => {
  const rand = mulberry32(900 + hi * 31)
  return Array.from({ length: 7 }, () => {
    const angle = rand() * Math.PI * 2
    const radius = hill.radius * (0.25 + rand() * 0.55)
    const x = hill.position[0] + Math.cos(angle) * radius
    const z = hill.position[1] + Math.sin(angle) * radius
    const t = radius / hill.radius
    return {
      position: [x, z] as Vec2,
      y: hill.height * Math.cos((t * Math.PI) / 2) * 0.9,
      scale: 0.7 + rand() * 0.4,
      rotation: rand() * Math.PI * 2,
      variant: 2,
    }
  })
})

export const ROCKS = scatter(46, 24, {
  minRadius: 10,
  maxRadius: 41,
  pathMargin: 3,
  buildingPad: 2,
  variants: 3,
  minScale: 0.5,
  maxScale: 1.4,
  avoidHills: false,
})

export const FLOWERS = scatter(180, 77, {
  minRadius: 4,
  maxRadius: 35,
  pathMargin: 2.2,
  buildingPad: 1.2,
  variants: 4,
  minScale: 0.7,
  maxScale: 1.1,
})

export const TUFTS = scatter(220, 512, {
  minRadius: 5,
  maxRadius: 40,
  pathMargin: 2,
  buildingPad: 1,
  variants: 2,
  minScale: 0.6,
  maxScale: 1.2,
})

/** Boxes that can stand between the camera and the player. */
export const OCCLUDERS = BUILDINGS.map((b) => ({
  x: b.position[0],
  z: b.position[1],
  hx: b.half[0],
  hz: b.half[1],
  height: b.height,
}))

export type Occluder = (typeof OCCLUDERS)[number]

/** Slack around a building when testing the camera boom. */
const PAD = 0.6

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
      // Standing flush against a wall does not mean the wall is in the way.
      if (
        Math.abs(px - o.x) < o.hx + PAD &&
        Math.abs(pz - o.z) < o.hz + PAD
      ) {
        continue
      }
      return { span: Math.max(0.45, (i - 1) / steps), blocker: o }
    }
  }
  return { span: 1, blocker: null }
}

export const TREE_COLLIDERS: Collider[] = TREES.map((t) => ({
  x: t.position[0],
  z: t.position[1],
  hx: 0.55,
  hz: 0.55,
  circle: true,
}))
