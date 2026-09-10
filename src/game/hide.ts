/**
 * Hide and seek, played across the island in the dark.
 *
 * Two ways round. Either they hide and you go and find them with your
 * flashlight, or you hide and every one of them comes looking for you — and
 * you get fifteen seconds to be somewhere else before they start.
 *
 * Either way the whole game is one cone of light and whether somebody is
 * standing in it. Stepped once a frame by <Hide/> and read by <Npcs/>, so
 * none of it costs a React render.
 */
import { ISLAND_WALK_RADIUS, NPCS } from '../data/world'
import { resolveCollisions } from './collision'
import { STATIC_COLLIDERS, TREE_COLLIDERS } from './terrain'
import type { Vec2 } from '../types'

export type Role = 'seeker' | 'hider'

/** Everyone who plays: the islanders, minus anybody already on a night shift. */
export const PLAYERS = NPCS.filter(
  (n) => n.area === 'island' && n.shift !== 'night',
).map((n) => n.id)

export const COUNT = PLAYERS.length

/** Seconds to get out of sight before they start looking. */
export const HEAD_START = 15
/** And how long you have to stay out of sight once they do. */
export const HOLD_OUT = 90

/**
 * How close you have to get to somebody to have found them. The torch shows
 * you where they are; it does not count as finding them. You have to walk up
 * and put a hand on them.
 */
export const TOUCH = 2.4

/** Their beam, which is narrower, and much wider if you leave your own on. */
const SEARCH_ARC = 0.46
const SEARCH_REACH = 16
const LIT_ARC = 1.3
const LIT_REACH = 34

const PACE = 3.6
const PAUSE = 1.4
/** How wide they swing the torch while stood still. */
const SWEEP = 1.1

/**
 * The moment somebody's beam lands on you they stop looking and start
 * running, and they run a shade faster than you can. Speed is no way out of
 * this: the only way out is getting behind something so they lose you.
 */
const CHASE_PACE = 21.5
/** How long they keep running at where they last had eyes on you. */
const CHASE_MEMORY = 3.5
/** Down low they have to be closer before they see you at all. */
const CROUCHED = 0.62

/**
 * How near you have to be before the game gives you anything at all — and it
 * is only ever a thump, never a direction. Roughly a torch's reach, so it
 * means "one of them is inside your beam if you point it the right way".
 */
const PULSE_RANGE = 24
/** Seconds between thumps, cold and hot. */
const PULSE_SLOW = 1.5
const PULSE_FAST = 0.26

/** How far out they will wander looking, which is most of the island. */
const FIELD = 95
/**
 * Every so often one of them gets a feeling about somewhere and goes to look
 * there — which happens to be exactly where you are. It is the only thing
 * that troubles somebody sitting perfectly still in the dark.
 */
const HUNCH_EVERY = 18

/**
 * How far off you draw their attention. Walking carries; crouch-walking
 * carries much less; a lit torch in the dark carries right across the town,
 * and is the single worst thing you can do while hiding.
 */
const NOTICE_MOVING = 27
const NOTICE_CROUCHED = 12
const NOTICE_LIT = 62
/** Seconds between one of them looking up and changing their mind. */
const NOTICE_EVERY = 0.6

/**
 * Somewhere worth hiding: round the back of a building, in among the trees,
 * behind a hill or out on the dock — never in the open, and spread far
 * enough apart that finding one tells you nothing about the next.
 *
 * Anything that lands inside a wall or a tree is pushed back out at the
 * start of a game, so every one of these is somewhere you can actually
 * reach and put a hand on.
 */
export const SPOTS: Vec2[] = [
  // Round the back of each of the seven buildings
  [-62, 66],
  [18, -85],
  [90, -34],
  [60, 66],
  [-92, -22],
  [0, 105],
  [-80, -71],
  // The far side of the two hills nearest the town
  [52, -64],
  [-30, -86],
  // In the trees, well off any road
  [42, 62],
  [-44, -46],
  [70, 12],
  [-30, 66],
  [26, -52],
  // And the two the town itself offers
  [-101, 17],
  [31, 21],
]

export interface Folk {
  id: string
  x: number
  z: number
  facing: number
  /** Where they are going: their hiding place, or the next place to look. */
  toX: number
  toZ: number
  /** Seeker game: you have shone a light on this one. */
  found: boolean
  moving: boolean
  /** Seconds they stand and sweep before moving on. */
  pause: number
  /** Seconds of chase left. Above zero they are running, not looking. */
  chase: number
  /** Where they last had eyes on you, which is where they run to. */
  lastX: number
  lastZ: number
}

export const HIDE = {
  active: false,
  role: 'seeker' as Role,
  folk: [] as Folk[],
  /** Counting down before they start looking, in the hiding game. */
  headStart: 0,
  elapsed: 0,
  /** How many of them are running at you right now. */
  chasers: 0,
  /** And how far off the nearest of those is. */
  closest: 0,
  /** Seconds until somebody wanders over to where you actually are. */
  hunch: HUNCH_EVERY,
  /** Throttle on retargeting whoever has noticed you. */
  notice: 0,
  /** How far off you are giving yourself away this instant, for the HUD. */
  drawing: 0,
  /** 0 to 1: how near the closest one you have not found is. */
  warmth: 0,
  /** Bumped once per thump, so the sound and the screen agree. */
  pulse: 0,
  pulseAt: 0,
  /** Who is looking straight at you this instant. */
  seen: false,
  found: 0,
  done: false,
  won: false,
  feed: null as { text: string; kind: 'good' | 'bad'; at: number } | null,
}

function hash(n: number): number {
  const v = Math.sin(n * 57.31) * 43758.5453
  return v - Math.floor(v)
}

function shuffled<T>(list: T[]): T[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Somewhere on the field that is not inside anything. */
function clearSpot(seed: number): Vec2 {
  for (let i = 0; i < 24; i++) {
    const angle = hash(seed * 7 + i) * Math.PI * 2
    const r = 12 + hash(seed * 13 + i * 3) * (FIELD - 12)
    const x = Math.sin(angle) * r
    const z = Math.cos(angle) * r
    const clash = STATIC_COLLIDERS.some((c) =>
      c.circle
        ? Math.hypot(x - c.x, z - c.z) < c.hx + 2
        : Math.abs(x - c.x) < c.hx + 2 && Math.abs(z - c.z) < c.hz + 2,
    )
    if (!clash) return [x, z]
  }
  return [0, 24]
}

/** Nudges a hiding place out of whatever it happens to be standing inside. */
function reachable(spot: Vec2): Vec2 {
  const at: [number, number] = [spot[0], spot[1]]
  const near = TREE_COLLIDERS.filter(
    (t) => Math.abs(t.x - at[0]) < 6 && Math.abs(t.z - at[1]) < 6,
  )
  resolveCollisions(at, 1.1, [...STATIC_COLLIDERS, ...near], {
    kind: 'circle',
    radius: ISLAND_WALK_RADIUS - 3,
  })
  return at
}

export function openHide(role: Role) {
  const spots = shuffled(SPOTS).map(reachable)
  HIDE.role = role
  HIDE.folk = PLAYERS.map((id, i) => {
    const spot = spots[i % spots.length]
    // Seeking, they are already tucked away. Hiding, they start in the square
    // with their eyes shut and their backs to you.
    const at: Vec2 = role === 'seeker' ? spot : [Math.sin(i) * 6, Math.cos(i) * 6]
    return {
      id,
      x: at[0],
      z: at[1],
      facing: role === 'seeker' ? hash(i + 1) * Math.PI * 2 : Math.atan2(-at[0], -at[1]) + Math.PI,
      toX: at[0],
      toZ: at[1],
      found: false,
      moving: false,
      pause: PAUSE,
      chase: 0,
      lastX: at[0],
      lastZ: at[1],
    }
  })
  HIDE.headStart = role === 'hider' ? HEAD_START : 0
  HIDE.elapsed = 0
  HIDE.chasers = 0
  HIDE.closest = 0
  HIDE.hunch = HUNCH_EVERY
  HIDE.notice = 0
  HIDE.drawing = 0
  HIDE.warmth = 0
  HIDE.pulse = 0
  HIDE.pulseAt = 0
  HIDE.seen = false
  HIDE.found = 0
  HIDE.done = false
  HIDE.won = false
  HIDE.feed = null
  HIDE.active = true
}

export function closeHide() {
  HIDE.active = false
  HIDE.folk = []
}

/** True while a wall stands between two points. */
function blocked(ax: number, az: number, bx: number, bz: number): boolean {
  const dist = Math.hypot(bx - ax, bz - az)
  const steps = Math.max(2, Math.round(dist / 3))
  for (let i = 1; i < steps; i++) {
    const t = i / steps
    const x = ax + (bx - ax) * t
    const z = az + (bz - az) * t
    for (const c of STATIC_COLLIDERS) {
      if (c.circle) {
        if (Math.hypot(x - c.x, z - c.z) < c.hx) return true
      } else if (Math.abs(x - c.x) < c.hx && Math.abs(z - c.z) < c.hz) {
        return true
      }
    }
  }
  return false
}

/** True if a cone from here, pointing that way, covers that spot. */
function inBeam(
  fromX: number,
  fromZ: number,
  facing: number,
  toX: number,
  toZ: number,
  arc: number,
  reach: number,
): boolean {
  const dx = toX - fromX
  const dz = toZ - fromZ
  const range = Math.hypot(dx, dz)
  if (range > reach) return false
  let off = Math.atan2(dx, dz) - facing
  while (off > Math.PI) off -= Math.PI * 2
  while (off < -Math.PI) off += Math.PI * 2
  if (Math.abs(off) > arc) return false
  return !blocked(fromX, fromZ, toX, toZ)
}

/** The nearest one you have not found yet, for the arrow and the HUD. */
export function nearestHidden(x: number, z: number): { folk: Folk; distance: number } | null {
  let best: Folk | null = null
  let bestDist = Infinity
  for (const f of HIDE.folk) {
    if (f.found) continue
    const d = Math.hypot(f.x - x, f.z - z)
    if (d < bestDist) {
      best = f
      bestDist = d
    }
  }
  return best ? { folk: best, distance: bestDist } : null
}

/* -------------------------------- the frame ------------------------------- */

export interface HidePlayer {
  x: number
  z: number
  /** Which way he is pointing the torch. */
  facing: number
  crouched: boolean
  /** Whether the torch is lit at all. */
  lit: boolean
  /** On his feet and going somewhere, which they will notice. */
  moving: boolean
}

export interface HideEvents {
  /** Islanders found this frame. */
  found: number
  /** A proximity thump went off this frame. */
  pulsed: boolean
  /** The searchers have just been let off the leash. */
  started: boolean
  finished: boolean
  won: boolean
}

export function stepHide(delta: number, player: HidePlayer): HideEvents {
  const events: HideEvents = {
    found: 0,
    pulsed: false,
    started: false,
    finished: false,
    won: false,
  }
  if (!HIDE.active || HIDE.done) return events

  HIDE.elapsed += delta

  if (HIDE.headStart > 0) {
    const was = HIDE.headStart
    HIDE.headStart = Math.max(0, HIDE.headStart - delta)
    if (was > 0 && HIDE.headStart === 0) events.started = true
  }

  /* ------------------------------- seeking ------------------------------ */

  if (HIDE.role === 'seeker') {
    // They stay put. Your beam is the only thing that happens.
    for (const f of HIDE.folk) {
      f.moving = false
      if (f.found) continue
      // A light on somebody is not finding them. You have to reach them.
      if (Math.hypot(f.x - player.x, f.z - player.z) < TOUCH) {
        f.found = true
        HIDE.found++
        events.found++
        HIDE.feed = {
          text: `Found — ${COUNT - HIDE.found} still out there`,
          kind: 'good',
          at: Date.now(),
        }
      }
    }
    // Nothing says where anybody is. All you get is a thump that comes
    // quicker the nearer you are to somebody — no direction in it at all.
    const near = nearestHidden(player.x, player.z)
    HIDE.warmth =
      near && near.distance < PULSE_RANGE
        ? Math.max(0, Math.min(1, 1 - (near.distance - TOUCH) / (PULSE_RANGE - TOUCH)))
        : 0

    HIDE.pulseAt -= delta
    if (HIDE.warmth > 0 && HIDE.pulseAt <= 0) {
      HIDE.pulse++
      HIDE.pulseAt = PULSE_SLOW - (PULSE_SLOW - PULSE_FAST) * HIDE.warmth
      events.pulsed = true
    }

    if (HIDE.found >= COUNT) {
      HIDE.done = true
      HIDE.won = true
      events.finished = true
      events.won = true
    }
    return events
  }

  /* -------------------------------- hiding ------------------------------ */

  const searching = HIDE.headStart <= 0

  // Who has eyes on you this instant. Anybody who does stops looking and
  // starts running, and keeps running at where they last saw you for a few
  // seconds after they lose you.
  const arc = player.lit ? LIT_ARC : SEARCH_ARC
  let reach = player.lit ? LIT_REACH : SEARCH_REACH
  if (player.crouched) reach *= CROUCHED

  let seen = false
  let chasers = 0
  let closest = Infinity

  for (const f of HIDE.folk) {
    f.moving = false
    if (!searching) {
      // Counting, with their backs turned.
      continue
    }

    if (inBeam(f.x, f.z, f.facing, player.x, player.z, arc, reach)) {
      if (f.chase <= 0) {
        HIDE.feed = { text: 'Somebody has seen you.', kind: 'bad', at: Date.now() }
      }
      f.chase = CHASE_MEMORY
      f.lastX = player.x
      f.lastZ = player.z
      seen = true
    } else {
      f.chase = Math.max(0, f.chase - delta)
    }

    const hunting = f.chase > 0
    if (hunting) {
      chasers++
      closest = Math.min(closest, Math.hypot(f.x - player.x, f.z - player.z))
    }

    const dx = (hunting ? f.lastX : f.toX) - f.x
    const dz = (hunting ? f.lastZ : f.toZ) - f.z
    const gap = Math.hypot(dx, dz)

    if (gap > 1) {
      const step = Math.min(gap, (hunting ? CHASE_PACE : PACE) * delta)
      const to: [number, number] = [
        f.x + (dx / gap) * step,
        f.z + (dz / gap) * step,
      ]
      // Round the buildings rather than through them, so getting something
      // solid between you and them is worth doing.
      resolveCollisions(to, 0.6, STATIC_COLLIDERS, {
        kind: 'circle',
        radius: ISLAND_WALK_RADIUS - 4,
      })
      f.x = to[0]
      f.z = to[1]
      f.facing = Math.atan2(dx / gap, dz / gap)
      f.moving = true
      f.pause = PAUSE
    } else if (hunting) {
      // Got to where you were and you are not there. Look about.
      f.facing += Math.sin(HIDE.elapsed * 3 + f.x) * SWEEP * 2 * delta
    } else {
      // Stand and sweep the torch, then pick somewhere else to look.
      f.pause -= delta
      f.facing += Math.sin(HIDE.elapsed * 1.6 + f.x) * SWEEP * delta
      if (f.pause <= 0) {
        const next = clearSpot(HIDE.elapsed * 13 + f.x + f.z)
        f.toX = next[0]
        f.toZ = next[1]
        f.pause = PAUSE
      }
    }

    // Nobody wanders off the island looking for you.
    const out = Math.hypot(f.x, f.z)
    if (out > ISLAND_WALK_RADIUS - 6) {
      f.x = (f.x / out) * (ISLAND_WALK_RADIUS - 6)
      f.z = (f.z / out) * (ISLAND_WALK_RADIUS - 6)
    }
  }

  /* --------------------------- giving yourself away --------------------- */

  if (searching) {
    // Whatever you are doing, they notice it from somewhere. A lit torch is
    // seen right across the town; walking is heard from a good way; crouched
    // and moving is nearly nothing; still and dark is nothing at all.
    HIDE.drawing = player.lit
      ? NOTICE_LIT
      : player.moving
        ? player.crouched
          ? NOTICE_CROUCHED
          : NOTICE_MOVING
        : 0

    HIDE.notice -= delta
    if (HIDE.drawing > 0 && HIDE.notice <= 0) {
      HIDE.notice = NOTICE_EVERY
      for (const f of HIDE.folk) {
        if (Math.hypot(f.x - player.x, f.z - player.z) > HIDE.drawing) continue
        f.toX = player.x
        f.toZ = player.z
        f.pause = 0
      }
    }

    // And somebody gets a feeling now and then anyway, which is the only
    // thing that troubles a man sitting perfectly still on the far shore.
    HIDE.hunch -= delta
    if (HIDE.hunch <= 0) {
      HIDE.hunch = HUNCH_EVERY
      let nearest: Folk | null = null
      let best = Infinity
      for (const f of HIDE.folk) {
        const d = Math.hypot(f.x - player.x, f.z - player.z)
        if (d < best) {
          best = d
          nearest = f
        }
      }
      if (nearest) {
        nearest.toX = player.x
        nearest.toZ = player.z
        nearest.pause = 0
      }
    }
  }
  HIDE.seen = seen
  HIDE.chasers = chasers
  HIDE.closest = closest === Infinity ? 0 : closest

  // Seeing you is not catching you. Somebody has to get a hand on you, which
  // is the same rule you play by when it is the other way round.
  const caught = searching && HIDE.folk.some(
    (f) => Math.hypot(f.x - player.x, f.z - player.z) < TOUCH,
  )

  if (caught) {
    HIDE.done = true
    HIDE.won = false
    events.finished = true
    HIDE.feed = { text: 'Caught.', kind: 'bad', at: Date.now() }
  } else if (searching && HIDE.elapsed - HEAD_START >= HOLD_OUT) {
    HIDE.done = true
    HIDE.won = true
    events.finished = true
    events.won = true
  }

  return events
}
