import type { Interior, InteriorLink, Vec2 } from '../types'
import { linkArrival, linkFacing, wayBack } from './interior'

/**
 * The lift in the Work District, which is the one way between floors that
 * takes time. Everything the ride needs to be drawn and timed lives here so
 * the car, the indicator over the doors and the moment he steps out are all
 * reading off the same clock.
 *
 * The shape of a ride: the doors slide shut, the car moves for as long as the
 * number of floors it is crossing, the doors slide open again, and only then
 * is he put out on the far floor. Nothing about it is skippable — a lift you
 * can walk out of halfway is a door.
 */

/** How long the doors take to shut, and to open again, in seconds. */
export const LIFT_DOORS = 0.9

/** How long the car spends on each floor it crosses. */
export const LIFT_PER_FLOOR = 1.1

export interface LiftPhase {
  /** 0 → 1 across the whole ride. */
  t: number
  /** 1 with the doors wide, 0 with them shut. */
  open: number
  /** The number lit over the doors right now. */
  floor: number
  /** True once the car has arrived and the doors have finished opening. */
  done: boolean
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

  return { t, open, floor, done: elapsed >= ride.duration }
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
  if (car) return { at: linkArrival(car), facing: linkFacing(car) }
  const back = wayBack(dest, fromRoom)
  if (back) return { at: linkArrival(back), facing: linkFacing(back) }
  return { at: dest.spawn }
}
