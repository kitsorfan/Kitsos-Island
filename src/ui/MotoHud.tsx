import { useEffect, useRef, useState } from 'react'
import { MOTO, racerName, standings } from '../game/moto'
import { useGame } from '../state/store'
import { useCoarsePointer } from './useCoarsePointer'
import { useT } from '../i18n/useT'

interface Board {
  id: string
  name: string
  /** Metres behind the leader; zero for whoever is leading. */
  gap: number
  you: boolean
}

interface Readout {
  place: number
  lap: number
  /** How many there are, which the briefing lets you choose. */
  laps: number
  elapsed: number
  best: number
  speed: number
  wheelie: boolean
  offRoad: boolean
  /** How much of a tow the bike in front is giving you. */
  tow: number
  countdown: number
  board: Board[]
}

const EMPTY: Readout = {
  place: 4,
  lap: 1,
  laps: 1,
  elapsed: 0,
  best: 0,
  speed: 0,
  wheelie: false,
  offRoad: false,
  tow: 0,
  countdown: 0,
  board: [],
}

/**
 * The race is stepped outside React, so the panel polls it on its own frame
 * rather than pushing every metre through the store.
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
        setState({
          place: MOTO.place,
          lap: MOTO.lap,
          laps: MOTO.laps,
          elapsed: MOTO.elapsed,
          best: MOTO.best,
          speed: Math.abs(MOTO.speed),
          wheelie: MOTO.wheelie > 0.4,
          offRoad: MOTO.offRoad,
          tow: MOTO.tow,
          countdown: MOTO.countdown,
          board: standings().map((entry) => ({
            id: entry.id,
            name: racerName(entry.id),
            gap: entry.gap,
            you: entry.id === 'player',
          })),
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
  const t = Math.floor((seconds * 10) % 10)
  return `${m}:${s.toString().padStart(2, '0')}.${t}`
}

const ORDINAL = ['', '1st', '2nd', '3rd', '4th']

export function MotoHud() {
  const t = useT()
  const riding = useGame((s) => s.moto?.status === 'riding')
  const readout = useReadout(Boolean(riding))
  const coarse = useCoarsePointer()

  if (!riding) return null
  const counting = Math.ceil(readout.countdown)

  return (
    <div className="moto">
      {counting > 0 && (
        <div className="moto-lights" aria-live="polite">
          <strong key={counting}>{counting}</strong>
          <em>{t('Hold it')}</em>
        </div>
      )}

      <div className="moto__panel">
        <span className="moto__label">{t('Island Circuit')}</span>

        <div className="moto__place">
          <strong key={readout.place}>{ORDINAL[readout.place]}</strong>
          <em>{t('of 4')}</em>
          <span className="moto__lap">
            Lap {readout.lap}/{readout.laps}
          </span>
        </div>

        <ol className="moto-board">
          {readout.board.map((entry, i) => (
            <li
              key={entry.id}
              className={
                entry.you
                  ? 'moto-board__row moto-board__row--you'
                  : 'moto-board__row'
              }
            >
              <span className="moto-board__pos">{i + 1}</span>
              <span className="moto-board__name">{entry.name}</span>
              <span className="moto-board__gap">
                {i === 0 ? 'leader' : `+${Math.round(entry.gap)}m`}
              </span>
            </li>
          ))}
        </ol>

        <div className="moto__row">
          <span className="moto__speed">
            {Math.round(readout.speed * 3)} <em>{t('km/h')}</em>
          </span>
          <span className="moto__time">{clock(readout.elapsed)}</span>
        </div>

        <div className="moto__row">
          {readout.best > 0 && (
            <span className="moto__next">
              Best lap <strong>{clock(readout.best)}</strong>
            </span>
          )}
          {readout.offRoad ? (
            <span className="moto__flag moto__flag--off">
              {t('Off the circuit')}
            </span>
          ) : (
            readout.tow > 0.3 && (
              <span className="moto__flag moto__flag--tow">{t('Tow')}</span>
            )
          )}
          {readout.wheelie && (
            <span className="moto__flag moto__flag--wheelie">
              {t('Wheelie')}
            </span>
          )}
        </div>
      </div>

      <p className="moto__keys">
        {coarse ? (
          <>
            <kbd>Stick</kbd> ride · <kbd>WHEELIE</kbd> hold
          </>
        ) : (
          <>
            <kbd>W</kbd>
            <kbd>S</kbd> gas &amp; brake · <kbd>A</kbd>
            <kbd>D</kbd> steer · <kbd>Space</kbd> wheelie · <kbd>M</kbd> map
          </>
        )}
      </p>
    </div>
  )
}
