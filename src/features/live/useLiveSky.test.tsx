/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useLiveSky } from './useLiveSky'
import { useGame } from '../../shared/state/store'
import { forgetForecasts } from './forecast'
import { PRESETS } from './places'

/**
 * The live sky reaches out to another site, so the first thing it is held
 * to is that it does not while Live is off. After that: the forecast it
 * hears arrives on the island, and a forecast it cannot hear is said so.
 */

const PRISTINE = useGame.getState()

/** Open-Meteo's answer, with the current reading taken just now. */
function answer(code: number) {
  const now = Math.floor(Date.now() / 1000)
  return {
    current: {
      time: now,
      weather_code: code,
      temperature_2m: 12,
      cloud_cover: 100,
      precipitation: 1,
      wind_speed_10m: 5,
      wind_direction_10m: 90,
    },
    hourly: { time: [now], weather_code: [code] },
  }
}

beforeEach(() => {
  forgetForecasts()
  useGame.setState(PRISTINE, true)
})

afterEach(() => vi.unstubAllGlobals())

describe('the live sky', () => {
  it('asks nobody anything while Live is off', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    renderHook(() => useLiveSky())
    await act(async () => {})
    expect(fetch).not.toHaveBeenCalled()
  })

  it('brings the weather to the island once it is on', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(answer(63)))),
    )
    renderHook(() => useLiveSky())
    act(() => useGame.getState().toggleLive())
    await waitFor(() => expect(useGame.getState().liveStatus).toBe('ready'))
    expect(useGame.getState().weather?.code).toBe(63)
  })

  it('says so when no forecast comes', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('offline')
      }),
    )
    renderHook(() => useLiveSky())
    act(() => useGame.getState().toggleLive())
    await waitFor(() => expect(useGame.getState().liveStatus).toBe('offline'))
    expect(useGame.getState().weather).toBeNull()
  })

  it('asks again for a new place, and takes its weather instead', async () => {
    const fetch = vi.fn(
      async (url: string) =>
        new Response(
          JSON.stringify(answer(url.includes('latitude=35.6895') ? 73 : 0)),
        ),
    )
    vi.stubGlobal('fetch', fetch)
    renderHook(() => useLiveSky())
    act(() => useGame.getState().toggleLive())
    await waitFor(() => expect(useGame.getState().weather?.code).toBe(0))
    act(() => useGame.getState().setLivePlace(PRESETS[4]))
    await waitFor(() => expect(useGame.getState().weather?.code).toBe(73))
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
