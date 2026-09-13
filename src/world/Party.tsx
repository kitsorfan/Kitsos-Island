import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Color,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type PointLight,
} from 'three'
import { Amalia } from './Amalia'
import { DANCEFLOOR, PARTY_COLORS, STACK_ANGLES } from '../data/party'
import { partyBeat } from '../game/party'
import { PLAZA_RADIUS } from '../data/world'
import { groundHeight } from '../game/terrain'

const RINGS = 3
const SECTORS = 12
/** One bulb every so often along each string between the plaza's lamps. */
const BULBS_PER_STRING = 6
const STRINGS = 8

const PALETTE = PARTY_COLORS.map((hex) => new Color(hex))

/**
 * The floor: three rings of twelve, each tile taking its colour from the beat
 * and its own place in the ring, so the colour chases round the circle.
 */
function Floor() {
  const tiles = useRef<(Mesh | null)[]>([])

  const layout = useMemo(() => {
    const out: {
      inner: number
      outer: number
      from: number
      ring: number
      sector: number
    }[] = []
    for (let ring = 0; ring < RINGS; ring++) {
      const inner = (DANCEFLOOR.radius * (ring + 0.15)) / RINGS
      const outer = (DANCEFLOOR.radius * (ring + 1)) / RINGS
      for (let sector = 0; sector < SECTORS; sector++) {
        out.push({
          inner,
          outer,
          from: (sector / SECTORS) * Math.PI * 2,
          ring,
          sector,
        })
      }
    }
    return out
  }, [])

  useFrame(() => {
    const beat = Math.floor(partyBeat())
    const pulse = 1 - (partyBeat() % 1)
    layout.forEach((tile, i) => {
      const mesh = tiles.current[i]
      if (!mesh) return
      const step = (tile.ring + tile.sector + beat) % PALETTE.length
      const material = mesh.material as MeshBasicMaterial
      material.color.copy(PALETTE[step])
      // The ring the beat just landed on burns brighter than the rest.
      const hit = (tile.sector + beat) % SECTORS < 2
      material.opacity = 0.3 + (hit ? 0.45 * pulse : 0.12)
    })
  })

  return (
    <group
      position={[
        DANCEFLOOR.x,
        groundHeight(DANCEFLOOR.x, DANCEFLOOR.z) + 0.05,
        DANCEFLOOR.z,
      ]}
    >
      {layout.map((tile, i) => (
        <mesh
          key={i}
          ref={(el) => {
            tiles.current[i] = el
          }}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry
            args={[
              tile.inner,
              tile.outer,
              6,
              1,
              tile.from,
              (Math.PI * 2) / SECTORS - 0.035,
            ]}
          />
          <meshBasicMaterial
            color={PARTY_COLORS[0]}
            transparent
            opacity={0.35}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

/** A speaker stack with a lamp bar on it, and the beam the bar throws. */
function Stack({ angle, index }: { angle: number; index: number }) {
  const beam = useRef<Group>(null)
  const cone = useRef<Mesh>(null)
  const woofer = useRef<Mesh>(null)

  const radius = DANCEFLOOR.radius + 1.6
  const x = DANCEFLOOR.x + Math.sin(angle) * radius
  const z = DANCEFLOOR.z + Math.cos(angle) * radius
  const y = groundHeight(x, z)
  const color = PARTY_COLORS[index % PARTY_COLORS.length]

  useFrame((state) => {
    const beat = partyBeat()
    const hit = Math.abs(Math.sin(beat * Math.PI))
    // Each bar sweeps at its own rate, so the beams cross rather than march.
    if (beam.current) {
      beam.current.rotation.y =
        Math.sin(state.clock.elapsedTime * (0.34 + index * 0.09) + index) * 0.85
    }
    if (cone.current) {
      const material = cone.current.material as MeshBasicMaterial
      material.opacity = 0.05 + hit * 0.09
    }
    // The woofer moves with the kick.
    if (woofer.current) woofer.current.scale.setScalar(1 + hit * 0.09)
  })

  return (
    <group position={[x, y, z]} rotation={[0, angle + Math.PI, 0]}>
      {/* Two boxes, the bottom one bigger */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[1.5, 1.5, 1.2]} />
        <meshStandardMaterial color="#22262e" flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.9, 0]} castShadow>
        <boxGeometry args={[1.2, 0.8, 1]} />
        <meshStandardMaterial color="#2f3542" flatShading roughness={0.9} />
      </mesh>
      <mesh
        ref={woofer}
        position={[0, 0.75, 0.62]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[0.5, 0.5, 0.06, 14]} />
        <meshStandardMaterial color="#12151a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.9, 0.52]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.06, 12]} />
        <meshStandardMaterial color="#12151a" roughness={0.6} />
      </mesh>

      {/* Pole and the lamp bar that sweeps the floor */}
      <mesh position={[0, 3.1, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 2.6, 8]} />
        <meshStandardMaterial color="#4a5057" flatShading roughness={0.9} />
      </mesh>
      <group ref={beam} position={[0, 4.4, 0]}>
        <mesh>
          <boxGeometry args={[1.1, 0.22, 0.3]} />
          <meshStandardMaterial color="#20242e" flatShading roughness={0.8} />
        </mesh>
        {[-0.36, 0, 0.36].map((bx) => (
          <mesh key={bx} position={[bx, -0.14, 0]}>
            <sphereGeometry args={[0.11, 8, 6]} />
            <meshBasicMaterial color={color} />
          </mesh>
        ))}
        {/* Tilted down at the floor, apex at the bar. */}
        <mesh
          ref={cone}
          position={[0, -3.2, 5]}
          rotation={[-Math.PI / 2 + 0.56, 0, 0]}
        >
          <coneGeometry args={[2.4, 12, 12, 1, true]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.08}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  )
}

/** Bulbs slung between the lamps that already ring the square. */
function StringLights() {
  const bulbs = useMemo(() => {
    const lamps: [number, number][] = []
    for (let i = 0; i < STRINGS; i++) {
      const a = (i / STRINGS) * Math.PI * 2 + 0.4
      lamps.push([
        Math.cos(a) * (PLAZA_RADIUS - 2),
        Math.sin(a) * (PLAZA_RADIUS - 2),
      ])
    }

    const out: { position: [number, number, number]; color: string }[] = []
    lamps.forEach(([ax, az], i) => {
      const [bx, bz] = lamps[(i + 1) % lamps.length]
      for (let b = 1; b <= BULBS_PER_STRING; b++) {
        const t = b / (BULBS_PER_STRING + 1)
        const x = ax + (bx - ax) * t
        const z = az + (bz - az) * t
        // Sag: lowest in the middle of the run, as a slung cable hangs.
        const sag = Math.sin(t * Math.PI) * 1.5
        out.push({
          position: [x, groundHeight(x, z) + 4.1 - sag, z],
          color: PARTY_COLORS[(i * BULBS_PER_STRING + b) % PARTY_COLORS.length],
        })
      }
    })
    return out
  }, [])

  const group = useRef<Group>(null)

  useFrame(() => {
    // Every other bulb takes the beat, so the strings twinkle in pairs.
    const beat = Math.floor(partyBeat())
    group.current?.children.forEach((bulb, i) => {
      const on = (i + beat) % 2 === 0
      bulb.scale.setScalar(on ? 1.25 : 0.8)
    })
  })

  return (
    <group ref={group}>
      {bulbs.map((bulb, i) => (
        <mesh key={i} position={bulb.position}>
          <sphereGeometry args={[0.13, 8, 6]} />
          <meshBasicMaterial color={bulb.color} />
        </mesh>
      ))}
    </group>
  )
}

/** Four coloured lights orbiting over the floor, pulsing with the beat. */
function MovingLights() {
  const lights = useRef<(PointLight | null)[]>([])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const hit = Math.abs(Math.sin(partyBeat() * Math.PI))
    lights.current.forEach((light, i) => {
      if (!light) return
      const angle = t * (0.55 + i * 0.12) + (i / 4) * Math.PI * 2
      light.position.set(
        DANCEFLOOR.x + Math.sin(angle) * DANCEFLOOR.radius * 0.6,
        5.5 + Math.sin(t * 0.8 + i) * 0.8,
        DANCEFLOOR.z + Math.cos(angle) * DANCEFLOOR.radius * 0.6,
      )
      light.intensity = 40 + hit * 55
    })
  })

  return (
    <group>
      {[0, 1, 2, 3].map((i) => (
        <pointLight
          key={i}
          ref={(el) => {
            lights.current[i] = el
          }}
          intensity={50}
          distance={26}
          decay={1.5}
          color={PARTY_COLORS[i]}
        />
      ))}
    </group>
  )
}

/** Everything that only exists while the square is dancing. */
export function Party({ amalia }: { amalia: boolean }) {
  return (
    <group>
      {amalia && <Amalia />}
      <Floor />
      <StringLights />
      <MovingLights />
      {STACK_ANGLES.map((angle, i) => (
        <Stack key={angle} angle={angle} index={i} />
      ))}
    </group>
  )
}
