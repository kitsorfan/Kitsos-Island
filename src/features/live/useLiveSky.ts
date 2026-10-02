import { useEffect, useState } from 'react'
import { liveHeld, useGame } from '../../shared/state/store'
import type { LiveStatus } from '../../shared/state/store'
import { liveMoment } from './clock'
import { REFRESH_MS, RETRY_MS, loadForecast, readingAt } from './forecast'
import type { Forecast } from './forecast'
import type { Place } from './places'

/**
 * Keeps the island under the live sky while Live is on.
 *
 * Two clocks. The forecast is fetched when Live comes on or the place
 * changes, and again every quarter of an hour, which is as often as it
 * changes. And every half minute the store is told what the weather is for
 * the moment being shown, and works the light out for itself from the sun —
 * that is the clock that turns the lights off at sunset, and it needs no
 * network, so it keeps time even when the forecast cannot be had.
 *
 * Nothing runs at all while Live is off.
 */

/** How often the sky is looked at again. The sun is not quick. */
const TICK_MS = 30_000

/** What was heard, and for where: a forecast is no use for anywhere else. */
interface Heard {
  place: Place
  forecast: Forecast | null
  failed: boolean
}

export function useLiveSky() {
  const live = useGame((s) => s.live)
  const place = useGame((s) => s.livePlace)
  const clock = useGame((s) => s.liveClock)
  // Asked for so that the sky catches up the moment a game is over, rather
  // than up to half a minute after it.
  const held = useGame(liveHeld)
  const [heard, setHeard] = useState<Heard | null>(null)

  useEffect(() => {
    if (!live) return
    const abort = new AbortController()
    let timer: ReturnType<typeof setTimeout> | undefined
    const ask = async () => {
      try {
        const forecast = await loadForecast(place, Date.now(), abort.signal)
        if (abort.signal.aborted) return
        setHeard({ place, forecast, failed: false })
        timer = setTimeout(ask, REFRESH_MS)
      } catch {
        if (abort.signal.aborted) return
        // Keep what was already known about this place: an hour-old sky is
        // a better guess than no sky at all.
        setHeard((was) => ({
          place,
          forecast: was?.place === place ? was.forecast : null,
          failed: true,
        }))
        timer = setTimeout(ask, RETRY_MS)
      }
    }
    void ask()
    return () => {
      abort.abort()
      clearTimeout(timer)
    }
  }, [live, place])

  useEffect(() => {
    if (!live) return
    const report = () => {
      const mine = heard?.place === place ? heard : null
      const forecast = mine?.forecast ?? null
      const weather = forecast
        ? readingAt(forecast, liveMoment(place.timezone, clock, Date.now()))
        : null
      const status: LiveStatus = forecast
        ? 'ready'
        : mine?.failed
          ? 'offline'
          : 'loading'
      useGame.getState().syncLive(weather, status)
    }
    report()
    const id = setInterval(report, TICK_MS)
    return () => clearInterval(id)
  }, [live, place, clock, heard, held])
}
