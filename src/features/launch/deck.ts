import type { Vec2 } from '../../types'

/**
 * Where the things on the flight deck stand.
 *
 * Apart from the components that draw them because the player controller
 * needs them too: the suit rack has to be in the walker's list of things a
 * keypress can reach, and that list is built a long way from the mesh. One
 * pair of numbers, read by the thing that draws the rack and by the thing
 * that decides you are standing at it — so the prompt and the object cannot
 * drift apart.
 */

/** The console with the button under the glass, against the south wall. */
export const CONSOLE: Vec2 = [0, -6.2]

/** How high the console's top sits off the floor. */
export const CONSOLE_TOP = 1.05

/**
 * The suit rack, in its alcove on the west wall and a long way from the
 * button. The distance is deliberate: see `SuitRack` in `FlightDeck.tsx`.
 */
export const SUIT_RACK: Vec2 = [-9.1, -2]

/**
 * The hologram plinth, in the middle of the floor.
 *
 * Dead centre on purpose: he comes in at the south door and it stands between
 * him and everything else, so the reveal happens on the way to the console
 * rather than needing to be sought out.
 */
export const HOLOGRAM: Vec2 = [0, 1]
