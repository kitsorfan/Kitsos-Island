import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  REFRESH_MS,
  forecastUrl,
  forgetForecasts,
  loadForecast,
  readForecast,
  readingAt,
} from './forecast'
import { ATHENS, PRESETS } from './places'

/** 12:00 UTC on 2 October 2026, give or take the quarter hour. */
const NOW = 1_790_942_400

/** The shape Open-Meteo answers in, cut down to a few hours. */
function answer(code = 1) {
  const hours = [-2, -1, 0, 1, 2, 3].map((h) => NOW + h * 3600)
  return {
    timezone: 'Europe/Athens',
    current: {
      time: NOW + 900,
      interval: 900,
      weather_code: code,
      temperature_2m: 21.1,
      cloud_cover: 43,
      precipitation: 0,
      wind_speed_10m: 6.36,
      wind_direction_10m: 19,
    },
    hourly: {
      time: hours,
      weather_code: [0, 0, 1, 61, 63, 95],
      temperature_2m: [18, 19, 21, 20, 19, 17],
      cloud_cover: [0, 5, 40, 90, 100, 100],
      precipitation: [0, 0, 0, 0.6, 2.1, 6],
      wind_speed_10m: [3, 3, 6, 8, 9, 12],
      wind_direction_10m: [10, 10, 19, 200, 210, 220],
    },
  }
}

beforeEach(() => forgetForecasts())
afterEach(() => vi.unstubAllGlobals())

describe('the request', () => {
  it('asks Open-Meteo for now and for yesterday to tomorrow, by the hour', () => {
    const url = new URL(forecastUrl(ATHENS))
    expect(url.origin).toBe('https://api.open-meteo.com')
    expect(url.searchParams.get('latitude')).toBe('37.9838')
    expect(url.searchParams.get('current')).toContain('weather_code')
    expect(url.searchParams.get('hourly')).toContain('weather_code')
    expect(url.searchParams.get('past_days')).toBe('1')
    expect(url.searchParams.get('forecast_days')).toBe('2')
    expect(url.searchParams.get('timeformat')).toBe('unixtime')
  })
})

describe('reading the answer', () => {
  it('reads now and every hour', () => {
    const forecast = readForecast(answer())!
    expect(forecast.now).toMatchObject({
      at: (NOW + 900) * 1000,
      code: 1,
      temperature: 21.1,
      cloud: 43,
      wind: 6.36,
      windFrom: 19,
    })
    expect(forecast.hours).toHaveLength(6)
    expect(forecast.hours[3].code).toBe(61)
  })

  it('is nothing without a reading for now', () => {
    expect(readForecast(null)).toBeNull()
    expect(readForecast({ hourly: answer().hourly })).toBeNull()
    expect(readForecast({ current: { time: NOW } })).toBeNull()
  })

  it('drops an hour with no weather to it, and keeps the rest', () => {
    const body = answer()
    body.hourly.weather_code[2] = null as unknown as number
    expect(readForecast(body)!.hours).toHaveLength(5)
  })

  it('makes do without the figures it can live without', () => {
    const body = answer() as Record<string, unknown>
    body.current = { time: NOW, weather_code: 3 }
    const now = readForecast(body)!.now
    expect(now.temperature).toBeNull()
    expect(now.cloud).toBeNull()
    expect(now.wind).toBe(0)
  })
})

describe('the reading for a moment', () => {
  const forecast = readForecast(answer())!

  it('is the current one for about now', () => {
    expect(readingAt(forecast, NOW * 1000)).toBe(forecast.now)
  })

  it('is the hour it falls in, later on', () => {
    expect(readingAt(forecast, (NOW + 2 * 3600 + 1200) * 1000).code).toBe(63)
  })

  it('is the nearest hour there is, past the end of the forecast', () => {
    expect(readingAt(forecast, (NOW + 48 * 3600) * 1000).code).toBe(95)
  })

  it('reads a stale current reading from the hours instead', () => {
    // Fetched an hour and a half ago: "now" is not now any more.
    const stale = readForecast(answer())!
    stale.now = { ...stale.now, at: (NOW - 2 * 3600) * 1000 }
    expect(readingAt(stale, NOW * 1000).code).toBe(1)
  })
})

describe('loading it', () => {
  it('fetches once and then remembers for a quarter of an hour', async () => {
    const fetch = vi.fn(async () => new Response(JSON.stringify(answer())))
    vi.stubGlobal('fetch', fetch)
    const t = NOW * 1000
    await loadForecast(ATHENS, t)
    await loadForecast(ATHENS, t + REFRESH_MS - 1)
    expect(fetch).toHaveBeenCalledTimes(1)
    await loadForecast(ATHENS, t + REFRESH_MS)
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('keeps each place apart', async () => {
    const fetch = vi.fn(async () => new Response(JSON.stringify(answer())))
    vi.stubGlobal('fetch', fetch)
    await loadForecast(ATHENS, 0)
    await loadForecast(PRESETS[4], 0)
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('says no to a refusal, and to an answer that is not a forecast', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('slow down', { status: 429 })),
    )
    await expect(loadForecast(ATHENS, 0)).rejects.toThrow()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}')),
    )
    await expect(loadForecast(ATHENS, 0)).rejects.toThrow()
  })
})
