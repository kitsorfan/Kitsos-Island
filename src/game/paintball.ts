/**
 * The paintball match: two friends, everyone else against you.
 *
 * All of it lives outside React. The arena is stepped once per frame by
 * <Paintball/>, which then reports the hits it found to the store, so a ball
 * crossing the plaza never costs a re-render.
 */
import { ISLAND_WALK_RADIUS, NPCS, PLAZA_RADIUS } from '../data/world'
import type { Npc } from '../types'
import { resolveCollisions } from './collision'
import { STATIC_COLLIDERS, TREE_COLLIDERS, groundHeight } from './terrain'
import type { Collider } from './terrain'

/** Rounds in the hopper, and how long a refill takes. */
export const MAG_SIZE = 5
export const RELOAD_MS = 6000
export const START_LIVES = 3

/**
 * How big the two sides get. Allies are a coin toss — some afternoons nobody
 * picks up a marker for you — and the other lot can be anything from a
 * handful to most of a village.
 */
export const MAX_FRIENDS = 5
export const MIN_ENEMIES = 5
export const MAX_ENEMIES = 20

/** Seconds on the clock before anybody may fire. */
export const COUNTDOWN = 5

/** Where the match is fought, so nobody wanders off to the shore. */
export const ARENA_CENTER = { x: 0, z: 4 }
export const ARENA_RADIUS = 64

/** How far a marker throws a ball. Yours reaches further than theirs. */
export const PLAYER_RANGE = 34
const ENEMY_RANGE = 26
const FRIEND_RANGE = 30

/** Widest angle either side of your facing that the marker will lead a shot. */
export const AIM_CONE = 1.1

const PELLET_SPEED = 46
const PELLET_LIFE = 1.5
/** Where a ball leaves the marker, which is also the height it flies at. */
const MUZZLE = 1.36
/** Anything on the standing line sails over a crouched player. */
const CROUCH_TOP = 1.15
const STAND_TOP = 1.95
const UNIT_TOP = 1.95
const UNIT_RADIUS = 0.62
const PLAYER_RADIUS = 0.55

/** Seconds between your rounds, so a mag cannot leave in one frame. */
export const FIRE_GAP = 0.22
/** Seconds you cannot be hit again after taking one. */
const GRACE = 2

export const PAINT = {
  player: '#ff8c1a',
  friend: '#3ecf6e',
  enemy: '#e63c58',
} as const

export type Team = 'friend' | 'enemy'
/** Who threw a ball. Yours is its own side so friendly fire still counts. */
export type Side = Team | 'player'

export interface Combatant {
  id: string
  team: Team
  x: number
  z: number
  /** Y-rotation the body is turned to, in radians. */
  facing: number
  out: boolean
  /** Seconds until this one may fire again. */
  cooldown: number
  /** Which way it is currently sidestepping, and for how long. */
  strafe: number
  strafeFor: number
  /** Read by the NPC component to animate the walk cycle. */
  moving: boolean
  speed: number
  /** Last step's velocity, so a shot can be led rather than aimed flat. */
  vx: number
  vz: number
}

export interface Pellet {
  x: number
  y: number
  z: number
  vx: number
  vz: number
  life: number
  side: Side
  color: string
}

/** A paint mark left where a ball landed, fading over a couple of seconds. */
export interface Splat {
  x: number
  y: number
  z: number
  life: number
  color: string
}

export const ARENA = {
  active: false,
  /** Seconds left before the whistle. Nobody fires or moves until it is 0. */
  countdown: 0,
  units: new Map<string, Combatant>(),
  pellets: [] as Pellet[],
  splats: [] as Splat[],
  /** Seconds until your next round may leave the marker. */
  fireGap: 0,
  /** Grace left after taking a hit. */
  grace: 0,
  /** True while you are crouched, written by the player controller. */
  crouched: false,
}

/** What one step of the arena changed, for the store to fold in. */
export interface ArenaEvents {
  playerHit: boolean
  /** Combatants knocked out this frame, and who threw the ball. */
  splatted: { id: string; team: Team; by: Side }[]
}

/* ------------------------------ line of sight ----------------------------- */

/** Buildings, hills and the fountain — the only things a ball cannot cross. */
const COVER = STATIC_COLLIDERS

function insideCover(x: number, z: number, pad: number): boolean {
  for (const c of COVER) {
    const dx = x - c.x
    const dz = z - c.z
    if (c.circle) {
      if (Math.hypot(dx, dz) < c.hx + pad) return true
    } else if (Math.abs(dx) < c.hx + pad && Math.abs(dz) < c.hz + pad) {
      return true
    }
  }
  return false
}

/** True when a wall stands between two points, so nobody shoots through one. */
function blocked(ax: number, az: number, bx: number, bz: number): boolean {
  const dist = Math.hypot(bx - ax, bz - az)
  const steps = Math.max(2, Math.round(dist / 3))
  for (let i = 1; i < steps; i++) {
    const t = i / steps
    if (insideCover(ax + (bx - ax) * t, az + (bz - az) * t, 0.4)) return true
  }
  return false
}

/* -------------------------------- the teams ------------------------------- */

/**
 * Who is eligible. The night shift is not: a match is a daylight game, so
 * they are not on the island to be drafted into one — and an enemy nobody
 * can see is an enemy nobody can paint.
 */
const ISLAND_IDS = NPCS.filter(
  (n) => n.area === 'island' && n.shift !== 'night',
).map((n) => n.id)
const NPC_BY_ID = new Map(NPCS.map((n) => [n.id, n]))

/**
 * The island only has eleven people on it, and a full field wants more than
 * that. Anybody past the eleventh is a face from the next village along —
 * they get a name so the feed can use it, and a look so the field is not a
 * row of identical twins.
 */
export interface Ringer {
  name: string
  colors: Npc['colors']
}

const RINGER_NAMES = [
  'Lefteris',
  'Zoe',
  'Tasos',
  'Rania',
  'Vasilis',
  'Ioanna',
  'Stavros',
  'Christina',
  'Panos',
  'Katerina',
  'Michalis',
  'Angeliki',
  'Spyros',
  'Chryssa',
  'Dinos',
  'Vaso',
  'Akis',
  'Lena',
  'Makis',
  'Toula',
  'Sotiris',
  'Niki',
  'Argyris',
  'Fenia',
]

const SKINS = ['#f0c39a', '#d99e6f', '#a2683f', '#8a5a34']
const HAIRS = ['#2b2b2b', '#4a3526', '#241d18', '#6b4a2a']
const SHIRTS = [
  '#4a6f8a',
  '#8a5a6f',
  '#5c7a4a',
  '#7a6a4a',
  '#6a5a8a',
  '#8a6a4a',
]
const PANTS = ['#3a3f4a', '#4c5238', '#2a3f78', '#4a4436']

/** Everyone on the field who is not one of the eleven. */
export const RINGERS = new Map<string, Ringer>()

/** Whoever this id belongs to, islander or ringer. */
export function combatantName(id: string): string {
  return RINGERS.get(id)?.name ?? NPC_BY_ID.get(id)?.name ?? 'Someone'
}

function shuffled<T>(list: T[]): T[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Everyone on the island who could pick up a marker, in a fixed order. */
export const ROSTER = ISLAND_IDS

export interface Teams {
  friends: string[]
  enemies: string[]
}

/**
 * Fills out both sides from an explicit list of who is standing with you and
 * a headcount for the other lot.
 *
 * Your side is always people you have met — there are only ever five of them
 * at most and eleven to choose from. Locals you did not pick line up against
 * you first, and anything past the eleventh face comes in from out of town.
 */
export function buildTeams(friendIds: string[], enemyCount: number): Teams {
  RINGERS.clear()
  const names = shuffled(RINGER_NAMES)
  let extra = 0

  const ringer = (i: number): string => {
    const id = `ringer-e${i}`
    RINGERS.set(id, {
      name: names[extra % names.length],
      colors: {
        skin: SKINS[extra % SKINS.length],
        hair: HAIRS[(extra * 3) % HAIRS.length],
        shirt: SHIRTS[extra % SHIRTS.length],
        pants: PANTS[(extra * 2) % PANTS.length],
      },
    })
    extra++
    return id
  }

  const friends = ROSTER.filter((id) => friendIds.includes(id)).slice(
    0,
    MAX_FRIENDS,
  )
  const spare = shuffled(ROSTER.filter((id) => !friends.includes(id)))
  const count = Math.max(
    MIN_ENEMIES,
    Math.min(MAX_ENEMIES, Math.round(enemyCount)),
  )

  return {
    friends,
    enemies: Array.from(
      { length: count },
      (_, i) => spare.shift() ?? ringer(i),
    ),
  }
}

/** A draw of the hat, for the sides you get handed before you change them. */
export function pickTeams(): Teams {
  const friendCount = Math.floor(Math.random() * (MAX_FRIENDS + 1))
  const enemyCount =
    MIN_ENEMIES + Math.floor(Math.random() * (MAX_ENEMIES - MIN_ENEMIES + 1))
  return buildTeams(shuffled(ROSTER).slice(0, friendCount), enemyCount)
}

/** Drops a combatant on clear ground near a wanted spot. */
function place(x: number, z: number): [number, number] {
  const at: [number, number] = [x, z]
  resolveCollisions(at, 1, COVER, {
    kind: 'circle',
    radius: ISLAND_WALK_RADIUS - 4,
  })
  return at
}

function unit(id: string, team: Team, x: number, z: number): Combatant {
  return {
    id,
    team,
    x,
    z,
    facing: Math.atan2(ARENA_CENTER.x - x, ARENA_CENTER.z - z),
    out: false,
    cooldown: team === 'enemy' ? 1.4 + Math.random() * 1.6 : 1,
    strafe: Math.random() < 0.5 ? -1 : 1,
    strafeFor: 1 + Math.random() * 2,
    moving: false,
    speed: 0,
    vx: 0,
    vz: 0,
  }
}

/**
 * Lines everyone up: friends at your shoulders, enemies in a ring out in the
 * fields. Called once per round, before the first shot.
 */
export function openArena(friends: string[], enemies: string[]) {
  ARENA.units.clear()
  ARENA.pellets.length = 0
  ARENA.splats.length = 0
  ARENA.fireGap = 0
  ARENA.grace = 0
  ARENA.crouched = false
  ARENA.countdown = COUNTDOWN

  friends.forEach((id, i) => {
    const angle = Math.PI * (0.72 + i * 0.56)
    const [x, z] = place(
      ARENA_CENTER.x + Math.sin(angle) * 6.5,
      ARENA_CENTER.z + Math.cos(angle) * 6.5,
    )
    ARENA.units.set(id, unit(id, 'friend', x, z))
  })

  enemies.forEach((id, i) => {
    // Spread round the compass and out over three rings, so twenty of them
    // arrive in waves rather than as one wall.
    const angle = (i / Math.max(1, enemies.length)) * Math.PI * 2 + 0.4
    const radius = PLAZA_RADIUS + 10 + (i % 3) * 12
    const [x, z] = place(
      ARENA_CENTER.x + Math.sin(angle) * radius,
      ARENA_CENTER.z + Math.cos(angle) * radius,
    )
    ARENA.units.set(id, unit(id, 'enemy', x, z))
  })

  ARENA.active = true
}

export function closeArena() {
  ARENA.active = false
  ARENA.countdown = 0
  ARENA.units.clear()
  ARENA.pellets.length = 0
  ARENA.splats.length = 0
}

export const liveEnemies = () => {
  let n = 0
  for (const u of ARENA.units.values()) if (u.team === 'enemy' && !u.out) n++
  return n
}

/* -------------------------------- shooting -------------------------------- */

function spawn(
  fromX: number,
  fromZ: number,
  angle: number,
  side: Side,
  color: string,
  y = MUZZLE,
  /** How far down the line of the shot it leaves, and how far right of it. */
  ahead = 0.7,
  lateral = 0,
) {
  ARENA.pellets.push({
    x: fromX + Math.sin(angle) * ahead + Math.cos(angle) * lateral,
    y,
    z: fromZ + Math.cos(angle) * ahead - Math.sin(angle) * lateral,
    vx: Math.sin(angle) * PELLET_SPEED,
    vz: Math.cos(angle) * PELLET_SPEED,
    life: PELLET_LIFE,
    side,
    color,
  })
}

/**
 * The enemy you are pointing closest to, within range and inside the aim cone.
 * Returned so the player controller can swing the body onto the shot.
 */
export function aimAt(
  px: number,
  pz: number,
  facing: number,
): { angle: number; target: Combatant | null } {
  let best: Combatant | null = null
  let bestOff = AIM_CONE
  for (const u of ARENA.units.values()) {
    if (u.team !== 'enemy' || u.out) continue
    const dx = u.x - px
    const dz = u.z - pz
    const dist = Math.hypot(dx, dz)
    if (dist > PLAYER_RANGE || dist < 0.001) continue
    let off = Math.atan2(dx, dz) - facing
    while (off > Math.PI) off -= Math.PI * 2
    while (off < -Math.PI) off += Math.PI * 2
    if (Math.abs(off) > bestOff) continue
    if (blocked(px, pz, u.x, u.z)) continue
    best = u
    bestOff = Math.abs(off)
  }
  if (!best) return { angle: facing, target: null }

  // Aim where they will be when the ball arrives, not where they stand.
  const flight = Math.hypot(best.x - px, best.z - pz) / PELLET_SPEED
  return {
    angle: Math.atan2(
      best.x + best.vx * flight - px,
      best.z + best.vz * flight - pz,
    ),
    target: best,
  }
}

/**
 * True while your marker will actually go off: not during the countdown, and
 * not while you are flat on the ground. Getting down is cover, and the price
 * of cover is that you cannot shoot out of it.
 */
export function canFire(crouched: boolean): boolean {
  return ARENA.countdown <= 0 && !crouched
}

/** Throws one of your rounds. The caller owns the ammo count. */
/**
 * Where a shot leaves the marker. Over his shoulder it comes off the gun as
 * drawn on the body; behind his eyes the gun is drawn to the camera instead,
 * and a pellet still leaving his chest reads as coming from nowhere.
 */
export interface Muzzle {
  /** World height it leaves at. */
  y: number
  /** How far down the line of the shot, and how far right of that line. */
  ahead: number
  lateral: number
}

export const HIP_MUZZLE: Muzzle = { y: MUZZLE, ahead: 0.7, lateral: 0 }

export function playerFire(
  px: number,
  pz: number,
  angle: number,
  from: Muzzle = HIP_MUZZLE,
) {
  spawn(px, pz, angle, 'player', PAINT.player, from.y, from.ahead, from.lateral)
  ARENA.fireGap = FIRE_GAP
}

/* ------------------------------- unit tempo ------------------------------- */

/** Colliders within a step of a unit, so the tree count stays out of the loop. */
function nearbyCover(x: number, z: number): Collider[] {
  const out: Collider[] = []
  for (const c of COVER) out.push(c)
  for (const t of TREE_COLLIDERS) {
    if (Math.abs(t.x - x) < 3 && Math.abs(t.z - z) < 3) out.push(t)
  }
  return out
}

function walk(
  u: Combatant,
  tx: number,
  tz: number,
  speed: number,
  delta: number,
) {
  const dx = tx - u.x
  const dz = tz - u.z
  const dist = Math.hypot(dx, dz)
  if (dist < 0.001) return
  const step = Math.min(dist, speed * delta)
  const at: [number, number] = [
    u.x + (dx / dist) * step,
    u.z + (dz / dist) * step,
  ]
  resolveCollisions(at, 0.55, nearbyCover(u.x, u.z), {
    kind: 'circle',
    radius: ISLAND_WALK_RADIUS - 2,
  })
  // Nobody leaves the field of play, however hard they are pushed.
  const ox = at[0] - ARENA_CENTER.x
  const oz = at[1] - ARENA_CENTER.z
  const out = Math.hypot(ox, oz)
  if (out > ARENA_RADIUS) {
    at[0] = ARENA_CENTER.x + (ox / out) * ARENA_RADIUS
    at[1] = ARENA_CENTER.z + (oz / out) * ARENA_RADIUS
  }
  u.vx = (at[0] - u.x) / delta
  u.vz = (at[1] - u.z) / delta
  u.x = at[0]
  u.z = at[1]
  u.moving = true
  u.speed = speed
}

/** The live enemy closest to a friend, so your side has something to shoot. */
function closestEnemy(x: number, z: number): Combatant | null {
  let best: Combatant | null = null
  let bestD = Infinity
  for (const u of ARENA.units.values()) {
    if (u.team !== 'enemy' || u.out) continue
    const d = Math.hypot(u.x - x, u.z - z)
    if (d < bestD) {
      best = u
      bestD = d
    }
  }
  return best
}

function stepUnit(u: Combatant, px: number, pz: number, delta: number) {
  u.moving = false
  u.speed = 0
  u.vx = 0
  u.vz = 0
  if (u.out) return

  u.cooldown -= delta
  u.strafeFor -= delta
  if (u.strafeFor <= 0) {
    u.strafe = Math.random() < 0.5 ? -1 : 1
    u.strafeFor = 1.2 + Math.random() * 2.2
  }

  // Enemies shoot at you; friends shoot the nearest enemy. Either way both
  // sides keep station on you, which is what holds the match together.
  const mark = u.team === 'enemy' ? { x: px, z: pz } : closestEnemy(u.x, u.z)
  const toAnchor = Math.hypot(px - u.x, pz - u.z)

  const near = u.team === 'enemy' ? 10 : 4
  const far = u.team === 'enemy' ? 19 : 12
  const pace = u.team === 'enemy' ? 4.2 : 5

  if (toAnchor > far) {
    walk(u, px, pz, pace, delta)
  } else if (toAnchor < near) {
    walk(u, u.x * 2 - px, u.z * 2 - pz, pace * 0.8, delta)
  } else if (toAnchor > 0.5) {
    // Circle you rather than stand still, so they are harder to lead.
    const nx = (px - u.x) / toAnchor
    const nz = (pz - u.z) / toAnchor
    walk(u, u.x - nz * u.strafe * 4, u.z + nx * u.strafe * 4, pace * 0.7, delta)
  }

  if (!mark) return

  const dx = mark.x - u.x
  const dz = mark.z - u.z
  const dist = Math.hypot(dx, dz)
  u.facing = Math.atan2(dx, dz)

  const range = u.team === 'enemy' ? ENEMY_RANGE : FRIEND_RANGE
  if (u.cooldown > 0 || dist > range) return
  if (blocked(u.x, u.z, mark.x, mark.z)) return

  // Accuracy falls off with distance, so the far side of the plaza is safer.
  const spread = 0.06 + dist * 0.007
  spawn(
    u.x,
    u.z,
    u.facing + (Math.random() - 0.5) * 2 * spread,
    u.team,
    u.team === 'enemy' ? PAINT.enemy : PAINT.friend,
  )
  u.cooldown =
    u.team === 'enemy' ? 2.9 + Math.random() * 2.2 : 1.5 + Math.random() * 1.2
}

/* -------------------------------- the frame ------------------------------- */

/** Leaves a mark where a ball stopped — on a body, or on the grass. */
function land(p: Pellet, onBody: boolean) {
  ARENA.splats.push({
    x: p.x,
    y: onBody ? p.y : Math.max(0.06, groundHeight(p.x, p.z) + 0.06),
    z: p.z,
    life: 2.2,
    color: p.color,
  })
  if (ARENA.splats.length > 48) ARENA.splats.shift()
}

/**
 * Moves everyone and every ball on, then reports what got painted. The player
 * position comes in from the controller so this file never reaches into React.
 */
export function stepArena(
  delta: number,
  player: { x: number; z: number; crouched: boolean; invulnerable: boolean },
): ArenaEvents {
  const events: ArenaEvents = { playerHit: false, splatted: [] }
  if (!ARENA.active) return events

  ARENA.crouched = player.crouched

  // Five seconds on the clock before anybody may do anything about anybody.
  // They stand where they were dropped; you get the time to find cover.
  if (ARENA.countdown > 0) {
    ARENA.countdown = Math.max(0, ARENA.countdown - delta)
    for (const u of ARENA.units.values()) {
      u.moving = false
      u.speed = 0
      u.vx = 0
      u.vz = 0
    }
    return events
  }

  ARENA.fireGap = Math.max(0, ARENA.fireGap - delta)
  ARENA.grace = Math.max(0, ARENA.grace - delta)

  for (const u of ARENA.units.values()) stepUnit(u, player.x, player.z, delta)

  const playerTop = player.crouched ? CROUCH_TOP : STAND_TOP
  const safe = player.invulnerable || ARENA.grace > 0

  for (let i = ARENA.pellets.length - 1; i >= 0; i--) {
    const p = ARENA.pellets[i]
    const steps = 2 // two half-steps, so nothing tunnels through a body
    let done = false

    for (let s = 0; s < steps && !done; s++) {
      const dt = delta / steps
      p.x += p.vx * dt
      p.z += p.vz * dt
      p.life -= dt

      if (p.side !== 'player' && !safe && p.y <= playerTop) {
        if (Math.hypot(p.x - player.x, p.z - player.z) < PLAYER_RADIUS) {
          events.playerHit = true
          land(p, true)
          done = true
          break
        }
      }

      for (const u of ARENA.units.values()) {
        if (u.out) continue
        // Your paint can catch a friend; theirs never catches their own side.
        if (p.side === u.team) continue
        if (p.y > UNIT_TOP) continue
        if (Math.hypot(p.x - u.x, p.z - u.z) > UNIT_RADIUS) continue
        u.out = true
        events.splatted.push({ id: u.id, team: u.team, by: p.side })
        land(p, true)
        done = true
        break
      }

      if (done) break
      if (p.life <= 0 || insideCover(p.x, p.z, 0.2)) {
        land(p, false)
        done = true
      }
      if (Math.hypot(p.x, p.z) > ISLAND_WALK_RADIUS) done = true
    }

    if (done) ARENA.pellets.splice(i, 1)
  }

  if (events.playerHit) ARENA.grace = GRACE

  for (let i = ARENA.splats.length - 1; i >= 0; i--) {
    ARENA.splats[i].life -= delta
    if (ARENA.splats[i].life <= 0) ARENA.splats.splice(i, 1)
  }

  return events
}
