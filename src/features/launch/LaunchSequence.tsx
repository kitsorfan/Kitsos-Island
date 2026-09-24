import { useEffect, useRef, useState } from 'react'
import { STAGE_LINES, launchPhase } from './launch'
import type { LaunchStage } from './launch'
import * as sfx from '../../shared/engine/audio'
import { useGame } from '../../shared/state/store'
import { useT } from '../../shared/i18n/useT'

/**
 * The launch as you read it: the count over the button, the stage it has got
 * to, and the shake on the whole screen.
 *
 * It owns the end of the flight for the same reason `LiftRide` owns the end
 * of a ride — it is the one piece that runs for the whole of one, so the
 * moment the climb is over is a moment it already knows about.
 */
export function LaunchSequence() {
  const launch = useGame((s) => s.launch)
  const reachOrbit = useGame((s) => s.reachOrbit)
  const t = useT()
  const [stage, setStage] = useState<LaunchStage>('hold')
  const [count, setCount] = useState(0)
  const [shake, setShake] = useState(0)
  /* The arrival fires once, however many frames are in flight. */
  const arrived = useRef(false)
  /* So the count only speaks when the number actually changes. */
  const spoken = useRef(-1)

  useEffect(() => {
    if (!launch || launch.arrived) return
    arrived.current = false
    spoken.current = -1

    let raf = 0
    const tick = () => {
      const phase = launchPhase(launch, performance.now() / 1000)
      setStage((was) => (was === phase.stage ? was : phase.stage))
      setCount((was) => (was === phase.count ? was : phase.count))
      setShake(phase.shake)

      /* One beep per second of the hold, on the second it changes. */
      if (phase.count > 0 && phase.count !== spoken.current) {
        spoken.current = phase.count
        sfx.blip()
      }

      /*
       * The engines. They light with the ignition and are held wide open
       * through the burn, then wound down across the climb as the air — and
       * the thrust it is being pushed against — thins out. `engineStart` is
       * idempotent, so calling it every frame of the burn costs nothing.
       */
      if (phase.stage === 'ignition' || phase.stage === 'climb') {
        sfx.engineStart()
        sfx.engineRevs(Math.max(0.15, phase.shake), phase.shake)
      }

      if (phase.arrived && !arrived.current) {
        arrived.current = true
        /* Orbit is silent: the engines are out before the card comes up. */
        sfx.engineStop()
        reachOrbit()
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      /* Nothing should be left burning if this unmounts mid-flight. */
      sfx.engineStop()
    }
  }, [launch, reachOrbit])

  if (!launch || launch.arrived) return null

  return (
    <div
      className={`launch launch--${stage}`}
      style={{ '--shake': shake } as React.CSSProperties}
      role="status"
      aria-live="polite"
    >
      <div className="launch__frame" aria-hidden />

      {stage === 'hold' ? (
        <div className="launch__count">
          <span className="launch__countNum">{count}</span>
          <span className="launch__countLabel">{t('to launch')}</span>
        </div>
      ) : (
        <div className="launch__stage">
          <span className="launch__stageMark" aria-hidden>
            {stage === 'ignition' ? '▲' : stage === 'climb' ? '↑' : '✦'}
          </span>
        </div>
      )}

      <p className="launch__line">{t(STAGE_LINES[stage])}</p>
    </div>
  )
}
