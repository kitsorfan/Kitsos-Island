import { useGame } from '../state/store'
import { SLIDES } from '../game/lecture'
import { useT } from '../i18n/useT'

/**
 * What is on screen while the defence is being given.
 *
 * Two things, and nothing else. A line along the bottom saying which slide is
 * up and how many there are, so you can tell a defence that is starting from
 * one that is nearly over; and, at the end, the applause.
 *
 * The room is doing the work — the class is on its feet and the sound is a
 * room clapping — so the banner stays out of the way of it: no backdrop, no
 * box, nothing that takes the hall off the screen at the one moment you want
 * to be looking at it.
 */
export function LectureHud() {
  const at = useGame((s) => s.lecture)
  const t = useT()
  if (!at) return null

  const slide = SLIDES[at.slide]

  return (
    <div className="lecture" aria-live="polite">
      {at.ovation ? (
        <p className="lecture__ovation">{t('Thank you.')}</p>
      ) : null}
      <p className="lecture__step">
        <span className="lecture__count">
          {at.slide + 1} / {SLIDES.length}
        </span>
        <span className="lecture__title">{t(slide?.title ?? '')}</span>
      </p>
    </div>
  )
}
