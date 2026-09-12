/**
 * The balloon: festival afternoon, seen from a wicker basket a long way up.
 *
 * Fourteen gatherings are waiting on the ground below, and each of them wants
 * one of two things dropped on it — a water bomb for the ones baking in the
 * sun, a handful of confetti for the ones with something to celebrate. Give
 * them the wrong one and they will let you know.
 *
 * Like the arena and the ride, all of this is plain state stepped once per
 * frame by <BalloonGame/>. Nothing in the air ever costs a React render; the
 * HUD polls this file on its own clock.
 */
import { ISLAND_SHORE_RADIUS, ISLAND_WALK_RADIUS } from '../data/world'
import { ACTOR_POS, REACTIONS, ageReactions } from './actors'
import type { Mood } from './actors'
import { groundHeight, OCCLUDERS } from './terrain'

export type Payload = 'water' | 'confetti'

export const PAYLOAD_COLOR = {
  water: '#3fa9e8',
  confetti: '#ff5fa8',
} as const

/* -------------------------------- the calls ------------------------------- */

/** Where one of a gathering is standing, relative to the middle of it. */
export interface Bystander {
  dx: number
  dz: number
  /** Keeps each of them off the others' beat. */
  seed: number
}

export interface Call {
  id: string
  want: Payload
  x: number
  z: number
  /** Ground under the marker, so the beam stands on it. */
  y: number
  /** One line for the HUD and the map. */
  label: string
  /** The people who are actually standing there waiting. */
  crowd: Bystander[]
}

/** How many stand at a gathering, and how far the huddle spreads. */
const CROWD = 3
const HUDDLE = 2.4

/** Deterministic 0..1 from an integer, so a crowd stands the same way twice. */
function hash(n: number): number {
  const v = Math.sin(n * 127.1) * 43758.5453
  return v - Math.floor(v)
}

function huddle(seed: number): Bystander[] {
  const out: Bystander[] = []
  for (let i = 0; i < CROWD; i++) {
    const angle = (i / CROWD) * Math.PI * 2 + hash(seed) * Math.PI * 2
    const r = HUDDLE * (0.5 + hash(seed * 7 + i) * 0.5)
    out.push({
      dx: Math.sin(angle) * r,
      dz: Math.cos(angle) * r,
      seed: seed * 3 + i,
    })
  }
  return out
}

/**
 * Where the afternoon has gathered people. Hand-placed on open ground beside
 * the roads and the doors — never on a building's footprint, so a parcel
 * always has somewhere to land.
 */
const SPOTS: Omit<Call, 'y' | 'crowd'>[] = [
  { id: 'benches', want: 'water', x: 11, z: -3, label: 'The benches by the fountain' },
  { id: 'board', want: 'confetti', x: 8, z: 15, label: 'The crowd at the games board' },
  { id: 'north-road', want: 'water', x: 1, z: -36, label: 'Halfway up Motivation Road' },
  { id: 'academy', want: 'confetti', x: 0, z: -59, label: 'The Academy steps' },
  { id: 'east-road', want: 'water', x: 41, z: -21, label: 'Discipline Road, no shade on it' },
  { id: 'work', want: 'confetti', x: 62, z: -34, label: 'The Work District forecourt' },
  { id: 'camp', want: 'water', x: 60, z: 39, label: 'The camp parade ground' },
  { id: 'house', want: 'confetti', x: -62, z: 43, label: 'The garden at Kitsos House' },
  { id: 'school', want: 'water', x: -64, z: -22, label: 'The school yard' },
  { id: 'cape-road', want: 'water', x: -38, z: -36, label: 'Freedom Road, out to the cape' },
  { id: 'lighthouse', want: 'confetti', x: -56, z: -54, label: 'The point below the lighthouse' },
  { id: 'radio', want: 'confetti', x: 0, z: 82, label: 'Under the radio mast' },
  { id: 'south-road', want: 'confetti', x: 0, z: 52, label: 'Collaboration Road' },
  { id: 'dock', want: 'water', x: -100, z: 17, label: 'The dock on the far shore' },
]

export const CALLS: Call[] = SPOTS.map((s, i) => ({
  ...s,
  y: groundHeight(s.x, s.z),
  crowd: huddle(i + 1),
}))

export const CALL_TOTAL = CALLS.length
export const WATER_CALLS = CALLS.filter((c) => c.want === 'water').length
export const CONFETTI_CALLS = CALL_TOTAL - WATER_CALLS

/* -------------------------------- handling -------------------------------- */

/** Push from the burner, tilting the envelope into a drift. */
const DRIFT_ACCEL = 11
/** Fraction of the drift shed per second with the stick centred. */
const DRIFT_DRAG = 0.85
const MAX_DRIFT = 16
const TURN = 1.15

/** A balloon is always sinking a little; the burner is what stops it. */
const SINK = 2.2
const BURN = 7.4
const VENT = 9.4
const LIFT_DRAG = 1.8

/** Height above the ground the basket may fly between. */
export const MIN_ALT = 14
export const MAX_ALT = 50

/** Far enough out to see the whole island, not so far you lose it. */
const FLY_RADIUS = ISLAND_SHORE_RADIUS - 8
/** Envelope half-width, for the buildings it has to go round rather than through. */
const ENVELOPE_RADIUS = 3.4

/** The breeze. It turns, slowly, so no two flights drift the same way. */
const WIND_SPEED = 1.9
const WIND_TURN = 0.07

/* --------------------------------- parcels -------------------------------- */

/**
 * A water bomb drops like a stone. Confetti is a paper parcel that opens on
 * the way down and floats — which puts it much further downwind, and is the
 * whole reason the two have separate rings on the ground.
 */
const FALL = { water: 26, confetti: 11 } as const
/** How wide each one throws itself when it lands. */
export const BURST_RADIUS = { water: 5, confetti: 6.8 } as const

/** Parcels in the basket, and how long a fresh one takes to come up. */
export const STOCK_MAX = 6
const RESTOCK = 1.9
/** Seconds between parcels, so a whole rack cannot leave in one frame. */
const DROP_GAP = 0.28
/** How far below the basket floor a parcel starts its fall. */
const MUZZLE_DROP = 0.4
/**
 * Nobody in a basket simply opens their hands: a parcel is thrown out over
 * the rail, ahead of the way the basket is pointing. It also keeps the rings
 * out in front of the balloon rather than hidden underneath it.
 */
const THROW = 5

export interface Parcel {
  kind: Payload
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  /** Purely visual tumble. */
  spin: number
}

/** What a parcel left behind, fading over a second and a half. */
export interface Burst {
  kind: Payload
  x: number
  y: number
  z: number
  life: number
  /** How far it threw itself, so the ring stops at the right size. */
  radius: number
  /** Somebody down there wanted this. */
  good: boolean
}

const BURST_LIFE = 1.5

/* ------------------------------- the reaction ----------------------------- */

/** How long each lasts, and how far past the wet patch it is felt. */
const FRIGHT_TIME = 3.6
const CHEER_TIME = 3.4
const STARTLE = 5

/* ------------------------------- the balloon ------------------------------ */

export const BALLOON_START = { x: 0, z: 40, alt: 30, heading: Math.PI }

export const BALLOON = {
  active: false,
  x: BALLOON_START.x,
  /** Height of the basket floor, in world units. */
  y: BALLOON_START.alt,
  z: BALLOON_START.z,
  vx: 0,
  vy: 0,
  vz: 0,
  heading: BALLOON_START.heading,
  /** 0 to 1: how hard the burner is going, for the flame and the roar. */
  burn: 0,
  windAngle: 0,
  parcels: [] as Parcel[],
  bursts: [] as Burst[],
  stock: { water: STOCK_MAX, confetti: STOCK_MAX } as Record<Payload, number>,
  /** Seconds until the next parcel comes up into each rack. */
  restock: { water: 0, confetti: 0 } as Record<Payload, number>,
  gap: 0,
  /** Which calls have been served, and how many that is. */
  served: {} as Record<string, true>,
  count: 0,
  /** Parcels let go, and the ones that landed on somebody wanting the other. */
  dropped: 0,
  wrong: 0,
  elapsed: 0,
  done: false,
  /** Last thing that happened below, polled by the HUD. */
  feed: null as { text: string; kind: 'good' | 'bad'; at: number } | null,
}

export function openFlight() {
  BALLOON.x = BALLOON_START.x
  BALLOON.z = BALLOON_START.z
  BALLOON.y = groundHeight(BALLOON_START.x, BALLOON_START.z) + BALLOON_START.alt
  BALLOON.vx = 0
  BALLOON.vy = 0
  BALLOON.vz = 0
  BALLOON.heading = BALLOON_START.heading
  BALLOON.burn = 0
  BALLOON.windAngle = Math.random() * Math.PI * 2
  BALLOON.parcels.length = 0
  BALLOON.bursts.length = 0
  BALLOON.stock = { water: STOCK_MAX, confetti: STOCK_MAX }
  BALLOON.restock = { water: RESTOCK, confetti: RESTOCK }
  BALLOON.gap = 0
  BALLOON.served = {}
  BALLOON.count = 0
  BALLOON.dropped = 0
  BALLOON.wrong = 0
  BALLOON.elapsed = 0
  BALLOON.done = false
  BALLOON.feed = null
  REACTIONS.clear()
  BALLOON.active = true
}

export function closeFlight() {
  BALLOON.active = false
  BALLOON.parcels.length = 0
  BALLOON.bursts.length = 0
  REACTIONS.clear()
}

/** Where the basket would put you down, kept on walkable ground. */
export function landingSpot(): [number, number] {
  const r = Math.hypot(BALLOON.x, BALLOON.z)
  const limit = ISLAND_WALK_RADIUS - 6
  if (r <= limit) return [BALLOON.x, BALLOON.z]
  return [(BALLOON.x / r) * limit, (BALLOON.z / r) * limit]
}

/** The nearest gathering still waiting, for the arrow and the HUD. */
export function nearestCall(): { call: Call; distance: number } | null {
  let best: Call | null = null
  let bestDist = Infinity
  for (const call of CALLS) {
    if (BALLOON.served[call.id]) continue
    const d = Math.hypot(call.x - BALLOON.x, call.z - BALLOON.z)
    if (d < bestDist) {
      best = call
      bestDist = d
    }
  }
  return best ? { call: best, distance: bestDist } : null
}

/* ---------------------------------- aiming -------------------------------- */

export interface AimPoint {
  x: number
  z: number
  y: number
  /** Seconds the parcel would spend in the air. */
  fall: number
}

/**
 * Where a parcel let go this instant would land. The ground is flat across
 * the town, but the shore falls away, so the fall time is solved two more
 * times against the height under wherever the last answer pointed.
 */
export function aimPoint(kind: Payload): AimPoint {
  const g = FALL[kind]
  // The same numbers a parcel would leave the basket with, so the ring is
  // not a guess but the answer.
  const from = BALLOON.y - MUZZLE_DROP
  const vy = Math.min(0, BALLOON.vy)
  const vx = BALLOON.vx + Math.sin(BALLOON.heading) * THROW
  const vz = BALLOON.vz + Math.cos(BALLOON.heading) * THROW
  let ground = groundHeight(BALLOON.x, BALLOON.z)
  let x = BALLOON.x
  let z = BALLOON.z
  let t = 0

  for (let i = 0; i < 3; i++) {
    const fall = Math.max(0, from - ground)
    t = (vy + Math.sqrt(vy * vy + 2 * g * fall)) / g
    x = BALLOON.x + vx * t
    z = BALLOON.z + vz * t
    ground = groundHeight(x, z)
  }

  return { x, z, y: ground, fall: t }
}

/* -------------------------------- the frame ------------------------------- */

export interface BalloonInput {
  /** -1 to 1: pull back to spill the drift, push to lean into it. */
  throttle: number
  /** -1 to 1: swing the basket round. */
  steer: number
  /** Held on the burner. */
  burn: boolean
  /** Held on the vent line. */
  vent: boolean
  /** A parcel of each kind wanted this frame. */
  water: boolean
  confetti: boolean
}

export interface BalloonEvents {
  /** Gatherings served this frame, in the order they were reached. */
  served: Call[]
  /** Parcels that found somebody wanting the other thing. */
  wrong: number
  /** Parcels that burst this frame at all, for the sound. */
  bursts: Payload[]
  /** Parcels that could not leave — the rack was empty. */
  empty: boolean
  finished: boolean
}

/** Lets one parcel go, if the rack has one and the last one has cleared. */
function release(kind: Payload, events: BalloonEvents) {
  if (BALLOON.gap > 0) return
  if (BALLOON.stock[kind] <= 0) {
    events.empty = true
    return
  }
  BALLOON.stock[kind]--
  BALLOON.dropped++
  BALLOON.gap = DROP_GAP
  BALLOON.parcels.push({
    kind,
    x: BALLOON.x,
    y: BALLOON.y - MUZZLE_DROP,
    z: BALLOON.z,
    vx: BALLOON.vx + Math.sin(BALLOON.heading) * THROW,
    vy: Math.min(0, BALLOON.vy),
    vz: BALLOON.vz + Math.cos(BALLOON.heading) * THROW,
    spin: Math.random() * Math.PI * 2,
  })
}

/** A parcel has hit the ground: work out who, if anyone, is happy about it. */
function burst(p: Parcel, ground: number, events: BalloonEvents) {
  const reach = BURST_RADIUS[p.kind]
  let good = false
  let missed = false

  for (const call of CALLS) {
    if (BALLOON.served[call.id]) continue
    if (Math.hypot(call.x - p.x, call.z - p.z) > reach) continue
    if (call.want !== p.kind) {
      missed = true
      continue
    }
    BALLOON.served[call.id] = true
    BALLOON.count++
    events.served.push(call)
    good = true
  }

  if (!good && missed) {
    BALLOON.wrong++
    events.wrong++
    BALLOON.feed = {
      text:
        p.kind === 'water'
          ? 'Soaked — they were waiting on confetti'
          : 'Confetti on the ones who wanted cooling down',
      kind: 'bad',
      at: Date.now(),
    }
  }

  // Everyone close enough to have been caught by it takes it the same way,
  // whether or not they were the ones asking: you run from a water bomb and
  // you cheer a handful of confetti.
  const kind: Mood = p.kind === 'water' ? 'fright' : 'cheer'
  const left = kind === 'fright' ? FRIGHT_TIME : CHEER_TIME
  const felt = reach + STARTLE

  for (const call of CALLS) {
    if (Math.hypot(call.x - p.x, call.z - p.z) > felt) continue
    REACTIONS.set(call.id, { kind, left, x: p.x, z: p.z })
  }
  // And anyone who happened to be walking past underneath.
  for (const [id, at] of ACTOR_POS) {
    if (Math.hypot(at.x - p.x, at.z - p.z) > felt) continue
    REACTIONS.set(id, { kind, left, x: p.x, z: p.z })
  }

  BALLOON.bursts.push({
    kind: p.kind,
    x: p.x,
    y: ground + 0.08,
    z: p.z,
    life: BURST_LIFE,
    radius: reach,
    good,
  })
  if (BALLOON.bursts.length > 12) BALLOON.bursts.shift()
  events.bursts.push(p.kind)
}

export function stepBalloon(delta: number, input: BalloonInput): BalloonEvents {
  const events: BalloonEvents = {
    served: [],
    wrong: 0,
    bursts: [],
    empty: false,
    finished: false,
  }
  if (!BALLOON.active || BALLOON.done) return events

  BALLOON.elapsed += delta
  BALLOON.gap = Math.max(0, BALLOON.gap - delta)
  BALLOON.windAngle += WIND_TURN * delta

  /* ------------------------------- the rack ------------------------------ */

  for (const kind of ['water', 'confetti'] as Payload[]) {
    if (BALLOON.stock[kind] >= STOCK_MAX) {
      BALLOON.restock[kind] = RESTOCK
      continue
    }
    BALLOON.restock[kind] -= delta
    if (BALLOON.restock[kind] <= 0) {
      BALLOON.stock[kind]++
      BALLOON.restock[kind] = RESTOCK
    }
  }

  if (input.water) release('water', events)
  if (input.confetti) release('confetti', events)

  /* ------------------------------ the burner ----------------------------- */

  BALLOON.heading -= input.steer * TURN * delta

  const lift = (input.burn ? BURN : 0) - (input.vent ? VENT : 0) - SINK
  BALLOON.vy += lift * delta
  BALLOON.vy -= BALLOON.vy * LIFT_DRAG * delta
  BALLOON.burn += ((input.burn ? 1 : 0) - BALLOON.burn) * Math.min(1, delta * 7)

  const ground = groundHeight(BALLOON.x, BALLOON.z)
  BALLOON.y += BALLOON.vy * delta
  if (BALLOON.y < ground + MIN_ALT) {
    BALLOON.y = ground + MIN_ALT
    BALLOON.vy = Math.max(0, BALLOON.vy)
  } else if (BALLOON.y > ground + MAX_ALT) {
    BALLOON.y = ground + MAX_ALT
    BALLOON.vy = Math.min(0, BALLOON.vy)
  }

  /* ------------------------------- the drift ----------------------------- */

  // The stick tips the envelope, which is all the steering a balloon has.
  BALLOON.vx += Math.sin(BALLOON.heading) * input.throttle * DRIFT_ACCEL * delta
  BALLOON.vz += Math.cos(BALLOON.heading) * input.throttle * DRIFT_ACCEL * delta

  // And the breeze pushes whether you asked it to or not.
  BALLOON.vx += Math.sin(BALLOON.windAngle) * WIND_SPEED * delta
  BALLOON.vz += Math.cos(BALLOON.windAngle) * WIND_SPEED * delta

  const shed = Math.min(1, DRIFT_DRAG * delta)
  BALLOON.vx -= BALLOON.vx * shed
  BALLOON.vz -= BALLOON.vz * shed

  const drift = Math.hypot(BALLOON.vx, BALLOON.vz)
  if (drift > MAX_DRIFT) {
    BALLOON.vx = (BALLOON.vx / drift) * MAX_DRIFT
    BALLOON.vz = (BALLOON.vz / drift) * MAX_DRIFT
  }

  BALLOON.x += BALLOON.vx * delta
  BALLOON.z += BALLOON.vz * delta

  // Fly low enough and the lighthouse is a thing you go round, not through.
  for (const o of OCCLUDERS) {
    if (BALLOON.y > o.height + 2.5) continue
    const dx = BALLOON.x - o.x
    const dz = BALLOON.z - o.z
    const overX = o.hx + ENVELOPE_RADIUS - Math.abs(dx)
    const overZ = o.hz + ENVELOPE_RADIUS - Math.abs(dz)
    if (overX <= 0 || overZ <= 0) continue
    if (overX < overZ) {
      BALLOON.x += dx >= 0 ? overX : -overX
      BALLOON.vx *= 0.2
    } else {
      BALLOON.z += dz >= 0 ? overZ : -overZ
      BALLOON.vz *= 0.2
    }
  }

  // And the breeze never carries you off the map.
  const out = Math.hypot(BALLOON.x, BALLOON.z)
  if (out > FLY_RADIUS) {
    BALLOON.x = (BALLOON.x / out) * FLY_RADIUS
    BALLOON.z = (BALLOON.z / out) * FLY_RADIUS
    BALLOON.vx *= 0.3
    BALLOON.vz *= 0.3
  }

  /* ------------------------------- parcels ------------------------------- */

  for (let i = BALLOON.parcels.length - 1; i >= 0; i--) {
    const p = BALLOON.parcels[i]
    p.vy -= FALL[p.kind] * delta
    p.x += p.vx * delta
    p.y += p.vy * delta
    p.z += p.vz * delta
    p.spin += delta * (p.kind === 'water' ? 5 : 9)

    const floor = groundHeight(p.x, p.z)
    if (p.y > floor) continue

    burst(p, floor, events)
    BALLOON.parcels.splice(i, 1)
  }

  for (let i = BALLOON.bursts.length - 1; i >= 0; i--) {
    BALLOON.bursts[i].life -= delta
    if (BALLOON.bursts[i].life <= 0) BALLOON.bursts.splice(i, 1)
  }

  ageReactions(delta)

  if (events.served.length > 0) {
    const last = events.served[events.served.length - 1]
    const left = CALL_TOTAL - BALLOON.count
    BALLOON.feed = {
      text:
        left === 0
          ? 'Every one of them served.'
          : `${last.label} — ${left} to go`,
      kind: 'good',
      at: Date.now(),
    }
  }

  if (BALLOON.count >= CALL_TOTAL) {
    BALLOON.done = true
    events.finished = true
  }

  return events
}
