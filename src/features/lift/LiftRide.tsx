import { useEffect, useRef, useState } from 'react'
import { INTERIOR_BY_ID } from '../interior/interiors'
import { liftArrival, liftPhase } from './lift'
import * as sfx from '../../shared/engine/audio'
import { useGame } from '../../shared/state/store'
import { useT } from '../../shared/i18n/useT'

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
  const arriveLift = useGame((s) => s.arriveLift)
  const endLift = useGame((s) => s.endLift)
  const t = useT()
  /* The floor showing over the doors. It starts at whichever floor the ride
     starts on, and after that only the animation frame moves it — so this is
     never set from inside the effect, only from the ride itself. */
  const [floor, setFloor] = useState(ride?.from ?? 0)
  /* Each half of the arrival fires once, however many frames are in flight. */
  const landed = useRef(false)
  const finished = useRef(false)

  useEffect(() => {
    if (!ride) return
    landed.current = false
    finished.current = false
    sfx.confirm()

    let raf = 0
    const tick = () => {
      const phase = liftPhase(ride, performance.now() / 1000)
      setFloor((was) => (was === phase.floor ? was : phase.floor))

      /*
       * The car stops, and the room changes under still-shut doors. Doing it
       * here rather than at the end of the ride is the whole of why the doors
       * are seen to open: the far floor takes over with the opening half of
       * the ride still to run.
       */
      if (phase.arrived && !landed.current) {
        landed.current = true
        const dest = INTERIOR_BY_ID.get(ride.toRoom)
        const link = (INTERIOR_BY_ID.get(ride.fromRoom)?.links ?? []).find(
          (l) => l.id === ride.linkId,
        )
        if (dest && link) {
          const { at, facing } = liftArrival(dest, ride.fromRoom, link)
          arriveLift(at, facing)
        }
      }

      /* Doors wide: the ride is over and the walk is his again. */
      if (phase.done && !finished.current) {
        finished.current = true
        endLift()
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [ride, arriveLift, endLift])

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
