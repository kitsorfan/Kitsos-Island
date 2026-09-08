import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import type { InteriorProp, PropKind } from '../types'

const WOOD = '#a97c4e'
const DARK_WOOD = '#7d5a3a'
const METAL = '#8d979d'
const CLOTH = '#5b6b8a'

export function InteriorFurniture({ props }: { props: InteriorProp[] }) {
  return (
    <group>
      {props.map((prop, i) => (
        <group
          key={i}
          position={[prop.position[0], 0, prop.position[1]]}
          rotation={[0, prop.rotation ?? 0, 0]}
          scale={prop.scale ?? 1}
        >
          <Piece kind={prop.kind} color={prop.color} />
        </group>
      ))}
    </group>
  )
}

function Piece({ kind, color }: { kind: PropKind; color?: string }) {
  switch (kind) {
    case 'desk':
      return (
        <group>
          <mesh position={[0, 0.74, 0]} castShadow>
            <boxGeometry args={[3.2, 0.12, 1.5]} />
            <meshStandardMaterial color={color ?? '#c8a877'} flatShading roughness={0.9} />
          </mesh>
          {[-1.4, 1.4].map((x) => (
            <mesh key={x} position={[x, 0.36, 0]}>
              <boxGeometry args={[0.16, 0.72, 1.3]} />
              <meshStandardMaterial color={METAL} flatShading roughness={0.7} />
            </mesh>
          ))}
        </group>
      )

    case 'schoolDesk':
      return (
        <group>
          <mesh position={[0, 0.68, 0]} rotation={[-0.12, 0, 0]} castShadow>
            <boxGeometry args={[2.1, 0.1, 1.1]} />
            <meshStandardMaterial color={color ?? WOOD} flatShading roughness={0.9} />
          </mesh>
          {[-0.85, 0.85].map((x) => (
            <mesh key={x} position={[x, 0.33, 0]}>
              <boxGeometry args={[0.1, 0.66, 0.9]} />
              <meshStandardMaterial color={METAL} flatShading roughness={0.7} />
            </mesh>
          ))}
          <mesh position={[0, 0.42, 0.85]} castShadow>
            <boxGeometry args={[1.5, 0.1, 0.6]} />
            <meshStandardMaterial color={DARK_WOOD} flatShading roughness={0.9} />
          </mesh>
        </group>
      )

    case 'chair':
      return (
        <group>
          <mesh position={[0, 0.46, 0]} castShadow>
            <boxGeometry args={[0.72, 0.1, 0.72]} />
            <meshStandardMaterial color={color ?? CLOTH} flatShading roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.86, -0.32]} castShadow>
            <boxGeometry args={[0.72, 0.7, 0.1]} />
            <meshStandardMaterial color={color ?? CLOTH} flatShading roughness={0.9} />
          </mesh>
          {[
            [-0.28, -0.28],
            [0.28, -0.28],
            [-0.28, 0.28],
            [0.28, 0.28],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.22, z]}>
              <boxGeometry args={[0.08, 0.44, 0.08]} />
              <meshStandardMaterial color={METAL} flatShading />
            </mesh>
          ))}
        </group>
      )

    case 'bookshelf':
      return (
        <group>
          <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
            <boxGeometry args={[3, 2.6, 0.7]} />
            <meshStandardMaterial color={color ?? DARK_WOOD} flatShading roughness={0.95} />
          </mesh>
          {[0.5, 1.15, 1.8, 2.35].map((y, row) =>
            Array.from({ length: 9 }, (_, i) => (
              <mesh
                key={`${y}-${i}`}
                position={[-1.25 + i * 0.3, y, 0.2]}
                scale={[1, 0.6 + ((i * 7 + row * 3) % 5) * 0.14, 1]}
              >
                <boxGeometry args={[0.2, 0.6, 0.3]} />
                <meshStandardMaterial
                  color={
                    ['#c0563f', '#3f6fb5', '#5c8a3a', '#e0a33c', '#8a5fb0'][
                      (i + row) % 5
                    ]
                  }
                  flatShading
                  roughness={0.9}
                />
              </mesh>
            )),
          )}
        </group>
      )

    case 'locker':
      return (
        <group>
          <mesh position={[0, 1.1, 0]} castShadow>
            <boxGeometry args={[1.7, 2.2, 0.8]} />
            <meshStandardMaterial color={color ?? '#6d7a5a'} flatShading roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.1, 0.42]}>
            <boxGeometry args={[0.06, 2.1, 0.04]} />
            <meshStandardMaterial color="#3f4a34" />
          </mesh>
          {[-0.42, 0.42].map((x) => (
            <mesh key={x} position={[x, 1.35, 0.43]}>
              <boxGeometry args={[0.1, 0.1, 0.05]} />
              <meshStandardMaterial color={METAL} metalness={0.5} />
            </mesh>
          ))}
        </group>
      )

    case 'bunk':
      return (
        <group>
          {[0.55, 1.75].map((y) => (
            <group key={y}>
              <mesh position={[0, y, 0]} castShadow>
                <boxGeometry args={[3.6, 0.18, 1.6]} />
                <meshStandardMaterial color={METAL} flatShading roughness={0.7} />
              </mesh>
              <mesh position={[0, y + 0.2, 0]} castShadow>
                <boxGeometry args={[3.4, 0.24, 1.4]} />
                <meshStandardMaterial color="#dfd7c2" flatShading roughness={0.95} />
              </mesh>
              <mesh position={[-1.2, y + 0.34, 0]}>
                <boxGeometry args={[0.9, 0.16, 1.1]} />
                <meshStandardMaterial color="#f2ece0" flatShading />
              </mesh>
              <mesh position={[0.6, y + 0.3, 0]}>
                <boxGeometry args={[2, 0.1, 1.42]} />
                <meshStandardMaterial color="#6f7f4a" flatShading roughness={0.95} />
              </mesh>
            </group>
          ))}
          {[-1.7, 1.7].map((x) => (
            <mesh key={x} position={[x, 1.2, 0]}>
              <boxGeometry args={[0.12, 2.4, 0.12]} />
              <meshStandardMaterial color={METAL} flatShading />
            </mesh>
          ))}
        </group>
      )

    case 'monitor':
      return (
        <group position={[0, 0.8, 0]}>
          <mesh position={[0, 0.42, 0]} castShadow>
            <boxGeometry args={[1.15, 0.7, 0.08]} />
            <meshStandardMaterial color="#22313f" flatShading />
          </mesh>
          <mesh position={[0, 0.42, 0.05]}>
            <planeGeometry args={[1.02, 0.58]} />
            <meshStandardMaterial
              color="#7fe4d4"
              emissive="#2fb59a"
              emissiveIntensity={0.7}
            />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.14, 0.32, 0.12]} />
            <meshStandardMaterial color="#2f3a44" flatShading />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.5, 0.05, 0.3]} />
            <meshStandardMaterial color="#2f3a44" flatShading />
          </mesh>
        </group>
      )

    case 'serverRack':
      return <ServerRack color={color} />

    case 'rug':
      return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
          <planeGeometry args={[5.4, 3.8]} />
          <meshStandardMaterial color={color ?? '#b8474a'} roughness={1} />
        </mesh>
      )

    case 'plant':
      return (
        <group>
          <mesh position={[0, 0.32, 0]} castShadow>
            <cylinderGeometry args={[0.42, 0.32, 0.65, 8]} />
            <meshStandardMaterial color="#b5714b" flatShading roughness={1} />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2
            return (
              <mesh
                key={i}
                position={[Math.cos(a) * 0.28, 1.1, Math.sin(a) * 0.28]}
                rotation={[Math.cos(a) * 0.5, -a, Math.sin(a) * 0.5]}
                castShadow
              >
                <coneGeometry args={[0.3, 1.3, 4]} />
                <meshStandardMaterial color="#3f9a4c" flatShading roughness={1} />
              </mesh>
            )
          })}
        </group>
      )

    case 'whiteboard':
    case 'blackboard':
      return (
        <group>
          <mesh position={[0, 1.7, 0]} castShadow>
            <boxGeometry args={[kind === 'blackboard' ? 6.4 : 3.4, 2.2, 0.16]} />
            <meshStandardMaterial
              color={kind === 'blackboard' ? '#2f4136' : '#f4f6f7'}
              flatShading
              roughness={0.85}
            />
          </mesh>
          <mesh position={[0, 1.7, 0.1]}>
            <boxGeometry args={[kind === 'blackboard' ? 6.6 : 3.6, 2.4, 0.06]} />
            <meshStandardMaterial color={DARK_WOOD} flatShading roughness={0.95} />
          </mesh>
          <mesh position={[0, 1.7, 0.14]}>
            <planeGeometry args={[kind === 'blackboard' ? 6.2 : 3.2, 2]} />
            <meshStandardMaterial
              color={kind === 'blackboard' ? '#38523f' : '#fbfdfd'}
              roughness={0.9}
            />
          </mesh>
          <mesh position={[0, 0.56, 0.18]}>
            <boxGeometry args={[kind === 'blackboard' ? 6.4 : 3.4, 0.1, 0.22]} />
            <meshStandardMaterial color={WOOD} flatShading />
          </mesh>
        </group>
      )

    case 'crate':
      return (
        <group>
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[1.4, 1.2, 1.4]} />
            <meshStandardMaterial color={color ?? '#8a6a45'} flatShading roughness={1} />
          </mesh>
          <mesh position={[0, 1.22, 0]}>
            <boxGeometry args={[1.5, 0.1, 1.5]} />
            <meshStandardMaterial color={DARK_WOOD} flatShading roughness={1} />
          </mesh>
        </group>
      )

    case 'table':
      return (
        <group>
          <mesh position={[0, 0.76, 0]} castShadow>
            <boxGeometry args={[2.4, 0.14, 1.6]} />
            <meshStandardMaterial color={color ?? WOOD} flatShading roughness={0.9} />
          </mesh>
          {[
            [-1, -0.6],
            [1, -0.6],
            [-1, 0.6],
            [1, 0.6],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.37, z]}>
              <boxGeometry args={[0.14, 0.74, 0.14]} />
              <meshStandardMaterial color={DARK_WOOD} flatShading />
            </mesh>
          ))}
        </group>
      )

    case 'sofa':
      return (
        <group>
          <mesh position={[0, 0.44, 0]} castShadow>
            <boxGeometry args={[3.8, 0.5, 1.5]} />
            <meshStandardMaterial color={color ?? '#4f6f8f'} flatShading roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.95, -0.62]} castShadow>
            <boxGeometry args={[3.8, 0.9, 0.28]} />
            <meshStandardMaterial color={color ?? '#4f6f8f'} flatShading roughness={0.95} />
          </mesh>
          {[-1.85, 1.85].map((x) => (
            <mesh key={x} position={[x, 0.75, 0]} castShadow>
              <boxGeometry args={[0.3, 0.9, 1.5]} />
              <meshStandardMaterial color={color ?? '#44617e'} flatShading roughness={0.95} />
            </mesh>
          ))}
        </group>
      )

    case 'bed':
      return (
        <group>
          <mesh position={[0, 0.34, 0]} castShadow>
            <boxGeometry args={[3.8, 0.4, 2.1]} />
            <meshStandardMaterial color={DARK_WOOD} flatShading roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.66, 0]} castShadow>
            <boxGeometry args={[3.6, 0.3, 1.95]} />
            <meshStandardMaterial color="#e4dcc8" flatShading roughness={0.95} />
          </mesh>
          <mesh position={[0.6, 0.78, 0]}>
            <boxGeometry args={[2.3, 0.14, 1.95]} />
            <meshStandardMaterial color="#4f7fb0" flatShading roughness={0.95} />
          </mesh>
          <mesh position={[-1.4, 0.86, 0]}>
            <boxGeometry args={[0.9, 0.2, 1.3]} />
            <meshStandardMaterial color="#f4efe3" flatShading />
          </mesh>
          <mesh position={[-2, 0.9, 0]} castShadow>
            <boxGeometry args={[0.16, 1.2, 2.1]} />
            <meshStandardMaterial color={DARK_WOOD} flatShading />
          </mesh>
        </group>
      )

    case 'counter':
    case 'kitchen':
      return (
        <group>
          <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.7, 1, 1.4]} />
            <meshStandardMaterial color={color ?? '#e0d7c4'} flatShading roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.04, 0]}>
            <boxGeometry args={[3.9, 0.12, 1.55]} />
            <meshStandardMaterial color="#8d979d" flatShading roughness={0.6} />
          </mesh>
          {[-0.9, 0.9].map((x) => (
            <mesh key={x} position={[x, 0.62, 0.72]}>
              <boxGeometry args={[1.2, 0.06, 0.06]} />
              <meshStandardMaterial color={METAL} metalness={0.5} />
            </mesh>
          ))}
        </group>
      )

    case 'stove':
      return (
        <group>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[1.8, 1, 1.4]} />
            <meshStandardMaterial color="#cfd3d6" flatShading roughness={0.6} />
          </mesh>
          <mesh position={[0, 1.02, 0]}>
            <boxGeometry args={[1.85, 0.08, 1.45]} />
            <meshStandardMaterial color="#3a4148" flatShading />
          </mesh>
          {[
            [-0.4, -0.3],
            [0.4, -0.3],
            [-0.4, 0.35],
            [0.4, 0.35],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 1.07, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.12, 0.24, 12]} />
              <meshStandardMaterial color="#20262b" />
            </mesh>
          ))}
        </group>
      )

    case 'pillar':
      return (
        <mesh position={[0, 2.7, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.62, 0.72, 5.4, 12]} />
          <meshStandardMaterial color={color ?? '#f0e6d0'} flatShading roughness={0.9} />
        </mesh>
      )

    case 'lamp':
      return (
        <group>
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.44, 0.5, 0.12, 10]} />
            <meshStandardMaterial color="#4a4f57" flatShading />
          </mesh>
          <mesh position={[0, 0.95, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 1.8, 6]} />
            <meshStandardMaterial color="#5a6069" flatShading />
          </mesh>
          <mesh position={[0, 2, 0]} castShadow>
            <coneGeometry args={[0.62, 0.7, 10, 1, true]} />
            <meshStandardMaterial color="#f4e6c0" flatShading side={2} />
          </mesh>
          <pointLight position={[0, 1.8, 0]} intensity={7} distance={9} color="#ffe4b0" />
        </group>
      )

    case 'console':
      return <RadioConsoleProp color={color} />

    case 'weightBench':
      return (
        <group>
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[2.6, 0.24, 0.8]} />
            <meshStandardMaterial color="#2f3a44" flatShading roughness={0.8} />
          </mesh>
          {[-1, 1].map((x) => (
            <mesh key={x} position={[x, 0.28, 0]}>
              <boxGeometry args={[0.14, 0.56, 0.7]} />
              <meshStandardMaterial color={METAL} flatShading />
            </mesh>
          ))}
          <mesh position={[0, 1.25, -0.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 3.2, 8]} />
            <meshStandardMaterial color={METAL} metalness={0.6} roughness={0.4} />
          </mesh>
          {[-1.35, 1.35].map((x) => (
            <mesh key={x} position={[x, 1.25, -0.5]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.42, 0.42, 0.14, 12]} />
              <meshStandardMaterial color="#22282e" flatShading />
            </mesh>
          ))}
        </group>
      )

    case 'sandbag':
      return (
        <group>
          {[0, 1, 2].map((i) => (
            <mesh
              key={i}
              position={[(i % 2) * 0.35 - 0.18, 0.24 + i * 0.36, 0]}
              rotation={[0, i * 0.4, 0]}
              castShadow
            >
              <capsuleGeometry args={[0.28, 0.7, 3, 6]} />
              <meshStandardMaterial color="#a3936a" flatShading roughness={1} />
            </mesh>
          ))}
        </group>
      )

    case 'globe':
      return (
        <group>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.1, 0.34, 0.7, 8]} />
            <meshStandardMaterial color={DARK_WOOD} flatShading />
          </mesh>
          <Spinner>
            <mesh position={[0, 1.1, 0]} castShadow>
              <icosahedronGeometry args={[0.55, 1]} />
              <meshStandardMaterial color="#3f8ac0" flatShading roughness={0.8} />
            </mesh>
          </Spinner>
        </group>
      )

    case 'painting':
      return (
        <group position={[0, 2.2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[2.6, 1.8, 0.14]} />
            <meshStandardMaterial color={DARK_WOOD} flatShading />
          </mesh>
          <mesh position={[0, 0, 0.09]}>
            <planeGeometry args={[2.3, 1.5]} />
            <meshStandardMaterial color={color ?? '#8fc4e0'} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.35, 0.1]}>
            <planeGeometry args={[2.3, 0.8]} />
            <meshStandardMaterial color="#6faa55" roughness={0.9} />
          </mesh>
        </group>
      )

    case 'stairs':
      return (
        <group>
          {Array.from({ length: 7 }, (_, i) => (
            <mesh key={i} position={[0, 0.22 + i * 0.44, -i * 0.5]} castShadow>
              <boxGeometry args={[2.4, 0.44, 0.5]} />
              <meshStandardMaterial color={color ?? '#c3b393'} flatShading roughness={0.95} />
            </mesh>
          ))}
          <mesh position={[1.25, 1.9, -1.5]} castShadow>
            <boxGeometry args={[0.1, 0.1, 4]} />
            <meshStandardMaterial color={METAL} metalness={0.5} />
          </mesh>
        </group>
      )

    case 'chessTable':
      return (
        <group>
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.24, 0.8, 8]} />
            <meshStandardMaterial color={DARK_WOOD} flatShading />
          </mesh>
          <mesh position={[0, 0.84, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.5, 0.1, 1.5]} />
            <meshStandardMaterial color="#f0e6d2" flatShading roughness={0.9} />
          </mesh>
          {Array.from({ length: 16 }, (_, i) => {
            const cx = (i % 4) - 1.5
            const cz = Math.floor(i / 4) - 1.5
            if ((cx + cz) % 2 !== 0) return null
            return (
              <mesh key={i} position={[cx * 0.35, 0.9, cz * 0.35]}>
                <boxGeometry args={[0.35, 0.02, 0.35]} />
                <meshStandardMaterial color="#4c3b2a" roughness={0.9} />
              </mesh>
            )
          })}
          {[
            [-0.5, -0.5, '#f7f2e6'],
            [0.16, -0.16, '#2f2721'],
            [0.5, 0.35, '#f7f2e6'],
          ].map(([x, z, c], i) => (
            <mesh key={i} position={[x as number, 1.05, z as number]} castShadow>
              <cylinderGeometry args={[0.08, 0.12, 0.3, 8]} />
              <meshStandardMaterial color={c as string} flatShading />
            </mesh>
          ))}
        </group>
      )

    case 'greekFlag':
      return <GreekFlagStand />

    case 'lectern':
      return (
        <group>
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[1.4, 1.2, 0.9]} />
            <meshStandardMaterial color={color ?? DARK_WOOD} flatShading roughness={0.95} />
          </mesh>
          <mesh position={[0, 1.28, -0.1]} rotation={[-0.35, 0, 0]} castShadow>
            <boxGeometry args={[1.5, 0.1, 0.9]} />
            <meshStandardMaterial color={WOOD} flatShading roughness={0.9} />
          </mesh>
        </group>
      )

    default:
      return null
  }
}

function Spinner({ children }: { children: React.ReactNode }) {
  const group = useRef<Group>(null)
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.35
  })
  return <group ref={group}>{children}</group>
}

function ServerRack({ color }: { color?: string }) {
  const lights = useRef<Group>(null)
  useFrame((state) => {
    if (!lights.current) return
    const t = state.clock.elapsedTime
    lights.current.children.forEach((child, i) => {
      child.visible = Math.sin(t * (2 + (i % 4)) + i) > -0.2
    })
  })
  return (
    <group>
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 3, 1.3]} />
        <meshStandardMaterial color={color ?? '#2b333b'} flatShading roughness={0.7} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[0, 0.4 + i * 0.32, 0.67]}>
          <boxGeometry args={[1.9, 0.22, 0.06]} />
          <meshStandardMaterial color="#3d4750" flatShading />
        </mesh>
      ))}
      <group ref={lights}>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} position={[0.72, 0.4 + i * 0.32, 0.72]}>
            <boxGeometry args={[0.1, 0.08, 0.03]} />
            <meshBasicMaterial color={i % 3 === 0 ? '#ffcf5a' : '#5fe8b8'} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function RadioConsoleProp({ color }: { color?: string }) {
  const dials = useRef<Group>(null)
  useFrame((state) => {
    if (dials.current) {
      dials.current.children.forEach((child, i) => {
        child.rotation.z = Math.sin(state.clock.elapsedTime * (0.6 + i * 0.3)) * 0.9
      })
    }
  })
  return (
    <group>
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 1.1, 1.8]} />
        <meshStandardMaterial color={color ?? '#4a3f57'} flatShading roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.28, -0.25]} rotation={[-0.5, 0, 0]} castShadow>
        <boxGeometry args={[3.6, 0.9, 0.16]} />
        <meshStandardMaterial color="#2f2a38" flatShading roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.36, -0.06]} rotation={[-0.5, 0, 0]}>
        <planeGeometry args={[1.6, 0.5]} />
        <meshStandardMaterial
          color="#8ef0d8"
          emissive="#2fb59a"
          emissiveIntensity={0.8}
        />
      </mesh>
      <group ref={dials} position={[1.2, 1.42, 0.02]} rotation={[-0.5, 0, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[i * 0.42, 0, 0]}>
            <boxGeometry args={[0.05, 0.28, 0.05]} />
            <meshStandardMaterial color="#f0c14b" flatShading />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/** Blue-and-white with the cross in the canton, on a stand. */
export function GreekFlagStand() {
  const cloth = useRef<Group>(null)
  useFrame((state) => {
    if (cloth.current) {
      cloth.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.6) * 0.12
    }
  })
  return (
    <group>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.16, 10]} />
        <meshStandardMaterial color="#4a4f57" flatShading />
      </mesh>
      <mesh position={[0, 1.7, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 3.4, 8]} />
        <meshStandardMaterial color="#c9cdd2" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 3.45, 0]}>
        <sphereGeometry args={[0.12, 8, 6]} />
        <meshStandardMaterial color="#f0c14b" metalness={0.6} roughness={0.3} />
      </mesh>
      <group ref={cloth} position={[0, 2.6, 0]}>
        <GreekFlag width={1.9} />
      </group>
    </group>
  )
}

/**
 * Nine stripes, blue and white, with a white cross on the blue canton.
 * Anchored at its left edge so it hangs off a pole at x = 0.
 */
export function GreekFlag({ width = 1.9 }: { width?: number }) {
  const height = (width * 2) / 3
  const stripe = height / 9
  const cantonW = (width * 5) / 9
  const cantonH = stripe * 5
  const arm = stripe

  const rowY = (row: number) => height / 2 - stripe * (row - 0.5)
  const restW = width - cantonW

  return (
    <group position={[width / 2, 0, 0]}>
      {/* Blue field */}
      <mesh castShadow>
        <boxGeometry args={[width, height, 0.05]} />
        <meshStandardMaterial color="#0d5eaf" flatShading roughness={0.85} />
      </mesh>
      {/* White stripes beside the canton */}
      {[2, 4].map((row) => (
        <mesh key={row} position={[-width / 2 + cantonW + restW / 2, rowY(row), 0.03]}>
          <boxGeometry args={[restW, stripe, 0.02]} />
          <meshStandardMaterial color="#ffffff" roughness={0.85} />
        </mesh>
      ))}
      {/* Full-width white stripes below the canton */}
      {[6, 8].map((row) => (
        <mesh key={row} position={[0, rowY(row), 0.03]}>
          <boxGeometry args={[width, stripe, 0.02]} />
          <meshStandardMaterial color="#ffffff" roughness={0.85} />
        </mesh>
      ))}
      {/* Cross in the canton */}
      <mesh position={[-width / 2 + cantonW / 2, height / 2 - cantonH / 2, 0.04]}>
        <boxGeometry args={[arm, cantonH, 0.02]} />
        <meshStandardMaterial color="#ffffff" roughness={0.85} />
      </mesh>
      <mesh position={[-width / 2 + cantonW / 2, height / 2 - cantonH / 2, 0.04]}>
        <boxGeometry args={[cantonW, arm, 0.02]} />
        <meshStandardMaterial color="#ffffff" roughness={0.85} />
      </mesh>
    </group>
  )
}
