/**
 * The night watch on a gate that is shut, and the moment they last had to
 * raise their voice.
 *
 * Written by the player controller when somebody walks up on a guarded gate
 * after dark, read by <Npcs/> so the sentries can turn round and put a hand
 * out. It lives out here so a whistle never costs a React render.
 */
import { BUILDINGS } from '../data/world'

/** How long they keep looking at you once they have challenged you. */
const CHALLENGE_TIME = 3.6
/** How close to the gate you get before somebody says something. */
const CHALLENGE_RANGE = 5.5
/** How far from the challenge a sentry has to be to have heard it. */
export const CHALLENGE_EARSHOT = 22

export const GUARD = {
  /** Seconds of the last challenge still to run. */
  left: 0,
  /** Where whoever was challenged is standing. */
  x: 0,
  z: 0,
  /** True while you are still inside the zone, so it fires once per approach. */
  near: false,
}

/** The gates that have soldiers on them rather than a dark lobby. */
const GUARDED = BUILDINGS.filter((b) => b.closesAtNight && b.sentries)

/** Whistles you back where you came from. */
export function challenge(x: number, z: number) {
  GUARD.left = CHALLENGE_TIME
  GUARD.x = x
  GUARD.z = z
}

/**
 * Stepped once a frame while you are outdoors. Returns true on the one frame
 * a whistle should sound — walking up on the gate is enough to earn it, and
 * you have to walk off again before you earn another.
 */
export function watchGates(
  x: number,
  z: number,
  delta: number,
  night: boolean,
): boolean {
  GUARD.left = Math.max(0, GUARD.left - delta)
  if (!night) {
    GUARD.near = false
    return false
  }

  let near = false
  for (const b of GUARDED) {
    if (Math.hypot(b.door[0] - x, b.door[1] - z) <= CHALLENGE_RANGE) {
      near = true
      break
    }
  }

  const first = near && !GUARD.near
  GUARD.near = near
  if (!first) return false

  challenge(x, z)
  return true
}
