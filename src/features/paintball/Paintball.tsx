import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh, MeshBasicMaterial } from 'three'
import { ARENA, PAINT, RINGERS, aimAt, stepArena } from './paintballLogic'
import { isCrouching } from '../player/input'
import { groundHeight } from '../island/terrainLogic'
import { isInteractive, useGame } from '../../shared/state/store'
import { Character, type CharacterMotion } from '../player/Character'
import { PLAYER_POS, PLAYER_VIEW } from '../player/playerLogic'
import * as sfx from '../../shared/engine/audio'

/** Balls and marks in flight at once. Both pools are reused, never grown. */
const BALLS = 56
const MARKS = 32

/* ------------------------------- the ringers ------------------------------ */

/**
 * The people on the field who are not islanders.
 *
 * A full side wants more bodies than the eleven the island has, so the rest
 * come in from the next village along. <Npcs/> draws the locals off their own
 * ids; these have no NPC behind them, so they are drawn here instead, off the
 * same arena units.
 */
function Recruits() {
  // Both lists are drawn once per round and never touched again, so their
  // identity is exactly when this list changes.
  const friends = useGame((s) => s.paintball?.friends)
  const enemies = useGame((s) => s.paintball?.enemies)
  const ids = useMemo(
    () =>
      [...(friends ?? []), ...(enemies ?? [])].filter((id) => RINGERS.has(id)),
    [friends, enemies],
  )

  return (
    <group>
      {ids.map((id) => (
        <Recruit key={id} id={id} />
      ))}
    </group>
  )
}

function Recruit({ id }: { id: string }) {
  const group = useRef<Group>(null)
  const body = useRef<Group>(null)
  const motion = useRef<CharacterMotion>({ moving: false, speed: 0 })
  /** Eased fall, for someone who has just been painted out. */
  const fall = useRef(0)
  // The id says which side they came in on, which is all the kit needs.
  const friendly = id.startsWith('ringer-f')
  const out = useGame((s) => Boolean(s.paintball?.out[id]))

  useFrame((_, rawDelta) => {
    if (!group.current) return
    const delta = Math.min(rawDelta, 0.05)
    const unit = ARENA.units.get(id)
    group.current.visible = Boolean(unit)
    if (!unit) return

    motion.current.moving = unit.moving
    motion.current.speed = unit.speed
    group.current.position.set(unit.x, groundHeight(unit.x, unit.z), unit.z)

    let turn = unit.facing - group.current.rotation.y
    while (turn > Math.PI) turn -= Math.PI * 2
    while (turn < -Math.PI) turn += Math.PI * 2
    group.current.rotation.y += turn * Math.min(1, delta * 7)

    fall.current += ((unit.out ? 1 : 0) - fall.current) * Math.min(1, delta * 7)
    if (body.current) {
      body.current.rotation.x = -fall.current * 1.42
      body.current.position.y = fall.current * 0.14
    }
  })

  const ringer = RINGERS.get(id)
  if (!ringer) return null
  const paint = friendly ? PAINT.enemy : PAINT.player
  const team = friendly ? PAINT.friend : PAINT.enemy

  return (
    <group ref={group} visible={false}>
      <group ref={body}>
        <Character
          colors={ringer.colors}
          motion={motion}
          seed={id.length * 1.3 + id.charCodeAt(id.length - 1)}
          gun={!out}
          gunColor={team}
          kit={team}
          paint={out ? paint : undefined}
        />
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[0.5, 12]} />
        <meshBasicMaterial color="#2a4a22" transparent opacity={0.2} />
      </mesh>
      {!out && (
        <mesh position={[0, 2.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.46, 14]} />
          <meshBasicMaterial color={team} transparent opacity={0.95} />
        </mesh>
      )}
    </group>
  )
}

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
      <Recruits />

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
