import { useEffect, useState } from 'react'
import { inGame, useGame } from '../../shared/state/store'
import * as sfx from '../../shared/engine/audio'
import { useT } from '../../shared/i18n/useT'
import { fill } from '../../shared/i18n'
import { DAY_MINUTES, clockFace, minutesAt } from './clock'
import { PRESETS, findPlaces, samePlace } from './places'
import type { Place } from './places'
import { SKY_LABEL, conditionsOf, skyIcon } from './weatherLogic'

/**
 * Where and when the live sky is: the place, and the time of day there.
 *
 * The place is a tap on one of a handful, or a search for anywhere else.
 * The time is a slider across the day at that place, which pins it — the
 * light follows the sun to wherever it is pinned, and the weather to the
 * forecast for that hour — and Now lets it go again, back to the clock.
 */

/** A search waits for the typing to stop before it goes out. */
const SETTLE_MS = 350

/** The slider moves in quarter hours, which is finer than the forecast. */
const STEP = 15

/** The clock on the card, moved on as the minutes go by. */
function useNow(every = 15_000) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), every)
    return () => clearInterval(id)
  }, [every])
  return now
}

type Search =
  | { query: string; state: 'looking' }
  | { query: string; state: 'found'; places: Place[] }
  | { query: string; state: 'failed' }

export function LiveCard() {
  const t = useT()
  const locale = useGame((s) => s.locale)
  const place = useGame((s) => s.livePlace)
  const clock = useGame((s) => s.liveClock)
  const weather = useGame((s) => s.weather)
  const status = useGame((s) => s.liveStatus)
  const night = useGame((s) => s.night)
  // The sky stays as the game found it, so nothing on the card can move it.
  const locked = useGame(inGame)
  const setLivePlace = useGame((s) => s.setLivePlace)
  const setLiveClock = useGame((s) => s.setLiveClock)
  const now = useNow()
  const showing = clock ?? minutesAt(place.timezone, now)
  const where = t(place.name)

  const [query, setQuery] = useState('')
  const [search, setSearch] = useState<Search | null>(null)
  const typed = query.trim()

  useEffect(() => {
    if (typed.length < 2) return
    const abort = new AbortController()
    const wait = setTimeout(() => {
      setSearch({ query: typed, state: 'looking' })
      findPlaces(typed, locale, abort.signal).then(
        (places) => setSearch({ query: typed, state: 'found', places }),
        () => {
          if (!abort.signal.aborted)
            setSearch({ query: typed, state: 'failed' })
        },
      )
    }, SETTLE_MS)
    return () => {
      clearTimeout(wait)
      abort.abort()
    }
  }, [typed, locale])

  /* Only the answer to what is in the box now; an older one is no answer. */
  const answer = typed.length >= 2 && search?.query === typed ? search : null

  const pick = (next: Place) => {
    sfx.confirm()
    setLivePlace(next)
    setQuery('')
  }

  const sky = weather ? conditionsOf(weather).sky : null
  const reading =
    weather && sky
      ? [
          t(SKY_LABEL[sky]),
          weather.temperature === null
            ? null
            : `${Math.round(weather.temperature)}°C`,
          fill(t('Wind {speed} km/h'), {
            speed: Math.round(weather.wind * 3.6),
          }),
        ]
          .filter(Boolean)
          .join(' · ')
      : status === 'offline'
        ? t(
            'No forecast reached the island, so the sky stays fair. The clock still keeps time.',
          )
        : t('Reading the sky…')

  return (
    <div className="settings-card live-card">
      <h3>{t('Live sky')}</h3>

      <p className="live-card__where">
        <strong>{where}</strong>
        {place.detail && <span> · {t(place.detail)}</span>}
      </p>
      <p className="live-card__now">
        <span className="live-card__icon" aria-hidden>
          {sky ? skyIcon(sky, night) : night ? '🌙' : '☀️'}
        </span>
        <span>
          <strong>{clockFace(showing)}</strong> · {reading}
        </span>
      </p>

      {locked && (
        <p className="settings-card__warn">
          {t('The sky stays as it is until the game is over')}
        </p>
      )}

      <div className="setting setting--stacked">
        <span className="setting__name">{t('Place')}</span>
        <div className="live-card__places" role="group" aria-label={t('Place')}>
          {PRESETS.map((p) => {
            const here = samePlace(p, place)
            return (
              <button
                key={p.name}
                className={`chip${here ? ' chip--on' : ''}`}
                aria-pressed={here}
                disabled={locked}
                onClick={() => pick(p)}
              >
                {t(p.name)}
              </button>
            )
          })}
        </div>
        <input
          className="live-card__search"
          type="search"
          value={query}
          disabled={locked}
          placeholder={t('Search for a town…')}
          aria-label={t('Search for a town')}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            // Enter takes the first one found, which is nearly always it.
            if (event.key !== 'Enter' || answer?.state !== 'found') return
            const [first] = answer.places
            if (first) pick(first)
          }}
        />
        {answer && (
          <div className="live-card__found" aria-live="polite">
            {answer.state === 'looking' ? (
              <p>{t('Looking…')}</p>
            ) : answer.state === 'failed' ? (
              <p>{t('The search could not be reached.')}</p>
            ) : answer.places.length === 0 ? (
              <p>{t('Nowhere by that name.')}</p>
            ) : (
              answer.places.map((p) => (
                <button
                  key={`${p.latitude},${p.longitude}`}
                  className="live-card__result"
                  disabled={locked}
                  onClick={() => pick(p)}
                >
                  <strong>{p.name}</strong>
                  {p.detail && <span>{p.detail}</span>}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="setting setting--stacked">
        <span className="setting__name">{t('Time')}</span>
        <div className="live-card__time">
          <input
            className="setting__slider"
            type="range"
            min={0}
            max={DAY_MINUTES - STEP}
            step={STEP}
            value={showing - (showing % STEP)}
            disabled={locked}
            onChange={(event) => setLiveClock(Number(event.target.value))}
            aria-label={fill(t('Time of day in {place}'), { place: where })}
            aria-valuetext={clockFace(showing)}
          />
          <button
            className={`chip${clock === null ? ' chip--on' : ''}`}
            aria-pressed={clock === null}
            disabled={locked}
            onClick={() => {
              sfx.confirm()
              setLiveClock(null)
            }}
          >
            {t('Now')}
          </button>
        </div>
      </div>

      <p className="settings-card__hint">
        {clock === null
          ? fill(t('Keeping time with {place}.'), { place: where })
          : t('Held at this hour. The weather is the forecast for it.')}
      </p>

      <p className="live-card__credit">
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
          {t('Weather by Open-Meteo.com')}
        </a>
      </p>
    </div>
  )
}
