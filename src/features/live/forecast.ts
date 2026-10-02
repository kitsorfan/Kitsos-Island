import type { Place } from './places'

/**
 * The weather, from Open-Meteo.
 *
 * Chosen because it is free for a site like this one, needs no key — so
 * there is nothing to hide, and the page can ask it directly rather than
 * through the Worker — and answers from the browser with CORS open. It is
 * only ever asked once the visitor has pressed Live: until then nothing on
 * the island reaches out anywhere.
 *
 * One request covers yesterday, today and tomorrow hour by hour, as well as
 * the conditions right now, so the time slider can be dragged all day long
 * without another request going out.
 */

/** What the sky is doing at one place and moment. */
export interface Reading {
  /** The moment it is for, in milliseconds. */
  at: number
  /** The WMO code for the weather: 0 clear, 61 rain, 95 thunder. */
  code: number
  /** °C, or null if the model left it out. */
  temperature: number | null
  /** How much of the sky is cloud, 0 to 100. */
  cloud: number | null
  /** Rain and melted snow, in millimetres over the step. */
  precipitation: number
  /** At ten metres, in metres a second. */
  wind: number
  /** Where the wind comes from, in degrees clockwise from north. */
  windFrom: number
}

export interface Forecast {
  /** Right now, off the fifteen-minute model. */
  now: Reading
  /** Hour by hour from yesterday to tomorrow, oldest first. */
  hours: Reading[]
}

const FORECAST = 'https://api.open-meteo.com/v1/forecast'

const FIELDS = [
  'weather_code',
  'temperature_2m',
  'cloud_cover',
  'precipitation',
  'wind_speed_10m',
  'wind_direction_10m',
].join(',')

/**
 * How long a reading stands. The current conditions only move every
 * fifteen minutes, so asking more often asks for the same answer.
 */
export const REFRESH_MS = 15 * 60_000

/** And how soon to try again when there was no answer at all. */
export const RETRY_MS = 2 * 60_000

export function forecastUrl(place: Place): string {
  const params = new URLSearchParams({
    latitude: place.latitude.toFixed(4),
    longitude: place.longitude.toFixed(4),
    current: FIELDS,
    hourly: FIELDS,
    past_days: '1',
    forecast_days: '2',
    // Seconds since the epoch rather than local wall-clock strings: no zone
    // arithmetic on the way in, and no hour lost on the night clocks change.
    timeformat: 'unixtime',
    wind_speed_unit: 'ms',
    // Days that start at the place's midnight, so "today" is its today.
    timezone: 'auto',
  })
  return `${FORECAST}?${params}`
}

/** One number out of a block, or out of one of its columns. */
function number(block: Record<string, unknown>, key: string, i?: number) {
  const value = block[key]
  const one =
    i === undefined ? value : Array.isArray(value) ? value[i] : undefined
  return typeof one === 'number' && Number.isFinite(one) ? one : null
}

function reading(block: Record<string, unknown>, i?: number): Reading | null {
  const time = number(block, 'time', i)
  const code = number(block, 'weather_code', i)
  if (time === null || code === null) return null
  return {
    at: time * 1000,
    code,
    temperature: number(block, 'temperature_2m', i),
    cloud: number(block, 'cloud_cover', i),
    precipitation: number(block, 'precipitation', i) ?? 0,
    wind: number(block, 'wind_speed_10m', i) ?? 0,
    windFrom: number(block, 'wind_direction_10m', i) ?? 0,
  }
}

/**
 * Open-Meteo's answer as a forecast, or null if it is not one.
 *
 * It is somebody else's JSON, so nothing in it is taken on trust: an hour
 * with no time or no weather code is dropped rather than guessed at, and an
 * answer without a reading for now is no answer.
 */
export function readForecast(json: unknown): Forecast | null {
  if (!json || typeof json !== 'object') return null
  const body = json as Record<string, unknown>
  const current = body.current
  if (!current || typeof current !== 'object') return null
  const now = reading(current as Record<string, unknown>)
  if (!now) return null

  const hours: Reading[] = []
  const hourly = body.hourly as Record<string, unknown> | undefined
  if (hourly && Array.isArray(hourly.time)) {
    for (let i = 0; i < hourly.time.length; i++) {
      const hour = reading(hourly, i)
      if (hour) hours.push(hour)
    }
    hours.sort((a, b) => a.at - b.at)
  }
  return { now, hours }
}

const HOUR = 3_600_000

/**
 * The reading for a moment: the current conditions if they are about now,
 * and otherwise the hour it falls in.
 *
 * "About now" is measured from when the current reading was taken rather
 * than from the clock, so a forecast that has gone stale — the network went
 * away an hour ago — reads from its hours instead of holding up an hour-old
 * sky as the present one.
 */
export function readingAt(forecast: Forecast, moment: number): Reading {
  if (Math.abs(moment - forecast.now.at) <= HOUR / 2) return forecast.now
  let nearest: Reading | null = null
  for (const hour of forecast.hours) {
    if (moment >= hour.at && moment < hour.at + HOUR) return hour
    if (
      !nearest ||
      Math.abs(hour.at - moment) < Math.abs(nearest.at - moment)
    ) {
      nearest = hour
    }
  }
  return nearest ?? forecast.now
}

/** Rounded to about a kilometre: the weather is no different next door. */
const keyOf = (place: Place) =>
  `${place.latitude.toFixed(2)},${place.longitude.toFixed(2)}`

const kept = new Map<string, { forecast: Forecast; fetched: number }>()

/**
 * The forecast for a place, fetched or — if it was fetched in the last
 * fifteen minutes — remembered. Flicking Live off and on, or going to Tokyo
 * and back to Athens, does not ask again for what is already known.
 *
 * Rejects on a refusal or an answer that will not read, as well as on a
 * network that is not there, so the caller has one way to hear "no".
 */
export async function loadForecast(
  place: Place,
  now: number,
  signal?: AbortSignal,
): Promise<Forecast> {
  const key = keyOf(place)
  const known = kept.get(key)
  if (known && now - known.fetched < REFRESH_MS) return known.forecast
  const res = await fetch(forecastUrl(place), { signal })
  if (!res.ok) throw new Error(`forecast: ${res.status}`)
  const forecast = readForecast(await res.json())
  if (!forecast) throw new Error('forecast: unreadable answer')
  kept.set(key, { forecast, fetched: now })
  return forecast
}

/** For the tests, which each want to start with nothing remembered. */
export function forgetForecasts() {
  kept.clear()
}
