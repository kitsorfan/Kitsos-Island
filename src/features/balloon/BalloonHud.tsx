import { useEffect, useRef, useState } from 'react'
import {
  BALLOON,
  CALL_TOTAL,
  MIN_ALT,
  MAX_ALT,
  STOCK_MAX,
  nearestCall,
} from './balloonLogic'
import type { Payload } from './balloonLogic'
import { groundHeight } from '../island/terrainLogic'
import { useGame } from '../../shared/state/store'
import { useCoarsePointer } from '../../shared/ui/useCoarsePointer'
import { useScreen } from '../../shared/ui/useScreen'
import { useT } from '../../shared/i18n/useT'
import { fill, rich } from '../../shared/i18n'
import type { Slots } from '../../shared/i18n'

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
  feed: { text: string; slots?: Slots; kind: 'good' | 'bad'; at: number } | null
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
  const { mobile } = useScreen()

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
          {/* The balloon says what is being counted; a phone has no room to. */}
          <em>
            {fill(t(mobile ? 'of {total}' : 'of {total} served'), {
              total: CALL_TOTAL,
            })}
          </em>
        </div>

        <div className="bl__bar">
          <div
            className="bl__bar-fill"
            style={{ width: `${(readout.served / CALL_TOTAL) * 100}%` }}
          />
        </div>

        <div className="bl__racks">
          <Rack kind="water" count={readout.water} label={t('Bombs')} />
          <Rack
            kind="confetti"
            count={readout.confetti}
            label={t('Confetti')}
          />
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
              {rich(t('{place}: <b>{metres}m</b>'), {
                place: t(readout.next.label),
                metres: Math.round(readout.next.distance),
              })}
            </span>
          )}
        </div>
      </div>

      {readout.feed && (
        <p
          key={readout.feed.at}
          className={`bl__feed bl__feed--${readout.feed.kind}`}
        >
          {fill(t(readout.feed.text), t(readout.feed.slots ?? {}))}
        </p>
      )}

      <p className="bl__keys">
        {coarse ? (
          <>
            <kbd>{t('Stick')}</kbd> {t('drift')} · <kbd>{t('UP')}</kbd>
            <kbd>{t('DOWN')}</kbd> {t('climb and sink')} · <kbd>💧</kbd>
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
