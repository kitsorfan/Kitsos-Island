import { useEffect, type ReactNode } from 'react'
import { rideHold } from '../player/input'
import { useT } from '../../shared/i18n/useT'

type Hold = keyof typeof rideHold

/*
 * The bike on a touch screen: the bars under the left thumb and the gas and
 * the brake under the right, as a racing game has them.
 *
 * It used to be the stick for all of it, forward for gas and back for brake,
 * which is how he walks and nothing like how a bike is ridden: steering into
 * a corner nudged the throttle off, and braking for one pulled the bars
 * straight. With a thumb for each they no longer fight over one knob.
 */

/** A chevron, pointing the way the bars go. */
function Chevron({ side }: { side: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="30"
      height="30"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={side === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
    </svg>
  )
}

/** Held for as long as the thumb is on it, the same as a key. */
function HoldButton({
  hold,
  label,
  className,
  children,
}: {
  hold: Hold
  label: string
  className: string
  children: ReactNode
}) {
  const stop = () => {
    rideHold[hold] = false
  }
  return (
    <button
      type="button"
      className={`round-button ${className}`}
      aria-label={label}
      title={label}
      onPointerDown={(event) => {
        // No focus to keep and no text to select: it is a key, not a button.
        event.preventDefault()
        rideHold[hold] = true
      }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={(event) => event.preventDefault()}
    >
      {children}
    </button>
  )
}

/** A button held as it goes away would otherwise keep the bike going. */
function useLetGo(holds: Hold[]) {
  useEffect(
    () => () => {
      for (const hold of holds) rideHold[hold] = false
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
}

/** Left and right, in the stick's corner, where the stick was. */
export function RideBars() {
  const t = useT()
  useLetGo(['left', 'right'])

  return (
    <div className="ride-bars">
      <HoldButton
        hold="left"
        label={t('Steer left')}
        className="round-button--steer"
      >
        <Chevron side="left" />
      </HoldButton>
      <HoldButton
        hold="right"
        label={t('Steer right')}
        className="round-button--steer"
      >
        <Chevron side="right" />
      </HoldButton>
    </div>
  )
}

/**
 * The brake and the gas as a pair of pedals, the gas at the very edge where
 * the thumb rests, and the wheelie over the pair of them: a thumb goes up off
 * the gas to pull one, and the wheelie keeps the gas on for it.
 */
export function RidePedals() {
  const t = useT()
  useLetGo(['gas', 'brake', 'wheelie'])

  return (
    <div className="ride-pedals">
      <HoldButton
        hold="wheelie"
        label={t('Wheelie')}
        className="round-button--wheelie"
      >
        WHEELIE
      </HoldButton>
      <HoldButton
        hold="brake"
        label={t('Brake')}
        className="round-button--pedal round-button--brake"
      >
        BRAKE
      </HoldButton>
      <HoldButton
        hold="gas"
        label={t('Gas')}
        className="round-button--pedal round-button--gas"
      >
        GAS
      </HoldButton>
    </div>
  )
}
