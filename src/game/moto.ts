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
import { CIRCUIT, ISLAND_WALK_RADIUS, NPCS } from '../data/world'
import { resolveCollisions } from './collision'
import { STATIC_COLLIDERS, TREE_COLLIDERS } from './terrain'
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

export const LAPS = 3
/** Seconds on the lights before the flag drops. */
export const COUNTDOWN = 3

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
export function project(x: number, z: number): {
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
 * Nikos runs this loop most mornings and cycles it on Sundays, so he is quick
 * everywhere and untidy nowhere; the Sergeant has the fastest bike of the
 * three and brakes for everything; Marina has the slowest and does not brake
 * at all, which on a road of this shape is very nearly the same thing.
 */
export const RIVALS: RivalKit[] = [
  { id: 'runner', bike: '#2f9e5f', pace: 0.8, nerve: 0.9, line: -1.5 },
  { id: 'sergeant', bike: '#3f7bd6', pace: 0.86, nerve: 0.83, line: 1.5 },
  { id: 'studentrep', bike: '#e5b32b', pace: 0.78, nerve: 0.97, line: 0 },
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
  /** Set when your last lap is in. */
  done: false,
  /** Where you came, once it is. */
  finish: 0,
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
  MOTO.countdown = COUNTDOWN
  MOTO.lap = 1
  MOTO.gate = 1
  MOTO.progress = PLAYER_SLOT.at
  MOTO.lateral = Math.abs(PLAYER_SLOT.side)
  MOTO.side = PLAYER_SLOT.side
  MOTO.offRoad = false
  MOTO.tow = 0
  MOTO.touching = false
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
}

export function closeRide() {
  MOTO.active = false
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

/** Colliders near the bike; the tree list is far too long to walk in full. */
function nearby(x: number, z: number): Collider[] {
  const out: Collider[] = [...STATIC_COLLIDERS]
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
function trafficAhead(rival: Rival): { gap: number; speed: number; side: number } | null {
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

  const reach = 10 + rival.speed * 1.1 * rival.nerve
  let target = Math.min(
    MAX_SPEED * rival.pace,
    limitAhead(rival.progress, reach) * rival.nerve,
  )

  // Elastic, and it pulls harder towards you than away: dropping the race on
  // one bad corner is no fun, and neither is a procession once you are past.
  const gap = playerAt - (rival.lap * LAP_LENGTH + rival.progress)
  target *= 1 + Math.max(-0.12, Math.min(0.08, gap / 200))

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
  rival.speed += Math.max(-rate * delta, Math.min(rate * delta, target - rival.speed))

  if (rival.finished) {
    // Past the flag they roll it off rather than stopping dead on the road.
    rival.speed = Math.max(6, rival.speed - 6 * delta)
  }

  rival.progress += rival.speed * delta
  if (rival.progress >= LAP_LENGTH) {
    rival.progress -= LAP_LENGTH
    rival.lap++
    if (rival.lap > LAPS && !rival.finished) {
      rival.finished = true
      rival.time = MOTO.elapsed
    }
  }

  // The line they hold drifts a little, which reads as a rider working.
  const side =
    rival.line + rival.drift + Math.sin(rival.progress * 0.035) * 0.6
  const spot = pointAt(rival.progress)
  rival.x = spot.x + Math.cos(spot.heading) * side
  rival.z = spot.z - Math.sin(spot.heading) * side

  let swing = spot.heading - rival.heading
  while (swing > Math.PI) swing -= Math.PI * 2
  while (swing < -Math.PI) swing += Math.PI * 2
  rival.heading += swing * Math.min(1, delta * 8)
  // Lean with the corner, and harder the faster it is being taken.
  const lean = (swing / Math.max(delta, 0.001)) * 0.13 * (rival.speed / MAX_SPEED)
  rival.roll += (Math.max(-0.6, Math.min(0.6, lean)) - rival.roll) * Math.min(1, delta * 5)
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
    MOTO.speed *= 0.6
    MOTO.wheelie = 0
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
      MOTO.best = MOTO.best === 0 ? MOTO.lapTime : Math.min(MOTO.best, MOTO.lapTime)
      MOTO.lapTime = 0
      if (MOTO.lap >= LAPS) {
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
