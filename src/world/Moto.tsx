import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { CIRCUIT, PLAYER_COLORS } from '../data/world'
import {
  MOTO,
  RIVALS,
  ROAD_HALF,
  pointAt,
  racerColors,
  stepMoto,
} from '../game/moto'
import { isDown, readMove } from '../game/input'
import { groundHeight } from '../game/terrain'
import { isInteractive, useGame } from '../state/store'
import { Character, type CharacterMotion } from './Character'
import { PLAYER_POS, PLAYER_VIEW } from './Player'
import type { Npc } from '../types'
import * as sfx from '../game/audio'

/* ------------------------------ start line -------------------------------- */

/**
 * The line, laid across the road where the circuit meets the road up to the
 * Radio Center. Two posts and a board over the top, so it reads as the place
 * the race starts from at any distance.
 */
function StartLine() {
  const here = pointAt(0)
  const across = ROAD_HALF + 0.6
  const squares = 12

  return (
    <group position={[here.x, 0, here.z]} rotation={[0, here.heading, 0]}>
      {/* Chequered paint. Two rows offset by one, as on any start line. */}
      {[0, 1].map((row) =>
        Array.from({ length: squares }, (_, i) => {
          if ((i + row) % 2 === 1) return null
          const width = (across * 2) / squares
          return (
            <mesh
              key={`${row}-${i}`}
              position={[-across + width * (i + 0.5), 0.03, row * 0.85 - 0.42]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[width, 0.85]} />
              <meshBasicMaterial color="#f7f7f4" />
            </mesh>
          )
        }),
      )}

      {[-1, 1].map((side) => (
        <group key={side} position={[side * (across + 0.7), 0, 0]}>
          <mesh position={[0, 2.4, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.2, 4.8, 8]} />
            <meshStandardMaterial color="#d9dee6" flatShading roughness={0.6} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 5.1, 0]} castShadow>
        <boxGeometry args={[across * 2 + 1.8, 1.2, 0.22]} />
        <meshStandardMaterial color="#e8442f" flatShading roughness={0.6} />
      </mesh>
      <mesh position={[0, 5.1, -0.13]}>
        <boxGeometry args={[across * 2 + 0.4, 0.5, 0.02]} />
        <meshBasicMaterial color="#ffd76b" />
      </mesh>
    </group>
  )
}

/** Marker boards down the outside of the circuit, so the road reads ahead. */
function Markers() {
  return (
    <group>
      {CIRCUIT.map(([x, z], i) => {
        const next = CIRCUIT[(i + 1) % CIRCUIT.length]
        const heading = Math.atan2(next[0] - x, next[1] - z)
        const out = Math.hypot(x, z)
        // Always on the seaward side, which is the outside of the loop.
        const side = ((ROAD_HALF + 1.4) * (x || 0.001)) / out
        const sideZ = ((ROAD_HALF + 1.4) * z) / out
        return (
          <group
            key={i}
            position={[x + side, groundHeight(x + side, z + sideZ), z + sideZ]}
            rotation={[0, heading, 0]}
          >
            <mesh position={[0, 0.75, 0]} castShadow>
              <boxGeometry args={[0.12, 1.5, 0.12]} />
              <meshStandardMaterial color="#e9edf2" flatShading roughness={0.8} />
            </mesh>
            <mesh position={[0, 1.5, 0]}>
              <boxGeometry args={[0.7, 0.34, 0.06]} />
              <meshStandardMaterial
                color={i % 3 === 0 ? '#e8442f' : '#f4f6f8'}
                flatShading
                roughness={0.7}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

/* ---------------------------------- bike ---------------------------------- */

function Wheel({ z }: { z: number }) {
  return (
    <group position={[0, 0.42, z]}>
      <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
        <torusGeometry args={[0.34, 0.12, 8, 14]} />
        <meshStandardMaterial color="#22262e" flatShading roughness={0.8} />
      </mesh>
      {/* Hub and two spokes, so the spin is readable */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.16, 8]} />
        <meshStandardMaterial color="#b9c2cf" roughness={0.4} />
      </mesh>
      {[0, Math.PI / 2].map((r) => (
        <mesh key={r} rotation={[r, 0, 0]}>
          <boxGeometry args={[0.05, 0.62, 0.05]} />
          <meshStandardMaterial color="#8e99ab" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

function Bike({
  rear,
  front,
  fork,
  rider,
  night,
  frame,
  colors,
}: {
  rear: React.RefObject<Group | null>
  front: React.RefObject<Group | null>
  fork: React.RefObject<Group | null>
  rider: React.RefObject<CharacterMotion>
  night: boolean
  /** Frame colour: every bike on the grid is a different one. */
  frame: string
  colors: Npc['colors']
}) {
  return (
    <group>
      {/* Frame spine and engine block */}
      <mesh position={[0, 0.66, 0.02]} castShadow>
        <boxGeometry args={[0.26, 0.3, 1.34]} />
        <meshStandardMaterial color={frame} flatShading roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.5, -0.1]} castShadow>
        <boxGeometry args={[0.34, 0.34, 0.5]} />
        <meshStandardMaterial color="#3a3f4a" flatShading roughness={0.7} />
      </mesh>
      {/* Tank and seat */}
      <mesh position={[0, 0.92, -0.16]} castShadow>
        <boxGeometry args={[0.36, 0.3, 0.6]} />
        <meshStandardMaterial color={frame} flatShading roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.94, 0.4]} castShadow>
        <boxGeometry args={[0.32, 0.14, 0.66]} />
        <meshStandardMaterial color="#2b2f38" flatShading roughness={0.8} />
      </mesh>
      {/* Rear mudguard */}
      <mesh position={[0, 1.02, 0.82]} rotation={[0.22, 0, 0]}>
        <boxGeometry args={[0.34, 0.06, 0.5]} />
        <meshStandardMaterial color="#2b2f38" flatShading roughness={0.8} />
      </mesh>
      {/* Exhaust */}
      <mesh position={[0.24, 0.6, 0.42]} rotation={[0.1, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.055, 0.9, 8]} />
        <meshStandardMaterial color="#b9c2cf" flatShading roughness={0.35} />
      </mesh>

      <group ref={rear} position={[0, 0, 0.78]}>
        <Wheel z={0} />
      </group>

      {/* Everything that steers hangs off the fork */}
      <group ref={fork} position={[0, 0, -0.62]}>
        <group ref={front}>
          <Wheel z={-0.16} />
        </group>
        {[-0.15, 0.15].map((x) => (
          <mesh
            key={x}
            position={[x, 0.8, -0.06]}
            rotation={[-0.3, 0, 0]}
            castShadow
          >
            <boxGeometry args={[0.08, 0.8, 0.1]} />
            <meshStandardMaterial color="#8e99ab" flatShading roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 1.18, 0.06]} castShadow>
          <boxGeometry args={[0.76, 0.07, 0.07]} />
          <meshStandardMaterial color="#2b2f38" flatShading roughness={0.7} />
        </mesh>
        {/* Front plate */}
        <mesh position={[0, 0.96, -0.2]} rotation={[-0.35, 0, 0]}>
          <boxGeometry args={[0.44, 0.4, 0.05]} />
          <meshStandardMaterial color="#f0a33c" flatShading roughness={0.6} />
        </mesh>

        {/* Headlight. The lens is always there; after dark it is lit, throws
            a cone down the road and carries a light of its own. */}
        <mesh position={[0, 0.86, -0.26]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.08, 12]} />
          <meshStandardMaterial
            color={night ? '#fff6d8' : '#cfd6e0'}
            emissive={night ? '#ffe9b0' : '#000000'}
            emissiveIntensity={night ? 2.4 : 0}
            roughness={0.3}
          />
        </mesh>
        {night && (
          <>
            <mesh position={[0, 0.7, -5.6]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[1.9, 10.6, 12, 1, true]} />
              <meshBasicMaterial
                color="#ffeec2"
                transparent
                opacity={0.1}
                depthWrite={false}
              />
            </mesh>
            <pointLight
              position={[0, 0.9, -2.2]}
              intensity={40}
              distance={26}
              decay={1.5}
              color="#ffe9b8"
            />
          </>
        )}
      </group>

      {/* The rider, sitting on it, and nobody rides this island bare-headed */}
      <group position={[0, 0.6, 0.22]} scale={0.92}>
        <Character colors={colors} motion={rider} pose="ride" helmet={frame} />
      </group>
    </group>
  )
}

/* --------------------------------- rivals --------------------------------- */

/**
 * One of the other three. Their race is run on arc length inside moto.ts, so
 * all this does each frame is read where they ended up and put them there.
 */
function RivalBike({ index, night }: { index: number; night: boolean }) {
  const kit = RIVALS[index]
  const body = useRef<Group>(null)
  const rear = useRef<Group>(null)
  const front = useRef<Group>(null)
  const fork = useRef<Group>(null)
  const shadow = useRef<Mesh>(null)
  const rider = useRef<CharacterMotion>({ moving: false, speed: 0 })

  useEffect(() => {
    if (body.current) body.current.rotation.order = 'YXZ'
  }, [])

  useFrame(() => {
    const rival = MOTO.rivals[index]
    const shown = Boolean(rival) && MOTO.active
    if (body.current) body.current.visible = shown
    if (shadow.current) shadow.current.visible = shown
    if (!rival || !body.current) return

    const y = groundHeight(rival.x, rival.z)
    body.current.position.set(rival.x, y, rival.z)
    body.current.rotation.y = rival.heading
    body.current.rotation.z = rival.roll
    if (rear.current) rear.current.rotation.x = rival.wheel
    if (front.current) front.current.rotation.x = rival.wheel
    if (shadow.current) shadow.current.position.set(rival.x, y + 0.04, rival.z)
    rider.current.moving = rival.speed > 1
    rider.current.speed = rival.speed * 0.15
  })

  return (
    <group>
      <group ref={body} visible={false}>
        <Bike
          rear={rear}
          front={front}
          fork={fork}
          rider={rider}
          night={night}
          frame={kit.bike}
          colors={racerColors(kit.id) ?? PLAYER_COLORS}
        />
      </group>
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <circleGeometry args={[0.9, 18]} />
        <meshBasicMaterial color="#2a4a22" transparent opacity={0.24} />
      </mesh>
    </group>
  )
}

/* ---------------------------------- race ---------------------------------- */

const CAM = { distance: 24, height: 11 }

/**
 * Drives the race: reads the controls, steps the bike and the other three,
 * and owns the camera while you are on it. Mounted in place of <Player/>, so
 * the two never fight over where the camera is looking.
 */
export function MotoGame() {
  const camera = useThree((s) => s.camera)
  const body = useRef<Group>(null)
  const rear = useRef<Group>(null)
  const front = useRef<Group>(null)
  const fork = useRef<Group>(null)
  const shadow = useRef<Mesh>(null)
  const pointer = useRef<Group>(null)
  const rider = useRef<CharacterMotion>({ moving: false, speed: 0 })
  const camYaw = useRef(MOTO.heading)
  const camReady = useRef(false)
  const night = useGame((s) => s.night)

  useEffect(() => {
    // Yaw, then pitch, then roll — the order a bike actually moves in.
    if (body.current) body.current.rotation.order = 'YXZ'
    camReady.current = false
  }, [])

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05)
    const store = useGame.getState()
    const run = store.moto
    const live =
      run?.status === 'riding' && MOTO.active && isInteractive(store.mode)

    const move = live ? readMove() : { x: 0, y: 0, run: false }

    if (live) {
      const events = stepMoto(delta, {
        throttle: move.y,
        steer: move.x,
        wheelie: isDown('Space'),
      })

      if (events.bumped) sfx.thud()
      if (events.light) sfx.blip()
      if (events.green) sfx.jingle()
      if (events.lap) sfx.coin()
      if (events.finished) store.finishMoto()
    }

    const y = groundHeight(MOTO.x, MOTO.z)

    if (body.current) {
      body.current.position.set(MOTO.x, y, MOTO.z)
      body.current.rotation.y = MOTO.heading
      body.current.rotation.x = -MOTO.pitch
      body.current.rotation.z = MOTO.roll
    }
    if (rear.current) rear.current.rotation.x = MOTO.wheel
    if (front.current) front.current.rotation.x = MOTO.wheel
    if (fork.current) fork.current.rotation.y = -move.x * 0.32
    if (shadow.current) shadow.current.position.set(MOTO.x, y + 0.04, MOTO.z)

    // The rider bobs a little with the engine.
    rider.current.moving = Math.abs(MOTO.speed) > 1
    rider.current.speed = Math.abs(MOTO.speed) * 0.15

    // An arrow over the bike pointing the way round. A ring road looks the
    // same in both directions from the saddle, and it is the wrong one that
    // costs you the lap.
    if (pointer.current) {
      const ahead = pointAt(MOTO.progress + 20)
      pointer.current.visible = live && MOTO.offRoad
      pointer.current.position.set(
        MOTO.x,
        y + 3.4 + Math.sin(state.clock.elapsedTime * 3) * 0.12,
        MOTO.z,
      )
      pointer.current.rotation.y = Math.atan2(ahead.x - MOTO.x, ahead.z - MOTO.z)
    }

    PLAYER_POS.set(MOTO.x, y, MOTO.z)
    PLAYER_VIEW.facing = MOTO.heading

    /* ------------------------------ camera ----------------------------- */

    // The camera trails the heading rather than snapping to it, so a hard
    // turn does not throw the whole island around.
    let swing = MOTO.heading - camYaw.current
    while (swing > Math.PI) swing -= Math.PI * 2
    while (swing < -Math.PI) swing += Math.PI * 2
    camYaw.current += swing * Math.min(1, delta * 3.4)

    const targetX = MOTO.x - Math.sin(camYaw.current) * CAM.distance
    const targetY = y + CAM.height
    const targetZ = MOTO.z - Math.cos(camYaw.current) * CAM.distance

    if (!camReady.current) {
      camera.position.set(targetX, targetY, targetZ)
      camReady.current = true
    }
    const ease = 1 - Math.pow(0.0025, delta)
    camera.position.x += (targetX - camera.position.x) * ease
    camera.position.y += (targetY - camera.position.y) * ease
    camera.position.z += (targetZ - camera.position.z) * ease
    camera.lookAt(MOTO.x, y + 1.4, MOTO.z)
  })

  return (
    <group>
      <StartLine />
      <Markers />
      {RIVALS.map((kit, i) => (
        <RivalBike key={kit.id} index={i} night={night} />
      ))}

      <group ref={body}>
        <Bike
          rear={rear}
          front={front}
          fork={fork}
          rider={rider}
          night={night}
          frame="#e8442f"
          colors={PLAYER_COLORS}
        />
      </group>
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 18]} />
        <meshBasicMaterial color="#2a4a22" transparent opacity={0.24} />
      </mesh>

      <group ref={pointer} visible={false}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.3, 0.8, 4]} />
          <meshBasicMaterial color="#ffd76b" />
        </mesh>
      </group>
    </group>
  )
}
