import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { Mesh } from 'three'
import { useGame } from '../state/store'

/**
 * Decides whether the island draws its shadow pass.
 *
 * The island is bound by draw calls rather than by pixels — it costs the same
 * at 1080p as at a quarter of it — and shadows are about half of those, since
 * every caster is drawn a second time into the shadow map. So shadows are the
 * one lever worth pulling, and pulling it buys back most of the frame.
 *
 * The visitor has the last word. 'auto' measures and steps down on hardware
 * that cannot keep up, but the verdict is advisory: it can be overruled in
 * either direction, and asking for 'auto' again asks for a fresh one. What it
 * is not is a hidden one-way trapdoor, where a single bad three seconds —
 * a tab coming back to the front, a laptop dropping to its battery profile —
 * costs a visitor their shadows for the rest of the session with no way back.
 */

/**
 * How much recent play to judge on, in milliseconds rather than in frames.
 * Counting frames would be backwards: the slower the machine, the longer it
 * would take to notice, which is exactly the wrong way round.
 */
const WINDOW_MS = 3000

/** Median frame time we refuse to sit below: 33ms is 30fps. */
const TOO_SLOW = 33

/**
 * Wall clock to let pass before judging anything. The opening seconds are
 * shader compilation and scene building, which are slow on any machine and
 * say nothing about how it will run once it settles — and on a slow machine
 * they take longer, which is exactly when a hasty verdict would be wrong.
 */
const WARMUP_MS = 6000

/**
 * Longer than this and the tab was hidden, the browser stalled, or a new area
 * was being built. None of those is a slow frame, and all of them would drag
 * the median up, so seeing one throws the window away and starts it again.
 */
const STALL = 200

/**
 * How often to actually take the median. Sorting the window on every frame
 * spent real time — about 18µs of it, forever, on exactly the fast machines
 * that were never going to trip the threshold — to answer a question whose
 * answer cannot meaningfully change in a single millisecond.
 */
const JUDGE_EVERY_MS = 500

export function AdaptiveQuality() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)

  const quality = useGame((s) => s.quality)
  const autoDropped = useGame((s) => s.autoDropped)
  const reportSlow = useGame((s) => s.reportSlow)

  const shadows =
    quality === 'high' ? true : quality === 'low' ? false : !autoDropped

  // Shadow support is compiled into each material's shader, so every one of
  // them has to be rebuilt before the scene stops asking for a shadow map —
  // or starts again. Materials built after this point compile against the
  // flag as it stands, so a new area needs no sweep of its own.
  useEffect(() => {
    if (gl.shadowMap.enabled === shadows) return
    gl.shadowMap.enabled = shadows
    scene.traverse((object) => {
      const material = (object as Mesh).material
      if (!material) return
      for (const m of Array.isArray(material) ? material : [material]) {
        m.needsUpdate = true
      }
    })
  }, [gl, scene, shadows])

  const age = useRef(0)
  const times = useRef<number[]>([])
  const span = useRef(0)
  const sinceJudged = useRef(0)

  // Walking into a building builds a whole new scene and compiles whatever
  // materials it brought with it, so the clock starts again on the far side
  // of every door rather than counting that against the machine.
  const token = useGame((s) => s.spawn.token)
  useEffect(() => {
    age.current = 0
    times.current.length = 0
    span.current = 0
    sinceJudged.current = 0
  }, [token])

  useFrame((_, delta) => {
    // Nothing to measure once the visitor has chosen, or once auto has.
    if (quality !== 'auto' || autoDropped) return

    const ms = delta * 1000
    if (ms <= 0) return

    const window = times.current
    if (ms > STALL) {
      window.length = 0
      span.current = 0
      return
    }

    age.current += ms
    if (age.current < WARMUP_MS) return

    window.push(ms)
    span.current += ms
    // Slide the front of the window off once it covers long enough.
    while (span.current - window[0] > WINDOW_MS) {
      span.current -= window.shift()!
    }
    if (span.current < WINDOW_MS) return

    sinceJudged.current += ms
    if (sinceJudged.current < JUDGE_EVERY_MS) return
    sinceJudged.current = 0

    const sorted = [...window].sort((a, b) => a - b)
    const median = sorted[sorted.length >> 1]
    if (median <= TOO_SLOW) return

    reportSlow()
  })

  return null
}
