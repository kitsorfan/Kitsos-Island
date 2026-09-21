import { describe, expect, it } from 'vitest'
import {
  BIRTHDAY,
  FEAST,
  HER_BIRTHDAY,
  MONTH_LENGTHS,
  MONTH_NAMES,
  MONTH_SHORT,
  clampDate,
  isBirthday,
  isFeast,
  nameOfDay,
} from './calendar'

/**
 * The calendar is a switch with a nice face on it, and the switch is the part
 * worth testing: exactly one date decorates the house, and a date arriving
 * from a save file or from a hand-edited blob must never be able to put the
 * calendar somewhere that does not exist.
 */

describe('clampDate', () => {
  it('keeps a date that is already good', () => {
    expect(clampDate({ day: 17, month: 7 })).toEqual({ day: 17, month: 7 })
  })

  it('falls back to the birthday for anything that is not a date', () => {
    for (const junk of [null, undefined, 'April', 42, [], NaN, {}]) {
      expect(clampDate(junk)).toEqual(BIRTHDAY)
    }
  })

  it('keeps a good half of a half-broken date', () => {
    expect(clampDate({ day: 12, month: 'June' })).toEqual({
      day: 12,
      month: BIRTHDAY.month,
    })
    expect(clampDate({ day: null, month: 9 })).toEqual({
      day: BIRTHDAY.day,
      month: 9,
    })
  })

  it('drags a month into the year', () => {
    expect(clampDate({ day: 1, month: 0 }).month).toBe(1)
    expect(clampDate({ day: 1, month: 13 }).month).toBe(12)
    expect(clampDate({ day: 1, month: -500 }).month).toBe(1)
  })

  it('drags a day into its own month, not into a generic 31', () => {
    // The thirty-first of February is the thing a save must never hold.
    expect(clampDate({ day: 31, month: 2 })).toEqual({ day: 29, month: 2 })
    expect(clampDate({ day: 31, month: 4 })).toEqual({ day: 30, month: 4 })
    expect(clampDate({ day: 31, month: 12 })).toEqual({ day: 31, month: 12 })
    expect(clampDate({ day: 0, month: 6 }).day).toBe(1)
  })

  it('rounds a fractional date rather than refusing it', () => {
    expect(clampDate({ day: 8.4, month: 4.6 })).toEqual({ day: 8, month: 5 })
  })

  it('refuses the infinities', () => {
    expect(clampDate({ day: Infinity, month: -Infinity })).toEqual(BIRTHDAY)
  })

  it('never returns a day outside the length of its month', () => {
    for (let month = 1; month <= 12; month++) {
      const out = clampDate({ day: 99, month })
      expect(out.day).toBe(MONTH_LENGTHS[month - 1])
      expect(out.day).toBeGreaterThanOrEqual(1)
    }
  })
})

describe('the dates the house behaves differently on', () => {
  it('decorates on Christmas Day and on nothing else', () => {
    expect(isFeast(FEAST)).toBe(true)
    expect(isFeast({ day: 25, month: 11 })).toBe(false)
    expect(isFeast({ day: 24, month: 12 })).toBe(false)
    expect(isFeast(BIRTHDAY)).toBe(false)
  })

  it('knows the day the calendar hangs on by default', () => {
    expect(isBirthday(BIRTHDAY)).toBe(true)
    expect(BIRTHDAY).toEqual({ day: 8, month: 4 })
    expect(isBirthday({ day: 4, month: 8 })).toBe(false)
  })

  it('names the three dates worth naming and no others', () => {
    expect(nameOfDay(BIRTHDAY)).toBe('Kitsos’ birthday')
    expect(nameOfDay(HER_BIRTHDAY)).toBe('Amalia’s birthday')
    expect(nameOfDay(FEAST)).toBe('Christmas Day')
    expect(nameOfDay({ day: 1, month: 1 })).toBeNull()
    expect(nameOfDay({ day: 8, month: 5 })).toBeNull()
  })
})

describe('the face of the calendar', () => {
  it('has twelve months, long and short', () => {
    expect(MONTH_NAMES).toHaveLength(12)
    expect(MONTH_SHORT).toHaveLength(12)
    expect(MONTH_LENGTHS).toHaveLength(12)
  })

  it('gives every month a button no two of which read alike', () => {
    // Ιουνίου and Ιουλίου both begin Ιου, which is why these are their own
    // strings rather than the first three letters of the long ones.
    expect(new Set(MONTH_SHORT).size).toBe(12)
  })

  it('ignores leap years, because nobody is booking a flight', () => {
    expect(MONTH_LENGTHS[1]).toBe(29)
  })
})
