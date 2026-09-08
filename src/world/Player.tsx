import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, type Group } from 'three'
import { BUILDINGS, NPCS, PLAYER_START, SIGNS } from '../data/world'
import {
  STATIC_COLLIDERS,
  TREE_COLLIDERS,
  probeCamera,
  terrainHeight,
} from '../game/terrain'
import { resolveCollisions } from '../game/collision'
import { consumeInteract, readCameraTurn, readMove } from '../game/input'
import { isInteractive, useGame } from '../state/store'
import { Character, type CharacterMotion } from './Character'
import * as sfx from '../game/audio'
import type { Nearby } from '../state/store'

const WALK_SPEED = 7.2
const RUN_SPEED = 11.5
const PLAYER_RADIUS = 0.5
const CAMERA_DISTANCE = 18
const CAMERA_HEIGHT = 13

/** Live player position, read by NPCs so they can turn toward you. */
export const PLAYER_POS = new Vector3(PLAYER_START[0], 0, PLAYER_START[1])

interface Target extends Nearby {
  x: number
  z: number
  range: number
  trigger: () => void
}

export function Player() {
  const group = useRef<Group>(null)
  const camera = useThree((s) => s.camera)
  const viewport = useThree((s) => s.size)

  const position = useRef<[number, number]>([...PLAYER_START])
  const facing = useRef(Math.PI)
  const yaw = useRef(0)
  const motion = useRef<CharacterMotion>({ moving: false, speed: 0 })
  const camReady = useRef(false)
  const boom = useRef(1)

  const colliders = useMemo(
    () => [
      ...STATIC_COLLIDERS,
      ...TREE_COLLIDERS,
      ...NPCS.map((n) => ({
        x: n.position[0],
        z: n.position[1],
        hx: 0.6,
        hz: 0.6,
        circle: true,
      })),
    ],
    [],
  )

  const targets = useMemo<Target[]>(() => {
    const { talk, openPanel, record } = useGame.getState()
    const list: Target[] = []

    for (const npc of NPCS) {
      list.push({
        id: npc.id,
        kind: 'npc',
        label: npc.name,
        verb: 'Talk',
        x: npc.position[0],
        z: npc.position[1],
        range: 2.9,
        trigger: () => {
          sfx.confirm()
          talk({ speaker: npc.name, role: npc.role, lines: npc.lines })
          record({
            id: npc.id,
            title: npc.journal.title,
            body: npc.journal.body,
            source: npc.name,
          })
        },
      })
    }

    for (const b of BUILDINGS) {
      list.push({
        id: b.id,
        kind: 'building',
        label: b.name,
        verb: b.kind === 'radio' ? 'Open channel' : 'Enter',
        x: b.door[0],
        z: b.door[1],
        range: 3.4,
        trigger: () => {
          sfx.confirm()
          openPanel(b.id)
          record({
            id: b.id,
            title: b.name,
            body: b.subtitle,
            source: 'Kitsos Town',
          })
        },
      })
    }

    for (const s of SIGNS) {
      list.push({
        id: s.id,
        kind: 'sign',
        label: s.label,
        verb: 'Read',
        x: s.position[0],
        z: s.position[1],
        range: 2.4,
        trigger: () => {
          sfx.confirm()
          talk({ speaker: s.label, role: 'Signpost', lines: s.lines })
        },
      })
    }

    return list
  }, [])

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05)
    const store = useGame.getState()
    const active = isInteractive(store.mode)

    // --- Camera orbit -------------------------------------------------
    const turn = active ? readCameraTurn() : 0
    yaw.current += turn * delta * 1.8

    // --- Movement -----------------------------------------------------
    const move = active ? readMove() : { x: 0, y: 0, run: false }
    const magnitude = Math.hypot(move.x, move.y)
    const speed = move.run ? RUN_SPEED : WALK_SPEED

    if (magnitude > 0.02) {
      const sin = Math.sin(yaw.current)
      const cos = Math.cos(yaw.current)
      // Forward points away from the camera; right is 90° clockwise of it.
      const dx = cos * move.x - sin * move.y
      const dz = -sin * move.x - cos * move.y

      position.current[0] += dx * speed * delta
      position.current[1] += dz * speed * delta
      resolveCollisions(position.current, PLAYER_RADIUS, colliders)

      const desired = Math.atan2(dx, dz)
      let diff = desired - facing.current
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      facing.current += diff * Math.min(1, delta * 14)

      motion.current.moving = true
      motion.current.speed = speed * magnitude
      if (!store.hasMoved) store.markMoved()
    } else {
      motion.current.moving = false
      motion.current.speed = 0
    }

    const [px, pz] = position.current
    const py = terrainHeight(px, pz)
    PLAYER_POS.set(px, py, pz)

    if (group.current) {
      group.current.position.set(px, py, pz)
      group.current.rotation.y = facing.current
    }

    // --- Camera follow ------------------------------------------------
    const sinY = Math.sin(yaw.current)
    const cosY = Math.cos(yaw.current)

    const { span, blocker } = probeCamera(
      px,
      py + 1.5,
      pz,
      sinY * CAMERA_DISTANCE,
      CAMERA_HEIGHT - 1.5,
      cosY * CAMERA_DISTANCE,
    )

    // A building behind you means the camera is on its far side: swing around
    // to the open side rather than shoving the lens through the wall.
    if (blocker && turn === 0) {
      const ax = px - blocker.x
      const az = pz - blocker.z
      const len = Math.hypot(ax, az)
      if (len > 0.05) {
        let swing = Math.atan2(ax / len, az / len) - yaw.current
        while (swing > Math.PI) swing -= Math.PI * 2
        while (swing < -Math.PI) swing += Math.PI * 2
        yaw.current += Math.sign(swing) * Math.min(Math.abs(swing), delta * 2.6)
      }
    }

    boom.current += (span - boom.current) * Math.min(1, delta * (span < boom.current ? 9 : 3))

    // Tall, narrow viewports show much less ground, so ease the boom out.
    const aspect = viewport.width / Math.max(1, viewport.height)
    const framing = Math.min(1.32, Math.max(1, 1 + (1.15 - aspect) * 0.42))

    const reach = CAMERA_DISTANCE * framing * boom.current
    const targetX = px + Math.sin(yaw.current) * reach
    const targetZ = pz + Math.cos(yaw.current) * reach
    const targetY =
      py + CAMERA_HEIGHT * framing * (0.72 + 0.28 * boom.current)

    if (!camReady.current) {
      camera.position.set(targetX, targetY + 26, targetZ + 12)
      camReady.current = true
    }
    const ease = 1 - Math.pow(0.0015, delta)
    camera.position.x += (targetX - camera.position.x) * ease
    camera.position.y += (targetY - camera.position.y) * ease
    camera.position.z += (targetZ - camera.position.z) * ease
    camera.lookAt(px, py + 1.4, pz)

    // --- Interaction --------------------------------------------------
    let best: Target | null = null
    let bestDist = Infinity
    for (const t of targets) {
      const d = Math.hypot(px - t.x, pz - t.z)
      if (d < t.range && d < bestDist) {
        best = t
        bestDist = d
      }
    }

    if (active) {
      store.setNearby(
        best
          ? { id: best.id, kind: best.kind, label: best.label, verb: best.verb }
          : null,
      )
      if (consumeInteract() && best) best.trigger()
    } else {
      consumeInteract()
    }
  })

  return (
    <group ref={group}>
      <Character
        colors={{
          skin: '#f0c39a',
          hair: '#3a2a1d',
          shirt: '#e8442f',
          pants: '#2a3f78',
        }}
        motion={motion}
      />
      {/* Soft blob shadow so the player never looks like it floats. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[0.55, 16]} />
        <meshBasicMaterial color="#2a4a22" transparent opacity={0.22} />
      </mesh>
    </group>
  )
}
