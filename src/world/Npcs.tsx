import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import type { Group } from 'three'
import { NPCS } from '../data/world'
import { ACTOR_POS, REACTIONS } from '../game/actors'
import { groundHeight } from '../game/terrain'
import { ARENA, PAINT } from '../game/paintball'
import { PARTY, danceSpot } from '../game/party'
import { CHALLENGE_EARSHOT, GUARD } from '../game/guard'
import { HIDE } from '../game/hide'
import { resolveCollisions } from '../game/collision'
import { ISLAND_WALK_RADIUS } from '../data/world'
import { STATIC_COLLIDERS } from '../game/terrain'
import type { Collider } from '../game/terrain'
import { useGame } from '../state/store'
import { Character, type CharacterMotion } from './Character'
import { PLAYER_POS } from './Player'
import type { Npc } from '../types'

/** How close you have to be before someone stops walking to greet you. */
const GREET_RANGE = 6

/** How fast an islander gets away from a water bomb that has just landed. */
const BOLT_SPEED = 7.4

/** How fast a sentry closes on somebody, and how close they end up. */
const MARCH_SPEED = 5.2
const IN_YOUR_FACE = 2.4
/** How far to either side they stand, so two of them are not one of them. */
const SHOULDER = 1.5

/** Everyone else standing in this area, as circles to be kept out of. */
function others(self: string) {
  const out: Collider[] = []
  for (const [id, p] of ACTOR_POS) {
    if (id === self) continue
    out.push({ x: p.x, z: p.z, hx: 0.8, hz: 0.8, circle: true })
  }
  return out
}

export function Npcs({ area }: { area: string }) {
  const night = useGame((s) => s.night)
  // The night shift is only out there once the lamps are on.
  const here = NPCS.filter(
    (n) => n.area === area && (!n.shift || n.shift === (night ? 'night' : 'day')),
  )
  return (
    <group>
      {here.map((npc, i) => (
        <NpcActor
          key={npc.id}
          npc={npc}
          seed={i * 1.7}
          index={i}
          indoors={area !== 'island'}
        />
      ))}
    </group>
  )
}

function NpcActor({
  npc,
  seed,
  index,
  indoors,
}: {
  npc: Npc
  seed: number
  /** Their place in the crowd, which decides where they dance. */
  index: number
  indoors: boolean
}) {
  const group = useRef<Group>(null)
  const marker = useRef<Group>(null)
  const motion = useRef<CharacterMotion>({ moving: false, speed: 0 })
  const at = useRef<[number, number]>([...npc.position])
  const leg = useRef(0)
  /** Eased fall, for someone who has just been painted out. */
  const fall = useRef(0)
  const body = useRef<Group>(null)
  const met = useGame((s) => Boolean(s.visited[npc.id]))

  // Both of these are primitives, so a mid-match ammo change costs nothing.
  const team = useGame((s) =>
    s.paintball && s.paintball.status !== 'briefing'
      ? s.paintball.friends.includes(npc.id)
        ? 'friend'
        : 'enemy'
      : null,
  )
  const painted = useGame((s) => Boolean(s.paintball?.out[npc.id]))
  /** Out looking for you, which means a torch in hand. */
  const searching = useGame(
    (s) => s.hide?.role === 'hider' && s.hide.status === 'playing',
  )
  /** Any game of hide and seek at all, which hides the journal marker: a
   *  yellow exclamation over somebody's head rather gives them away. */
  const anonymous = useGame((s) => s.hide !== null)

  useEffect(() => {
    ACTOR_POS.set(npc.id, { x: npc.position[0], z: npc.position[1] })
    return () => {
      ACTOR_POS.delete(npc.id)
    }
  }, [npc.id, npc.position])

  useFrame((state, rawDelta) => {
    if (!group.current) return
    const delta = Math.min(rawDelta, 0.05)
    // Only hide and seek folds anybody's knees, and only while it is on.
    // Cleared every frame so that walking out of a game — or out of the one
    // hiding place they were tucked into — puts them back on their feet.
    motion.current.crouching = false

    // A match takes the wheel: paintball.ts owns where everyone stands.
    const unit = ARENA.active ? ARENA.units.get(npc.id) : undefined
    if (unit) {
      at.current[0] = unit.x
      at.current[1] = unit.z
      motion.current.moving = unit.moving
      motion.current.speed = unit.speed

      const y = groundHeight(unit.x, unit.z)
      group.current.position.set(unit.x, y, unit.z)
      ACTOR_POS.set(npc.id, { x: unit.x, z: unit.z })

      let turn = unit.facing - group.current.rotation.y
      while (turn > Math.PI) turn -= Math.PI * 2
      while (turn < -Math.PI) turn += Math.PI * 2
      group.current.rotation.y += turn * Math.min(1, delta * 7)

      // Whoever is out goes flat on their back until the round is over.
      fall.current += ((unit.out ? 1 : 0) - fall.current) * Math.min(1, delta * 7)
      if (body.current) {
        body.current.rotation.x = -fall.current * 1.42
        body.current.position.y = fall.current * 0.14
      }
      return
    }

    if (fall.current > 0.001) {
      fall.current = Math.max(0, fall.current - delta * 4)
      if (body.current) {
        body.current.rotation.x = -fall.current * 1.42
        body.current.position.y = fall.current * 0.14
      }
    }

    // A party pulls everyone into the square: walk to your spot on the
    // floor, then dance until the music stops. Everyone, that is, except
    // whoever is on shift — the night watch does not leave the gate.
    if (PARTY.active && !indoors && npc.shift !== 'night') {
      const spot = danceSpot(index)
      const gapX = spot.x - at.current[0]
      const gapZ = spot.z - at.current[1]
      const gap = Math.hypot(gapX, gapZ)

      if (gap > 0.5) {
        const step = Math.min(gap, 4.6 * delta)
        at.current[0] += (gapX / gap) * step
        at.current[1] += (gapZ / gap) * step
        motion.current.moving = true
        motion.current.speed = 4.6
        motion.current.dance = 0
      } else {
        motion.current.moving = false
        motion.current.speed = 0
        motion.current.dance = 1
      }

      const [dxp, dzp] = at.current
      group.current.position.set(dxp, indoors ? 0 : groundHeight(dxp, dzp), dzp)
      ACTOR_POS.set(npc.id, { x: dxp, z: dzp })

      // Face in at the middle of the floor, where everyone else is.
      const inward = Math.atan2(-dxp, -dzp)
      let turn = inward - group.current.rotation.y
      while (turn > Math.PI) turn -= Math.PI * 2
      while (turn < -Math.PI) turn += Math.PI * 2
      group.current.rotation.y += turn * Math.min(1, delta * 4)
      return
    }
    motion.current.dance = 0

    // Hide and seek takes the wheel: hide.ts owns where everybody is and
    // which way they are pointing their torch, because that beam is the
    // whole of what the game is read off.
    const play = HIDE.active ? HIDE.folk.find((f) => f.id === npc.id) : undefined
    if (play) {
      at.current[0] = play.x
      at.current[1] = play.z
      motion.current.moving = play.moving
      motion.current.speed = play.moving ? 3.6 : 0
      motion.current.halt = 0
      motion.current.crouching = HIDE.role === 'seeker' && !play.found
      group.current.position.set(play.x, groundHeight(play.x, play.z), play.z)
      ACTOR_POS.set(npc.id, { x: play.x, z: play.z })
      let turn = play.facing - group.current.rotation.y
      while (turn > Math.PI) turn -= Math.PI * 2
      while (turn < -Math.PI) turn += Math.PI * 2
      group.current.rotation.y += turn * Math.min(1, delta * 7)
      return
    }

    // Somebody has walked up on the gate. Whoever is standing on it turns
    // round and puts a hand out; the whistle has already gone.
    const onWatch = npc.shift === 'night' && GUARD.left > 0
    const challenged =
      onWatch &&
      Math.hypot(at.current[0] - GUARD.x, at.current[1] - GUARD.z) <
        CHALLENGE_EARSHOT
    motion.current.halt = challenged ? 1 : 0
    if (challenged) {
      // While somebody is actually leaning on the line they come off their
      // posts and get in the way of it. They walk back afterwards on their
      // own, the same way anybody knocked off their post does.
      const dx = GUARD.x - at.current[0]
      const dz = GUARD.z - at.current[1]
      const gap = Math.hypot(dx, dz) || 1
      // One steps to the left of them and the next to the right, so a pair
      // coming at you ends up shoulder to shoulder rather than in one spot.
      const flank = index % 2 === 0 ? -1 : 1
      const nx = dx / gap
      const nz = dz / gap
      const tx = GUARD.x - nx * IN_YOUR_FACE - nz * flank * SHOULDER
      const tz = GUARD.z - nz * IN_YOUR_FACE + nx * flank * SHOULDER
      const reach = Math.hypot(tx - at.current[0], tz - at.current[1])

      if (GUARD.holding && reach > 0.15) {
        const step = Math.min(reach, MARCH_SPEED * delta)
        const to: [number, number] = [
          at.current[0] + ((tx - at.current[0]) / reach) * step,
          at.current[1] + ((tz - at.current[1]) / reach) * step,
        ]
        // And whatever the arithmetic says, nobody stands inside anybody.
        resolveCollisions(to, 0.8, others(npc.id), {
          kind: 'circle',
          radius: ISLAND_WALK_RADIUS - 2,
        })
        at.current[0] = to[0]
        at.current[1] = to[1]
        motion.current.moving = true
        motion.current.speed = MARCH_SPEED
      } else {
        motion.current.moving = false
        motion.current.speed = 0
      }

      const [gx, gz] = at.current
      group.current.position.set(gx, groundHeight(gx, gz), gz)
      ACTOR_POS.set(npc.id, { x: gx, z: gz })
      let square = Math.atan2(GUARD.x - gx, GUARD.z - gz) - group.current.rotation.y
      while (square > Math.PI) square -= Math.PI * 2
      while (square < -Math.PI) square += Math.PI * 2
      group.current.rotation.y += square * Math.min(1, delta * 9)
      return
    }

    // Something has just gone off next to them. Whatever they were doing,
    // they are doing this instead until it wears off: away from a water
    // bomb with both hands over the head, or cheering the confetti.
    const shock = indoors ? undefined : REACTIONS.get(npc.id)
    if (shock) {
      if (shock.kind === 'fright') {
        // They bolt, but only so far — nobody ends the flight on the far
        // side of the island because a bomb went off by their bench.
        const strayed = Math.hypot(
          at.current[0] - npc.position[0],
          at.current[1] - npc.position[1],
        )
        if (strayed < 11) {
          const awayX = at.current[0] - shock.x
          const awayZ = at.current[1] - shock.z
          const len = Math.hypot(awayX, awayZ) || 1
          const to: [number, number] = [
            at.current[0] + (awayX / len) * BOLT_SPEED * delta,
            at.current[1] + (awayZ / len) * BOLT_SPEED * delta,
          ]
          resolveCollisions(to, 0.5, STATIC_COLLIDERS, {
            kind: 'circle',
            radius: ISLAND_WALK_RADIUS - 2,
          })
          at.current[0] = to[0]
          at.current[1] = to[1]
          motion.current.moving = true
          motion.current.speed = BOLT_SPEED
        } else {
          motion.current.moving = false
          motion.current.speed = 0
        }
        motion.current.fright = 1
      } else {
        motion.current.moving = false
        motion.current.speed = 0
        motion.current.fright = 0
        motion.current.dance = 1
      }

      const [sx, sz] = at.current
      group.current.position.set(sx, groundHeight(sx, sz), sz)
      ACTOR_POS.set(npc.id, { x: sx, z: sz })

      // Running, they face the way out. Cheering, they face the balloon.
      const facing =
        shock.kind === 'fright'
          ? Math.atan2(sx - shock.x, sz - shock.z)
          : Math.atan2(PLAYER_POS.x - sx, PLAYER_POS.z - sz)
      let spin = facing - group.current.rotation.y
      while (spin > Math.PI) spin -= Math.PI * 2
      while (spin < -Math.PI) spin += Math.PI * 2
      group.current.rotation.y += spin * Math.min(1, delta * 8)
      return
    }
    motion.current.fright = 0

    const dx = PLAYER_POS.x - at.current[0]
    const dz = PLAYER_POS.z - at.current[1]
    const toPlayer = Math.hypot(dx, dz)
    const greeting = toPlayer < GREET_RANGE

    let heading: number | null = null

    if (npc.route && npc.route.length > 1 && !greeting) {
      const target = npc.route[leg.current % npc.route.length]
      const tx = target[0] - at.current[0]
      const tz = target[1] - at.current[1]
      const dist = Math.hypot(tx, tz)

      if (dist < 0.4) {
        leg.current = (leg.current + 1) % npc.route.length
      } else {
        const pace = npc.pace ?? 1.5
        const step = Math.min(dist, pace * delta)
        at.current[0] += (tx / dist) * step
        at.current[1] += (tz / dist) * step
        heading = Math.atan2(tx / dist, tz / dist)
        motion.current.moving = true
        motion.current.speed = pace
      }
    } else {
      // Standing at their post — or ambling back to it, if a match or a
      // water bomb has left them somewhere they do not belong.
      const backX = npc.position[0] - at.current[0]
      const backZ = npc.position[1] - at.current[1]
      const off = Math.hypot(backX, backZ)
      if (!greeting && off > 0.5) {
        const step = Math.min(off, 2.2 * delta)
        at.current[0] += (backX / off) * step
        at.current[1] += (backZ / off) * step
        heading = Math.atan2(backX / off, backZ / off)
        motion.current.moving = true
        motion.current.speed = 2.2
      } else {
        motion.current.moving = false
        motion.current.speed = 0
      }
    }

    const [x, z] = at.current
    const y = indoors ? 0 : groundHeight(x, z)
    group.current.position.set(x, y, z)
    ACTOR_POS.set(npc.id, { x, z })

    // Face the player when close, otherwise face the way they are walking.
    const desired = greeting
      ? Math.atan2(dx, dz)
      : (heading ?? npc.facing)
    let diff = desired - group.current.rotation.y
    while (diff > Math.PI) diff -= Math.PI * 2
    while (diff < -Math.PI) diff += Math.PI * 2
    group.current.rotation.y += diff * Math.min(1, delta * 5)

    if (marker.current) {
      marker.current.position.y =
        2.55 + Math.abs(Math.sin(state.clock.elapsedTime * 3 + seed)) * 0.22
    }
  })

  return (
    <group
      ref={group}
      position={[npc.position[0], indoors ? 0 : groundHeight(...npc.position), npc.position[1]]}
      rotation={[0, npc.facing, 0]}
    >
      <group ref={body}>
        <Character
          colors={npc.colors}
          prop={npc.prop}
          seed={seed}
          motion={motion}
          hair={npc.hair}
          dress={npc.dress}
          dressTrim={npc.dressTrim}
          smile={npc.smile}
          hand={searching ? 'flashlight' : npc.hand}
          gun={Boolean(team) && !painted}
          gunColor={team === 'friend' ? PAINT.friend : PAINT.enemy}
          kit={team ? (team === 'friend' ? PAINT.friend : PAINT.enemy) : undefined}
          paint={painted ? (team === 'enemy' ? PAINT.player : PAINT.enemy) : undefined}
        />
      </group>
      {team && !painted && (
        <mesh position={[0, 2.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.46, 14]} />
          <meshBasicMaterial
            color={team === 'friend' ? PAINT.friend : PAINT.enemy}
            transparent
            opacity={0.95}
          />
        </mesh>
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[0.5, 14]} />
        <meshBasicMaterial color="#2a4a22" transparent opacity={0.2} />
      </mesh>
      {!met && !team && !anonymous && npc.journal && (
        <Billboard>
          <group ref={marker} position={[0, 2.6, 0]} scale={1.35}>
            <mesh position={[0, 0.12, 0]}>
              <boxGeometry args={[0.13, 0.36, 0.02]} />
              <meshBasicMaterial color="#ffd93d" />
            </mesh>
            <mesh position={[0, -0.17, 0]}>
              <boxGeometry args={[0.13, 0.13, 0.02]} />
              <meshBasicMaterial color="#ffd93d" />
            </mesh>
            <mesh position={[0, 0.12, -0.02]}>
              <boxGeometry args={[0.21, 0.44, 0.01]} />
              <meshBasicMaterial color="#3a2a12" />
            </mesh>
            <mesh position={[0, -0.17, -0.02]}>
              <boxGeometry args={[0.21, 0.21, 0.01]} />
              <meshBasicMaterial color="#3a2a12" />
            </mesh>
          </group>
        </Billboard>
      )}
    </group>
  )
}
