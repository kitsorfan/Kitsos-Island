import { describe, expect, it } from 'vitest'
import { clockFace, liveMoment, minutesAt } from './clock'

/** 12:00 UTC on 2 October 2026: 15:00 in Athens, 21:00 in Tokyo. */
const NOON_UTC = Date.UTC(2026, 9, 2, 12, 0)

describe('the clock somewhere else', () => {
  it('reads the place’s own time, summer time and all', () => {
    expect(minutesAt('Europe/Athens', NOON_UTC)).toBe(15 * 60)
    expect(minutesAt('Asia/Tokyo', NOON_UTC)).toBe(21 * 60)
    expect(minutesAt('America/New_York', NOON_UTC)).toBe(8 * 60)
  })

  it('follows the clocks when they go back', () => {
    // Athens leaves summer time on the last Sunday of October.
    expect(minutesAt('Europe/Athens', Date.UTC(2026, 10, 2, 12))).toBe(14 * 60)
  })

  it('reads midnight as nought, not twenty-four', () => {
    expect(minutesAt('UTC', Date.UTC(2026, 9, 2, 0, 0))).toBe(0)
  })

  it('falls back to UTC for a zone it has never heard of', () => {
    expect(() => minutesAt('Atlantis/Capital', NOON_UTC)).not.toThrow()
    expect(minutesAt('Atlantis/Capital', NOON_UTC)).toBe(12 * 60)
  })
})

describe('the moment the island shows', () => {
  it('is now, when nothing is pinned', () => {
    expect(liveMoment('Europe/Athens', null, NOON_UTC)).toBe(NOON_UTC)
  })

  it('is that time today at the place, when one is', () => {
    // 21:30 in Athens on the same day is 18:30 UTC.
    const pinned = liveMoment('Europe/Athens', 21 * 60 + 30, NOON_UTC)
    expect(pinned).toBe(Date.UTC(2026, 9, 2, 18, 30))
    expect(minutesAt('Europe/Athens', pinned)).toBe(21 * 60 + 30)
  })

  it('can be pinned earlier in the day as well as later', () => {
    const pinned = liveMoment('Asia/Tokyo', 6 * 60, NOON_UTC)
    expect(pinned).toBeLessThan(NOON_UTC)
    expect(minutesAt('Asia/Tokyo', pinned)).toBe(6 * 60)
  })
})

describe('the face of the clock', () => {
  it('is hours and minutes, two digits each', () => {
    expect(clockFace(0)).toBe('00:00')
    expect(clockFace(9 * 60 + 5)).toBe('09:05')
    expect(clockFace(23 * 60 + 59)).toBe('23:59')
  })

  it('goes round rather than past midnight', () => {
    expect(clockFace(24 * 60)).toBe('00:00')
    expect(clockFace(-15)).toBe('23:45')
  })
})
