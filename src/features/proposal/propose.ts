/**
 * The proposal on the beach.
 *
 * Five seconds leaning on the jump key and then the 3, out on the sand after
 * dark. The candles light themselves in a heart around where he is standing,
 * she comes up the beach out of the dark, and he asks her on one knee.
 *
 * Which phase it is in lives in the store, because a change of phase has to
 * re-render three things — the ring in his hand, the knee he is on, and the
 * hand she holds it out on. Everything that moves every frame lives here,
 * where it costs no render at all.
 */
import {
  DOCK_WALK,
  ISLAND_FLAT_RADIUS,
  ISLAND_WALK_RADIUS,
} from '../island/world'

export type Phase = 'arriving' | 'asking' | 'yes' | 'done'

/**
 * How far out the sand starts. The ground fades from grass to sand from a
 * hundred metres out, so this is the first ring of it that reads as beach
 * underfoot rather than as the last of the lawn.
 */
export const BEACH_FROM = ISLAND_FLAT_RADIUS - 4

/** Clear of the jetty by this much: candles want sand under them. */
const OFF_THE_PLANKS = 3

/** True on the band of sand between the last of the grass and the water. */
export const beachAt = (x: number, z: number) => {
  const r = Math.hypot(x, z)
  if (r < BEACH_FROM || r > ISLAND_WALK_RADIUS) return false
  // The planks are the one piece of walkable ground out here with the sea
  // underneath, and a candle laid on that is a candle in the water.
  return (
    Math.abs(x - DOCK_WALK.x) > DOCK_WALK.hx + OFF_THE_PLANKS ||
    Math.abs(z - DOCK_WALK.z) > DOCK_WALK.hz + OFF_THE_PLANKS
  )
}

/**
 * How far down the beach she starts, and how long she takes to walk it.
 *
 * Short enough that she is on sand wherever he is standing when he asks for
 * her — eleven metres out from the top of the beach is still a good ten
 * short of the water — and slow enough to be a walk. She is not in a hurry
 * and neither is the evening.
 */
const APPROACH = 11
const WALK_SECONDS = 5.4
/** Where she stops: near enough to hold a hand out to. */
export const STATION = 1.7

/**
 * How far out of the ring of candles he has to take her before it stops
 * being an occasion and becomes the two of them walking home.
 *
 * Measured from the spot he asked her on, which the heart is laid around, so
 * it works out at a stride or two past the furthest candle. A metre of slack
 * on the way back in keeps the line from being a tripwire he can stand on
 * and have her stepping from his front to his shoulder and back.
 */
export const AWAY = 5
const AWAY_BACK = 1

/** Where she stands out there: at his shoulder, half a step back. */
const SIDE = 1.4
const BEHIND = 0.5

/**
 * How hard she closes on her station, per second of gap, and the fastest
 * she will go doing it.
 *
 * A pace of her own rather than a fraction of the gap. A fraction sounds
 * like the same thing and is not: it leaves her further behind the faster
 * he walks, and he walks at ten metres a second, which had her trailing
 * four metres down the beach and reading as a woman following him rather
 * than a woman with him. Closing at nine times the gap puts his shoulder
 * about a metre in front of her at a walk, and the cap is what makes a
 * sprint something she falls behind on and then catches up.
 */
const FOLLOW_WITH = 9
/** Gentler where she is holding a station in front of him, not walking. */
const FOLLOW_NEAR = 3.5
/**
 * And the cap clears his sprint rather than sitting under it: at thirteen
 * she could keep up with a walk and was left standing by a run, which is
 * not what being with somebody looks like. Above his nineteen she matches
 * whatever he does — and the gap she settles at does the rest, so a sprint
 * still puts her a stride or two further back than a stroll does.
 */
const KEEP_UP = 20

/**
 * How close the two of them are ever allowed to get.
 *
 * A hard floor rather than something she eases towards, because the ease is
 * worth about three metres a second and he can walk at ten: left to the
 * station alone he simply strides through her and stands in the middle of
 * her, which is not two people standing together, it is one hole in the
 * picture. Walk into her now and she gives ground instead.
 */
const CLOSEST = 1.25

/**
 * True once she has said it and he has walked her out of the candles.
 *
 * In the ring she stands in front of him and looks at him, because that is
 * where you stand when somebody has just asked you something. Outside it she
 * is at his shoulder looking the same way he is, because that is where you
 * walk. Stepped by step(), so everything that asks agrees on the answer.
 */
export const together = () => PROPOSE.walking

export const PROPOSE = {
  active: false,
  /** Where he stood when he spelled it out. The candles are laid round this. */
  x: 0,
  z: 0,
  /** Which way he was looking, so she comes in where he can see her. */
  facing: 0,
  /** Seconds since the first candle. */
  time: 0,
  /** 0 to 1, eased: how far up the beach she has come. */
  walk: 0,
  /** Where she came out of the dark. */
  from: { x: 0, z: 0 },
  /** Where she is this frame. */
  her: { x: 0, z: 0 },
  /** 0 to 1 per candle: lit one after another, in the order they are laid. */
  lit: 0,
  /** True once she has said it and the scene has played out. */
  done: false,
  /** True once he has taken her out of the candlelight. */
  walking: false,
  /**
   * Which side of him she walks on afterwards, or 0 while she is still
   * standing in front of him. Chosen once, from the side she is already on,
   * because a companion who picks the nearest shoulder every frame spends
   * the whole walk crossing back and forth behind you.
   */
  side: 0,
}

/** How long the whole heart takes to light. */
const LIGHTING = 2.6

/* ------------------------------- the heart ------------------------------ */

/**
 * The candles, laid out as a heart with the two of them standing inside it.
 *
 * The curve is the usual one — sixteen sines cubed against a sum of cosines
 * — sampled evenly in its own parameter, which bunches the flames a little
 * at the point and round the lobes. That is where you would put them.
 */
export const CANDLES = 24
const HEART_SCALE = 3.4 / 16
/** The heart sits a touch ahead of him, so he and she are both inside it. */
const HEART_AHEAD = 0.8

/** A point on the heart, in metres right of and ahead of its own middle. */
function heartPoint(i: number): [number, number] {
  const a = (i / CANDLES) * Math.PI * 2
  const right = 16 * Math.pow(Math.sin(a), 3)
  const ahead =
    13 * Math.cos(a) -
    5 * Math.cos(2 * a) -
    2 * Math.cos(3 * a) -
    Math.cos(4 * a)
  return [right * HEART_SCALE, ahead * HEART_SCALE]
}

/** Anywhere in the scene's own frame, put into the world. */
export function place(right: number, ahead: number): { x: number; z: number } {
  const sin = Math.sin(PROPOSE.facing)
  const cos = Math.cos(PROPOSE.facing)
  return {
    x: PROPOSE.x + sin * ahead + cos * right,
    z: PROPOSE.z + cos * ahead - sin * right,
  }
}

/** Where one candle stands, in world space. */
export function candleSpot(i: number): { x: number; z: number } {
  const [right, ahead] = heartPoint(i)
  return place(right, ahead + HEART_AHEAD)
}

/** How far this candle has caught, 0 to 1. They light in order. */
export function candleLit(i: number): number {
  const turn = i / CANDLES
  return Math.max(0, Math.min(1, (PROPOSE.lit - turn) * 6))
}

/* -------------------------------- the scene ------------------------------ */

export function begin(x: number, z: number, facing: number) {
  PROPOSE.active = true
  PROPOSE.done = false
  PROPOSE.walking = false
  PROPOSE.side = 0
  PROPOSE.x = x
  PROPOSE.z = z
  PROPOSE.facing = facing
  PROPOSE.time = 0
  PROPOSE.walk = 0
  PROPOSE.lit = 0
  const start = place(0, APPROACH)
  PROPOSE.from.x = start.x
  PROPOSE.from.z = start.z
  PROPOSE.her.x = start.x
  PROPOSE.her.z = start.z
}

/** She has said it. From here she is not being asked anything any more. */
export function settle() {
  PROPOSE.done = true
}

export function end() {
  PROPOSE.active = false
  PROPOSE.done = false
  PROPOSE.walking = false
  PROPOSE.side = 0
  PROPOSE.walk = 0
  PROPOSE.lit = 0
}

/**
 * Moves the scene on, given where he is standing this frame. Returns true on
 * the one frame she arrives, which is what puts him on his knee.
 */
export function step(
  delta: number,
  px: number,
  pz: number,
  facing: number,
): boolean {
  if (!PROPOSE.active) return false
  PROPOSE.time += delta
  PROPOSE.lit = Math.min(1, PROPOSE.lit + delta / LIGHTING)

  // In the candles or out of them, with a metre of slack on the way back.
  const out = Math.hypot(px - PROPOSE.x, pz - PROPOSE.z)
  PROPOSE.walking =
    PROPOSE.done && (PROPOSE.walking ? out > AWAY - AWAY_BACK : out > AWAY)

  const was = PROPOSE.walk
  PROPOSE.walk = Math.min(1, PROPOSE.walk + delta / WALK_SECONDS)
  // Eased at both ends: she comes out of the dark at a stroll and slows into
  // her station rather than pulling up dead in front of him. A curve that
  // only eases out would have her leaving at a sprint.
  const t = PROPOSE.walk
  const eased = t * t * (3 - 2 * t)

  // Where she is headed. Through the scene it is a spot an arm's length in
  // front of him on the side she came from — she walks to him rather than to
  // the patch of sand he was standing on when the candles lit, so wherever
  // he has wandered off to she arrives facing him.
  let toX: number
  let toZ: number
  const sin = Math.sin(facing)
  const cos = Math.cos(facing)

  if (together()) {
    // Afterwards it is his shoulder, and it stays the same shoulder.
    if (PROPOSE.side === 0) {
      const off = (PROPOSE.her.x - px) * cos - (PROPOSE.her.z - pz) * sin
      PROPOSE.side = off >= 0 ? 1 : -1
    }
    toX = px + cos * SIDE * PROPOSE.side - sin * BEHIND
    toZ = pz - sin * SIDE * PROPOSE.side - cos * BEHIND
  } else {
    PROPOSE.side = 0
    const dx = PROPOSE.from.x - px
    const dz = PROPOSE.from.z - pz
    const out = Math.max(0.001, Math.hypot(dx, dz))
    toX = px + (dx / out) * STATION
    toZ = pz + (dz / out) * STATION
  }

  if (PROPOSE.walk < 1) {
    PROPOSE.her.x = PROPOSE.from.x + (toX - PROPOSE.from.x) * eased
    PROPOSE.her.z = PROPOSE.from.z + (toZ - PROPOSE.from.z) * eased
  } else {
    // Once she is here she keeps station on him rather than being pinned
    // to him, and she walks it at a pace of her own.
    const dx = toX - PROPOSE.her.x
    const dz = toZ - PROPOSE.her.z
    const d = Math.hypot(dx, dz)
    if (d > 0.001) {
      const pull = together() ? FOLLOW_WITH : FOLLOW_NEAR
      const reach = Math.min(d, Math.min(d * pull, KEEP_UP) * delta)
      PROPOSE.her.x += (dx / d) * reach
      PROPOSE.her.z += (dz / d) * reach
    }
  }

  // And then held out of him, however fast he walked at her.
  const gapX = PROPOSE.her.x - px
  const gapZ = PROPOSE.her.z - pz
  const gap = Math.hypot(gapX, gapZ)
  if (gap < CLOSEST) {
    if (gap < 0.001) {
      // Dead on top of her, with no direction to be pushed in: take the
      // shoulder she walks on, or his right if she has not picked one.
      PROPOSE.her.x = px + cos * CLOSEST * (PROPOSE.side || 1)
      PROPOSE.her.z = pz - sin * CLOSEST * (PROPOSE.side || 1)
    } else {
      PROPOSE.her.x = px + (gapX / gap) * CLOSEST
      PROPOSE.her.z = pz + (gapZ / gap) * CLOSEST
    }
  }

  return was < 1 && PROPOSE.walk >= 1
}

/** Which way she is looking: at him, from wherever she has got to. */
export const herFacing = (px: number, pz: number) =>
  Math.atan2(px - PROPOSE.her.x, pz - PROPOSE.her.z)
