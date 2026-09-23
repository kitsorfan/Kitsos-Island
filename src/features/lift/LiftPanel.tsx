import { useEffect, useRef } from 'react'
import { useGame } from '../../shared/state/store'
import { useT } from '../../shared/i18n/useT'

/**
 * The panel inside the lift car: one button per floor of the Work District,
 * pressed to go there.
 *
 * It exists because a lift with one destination is only a door that takes
 * longer. The panel is also the one place in the building that states the
 * whole shape of it at once — three floors, and the third with nothing behind
 * its button yet.
 *
 * The buttons are drawn top floor first, so the panel reads as the building
 * stands: the empty third floor above, reception at the bottom, and the years
 * climbing as your eye comes down. The data lists them from the ground up,
 * which is the order he worked them, so the reversing happens here.
 */
export function LiftPanel() {
  const call = useGame((s) => s.liftCall)
  const pressFloor = useGame((s) => s.pressFloor)
  const leaveLift = useGame((s) => s.leaveLift)
  const t = useT()
  const first = useRef<HTMLButtonElement>(null)

  /*
   * The buttons top-down, which is how the panel is drawn: the data counts up
   * from reception because that is the order he worked the floors, and a
   * building is read the other way.
   */
  const stops = call ? [...call.stops].reverse() : []

  /*
   * What opens focused. Not simply the top button — that is the floor nobody
   * has built, and an Enter pressed on the way in should not spend itself on
   * the one button that only talks back. The first floor with somewhere
   * behind it, counting down from the top, is both real and the newest work.
   */
  const lead = stops.findIndex((stop) => stop.to && stop.to !== call?.room)

  /*
   * Where the car already is. A lift has no button for the floor under your
   * feet — pressing it and being told so is a refusal the panel could have
   * spared you, and it is the one button on a real panel that is never lit.
   */

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
          {stops.map((stop, i) => {
            const here = stop.to === call.room
            const dead = !stop.to
            return (
              <li key={stop.floor}>
                <button
                  ref={i === (lead === -1 ? 0 : lead) ? first : undefined}
                  type="button"
                  className="liftpanel__button"
                  data-here={here || undefined}
                  data-dead={dead || undefined}
                  /* Not merely ignored: taken out of the tab order too, so
                     arrowing down the panel never stops on a floor that has
                     nothing to say. */
                  disabled={here || undefined}
                  aria-disabled={here || undefined}
                  onClick={() => pressFloor(stop)}
                >
                  <span className="liftpanel__number">{stop.floor}</span>
                  <span className="liftpanel__label">{t(stop.label)}</span>
                  {stop.when && (
                    <span className="liftpanel__when">{t(stop.when)}</span>
                  )}
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
