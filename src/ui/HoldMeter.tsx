import { useEffect, useRef } from 'react'
import { LONG_HOLD, longSpace, spaceHeldFor } from '../game/input'
import { useGame } from '../state/store'
import { PLAYER_POS } from '../game/player'

/**
 * Nothing at all for the first few seconds of it.
 *
 * A meter that appeared the moment you touched the key would be an
 * announcement, and this is meant to be a secret: by the time it shows up
 * you are three seconds into leaning on a key for no reason, somewhere the
 * gesture actually works, which is nobody who has not been told.
 */
const SHOW_AT = 3

/**
 * The filling bar behind the one gesture the island never mentions.
 *
 * It fills, and when it is full it holds and pulses. It never says what to
 * press next — being told would make it a control rather than a secret, and
 * anyone who has got this far is holding a key down for a reason.
 *
 * Driven straight off the input module rather than off React state: it is a
 * width and a class name, and neither is worth a render a frame.
 */
export function HoldMeter() {
  const root = useRef<HTMLDivElement>(null)
  const fill = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const el = root.current
      if (!el) return

      const ready = longSpace()
      const held = spaceHeldFor()
      if (!ready && held < SHOW_AT) {
        el.classList.remove('hold--on')
        return
      }

      // Only where and when it would do something. The same question the
      // gesture itself asks, asked of the same place.
      const on = useGame.getState().canPropose(PLAYER_POS.x, PLAYER_POS.z)
      el.classList.toggle('hold--on', on)
      if (!on) return

      el.classList.toggle('hold--ready', ready)
      // Full while the grace period runs, so letting go of the key does not
      // empty the bar in the moment you are reaching for the other one.
      if (fill.current) {
        const done = ready ? 1 : Math.min(1, held / LONG_HOLD)
        fill.current.style.width = `${done * 100}%`
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="hold" ref={root} aria-hidden>
      <div className="hold__track">
        <div className="hold__fill" ref={fill} />
      </div>
    </div>
  )
}
