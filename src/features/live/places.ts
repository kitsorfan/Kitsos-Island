import type { Locale } from '../../shared/i18n'

/**
 * Where the live sky is read from: Athens, unless the visitor moves it.
 *
 * Anywhere else is found through Open-Meteo's geocoder, which is free, needs
 * no key, and answers in Greek as readily as in English. It hands back the
 * place's time zone along with its coordinates, which is the one thing the
 * clock on the card could not have worked out for itself.
 */
export interface Place {
  /** What the place is called, in whichever language it was found in. */
  name: string
  /** Region and country, enough to tell one Springfield from another. */
  detail: string
  latitude: number
  longitude: number
  /** IANA zone, for the clock: 'Europe/Athens'. */
  timezone: string
}

export const ATHENS: Place = {
  name: 'Athens',
  detail: 'Greece',
  latitude: 37.9838,
  longitude: 23.7275,
  timezone: 'Europe/Athens',
}

/**
 * A few places one tap away. Hamburg because he worked there; the rest
 * because they are far enough round the world from Athens that one of them
 * is nearly always in the dark when it is light here, and the other way.
 */
export const PRESETS: Place[] = [
  ATHENS,
  {
    name: 'Hamburg',
    detail: 'Germany',
    latitude: 53.5507,
    longitude: 9.993,
    timezone: 'Europe/Berlin',
  },
  {
    name: 'London',
    detail: 'United Kingdom',
    latitude: 51.5085,
    longitude: -0.1257,
    timezone: 'Europe/London',
  },
  {
    name: 'New York',
    detail: 'United States',
    latitude: 40.7143,
    longitude: -74.006,
    timezone: 'America/New_York',
  },
  {
    name: 'Tokyo',
    detail: 'Japan',
    latitude: 35.6895,
    longitude: 139.6917,
    timezone: 'Asia/Tokyo',
  },
  {
    name: 'Reykjavík',
    detail: 'Iceland',
    latitude: 64.1355,
    longitude: -21.8954,
    timezone: 'Atlantic/Reykjavik',
  },
]

/** Two places are the same place if they are within a few hundred metres. */
export function samePlace(a: Place, b: Place): boolean {
  return (
    Math.abs(a.latitude - b.latitude) < 0.01 &&
    Math.abs(a.longitude - b.longitude) < 0.01
  )
}

/**
 * A place as it came back from site data or the geocoder, or null.
 *
 * Both are someone else's JSON. A save from a later version, a field the
 * geocoder dropped, or a latitude of 900 would otherwise go straight into
 * the sun's arithmetic and come out as a night that never ends.
 */
export function checkPlace(value: unknown): Place | null {
  if (!value || typeof value !== 'object') return null
  const v = value as Record<string, unknown>
  const { name, latitude, longitude, timezone } = v
  if (typeof name !== 'string' || !name.trim()) return null
  if (typeof timezone !== 'string' || !timezone) return null
  if (typeof latitude !== 'number' || Math.abs(latitude) > 90) return null
  if (typeof longitude !== 'number' || Math.abs(longitude) > 180) return null
  return {
    name: name.trim().slice(0, 80),
    detail: typeof v.detail === 'string' ? v.detail.slice(0, 120) : '',
    latitude,
    longitude,
    timezone,
  }
}

const GEOCODER = 'https://geocoding-api.open-meteo.com/v1/search'

/** How many the search shows. More than this is a list nobody reads. */
const RESULTS = 5

export function searchUrl(query: string, locale: Locale): string {
  const params = new URLSearchParams({
    name: query.trim(),
    count: String(RESULTS),
    language: locale,
    format: 'json',
  })
  return `${GEOCODER}?${params}`
}

/** The geocoder's answer as places, dropping anything it could not place. */
export function readPlaces(json: unknown): Place[] {
  const results = (json as { results?: unknown } | null)?.results
  if (!Array.isArray(results)) return []
  const places: Place[] = []
  for (const result of results) {
    const r = (result ?? {}) as Record<string, unknown>
    // The region is left out when it only repeats the name: Αμβούργο,
    // Αμβούργο, Γερμανία says one thing twice.
    const detail = [r.admin1, r.country]
      .filter((part): part is string => typeof part === 'string' && !!part)
      .filter((part) => part !== r.name)
      .join(', ')
    const place = checkPlace({ ...r, detail })
    if (place) places.push(place)
  }
  return places
}

/**
 * Asks the geocoder. Fewer than two letters is not a search, and an answer
 * that is refused or will not parse is no places rather than an error: the
 * presets are still on the card, and so is Athens. A network that is not
 * there at all, or a search given up on, still rejects, so the card can tell
 * nothing found from nothing asked.
 */
export async function findPlaces(
  query: string,
  locale: Locale,
  signal?: AbortSignal,
): Promise<Place[]> {
  if (query.trim().length < 2) return []
  const res = await fetch(searchUrl(query, locale), { signal })
  if (!res.ok) return []
  try {
    return readPlaces(await res.json())
  } catch {
    return []
  }
}
