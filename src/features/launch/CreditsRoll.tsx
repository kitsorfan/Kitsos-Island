import { useEffect, useRef, useState } from 'react'
import { cardFade, cardRise, creditAt } from './credits'
import type { CreditCard } from './credits'
import { useGame } from '../../shared/state/store'
import { useT } from '../../shared/i18n/useT'

/**
 * The credits, playing over the window while he floats.
 *
 * It owns the end of itself: when the roll runs out it calls `endCredits`,
 * and that is what brings the certificate up. Nothing else times the roll —
 * a second timer in the store would drift against this one and the card
 * would arrive early or late.
 *
 * It takes no pointer events. He can walk — drift — the whole time this is
 * playing, and a full-screen panel that swallowed the pointer would take the
 * island away from him to show him a list of his own name.
 */
export function CreditsRoll() {
  const t = useT()
  const arrived = useGame((s) => s.launch?.arrived)
  const rolling = useGame((s) => s.credits)
  const endCredits = useGame((s) => s.endCredits)
  const [shown, setShown] = useState<{
    card: CreditCard
    index: number
    fade: number
    rise: number
  } | null>(null)
  const from = useRef(0)
  const finished = useRef(false)

  useEffect(() => {
    if (!arrived || !rolling) return
    from.current = performance.now() / 1000
    finished.current = false

    let raf = 0
    const tick = () => {
      const at = creditAt(performance.now() / 1000 - from.current)

      if (!at) {
        /* The roll is over. Once only, however many frames are in flight. */
        if (!finished.current) {
          finished.current = true
          setShown(null)
          endCredits()
        }
        return
      }

      const fade = cardFade(at.t)
      const rise = cardRise(at.t)
      setShown((was) =>
        was &&
        was.index === at.index &&
        Math.abs(was.fade - fade) < 0.02 &&
        Math.abs(was.rise - rise) < 0.01
          ? was
          : { card: at.card, index: at.index, fade, rise },
      )
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [arrived, rolling, endCredits])

  if (!arrived || !rolling || !shown) return null

  const { card, fade, rise } = shown

  return (
    <div
      className={`credits credits--${card.kind}`}
      aria-label={t('Credits')}
      style={
        {
          '--fade': fade,
          /* A couple of centimetres of travel, which is what makes it a roll
             rather than a slideshow. */
          '--rise': `${(1 - rise) * 1.4}rem`,
        } as React.CSSProperties
      }
    >
      <div className="credits__card">
        {card.kind === 'title' ? (
          <>
            <h2 className="credits__title">{t(card.heading)}</h2>
            {card.sub && <p className="credits__sub">{t(card.sub)}</p>}
          </>
        ) : card.kind === 'thanks' ? (
          <>
            <h3 className="credits__heading">{t(card.heading)}</h3>
            <div className="credits__thanks">
              {(card.lines ?? []).map((line) => (
                <p key={line}>{t(line)}</p>
              ))}
            </div>
          </>
        ) : (
          <>
            <h3 className="credits__heading">{t(card.heading)}</h3>
            <dl className="credits__roles">
              {(card.roles ?? []).map((entry, i) => (
                <div
                  className={`credits__row${entry.role ? '' : ' credits__row--solo'}`}
                  key={`${entry.role}-${i}`}
                >
                  {entry.role && <dt>{t(entry.role)}</dt>}
                  <dd>{entry.who}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </div>
    </div>
  )
}
