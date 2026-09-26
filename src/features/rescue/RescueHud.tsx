import { useEffect, useRef, useState } from 'react'
import { LAST_GASP, RESCUE, SLOW, SOULS } from './rescue'
import { useGame } from '../../shared/state/store'
import { useCoarsePointer } from '../../shared/ui/useCoarsePointer'
import { useScreen } from '../../shared/ui/useScreen'
import { useT } from '../../shared/i18n/useT'

interface Light {
  id: number
  /** Seconds of flare left, and how much of the flare that is. */
  left: number
  burn: number
  /** Metres to it, and how far up the rail they are. */
  range: number
  haul: number
}

interface Readout {
  saved: number
  lights: Light[]
  way: number
  /** Near a raft, and slow enough to be boarded from it. */
  alongside: boolean
  slow: boolean
  aground: boolean
  elapsed: number
}

const EMPTY: Readout = {
  saved: 0,
  lights: [],
  way: 0,
  alongside: false,
  slow: false,
  aground: false,
  elapsed: 0,
}

/**
 * The run is stepped outside React, so the panel polls it on its own frame
 * rather than pushing every second of every flare through the store.
 */
function useReadout(active: boolean): Readout {
  const [state, setState] = useState<Readout>(EMPTY)
  const last = useRef(0)

  useEffect(() => {
    if (!active) return
    let raf = 0
    const tick = (now: number) => {
      if (now - last.current > 90) {
        last.current = now
        setState({
          saved: RESCUE.saved,
          // Shortest first: the order the list is in is the advice it gives.
          lights: RESCUE.people
            .map((soul) => ({
              id: soul.id,
              left: Math.max(0, soul.burn),
              burn: Math.max(0, soul.burn / soul.life),
              range: Math.hypot(soul.x - RESCUE.x, soul.z - RESCUE.z),
              haul: soul.aboard,
            }))
            .sort((a, b) => a.left - b.left),
          way: RESCUE.way,
          alongside: RESCUE.alongside !== null,
          slow: RESCUE.way < SLOW,
          aground: RESCUE.aground,
          elapsed: RESCUE.elapsed,
        })
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])

  return state
}

const clock = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function RescueHud() {
  const t = useT()
  const sailing = useGame((s) => s.rescue?.status === 'sailing')
  const readout = useReadout(Boolean(sailing))
  const coarse = useCoarsePointer()
  const { mobile } = useScreen()

  if (!sailing) return null
  const close = readout.lights.some((l) => l.left < LAST_GASP && l.haul <= 0)

  return (
    <div className="rescue">
      {/* The whole screen goes red at the edges when a flare is about to go
          out, because by then the panel is not where you are looking. */}
      {close && <div className="rescue__alarm" aria-hidden />}

      <div className="rescue__panel">
        <span className="rescue__label">{t('Sea rescue')}</span>

        <div className="rescue__saved">
          <span className="rescue__buoy" aria-hidden />
          <strong key={readout.saved}>{readout.saved}</strong>
          {/* The buoy says what is being counted; a phone has no room to. */}
          <em>{mobile ? `of ${SOULS}` : `of ${SOULS} aboard`}</em>
        </div>

        <div className="rescue__bar">
          <div
            className="rescue__bar-fill"
            style={{ width: `${(readout.saved / SOULS) * 100}%` }}
          />
        </div>

        {readout.lights.length === 0 ? (
          <p className="rescue__none">{t('No flares in the water')}</p>
        ) : (
          <div className="rescue__flares">
            {readout.lights.map((light) => {
              const hauling = light.haul > 0.01
              const state = hauling
                ? ' rescue__flare--haul'
                : light.left < LAST_GASP
                  ? ' rescue__flare--close'
                  : ''
              return (
                <div key={light.id} className={`rescue__flare${state}`}>
                  <div
                    className="rescue__flare-fill"
                    style={{
                      width: `${(hauling ? light.haul : light.burn) * 100}%`,
                    }}
                  />
                  <span>
                    <em>
                      {hauling ? 'Coming aboard' : `${Math.round(light.left)}s`}
                    </em>
                    <em>{Math.round(light.range)}m</em>
                  </span>
                </div>
              )
            })}
          </div>
        )}

        <div className="rescue__row">
          <span className="rescue__way">
            {Math.round(readout.way * 0.6)} <em>{t('kn')}</em>
          </span>
          <span className="rescue__time">{clock(readout.elapsed)}</span>
        </div>

        <div className="rescue__row">
          <span className="rescue__afloat">
            {readout.lights.length === 1
              ? '1 raft out there'
              : `${readout.lights.length} rafts out there`}
          </span>
          {readout.aground ? (
            <span className="rescue__flag rescue__flag--bad">
              {t('Aground')}
            </span>
          ) : (
            readout.alongside &&
            (readout.slow ? (
              <span className="rescue__flag rescue__flag--work">
                {t('Hold her')}
              </span>
            ) : (
              <span className="rescue__flag rescue__flag--bad">
                {t('Too fast')}
              </span>
            ))
          )}
        </div>
      </div>

      <p className="rescue__keys">
        {coarse ? (
          <>
            <kbd>Stick</kbd> {t('helm')} · {t('pull back to stop alongside')}
          </>
        ) : (
          <>
            <kbd>W</kbd>
            <kbd>S</kbd> {t('throttle')} · <kbd>A</kbd>
            <kbd>D</kbd> {t('helm')} · <kbd>M</kbd> {t('chart')} ·{' '}
            <kbd>Esc</kbd> {t('put in')}
          </>
        )}
      </p>
    </div>
  )
}
