/**
 * Where the sun is, worked out rather than asked for.
 *
 * Whether it is day or night somewhere needs no network at all: it is the
 * sun's height over that place at that moment, and the sun keeps a very
 * regular timetable. So the island works it out itself, from the almanac's
 * low-precision formulae, which are good to a fraction of a degree for
 * centuries either side of now — a minute or two on a sunrise, at most. The
 * weather is the only part of the live sky that has to be fetched, and if
 * that fails the island still knows whether the sun is up over Athens.
 */

const RAD = Math.PI / 180

/** Days since noon on 1 January 2000, the epoch the formulae count from. */
function daysSinceJ2000(at: number) {
  return at / 86_400_000 + 2_440_587.5 - 2_451_545
}

/**
 * The sun's height above the horizon, in degrees: positive overhead,
 * negative below, -90 straight underfoot.
 */
export function sunElevation(
  latitude: number,
  longitude: number,
  at: number,
): number {
  const d = daysSinceJ2000(at)

  // Where the sun sits on the ecliptic today.
  const anomaly = (357.529 + 0.98560028 * d) * RAD
  const mean = 280.459 + 0.98564736 * d
  const ecliptic =
    (mean + 1.915 * Math.sin(anomaly) + 0.02 * Math.sin(2 * anomaly)) * RAD
  const tilt = (23.439 - 0.00000036 * d) * RAD

  // And so where it is among the stars.
  const ascension = Math.atan2(
    Math.cos(tilt) * Math.sin(ecliptic),
    Math.cos(ecliptic),
  )
  const declination = Math.asin(Math.sin(tilt) * Math.sin(ecliptic))

  // How far round the sky the place has turned since the sun crossed it.
  const sidereal = (18.697374558 + 24.06570982441908 * d) * 15
  const hourAngle = (sidereal + longitude) * RAD - ascension

  const lat = latitude * RAD
  const sine =
    Math.sin(lat) * Math.sin(declination) +
    Math.cos(lat) * Math.cos(declination) * Math.cos(hourAngle)
  return Math.asin(Math.max(-1, Math.min(1, sine))) / RAD
}

/**
 * The height at which the sun is said to rise and set: its upper edge on the
 * horizon, with the air bending its light up over it. It is the definition
 * every published sunrise uses, so the island's night begins when the
 * almanac's does rather than at some threshold of our own.
 */
export const HORIZON = -0.833

/** After sunset and before sunrise, wherever that is. */
export function isNight(
  place: { latitude: number; longitude: number },
  at: number,
): boolean {
  return sunElevation(place.latitude, place.longitude, at) < HORIZON
}
