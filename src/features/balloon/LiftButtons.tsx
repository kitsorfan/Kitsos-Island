import { useEffect } from 'react'
import { liftHold } from '../player/input'
import { useGame } from '../../shared/state/store'
import { useT } from '../../shared/i18n/useT'

type Way = 'up' | 'down'

const WORD: Record<Way, string> = { up: 'UP', down: 'DOWN' }

/** A chevron, pointing the way the basket goes. */
function Chevron({ way }: { way: Way }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="26"
      height="26"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={way === 'up' ? 'M5 15.5 12 8.5l7 7' : 'M5 8.5l7 7 7-7'} />
    </svg>
  )
}

/**
 * Up and down for the balloon, held for as long as the climb or the sink is
 * wanted: the burner on Shift and the vent on Ctrl, on the screen.
 *
 * Two looks for the one pair. On a touch screen they are round buttons in
 * the thumb's corner, beside the drops, where the burner used to be; on a
 * big screen they are the see-through pills at the right edge, where the
 * turn buttons stand while he is on foot.
 */
export function LiftButtons({ look }: { look: 'round' | 'edge' }) {
  const t = useT()
  const flying = useGame((s) => s.balloon?.status === 'flying')
  const mode = useGame((s) => s.mode)
  const shown = flying && mode === 'explore'

  // A button held as it goes away would otherwise keep the basket going.
  useEffect(() => {
    if (!shown) return
    return () => {
      liftHold.up = false
      liftHold.down = false
    }
  }, [shown])

  if (!shown) return null

  const button = (way: Way) => {
    const stop = () => {
      liftHold[way] = false
    }
    const label = t(way === 'up' ? 'Climb (Shift)' : 'Sink (Ctrl)')
    return (
      <button
        type="button"
        className={
          look === 'round'
            ? `round-button round-button--lift round-button--${way}`
            : `edge-button lift-button lift-button--${way}`
        }
        aria-label={label}
        title={label}
        onPointerDown={(event) => {
          event.preventDefault()
          liftHold[way] = true
        }}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        onContextMenu={(event) => event.preventDefault()}
      >
        {/* Words on the round buttons, as FIRE and DUCK have; a chevron on
            the pills, as the turn has its drawing. */}
        {look === 'round' ? WORD[way] : <Chevron way={way} />}
      </button>
    )
  }

  return (
    <div className={look === 'round' ? 'touch__lift' : 'lift-pair'}>
      {button('up')}
      {button('down')}
    </div>
  )
}
