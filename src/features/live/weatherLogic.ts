import type { Reading } from './forecast'

/**
 * A reading turned into weather the island can draw.
 *
 * The forecast speaks in WMO codes — 61 is light rain, 95 a thunderstorm —
 * and the island draws in amounts: how much of the sky to cloud over, how
 * hard to rain, how thick the haze. This is the one place one is turned into
 * the other, so the sky, the light, the rain and the label on the card all
 * agree about what kind of day it is.
 */

/** The kinds of weather the island tells apart. */
export type Sky =
  | 'clear'
  | 'fair'
  | 'cloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'storm'

export interface Conditions {
  sky: Sky
  /** How much of the sky is cloud, 0 to 1. */
  cloud: number
  /** How hard it is raining, 0 to 1. */
  rain: number
  /** How hard it is snowing, 0 to 1. */
  snow: number
  /** How thick the air is, 0 to 1. Rain and snow bring some of their own. */
  fog: number
  /** Lightning, and the thunder after it. */
  storm: boolean
  /** Metres a second, for the slant of the rain and the drift of the cloud. */
  wind: number
  /** Where it blows from, in degrees clockwise from north. */
  windFrom: number
}

/** The island's own weather, which is what it has when Live is off. */
export const FAIR: Conditions = {
  sky: 'clear',
  cloud: 0,
  rain: 0,
  snow: 0,
  fog: 0,
  storm: false,
  wind: 0,
  windFrom: 0,
}

/** Each WMO code the forecast uses: what kind it is, and how much of it. */
const CODES: Record<number, { sky: Sky; amount: number }> = {
  0: { sky: 'clear', amount: 0 },
  1: { sky: 'fair', amount: 0 },
  2: { sky: 'cloudy', amount: 0 },
  3: { sky: 'overcast', amount: 0 },
  45: { sky: 'fog', amount: 0.8 },
  /* Rime fog: the same to look at, and it freezes on what it touches. */
  48: { sky: 'fog', amount: 1 },
  51: { sky: 'drizzle', amount: 0.15 },
  53: { sky: 'drizzle', amount: 0.25 },
  55: { sky: 'drizzle', amount: 0.35 },
  56: { sky: 'drizzle', amount: 0.2 },
  57: { sky: 'drizzle', amount: 0.35 },
  61: { sky: 'rain', amount: 0.45 },
  63: { sky: 'rain', amount: 0.7 },
  65: { sky: 'rain', amount: 1 },
  66: { sky: 'rain', amount: 0.45 },
  67: { sky: 'rain', amount: 0.8 },
  71: { sky: 'snow', amount: 0.35 },
  73: { sky: 'snow', amount: 0.65 },
  75: { sky: 'snow', amount: 1 },
  77: { sky: 'snow', amount: 0.3 },
  80: { sky: 'rain', amount: 0.45 },
  81: { sky: 'rain', amount: 0.7 },
  82: { sky: 'rain', amount: 1 },
  85: { sky: 'snow', amount: 0.5 },
  86: { sky: 'snow', amount: 0.9 },
  95: { sky: 'storm', amount: 0.8 },
  96: { sky: 'storm', amount: 1 },
  99: { sky: 'storm', amount: 1 },
}

/**
 * How cloudy each kind of sky is at the least, whatever the cloud figure
 * says. The two come from different parts of the model and do not always
 * agree, and a rainstorm under a sky that is "20% cloud" is the one that
 * looks wrong.
 */
const LEAST_CLOUD: Record<Sky, number> = {
  clear: 0,
  fair: 0.1,
  cloudy: 0.35,
  overcast: 0.9,
  fog: 0.6,
  drizzle: 0.75,
  rain: 0.85,
  snow: 0.85,
  storm: 1,
}

/** And the most, so a clear sky stays clear when the cloud figure is high cirrus. */
const MOST_CLOUD: Record<Sky, number> = {
  clear: 0.15,
  fair: 0.45,
  cloudy: 0.8,
  overcast: 1,
  fog: 1,
  drizzle: 1,
  rain: 1,
  snow: 1,
  storm: 1,
}

/**
 * A code the table does not know is read by the range it falls in, which is
 * how WMO lays the codes out, and anything outside every range is clear.
 */
function lookUp(code: number): { sky: Sky; amount: number } {
  const known = CODES[code]
  if (known) return known
  if (code >= 95) return { sky: 'storm', amount: 0.8 }
  if (code >= 80) return { sky: 'rain', amount: 0.6 }
  if (code >= 70) return { sky: 'snow', amount: 0.5 }
  if (code >= 60) return { sky: 'rain', amount: 0.6 }
  if (code >= 50) return { sky: 'drizzle', amount: 0.25 }
  if (code >= 40) return { sky: 'fog', amount: 0.8 }
  return { sky: 'clear', amount: 0 }
}

const clamp = (value: number, low: number, high: number) =>
  Math.max(low, Math.min(high, value))

export function skyOf(code: number): Sky {
  return lookUp(code).sky
}

/** No reading — Live off, or no answer yet — is the island's own fair sky. */
export function conditionsOf(reading: Reading | null): Conditions {
  if (!reading) return FAIR
  const { sky, amount } = lookUp(reading.code)
  const reported =
    reading.cloud === null ? LEAST_CLOUD[sky] : reading.cloud / 100
  const wet = sky === 'drizzle' || sky === 'rain' || sky === 'storm'
  return {
    sky,
    cloud: clamp(reported, LEAST_CLOUD[sky], MOST_CLOUD[sky]),
    rain: wet ? amount : 0,
    snow: sky === 'snow' ? amount : 0,
    // Rain thickens the air and snow more so; fog is the air. A grey day
    // has a little haze of its own, which is half of why it looks grey.
    fog:
      sky === 'fog'
        ? amount
        : wet
          ? amount * 0.5
          : sky === 'snow'
            ? amount * 0.6
            : sky === 'overcast'
              ? 0.15
              : 0,
    storm: sky === 'storm',
    wind: clamp(reading.wind, 0, 40),
    windFrom: reading.windFrom,
  }
}

/** What the card calls each one. */
export const SKY_LABEL: Record<Sky, string> = {
  clear: 'Clear',
  fair: 'Mostly clear',
  cloudy: 'Partly cloudy',
  overcast: 'Overcast',
  fog: 'Fog',
  drizzle: 'Drizzle',
  rain: 'Rain',
  snow: 'Snow',
  storm: 'Thunderstorm',
}

/** And the picture on the button. A clear night has the moon, not the sun. */
export function skyIcon(sky: Sky, night: boolean): string {
  switch (sky) {
    case 'clear':
      return night ? '🌙' : '☀️'
    case 'fair':
      return night ? '🌙' : '🌤️'
    case 'cloudy':
      return night ? '☁️' : '⛅'
    case 'overcast':
      return '☁️'
    case 'fog':
      return '🌫️'
    case 'drizzle':
      return night ? '🌧️' : '🌦️'
    case 'rain':
      return '🌧️'
    case 'snow':
      return '🌨️'
    case 'storm':
      return '⛈️'
  }
}

/**
 * How far over the light goes: none at all under a few clouds, and most of
 * the way under a sky that is all cloud. Puffs of fair-weather cloud do not
 * take the sun away; a grey lid does.
 */
export function overcast(weather: Conditions): number {
  return clamp((weather.cloud - 0.4) / 0.55, 0, 1)
}

/**
 * How dark the cloud is underneath, 0 to 1. A grey sky is not yet a dark
 * one: rain darkens it, a storm most of all, and snow hardly at all.
 */
export function gloom(weather: Conditions): number {
  const storm = weather.storm ? 0.45 : 0
  return clamp(weather.rain * 0.55 + storm + weather.snow * 0.15, 0, 1)
}

/**
 * Which way the weather is going, as a direction on the island: x east and
 * z south, the way the map is drawn, so a north wind blows towards +z.
 */
export function windward(weather: Conditions): [number, number] {
  const toward = ((weather.windFrom + 180) * Math.PI) / 180
  return [Math.sin(toward), -Math.cos(toward)]
}
