import { BufferGeometry, Float32BufferAttribute } from 'three'

/**
 * The lifeboat's hull, lofted from stations the way a real one is drawn.
 *
 * She used to be a box with a second box turned forty-five degrees for a bow,
 * and she sat *on* the sea rather than in it: nothing below the waterline at
 * all, so every crest that came past showed daylight underneath her. So this
 * is a proper hard-chine hull — a keel, a chine, a boot top and a sheer that
 * rises to the bow — with two thirds of a metre of draft under it for the
 * swell to break against.
 *
 * Local y = 0 is the designed waterline. Local +z is forward.
 */

interface Station {
  z: number
  /** Half-beam at the sheer, at the chine, and the heights of each. */
  hw: number
  bw: number
  deckY: number
  chineY: number
  keelY: number
}

/** Where the dark band at the waterline stops and the topsides begin. */
const BOOT_TOP = 0.22

/** How high the bulwark stands above the deck edge, how far it flares out,
 *  and how thick it is: it is drawn as a closed loop of three strips, because
 *  the camera sits astern and above and looks straight at the inside of it. */
const RAIL_H = 0.26
const RAIL_OUT = 0.07
const RAIL_T = 0.13

const STATIONS: Station[] = [
  { z: -3.7, hw: 1.3, bw: 1.06, deckY: 0.66, chineY: -0.26, keelY: -0.46 },
  { z: -2.1, hw: 1.42, bw: 1.18, deckY: 0.63, chineY: -0.3, keelY: -0.6 },
  { z: -0.4, hw: 1.44, bw: 1.16, deckY: 0.64, chineY: -0.32, keelY: -0.66 },
  { z: 1.3, hw: 1.36, bw: 1.02, deckY: 0.7, chineY: -0.29, keelY: -0.63 },
  { z: 2.8, hw: 1.14, bw: 0.78, deckY: 0.8, chineY: -0.22, keelY: -0.52 },
  { z: 3.9, hw: 0.76, bw: 0.46, deckY: 0.92, chineY: -0.1, keelY: -0.32 },
  { z: 4.7, hw: 0.34, bw: 0.18, deckY: 1.04, chineY: 0.04, keelY: -0.1 },
  { z: 5.05, hw: 0.05, bw: 0.05, deckY: 1.12, chineY: 0.14, keelY: 0.06 },
]

/** The boat's overall dimensions, for anything that has to lie alongside her. */
export const HULL_SIZE = {
  loa: STATIONS[STATIONS.length - 1].z - STATIONS[0].z,
  beam: Math.max(...STATIONS.map((s) => s.hw)) * 2,
  bow: STATIONS[STATIONS.length - 1].z,
  stern: STATIONS[0].z,
  draft: -Math.min(...STATIONS.map((s) => s.keelY)),
}

type Point = [number, number, number]

/** Where the boot top cuts the side panel of a given station. */
function bootHalfWidth(s: Station) {
  const f = (BOOT_TOP - s.chineY) / (s.deckY - s.chineY)
  return s.bw + (s.hw - s.bw) * f
}

function triangle(out: number[], a: Point, b: Point, c: Point) {
  out.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2])
}

/**
 * A lofted strip, wound so the front face looks outboard. Every panel on the
 * boat is one of these, which is the only reason the hull is not inside out.
 */
function strip(
  out: number[],
  loAft: Point,
  hiAft: Point,
  hiFwd: Point,
  loFwd: Point,
  flip: boolean,
) {
  if (flip) {
    triangle(out, loAft, loFwd, hiFwd)
    triangle(out, loAft, hiFwd, hiAft)
  } else {
    triangle(out, loAft, hiAft, hiFwd)
    triangle(out, loAft, hiFwd, loFwd)
  }
}

function fan(out: number[], apex: Point, rim: Point[]) {
  for (let i = 0; i < rim.length - 1; i++) {
    triangle(out, apex, rim[i], rim[i + 1])
  }
}

function toGeometry(positions: number[]) {
  const geo = new BufferGeometry()
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geo.computeVertexNormals()
  return geo
}

export interface HullParts {
  /** Below the chine: antifouling, and almost always under water. */
  bottom: BufferGeometry
  /** The dark band at the waterline. */
  boot: BufferGeometry
  /** Topsides and transom. */
  topside: BufferGeometry
  /** The working deck. */
  deck: BufferGeometry
  /** The bulwark standing round it. */
  rail: BufferGeometry
}

export function buildHull(): HullParts {
  const bottom: number[] = []
  const boot: number[] = []
  const topside: number[] = []
  const deck: number[] = []
  const rail: number[] = []

  for (let i = 0; i < STATIONS.length - 1; i++) {
    const a = STATIONS[i]
    const b = STATIONS[i + 1]
    const ba = bootHalfWidth(a)
    const bb = bootHalfWidth(b)

    for (const side of [1, -1]) {
      const flip = side < 0
      const K: [Point, Point] = [
        [0, a.keelY, a.z],
        [0, b.keelY, b.z],
      ]
      const C: [Point, Point] = [
        [side * a.bw, a.chineY, a.z],
        [side * b.bw, b.chineY, b.z],
      ]
      const B: [Point, Point] = [
        [side * ba, BOOT_TOP, a.z],
        [side * bb, BOOT_TOP, b.z],
      ]
      const D: [Point, Point] = [
        [side * a.hw, a.deckY, a.z],
        [side * b.hw, b.deckY, b.z],
      ]
      const R: [Point, Point] = [
        [side * (a.hw + RAIL_OUT), a.deckY + RAIL_H, a.z],
        [side * (b.hw + RAIL_OUT), b.deckY + RAIL_H, b.z],
      ]
      const Ri: [Point, Point] = [
        [side * (a.hw + RAIL_OUT - RAIL_T), a.deckY + RAIL_H, a.z],
        [side * (b.hw + RAIL_OUT - RAIL_T), b.deckY + RAIL_H, b.z],
      ]
      const Di: [Point, Point] = [
        [side * (a.hw - RAIL_T), a.deckY, a.z],
        [side * (b.hw - RAIL_T), b.deckY, b.z],
      ]

      strip(bottom, K[0], C[0], C[1], K[1], flip)
      strip(boot, C[0], B[0], B[1], C[1], flip)
      strip(topside, B[0], D[0], D[1], B[1], flip)
      // Out, over the capping and back in again: carrying on round the loop
      // in the same direction is what keeps all three facing the right way.
      strip(rail, D[0], R[0], R[1], D[1], flip)
      strip(rail, R[0], Ri[0], Ri[1], R[1], flip)
      strip(rail, Ri[0], Di[0], Di[1], Ri[1], flip)
    }

    // The deck, laid from one sheer to the other so the hull is closed.
    strip(
      deck,
      [a.hw, a.deckY, a.z],
      [-a.hw, a.deckY, a.z],
      [-b.hw, b.deckY, b.z],
      [b.hw, b.deckY, b.z],
      false,
    )
  }

  // The transom, wound clockwise in x/y so it faces astern.
  const s = STATIONS[0]
  const bs = bootHalfWidth(s)
  fan(
    boot,
    [0, s.keelY, s.z],
    [
      [-s.bw, s.chineY, s.z],
      [-bs, BOOT_TOP, s.z],
      [bs, BOOT_TOP, s.z],
      [s.bw, s.chineY, s.z],
    ],
  )
  triangle(
    topside,
    [-bs, BOOT_TOP, s.z],
    [-s.hw, s.deckY, s.z],
    [s.hw, s.deckY, s.z],
  )
  triangle(
    topside,
    [-bs, BOOT_TOP, s.z],
    [s.hw, s.deckY, s.z],
    [bs, BOOT_TOP, s.z],
  )

  return {
    bottom: toGeometry(bottom),
    boot: toGeometry(boot),
    topside: toGeometry(topside),
    deck: toGeometry(deck),
    rail: toGeometry(rail),
  }
}
