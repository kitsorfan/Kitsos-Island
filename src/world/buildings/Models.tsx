import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  ExtrudeGeometry,
  Shape,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type MeshStandardMaterial,
} from 'three'
import type { BuildingKind } from '../../types'
import { TextPlane } from '../TextSign'
import { GreekFlag } from '../InteriorProps'
import { IbmMark, NtuaSeal, VeltistonMark } from '../Emblems'

/** Triangular prism used for gable roofs; the ridge runs along local Z. */
function useGable(width: number, height: number, depth: number) {
  return useMemo(() => {
    const shape = new Shape()
    shape.moveTo(-width / 2, 0)
    shape.lineTo(width / 2, 0)
    shape.lineTo(0, height)
    shape.closePath()
    const geo = new ExtrudeGeometry(shape, { depth, bevelEnabled: false })
    geo.translate(0, 0, -depth / 2)
    return geo
  }, [width, height, depth])
}

interface WindowProps {
  position: [number, number, number]
  size?: [number, number]
  rotation?: [number, number, number]
  frame?: string
  glass?: string
  lit?: boolean
}

function Win({
  position,
  size = [1, 1.2],
  rotation = [0, 0, 0],
  frame = '#3f6fb5',
  glass = '#bfe4f5',
  lit = false,
}: WindowProps) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[size[0] + 0.18, size[1] + 0.18, 0.12]} />
        <meshStandardMaterial color={frame} flatShading roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.1]}>
        <planeGeometry args={size} />
        <meshStandardMaterial
          color={lit ? '#ffe9a8' : glass}
          emissive={lit ? '#ffbe4d' : '#000000'}
          emissiveIntensity={lit ? 0.7 : 0}
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>
    </group>
  )
}

function Door({
  position,
  width = 1.4,
  height = 2.4,
  color = '#2f6bb3',
}: {
  position: [number, number, number]
  width?: number
  height?: number
  color?: string
}) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[width, height, 0.18]} />
        <meshStandardMaterial color={color} flatShading roughness={0.7} />
      </mesh>
      <mesh position={[width * 0.28, 0, 0.13]}>
        <sphereGeometry args={[0.08, 8, 6]} />
        <meshStandardMaterial color="#f0c14b" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, -height / 2 - 0.1, 0.55]}>
        <boxGeometry args={[width + 1, 0.2, 1.2]} />
        <meshStandardMaterial color="#cfc2a6" flatShading roughness={1} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Kitsos House — whitewashed Greek cube with a terracotta roof        */
/* ------------------------------------------------------------------ */

function HouseModel() {
  const W = 8.8
  const D = 7.8
  const H = 4.2
  const roof = useGable(W + 0.9, 2.4, D + 0.9)

  return (
    <group>
      <mesh position={[0, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color="#f6f1e4" flatShading roughness={0.95} />
      </mesh>
      <mesh
        geometry={roof}
        position={[0, H, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <meshStandardMaterial color="#c85a3f" flatShading roughness={0.9} />
      </mesh>

      <Door position={[0, 1.2, D / 2 + 0.02]} color="#2f6bb3" />
      <Win position={[-2.6, 2.4, D / 2 + 0.02]} lit />
      <Win position={[2.6, 2.4, D / 2 + 0.02]} />
      <Win position={[-2.6, 2.4, -D / 2 - 0.02]} rotation={[0, Math.PI, 0]} />
      <Win
        position={[W / 2 + 0.02, 2.4, 1.4]}
        rotation={[0, Math.PI / 2, 0]}
        lit
      />

      {/* Chimney */}
      <mesh position={[-2.6, H + 1.9, -1.6]} castShadow>
        <boxGeometry args={[0.8, 1.9, 0.8]} />
        <meshStandardMaterial color="#e6ddca" flatShading roughness={1} />
      </mesh>
      <mesh position={[-2.6, H + 2.95, -1.6]}>
        <boxGeometry args={[1, 0.22, 1]} />
        <meshStandardMaterial color="#a8492f" flatShading roughness={1} />
      </mesh>

      {/* Porch canopy */}
      <mesh position={[0, 3.1, D / 2 + 0.9]} castShadow>
        <boxGeometry args={[3.6, 0.18, 1.9]} />
        <meshStandardMaterial color="#8c6242" flatShading roughness={0.9} />
      </mesh>
      {[-1.6, 1.6].map((x) => (
        <mesh key={x} position={[x, 1.5, D / 2 + 1.7]} castShadow>
          <cylinderGeometry args={[0.11, 0.11, 3, 6]} />
          <meshStandardMaterial color="#8c6242" flatShading roughness={0.9} />
        </mesh>
      ))}

      {/* Flower pots by the door */}
      {[-1.1, 1.1].map((x) => (
        <group key={x} position={[x, 0, D / 2 + 1.5]}>
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.32, 0.24, 0.55, 8]} />
            <meshStandardMaterial color="#c1714b" flatShading roughness={1} />
          </mesh>
          <mesh position={[0, 0.72, 0]}>
            <icosahedronGeometry args={[0.36, 0]} />
            <meshStandardMaterial color="#e0567c" flatShading roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* NTUA Academy — neoclassical block with a colonnade                  */
/* ------------------------------------------------------------------ */

function UniversityModel() {
  const W = 20.8
  const D = 12.8
  const H = 7
  const pediment = useGable(9.6, 2.2, 1.6)
  const columns = [-4, -2.4, -0.8, 0.8, 2.4, 4]

  return (
    <group>
      {/* Steps */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[0, 0.14 + i * 0.28, D / 2 + 2.6 - i * 0.5]}
          receiveShadow
        >
          <boxGeometry args={[12 - i * 0.6, 0.28, 3.4 - i]} />
          <meshStandardMaterial color="#ded4bd" flatShading roughness={1} />
        </mesh>
      ))}

      <mesh position={[0, H / 2 + 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color="#f2e9d6" flatShading roughness={0.95} />
      </mesh>
      {/* Cornice */}
      <mesh position={[0, H + 1, 0]} castShadow>
        <boxGeometry args={[W + 0.7, 0.6, D + 0.7]} />
        <meshStandardMaterial color="#e0d3b6" flatShading roughness={1} />
      </mesh>
      {/* Upper set-back storey */}
      <mesh position={[0, H + 2.1, 0]} castShadow>
        <boxGeometry args={[W - 5, 1.8, D - 3]} />
        <meshStandardMaterial color="#eee2c9" flatShading roughness={1} />
      </mesh>

      {/* Portico */}
      <group position={[0, 0, D / 2 + 1.4]}>
        {columns.map((x) => (
          <mesh key={x} position={[x, 3.2, 0]} castShadow>
            <cylinderGeometry args={[0.42, 0.48, 6.4, 12]} />
            <meshStandardMaterial color="#faf3e4" flatShading roughness={0.9} />
          </mesh>
        ))}
        {columns.map((x) => (
          <mesh key={`b${x}`} position={[x, 0.2, 0]}>
            <boxGeometry args={[1.15, 0.4, 1.15]} />
            <meshStandardMaterial color="#e6dbc3" flatShading roughness={1} />
          </mesh>
        ))}
        <mesh position={[0, 6.7, 0]} castShadow>
          <boxGeometry args={[10.4, 0.8, 2.6]} />
          <meshStandardMaterial color="#f7efdd" flatShading roughness={0.95} />
        </mesh>
        <mesh
          geometry={pediment}
          position={[0, 7.1, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <meshStandardMaterial color="#f0e6d0" flatShading roughness={0.95} />
        </mesh>
        <NtuaSeal size={1.9} position={[0, 8.15, 0.86]} />
        <TextPlane
          text="ΕΘΝΙΚΟ ΜΕΤΣΟΒΙΟ ΠΟΛΥΤΕΧΝΕΙΟ"
          width={9.4}
          aspect={13}
          color="#2f5fa8"
          outline="#f7efdd"
          position={[0, 6.72, 1.33]}
        />
      </group>

      {/* Facade windows */}
      {[-8.4, -6.6, 6.6, 8.4].map((x) => (
        <Win
          key={x}
          position={[x, 3.4, D / 2 + 0.03]}
          size={[1.2, 2]}
          frame="#c3b394"
          lit={x < 0}
        />
      ))}
      {[-8.4, -6.6, -2.6, 0, 2.6, 6.6, 8.4].map((x) => (
        <Win
          key={`u${x}`}
          position={[x, 7, D / 2 + 0.03]}
          size={[1.1, 1.4]}
          frame="#c3b394"
        />
      ))}
      {[-4, 0, 4].map((z) => (
        <Win
          key={`s${z}`}
          position={[W / 2 + 0.03, 4.2, z]}
          size={[1.2, 2]}
          rotation={[0, Math.PI / 2, 0]}
          frame="#c3b394"
        />
      ))}

      {/* Foundation stone carrying the school's seal */}
      <group position={[-9.4, 0, 9.6]}>
        <mesh position={[0, 0.16, 0]} receiveShadow>
          <boxGeometry args={[3.2, 0.32, 1]} />
          <meshStandardMaterial color="#cfc2a6" flatShading roughness={1} />
        </mesh>
        <mesh position={[0, 1.7, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 2.8, 0.55]} />
          <meshStandardMaterial color="#e6dbc3" flatShading roughness={1} />
        </mesh>
        <mesh position={[0, 3.16, 0]} castShadow>
          <boxGeometry args={[3.1, 0.22, 0.75]} />
          <meshStandardMaterial color="#d8cdb4" flatShading roughness={1} />
        </mesh>
        <NtuaSeal size={2.1} position={[0, 1.78, 0.29]} />
      </group>

      {/* Flagpole, kept clear of the foundation stone */}
      <group position={[9.4, 0, D / 2 + 4]}>
        <mesh position={[0, 3.4, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.11, 6.8, 8]} />
          <meshStandardMaterial color="#c9cdd2" metalness={0.5} roughness={0.4} />
        </mesh>
        <Flag y={5.9} />
      </group>
    </group>
  )
}

/** Hangs any banner off a pole and gives it a lazy wave. */
function WavingFlag({
  y,
  children,
}: {
  y: number
  children: React.ReactNode
}) {
  const group = useRef<Group>(null)
  useFrame((state) => {
    if (!group.current) return
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.9) * 0.14
    group.current.position.z = Math.sin(state.clock.elapsedTime * 2.4) * 0.07
  })
  return (
    <group ref={group} position={[0.06, y, 0]}>
      {children}
    </group>
  )
}

/** Banner hung just below the top of its pole. */
function Flag({ y, color = '#2f6bb3' }: { y: number; color?: string }) {
  const mesh = useRef<Mesh>(null)
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = Math.sin(state.clock.elapsedTime * 2.2) * 0.16
      mesh.current.position.z = Math.sin(state.clock.elapsedTime * 2.6) * 0.08
    }
  })
  return (
    <mesh ref={mesh} position={[0.95, y, 0]}>
      <boxGeometry args={[1.9, 1.2, 0.05]} />
      <meshStandardMaterial color={color} flatShading roughness={0.8} />
    </mesh>
  )
}

/* ------------------------------------------------------------------ */
/* Work District — glass tower plus a consulting annex                 */
/* ------------------------------------------------------------------ */

function WorkModel() {
  const W = 12.8
  const D = 11.8
  /** Shared front-face depth so every facade detail lines up. */
  const FRONT = D / 2 - 0.4

  return (
    <group>
      {/* Plaza slab */}
      <mesh position={[0, 0.06, D / 2 + 1.6]} receiveShadow>
        <boxGeometry args={[W, 0.12, 4]} />
        <meshStandardMaterial color="#d5d8da" flatShading roughness={1} />
      </mesh>

      {/* Main tower — front face sits at z = FRONT */}
      <mesh position={[-2.6, 7, FRONT - 4.75]} castShadow receiveShadow>
        <boxGeometry args={[7.2, 14, 9.5]} />
        <meshStandardMaterial color="#33465c" flatShading roughness={0.5} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[-2.6, 2.6 + i * 2.1, FRONT + 0.07]}>
          <boxGeometry args={[6.4, 1.1, 0.14]} />
          <meshStandardMaterial
            color="#6fe6cf"
            emissive="#2fb59a"
            emissiveIntensity={0.5}
            roughness={0.2}
            metalness={0.3}
          />
        </mesh>
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh
          key={`w${i}`}
          position={[-6.27, 2.6 + i * 2.1, FRONT - 4.75]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <boxGeometry args={[8.4, 1.1, 0.14]} />
          <meshStandardMaterial
            color="#6fe6cf"
            emissive="#2fb59a"
            emissiveIntensity={0.4}
            roughness={0.2}
          />
        </mesh>
      ))}
      <mesh position={[-2.6, 14.2, FRONT - 4.75]} castShadow>
        <boxGeometry args={[7.8, 0.5, 10.1]} />
        <meshStandardMaterial color="#22313f" flatShading roughness={0.7} />
      </mesh>
      <VeltistonMark width={6.6} position={[-2.6, 14.2, FRONT + 0.35]} />
      <mesh position={[-2.6, 15.6, FRONT - 4.75]} castShadow>
        <cylinderGeometry args={[0.09, 0.12, 2.4, 6]} />
        <meshStandardMaterial color="#9aa5ad" metalness={0.6} roughness={0.4} />
      </mesh>
      <Beacon position={[-2.6, 16.9, FRONT - 4.75]} color="#2fb59a" />

      {/* Annex */}
      <mesh position={[3.6, 3.2, FRONT - 3.6]} castShadow receiveShadow>
        <boxGeometry args={[5.2, 6.4, 6.6]} />
        <meshStandardMaterial color="#48627a" flatShading roughness={0.7} />
      </mesh>
      {[1.5, 3.5].map((y) => (
        <mesh key={y} position={[3.6, y, FRONT - 0.23]}>
          <boxGeometry args={[4.4, 0.9, 0.14]} />
          <meshStandardMaterial
            color="#bfe4f7"
            emissive="#4a90c8"
            emissiveIntensity={0.3}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* Tenant board on the forecourt, at reading height */}
      <group position={[4.6, 0, 6.2]}>
        <mesh position={[0, 0.14, 0]} receiveShadow>
          <boxGeometry args={[5, 0.28, 1.1]} />
          <meshStandardMaterial color="#d5d8da" flatShading roughness={1} />
        </mesh>
        <mesh position={[0, 2.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.6, 3.6, 0.5]} />
          <meshStandardMaterial color="#2b3a49" flatShading roughness={0.7} />
        </mesh>
        <VeltistonMark width={3.9} position={[0, 2.85, 0.27]} />
        <mesh position={[0, 2.15, 0.27]}>
          <planeGeometry args={[3.7, 0.07]} />
          <meshBasicMaterial color="#2fb59a" />
        </mesh>
        <IbmMark width={2.5} position={[0, 1.35, 0.27]} />
      </group>

      {/* Entrance canopy + doors */}
      <mesh position={[-2.6, 3.6, FRONT + 1.1]} castShadow>
        <boxGeometry args={[6, 0.24, 2.8]} />
        <meshStandardMaterial color="#2fb59a" flatShading roughness={0.6} />
      </mesh>
      {[-5, -0.2].map((x) => (
        <mesh key={x} position={[x, 1.8, FRONT + 2.3]}>
          <cylinderGeometry args={[0.08, 0.08, 3.6, 6]} />
          <meshStandardMaterial color="#2fb59a" metalness={0.3} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[-2.6, 1.7, FRONT + 0.09]}>
        <boxGeometry args={[3.4, 3.4, 0.12]} />
        <meshStandardMaterial
          color="#d6f5ee"
          transparent
          opacity={0.8}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>
      <mesh position={[-2.6, 1.7, FRONT + 0.17]}>
        <boxGeometry args={[0.12, 3.4, 0.06]} />
        <meshStandardMaterial color="#22313f" />
      </mesh>
    </group>
  )
}

function Beacon({
  position,
  color,
}: {
  position: [number, number, number]
  color: string
}) {
  const mesh = useRef<Mesh>(null)
  useFrame((state) => {
    if (!mesh.current) return
    const pulse = (Math.sin(state.clock.elapsedTime * 3) + 1) / 2
    mesh.current.scale.setScalar(0.8 + pulse * 0.5)
    const mat = mesh.current.material as MeshStandardMaterial
    mat.emissiveIntensity = 0.6 + pulse * 2
  })
  return (
    <mesh ref={mesh} position={position}>
      <sphereGeometry args={[0.22, 10, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
    </mesh>
  )
}

/* ------------------------------------------------------------------ */
/* Army Camp — barracks, tents, watchtower                             */
/* ------------------------------------------------------------------ */

function ArmyModel() {
  const D = 10.8
  const barracksRoof = useGable(8.4, 1.5, 7.4)

  return (
    <group>
      {/* Barracks */}
      <group position={[-2.4, 0, -1]}>
        <mesh position={[0, 1.7, 0]} castShadow receiveShadow>
          <boxGeometry args={[8.2, 3.4, 7.2]} />
          <meshStandardMaterial color="#7d8560" flatShading roughness={1} />
        </mesh>
        <mesh
          geometry={barracksRoof}
          position={[0, 3.4, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <meshStandardMaterial color="#4f5a3a" flatShading roughness={1} />
        </mesh>
        <Door position={[0, 1.1, 3.62]} width={1.3} height={2.2} color="#4a5233" />
        <Win
          position={[-2.6, 2, 3.62]}
          size={[0.9, 0.9]}
          frame="#5c6642"
          glass="#cbd6c4"
        />
        <Win
          position={[2.6, 2, 3.62]}
          size={[0.9, 0.9]}
          frame="#5c6642"
          glass="#cbd6c4"
        />
      </group>

      {/* Tents */}
      {[
        [4.2, 1.6],
        [4.2, -3.4],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 1.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[2.1, 2.2, 4]} />
            <meshStandardMaterial color="#69754a" flatShading roughness={1} />
          </mesh>
          <mesh position={[0, 0.55, 1.35]}>
            <boxGeometry args={[0.9, 1.1, 0.08]} />
            <meshStandardMaterial color="#3f4a2c" flatShading roughness={1} />
          </mesh>
        </group>
      ))}

      {/* Watchtower */}
      <group position={[-5.4, 0, 3.6]}>
        {[
          [-0.8, -0.8],
          [0.8, -0.8],
          [-0.8, 0.8],
          [0.8, 0.8],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 2.4, z]} castShadow>
            <boxGeometry args={[0.2, 4.8, 0.2]} />
            <meshStandardMaterial color="#6b5a3c" flatShading roughness={1} />
          </mesh>
        ))}
        <mesh position={[0, 4.9, 0]} castShadow>
          <boxGeometry args={[2.4, 0.2, 2.4]} />
          <meshStandardMaterial color="#7a6642" flatShading roughness={1} />
        </mesh>
        <mesh position={[0, 5.5, 0]} castShadow>
          <boxGeometry args={[2.2, 1, 2.2]} />
          <meshStandardMaterial
            color="#8a7a52"
            flatShading
            roughness={1}
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh position={[0, 6.3, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[2, 0.9, 4]} />
          <meshStandardMaterial color="#4f5a3a" flatShading roughness={1} />
        </mesh>
      </group>

      {/* Sandbags along the front */}
      {Array.from({ length: 7 }, (_, i) => (
        <mesh
          key={i}
          position={[-5 + i * 1.7, 0.28, D / 2 - 0.4]}
          rotation={[0, i * 0.4, 0]}
          castShadow
        >
          <capsuleGeometry args={[0.28, 0.55, 3, 6]} />
          <meshStandardMaterial color="#a3936a" flatShading roughness={1} />
        </mesh>
      ))}

      {/* Flagpole */}
      <group position={[5.2, 0, D / 2 - 1.4]}>
        <mesh position={[0, 3.6, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 7.2, 8]} />
          <meshStandardMaterial color="#c9cdd2" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 7.3, 0]}>
          <sphereGeometry args={[0.14, 8, 6]} />
          <meshStandardMaterial color="#f0c14b" metalness={0.6} roughness={0.3} />
        </mesh>
        <WavingFlag y={6.1}>
          <GreekFlag width={2.6} />
        </WavingFlag>
      </group>

      {/* Gate posts */}
      {[-2.2, 2.2].map((x) => (
        <mesh key={x} position={[x - 2.4, 1.4, D / 2 + 0.6]} castShadow>
          <boxGeometry args={[0.4, 2.8, 0.4]} />
          <meshStandardMaterial color="#5c6642" flatShading roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Town School — bell tower and a yard                                 */
/* ------------------------------------------------------------------ */

function SchoolModel() {
  const W = 12.8
  const D = 9.8
  const H = 5
  const roof = useGable(W + 0.8, 2.2, D + 0.8)

  return (
    <group>
      <mesh position={[0, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color="#e8b672" flatShading roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.5, D / 2 + 0.02]}>
        <boxGeometry args={[W, 1, 0.14]} />
        <meshStandardMaterial color="#c98f4f" flatShading roughness={1} />
      </mesh>
      <mesh
        geometry={roof}
        position={[0, H, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <meshStandardMaterial color="#a8452f" flatShading roughness={0.95} />
      </mesh>

      <Door position={[0, 1.3, D / 2 + 0.02]} width={1.8} height={2.6} color="#7d4a2c" />
      {[-4.4, -2.4, 2.4, 4.4].map((x) => (
        <Win
          key={x}
          position={[x, 2.9, D / 2 + 0.02]}
          size={[1.2, 1.6]}
          frame="#f2e2c4"
          lit={x === -2.4 || x === 4.4}
        />
      ))}
      {[-2.6, 2.6].map((z) => (
        <Win
          key={`s${z}`}
          position={[W / 2 + 0.02, 2.9, z]}
          size={[1.2, 1.6]}
          rotation={[0, Math.PI / 2, 0]}
          frame="#f2e2c4"
        />
      ))}

      {/* Bell tower */}
      <group position={[0, 0, -0.4]}>
        <mesh position={[0, H + 1.6, 0]} castShadow>
          <boxGeometry args={[2.6, 3.2, 2.6]} />
          <meshStandardMaterial color="#f2e2c4" flatShading roughness={0.95} />
        </mesh>
        <mesh position={[0, H + 1.9, 1.32]}>
          <circleGeometry args={[0.75, 20]} />
          <meshStandardMaterial color="#fdf8ec" roughness={0.6} />
        </mesh>
        <mesh position={[0, H + 1.9, 1.34]}>
          <ringGeometry args={[0.66, 0.75, 20]} />
          <meshStandardMaterial color="#7d4a2c" />
        </mesh>
        <Clock position={[0, H + 1.9, 1.36]} />
        <mesh position={[0, H + 4, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[2.2, 2, 4]} />
          <meshStandardMaterial color="#a8452f" flatShading roughness={0.95} />
        </mesh>
        <mesh position={[0, H + 5.3, 0]}>
          <sphereGeometry args={[0.22, 8, 6]} />
          <meshStandardMaterial color="#f0c14b" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* Yard: basketball hoop */}
      <group position={[6.2, 0, D / 2 + 3.4]}>
        <mesh position={[0, 1.6, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.11, 3.2, 8]} />
          <meshStandardMaterial color="#8d979d" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0, 3.3, 0.3]} castShadow>
          <boxGeometry args={[1.5, 1, 0.08]} />
          <meshStandardMaterial color="#fdf8ec" roughness={0.8} />
        </mesh>
        <mesh position={[0, 2.9, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.3, 0.05, 6, 14]} />
          <meshStandardMaterial color="#e0552f" roughness={0.6} />
        </mesh>
      </group>
    </group>
  )
}

function Clock({ position }: { position: [number, number, number] }) {
  const hour = useRef<Mesh>(null)
  const minute = useRef<Mesh>(null)
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (minute.current) minute.current.rotation.z = -t * 0.35
    if (hour.current) hour.current.rotation.z = -t * 0.03
  })
  return (
    <group position={position}>
      <mesh ref={minute}>
        <boxGeometry args={[0.06, 1.1, 0.02]} />
        <meshStandardMaterial color="#3a2a1d" />
      </mesh>
      <mesh ref={hour}>
        <boxGeometry args={[0.07, 0.7, 0.02]} />
        <meshStandardMaterial color="#3a2a1d" />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Radio Center — station, dish and lattice mast                       */
/* ------------------------------------------------------------------ */

function RadioModel() {
  const D = 7.8
  const mast = useRef<import('three').Group>(null)

  useFrame((state) => {
    if (mast.current) {
      mast.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.3
    }
  })

  return (
    <group>
      <mesh position={[0, 2.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.9, 4.1, 4.2, 12]} />
        <meshStandardMaterial color="#efe6f2" flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0, 4.4, 0]} castShadow>
        <cylinderGeometry args={[4.4, 4.4, 0.4, 12]} />
        <meshStandardMaterial color="#8e4fa8" flatShading roughness={0.8} />
      </mesh>
      <mesh position={[0, 5, 0]} castShadow>
        <cylinderGeometry args={[2.6, 3.4, 1.2, 12]} />
        <meshStandardMaterial color="#b95fd0" flatShading roughness={0.85} />
      </mesh>

      <Door position={[0, 1.2, D / 2 - 0.05]} width={1.5} height={2.4} color="#7a3f92" />
      {[-2.2, 2.2].map((x) => (
        <Win
          key={x}
          position={[x, 2.6, D / 2 - 1.1]}
          size={[1, 1]}
          frame="#c9a6d6"
          lit
        />
      ))}

      {/* Lattice mast */}
      <group position={[0, 0, -2.6]}>
        {Array.from({ length: 9 }, (_, i) => (
          <mesh key={i} position={[0, 6 + i * 1.4, 0]}>
            <boxGeometry args={[1.5 - i * 0.13, 0.1, 1.5 - i * 0.13]} />
            <meshStandardMaterial color="#c0392b" flatShading roughness={0.7} />
          </mesh>
        ))}
        {[
          [-0.62, -0.62],
          [0.62, -0.62],
          [-0.62, 0.62],
          [0.62, 0.62],
        ].map(([x, z], i) => (
          <mesh key={`l${i}`} position={[x * 0.7, 12, z * 0.7]} castShadow>
            <cylinderGeometry args={[0.06, 0.1, 13, 5]} />
            <meshStandardMaterial color="#d0d5d8" metalness={0.5} roughness={0.4} />
          </mesh>
        ))}
        <Beacon position={[0, 18.8, 0]} color="#ff4d4d" />
        <mesh position={[0, 18.2, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.6, 5]} />
          <meshStandardMaterial color="#d0d5d8" metalness={0.5} />
        </mesh>
      </group>

      {/* Satellite dish */}
      <group ref={mast} position={[2.9, 6.2, 0.8]}>
        <mesh rotation={[-0.9, 0, 0]} castShadow>
          <sphereGeometry args={[1.5, 14, 10, 0, Math.PI * 2, 0, Math.PI / 3]} />
          <meshStandardMaterial
            color="#f4f0f6"
            side={2}
            flatShading
            roughness={0.7}
          />
        </mesh>
        <mesh position={[0, 0.5, 0.5]}>
          <cylinderGeometry args={[0.07, 0.07, 1.2, 6]} />
          <meshStandardMaterial color="#8d979d" metalness={0.5} />
        </mesh>
      </group>

      {/* Signal rings */}
      <SignalRings />
    </group>
  )
}

function SignalRings() {
  const group = useRef<import('three').Group>(null)
  useFrame((state) => {
    if (!group.current) return
    group.current.children.forEach((child, i) => {
      const t = (state.clock.elapsedTime * 0.6 + i * 0.33) % 1
      child.scale.setScalar(0.3 + t * 4)
      const mesh = child as Mesh
      const mat = mesh.material as MeshBasicMaterial
      mat.opacity = (1 - t) * 0.5
    })
  })
  return (
    <group ref={group} position={[0, 19, -2.6]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.85, 1, 18]} />
          <meshBasicMaterial color="#ff8080" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* The Old Lighthouse — the locked reward on the north-west cape       */
/* ------------------------------------------------------------------ */

function LighthouseModel() {
  const beam = useRef<Group>(null)
  const bands = [0, 1, 2, 3, 4, 5]

  useFrame((state) => {
    if (beam.current) beam.current.rotation.y = state.clock.elapsedTime * 0.55
  })

  return (
    <group>
      {/* Rocky outcrop it stands on */}
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <cylinderGeometry args={[6.4, 7.6, 1.6, 12]} />
        <meshStandardMaterial color="#8d949a" flatShading roughness={1} />
      </mesh>

      {/* Tapered tower in painted bands */}
      {bands.map((i) => (
        <mesh key={i} position={[0, 1.4 + i * 2.6, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[3.5 - i * 0.34, 3.85 - i * 0.34, 2.6, 16]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#f6f1e4' : '#c0392b'}
            flatShading
            roughness={0.9}
          />
        </mesh>
      ))}

      {/* Gallery deck and railing */}
      <mesh position={[0, 17.1, 0]} castShadow>
        <cylinderGeometry args={[2.9, 2.4, 0.4, 16]} />
        <meshStandardMaterial color="#4a5057" flatShading roughness={0.8} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 2.6, 17.8, Math.sin(a) * 2.6]}
          >
            <boxGeometry args={[0.1, 1, 0.1]} />
            <meshStandardMaterial color="#4a5057" flatShading />
          </mesh>
        )
      })}
      <mesh position={[0, 18.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.6, 0.07, 6, 20]} />
        <meshStandardMaterial color="#4a5057" flatShading />
      </mesh>

      {/* Lantern room */}
      <mesh position={[0, 19.4, 0]} castShadow>
        <cylinderGeometry args={[1.7, 1.7, 2.4, 12]} />
        <meshStandardMaterial
          color="#ffe9a8"
          emissive="#ffbe4d"
          emissiveIntensity={0.9}
          transparent
          opacity={0.75}
          roughness={0.2}
        />
      </mesh>
      <group ref={beam} position={[0, 19.4, 0]}>
        <mesh position={[0, 0, 5]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[1.7, 11, 4, 1, true]} />
          <meshBasicMaterial
            color="#ffe9a8"
            transparent
            opacity={0.16}
            depthWrite={false}
            side={2}
          />
        </mesh>
      </group>
      <mesh position={[0, 21, 0]} castShadow>
        <coneGeometry args={[2.2, 1.6, 12]} />
        <meshStandardMaterial color="#2f3a44" flatShading roughness={0.8} />
      </mesh>
      <mesh position={[0, 22.2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 1, 6]} />
        <meshStandardMaterial color="#9aa5ad" metalness={0.6} />
      </mesh>

      {/* Keeper's door, facing the road */}
      <Door position={[0, 1.4, 3.75]} width={1.6} height={2.8} color="#7a4a2c" />

      {/* Keeper's cottage tucked against the base */}
      <group position={[5.4, 0, 2.6]} rotation={[0, -0.5, 0]}>
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[5, 3, 4.2]} />
          <meshStandardMaterial color="#efe4cd" flatShading roughness={0.95} />
        </mesh>
        <mesh position={[0, 3.4, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[3.7, 1.6, 4]} />
          <meshStandardMaterial color="#8d4a33" flatShading roughness={0.95} />
        </mesh>
        <Win position={[0, 1.7, 2.13]} size={[1, 1]} frame="#b08a5c" lit />
      </group>
    </group>
  )
}

export const BUILDING_MODELS: Record<BuildingKind, () => React.ReactElement> = {
  lighthouse: LighthouseModel,
  house: HouseModel,
  university: UniversityModel,
  work: WorkModel,
  army: ArmyModel,
  school: SchoolModel,
  radio: RadioModel,
}
