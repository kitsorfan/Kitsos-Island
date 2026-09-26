import { useEffect } from 'react'
import { capeHold } from './input'
import { useT } from '../../shared/i18n/useT'

type Way = 'up' | 'down'

const WORD: Record<Way, string> = { up: 'UP', down: 'DOWN' }

/**
 * Up and down for the cape, on a touch screen: Space leaned on, and the dive.
 *
 * The one jump button cannot do either - a thumb cannot lean on a tap, and a
 * double tap to come down is the half of flying nobody guesses. So under the
 * cape the jump gives way to this pair, in the balloon's round look, so going
 * up reads the same whichever way he went. UP from the grass is the take-off,
 * as Space is; let go of both and he sinks back gently on his own.
 */
export function CapeButtons() {
  const t = useT()

  // A button held as it goes away would otherwise keep him climbing.
  useEffect(
    () => () => {
      capeHold.up = false
      capeHold.down = false
    },
    [],
  )

  const button = (way: Way) => {
    const stop = () => {
      capeHold[way] = false
    }
    const label = t(way === 'up' ? 'Fly up' : 'Fly down')
    return (
      <button
        type="button"
        className={`round-button round-button--lift round-button--${way}`}
        aria-label={label}
        title={label}
        onPointerDown={(event) => {
          event.preventDefault()
          capeHold[way] = true
        }}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        onContextMenu={(event) => event.preventDefault()}
      >
        {WORD[way]}
      </button>
    )
  }

  return (
    <div className="touch__lift">
      {button('up')}
      {button('down')}
    </div>
  )
}
