import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh, MeshBasicMaterial } from 'three'
import { HIDE, stepHide } from './hideLogic'
import { isCrouching, readMove } from '../player/input'
import { groundHeight } from '../island/terrainLogic'
import { isInteractive, useGame } from '../../shared/state/store'
import { PLAYER_POS, PLAYER_VIEW } from '../player/playerLogic'
import * as sfx from '../../shared/engine/audio'

const FOUND = '#7ce8a8'

/**
 * Runs a game of hide and seek.
 *
 * It is walked with the ordinary controls, so <Player/> stays exactly where
 * it is and this only steps the game, rings whoever has been found, and
 * plays the thump that gets quicker as you near somebody — which is the only
 * help you get, eleven people spread over a dark island notwithstanding.
 */
export function Hide() {
  const marks = useRef<(Mesh | null)[]>([])
  const handLight = useGame((s) => s.handLight)

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05)
    const store = useGame.getState()
    const game = store.hide
    const live =
      game?.status === 'playing' && HIDE.active && isInteractive(store.mode)

    if (live) {
      const move = readMove()
      const events = stepHide(delta, {
        x: PLAYER_POS.x,
        z: PLAYER_POS.z,
        facing: PLAYER_VIEW.facing,
        crouched: isCrouching(),
        lit: handLight !== 'none',
        moving: Math.hypot(move.x, move.y) > 0.05,
      })

      for (let i = 0; i < events.found; i++) sfx.coin()
      if (events.pulsed) sfx.pulse(HIDE.warmth)
      if (events.started) sfx.whistle()
      if (events.finished) store.finishHide(events.won)
    }

    // A ring on the grass under everyone already found, so a second pass
    // does not waste your time on them.
    for (let i = 0; i < marks.current.length; i++) {
      const mark = marks.current[i]
      if (!mark) continue
      const folk = HIDE.folk[i]
      const show = Boolean(folk?.found)
      mark.visible = show
      if (!folk || !show) continue
      mark.position.set(folk.x, groundHeight(folk.x, folk.z) + 0.07, folk.z)
      const mat = mark.material as MeshBasicMaterial
      mat.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.12
    }
  })

  return (
    <group>
      {HIDE.folk.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            marks.current[i] = el
          }}
          rotation={[-Math.PI / 2, 0, 0]}
          visible={false}
        >
          <ringGeometry args={[0.8, 1.15, 18]} />
          <meshBasicMaterial color={FOUND} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}
