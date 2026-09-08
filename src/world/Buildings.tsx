import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh, MeshBasicMaterial } from 'three'
import { BUILDINGS } from '../data/world'
import { terrainHeight } from '../game/terrain'
import { useGame } from '../state/store'
import { BUILDING_MODELS } from './buildings/Models'
import { TextPlane } from './TextSign'
import type { Building } from '../types'

export function Buildings() {
  return (
    <group>
      {BUILDINGS.map((b) => (
        <BuildingPlot key={b.id} building={b} />
      ))}
    </group>
  )
}

function BuildingPlot({ building }: { building: Building }) {
  const Model = BUILDING_MODELS[building.kind]
  const [x, z] = building.position
  const y = terrainHeight(x, z)

  return (
    <group>
      <group position={[x, y, z]} rotation={[0, building.rotation, 0]}>
        <Model />
      </group>
      <Signpost building={building} />
      <DoorMarker building={building} />
    </group>
  )
}

/** Wooden board naming the building, planted beside its door. */
function Signpost({ building }: { building: Building }) {
  const [dx, dz] = building.door
  const side = 3.4
  const front = 1.4
  const x = dx + Math.cos(building.rotation) * side + Math.sin(building.rotation) * front
  const z = dz - Math.sin(building.rotation) * side + Math.cos(building.rotation) * front

  return (
    <group
      position={[x, terrainHeight(x, z), z]}
      rotation={[0, building.rotation, 0]}
    >
      {[-1.25, 1.25].map((px) => (
        <mesh key={px} position={[px, 1.05, 0]} castShadow>
          <boxGeometry args={[0.16, 2.1, 0.16]} />
          <meshStandardMaterial color="#8a6642" flatShading roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, 2.05, 0]} castShadow>
        <boxGeometry args={[3.1, 0.95, 0.16]} />
        <meshStandardMaterial color="#a97c4e" flatShading roughness={1} />
      </mesh>
      <mesh position={[0, 2.05, 0.09]}>
        <boxGeometry args={[2.85, 0.72, 0.02]} />
        <meshStandardMaterial color={building.accent} roughness={0.85} />
      </mesh>
      <TextPlane
        text={building.name}
        width={2.75}
        aspect={4.6}
        color="#ffffff"
        outline="rgba(0,0,0,0.45)"
        position={[0, 2.05, 0.11]}
      />
    </group>
  )
}

/** Pulsing ring on the ground marking where you can enter. */
function DoorMarker({ building }: { building: Building }) {
  const ring = useRef<Mesh>(null)
  const [x, z] = building.door
  const y = terrainHeight(x, z)
  const active = useGame((s) => s.nearby?.id === building.id)
  const visited = useGame((s) => Boolean(s.visited[building.id]))

  useFrame((state) => {
    if (!ring.current) return
    const pulse = (Math.sin(state.clock.elapsedTime * 2.4) + 1) / 2
    const base = active ? 1.15 : 1
    ring.current.scale.setScalar(base + pulse * (active ? 0.12 : 0.06))
    const mat = ring.current.material as MeshBasicMaterial
    mat.opacity = (active ? 0.85 : visited ? 0.3 : 0.55) - pulse * 0.12
  })

  return (
    <mesh
      ref={ring}
      position={[x, y + 0.04, z]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={2}
    >
      <ringGeometry args={[0.95, 1.35, 28]} />
      <meshBasicMaterial
        color={building.accent}
        transparent
        opacity={0.6}
        depthWrite={false}
      />
    </mesh>
  )
}
