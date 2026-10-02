import { describe, expect, it } from 'vitest'
import type { Reading } from './forecast'
import {
  FAIR,
  SKY_LABEL,
  conditionsOf,
  gloom,
  overcast,
  skyIcon,
  skyOf,
  windward,
} from './weatherLogic'

function reading(code: number, extra: Partial<Reading> = {}): Reading {
  return {
    at: 0,
    code,
    temperature: 20,
    cloud: null,
    precipitation: 0,
    wind: 4,
    windFrom: 0,
    ...extra,
  }
}

describe('what kind of weather a code is', () => {
  it('reads the codes the forecast uses', () => {
    expect(skyOf(0)).toBe('clear')
    expect(skyOf(3)).toBe('overcast')
    expect(skyOf(45)).toBe('fog')
    expect(skyOf(53)).toBe('drizzle')
    expect(skyOf(63)).toBe('rain')
    expect(skyOf(81)).toBe('rain')
    expect(skyOf(75)).toBe('snow')
    expect(skyOf(86)).toBe('snow')
    expect(skyOf(99)).toBe('storm')
  })

  it('reads one it does not know by the range it falls in', () => {
    expect(skyOf(64)).toBe('rain')
    expect(skyOf(97)).toBe('storm')
    expect(skyOf(-1)).toBe('clear')
  })

  it('has a name and a picture for every kind', () => {
    for (const sky of Object.keys(SKY_LABEL) as (keyof typeof SKY_LABEL)[]) {
      expect(SKY_LABEL[sky]).toBeTruthy()
      expect(skyIcon(sky, false)).toBeTruthy()
      expect(skyIcon(sky, true)).toBeTruthy()
    }
  })

  it('shows the moon on a clear night rather than the sun', () => {
    expect(skyIcon('clear', true)).toBe('🌙')
    expect(skyIcon('clear', false)).toBe('☀️')
  })
})

describe('the weather the island draws', () => {
  it('is fair with no reading at all', () => {
    expect(conditionsOf(null)).toBe(FAIR)
  })

  it('rains in rain, snows in snow, and does neither in sunshine', () => {
    expect(conditionsOf(reading(63)).rain).toBeGreaterThan(0)
    expect(conditionsOf(reading(63)).snow).toBe(0)
    expect(conditionsOf(reading(73)).snow).toBeGreaterThan(0)
    expect(conditionsOf(reading(73)).rain).toBe(0)
    expect(conditionsOf(reading(0)).rain).toBe(0)
    expect(conditionsOf(reading(0)).snow).toBe(0)
  })

  it('rains harder the heavier the code says', () => {
    const light = conditionsOf(reading(61)).rain
    const heavy = conditionsOf(reading(65)).rain
    expect(heavy).toBeGreaterThan(light)
  })

  it('only storms in a storm', () => {
    expect(conditionsOf(reading(95)).storm).toBe(true)
    expect(conditionsOf(reading(65)).storm).toBe(false)
  })

  it('never rains out of a clear sky, whatever the cloud figure says', () => {
    // The two figures come from different parts of the model.
    expect(conditionsOf(reading(65, { cloud: 10 })).cloud).toBeGreaterThan(0.8)
    expect(conditionsOf(reading(0, { cloud: 90 })).cloud).toBeLessThan(0.2)
  })

  it('keeps every amount between none and all', () => {
    for (let code = 0; code < 100; code++) {
      const c = conditionsOf(reading(code, { cloud: 100, wind: 500 }))
      for (const amount of [c.cloud, c.rain, c.snow, c.fog]) {
        expect(amount).toBeGreaterThanOrEqual(0)
        expect(amount).toBeLessThanOrEqual(1)
      }
      expect(c.wind).toBeLessThanOrEqual(40)
    }
  })

  it('thickens the air in fog more than in rain', () => {
    expect(conditionsOf(reading(45)).fog).toBeGreaterThan(
      conditionsOf(reading(63)).fog,
    )
  })
})

describe('the light under it', () => {
  it('does not go grey under a few fair-weather clouds', () => {
    expect(overcast(conditionsOf(reading(1, { cloud: 30 })))).toBe(0)
  })

  it('goes most of the way grey under a sky that is all cloud', () => {
    expect(overcast(conditionsOf(reading(3, { cloud: 100 })))).toBeGreaterThan(
      0.9,
    )
  })
})

describe('how dark the cloud is', () => {
  it('is not dark at all on a grey day with nothing falling', () => {
    expect(gloom(conditionsOf(reading(3, { cloud: 100 })))).toBe(0)
  })

  it('is darker in rain, and darkest in a storm', () => {
    const rain = gloom(conditionsOf(reading(63)))
    const storm = gloom(conditionsOf(reading(99)))
    expect(rain).toBeGreaterThan(0)
    expect(storm).toBeGreaterThan(rain)
    expect(storm).toBeLessThanOrEqual(1)
  })
})

describe('which way the weather goes', () => {
  it('blows south on a north wind, and east on a west one', () => {
    const [sx, sz] = windward({ ...FAIR, windFrom: 0 })
    expect(sx).toBeCloseTo(0)
    expect(sz).toBeCloseTo(1)
    const [ex, ez] = windward({ ...FAIR, windFrom: 270 })
    expect(ex).toBeCloseTo(1)
    expect(ez).toBeCloseTo(0)
  })
})
