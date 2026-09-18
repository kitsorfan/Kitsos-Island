import { useEffect, useRef, useState } from 'react'
import { INTERIOR_BY_ID } from '../data/interiors'
import { liftArrival, liftPhase } from '../game/lift'
import * as sfx from '../game/audio'
import { useGame } from '../state/store'
import { useT } from '../i18n/useT'

/**
 * The ride itself: the panel that sits over the screen while the car moves,
 * and the thing that actually puts him out on the far floor when it stops.
 *
 * The car is drawn in the scene (world/Interior.tsx); this is the part you
 * read — the floor counting over the doors, and the name of what is about to
 * open in front of you. It owns the end of the ride because it is the only
 * piece that runs for the whole of one: the room the car left may well have
 * unmounted by the time it arrives.
 */
export function LiftRide() {
  const ride = useGame((s) => s.lift)
  const endLift = useGame((s) => s.endLift)
  const t = useT()
  /* The floor showing over the doors. It starts at whichever floor the ride
     starts on, and after that only the animation frame moves it — so this is
     never set from inside the effect, only from the ride itself. */
  const [floor, setFloor] = useState(ride?.from ?? 0)
  /* A ride that ended must not be ended twice by a frame already in flight. */
  const finished = useRef(false)

  useEffect(() => {
    if (!ride) return
    finished.current = false
    sfx.confirm()

    let raf = 0
    const tick = () => {
      const phase = liftPhase(ride, performance.now() / 1000)
      setFloor((was) => (was === phase.floor ? was : phase.floor))
      if (phase.done && !finished.current) {
        finished.current = true
        const dest = INTERIOR_BY_ID.get(ride.toRoom)
        const link = (INTERIOR_BY_ID.get(ride.fromRoom)?.links ?? []).find(
          (l) => l.id === ride.linkId,
        )
        if (!dest || !link) return
        const { at, facing } = liftArrival(dest, ride.fromRoom, link)
        endLift(at, facing)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [ride, endLift])

  if (!ride) return null

  const dest = INTERIOR_BY_ID.get(ride.toRoom)
  const climbing = ride.to > ride.from

  return (
    <div className="lift" role="status" aria-live="polite">
      <div className="lift__indicator">
        <span className="lift__arrow">{climbing ? '▲' : '▼'}</span>
        <span className="lift__floor">{floor}</span>
      </div>
      {dest && <p className="lift__dest">{t(dest.kicker)}</p>}
    </div>
  )
}
