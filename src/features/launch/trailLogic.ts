/**
 * The rules behind the star shirt's wake, apart from the cloud that draws it.
 *
 * Here rather than in `StarTrail.tsx` because a file that exports both a
 * component and its constants breaks fast refresh, and because a fade curve
 * is arithmetic that a headless test can hold to account where a `Points`
 * cloud and a shader are not.
 */

/** How many sparks are in the air at once, at most. */
export const SPARKS = 18

/** How long one spark lives, in seconds. */
export const LIFE = 0.9

/**
 * How far apart, in seconds, sparks are shed while he is at full tilt.
 *
 * Slow, for a wake: each spark is big enough to be seen on its own, and a
 * big spark every other frame is a gold stripe painted along the grass
 * rather than a scatter of light falling off him.
 */
export const EVERY = 0.16

/** Below this he is ambling and sheds nothing: a trail is for moving. */
export const MIN_SPEED = 0.6

/** How long a spark holds full brightness before it begins to go, 0 to 1. */
const HOLD = 0.18

/**
 * How bright a spark of age `t` is, where `t` is 0 at birth and 1 at death.
 *
 * Full for the first breath and then straight out. A spark that starts fading
 * the instant it appears never looks like it was lit in the first place: the
 * eye reads the brightest frame as the moment of the spark, so if that frame
 * is also the first one there is nothing to see but a smear.
 */
export function sparkAlpha(t: number): number {
  if (t <= 0) return 1
  if (t >= 1) return 0
  return t < HOLD ? 1 : 1 - (t - HOLD) / (1 - HOLD)
}
