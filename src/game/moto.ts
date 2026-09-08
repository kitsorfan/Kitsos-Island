/**
 * The bike: ride the island and pick up the coins laid out along its roads.
 *
 * Like the paintball arena this is plain state stepped once per frame, so a
 * ride never costs a React render.
 */
import { ISLAND_WALK_RADIUS, PATHS, PLAZA_RADIUS } from '../data/world'
import { resolveCollisions } from './collision'
import { STATIC_COLLIDERS, TREE_COLLIDERS, groundHeight } from './terrain'
import type { Collider } from './terrain'

/* -------------------------------- handling -------------------------------- */

const MAX_SPEED = 36
const REVERSE_SPEED = 8
const ACCEL = 17
const BRAKE = 30
/** Fraction of speed shed per second with the throttle shut. */
const DRAG = 0.55
const TURN = 2.1
/** Nose-up limit of a wheelie. It scores nothing; it just looks good. */
const WHEELIE_MAX = 0.8
const BIKE_RADIUS = 0.9

/* --------------------------------- coins ---------------------------------- */

export interface Coin {
  x: number
  z: number
  /** Height the coin floats at. */
  y: number
}

/** How close the bike has to get. Generous: this is a ride, not a slalom. */
export const COIN_REACH = 2.8
const COIN_HEIGHT = 1.15
/** Coins are never closer together than this. */
const COIN_GAP = 15

/**
 * Coins go where a bike can actually get to. The island is forest from about
 * 25 units out — roughly one tree every seven — but the roads were laid out
 * with the trees kept six units clear of them. So the road network and the
 * plaza are the open ground, and between them the roads reach every building
 * on the island and the dock on the far shore.
 */
function clearSpot(x: number, z: number): boolean {
  if (Math.hypot(x, z) > ISLAND_WALK_RADIUS - 6) return false
  const pad = 2.4
  const hit = (c: Collider) =>
    Math.abs(c.x - x) < pad + c.hx && Math.abs(c.z - z) < pad + c.hz
  return !STATIC_COLLIDERS.some(hit) && !TREE_COLLIDERS.some(hit)
}

function buildCoins(): Coin[] {
  const out: Coin[] = []
  const room = (x: number, z: number) =>
    !out.some((c) => Math.hypot(c.x - x, c.z - z) < COIN_GAP)

  const add = (x: number, z: number) => {
    if (!clearSpot(x, z) || !room(x, z)) return
    out.push({ x, z, y: groundHeight(x, z) + COIN_HEIGHT })
  }

  // A ring in the plaza, so the first few are in sight of the start line.
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2
    add(
      Math.sin(angle) * (PLAZA_RADIUS - 5),
      Math.cos(angle) * (PLAZA_RADIUS - 5),
    )
  }

  // Then one every stretch of every road.
  for (const [a, b] of PATHS) {
    const dx = b[0] - a[0]
    const dz = b[1] - a[1]
    const length = Math.hypot(dx, dz)
    const steps = Math.max(1, Math.round(length / 20))
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      add(a[0] + dx * t, a[1] + dz * t)
    }
  }

  return out
}

export const COINS: Coin[] = buildCoins()
export const COIN_TOTAL = COINS.length

/** Where the bike waits at the start of a ride. */
export const MOTO_START = { x: 0, z: PLAZA_RADIUS + 4, heading: 0 }

/* --------------------------------- the bike ------------------------------- */

export const MOTO = {
  active: false,
  x: MOTO_START.x,
  z: MOTO_START.z,
  heading: MOTO_START.heading,
  speed: 0,
  /** Nose up is positive: a wheelie. */
  pitch: 0,
  /** Lean into the corners. */
  roll: 0,
  wheelie: 0,
  /** Wheel angle, purely visual. */
  wheel: 0,
  /** Which coins are gone, by index into COINS. */
  taken: COINS.map(() => false),
  coins: 0,
  /** Seconds since the ride started, counting up. */
  elapsed: 0,
  /** Set once the last coin is in. */
  done: false,
}

export function openRide() {
  MOTO.x = MOTO_START.x
  MOTO.z = MOTO_START.z
  MOTO.heading = MOTO_START.heading
  MOTO.speed = 0
  MOTO.pitch = 0
  MOTO.roll = 0
  MOTO.wheelie = 0
  MOTO.wheel = 0
  MOTO.taken = COINS.map(() => false)
  MOTO.coins = 0
  MOTO.elapsed = 0
  MOTO.done = false
  MOTO.active = true
}

export function closeRide() {
  MOTO.active = false
}

/** The nearest coin still out there, for the arrow on the bike. */
export function nearestCoin(): { coin: Coin; distance: number } | null {
  let best: Coin | null = null
  let bestDist = Infinity
  for (let i = 0; i < COINS.length; i++) {
    if (MOTO.taken[i]) continue
    const coin = COINS[i]
    const d = Math.hypot(coin.x - MOTO.x, coin.z - MOTO.z)
    if (d < bestDist) {
      best = coin
      bestDist = d
    }
  }
  return best ? { coin: best, distance: bestDist } : null
}

/* ------------------------------- the frame -------------------------------- */

export interface MotoInput {
  /** -1 to 1: brake to throttle. */
  throttle: number
  /** -1 to 1: steer. */
  steer: number
  /** Held to pull a wheelie. */
  wheelie: boolean
}

export interface MotoEvents {
  /** Coins picked up this frame. */
  collected: number
  /** The last coin went in this frame. */
  finished: boolean
  /** Put a wheel wrong at speed. */
  bumped: boolean
}

/** Colliders near the bike; the tree list is far too long to walk in full. */
function nearby(x: number, z: number): Collider[] {
  const out: Collider[] = [...STATIC_COLLIDERS]
  for (const t of TREE_COLLIDERS) {
    if (Math.abs(t.x - x) < 4 && Math.abs(t.z - z) < 4) out.push(t)
  }
  return out
}

export function stepMoto(delta: number, input: MotoInput): MotoEvents {
  const events: MotoEvents = { collected: 0, finished: false, bumped: false }
  if (!MOTO.active || MOTO.done) return events

  MOTO.elapsed += delta

  /* ------------------------------ throttle ------------------------------ */

  if (input.throttle > 0.02) {
    MOTO.speed += input.throttle * ACCEL * delta
  } else if (input.throttle < -0.02) {
    MOTO.speed += input.throttle * BRAKE * delta
  } else {
    MOTO.speed -= MOTO.speed * DRAG * delta
  }
  MOTO.speed = Math.max(-REVERSE_SPEED, Math.min(MAX_SPEED, MOTO.speed))

  // Below walking pace the bars do very little, as on a real bike.
  const grip = Math.min(1, Math.abs(MOTO.speed) / 12)
  MOTO.heading -= input.steer * TURN * delta * grip * Math.sign(MOTO.speed || 1)
  MOTO.roll += (input.steer * 0.5 * grip - MOTO.roll) * Math.min(1, delta * 6)

  if (input.wheelie && MOTO.speed > 7) {
    MOTO.wheelie = Math.min(1, MOTO.wheelie + delta * 3)
  } else {
    MOTO.wheelie = Math.max(0, MOTO.wheelie - delta * 4)
  }
  MOTO.pitch = MOTO.wheelie * WHEELIE_MAX

  /* ------------------------------ the road ------------------------------ */

  const wanted: [number, number] = [
    MOTO.x + Math.sin(MOTO.heading) * MOTO.speed * delta,
    MOTO.z + Math.cos(MOTO.heading) * MOTO.speed * delta,
  ]
  const at: [number, number] = [wanted[0], wanted[1]]
  resolveCollisions(at, BIKE_RADIUS, nearby(wanted[0], wanted[1]), {
    kind: 'circle',
    radius: ISLAND_WALK_RADIUS - 2,
  })
  MOTO.x = at[0]
  MOTO.z = at[1]

  // Clipping a tree costs you your speed, and nothing worse than that.
  const shoved = Math.hypot(at[0] - wanted[0], at[1] - wanted[1])
  if (shoved > 0.02) {
    if (Math.abs(MOTO.speed) > 14) events.bumped = true
    MOTO.speed *= 0.45
    MOTO.wheelie = 0
  }

  MOTO.wheel += MOTO.speed * delta * 1.6

  /* -------------------------------- coins ------------------------------- */

  for (let i = 0; i < COINS.length; i++) {
    if (MOTO.taken[i]) continue
    const coin = COINS[i]
    if (Math.hypot(coin.x - MOTO.x, coin.z - MOTO.z) > COIN_REACH) continue
    MOTO.taken[i] = true
    MOTO.coins++
    events.collected++
  }

  if (MOTO.coins >= COIN_TOTAL) {
    MOTO.done = true
    events.finished = true
  }

  return events
}
