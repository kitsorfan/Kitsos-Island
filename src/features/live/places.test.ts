import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ATHENS,
  PRESETS,
  checkPlace,
  findPlaces,
  readPlaces,
  samePlace,
  searchUrl,
} from './places'

afterEach(() => {
  vi.unstubAllGlobals()
})

/** What the geocoder sent back for Hamburg, asked in Greek, cut down. */
const HAMBURG = {
  results: [
    {
      id: 2911298,
      name: 'Αμβούργο',
      latitude: 53.55073,
      longitude: 9.99302,
      timezone: 'Europe/Berlin',
      country: 'Γερμανία',
      admin1: 'Αμβούργο',
    },
    {
      id: 4113607,
      name: 'Hamburg',
      latitude: 33.22818,
      longitude: -91.79763,
      timezone: 'America/Chicago',
      country: 'ΗΠΑ',
      admin1: 'Άρκανσο',
    },
  ],
}

describe('the places on offer', () => {
  it('starts in Athens', () => {
    expect(PRESETS[0]).toBe(ATHENS)
    expect(ATHENS.timezone).toBe('Europe/Athens')
  })

  it('offers only real places', () => {
    for (const place of PRESETS) expect(checkPlace(place)).toEqual(place)
  })

  it('knows a place when it sees it again', () => {
    expect(samePlace(ATHENS, { ...ATHENS, name: 'Αθήνα' })).toBe(true)
    expect(samePlace(ATHENS, PRESETS[1])).toBe(false)
  })
})

describe('a place read back from somewhere else', () => {
  it('needs a name, a zone and coordinates on the globe', () => {
    expect(checkPlace(null)).toBeNull()
    expect(checkPlace({ ...ATHENS, name: '  ' })).toBeNull()
    expect(checkPlace({ ...ATHENS, timezone: undefined })).toBeNull()
    expect(checkPlace({ ...ATHENS, latitude: 900 })).toBeNull()
    expect(checkPlace({ ...ATHENS, longitude: '23' })).toBeNull()
  })

  it('does without a region', () => {
    expect(checkPlace({ ...ATHENS, detail: undefined })?.detail).toBe('')
  })
})

describe('the search', () => {
  it('asks in the island’s language', () => {
    const url = new URL(searchUrl(' Hamburg ', 'el'))
    expect(url.origin).toBe('https://geocoding-api.open-meteo.com')
    expect(url.searchParams.get('name')).toBe('Hamburg')
    expect(url.searchParams.get('language')).toBe('el')
  })

  it('reads the answer as places, region and country beside the name', () => {
    const [city, town] = readPlaces(HAMBURG)
    expect(city).toMatchObject({
      name: 'Αμβούργο',
      timezone: 'Europe/Berlin',
      // The region is the city's own name, so it is said once.
      detail: 'Γερμανία',
    })
    expect(town.detail).toBe('Άρκανσο, ΗΠΑ')
  })

  it('drops what it cannot place, and an answer with nothing in it', () => {
    expect(readPlaces({ results: [{ name: 'Nowhere' }] })).toEqual([])
    expect(readPlaces({})).toEqual([])
    expect(readPlaces(null)).toEqual([])
  })

  it('does not go out for one letter', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    expect(await findPlaces('H', 'en')).toEqual([])
    expect(fetch).not.toHaveBeenCalled()
  })

  it('finds a place', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(HAMBURG))),
    )
    const found = await findPlaces('Hamburg', 'el')
    expect(found.map((p) => p.name)).toEqual(['Αμβούργο', 'Hamburg'])
  })

  it('finds nothing in a refusal or a page that is not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('busy', { status: 429 })),
    )
    expect(await findPlaces('Hamburg', 'en')).toEqual([])
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('<html>')),
    )
    expect(await findPlaces('Hamburg', 'en')).toEqual([])
  })
})
