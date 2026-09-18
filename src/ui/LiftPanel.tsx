import { useEffect, useRef } from 'react'
import { useGame } from '../state/store'
import { useT } from '../i18n/useT'

/**
 * The panel inside the lift car: one button per floor of the Work District,
 * pressed to go there.
 *
 * It exists because a lift with one destination is only a door that takes
 * longer. The panel is also the one place in the building that states the
 * whole shape of it at once — three floors, and the third with nothing behind
 * its button yet.
 */
export function LiftPanel() {
  const call = useGame((s) => s.liftCall)
  const pressFloor = useGame((s) => s.pressFloor)
  const leaveLift = useGame((s) => s.leaveLift)
  const t = useT()
  const first = useRef<HTMLButtonElement>(null)

  /* Esc steps back out of the car without pressing anything. */
  useEffect(() => {
    if (!call) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') leaveLift()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [call, leaveLift])

  useEffect(() => {
    if (call) first.current?.focus()
  }, [call])

  if (!call) return null

  return (
    <div className="liftpanel" role="dialog" aria-label={t('The lift')}>
      <div className="liftpanel__car">
        <p className="liftpanel__here">
          {t('Floor')} {call.floor}
        </p>
        <ol className="liftpanel__buttons">
          {call.stops.map((stop, i) => {
            const here = stop.to === call.room
            const dead = !stop.to
            return (
              <li key={stop.floor}>
                <button
                  ref={i === 0 ? first : undefined}
                  type="button"
                  className="liftpanel__button"
                  data-here={here || undefined}
                  data-dead={dead || undefined}
                  onClick={() => pressFloor(stop)}
                >
                  <span className="liftpanel__number">{stop.floor}</span>
                  <span className="liftpanel__label">{t(stop.label)}</span>
                  {here && (
                    <span className="liftpanel__you">{t('you are here')}</span>
                  )}
                </button>
              </li>
            )
          })}
        </ol>
        {call.refused && (
          <div className="liftpanel__refused">
            {call.refused.map((line) => (
              <p key={line}>{t(line)}</p>
            ))}
          </div>
        )}
        <button
          type="button"
          className="liftpanel__out"
          onClick={() => leaveLift()}
        >
          {t('Step back out')}
        </button>
      </div>
    </div>
  )
}
