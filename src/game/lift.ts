import type { Interior, InteriorLink, Vec2 } from '../types'
import {
  INTERIOR_MARGIN,
  fromLink,
  linkArrival,
  linkFacing,
  wayBack,
} from './interior'

/**
 * The lift in the Work District, which is the one way between floors that
 * takes time. Everything the ride needs to be drawn and timed lives here so
 * the car, the indicator over the doors and the moment he steps out are all
 * reading off the same clock.
 *
 * The shape of a ride: he steps into the car, the doors slide shut, the car
 * moves for as long as the number of floors it is crossing, the doors slide
 * open again, and he steps out onto the far floor. Nothing about it is
 * skippable — a lift you can walk out of halfway is a door.
 */

/** How long the doors take to shut, and to open again, in seconds. */
export const LIFT_DOORS = 0.9

/** How long the car spends on each floor it crosses. */
export const LIFT_PER_FLOOR = 1.1

/**
 * How near the doors he stands while he is riding.
 *
 * Not inside the shaft: the car is a recess cut into the wall, and the room's
 * own walkable margin stops well short of it, so a mark placed in the shaft
 * is a mark he can never reach and a walk towards it never ends. He stands in
 * the doorway instead, as near the leaves as the floor allows, which is where
 * somebody riding a lift actually stands.
 */
export const CAR_DEPTH = 0.35

/** How far back from the doors he stands after stepping out. */
export const CAR_STEP_OUT = 1.9

/**
 * The two places a rider stands at a lift: at the doors while the car moves,
 * and back in the room once he is out.
 *
 * Both are given here rather than worked out at each call site because they
 * are the same two points at every lift in the building, and because getting
 * in and getting out have to be exact opposites — anything else and a ride
 * leaves him a few centimetres further from the doors each time.
 *
 * Both are measured from the link's own position rather than from the wall,
 * so a lift set deeper or shallower in its recess carries them with it.
 */
export function liftStance(
  link: InteriorLink,
  /** The room the lift is in, so neither mark lands outside its floor. */
  room?: Interior,
): {
  /** At the doors, riding. */
  inside: Vec2
  /** Back in the room, clear of the doors. */
  outside: Vec2
  /** Facing the room, which is the way the doors open. */
  facing: number
} {
  const inside = fromLink(link, 0, CAR_DEPTH)
  const outside = fromLink(link, 0, CAR_STEP_OUT)
  return {
    inside: room ? insideRoom(room, inside) : inside,
    outside: room ? insideRoom(room, outside) : outside,
    facing: linkFacing(link),
  }
}

/**
 * Pulls a point back onto the floor he is allowed to walk on.
 *
 * A lift is set into a wall, so a mark measured off it can fall in the margin
 * the walker is kept out of. Clamping here rather than letting the walk stall
 * against the bounds is what keeps a step that cannot quite be completed from
 * leaving him walking on the spot forever.
 */
function insideRoom(room: Interior, at: Vec2): Vec2 {
  const hx = Math.max(0, room.half[0] - INTERIOR_MARGIN)
  const hz = Math.max(0, room.half[1] - INTERIOR_MARGIN)
  return [
    Math.max(-hx, Math.min(hx, at[0])),
    Math.max(-hz, Math.min(hz, at[1])),
  ]
}

export interface LiftPhase {
  /** 0 → 1 across the whole ride. */
  t: number
  /** 1 with the doors wide, 0 with them shut. */
  open: number
  /** The number lit over the doors right now. */
  floor: number
  /** True once the car has arrived and the doors have finished opening. */
  done: boolean
  /**
   * True once the car has stopped on the far floor, while the doors are still
   * shut and yet to open.
   *
   * This is the moment the room has to change on, and it is not `done`.
   * Swapping rooms at the end of the ride meant the far floor's doors mounted
   * already wide: the shutting half played on the floor he left, the travel
   * played on a blank screen, and the opening half never played at all,
   * anywhere. He simply appeared in a lobby beside an open lift.
   *
   * Changing the room here instead hands the far floor a ride that still has
   * its opening to run, so the doors he walks out of are the doors he watched
   * open.
   */
  arrived: boolean
}

/**
 * Where a ride is at `now`, in seconds on the same clock it started on.
 *
 * The floor on the indicator is interpolated and then rounded, so it ticks
 * over between floors the way a real one does rather than counting at the
 * ends of the ride.
 */
export function liftPhase(
  ride: { started: number; duration: number; from: number; to: number },
  now: number,
): LiftPhase {
  const elapsed = Math.max(0, now - ride.started)
  const t = Math.min(1, elapsed / ride.duration)
  const travel = Math.max(0.001, ride.duration - LIFT_DOORS * 2)

  // Shutting, moving, opening.
  const open =
    elapsed < LIFT_DOORS
      ? 1 - elapsed / LIFT_DOORS
      : elapsed > LIFT_DOORS + travel
        ? Math.min(1, (elapsed - LIFT_DOORS - travel) / LIFT_DOORS)
        : 0

  const moved = Math.min(1, Math.max(0, (elapsed - LIFT_DOORS) / travel))
  const floor = Math.round(ride.from + (ride.to - ride.from) * moved)

  return {
    t,
    open,
    floor,
    arrived: elapsed >= LIFT_DOORS + travel,
    done: elapsed >= ride.duration,
  }
}

/**
 * Where the car puts him down: out of the lift on the far floor.
 *
 * It has to be the lift on the far side and not merely a way back to the room
 * he came from — the shaft runs up one corner of the building and the stairs
 * up the other, so taking the first link that points home would have him step
 * out of the car and into the stairwell. A lift arrives at a lift.
 */
export function liftArrival(
  dest: Interior,
  fromRoom: string,
  link: InteriorLink,
): { at: Vec2; facing?: number } {
  if (link.arrive) return { at: link.arrive }
  const car = (dest.links ?? []).find((l) => l.kind === 'lift')
  if (car) {
    /* Out of the car, the same step he took getting in, reversed. */
    const { outside, facing } = liftStance(car, dest)
    return { at: outside, facing }
  }
  const back = wayBack(dest, fromRoom)
  if (back) return { at: linkArrival(back), facing: linkFacing(back) }
  return { at: dest.spawn }
}
