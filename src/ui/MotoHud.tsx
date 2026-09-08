import { useEffect, useRef, useState } from 'react'
import { COIN_TOTAL, MOTO, nearestCoin } from '../game/moto'
import { useGame } from '../state/store'
import { useCoarsePointer } from './useCoarsePointer'

interface Readout {
  coins: number
  elapsed: number
  speed: number
  wheelie: boolean
  /** Metres to the nearest coin still out there. */
  nearest: number | null
}

/**
 * The ride is stepped outside React, so the panel polls it on its own frame
 * rather than pushing every coin through the store.
 */
function useReadout(active: boolean): Readout {
  const [state, setState] = useState<Readout>({
    coins: 0,
    elapsed: 0,
    speed: 0,
    wheelie: false,
    nearest: null,
  })
  const last = useRef(0)

  useEffect(() => {
    if (!active) return
    let raf = 0
    const tick = (now: number) => {
      // A tenth of a second is as fine as any of these need to read.
      if (now - last.current > 90) {
        last.current = now
        const near = nearestCoin()
        setState({
          coins: MOTO.coins,
          elapsed: MOTO.elapsed,
          speed: Math.abs(MOTO.speed),
          wheelie: MOTO.wheelie > 0.4,
          nearest: near ? near.distance : null,
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

export function MotoHud() {
  const riding = useGame((s) => s.moto?.status === 'riding')
  const readout = useReadout(Boolean(riding))
  const coarse = useCoarsePointer()

  if (!riding) return null

  return (
    <div className="moto">
      <div className="moto__panel">
        <span className="moto__label">Island ride</span>

        <div className="moto__coins">
          <span className="moto__coin" aria-hidden />
          <strong key={readout.coins}>{readout.coins}</strong>
          <em>of {COIN_TOTAL}</em>
        </div>

        <div className="moto__bar">
          <div
            className="moto__bar-fill"
            style={{ width: `${(readout.coins / COIN_TOTAL) * 100}%` }}
          />
        </div>

        <div className="moto__row">
          <span className="moto__speed">
            {Math.round(readout.speed * 3)} <em>km/h</em>
          </span>
          <span className="moto__time">{clock(readout.elapsed)}</span>
        </div>

        <div className="moto__row">
          {readout.nearest === null ? (
            <span className="moto__flag moto__flag--done">Every coin in</span>
          ) : (
            <span className="moto__next">
              Nearest coin <strong>{Math.round(readout.nearest)}m</strong>
            </span>
          )}
          {readout.wheelie && (
            <span className="moto__flag moto__flag--wheelie">Wheelie</span>
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
