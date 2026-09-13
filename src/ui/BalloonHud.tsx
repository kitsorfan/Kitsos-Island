import { useEffect, useRef, useState } from 'react'
import {
  BALLOON,
  CALL_TOTAL,
  MIN_ALT,
  MAX_ALT,
  STOCK_MAX,
  nearestCall,
} from '../game/balloon'
import type { Payload } from '../game/balloon'
import { groundHeight } from '../game/terrain'
import { useGame } from '../state/store'
import { useCoarsePointer } from './useCoarsePointer'
import { useT } from '../i18n/useT'

interface Readout {
  served: number
  water: number
  confetti: number
  /** Height of the basket over the ground, in units. */
  altitude: number
  /** How hard the breeze and the burner are pushing him along. */
  drift: number
  burning: boolean
  /** The nearest gathering still waiting, and what it is asking for. */
  next: { distance: number; want: Payload; label: string } | null
  feed: { text: string; kind: 'good' | 'bad'; at: number } | null
}

const EMPTY: Readout = {
  served: 0,
  water: STOCK_MAX,
  confetti: STOCK_MAX,
  altitude: 0,
  drift: 0,
  burning: false,
  next: null,
  feed: null,
}

/**
 * The flight is stepped outside React, so the panel reads it on a frame of
 * its own rather than pushing every parcel through the store.
 */
function useReadout(active: boolean): Readout {
  const [state, setState] = useState<Readout>(EMPTY)
  const last = useRef(0)

  useEffect(() => {
    if (!active) return
    let raf = 0
    const tick = (now: number) => {
      // A tenth of a second is as fine as any of these need to read.
      if (now - last.current > 90) {
        last.current = now
        const near = nearestCall()
        setState({
          served: BALLOON.count,
          water: BALLOON.stock.water,
          confetti: BALLOON.stock.confetti,
          altitude: BALLOON.y - groundHeight(BALLOON.x, BALLOON.z),
          drift: Math.hypot(BALLOON.vx, BALLOON.vz),
          burning: BALLOON.burn > 0.4,
          next: near
            ? {
                distance: near.distance,
                want: near.call.want,
                label: near.call.label,
              }
            : null,
          feed: BALLOON.feed,
        })
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])

  return state
}

function Rack({
  kind,
  count,
  label,
}: {
  kind: Payload
  count: number
  label: string
}) {
  return (
    <div className={`bl__rack bl__rack--${kind}`}>
      <span className="bl__rack-label">{label}</span>
      <span className="bl__rack-dots">
        {Array.from({ length: STOCK_MAX }, (_, i) => (
          <span
            key={i}
            className={`bl__pip${i < count ? '' : ' bl__pip--spent'}`}
          />
        ))}
      </span>
    </div>
  )
}

export function BalloonHud() {
  const t = useT()
  const flying = useGame((s) => s.balloon?.status === 'flying')
  const readout = useReadout(Boolean(flying))
  const coarse = useCoarsePointer()

  if (!flying) return null

  // Where the basket sits between the ground and the ceiling, as a fraction.
  const band = Math.max(
    0,
    Math.min(1, (readout.altitude - MIN_ALT) / (MAX_ALT - MIN_ALT)),
  )

  return (
    <div className="bl">
      <div className="bl__panel">
        <span className="bl__label">{t('Balloon drop')}</span>

        <div className="bl__served">
          <span className="bl__balloon" aria-hidden>
            🎈
          </span>
          <strong key={readout.served}>{readout.served}</strong>
          <em>of {CALL_TOTAL} served</em>
        </div>

        <div className="bl__bar">
          <div
            className="bl__bar-fill"
            style={{ width: `${(readout.served / CALL_TOTAL) * 100}%` }}
          />
        </div>

        <div className="bl__racks">
          <Rack kind="water" count={readout.water} label="Bombs" />
          <Rack kind="confetti" count={readout.confetti} label="Confetti" />
        </div>

        <div className="bl__row">
          <span className="bl__alt">
            {Math.round(readout.altitude)} <em>{t('m up')}</em>
          </span>
          <span className="bl__gauge" aria-hidden>
            <span
              className="bl__gauge-mark"
              style={{ left: `${band * 100}%` }}
            />
          </span>
          <span className="bl__drift">
            {Math.round(readout.drift * 3)} <em>{t('km/h')}</em>
          </span>
          {readout.burning && <span className="bl__flag">{t('Burner')}</span>}
        </div>

        <div className="bl__row bl__row--next">
          {readout.next === null ? (
            <span className="bl__flag bl__flag--done">
              {t('Everyone served')}
            </span>
          ) : (
            <span className="bl__next">
              <span
                className={`bl__want bl__want--${readout.next.want}`}
                aria-hidden
              >
                {readout.next.want === 'water' ? '💧' : '🎉'}
              </span>
              {readout.next.label} —{' '}
              <strong>{Math.round(readout.next.distance)}m</strong>
            </span>
          )}
        </div>
      </div>

      {readout.feed && (
        <p
          key={readout.feed.at}
          className={`bl__feed bl__feed--${readout.feed.kind}`}
        >
          {readout.feed.text}
        </p>
      )}

      <p className="bl__keys">
        {coarse ? (
          <>
            <kbd>Stick</kbd> {t('drift')} · <kbd>BURN</kbd> {t('climb')} ·{' '}
            <kbd>💧</kbd>
            <kbd>🎉</kbd> {t('drop')}
          </>
        ) : (
          <>
            <kbd>W</kbd>
            <kbd>S</kbd> {t('drift')} · <kbd>A</kbd>
            <kbd>D</kbd> {t('turn')} · <kbd>Shift</kbd> {t('burner')} ·{' '}
            <kbd>Ctrl</kbd> {t('vent')} · <kbd>Space</kbd> {t('bomb')} ·{' '}
            <kbd>F</kbd> {t('confetti')}
          </>
        )}
      </p>
    </div>
  )
}
