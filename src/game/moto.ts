/**
 * The Island Circuit: three laps of the ring road, against three islanders
 * who know it rather better than you do.
 *
 * Like the paintball arena this is plain state stepped once per frame, so a
 * race never costs a React render. The bike is simulated properly — throttle,
 * grip, walls, trees — while the three rivals are driven along the racing
 * line by arc length, which keeps them on the tarmac and out of the ditch
 * without a physics solver apiece.
 */
import { BUILDINGS, CIRCUIT, ISLAND_WALK_RADIUS, NPCS } from '../data/world'
import { ACTOR_POS, REACTIONS, ageReactions } from './actors'
import { resolveCollisions } from './collision'
import {
  FENCE_COLLIDERS,
  LAMPS,
  STATIC_COLLIDERS,
  TREE_COLLIDERS,
} from './terrain'
import type { Collider } from './terrain'

/* -------------------------------- handling -------------------------------- */

export const MAX_SPEED = 36
const REVERSE_SPEED = 8
const ACCEL = 17
const BRAKE = 30
/** Fraction of speed shed per second with the throttle shut. */
const DRAG = 0.55
const TURN = 2.1
/** Nose-up limit of a wheelie. It scores nothing; it just looks good. */
const WHEELIE_MAX = 0.8
/** How far the bike lays over in a full-lock corner, in radians. */
export const MAX_ROLL = 0.5
const BIKE_RADIUS = 0.9

/** Half the width of the tarmac, plus the bit of verge you can get away with. */
export const ROAD_HALF = 3.4
/** Everything off the road is grass: it drags, and it will not let you fly. */
const GRASS_SPEED = MAX_SPEED * 0.62
const GRASS_DRAG = 1

/** How close two bikes get before they are touching. */
const CONTACT = 1.9
/** Sitting in the hole the bike in front punches in the air is worth this. */
const TOW_REACH = 12
const TOW_GAIN = 0.24

/* -------------------------------- the track ------------------------------- */

/** Lap counts you can put on the board, and the one it opens on. */
export const LAP_CHOICES = [1, 3, 5]
export const LAPS = 3
/** Seconds on the lights before the flag drops. */
export const COUNTDOWN = 3

/* ------------------------------- difficulty ------------------------------- */

export type Difficulty = 'easy' | 'normal' | 'hard'

export interface Grade {
  id: Difficulty
  label: string
  blurb: string
  /** One, two or three: what the meter on the briefing card fills in to. */
  rank: 1 | 2 | 3
  /** The colour it is picked out in, the way each rival has a bike colour. */
  tint: string
  /** Scales every rival's top speed and their share of a corner's limit. */
  pace: number
  nerve: number
  /**
   * How far up the road they read when deciding what to brake for, as a
   * multiple of a second's travel. This is the knob that actually decides
   * whether a rival is quick: pace and nerve both cap at the tarmac's own
   * limit, and no amount of either gets a bike round the island quickly if
   * it starts shedding speed fifty metres before the corner.
   */
  brake: number
  /** How hard the field elastics back towards you. Nothing waits on hard. */
  elastic: number
}

export const GRADES: Grade[] = [
  {
    id: 'easy',
    rank: 1,
    tint: '#2f9e5f',
    label: 'Sunday ride',
    blurb: 'They are out for the air, and they will wait for you.',
    pace: 0.82,
    nerve: 0.88,
    brake: 1.5,
    elastic: 1.3,
  },
  {
    id: 'normal',
    rank: 2,
    tint: '#3f7bd6',
    label: 'Club race',
    blurb: 'A real race, and a mistake still costs you a place.',
    pace: 1,
    nerve: 1,
    brake: 1.1,
    elastic: 1,
  },
  {
    id: 'hard',
    rank: 3,
    tint: '#e8442f',
    label: 'Island Trophy',
    blurb: 'They brake where you would have crashed. Nobody waits.',
    pace: 1.1,
    /**
     * Over 1, which means the leader carries about a sixth more through a
     * corner than the line nominally allows. That is the whole reason this
     * grade is quick: pace saturates once nerve is high, and the braking
     * distance is worth barely a second over its entire useful range.
     * Calibrated so Nikos takes the standard three laps in 43.0s.
     */
    nerve: 1.22,
    brake: 0.38,
    elastic: 0,
  },
]

export const GRADE_BY_ID = new Map(GRADES.map((g) => [g.id, g]))
export const gradeOf = (id: Difficulty) => GRADE_BY_ID.get(id) ?? GRADES[1]

/**
 * The circuit is cut into sectors and you have to pass through them in order,
 * so the lap only counts if you actually went round. Six is enough that no
 * shortcut across the middle of the island can skip fewer than two of them.
 */
const SECTORS = 6

interface Leg {
  ax: number
  az: number
  /** Unit vector along the leg. */
  dx: number
  dz: number
  length: number
  /** Distance from the start line to the beginning of this leg. */
  at: number
  heading: number
  /** How hard the circuit turns at the end of this leg, in radians. */
  turn: number
  /** The speed that corner can be taken at. */
  limit: number
}

const LEGS: Leg[] = (() => {
  const n = CIRCUIT.length
  const legs: Leg[] = []
  let at = 0
  for (let i = 0; i < n; i++) {
    const [ax, az] = CIRCUIT[i]
    const [bx, bz] = CIRCUIT[(i + 1) % n]
    const dx = bx - ax
    const dz = bz - az
    const length = Math.hypot(dx, dz)
    legs.push({
      ax,
      az,
      dx: dx / length,
      dz: dz / length,
      length,
      at,
      heading: Math.atan2(dx, dz),
      turn: 0,
      limit: MAX_SPEED,
    })
    at += length
  }
  // The corner at the end of each leg is the swing onto the next one.
  for (let i = 0; i < n; i++) {
    let swing = legs[(i + 1) % n].heading - legs[i].heading
    while (swing > Math.PI) swing -= Math.PI * 2
    while (swing < -Math.PI) swing += Math.PI * 2
    legs[i].turn = Math.abs(swing)
    // A gentle bend costs nothing; the hard ones have to be braked for.
    legs[i].limit = MAX_SPEED * Math.max(0.7, 1 - legs[i].turn * 0.5)
  }
  return legs
})()

export const LAP_LENGTH = LEGS.reduce((sum, leg) => sum + leg.length, 0)
const SECTOR_LENGTH = LAP_LENGTH / SECTORS

const wrap = (distance: number) =>
  ((distance % LAP_LENGTH) + LAP_LENGTH) % LAP_LENGTH

/** Where you are on the line, that far round from the start. */
export function pointAt(distance: number): {
  x: number
  z: number
  heading: number
  leg: number
} {
  const d = wrap(distance)
  let i = LEGS.length - 1
  while (i > 0 && LEGS[i].at > d) i--
  const leg = LEGS[i]
  const along = d - leg.at
  return {
    x: leg.ax + leg.dx * along,
    z: leg.az + leg.dz * along,
    heading: leg.heading,
    leg: i,
  }
}

/** The nearest point of the line to somewhere out in the world. */
export function project(
  x: number,
  z: number,
): {
  /** How far round the lap that point is. */
  progress: number
  /** How far off the middle of the road, whichever side. */
  gap: number
  /** The same, signed: positive is the outside of the loop. */
  side: number
} {
  let best = Infinity
  let progress = 0
  let side = 0
  for (const leg of LEGS) {
    const px = x - leg.ax
    const pz = z - leg.az
    const along = Math.max(0, Math.min(leg.length, px * leg.dx + pz * leg.dz))
    const gap = Math.hypot(px - leg.dx * along, pz - leg.dz * along)
    if (gap < best) {
      best = gap
      progress = leg.at + along
      side = px * leg.dz - pz * leg.dx
    }
  }
  return { progress, gap: best, side }
}

/** The slowest corner inside that reach, which is what a rival brakes for. */
function limitAhead(from: number, reach: number): number {
  let limit = MAX_SPEED
  let i = pointAt(from).leg
  let seen = LEGS[i].at + LEGS[i].length - wrap(from)
  for (let step = 0; step < LEGS.length; step++) {
    limit = Math.min(limit, LEGS[i].limit)
    if (seen > reach) break
    i = (i + 1) % LEGS.length
    seen += LEGS[i].length
  }
  return limit
}

/* ------------------------------- the crowd -------------------------------- */

/**
 * Islanders out to watch, and the steel that lets them. They stand off the
 * inside verge — the outside of the loop is marker boards and then the sea —
 * behind a run of barrier, which is why they can stand there and cheer at a
 * bike doing thirty-six metres a second instead of running for their lives.
 */

export interface Spectator {
  x: number
  z: number
  facing: number
  /** Phase offset, so a crowd does not wave in time with itself. */
  seed: number
  shirt: string
}

/** A run of crash barrier along the verge, in front of a knot of them. */
export interface Barrier {
  x: number
  z: number
  /** Along the road, so the rail lies parallel to it. */
  heading: number
  length: number
}

/** How far off the middle of the road the steel stands. */
const BARRIER_OFF = ROAD_HALF + 2.1
/** Length of one panel of it. */
const PANEL = 3.6
export const BARRIER_HEIGHT = 1.05

const SHIRTS = [
  '#e8442f',
  '#3f7bd6',
  '#2fb59a',
  '#e5b32b',
  '#c2566f',
  '#7a5bb5',
]

/** Somewhere nobody could actually be standing. */
const occupied = (x: number, z: number) =>
  BUILDINGS.some(
    (b) =>
      Math.abs(x - b.position[0]) < b.half[0] + 2 &&
      Math.abs(z - b.position[1]) < b.half[1] + 2,
  ) ||
  LAMPS.some(([lx, lz]) => Math.hypot(x - lx, z - lz) < 1.2) ||
  TREE_COLLIDERS.some((t) => Math.hypot(x - t.x, z - t.z) < 1.4)

const CROWD_BUILD = (() => {
  const people: Spectator[] = []
  const rails: Barrier[] = []
  /** Metres of track between one knot of people and the next. */
  const step = 34
  let n = 0
  for (let d = 0; d < LAP_LENGTH; d += step) {
    // A proper crowd on the start line, knots of three everywhere else.
    const size = d < step ? 6 : 3
    const before = people.length
    for (let i = 0; i < size; i++) {
      const here = pointAt(d + (i - (size - 1) / 2) * 2.4)
      const r = Math.hypot(here.x, here.z) || 1
      // Towards the middle of the island is the inside of the loop.
      const inX = -here.x / r
      const inZ = -here.z / r
      // Their spot is however far back off the verge they have to stand to
      // be out of a lamp post or a tree; a few of them have no room at all,
      // and those simply did not come.
      const first = BARRIER_OFF + 1.6 + (n % 3) * 1.1
      let x = 0
      let z = 0
      let room = false
      for (let back = first; back < ROAD_HALF + 11; back += 1.1) {
        x = here.x + inX * back
        z = here.z + inZ * back
        if (!occupied(x, z)) {
          room = true
          break
        }
      }
      n++
      if (!room) continue
      people.push({
        x,
        z,
        facing: Math.atan2(-inX, -inZ),
        seed: n * 1.7,
        shirt: SHIRTS[n % SHIRTS.length],
      })
    }

    // Steel in front of whoever turned up, and none where nobody did.
    //
    // Short panels laid end to end round the curve rather than one long
    // straight run: a ten-metre chord on the inside of a corner bows its ends
    // into the road, and the ends were the only part anybody ever hit.
    if (people.length > before) {
      const span = size * 2.4 + 3.4
      const panels = Math.max(1, Math.round(span / PANEL))
      const each = span / panels
      for (let k = 0; k < panels; k++) {
        const p = pointAt(d + (k - (panels - 1) / 2) * each)
        const r = Math.hypot(p.x, p.z) || 1
        rails.push({
          x: p.x - (p.x / r) * BARRIER_OFF,
          z: p.z - (p.z / r) * BARRIER_OFF,
          heading: p.heading,
          // A shade of overlap, so the run reads as one rail and not as
          // a dotted line with gaps to fall through.
          length: each + 0.3,
        })
      }
    }
  }
  return { people, rails }
})()

export const CROWD: Spectator[] = CROWD_BUILD.people
export const BARRIERS: Barrier[] = CROWD_BUILD.rails

/**
 * The steel, as things to hit — turned to lie along the road exactly as the
 * rail you can see does. Snapping these to the nearest axis put three of the
 * thirteen flat across the racing line as ten-metre invisible walls.
 */
const BARRIER_COLLIDERS: Collider[] = BARRIERS.map((rail) => ({
  x: rail.x,
  z: rail.z,
  hx: 0.16,
  hz: rail.length / 2,
  rotation: rail.heading,
}))

/* -------------------------------- the grid -------------------------------- */

const NPC_BY_ID = new Map(NPCS.map((n) => [n.id, n]))

export interface RivalKit {
  id: string
  /** Frame colour, so four bikes are never one bike. */
  bike: string
  /** Top speed, as a fraction of the bike's. */
  pace: number
  /** How late they leave the braking. */
  nerve: number
  /** Where they sit across the road, in metres off the middle. */
  line: number
}

/**
 * One of each, so the race has a shape: somebody to beat, somebody to have a
 * fight with, and somebody to get past on the first lap.
 *
 * Nikos runs this loop most mornings and cycles it on Sundays — quick
 * everywhere and untidy nowhere, and the one you have to ride properly to
 * take. The Sergeant has a fast bike and brakes earlier than he needs to, so
 * he is the fight. Marina has the slowest of the three and rides it within
 * herself: the pass you make on the first lap.
 *
 * `pace` caps the top speed and `nerve` is how much of a corner's limit they
 * will use, and BOTH have to fall together for a rival to actually be slower.
 * Marina used to be the one who never braked — a slow bike ridden bravely —
 * and her nerve bought back every metre her pace gave away: she and the
 * Sergeant finished a three-lap race two metres apart. A rider is only as
 * easy as their weaker number.
 */
export const RIVALS: RivalKit[] = [
  { id: 'runner', bike: '#2f9e5f', pace: 0.94, nerve: 0.95, line: -1.5 },
  { id: 'sergeant', bike: '#3f7bd6', pace: 0.86, nerve: 0.85, line: 1.5 },
  { id: 'studentrep', bike: '#e5b32b', pace: 0.7, nerve: 0.74, line: 0 },
]

export const racerName = (id: string) =>
  id === 'player' ? 'You' : (NPC_BY_ID.get(id)?.name ?? 'Someone')

export const racerColors = (id: string) => NPC_BY_ID.get(id)?.colors

/** Grid slots, nose to tail behind the line: pole first, you at the back. */
const GRID: { at: number; side: number }[] = [
  { at: 20, side: -1.5 },
  { at: 14, side: 1.5 },
  { at: 8, side: -1.5 },
  { at: 2, side: 1.5 },
]

const PLAYER_SLOT = GRID[GRID.length - 1]

/** Where the bike waits for the lights. */
export const MOTO_START = (() => {
  const spot = pointAt(PLAYER_SLOT.at)
  return {
    x: spot.x + Math.cos(spot.heading) * PLAYER_SLOT.side,
    z: spot.z - Math.sin(spot.heading) * PLAYER_SLOT.side,
    heading: spot.heading,
  }
})()

/* -------------------------------- the race -------------------------------- */

export interface Rival {
  id: string
  bike: string
  pace: number
  nerve: number
  line: number
  /** Pulled out of the line to pass, or back into it afterwards. */
  drift: number
  x: number
  z: number
  heading: number
  roll: number
  wheel: number
  speed: number
  /** How far round this lap, and which lap of the three. */
  progress: number
  lap: number
  finished: boolean
  /** Their finishing time, once they are done. */
  time: number
}

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
  /** Seconds left on the lights; the race is under way at zero. */
  countdown: COUNTDOWN,
  /** Which lap you are on, one to LAPS. */
  lap: 1,
  /** The sector you have to pass through next for the lap to count. */
  gate: 1,
  /** How far round the lap you are, and how far off the road with it. */
  progress: 0,
  lateral: 0,
  /** The same, signed, so the others know which way to go round you. */
  side: 0,
  offRoad: false,
  /** How much of a tow the bike in front is giving you, nought to one. */
  tow: 0,
  /** Leaning on somebody right now, so a shunt is not reported twice. */
  touching: false,
  /** Where you are running, one to four, live. */
  place: GRID.length,
  /** Seconds since the flag dropped. */
  elapsed: 0,
  /** Your best lap, and the one running. */
  lapTime: 0,
  best: 0,
  rivals: [] as Rival[],
  /** Up against something and still leaning on it, as opposed to hitting it. */
  scraping: false,
  /** How long this race is, and how hard, chosen at the briefing. */
  laps: LAPS,
  grade: GRADES[1],
  /** Set when your last lap is in. */
  done: false,
  /** Where you came, once it is. */
  finish: 0,
}

export function openRide(
  laps: number = LAPS,
  difficulty: Difficulty = 'normal',
) {
  MOTO.laps = Math.max(1, Math.round(laps))
  MOTO.grade = gradeOf(difficulty)
  MOTO.x = MOTO_START.x
  MOTO.z = MOTO_START.z
  MOTO.heading = MOTO_START.heading
  MOTO.speed = 0
  MOTO.pitch = 0
  MOTO.roll = 0
  MOTO.wheelie = 0
  MOTO.wheel = 0
  MOTO.countdown = COUNTDOWN
  MOTO.lap = 1
  MOTO.gate = 1
  MOTO.progress = PLAYER_SLOT.at
  MOTO.lateral = Math.abs(PLAYER_SLOT.side)
  MOTO.side = PLAYER_SLOT.side
  MOTO.offRoad = false
  MOTO.tow = 0
  MOTO.touching = false
  MOTO.scraping = false
  MOTO.place = GRID.length
  MOTO.elapsed = 0
  MOTO.lapTime = 0
  MOTO.best = 0
  MOTO.done = false
  MOTO.finish = 0
  MOTO.rivals = RIVALS.map((kit, i) => {
    const slot = GRID[i]
    const spot = pointAt(slot.at)
    return {
      ...kit,
      pace: kit.pace * MOTO.grade.pace,
      nerve: kit.nerve * MOTO.grade.nerve,
      x: spot.x + Math.cos(spot.heading) * slot.side,
      z: spot.z - Math.sin(spot.heading) * slot.side,
      heading: spot.heading,
      drift: 0,
      roll: 0,
      wheel: 0,
      speed: 0,
      progress: slot.at,
      lap: 1,
      finished: false,
      time: 0,
    }
  })
  MOTO.active = true
  REACTIONS.clear()
}

export function closeRide() {
  MOTO.active = false
  REACTIONS.clear()
}

/** Everybody in the race, in the order they are running. */
export function standings(): { id: string; lap: number; gap: number }[] {
  const key = (lap: number, progress: number) => lap * LAP_LENGTH + progress
  const all = [
    { id: 'player', lap: MOTO.lap, at: key(MOTO.lap, MOTO.progress) },
    ...MOTO.rivals.map((r) => ({
      id: r.id,
      lap: r.lap,
      at: key(r.lap, r.progress),
    })),
  ]
  all.sort((a, b) => b.at - a.at)
  return all.map((entry) => ({
    id: entry.id,
    lap: entry.lap,
    gap: all[0].at - entry.at,
  }))
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
  /** A second went off the lights, or the flag dropped this frame. */
  light: boolean
  green: boolean
  /** You crossed the line and started another lap. */
  lap: number
  /** Your last lap is in. */
  finished: boolean
  /** Put a wheel wrong at speed. */
  bumped: boolean
}

/* ----------------------------- the bystanders ----------------------------- */

/**
 * Everyone who is not behind a barrier. An islander going about their day
 * with a motorcycle coming at them gets out of the way, using the same
 * fright the water bombs use — <Npcs/> already knows how to run from a point,
 * and a bike is only a point that moves.
 */

/** How close a bike gets before somebody standing in the open takes fright. */
const STARTLE = 9
/** Seconds they stay startled, so they keep running as the bike goes past. */
const STARTLE_TIME = 1.6

/**
 * Everyone on the island who is not on the grid. The three rivals are still
 * drawn standing at their posts while their bikes are out on the lap, and
 * frightening a man with his own motorcycle would be one oddity too many.
 */
const IN_THE_OPEN = NPCS.filter(
  (n) => n.area === 'island' && !RIVALS.some((r) => r.id === n.id),
).map((n) => n.id)

function scareBystanders() {
  for (const id of IN_THE_OPEN) {
    const at = ACTOR_POS.get(id)
    if (!at) continue

    let close = Math.hypot(MOTO.x - at.x, MOTO.z - at.z)
    let fromX = MOTO.x
    let fromZ = MOTO.z
    for (const rival of MOTO.rivals) {
      const d = Math.hypot(rival.x - at.x, rival.z - at.z)
      if (d < close) {
        close = d
        fromX = rival.x
        fromZ = rival.z
      }
    }
    if (close > STARTLE) continue

    // Cheering wins if a balloon has just showered them; nothing else does.
    const already = REACTIONS.get(id)
    if (already && already.kind === 'cheer') continue
    REACTIONS.set(id, {
      kind: 'fright',
      left: STARTLE_TIME,
      x: fromX,
      z: fromZ,
    })
  }
}

/**
 * Colliders near the bike; the tree list is far too long to walk in full.
 *
 * The garden fence is in here whole — it is five boxes, and the corner of it
 * that stands in the road is on the fastest part of the lap, so a bike has to
 * go round it the way everything else on the island does.
 */
function nearby(x: number, z: number): Collider[] {
  const out: Collider[] = [...STATIC_COLLIDERS, ...FENCE_COLLIDERS]
  for (const b of BARRIER_COLLIDERS) {
    if (Math.abs(b.x - x) < 6 && Math.abs(b.z - z) < 6) out.push(b)
  }
  for (const t of TREE_COLLIDERS) {
    if (Math.abs(t.x - x) < 4 && Math.abs(t.z - z) < 4) out.push(t)
  }
  return out
}

/**
 * Bike against bike. The other three are not trees: a bump moves the pair of
 * you across the road and costs the one doing the barging a little speed,
 * rather than stopping it dead. Being unable to lean on somebody through a
 * corner is what made the old version unraceable from the back of the grid.
 */
function jostle(): boolean {
  let touched = false
  for (const rival of MOTO.rivals) {
    const dx = MOTO.x - rival.x
    const dz = MOTO.z - rival.z
    const gap = Math.hypot(dx, dz)
    if (gap > CONTACT || gap < 0.001) continue
    touched = true

    const nx = dx / gap
    const nz = dz / gap
    const push = (CONTACT - gap) * 0.55
    MOTO.x += nx * push
    MOTO.z += nz * push

    // They give ground as readily as you do: the shove goes into their line.
    const across = nx * Math.cos(rival.heading) - nz * Math.sin(rival.heading)
    rival.drift = Math.max(
      -2.4,
      Math.min(2.4, rival.drift - Math.sign(across) * push * 1.2),
    )

    // Only a genuine rear-end costs anything, and it costs a fraction of the
    // closing speed rather than half the bike's.
    const closing = MOTO.speed - rival.speed
    if (closing > 5) MOTO.speed -= Math.min(closing * 0.3, MOTO.speed * 0.16)
  }
  return touched
}

/** How much of a tow the bike in front is giving you, nought to one. */
function slipstream(): number {
  let tow = 0
  for (const rival of MOTO.rivals) {
    const dx = rival.x - MOTO.x
    const dz = rival.z - MOTO.z
    const gap = Math.hypot(dx, dz)
    if (gap > TOW_REACH || gap < 1.2) continue
    // Straight up the road from you, not alongside and not behind.
    const forward =
      (dx * Math.sin(MOTO.heading) + dz * Math.cos(MOTO.heading)) / gap
    if (forward < 0.8) continue
    tow = Math.max(tow, 1 - gap / TOW_REACH)
  }
  return tow
}

/**
 * A rival rides the line rather than the road: their distance round the lap
 * is the thing being simulated, and where they physically are follows from
 * it. They brake for what is coming, they hold a line a little off the middle
 * so four bikes are not one bike, and they keep half an eye on where you are.
 */
/**
 * Whatever is directly up the road from a rival, if anything is: the arc they
 * would close on it, and how fast it is going. Both the other two and you
 * count, which is what makes sitting in front of one of them worth doing.
 */
function trafficAhead(
  rival: Rival,
): { gap: number; speed: number; side: number } | null {
  let best: { gap: number; speed: number; side: number } | null = null
  const ahead = (at: number) => {
    const d = at - rival.progress
    return d < -LAP_LENGTH / 2 ? d + LAP_LENGTH : d
  }
  const consider = (at: number, side: number, speed: number) => {
    const gap = ahead(at)
    if (gap <= 0 || gap > 9) return
    if (Math.abs(side - rival.line) > 2.3) return
    if (!best || gap < best.gap) best = { gap, speed, side }
  }
  consider(MOTO.progress, MOTO.side, MOTO.speed)
  for (const other of MOTO.rivals) {
    if (other !== rival) consider(other.progress, other.line, other.speed)
  }
  return best
}

function stepRival(rival: Rival, delta: number, playerAt: number) {
  if (MOTO.countdown > 0) return

  // How far up the road they read. Reading further is braking earlier, so
  // this runs the other way from bravery: it used to be scaled by nerve,
  // which had the quickest rider looking the furthest ahead and lifting
  // soonest — the opposite of what nerve is documented to mean.
  const reach = 10 + rival.speed * 1.1 * MOTO.grade.brake
  let target = Math.min(
    MAX_SPEED * rival.pace,
    limitAhead(rival.progress, reach) * rival.nerve,
  )

  // Elastic, and it pulls harder towards you than away: dropping the race on
  // one bad corner is no fun, and neither is a procession once you are past.
  // Turned off entirely at the top grade, where the point is the clock.
  const stretch = MOTO.grade.elastic
  if (stretch > 0) {
    const gap = playerAt - (rival.lap * LAP_LENGTH + rival.progress)
    target *=
      1 +
      Math.max(-0.12 * stretch, Math.min(0.08 * stretch, (gap / 200) * stretch))
  }

  // Somebody quicker on the back wheel: move over. These are islanders on a
  // Sunday, not a field that blocks — the pass has to be there to be taken.
  let onYou = rival.progress - MOTO.progress
  if (onYou > LAP_LENGTH / 2) onYou -= LAP_LENGTH
  if (onYou < -LAP_LENGTH / 2) onYou += LAP_LENGTH
  const yielding =
    onYou > 0 && onYou < 11 && MOTO.speed > rival.speed - 1
      ? -Math.sign(MOTO.side || 1) * 1.9
      : null

  // Somebody in the way: back off the throttle and pull out to go round.
  const block = trafficAhead(rival)
  if (yielding !== null) {
    rival.drift += (yielding - rival.drift) * Math.min(1, delta * 2.4)
  } else if (block) {
    const closing = 1 - Math.max(0, Math.min(1, (block.gap - 2.5) / 6.5))
    target = Math.min(target, block.speed + (1 - closing) * 9)
    const room = block.side > 0 ? -1 : 1
    rival.drift += (room * 1.6 - rival.drift) * Math.min(1, delta * 1.6)
  } else {
    rival.drift += (0 - rival.drift) * Math.min(1, delta * 0.9)
  }

  const rate = target > rival.speed ? ACCEL * 0.85 : BRAKE
  rival.speed += Math.max(
    -rate * delta,
    Math.min(rate * delta, target - rival.speed),
  )

  if (rival.finished) {
    // Past the flag they roll it off rather than stopping dead on the road.
    rival.speed = Math.max(6, rival.speed - 6 * delta)
  }

  rival.progress += rival.speed * delta
  if (rival.progress >= LAP_LENGTH) {
    rival.progress -= LAP_LENGTH
    rival.lap++
    if (rival.lap > MOTO.laps && !rival.finished) {
      rival.finished = true
      rival.time = MOTO.elapsed
    }
  }

  // The line they hold drifts a little, which reads as a rider working.
  const side = rival.line + rival.drift + Math.sin(rival.progress * 0.035) * 0.6
  const spot = pointAt(rival.progress)
  rival.x = spot.x + Math.cos(spot.heading) * side
  rival.z = spot.z - Math.sin(spot.heading) * side

  let swing = spot.heading - rival.heading
  while (swing > Math.PI) swing -= Math.PI * 2
  while (swing < -Math.PI) swing += Math.PI * 2
  rival.heading += swing * Math.min(1, delta * 8)
  // Lean with the corner, and harder the faster it is being taken.
  const lean =
    (swing / Math.max(delta, 0.001)) * 0.13 * (rival.speed / MAX_SPEED)
  rival.roll +=
    (Math.max(-0.6, Math.min(0.6, lean)) - rival.roll) * Math.min(1, delta * 5)
  rival.wheel += rival.speed * delta * 1.6
}

export function stepMoto(delta: number, input: MotoInput): MotoEvents {
  const events: MotoEvents = {
    light: false,
    green: false,
    lap: 0,
    finished: false,
    bumped: false,
  }
  if (!MOTO.active || MOTO.done) return events

  // Anybody out in the open gets out of the way; the crowd is behind steel
  // and stays where it is.
  scareBystanders()
  ageReactions(delta)

  /* ------------------------------- lights ------------------------------- */

  if (MOTO.countdown > 0) {
    const was = Math.ceil(MOTO.countdown)
    MOTO.countdown = Math.max(0, MOTO.countdown - delta)
    const now = Math.ceil(MOTO.countdown)
    if (now !== was) events.light = true
    if (MOTO.countdown === 0) events.green = true
    // Nobody moves on the lights, and nothing you do with the bars counts.
    input = { throttle: 0, steer: 0, wheelie: false }
  } else {
    MOTO.elapsed += delta
    MOTO.lapTime += delta
  }

  /* ------------------------------ throttle ------------------------------ */

  MOTO.tow = slipstream()
  const ceiling = MOTO.offRoad
    ? GRASS_SPEED
    : MAX_SPEED * (1 + TOW_GAIN * MOTO.tow)
  if (input.throttle > 0.02) {
    MOTO.speed += input.throttle * ACCEL * (1 + 0.5 * MOTO.tow) * delta
  } else if (input.throttle < -0.02) {
    MOTO.speed += input.throttle * BRAKE * delta
  } else {
    MOTO.speed -= MOTO.speed * DRAG * delta
  }
  if (MOTO.offRoad) MOTO.speed -= MOTO.speed * GRASS_DRAG * delta
  MOTO.speed = Math.max(-REVERSE_SPEED, Math.min(ceiling, MOTO.speed))

  // Below walking pace the bars do very little, as on a real bike.
  const grip = Math.min(1, Math.abs(MOTO.speed) / 12)
  MOTO.heading -= input.steer * TURN * delta * grip * Math.sign(MOTO.speed || 1)
  MOTO.roll +=
    (input.steer * MAX_ROLL * grip - MOTO.roll) * Math.min(1, delta * 6)

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

  // Clipping something costs you speed, and nothing worse than that — but
  // how much depends on how badly you met it. `square` is 1 for a hit
  // straight into the face of a thing and 0 for sliding along it, so a
  // barrier brushed at a shallow angle scrubs a little and one ridden into
  // takes most of what you had. Flat 0.6 a frame meant a long lean down a
  // rail compounded into a standstill in a third of a second.
  const shoved = Math.hypot(at[0] - wanted[0], at[1] - wanted[1])
  if (shoved > 0.02) {
    const square = Math.abs(
      ((at[0] - wanted[0]) / shoved) * Math.sin(MOTO.heading) +
        ((at[1] - wanted[1]) / shoved) * Math.cos(MOTO.heading),
    )
    if (!MOTO.scraping) {
      if (square > 0.45 && Math.abs(MOTO.speed) > 14) events.bumped = true
      MOTO.speed *= 1 - 0.62 * square
      if (square > 0.45) MOTO.wheelie = 0
    }
    // Staying against it drags rather than stopping you dead.
    MOTO.speed -= MOTO.speed * (0.3 + 2.6 * square) * delta
    MOTO.scraping = true
  } else {
    MOTO.scraping = false
  }

  // Leaning on one of the others, which is a different thing entirely. Only
  // the moment of contact counts, or a long lean would fire it every frame.
  const touching = jostle()
  if (touching && !MOTO.touching && Math.abs(MOTO.speed) > 20) {
    events.bumped = true
  }
  MOTO.touching = touching

  MOTO.wheel += MOTO.speed * delta * 1.6

  /* ------------------------------- the lap ------------------------------ */

  const line = project(MOTO.x, MOTO.z)
  MOTO.progress = line.progress
  MOTO.lateral = line.gap
  MOTO.side = line.side
  MOTO.offRoad = line.gap > ROAD_HALF

  const sector = Math.floor(line.progress / SECTOR_LENGTH) % SECTORS
  if (sector === MOTO.gate) {
    MOTO.gate = (MOTO.gate + 1) % SECTORS
    // Back round to the first sector means the line has just gone under you.
    if (MOTO.gate === 1) {
      MOTO.best =
        MOTO.best === 0 ? MOTO.lapTime : Math.min(MOTO.best, MOTO.lapTime)
      MOTO.lapTime = 0
      if (MOTO.lap >= MOTO.laps) {
        MOTO.done = true
        MOTO.finish = 1 + MOTO.rivals.filter((r) => r.finished).length
        events.finished = true
      } else {
        MOTO.lap++
        events.lap = MOTO.lap
      }
    }
  }

  /* ------------------------------ the others ---------------------------- */

  const playerAt = MOTO.lap * LAP_LENGTH + MOTO.progress
  for (const rival of MOTO.rivals) stepRival(rival, delta, playerAt)

  MOTO.place = 1 + standings().findIndex((entry) => entry.id === 'player')

  return events
}
