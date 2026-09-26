import { useEffect } from 'react'
import { turnHold } from './input'
import { useGame } from '../../shared/state/store'
import { useT } from '../../shared/i18n/useT'

/**
 * Q and E on the screen: one at each edge, held to swing the camera round
 * him for as long as it is held, the same as the keys.
 *
 * A phone has no keys at all, and even with a keyboard the turn is the one
 * camera move nobody guesses is there. They are faint until pressed, so the
 * island still reads through them at the edges.
 */
/**
 * A swing round him, drawn rather than typed: a ring on the ground seen from
 * behind, him as the dot in the middle of it, the far side faint and an
 * arrow running along the near side. The circle arrows in the fonts read as
 * a U-turn, or as undo. Drawn for the left and mirrored for the right.
 */
function TurnIcon({ side }: { side: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width="38"
      height="38"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g transform={side === 'right' ? 'matrix(-1 0 0 1 32 0)' : undefined}>
        <circle cx="16" cy="14.5" r="2.4" fill="currentColor" stroke="none" />
        <path d="M3 16A13 4.8 0 0 1 29 16" opacity=".4" />
        <path d="M29 16A13 4.8 0 0 1 6 19" />
        <path d="M8.3 23.6 6 19l4.9-1.6" />
      </g>
    </svg>
  )
}

function TurnButton({
  side,
  label,
}: {
  side: 'left' | 'right'
  label: string
}) {
  const stop = () => {
    turnHold[side] = false
  }
  return (
    <button
      type="button"
      className={`edge-button turn-button turn-button--${side}`}
      aria-label={label}
      title={label}
      onPointerDown={(event) => {
        // No focus to keep and no text to select: it is a key, not a button.
        event.preventDefault()
        turnHold[side] = true
      }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={(event) => event.preventDefault()}
    >
      <TurnIcon side={side} />
    </button>
  )
}

export function TurnButtons() {
  const t = useT()
  const mode = useGame((s) => s.mode)
  /*
   * On the bike, in the basket or at the helm the game owns the camera — see
   * Island — and nothing reads the turn, so the buttons stand down for as
   * long as any of those games is out, not just while it is being played.
   */
  const driving = useGame((s) => Boolean(s.moto || s.balloon || s.rescue))
  const shown = mode === 'explore' && !driving

  // A button held as it goes away would otherwise keep the camera turning.
  useEffect(() => {
    if (!shown) return
    return () => {
      turnHold.left = false
      turnHold.right = false
    }
  }, [shown])

  if (!shown) return null

  return (
    <>
      <TurnButton side="left" label={t('Turn the camera left (Q)')} />
      <TurnButton side="right" label={t('Turn the camera right (E)')} />
    </>
  )
}
