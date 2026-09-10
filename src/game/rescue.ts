/**
 * Sea rescue: a boat has gone down in the night somewhere off the coast, and
 * her people are in the water in liferafts with hand flares. A flare burns
 * for so long and no longer. Get alongside one, take the way off her, hold
 * station while they come over the rail — then pick the next, and the one
 * after that, in whatever order gets everyone out of the water.
 *
 * The game is the order and the arrival. Anyone can drive at a light; the
 * skill is choosing which light, and being stopped when you get there.
 *
 * Like the other games this is plain state stepped once per frame, so a run
 * never costs a React render.
 */

/* --------------------------------- the sea -------------------------------- */

/**
 * Where the foam breaks. The sea shader draws the shoreline at this radius,
 * so this is the water she runs out of.
 */
export const BEACH = 123
/** Far enough out that the island is a shape on the horizon. */
export const HORIZON = 245

/* -------------------------------- the boat -------------------------------- */

const TOP = 28
const ASTERN = 9
const THRUST = 13
const BRAKE = 20
/** Fraction of way lost per second with the throttle shut. */
const DRAG = 0.5
/** How fast she comes round, at speed. A boat is not a bike. */
const TURN = 1.9
/**
 * How quickly the hull stops sliding sideways. Low, because a boat carries
 * its old heading through a turn and that slide is most of what she feels
 * like to drive — and now that the game asks you to stop on a mark, it is
 * also most of what the game is.
 */
const GRIP = 1.5

/**
 * Where the boat is tied up: off the end of the dock, west of the school,
 * pointing out to sea rather than at the beach she is moored against.
 */
export const BOAT_START = {
  x: -134,
  z: 20,
  heading: Math.atan2(-134, 20),
}

/* ------------------------------- the people ------------------------------- */

/** How many are in the water over a run. */
export const SOULS = 6
/**
 * And how many of them are out there at once. This number is the whole
 * difficulty of the game and it is not a free choice: a flare lit into a
 * full queue waits for every raft ahead of it, so three rafts at twelve
 * seconds a raft is thirty-six seconds of waiting before anyone even
 * starts towards it — which is what the flares have to be long enough to
 * survive, with something left over for a bad approach.
 */
export const AT_ONCE = 3

/** Seconds between one flare going up and the next. */
const LIGHT_EVERY = 10
/** The first one is already burning when you cast off. */
const FIRST_AT = 1.2

/**
 * How long a hand flare burns, and how much of that each later one loses.
 *
 * Tuned against a simulated skipper rather than guessed at. A flare lit into
 * a full queue waits for the two rafts ahead of it, so the number that
 * matters is how long a flare has against how long three pickups take. At
 * seventy-two seconds a skipper who knows where to shut the throttle brings
 * everyone home about four runs in five; one who sails past every raft and
 * has to come back manages fewer than half. That gap is the game, and it
 * closes fast if this number moves.
 */
const FLARE_LIFE = 72
const RUSH = 1
/** However hurried it gets, a flare is never shorter than this. */
const FLARE_FLOOR = 52

const ADRIFT_NEAR = 142
const ADRIFT_FAR = 226
/** Nobody surfaces this close to the boat: they are found, not handed over. */
const ADRIFT_CLEAR = 48
/**
 * Metres per second a raft sets down on the island, and metres per second it
 * works round it. Both are speeds through the water. The swirl was an
 * angular rate once, which at a hundred and eighty metres out came to seven
 * metres a second — the rafts outran the boat, and nobody ever got aboard.
 */
const SET = 0.5
const SWIRL = 0.35

/* ----------------------------- getting them in ---------------------------- */

/**
 * How close she has to be for anyone to reach her. Something over a boat's
 * length, because braking hard with the engine astern carries her back out
 * again, and losing a whole haul to a metre of overshoot is not a skill
 * anybody enjoys learning.
 */
export const ALONGSIDE = 10
/**
 * And how little way she can have on. Well under a walking pace, so the
 * approach is the whole thing: come in hard, throw her astern, and let the
 * last twenty metres go by on nothing at all.
 */
export const SLOW = 4.5
/** Seconds of held station to get one raft aboard. */
const HAUL = 2.3
/** And how fast that unwinds once she is moving again, or gone. */
const SLIP = 0.5

/** Seconds left on a flare below which it is guttering and the alarm sounds. */
export const LAST_GASP = 12

export interface Casualty {
  id: number
  x: number
  z: number
  /** Seconds of flare left, and how many it had to start with. */
  burn: number
  life: number
  /** How much of the haul is done, nought to one. */
  aboard: number
  /** Set the frame someone is coming over the rail, for the world to show. */
  hauling: boolean
}

export const RESCUE = {
  active: false,
  x: BOAT_START.x,
  z: BOAT_START.z,
  heading: BOAT_START.heading,
  /** Velocity, which is not the same as where she is pointing. */
  vx: 0,
  vz: 0,
  /** Way along the heading; negative is astern. */
  speed: 0,
  /** What she is actually making through the water, engine order or not. */
  way: 0,
  /** How far she is sliding sideways, for the heel and the wake. */
  slip: 0,
  heel: 0,
  /** Bow rise, purely visual. */
  trim: 0,
  people: [] as Casualty[],
  /** Flares lit so far, souls aboard, and the one that was not reached. */
  lit: 0,
  saved: 0,
  nextIn: FIRST_AT,
  elapsed: 0,
  /** The flare with the least left in it, and how many seconds that is. */
  worry: null as Casualty | null,
  margin: 0,
  /** The raft she is alongside, and whether anyone is actually coming over. */
  alongside: null as Casualty | null,
  hauling: false,
  /** Hard on the sand right now. */
  aground: false,
  done: false,
  won: false,
  /** The one whose flare went out, once one has. */
  lost: null as Casualty | null,
}

let nextId = 1

export function openWater() {
  RESCUE.x = BOAT_START.x
  RESCUE.z = BOAT_START.z
  RESCUE.heading = BOAT_START.heading
  RESCUE.vx = 0
  RESCUE.vz = 0
  RESCUE.speed = 0
  RESCUE.way = 0
  RESCUE.slip = 0
  RESCUE.heel = 0
  RESCUE.trim = 0
  RESCUE.people = []
  RESCUE.lit = 0
  RESCUE.saved = 0
  RESCUE.nextIn = FIRST_AT
  RESCUE.elapsed = 0
  RESCUE.worry = null
  RESCUE.margin = 0
  RESCUE.alongside = null
  RESCUE.hauling = false
  RESCUE.aground = false
  RESCUE.done = false
  RESCUE.won = false
  RESCUE.lost = null
  RESCUE.active = true
}

export function closeWater() {
  RESCUE.active = false
}

/**
 * Somewhere out at sea, well clear of the boat, for the next flare to go up.
 * Later flares burn shorter than the first ones, which is the only place the
 * run gets harder — there is no point making a search area bigger.
 */
function light() {
  const life = Math.max(FLARE_FLOOR, FLARE_LIFE - RESCUE.saved * RUSH)
  for (let tries = 0; tries < 24; tries++) {
    const angle = Math.random() * Math.PI * 2
    const radius = ADRIFT_NEAR + Math.random() * (ADRIFT_FAR - ADRIFT_NEAR)
    const x = Math.sin(angle) * radius
    const z = Math.cos(angle) * radius
    if (Math.hypot(x - RESCUE.x, z - RESCUE.z) < ADRIFT_CLEAR && tries < 20) {
      continue
    }
    RESCUE.people.push({
      id: nextId++,
      x,
      z,
      burn: life,
      life,
      aboard: 0,
      hauling: false,
    })
    RESCUE.lit++
    return
  }
}

/* ------------------------------- the frame -------------------------------- */

export interface RescueInput {
  /** -1 to 1: astern to full ahead. */
  throttle: number
  /** -1 to 1: helm. */
  steer: number
}

export interface RescueEvents {
  /** A flare went up this frame. */
  lit: boolean
  /** How many came over the rail. */
  saved: number
  /** Someone is on the way over, which the world reads for the net. */
  hauling: boolean
  /** A flare dropped into its last seconds this frame. */
  guttering: boolean
  /** Ran her up the beach. */
  aground: boolean
  /** The run ended this frame, one way or the other. */
  over: boolean
}

export function stepRescue(delta: number, input: RescueInput): RescueEvents {
  const events: RescueEvents = {
    lit: false,
    saved: 0,
    hauling: false,
    guttering: false,
    aground: false,
    over: false,
  }
  if (!RESCUE.active || RESCUE.done) return events

  RESCUE.elapsed += delta

  /* -------------------------------- helm -------------------------------- */

  if (input.throttle > 0.02) {
    RESCUE.speed += input.throttle * THRUST * delta
  } else if (input.throttle < -0.02) {
    RESCUE.speed += input.throttle * BRAKE * delta
  } else {
    RESCUE.speed -= RESCUE.speed * DRAG * delta
  }
  RESCUE.speed = Math.max(-ASTERN, Math.min(TOP, RESCUE.speed))

  // A rudder does nothing without water going past it.
  const bite = Math.min(1, Math.abs(RESCUE.speed) / 7)
  RESCUE.heading -=
    input.steer * TURN * delta * bite * Math.sign(RESCUE.speed || 1)

  // Thrust goes on along the new heading; whatever the hull was already doing
  // sideways bleeds off slowly, and that slide is the whole feel of her.
  const fx = Math.sin(RESCUE.heading)
  const fz = Math.cos(RESCUE.heading)
  RESCUE.vx += (fx * RESCUE.speed - RESCUE.vx) * Math.min(1, GRIP * delta)
  RESCUE.vz += (fz * RESCUE.speed - RESCUE.vz) * Math.min(1, GRIP * delta)

  RESCUE.x += RESCUE.vx * delta
  RESCUE.z += RESCUE.vz * delta

  // What she is actually doing through the water, which lags the throttle —
  // and which is what the rafts are judged against, so a hull still sliding
  // sideways with the throttle shut is not yet stopped.
  RESCUE.way = Math.hypot(RESCUE.vx, RESCUE.vz)
  // And how much of that travel is across the hull rather than along it.
  RESCUE.slip = RESCUE.vx * fz - RESCUE.vz * fx
  RESCUE.heel +=
    (Math.max(-1, Math.min(1, RESCUE.slip / 9)) * 0.34 - RESCUE.heel) *
    Math.min(1, delta * 4)
  RESCUE.trim +=
    (Math.max(0, RESCUE.speed / TOP) * 0.12 - RESCUE.trim) *
    Math.min(1, delta * 2)

  // The shore, and the point past which there is nothing to find. Running
  // her up the sand takes the way off her and turns her along the beach
  // rather than pinning her there with the throttle open.
  const out = Math.hypot(RESCUE.x, RESCUE.z)
  if (out < BEACH + 4) {
    const nx = RESCUE.x / out
    const nz = RESCUE.z / out
    RESCUE.x = nx * (BEACH + 4)
    RESCUE.z = nz * (BEACH + 4)
    const into = RESCUE.vx * nx + RESCUE.vz * nz
    if (into < 0) {
      RESCUE.vx -= nx * into
      RESCUE.vz -= nz * into
    }
    // The engine keeps turning, so the rudder still answers and she can be
    // driven off — but the first touch costs her way, once, not every frame.
    if (!RESCUE.aground) {
      if (RESCUE.way > 8) events.aground = true
      RESCUE.speed *= 0.55
    }
    RESCUE.aground = true
  } else {
    RESCUE.aground = false
  }
  if (out > HORIZON) {
    const pull = HORIZON / out
    RESCUE.x *= pull
    RESCUE.z *= pull
    RESCUE.speed *= 0.6
  }

  /* ------------------------------- the sea ------------------------------ */

  RESCUE.nextIn -= delta
  if (
    RESCUE.nextIn <= 0 &&
    RESCUE.lit < SOULS &&
    RESCUE.people.length < AT_ONCE
  ) {
    light()
    RESCUE.nextIn = LIGHT_EVERY
    events.lit = true
  }

  // Whichever raft she is nearest, if she is near one at all. Only one at a
  // time: they are spread far enough apart that two is not a situation.
  let nearest: Casualty | null = null
  let closest = ALONGSIDE
  for (const soul of RESCUE.people) {
    const reach = Math.hypot(soul.x - RESCUE.x, soul.z - RESCUE.z)
    if (reach < closest) {
      closest = reach
      nearest = soul
    }
  }
  RESCUE.alongside = nearest
  RESCUE.hauling = false

  for (let i = RESCUE.people.length - 1; i >= 0; i--) {
    const soul = RESCUE.people[i]

    // The tide sets them down on the island and round it, so a light left
    // alone is not a light left in the same place.
    const radius = Math.max(1, Math.hypot(soul.x, soul.z))
    const drift = Math.max(BEACH + 10, radius - SET * delta)
    const angle = Math.atan2(soul.x, soul.z) + (SWIRL / radius) * delta
    soul.x = Math.sin(angle) * drift
    soul.z = Math.cos(angle) * drift

    const was = soul.burn
    soul.burn -= delta
    if (was > LAST_GASP && soul.burn <= LAST_GASP) events.guttering = true

    // Alongside and stopped, and they can climb; alongside and still making
    // way, and they cannot. Whatever was done unwinds if she leaves.
    soul.hauling = soul === nearest && RESCUE.way < SLOW
    if (soul.hauling) {
      soul.aboard += delta / HAUL
      RESCUE.hauling = true
      events.hauling = true
    } else {
      soul.aboard = Math.max(0, soul.aboard - delta * SLIP)
    }

    if (soul.aboard >= 1) {
      RESCUE.people.splice(i, 1)
      RESCUE.saved++
      events.saved++
      continue
    }

    // And the thing the whole run is about.
    if (soul.burn <= 0) {
      RESCUE.lost = soul
      RESCUE.done = true
      RESCUE.won = false
      events.over = true
    }
  }

  /* ------------------------------ the state ----------------------------- */

  RESCUE.worry = null
  RESCUE.margin = Infinity
  for (const soul of RESCUE.people) {
    if (soul.burn < RESCUE.margin) {
      RESCUE.margin = soul.burn
      RESCUE.worry = soul
    }
  }
  if (RESCUE.worry === null) RESCUE.margin = 0

  if (!RESCUE.done && RESCUE.saved >= SOULS) {
    RESCUE.done = true
    RESCUE.won = true
    events.over = true
  }

  return events
}
