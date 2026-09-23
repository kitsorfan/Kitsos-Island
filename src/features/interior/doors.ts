import type { Building } from '../../types'

/**
 * Which of the island's doors open by themselves, and when.
 *
 * Most of them are a press: you walk up, the prompt names the building, and
 * you choose to go in. The Work District's is glass on a sensor, because an
 * office lobby is the one place on the island where the door is somebody
 * else's decision and not yours — you are expected, and it opens.
 *
 * The rule lives here rather than inline in the controller so it can be
 * stated once and tested: whether a door slides for you is a fact about the
 * building and the hour, not about the frame it is asked on.
 */

/**
 * How near a sliding door has to have you before it opens, in metres,
 * measured from the doorstep.
 *
 * Well inside the radius that offers a prompt: a door that opens the moment
 * its label appears reads as a trapdoor rather than a sensor, and the plaza
 * in front of the Work District is somewhere you walk past as often as into.
 *
 * It has to clear the wall, though, which is the trap here. A doorstep is a
 * mark on the approach and not the doorway itself — the Work District's sits
 * 3.1 m out from its own facade — while the building's whole footprint is a
 * collider. Walk straight at that door and the wall stops your centre 2.6 m
 * short of the doorstep, so a reach measured from the doorstep at anything
 * under that can never fire head-on: it opened only when you clipped the
 * corner diagonally, which is precisely backwards.
 *
 * So the reach is generous enough to be reachable from where a man can
 * actually stand, and `doorReach` below is what keeps it honest for any
 * building rather than just this one.
 */
export const AUTO_DOOR_REACH = 4.0

/**
 * How near the doorstep he must be for a sliding door to let him in.
 *
 * Tighter than the reach that opens the glass, and for the reason the two
 * were once wrongly the same number: anything that notices you should not
 * also swallow you. The sensor opens the door across the plaza; this is the
 * line you cross under your own steam, close enough in that you are plainly
 * going in rather than walking past.
 *
 * Above the 2.6 m floor the Work District's wall imposes, because a threshold
 * you cannot reach is a door that never opens — and far enough below the
 * reach that the glass is seen to slide before he arrives at it. Set the two
 * a few centimetres apart and the door opens and admits on the same stride,
 * which looks like no animation at all: the lobby simply appears.
 */
export const DOOR_ADMIT = 2.8

/**
 * The closest a walker of `radius` can bring his centre to a building's
 * doorstep, given that the whole footprint is solid.
 *
 * The check that would have caught the bug above, and the one worth keeping:
 * every reach measured from a doorstep has to be larger than this, or the
 * door is unreachable on the straight approach it was designed for.
 */
export function doorReach(building: Building, radius: number): number {
  const [bx, bz] = building.position
  const [dx, dz] = building.door
  /* Which face the doorstep is off, and how far out of it he is held. */
  const outX = Math.abs(dx - bx) - building.half[0]
  const outZ = Math.abs(dz - bz) - building.half[1]
  /* The doorstep is off one face, by whichever of these is positive. The
     wall holds his centre a radius clear of that face, so what is left
     between him and the doorstep is the standoff less his own radius. */
  const out = Math.max(outX, outZ)
  return Math.max(0, out - radius)
}

/** True while a door will turn you away: locked, or shut for the night. */
export function doorShut(
  building: Building,
  state: { night: boolean; lighthouseOpen: boolean },
): boolean {
  if (building.closesAtNight && state.night) return true
  return Boolean(building.locksWith) && !state.lighthouseOpen
}

/**
 * True while walking up to this door is enough to be let in.
 *
 * Only ever while the door would have admitted you anyway. A door that is
 * shut for the night, or locked until enough keys have turned, still wants a
 * press — because the answer is a refusal, and a refusal you never asked for
 * is a door that grabs at you rather than one that opens for you.
 */
export function autoOpens(
  building: Building,
  state: { night: boolean; lighthouseOpen: boolean },
): boolean {
  return Boolean(building.autoDoor) && !doorShut(building, state)
}

/**
 * How long the leaves take to slide apart, in seconds.
 *
 * The glass is the whole of the animation now. There was once a scripted
 * entrance here — he waited on the doorstep, walked the threshold on rails,
 * and the lobby took over when he was through — and every version of it read
 * as a hitch, because the one thing a sliding door must never do is take your
 * feet away from you. So the door opens and that is all it does. Walking in
 * is yours.
 */
export const DOOR_SLIDE = 0.28

/** How wide the leaves stand while the sensor has him, 0 → 1. */
export const DOOR_OPEN = 1

/**
 * How far the glass parts while he is merely standing near it.
 *
 * A sensor that notices you before you commit is most of what separates an
 * automatic door from a scripted one, and it costs nothing: a hand's width of
 * daylight, which shuts again the moment you walk off.
 */
export const DOOR_AJAR = 0.22

/**
 * Smoothstep, so the leaves start and finish gently rather than snapping to
 * a stop at either end — the one detail that separates a sliding door from a
 * pair of rectangles changing position.
 */
export function ease(x: number): number {
  const c = Math.min(1, Math.max(0, x))
  return c * c * (3 - 2 * c)
}

/**
 * A travel of the glass: where it set off from, where it is going, and how
 * far through that move it is.
 *
 * A move rather than a position, because `ease` is a curve over a whole
 * travel. Feed it a position and its gentle ends land wherever the leaf
 * happens to be rather than on the stops, and feeding the eased result back
 * in next frame compounds the curve into a leaf that creeps.
 */
export interface DoorMove {
  from: number
  to: number
  /** 0 → 1 through this move. */
  t: number
}

/** The glass shut and going nowhere: what a door starts life as. */
export function doorAtRest(): DoorMove {
  return { from: 0, to: 0, t: 1 }
}

/**
 * Advances a travel by `delta` seconds towards `target`, and says how far
 * open the glass now stands, 0 → 1.
 *
 * Timed against the clock rather than eased towards the target, so the glass
 * takes DOOR_SLIDE to travel on any machine — and actually arrives.
 *
 * The exponential this replaces never did: it closed a fixed fraction of the
 * remaining gap each frame, so the leaves hung short of both stops forever.
 * A door left ajar by a millimetre it can never cross is the whole of what
 * read as jammed, and it was worst where it showed most — a wider gap to
 * close left a wider residue behind.
 *
 * `move` is advanced in place: this runs once a frame per door, and a fresh
 * object each time is garbage the frame loop does not need to make.
 */
export function slideDoor(
  move: DoorMove,
  target: number,
  delta: number,
): number {
  if (target !== move.to) {
    /* A new destination mid-travel sets off from wherever the glass has
       actually got to, so a door reversed halfway carries on from where it
       was rather than jumping back to a stop it had already left. */
    move.from = move.to + (move.from - move.to) * (1 - ease(move.t))
    move.to = target
    move.t = 0
  }
  move.t = Math.min(1, move.t + Math.max(0, delta) / DOOR_SLIDE)
  return move.from + (move.to - move.from) * ease(move.t)
}
