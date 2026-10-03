/**
 * The trailer's hooks into the island, in a file of their own so the player
 * can read them without pulling the director in behind it.
 *
 * The director itself is fetched only when the page is opened as the trailer,
 * so a visitor who never asks for it pays for these few lines and nothing
 * more.
 */

/** Whether the page was opened as the trailer: www.kitsorfan.com/?trailer. */
export const TRAILER =
  typeof location !== 'undefined' &&
  new URLSearchParams(location.search).has('trailer')

/**
 * Set while the director is holding the camera. The player's own rig stands
 * down for as long as it is, rather than the two of them taking turns at the
 * lens with whichever runs last winning the frame.
 */
export const RIG = { camera: false }
