import { useEffect, useRef, useState } from 'react'
import { THANKS, cardFade, creditAt } from './credits'
import type { CreditRole } from './credits'
import { useGame } from '../../shared/state/store'
import { useT } from '../../shared/i18n/useT'

/**
 * The credits, playing in the cabin while he floats.
 *
 * Small and off to one side rather than across the screen: the certificate is
 * what the orbit card is for, and this runs beside it the way a film would
 * play on the back of a seat. It loops, because there is nothing after it —
 * he is up there until he decides to come down.
 *
 * The clock is its own rather than the launch's: the roll starts when the
 * card appears, not when the engines lit, so the first name is not already
 * three deep by the time anybody looks at it.
 */
export function CreditsRoll() {
  const t = useT()
  const arrived = useGame((s) => s.launch?.arrived)
  const [card, setCard] = useState<{
    role: CreditRole | null
    thanks: boolean
    fade: number
  }>({ role: null, thanks: false, fade: 0 })
  const from = useRef(0)

  useEffect(() => {
    if (!arrived) return
    from.current = performance.now() / 1000

    let raf = 0
    const tick = () => {
      const at = creditAt(performance.now() / 1000 - from.current)
      const fade = cardFade(at.t)
      setCard((was) =>
        /* Only when something actually changed: this runs at frame rate and
           the card changes every couple of seconds. */
        was.role === at.role &&
        was.thanks === at.thanks &&
        Math.abs(was.fade - fade) < 0.02
          ? was
          : { role: at.role, thanks: at.thanks, fade },
      )
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [arrived])

  if (!arrived) return null

  return (
    <aside className="credits" aria-label={t('Credits')}>
      <span className="credits__kicker">{t('Credits')}</span>

      <div className="credits__stage" style={{ opacity: card.fade }}>
        {card.thanks ? (
          <div className="credits__thanks">
            <h3>{t(THANKS.heading)}</h3>
            {THANKS.lines.map((line) => (
              <p key={line}>{t(line)}</p>
            ))}
            <p className="credits__sign">{t(THANKS.sign)}</p>
          </div>
        ) : card.role ? (
          <div className="credits__role">
            <p className="credits__job">{t(card.role.role)}</p>
            <p className="credits__who">{card.role.who}</p>
          </div>
        ) : null}
      </div>
    </aside>
  )
}
