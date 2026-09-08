import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import type { Npc } from '../types'

export interface CharacterMotion {
  moving: boolean
  /** Units per second; drives the stride frequency. */
  speed: number
}

interface CharacterProps {
  colors: Npc['colors']
  prop?: Npc['prop']
  /** Live motion, read every frame so movement never re-renders React. */
  motion?: RefObject<CharacterMotion>
  /** Phase offset so a crowd does not breathe in unison. */
  seed?: number
  scale?: number
}

const IDLE = { moving: false, speed: 0 }

export function Character({
  colors,
  prop,
  motion,
  seed = 0,
  scale = 1,
}: CharacterProps) {
  const root = useRef<Group>(null)
  const body = useRef<Group>(null)
  const legL = useRef<Mesh>(null)
  const legR = useRef<Mesh>(null)
  const armL = useRef<Mesh>(null)
  const armR = useRef<Mesh>(null)
  const head = useRef<Group>(null)
  const phase = useRef(0)

  useFrame((state, delta) => {
    const m = motion?.current ?? IDLE
    const t = state.clock.elapsedTime + seed

    if (m.moving) {
      phase.current += delta * Math.min(14, 3 + m.speed * 1.6)
    } else {
      // Ease the stride back to neutral instead of snapping.
      phase.current += delta * 2
    }

    const swing = m.moving ? Math.sin(phase.current) * 0.62 : Math.sin(t * 1.6) * 0.06
    if (legL.current) legL.current.rotation.x = swing
    if (legR.current) legR.current.rotation.x = -swing
    if (armL.current) armL.current.rotation.x = -swing * 0.85
    if (armR.current) armR.current.rotation.x = swing * 0.85

    const bounce = m.moving
      ? Math.abs(Math.sin(phase.current)) * 0.07
      : Math.sin(t * 1.8) * 0.02
    if (body.current) {
      body.current.position.y = bounce
      body.current.rotation.z = m.moving ? Math.sin(phase.current) * 0.04 : 0
    }
    if (head.current) {
      head.current.rotation.y = m.moving ? 0 : Math.sin(t * 0.6) * 0.28
      head.current.rotation.z = Math.sin(t * 1.1) * 0.03
    }
  })

  return (
    <group ref={root} scale={scale}>
      <group ref={body}>
        {/* Legs */}
        <mesh ref={legL} position={[-0.17, 0.42, 0]} castShadow>
          <boxGeometry args={[0.22, 0.85, 0.24]} />
          <meshStandardMaterial color={colors.pants} flatShading roughness={0.9} />
        </mesh>
        <mesh ref={legR} position={[0.17, 0.42, 0]} castShadow>
          <boxGeometry args={[0.22, 0.85, 0.24]} />
          <meshStandardMaterial color={colors.pants} flatShading roughness={0.9} />
        </mesh>

        {/* Torso */}
        <mesh position={[0, 1.05, 0]} castShadow>
          <boxGeometry args={[0.62, 0.72, 0.38]} />
          <meshStandardMaterial color={colors.shirt} flatShading roughness={0.9} />
        </mesh>

        {/* Arms */}
        <mesh ref={armL} position={[-0.4, 1.22, 0]} castShadow>
          <boxGeometry args={[0.17, 0.62, 0.2]} />
          <meshStandardMaterial color={colors.shirt} flatShading roughness={0.9} />
        </mesh>
        <mesh ref={armR} position={[0.4, 1.22, 0]} castShadow>
          <boxGeometry args={[0.17, 0.62, 0.2]} />
          <meshStandardMaterial color={colors.shirt} flatShading roughness={0.9} />
        </mesh>

        {/* Head */}
        <group ref={head} position={[0, 1.72, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.56, 0.54, 0.52]} />
            <meshStandardMaterial color={colors.skin} flatShading roughness={0.85} />
          </mesh>
          {/* Hair */}
          <mesh position={[0, 0.2, -0.03]} castShadow>
            <boxGeometry args={[0.6, 0.24, 0.56]} />
            <meshStandardMaterial color={colors.hair} flatShading roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.03, -0.28]}>
            <boxGeometry args={[0.58, 0.34, 0.1]} />
            <meshStandardMaterial color={colors.hair} flatShading roughness={0.9} />
          </mesh>
          {/* Eyes */}
          <mesh position={[-0.14, 0, 0.27]}>
            <boxGeometry args={[0.08, 0.12, 0.04]} />
            <meshStandardMaterial color="#221c1a" />
          </mesh>
          <mesh position={[0.14, 0, 0.27]}>
            <boxGeometry args={[0.08, 0.12, 0.04]} />
            <meshStandardMaterial color="#221c1a" />
          </mesh>
          <Accessory prop={prop} />
        </group>
      </group>
    </group>
  )
}

function Accessory({ prop }: { prop?: Npc['prop'] }) {
  switch (prop) {
    case 'cap':
      return (
        <group position={[0, 0.3, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.31, 0.33, 0.18, 10]} />
            <meshStandardMaterial color="#c0392b" flatShading roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.05, 0.3]}>
            <boxGeometry args={[0.46, 0.05, 0.3]} />
            <meshStandardMaterial color="#932c22" flatShading roughness={0.9} />
          </mesh>
        </group>
      )
    case 'beret':
      return (
        <mesh position={[0.06, 0.3, -0.02]} rotation={[0.1, 0, -0.28]} castShadow>
          <cylinderGeometry args={[0.34, 0.28, 0.14, 12]} />
          <meshStandardMaterial color="#3f4a2a" flatShading roughness={0.95} />
        </mesh>
      )
    case 'headset':
      return (
        <group>
          <mesh position={[0, 0.26, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.3, 0.035, 6, 14, Math.PI]} />
            <meshStandardMaterial color="#2f3542" roughness={0.7} />
          </mesh>
          <mesh position={[-0.3, 0.04, 0]}>
            <boxGeometry args={[0.09, 0.16, 0.16]} />
            <meshStandardMaterial color="#2f3542" roughness={0.7} />
          </mesh>
          <mesh position={[0.3, 0.04, 0]}>
            <boxGeometry args={[0.09, 0.16, 0.16]} />
            <meshStandardMaterial color="#2f3542" roughness={0.7} />
          </mesh>
          <mesh position={[0.2, -0.09, 0.24]} rotation={[0, 0, 0.5]}>
            <boxGeometry args={[0.22, 0.04, 0.04]} />
            <meshStandardMaterial color="#2f3542" roughness={0.7} />
          </mesh>
        </group>
      )
    case 'glasses':
      return (
        <group position={[0, 0, 0.28]}>
          <mesh position={[-0.14, 0, 0]}>
            <boxGeometry args={[0.16, 0.15, 0.02]} />
            <meshStandardMaterial
              color="#cfe6f5"
              transparent
              opacity={0.55}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0.14, 0, 0]}>
            <boxGeometry args={[0.16, 0.15, 0.02]} />
            <meshStandardMaterial
              color="#cfe6f5"
              transparent
              opacity={0.55}
              roughness={0.2}
            />
          </mesh>
          <mesh>
            <boxGeometry args={[0.36, 0.03, 0.02]} />
            <meshStandardMaterial color="#2f3542" />
          </mesh>
        </group>
      )
    case 'hardhat':
      return (
        <group position={[0, 0.29, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.31, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#f0b429" flatShading roughness={0.7} />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <cylinderGeometry args={[0.38, 0.38, 0.04, 12]} />
            <meshStandardMaterial color="#f0b429" flatShading roughness={0.7} />
          </mesh>
        </group>
      )
    default:
      return null
  }
}
