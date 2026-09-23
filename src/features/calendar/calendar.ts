/**
 * The calendar hanging on the basement wall.
 *
 * It reads the eighth of April, which is his birthday, and that is all it
 * looks like it does. It can be taken off the nail and turned to any other
 * day, and exactly one of them is worth finding: on the twenty-fifth of
 * December the basement is decorated, the soundtrack changes, and the whole
 * family — both families — is standing round the table, because the feast on
 * Christmas Day is also his nameday and it has always been hosted here.
 *
 * Nothing else in the island reads the date. It is a switch with a nice face
 * on it.
 */

export interface CalendarDate {
  /** 1–31. */
  day: number
  /** 1–12. */
  month: number
}

/** The eighth of April. What the calendar says until somebody changes it. */
export const BIRTHDAY: CalendarDate = { day: 8, month: 4 }

/** Hers, the second of March. Marked, and nothing more than marked. */
export const HER_BIRTHDAY: CalendarDate = { day: 2, month: 3 }

/** The one date the house behaves differently on. */
export const FEAST: CalendarDate = { day: 25, month: 12 }

/** Days in each month, ignoring leap years: nobody is booking a flight. */
export const MONTH_LENGTHS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

/**
 * Read on the face of the calendar and in the date under the card.
 *
 * Greek puts the month in the genitive when a day is in front of it — 8
 * Απριλίου, not 8 Απρίλιος — and that is also what a Greek calendar prints on
 * its own face, so one form does for both places.
 */
export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/**
 * The twelve buttons that choose a month. Their own strings rather than the
 * first three letters of the long ones: Ιουνίου and Ιουλίου both begin Ιου,
 * so cutting them short would give the card two identical buttons.
 */
export const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/** A date from anywhere — a save file included — dragged into range. */
export function clampDate(value: unknown): CalendarDate {
  const raw = value as Partial<CalendarDate> | null | undefined
  const month = whole(raw?.month, BIRTHDAY.month, 1, 12)
  return {
    month,
    day: whole(raw?.day, BIRTHDAY.day, 1, MONTH_LENGTHS[month - 1]),
  }
}

function whole(value: unknown, fallback: number, min: number, max: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.max(min, Math.min(max, Math.round(value)))
}

/** Whether the house should be decorated. */
export const isFeast = (date: CalendarDate) =>
  date.day === FEAST.day && date.month === FEAST.month

/** The day it is turned to when nobody has turned it anywhere else. */
export const isBirthday = (date: CalendarDate) =>
  date.day === BIRTHDAY.day && date.month === BIRTHDAY.month

/**
 * What the day is, for anything that wants to print it.
 *
 * Three dates in the year have a name on this calendar and the other three
 * hundred and sixty two do not. Only one of them does anything — hers and
 * his are noted because a calendar on a family's wall has the birthdays on
 * it, and because a visitor turning it at random should find something more
 * often than never.
 */
export function nameOfDay(date: CalendarDate): string | null {
  if (isBirthday(date)) return 'Kitsos’ birthday'
  if (is(date, HER_BIRTHDAY)) return 'Amalia’s birthday'
  if (isFeast(date)) return 'Christmas Day'
  return null
}

const is = (a: CalendarDate, b: CalendarDate) =>
  a.day === b.day && a.month === b.month
