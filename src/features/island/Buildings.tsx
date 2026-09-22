import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh, MeshBasicMaterial } from 'three'
import { BUILDINGS, KEYS } from './world'
import { groundHeight } from './terrainLogic'
import { keyCount, useGame } from '../../shared/state/store'
import { BUILDING_MODELS } from './buildings/registry'
import { TextPlane } from '../../shared/engine/TextSign'
import type { Building } from '../../types'

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
  const y = groundHeight(x, z)

  return (
    <group>
      <group
        position={[x, y, z]}
        rotation={[0, building.rotation, 0]}
        scale={building.scale}
      >
        <Model />
      </group>
      <Signpost building={building} />
      <DoorMarker building={building} />
      {building.locksWith && <LockPlate building={building} />}
    </group>
  )
}

/** Wooden board naming the building, planted beside its door. */
function Signpost({ building }: { building: Building }) {
  const [dx, dz] = building.door
  // Wide buildings need the board further out, clear of steps and columns.
  const side = Math.min(building.half[0] - 1, 10)
  const front = 2
  const x =
    dx +
    Math.cos(building.rotation) * side +
    Math.sin(building.rotation) * front
  const z =
    dz -
    Math.sin(building.rotation) * side +
    Math.cos(building.rotation) * front

  return (
    <group
      position={[x, groundHeight(x, z), z]}
      rotation={[0, building.rotation, 0]}
      scale={1.3}
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

/** Pulsing ring on the ground marking where you can walk in. */
function DoorMarker({ building }: { building: Building }) {
  const ring = useRef<Mesh>(null)
  const [x, z] = building.door
  const y = groundHeight(x, z)
  const active = useGame((s) => s.nearby?.id === building.id)
  const visited = useGame((s) => Boolean(s.discovered[building.id]))
  const locked = useGame(
    (s) => Boolean(building.locksWith) && !s.lighthouseOpen,
  )

  useFrame((state) => {
    if (!ring.current) return
    const pulse = (Math.sin(state.clock.elapsedTime * 2.4) + 1) / 2
    const base = active ? 1.15 : 1
    ring.current.scale.setScalar(base + pulse * (active ? 0.12 : 0.06))
    const mat = ring.current.material as MeshBasicMaterial
    mat.opacity = (active ? 0.85 : visited ? 0.32 : 0.6) - pulse * 0.12
  })

  return (
    <mesh
      ref={ring}
      position={[x, y + 0.05, z]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={2}
      scale={1.4}
    >
      <ringGeometry args={[0.95, 1.35, 28]} />
      <meshBasicMaterial
        color={locked ? '#c9553f' : building.accent}
        transparent
        opacity={0.6}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-4}
        polygonOffsetUnits={-4}
      />
    </mesh>
  )
}

/** Five lock slots beside the lighthouse door, lit as keys are found. */
function LockPlate({ building }: { building: Building }) {
  const keys = useGame((s) => s.keys)
  const open = useGame((s) => s.lighthouseOpen)
  const have = keyCount(keys)
  const [dx, dz] = building.door
  const back = -1.6
  const x = dx + Math.sin(building.rotation) * back
  const z = dz + Math.cos(building.rotation) * back

  return (
    <group
      position={[x, groundHeight(x, z) + 2.4, z]}
      rotation={[0, building.rotation, 0]}
    >
      <mesh castShadow>
        <boxGeometry args={[3.4, 1, 0.22]} />
        <meshStandardMaterial color="#4a3a2a" flatShading roughness={0.9} />
      </mesh>
      {KEYS.map((key, i) => (
        <mesh key={key.id} position={[-1.28 + i * 0.64, 0, 0.14]}>
          <cylinderGeometry args={[0.2, 0.2, 0.12, 10]} />
          <meshStandardMaterial
            color={open || keys[key.id] ? key.color : '#2b241d'}
            emissive={open || keys[key.id] ? key.color : '#000000'}
            emissiveIntensity={open || keys[key.id] ? 0.8 : 0}
            flatShading
            roughness={0.6}
          />
        </mesh>
      ))}
      <TextPlane
        text={open ? 'Open' : `${have} / 5 keys`}
        width={2.4}
        aspect={5}
        color={open ? '#9ff0b0' : '#ffd9a8'}
        outline="rgba(0,0,0,0.6)"
        position={[0, 0.85, 0.16]}
      />
    </group>
  )
}
