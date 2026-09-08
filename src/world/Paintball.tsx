import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh, MeshBasicMaterial } from 'three'
import { ARENA, PAINT, aimAt, stepArena } from '../game/paintball'
import { isCrouching } from '../game/input'
import { groundHeight } from '../game/terrain'
import { isInteractive, useGame } from '../state/store'
import { PLAYER_POS, PLAYER_VIEW } from './Player'
import * as sfx from '../game/audio'

/** Balls and marks in flight at once. Both pools are reused, never grown. */
const BALLS = 56
const MARKS = 32

/**
 * Steps the match and draws it: every ball in the air, the paint it leaves
 * behind, and a ring under whoever your marker has picked out. Mounted only
 * while a match is on, so the ordinary island pays nothing for it.
 */
export function Paintball() {
  const balls = useRef<(Mesh | null)[]>([])
  const marks = useRef<(Mesh | null)[]>([])
  const lock = useRef<Mesh>(null)

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05)
    const store = useGame.getState()
    const game = store.paintball

    // The map, a card or the end of the round all freeze the field.
    const live =
      Boolean(game) &&
      game!.status === 'playing' &&
      ARENA.active &&
      isInteractive(store.mode)

    if (!live) {
      // Frozen field: nobody strides on the spot behind the result card.
      for (const u of ARENA.units.values()) {
        u.moving = false
        u.speed = 0
      }
    }

    if (live) {
      const events = stepArena(delta, {
        x: PLAYER_POS.x,
        z: PLAYER_POS.z,
        crouched: isCrouching(),
        invulnerable: false,
      })

      for (const hit of events.splatted) {
        sfx.splat()
        store.splatCombatant(hit.id, hit.team, hit.by)
      }
      if (events.playerHit) {
        sfx.hurt()
        store.hitPlayer()
      }
    }

    for (let i = 0; i < BALLS; i++) {
      const mesh = balls.current[i]
      if (!mesh) continue
      const p = ARENA.pellets[i]
      mesh.visible = Boolean(p)
      if (!p) continue
      mesh.position.set(p.x, p.y, p.z)
      const mat = mesh.material as MeshBasicMaterial
      mat.color.set(p.color)
    }

    for (let i = 0; i < MARKS; i++) {
      const mesh = marks.current[i]
      if (!mesh) continue
      const splat = ARENA.splats[i]
      mesh.visible = Boolean(splat)
      if (!splat) continue
      mesh.position.set(splat.x, splat.y, splat.z)
      const mat = mesh.material as MeshBasicMaterial
      mat.color.set(splat.color)
      mat.opacity = Math.min(0.8, splat.life * 0.5)
      mesh.scale.setScalar(1.15 - splat.life * 0.12)
    }

    // The ring shows which enemy the next round will chase.
    if (lock.current) {
      const shot = live
        ? aimAt(PLAYER_POS.x, PLAYER_POS.z, PLAYER_VIEW.facing)
        : { target: null }
      lock.current.visible = Boolean(shot.target)
      if (shot.target) {
        lock.current.position.set(
          shot.target.x,
          groundHeight(shot.target.x, shot.target.z) + 0.09,
          shot.target.z,
        )
      }
    }
  })

  return (
    <group>
      {Array.from({ length: BALLS }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            balls.current[i] = el
          }}
          visible={false}
        >
          <sphereGeometry args={[0.17, 8, 6]} />
          <meshBasicMaterial color={PAINT.player} />
        </mesh>
      ))}

      {Array.from({ length: MARKS }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            marks.current[i] = el
          }}
          rotation={[-Math.PI / 2, 0, 0]}
          visible={false}
        >
          <circleGeometry args={[0.45, 10]} />
          <meshBasicMaterial color={PAINT.player} transparent opacity={0.7} />
        </mesh>
      ))}

      <mesh ref={lock} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.9, 1.15, 20]} />
        <meshBasicMaterial color={PAINT.player} transparent opacity={0.85} />
      </mesh>
    </group>
  )
}
