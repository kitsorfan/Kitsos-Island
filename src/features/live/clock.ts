/**
 * What time it is somewhere else, without asking anyone.
 *
 * The time in Athens is not something to fetch: the visitor's own clock
 * already knows what time it is everywhere, and the browser carries the
 * whole time-zone database, summer time and all. So the clock on the card
 * is the visitor's clock read in the place's zone, and it keeps going with
 * no network at all.
 */

/** A day, in the minutes the time slider counts in. */
export const DAY_MINUTES = 24 * 60

const faces = new Map<string, Intl.DateTimeFormat>()

/**
 * One formatter per zone, made once: building an Intl formatter is by far
 * the slowest part of reading a clock, and the card reads one every tick.
 * A zone the browser does not know — an old save, a typo — reads as UTC
 * rather than throwing, which would take the whole HUD down with it.
 */
function face(timeZone: string) {
  let format = faces.get(timeZone)
  if (!format) {
    try {
      format = new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      })
    } catch {
      format = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      })
    }
    faces.set(timeZone, format)
  }
  return format
}

/** Minutes after local midnight in that zone, at that moment. */
export function minutesAt(timeZone: string, at: number): number {
  let hour = 0
  let minute = 0
  for (const part of face(timeZone).formatToParts(at)) {
    if (part.type === 'hour') hour = Number(part.value)
    else if (part.type === 'minute') minute = Number(part.value)
  }
  // Some engines still write midnight as 24 under h23.
  return (hour % 24) * 60 + minute
}

/**
 * The moment the island is showing: now, or — with a time of day pinned —
 * that time today, at the place.
 *
 * Pinned is reached by moving now along by the difference on the place's
 * clock, rather than by building a date in the zone from its parts. That
 * keeps it to the one formatter, and the one way it can be off — an hour,
 * on the two nights a year the clocks change, for a time pinned across the
 * change — is not one anybody standing on an island will notice.
 */
export function liveMoment(
  timeZone: string,
  pinned: number | null,
  now: number,
): number {
  if (pinned === null) return now
  return now + (pinned - minutesAt(timeZone, now)) * 60_000
}

/** 845 → '14:05'. */
export function clockFace(minutes: number): string {
  const whole =
    ((Math.round(minutes) % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES
  const hours = Math.floor(whole / 60)
  return `${String(hours).padStart(2, '0')}:${String(whole % 60).padStart(2, '0')}`
}
