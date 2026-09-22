/**
 * The night watch on a gate that is shut, and how far they are prepared to
 * let you walk before they do something about it.
 *
 * They notice you a good way out and blow the whistle. Keep coming and they
 * simply will not have it: there is a line across the road that the player
 * gets put back outside of, every frame, for as long as they lean on it, and
 * the sentries themselves come off their posts to stand in the way.
 *
 * Stepped by the player controller and read by <Npcs/>, so none of it costs
 * a React render.
 */
import { BUILDINGS } from '../island/world'

/** How far out they notice somebody coming. */
const CHALLENGE_RANGE = 13
/** And the line, measured from the gate, that nobody gets inside of. */
const HOLD_LINE = 5
/**
 * A little slack outside it that still counts as leaning on the line, so
 * somebody pressed up against it keeps being shouted at rather than sitting
 * in silence exactly on the mark.
 */
const LEANING = 0.6
/** Seconds between blasts while somebody keeps leaning on that line. */
const BLAST_GAP = 1.5
/** How long they stay squared up after you back off. */
const CHALLENGE_TIME = 3.6
/** How far from the challenge a sentry has to be to have heard it. */
export const CHALLENGE_EARSHOT = 26

export const GUARD = {
  /** Seconds of the last challenge still to run. */
  left: 0,
  /** Where whoever is being challenged is standing. */
  x: 0,
  z: 0,
  /** True while somebody is actually being held off the line. */
  holding: false,
  /** True while you are still inside the zone, so a walk-up fires once. */
  near: false,
  /** Seconds until the next blast. */
  blast: 0,
}

/** The gates that have soldiers on them rather than a dark lobby. */
const GUARDED = BUILDINGS.filter((b) => b.closesAtNight && b.sentries)

function stand(x: number, z: number) {
  GUARD.left = CHALLENGE_TIME
  GUARD.x = x
  GUARD.z = z
}

/**
 * Holds the line at a guarded gate. Mutates the position tuple, putting it
 * back outside the cordon, and returns true on any frame the whistle blows —
 * once when you walk up, then over and over while you try to push through.
 */
export function holdTheLine(
  at: [number, number],
  delta: number,
  night: boolean,
): boolean {
  GUARD.left = Math.max(0, GUARD.left - delta)
  GUARD.blast = Math.max(0, GUARD.blast - delta)

  if (!night) {
    GUARD.near = false
    GUARD.holding = false
    return false
  }

  let gate: (typeof GUARDED)[number] | null = null
  let dist = Infinity
  for (const b of GUARDED) {
    const d = Math.hypot(b.door[0] - at[0], b.door[1] - at[1])
    if (d < dist) {
      dist = d
      gate = b
    }
  }

  if (!gate || dist > CHALLENGE_RANGE) {
    GUARD.near = false
    GUARD.holding = false
    return false
  }

  const walkedUp = !GUARD.near
  GUARD.near = true

  // Inside the line you get walked straight back out of it. There is no
  // negotiating with this: it is applied every frame you are inside.
  GUARD.holding = dist < HOLD_LINE + LEANING
  if (dist < HOLD_LINE) {
    let ox = at[0] - gate.door[0]
    let oz = at[1] - gate.door[1]
    let away = Math.hypot(ox, oz)
    if (away < 0.01) {
      // Standing exactly on the gate — arriving by map does that. Walked
      // back out the way the door faces.
      ox = gate.door[0] - gate.position[0]
      oz = gate.door[1] - gate.position[1]
      away = Math.hypot(ox, oz) || 1
    }
    at[0] = gate.door[0] + (ox / away) * HOLD_LINE
    at[1] = gate.door[1] + (oz / away) * HOLD_LINE
  }

  stand(at[0], at[1])

  if (walkedUp || (GUARD.holding && GUARD.blast <= 0)) {
    GUARD.blast = BLAST_GAP
    return true
  }
  return false
}

/** A deliberate try at the handle earns one whether you moved or not. */
export function challenge(x: number, z: number) {
  stand(x, z)
  GUARD.blast = BLAST_GAP
}
