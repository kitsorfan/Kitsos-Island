import { describe, expect, it } from 'vitest'
import { HORIZON, isNight, sunElevation } from './sun'
import { ATHENS } from './places'

/**
 * The sun's height is what decides day and night in Live, so it is held to
 * the published almanac: the times below are Open-Meteo's own sunrise and
 * sunset for Athens on 2 October 2026, and a minute or two either way is
 * as close as the formulae claim to be.
 */

/** Midnight in Athens, the night of 1 to 2 October 2026 (EEST, UTC+3). */
const MIDNIGHT = Date.UTC(2026, 9, 1, 21, 0)
const SUNRISE = 1_790_914_882_000 // 07:21:22 in Athens
const SUNSET = 1_790_957_201_000 // 19:06:41

/** The first minute of the day at which the sun is on the other side. */
function crossings(place: { latitude: number; longitude: number }) {
  const found: number[] = []
  let was = isNight(place, MIDNIGHT)
  for (let minute = 1; minute < 24 * 60; minute++) {
    const at = MIDNIGHT + minute * 60_000
    const now = isNight(place, at)
    if (now !== was) found.push(at)
    was = now
  }
  return found
}

describe('the sun over Athens', () => {
  it('rises and sets within two minutes of the almanac', () => {
    const [rise, set] = crossings(ATHENS)
    expect(Math.abs(rise - SUNRISE)).toBeLessThan(2 * 60_000)
    expect(Math.abs(set - SUNSET)).toBeLessThan(2 * 60_000)
  })

  it('crosses the horizon once each way in a day, no more', () => {
    expect(crossings(ATHENS)).toHaveLength(2)
  })

  it('is high at midday and well under at midnight', () => {
    const noon = MIDNIGHT + 13 * 3_600_000
    expect(
      sunElevation(ATHENS.latitude, ATHENS.longitude, noon),
    ).toBeGreaterThan(40)
    expect(
      sunElevation(ATHENS.latitude, ATHENS.longitude, MIDNIGHT),
    ).toBeLessThan(-30)
  })

  it('calls midday day and midnight night', () => {
    expect(isNight(ATHENS, MIDNIGHT + 13 * 3_600_000)).toBe(false)
    expect(isNight(ATHENS, MIDNIGHT)).toBe(true)
  })
})

describe('the sun anywhere else', () => {
  it('is up in Tokyo while Athens is asleep', () => {
    // 03:00 in Athens is 09:00 in Tokyo.
    const three = MIDNIGHT + 3 * 3_600_000
    expect(isNight(ATHENS, three)).toBe(true)
    expect(isNight({ latitude: 35.69, longitude: 139.69 }, three)).toBe(false)
  })

  it('never sets on the Arctic circle at midsummer', () => {
    // Tromsø on the solstice: the midnight sun.
    const tromso = { latitude: 69.65, longitude: 18.96 }
    const day = Date.UTC(2026, 5, 21)
    for (let hour = 0; hour < 24; hour++) {
      expect(isNight(tromso, day + hour * 3_600_000)).toBe(false)
    }
  })

  it('never rises there at midwinter', () => {
    const tromso = { latitude: 69.65, longitude: 18.96 }
    const day = Date.UTC(2026, 11, 21)
    for (let hour = 0; hour < 24; hour++) {
      expect(isNight(tromso, day + hour * 3_600_000)).toBe(true)
    }
  })

  it('keeps to a real angle', () => {
    for (let hour = 0; hour < 24; hour++) {
      const e = sunElevation(-89.9, 179.9, Date.UTC(2026, 0, 1, hour))
      expect(e).toBeGreaterThanOrEqual(-90)
      expect(e).toBeLessThanOrEqual(90)
    }
  })

  it('sets where the almanac does, a little below the horizon', () => {
    // The sun's upper edge, with the air bending it up: not the centre.
    expect(HORIZON).toBeLessThan(0)
    expect(HORIZON).toBeGreaterThan(-1)
  })
})
