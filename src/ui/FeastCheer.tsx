import { useEffect } from 'react'
import { useGame } from '../state/store'
import { useT } from '../i18n/useT'

/** How long the toast stays up before it takes itself away. */
const SECONDS = 3

/**
 * How many flakes fall across it. Enough to read as snow and few enough that
 * a phone is not animating a hundred boxes for three seconds.
 */
const FLAKES = 42

/**
 * The toast, for the moment the last of them reaches their place at the
 * table: MERRY CHRISTMAS across the screen and snow falling over it, for
 * three seconds, and then gone.
 *
 * Everything here is CSS — the flakes are spans on one keyframe with their
 * own delay, duration and drift, seeded off the index rather than at random
 * so a re-render never reshuffles the snow mid-fall. It sits above the canvas
 * and takes no pointer events, so the room carries on underneath it and you
 * can keep walking while it plays.
 */
export function FeastCheer() {
  const at = useGame((s) => s.cheer)
  const endCheer = useGame((s) => s.endCheer)
  const t = useT()

  useEffect(() => {
    if (at === null) return
    const timer = window.setTimeout(endCheer, SECONDS * 1000)
    return () => window.clearTimeout(timer)
  }, [at, endCheer])

  if (at === null) return null

  return (
    <div className="cheer" key={at} aria-live="polite">
      <div className="cheer__snow" aria-hidden>
        {Array.from({ length: FLAKES }, (_, i) => {
          // Three coprime-ish strides, so the columns, the sizes and the
          // timings do not fall into step with one another.
          const left = ((i * 37) % 100) + (i % 3) * 0.7
          const size = 5 + ((i * 13) % 9)
          const delay = ((i * 7) % 24) / 10
          const fall = 2.6 + ((i * 11) % 17) / 10
          return (
            <span
              key={i}
              className="cheer__flake"
              style={{
                left: `${left}%`,
                width: `${size}px`,
                height: `${size}px`,
                animationDelay: `${delay}s`,
                animationDuration: `${fall}s`,
                opacity: 0.45 + ((i * 17) % 55) / 100,
              }}
            />
          )
        })}
      </div>
      <p className="cheer__line">{t('Merry Christmas')}</p>
    </div>
  )
}
