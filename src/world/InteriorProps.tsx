import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, PointLight } from 'three'
import type { InteriorProp, PropKind } from '../types'
import { FEAST } from '../game/feast'

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
            <meshStandardMaterial
              color={color ?? '#c8a877'}
              flatShading
              roughness={0.9}
            />
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
            <meshStandardMaterial
              color={color ?? WOOD}
              flatShading
              roughness={0.9}
            />
          </mesh>
          {[-0.85, 0.85].map((x) => (
            <mesh key={x} position={[x, 0.33, 0]}>
              <boxGeometry args={[0.1, 0.66, 0.9]} />
              <meshStandardMaterial color={METAL} flatShading roughness={0.7} />
            </mesh>
          ))}
          <mesh position={[0, 0.42, 0.85]} castShadow>
            <boxGeometry args={[1.5, 0.1, 0.6]} />
            <meshStandardMaterial
              color={DARK_WOOD}
              flatShading
              roughness={0.9}
            />
          </mesh>
        </group>
      )

    case 'chair':
      return (
        <group>
          <mesh position={[0, 0.46, 0]} castShadow>
            <boxGeometry args={[0.72, 0.1, 0.72]} />
            <meshStandardMaterial
              color={color ?? CLOTH}
              flatShading
              roughness={0.9}
            />
          </mesh>
          <mesh position={[0, 0.86, -0.32]} castShadow>
            <boxGeometry args={[0.72, 0.7, 0.1]} />
            <meshStandardMaterial
              color={color ?? CLOTH}
              flatShading
              roughness={0.9}
            />
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
            <meshStandardMaterial
              color={color ?? DARK_WOOD}
              flatShading
              roughness={0.95}
            />
          </mesh>
          {[0.5, 1.15, 1.8, 2.35].map((y, row) =>
            Array.from({ length: 9 }, (_, i) => (
              <mesh
                key={`${y}-${i}`}
                position={[-1.25 + i * 0.3, y, 0.26]}
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
            <meshStandardMaterial
              color={color ?? '#6d7a5a'}
              flatShading
              roughness={0.8}
            />
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
                <meshStandardMaterial
                  color={METAL}
                  flatShading
                  roughness={0.7}
                />
              </mesh>
              <mesh position={[0, y + 0.2, 0]} castShadow>
                <boxGeometry args={[3.4, 0.24, 1.4]} />
                <meshStandardMaterial
                  color="#dfd7c2"
                  flatShading
                  roughness={0.95}
                />
              </mesh>
              <mesh position={[-1.2, y + 0.34, 0]}>
                <boxGeometry args={[0.9, 0.16, 1.1]} />
                <meshStandardMaterial color="#f2ece0" flatShading />
              </mesh>
              <mesh position={[0.6, y + 0.3, 0]}>
                <boxGeometry args={[2, 0.1, 1.42]} />
                <meshStandardMaterial
                  color="#6f7f4a"
                  flatShading
                  roughness={0.95}
                />
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
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.02, 0]}
          receiveShadow
        >
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
                <meshStandardMaterial
                  color="#3f9a4c"
                  flatShading
                  roughness={1}
                />
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
            <boxGeometry
              args={[kind === 'blackboard' ? 6.4 : 3.4, 2.2, 0.16]}
            />
            <meshStandardMaterial
              color={kind === 'blackboard' ? '#2f4136' : '#f4f6f7'}
              flatShading
              roughness={0.85}
            />
          </mesh>
          <mesh position={[0, 1.7, 0.1]}>
            <boxGeometry
              args={[kind === 'blackboard' ? 6.6 : 3.6, 2.4, 0.06]}
            />
            <meshStandardMaterial
              color={DARK_WOOD}
              flatShading
              roughness={0.95}
            />
          </mesh>
          <mesh position={[0, 1.7, 0.14]}>
            <planeGeometry args={[kind === 'blackboard' ? 6.2 : 3.2, 2]} />
            <meshStandardMaterial
              color={kind === 'blackboard' ? '#38523f' : '#fbfdfd'}
              roughness={0.9}
            />
          </mesh>
          <mesh position={[0, 0.56, 0.18]}>
            <boxGeometry
              args={[kind === 'blackboard' ? 6.4 : 3.4, 0.1, 0.22]}
            />
            <meshStandardMaterial color={WOOD} flatShading />
          </mesh>
        </group>
      )

    case 'crate':
      return (
        <group>
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[1.4, 1.2, 1.4]} />
            <meshStandardMaterial
              color={color ?? '#8a6a45'}
              flatShading
              roughness={1}
            />
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
            <meshStandardMaterial
              color={color ?? WOOD}
              flatShading
              roughness={0.9}
            />
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
            <meshStandardMaterial
              color={color ?? '#4f6f8f'}
              flatShading
              roughness={0.95}
            />
          </mesh>
          <mesh position={[0, 0.95, -0.62]} castShadow>
            <boxGeometry args={[3.8, 0.9, 0.28]} />
            <meshStandardMaterial
              color={color ?? '#4f6f8f'}
              flatShading
              roughness={0.95}
            />
          </mesh>
          {[-1.85, 1.85].map((x) => (
            <mesh key={x} position={[x, 0.75, 0]} castShadow>
              <boxGeometry args={[0.3, 0.9, 1.5]} />
              <meshStandardMaterial
                color={color ?? '#44617e'}
                flatShading
                roughness={0.95}
              />
            </mesh>
          ))}
        </group>
      )

    case 'bed':
      return (
        <group>
          <mesh position={[0, 0.34, 0]} castShadow>
            <boxGeometry args={[3.8, 0.4, 2.1]} />
            <meshStandardMaterial
              color={DARK_WOOD}
              flatShading
              roughness={0.95}
            />
          </mesh>
          <mesh position={[0, 0.66, 0]} castShadow>
            <boxGeometry args={[3.6, 0.3, 1.95]} />
            <meshStandardMaterial
              color="#e4dcc8"
              flatShading
              roughness={0.95}
            />
          </mesh>
          <mesh position={[0.6, 0.78, 0]}>
            <boxGeometry args={[2.3, 0.14, 1.95]} />
            <meshStandardMaterial
              color="#4f7fb0"
              flatShading
              roughness={0.95}
            />
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
            <meshStandardMaterial
              color={color ?? '#e0d7c4'}
              flatShading
              roughness={0.9}
            />
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
            <mesh
              key={i}
              position={[x, 1.07, z]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
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
          <meshStandardMaterial
            color={color ?? '#f0e6d0'}
            flatShading
            roughness={0.9}
          />
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
          <pointLight
            position={[0, 1.8, 0]}
            intensity={7}
            distance={9}
            color="#ffe4b0"
          />
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
          <mesh
            position={[0, 1.25, -0.5]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.07, 0.07, 3.2, 8]} />
            <meshStandardMaterial
              color={METAL}
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>
          {[-1.35, 1.35].map((x) => (
            <mesh
              key={x}
              position={[x, 1.25, -0.5]}
              rotation={[0, 0, Math.PI / 2]}
            >
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
              <meshStandardMaterial
                color="#3f8ac0"
                flatShading
                roughness={0.8}
              />
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
              <meshStandardMaterial
                color={color ?? '#c3b393'}
                flatShading
                roughness={0.95}
              />
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
            <mesh
              key={i}
              position={[x as number, 1.05, z as number]}
              castShadow
            >
              <cylinderGeometry args={[0.08, 0.12, 0.3, 8]} />
              <meshStandardMaterial color={c as string} flatShading />
            </mesh>
          ))}
        </group>
      )

    /* ----------------------------- downstairs ---------------------------- */

    case 'car':
      return <Car color={color} />

    case 'bicycle':
      return <Bicycle color={color} />

    case 'workbench':
      return (
        <group>
          <mesh position={[0, 0.86, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.8, 0.16, 1.5]} />
            <meshStandardMaterial
              color={color ?? '#9c7346'}
              flatShading
              roughness={0.95}
            />
          </mesh>
          {[-1.7, 1.7].map((x) => (
            <mesh key={x} position={[x, 0.42, 0]}>
              <boxGeometry args={[0.22, 0.84, 1.3]} />
              <meshStandardMaterial color={DARK_WOOD} flatShading />
            </mesh>
          ))}
          {/* A shelf of jars under it, and the vice bolted to the near corner. */}
          <mesh position={[0, 0.34, -0.2]}>
            <boxGeometry args={[3.2, 0.1, 0.9]} />
            <meshStandardMaterial color={DARK_WOOD} flatShading />
          </mesh>
          {[-1.1, -0.7, -0.3].map((x) => (
            <mesh key={x} position={[x, 0.52, -0.2]} castShadow>
              <cylinderGeometry args={[0.14, 0.14, 0.26, 8]} />
              <meshStandardMaterial
                color="#c8b78d"
                transparent
                opacity={0.75}
                roughness={0.3}
              />
            </mesh>
          ))}
          <group position={[1.45, 1.04, 0.45]}>
            <mesh castShadow>
              <boxGeometry args={[0.5, 0.22, 0.3]} />
              <meshStandardMaterial
                color="#4f6b7a"
                flatShading
                metalness={0.4}
              />
            </mesh>
            <mesh position={[0, 0.16, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.34, 6]} />
              <meshStandardMaterial color={METAL} metalness={0.6} />
            </mesh>
          </group>
        </group>
      )

    case 'pegboard':
      return <Pegboard color={color} />

    case 'toolChest':
      return (
        <group>
          <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.6, 1.1, 1.1]} />
            <meshStandardMaterial
              color={color ?? '#b0402f'}
              flatShading
              roughness={0.6}
              metalness={0.2}
            />
          </mesh>
          {[0.24, 0.58, 0.92].map((y) => (
            <mesh key={y} position={[0, y, 0.57]}>
              <boxGeometry args={[1.4, 0.24, 0.06]} />
              <meshStandardMaterial color="#8c3124" flatShading />
            </mesh>
          ))}
          {[0.24, 0.58, 0.92].map((y) => (
            <mesh key={`h${y}`} position={[0, y, 0.62]}>
              <boxGeometry args={[0.6, 0.06, 0.06]} />
              <meshStandardMaterial color={METAL} metalness={0.6} />
            </mesh>
          ))}
          <mesh position={[0, 1.14, 0]}>
            <boxGeometry args={[1.66, 0.08, 1.16]} />
            <meshStandardMaterial color="#3d444c" flatShading />
          </mesh>
        </group>
      )

    case 'shelfUnit':
      return (
        <group>
          {[-1.5, 1.5].map((x) =>
            [-0.42, 0.42].map((z) => (
              <mesh key={`${x}${z}`} position={[x, 1.1, z]}>
                <boxGeometry args={[0.1, 2.2, 0.1]} />
                <meshStandardMaterial
                  color={METAL}
                  flatShading
                  metalness={0.4}
                />
              </mesh>
            )),
          )}
          {[0.3, 0.95, 1.6, 2.15].map((y) => (
            <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
              <boxGeometry args={[3.1, 0.08, 0.95]} />
              <meshStandardMaterial
                color={color ?? '#9aa1a6'}
                flatShading
                roughness={0.8}
              />
            </mesh>
          ))}
          {/* Boxes of things nobody has needed for a decade. */}
          {[
            [-1, 0.36, '#b98b57'],
            [0.3, 1.01, '#8d7c96'],
            [1.05, 0.36, '#7d9c86'],
          ].map(([x, y, c], i) => (
            <mesh
              key={i}
              position={[x as number, (y as number) + 0.26, 0]}
              castShadow
            >
              <boxGeometry args={[0.8, 0.48, 0.7]} />
              <meshStandardMaterial
                color={c as string}
                flatShading
                roughness={1}
              />
            </mesh>
          ))}
        </group>
      )

    case 'boiler':
      return (
        <group>
          <mesh position={[0, 1.15, 0]} castShadow>
            <cylinderGeometry args={[0.62, 0.62, 2.3, 12]} />
            <meshStandardMaterial
              color={color ?? '#c2c8cc'}
              flatShading
              roughness={0.5}
              metalness={0.3}
            />
          </mesh>
          <mesh position={[0, 2.34, 0]}>
            <cylinderGeometry args={[0.66, 0.66, 0.14, 12]} />
            <meshStandardMaterial color="#7b848a" flatShading />
          </mesh>
          {/* Pipework off the top, into the joists. */}
          {[-0.34, 0.34].map((x) => (
            <mesh key={x} position={[x, 2.9, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 1.2, 8]} />
              <meshStandardMaterial
                color="#a8763f"
                metalness={0.6}
                roughness={0.4}
              />
            </mesh>
          ))}
          <mesh position={[0, 1.5, 0.63]}>
            <boxGeometry args={[0.5, 0.34, 0.1]} />
            <meshStandardMaterial
              color="#2b3a44"
              emissive="#3fd8a0"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      )

    case 'longTable':
      return (
        <group>
          <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
            <boxGeometry args={[8.4, 0.14, 2.3]} />
            <meshStandardMaterial
              color={color ?? '#a97c4e'}
              flatShading
              roughness={0.9}
            />
          </mesh>
          <mesh position={[0, 0.68, 0]}>
            <boxGeometry args={[8.1, 0.08, 2.1]} />
            <meshStandardMaterial color="#e8dcc2" roughness={1} />
          </mesh>
          {[-3.8, 3.8].map((x) =>
            [-0.9, 0.9].map((z) => (
              <mesh key={`${x}${z}`} position={[x, 0.36, z]}>
                <boxGeometry args={[0.18, 0.72, 0.18]} />
                <meshStandardMaterial color={DARK_WOOD} flatShading />
              </mesh>
            )),
          )}
          {/* Laid for everybody, which is the whole point of it. */}
          {[-3.2, -1.6, 0, 1.6, 3.2].map((x) =>
            [-0.7, 0.7].map((z) => (
              <mesh key={`p${x}${z}`} position={[x, 0.87, z]}>
                <cylinderGeometry args={[0.3, 0.28, 0.05, 12]} />
                <meshStandardMaterial color="#fdf7e9" roughness={0.85} />
              </mesh>
            )),
          )}
          <mesh position={[0, 0.98, 0]} castShadow>
            <cylinderGeometry args={[0.34, 0.42, 0.36, 10]} />
            <meshStandardMaterial color="#c2566b" flatShading roughness={0.8} />
          </mesh>
        </group>
      )

    case 'photoWall':
      return <PhotoWall />

    case 'toyBox':
      return <ToyBox color={color} />

    case 'toyShelf':
      return <ToyShelf color={color} />

    case 'fireplace':
      return <Fireplace />

    case 'christmasTree':
      return <ChristmasTree />

    case 'wreath':
      return <Wreath />

    case 'garland':
      return <Garland />

    case 'feastTable':
      return <FeastTable />

    case 'armchair':
      return (
        <group>
          <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.3, 0.44, 1.3]} />
            <meshStandardMaterial
              color={color ?? '#7d5f4a'}
              flatShading
              roughness={0.95}
            />
          </mesh>
          <mesh position={[0, 0.9, -0.52]} castShadow>
            <boxGeometry args={[1.3, 1.1, 0.26]} />
            <meshStandardMaterial
              color={color ?? '#7d5f4a'}
              flatShading
              roughness={0.95}
            />
          </mesh>
          {[-0.58, 0.58].map((x) => (
            <mesh key={x} position={[x, 0.74, 0.05]} castShadow>
              <boxGeometry args={[0.24, 0.42, 1.2]} />
              <meshStandardMaterial
                color={color ?? '#7d5f4a'}
                flatShading
                roughness={0.95}
              />
            </mesh>
          ))}
          <mesh position={[0, 0.68, 0.06]}>
            <boxGeometry args={[1, 0.2, 1]} />
            <meshStandardMaterial color="#a8836a" flatShading roughness={1} />
          </mesh>
          {[
            [-0.36, -0.36],
            [0.36, -0.36],
            [-0.36, 0.36],
            [0.36, 0.36],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.1, z]}>
              <boxGeometry args={[0.12, 0.2, 0.12]} />
              <meshStandardMaterial color={DARK_WOOD} flatShading />
            </mesh>
          ))}
        </group>
      )

    case 'tv':
      return <Television color={color} />

    case 'beanbag':
      return (
        <group>
          <mesh position={[0, 0.34, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.78, 12, 8]} />
            <meshStandardMaterial
              color={color ?? '#3f4a86'}
              flatShading
              roughness={1}
            />
          </mesh>
          <mesh position={[0, 0.12, 0]} scale={[1, 0.32, 1]}>
            <sphereGeometry args={[0.86, 12, 8]} />
            <meshStandardMaterial
              color={color ?? '#354073'}
              flatShading
              roughness={1}
            />
          </mesh>
        </group>
      )

    case 'poster':
      return (
        <group>
          <mesh position={[0, 2.2, 0]}>
            <boxGeometry args={[2.2, 3, 0.06]} />
            <meshStandardMaterial color={color ?? '#1b2340'} roughness={0.9} />
          </mesh>
          {/* A shape and a title bar, so it reads as a poster and not a slab. */}
          <mesh position={[0, 2.7, 0.04]}>
            <circleGeometry args={[0.52, 20]} />
            <meshStandardMaterial
              color="#ffe9a8"
              emissive="#ffcf5c"
              emissiveIntensity={0.35}
              roughness={0.7}
            />
          </mesh>
          <mesh position={[0, 1.1, 0.04]}>
            <planeGeometry args={[1.7, 0.34]} />
            <meshStandardMaterial color="#f4f0e4" roughness={0.9} />
          </mesh>
        </group>
      )

    /**
     * The roller shutter. The slats stand a clear centimetre and a half off
     * the panel behind them: any closer and the two faces land on the same
     * depth values, and the whole door flickers in bands as the camera
     * moves. The same goes for the panel and the wall it hangs on, which is
     * why the prop is placed a little inside the room rather than flush.
     */
    case 'shutter':
      return (
        <group>
          <mesh position={[0, 1.7, 0]}>
            <boxGeometry args={[5.2, 3.4, 0.18]} />
            <meshStandardMaterial color="#5a6068" flatShading roughness={0.7} />
          </mesh>
          {Array.from({ length: 9 }, (_, i) => (
            <mesh key={i} position={[0, 0.26 + i * 0.38, 0.145]}>
              <boxGeometry args={[5, 0.3, 0.09]} />
              <meshStandardMaterial
                color={i % 2 ? '#7b828b' : '#6b727a'}
                flatShading
                roughness={0.65}
                metalness={0.25}
              />
            </mesh>
          ))}
          <mesh position={[0, 3.56, 0.02]}>
            <boxGeometry args={[5.5, 0.34, 0.44]} />
            <meshStandardMaterial color="#464c53" flatShading />
          </mesh>
        </group>
      )

    case 'greekFlag':
      return <GreekFlagStand />

    case 'lectern':
      return (
        <group>
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[1.4, 1.2, 0.9]} />
            <meshStandardMaterial
              color={color ?? DARK_WOOD}
              flatShading
              roughness={0.95}
            />
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
        <meshStandardMaterial
          color={color ?? '#2b333b'}
          flatShading
          roughness={0.7}
        />
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
        child.rotation.z =
          Math.sin(state.clock.elapsedTime * (0.6 + i * 0.3)) * 0.9
      })
    }
  })
  return (
    <group>
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 1.1, 1.8]} />
        <meshStandardMaterial
          color={color ?? '#4a3f57'}
          flatShading
          roughness={0.85}
        />
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
 *
 * The white is laid on both faces of the blue field: a flag on a pole gets
 * looked at from behind as often as from in front, and one plain blue side
 * was the half of it nobody had noticed.
 */
export function GreekFlag({ width = 1.9 }: { width?: number }) {
  const height = (width * 2) / 3
  const stripe = height / 9
  const cantonW = (width * 5) / 9
  const cantonH = stripe * 5
  const arm = stripe

  const rowY = (row: number) => height / 2 - stripe * (row - 0.5)
  const restW = width - cantonW
  const cantonX = -width / 2 + cantonW / 2
  const cantonY = height / 2 - cantonH / 2

  return (
    <group position={[width / 2, 0, 0]}>
      {/* Blue field */}
      <mesh castShadow>
        <boxGeometry args={[width, height, 0.05]} />
        <meshStandardMaterial color="#0d5eaf" flatShading roughness={0.85} />
      </mesh>
      {[1, -1].map((face) => (
        <group key={face}>
          {/* White stripes beside the canton */}
          {[2, 4].map((row) => (
            <mesh
              key={row}
              position={[
                -width / 2 + cantonW + restW / 2,
                rowY(row),
                face * 0.03,
              ]}
            >
              <boxGeometry args={[restW, stripe, 0.02]} />
              <meshStandardMaterial color="#ffffff" roughness={0.85} />
            </mesh>
          ))}
          {/* Full-width white stripes below the canton */}
          {[6, 8].map((row) => (
            <mesh key={row} position={[0, rowY(row), face * 0.03]}>
              <boxGeometry args={[width, stripe, 0.02]} />
              <meshStandardMaterial color="#ffffff" roughness={0.85} />
            </mesh>
          ))}
          {/* Cross in the canton */}
          <mesh position={[cantonX, cantonY, face * 0.04]}>
            <boxGeometry args={[arm, cantonH, 0.02]} />
            <meshStandardMaterial color="#ffffff" roughness={0.85} />
          </mesh>
          <mesh position={[cantonX, cantonY, face * 0.04]}>
            <boxGeometry args={[cantonW, arm, 0.02]} />
            <meshStandardMaterial color="#ffffff" roughness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ------------------------------ downstairs ----------------------------- */

/** His car, nose in. Low-poly, but unmistakably a hatchback. */
function Car({ color }: { color?: string }) {
  const body = color ?? '#3f6fa8'
  return (
    <group>
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.3, 0.72, 1.85]} />
        <meshStandardMaterial
          color={body}
          flatShading
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>
      {/* Cabin, set back and narrower than the body. */}
      <mesh position={[-0.24, 1.36, 0]} castShadow>
        <boxGeometry args={[2.5, 0.62, 1.7]} />
        <meshStandardMaterial
          color={body}
          flatShading
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>
      <mesh position={[-0.24, 1.36, 0]}>
        <boxGeometry args={[2.42, 0.44, 1.76]} />
        <meshStandardMaterial
          color="#1e2a33"
          roughness={0.25}
          metalness={0.35}
        />
      </mesh>
      {/* Bonnet slope and the sill down each side. */}
      <mesh position={[1.5, 1.02, 0]} rotation={[0, 0, -0.22]} castShadow>
        <boxGeometry args={[1.5, 0.18, 1.78]} />
        <meshStandardMaterial color={body} flatShading roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[4.34, 0.18, 1.92]} />
        <meshStandardMaterial color="#2b2f36" flatShading roughness={0.9} />
      </mesh>
      {/* Lamps, both ends. */}
      {[
        [2.14, '#ffeec2', 0.9],
        [-2.14, '#c9403a', 0.5],
      ].map(([x, c, glow], i) =>
        [-0.62, 0.62].map((z) => (
          <mesh key={`${i}${z}`} position={[x as number, 0.86, z]}>
            <boxGeometry args={[0.1, 0.26, 0.44]} />
            <meshStandardMaterial
              color={c as string}
              emissive={c as string}
              emissiveIntensity={glow as number}
              toneMapped={false}
            />
          </mesh>
        )),
      )}
      {[
        [1.45, 0.95],
        [1.45, -0.95],
        [-1.45, 0.95],
        [-1.45, -0.95],
      ].map(([x, z], i) => (
        <mesh
          key={i}
          position={[x, 0.42, z]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.42, 0.42, 0.3, 12]} />
          <meshStandardMaterial color="#1b1d22" flatShading roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * The bicycle, stood against whatever is behind it.
 *
 * It is drawn in side view: the wheels are rings in the XY plane and every
 * tube of the frame is a bar between two of the four points a diamond frame
 * is hung from, so the triangles close the way they do on a real one. The
 * whole thing then leans back a few degrees, the way a bicycle does when it
 * is propped up rather than ridden.
 */
function Bicycle({ color }: { color?: string }) {
  const frame = color ?? '#2fb59a'
  const R = 0.58
  /** Hub height, which is the wheel's radius off the floor. */
  const rear: [number, number] = [-0.68, R]
  const front: [number, number] = [0.68, R]
  /** Bottom bracket, saddle top, and the head tube's two ends. */
  const crank: [number, number] = [-0.08, 0.34]
  const seat: [number, number] = [-0.34, 1.06]
  const headLow: [number, number] = [0.52, 0.72]
  const headTop: [number, number] = [0.38, 1.08]

  /** A tube between two points, as a box rotated onto the line. */
  const tube = (
    a: [number, number],
    b: [number, number],
    thickness = 0.07,
    tone = frame,
  ) => {
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    return (
      <mesh
        position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0]}
        rotation={[0, 0, Math.atan2(dy, dx)]}
        castShadow
      >
        <boxGeometry args={[Math.hypot(dx, dy), thickness, thickness]} />
        <meshStandardMaterial color={tone} flatShading roughness={0.5} />
      </mesh>
    )
  }

  return (
    <group rotation={[0, 0, 0.05]}>
      {[rear, front].map(([x, y]) => (
        <group key={x} position={[x, y, 0]}>
          <mesh castShadow>
            <torusGeometry args={[R, 0.05, 6, 20]} />
            <meshStandardMaterial color="#23262c" flatShading roughness={0.9} />
          </mesh>
          {/* Spokes, as three bars across the hub. */}
          {[0, Math.PI / 3, (2 * Math.PI) / 3].map((a) => (
            <mesh key={a} rotation={[0, 0, a]}>
              <boxGeometry args={[R * 2 - 0.04, 0.02, 0.02]} />
              <meshStandardMaterial color={METAL} metalness={0.55} />
            </mesh>
          ))}
          <mesh>
            <sphereGeometry args={[0.07, 8, 6]} />
            <meshStandardMaterial color={METAL} metalness={0.6} />
          </mesh>
        </group>
      ))}

      {/* The main triangle: seat tube, down tube, top tube. */}
      {tube(crank, seat)}
      {tube(crank, headLow)}
      {tube(seat, headTop)}
      {/* Chainstay and seatstay back to the rear hub. */}
      {tube(crank, rear, 0.05)}
      {tube(seat, rear, 0.05)}
      {/* Head tube, and the fork down to the front hub. */}
      {tube(headLow, headTop, 0.08)}
      {tube(headLow, front, 0.05, '#1b1d22')}

      {/* Saddle, handlebars and the crank arm. */}
      <mesh position={[seat[0] - 0.04, seat[1] + 0.09, 0]} castShadow>
        <boxGeometry args={[0.36, 0.09, 0.14]} />
        <meshStandardMaterial color="#1b1d22" flatShading roughness={0.95} />
      </mesh>
      <mesh position={[headTop[0], headTop[1] + 0.06, 0]} castShadow>
        <boxGeometry args={[0.07, 0.07, 0.56]} />
        <meshStandardMaterial color="#1b1d22" flatShading />
      </mesh>
      <mesh position={[crank[0], crank[1], 0]} rotation={[0, 0, 0.6]}>
        <boxGeometry args={[0.34, 0.05, 0.05]} />
        <meshStandardMaterial color={METAL} metalness={0.6} />
      </mesh>
    </group>
  )
}

/** The tool wall. Everything goes back on it, which took years to be true. */
function Pegboard({ color }: { color?: string }) {
  return (
    <group>
      <mesh position={[0, 2.2, 0]}>
        <boxGeometry args={[3.6, 2, 0.08]} />
        <meshStandardMaterial
          color={color ?? '#c9a06a'}
          flatShading
          roughness={0.95}
        />
      </mesh>
      {/* Spanners and screwdrivers, hung in the order they get used. */}
      {[-1.5, -1.15, -0.8, -0.45].map((x, i) => (
        <mesh key={x} position={[x, 2.55 - i * 0.04, 0.07]}>
          <boxGeometry args={[0.08, 0.72 - i * 0.06, 0.05]} />
          <meshStandardMaterial
            color={METAL}
            metalness={0.65}
            roughness={0.35}
          />
        </mesh>
      ))}
      {[0.1, 0.42, 0.74].map((x, i) => (
        <group key={x} position={[x, 2.5, 0.07]}>
          <mesh>
            <boxGeometry args={[0.07, 0.5, 0.05]} />
            <meshStandardMaterial
              color={METAL}
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>
          <mesh position={[0, -0.34, 0]}>
            <boxGeometry args={[0.11, 0.24, 0.09]} />
            <meshStandardMaterial
              color={['#c9403a', '#d9853f', '#3f6fa8'][i]}
              flatShading
            />
          </mesh>
        </group>
      ))}
      {/* A hammer, a saw and a coil of cable on the right-hand side. */}
      <group position={[1.3, 2.6, 0.07]}>
        <mesh>
          <boxGeometry args={[0.08, 0.5, 0.05]} />
          <meshStandardMaterial color="#8a6642" flatShading />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[0.28, 0.14, 0.12]} />
          <meshStandardMaterial color="#5a6068" flatShading metalness={0.5} />
        </mesh>
      </group>
      <mesh position={[1.5, 1.72, 0.07]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.9, 0.3, 0.03]} />
        <meshStandardMaterial
          color="#b9c2c8"
          metalness={0.6}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0.4, 1.62, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.24, 0.05, 5, 12]} />
        <meshStandardMaterial color="#2f3a2c" flatShading roughness={1} />
      </mesh>
    </group>
  )
}

/**
 * The photographs. Seven of them in mismatched frames, which is what a family
 * wall actually looks like — nobody ever buys a matching set.
 */
function PhotoWall() {
  const frames: [number, number, number, number, string][] = [
    [-2, 2.9, 0.7, 0.9, '#8a6642'],
    [-1.15, 3.05, 0.62, 0.5, '#c9a06a'],
    [-1.15, 2.4, 0.62, 0.66, '#5a4326'],
    [-0.3, 2.85, 0.86, 0.62, '#8a6642'],
    [0.62, 3.02, 0.6, 0.74, '#a97c4e'],
    [0.62, 2.32, 0.6, 0.5, '#5a4326'],
    [1.55, 2.72, 0.8, 1.02, '#c9a06a'],
  ]
  return (
    <group>
      {frames.map(([x, y, w, h, frame], i) => (
        <group key={i} position={[x, y, 0]}>
          <mesh>
            <boxGeometry args={[w, h, 0.07]} />
            <meshStandardMaterial color={frame} flatShading roughness={0.95} />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <planeGeometry args={[w - 0.14, h - 0.14]} />
            <meshStandardMaterial
              color={['#d8c9a8', '#c9bda4', '#cfc2a2'][i % 3]}
              roughness={0.95}
            />
          </mesh>
          {/* Everyone in them, reduced to what survives at this distance. */}
          {Array.from({ length: i % 3 === 0 ? 4 : 2 }, (_, k) => (
            <mesh
              key={k}
              position={[
                (k - (i % 3 === 0 ? 1.5 : 0.5)) * (w / 5),
                -h * 0.08,
                0.06,
              ]}
            >
              <capsuleGeometry args={[w / 22, h / 6, 2, 5]} />
              <meshStandardMaterial color="#7a6a58" roughness={1} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

/**
 * An open crate of toys against the basement wall, with the lid back and
 * enough spilling over the edge to say what is in it: blocks, a ball, and the
 * wooden animal on wheels that every one of the five of them dragged around.
 */
function ToyBox({ color }: { color?: string }) {
  /* Primary colours, because that is what toys of that vintage were. */
  const blocks: [number, number, number, string][] = [
    [-0.3, 0.68, 0.12, '#d94f4f'],
    [0.02, 0.66, -0.2, '#3f7fd4'],
    [0.34, 0.7, 0.16, '#f0c020'],
    [-0.12, 0.94, -0.04, '#4f9d5a'],
  ]
  return (
    <group>
      {/* The crate: four sides, no lid on it. */}
      {[
        [0, 0.3, -0.52, 1.4, 0.6, 0.1],
        [0, 0.3, 0.52, 1.4, 0.6, 0.1],
        [-0.65, 0.3, 0, 0.1, 0.6, 1.14],
        [0.65, 0.3, 0, 0.1, 0.6, 1.14],
      ].map(([x, y, z, w, h, d], i) => (
        <mesh key={i} position={[x, y, z]} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial
            color={color ?? DARK_WOOD}
            flatShading
            roughness={0.95}
          />
        </mesh>
      ))}
      {/* The lid, leaning against the front of it. */}
      <mesh
        position={[0, 0.28, 0.68]}
        rotation={[0.32, 0, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1.34, 0.08, 0.98]} />
        <meshStandardMaterial color={WOOD} flatShading roughness={0.95} />
      </mesh>

      {blocks.map(([x, y, z, c], i) => (
        <mesh
          key={i}
          position={[x, y, z]}
          rotation={[0, i * 0.7, 0]}
          castShadow
        >
          <boxGeometry args={[0.26, 0.26, 0.26]} />
          <meshStandardMaterial color={c} flatShading roughness={0.85} />
        </mesh>
      ))}

      {/* A football, because of course there is one. */}
      <mesh position={[0.74, 0.22, 0.9]} castShadow>
        <sphereGeometry args={[0.22, 10, 8]} />
        <meshStandardMaterial color="#f2efe6" flatShading roughness={0.9} />
      </mesh>

      {/* The pull-along animal, parked where it was left. */}
      <group position={[-0.94, 0, 0.86]} rotation={[0, 0.5, 0]}>
        <mesh position={[0, 0.26, 0]} castShadow>
          <boxGeometry args={[0.52, 0.22, 0.24]} />
          <meshStandardMaterial color="#c9742f" flatShading roughness={0.9} />
        </mesh>
        <mesh position={[0.2, 0.46, 0]} castShadow>
          <boxGeometry args={[0.2, 0.26, 0.2]} />
          <meshStandardMaterial color="#c9742f" flatShading roughness={0.9} />
        </mesh>
        {[
          [-0.18, -0.13],
          [-0.18, 0.13],
          [0.18, -0.13],
          [0.18, 0.13],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.11, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.06, 8]} />
            <meshStandardMaterial color="#3a3f4a" flatShading roughness={1} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/**
 * The low shelf of toys in the library, at the end of the run of books. Four
 * boards of things that were never put away: bricks, a rocket, a robot, a
 * dinosaur, a car, a boat, a stack of board games — and on the middle board,
 * front and centre where a small hand could reach it, the helicopter.
 *
 * The helicopter is the switch. It stands proud of everything beside it, its
 * rotor turns on its own, and it is the only thing on the shelf with a light
 * of its own, so the eye goes to it before anything has been said.
 */
function ToyShelf({ color }: { color?: string }) {
  const rotor = useRef<Group>(null)
  /* Slow enough to read as a toy being idly spun, not as an aircraft. */
  useFrame((_, delta) => {
    if (rotor.current) rotor.current.rotation.y += delta * 2.2
  })

  /* Bricks along the top board, in the colours bricks come in. */
  const bricks: [number, string][] = [
    [-1.1, '#d94f4f'],
    [-0.78, '#3f7fd4'],
    [-0.46, '#f0c020'],
    [-0.14, '#4f9d5a'],
  ]

  return (
    <group>
      {/* The carcass: two ends, a back, and four boards across it. */}
      {[-1.5, 1.5].map((x) => (
        <mesh key={x} position={[x, 1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.14, 2.2, 0.7]} />
          <meshStandardMaterial
            color={color ?? DARK_WOOD}
            flatShading
            roughness={0.95}
          />
        </mesh>
      ))}
      <mesh position={[0, 1.1, -0.32]} receiveShadow>
        <boxGeometry args={[3, 2.2, 0.08]} />
        <meshStandardMaterial
          color={color ?? DARK_WOOD}
          flatShading
          roughness={0.95}
        />
      </mesh>
      {[0.08, 0.78, 1.48, 2.18].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[3, 0.1, 0.7]} />
          <meshStandardMaterial color={WOOD} flatShading roughness={0.9} />
        </mesh>
      ))}

      {/* Top board: bricks in a row, a rocket on its fins, and the ball that
          never once made it back into the box. */}
      {bricks.map(([x, c], i) => (
        <mesh key={i} position={[x, 2.36, 0.04]} castShadow>
          <boxGeometry args={[0.28, 0.24, 0.28]} />
          <meshStandardMaterial color={c} flatShading roughness={0.85} />
        </mesh>
      ))}
      <group position={[0.7, 2.24, 0.02]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.56, 10]} />
          <meshStandardMaterial color="#f2efe6" flatShading roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.68, 0]} castShadow>
          <coneGeometry args={[0.16, 0.3, 10]} />
          <meshStandardMaterial color="#d94f4f" flatShading roughness={0.9} />
        </mesh>
        {[-0.16, 0.16].map((x) => (
          <mesh key={x} position={[x, 0.1, 0]} castShadow>
            <boxGeometry args={[0.1, 0.24, 0.22]} />
            <meshStandardMaterial color="#d94f4f" flatShading roughness={0.9} />
          </mesh>
        ))}
      </group>
      <mesh position={[1.2, 2.42, 0.06]} castShadow>
        <sphereGeometry args={[0.19, 10, 8]} />
        <meshStandardMaterial color="#e8843c" flatShading roughness={0.9} />
      </mesh>

      {/* --------------------- the middle board --------------------- */}

      {/* The robot, squared off, one shoulder against the end panel. */}
      <group position={[-1.05, 1.53, 0.02]} rotation={[0, 0.3, 0]}>
        <mesh position={[0, 0.26, 0]} castShadow>
          <boxGeometry args={[0.3, 0.34, 0.22]} />
          <meshStandardMaterial color="#8d979d" flatShading metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.54, 0]} castShadow>
          <boxGeometry args={[0.24, 0.22, 0.2]} />
          <meshStandardMaterial color="#b6c0c6" flatShading metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.56, 0.11]}>
          <boxGeometry args={[0.14, 0.06, 0.02]} />
          <meshStandardMaterial
            color="#e05a3c"
            emissive="#e05a3c"
            emissiveIntensity={0.6}
          />
        </mesh>
        {[-0.21, 0.21].map((x) => (
          <mesh key={x} position={[x, 0.26, 0]} castShadow>
            <boxGeometry args={[0.1, 0.3, 0.1]} />
            <meshStandardMaterial color="#6d777d" flatShading />
          </mesh>
        ))}
        {[-0.09, 0.09].map((x) => (
          <mesh key={x} position={[x, 0.05, 0]} castShadow>
            <boxGeometry args={[0.11, 0.16, 0.12]} />
            <meshStandardMaterial color="#6d777d" flatShading />
          </mesh>
        ))}
      </group>

      {/* The dinosaur: a body, a tail, a neck and four stumps. Green, as it
          was always going to be. */}
      <group position={[-0.5, 1.53, 0.04]} rotation={[0, -0.35, 0]}>
        <mesh position={[0, 0.26, 0]} castShadow>
          <boxGeometry args={[0.42, 0.2, 0.18]} />
          <meshStandardMaterial color="#4f9d5a" flatShading roughness={0.9} />
        </mesh>
        <mesh position={[-0.28, 0.3, 0]} rotation={[0, 0, 0.5]} castShadow>
          <boxGeometry args={[0.24, 0.1, 0.12]} />
          <meshStandardMaterial color="#4f9d5a" flatShading roughness={0.9} />
        </mesh>
        <mesh position={[0.2, 0.44, 0]} castShadow>
          <boxGeometry args={[0.12, 0.26, 0.13]} />
          <meshStandardMaterial color="#4f9d5a" flatShading roughness={0.9} />
        </mesh>
        <mesh position={[0.26, 0.58, 0]} castShadow>
          <boxGeometry args={[0.2, 0.12, 0.14]} />
          <meshStandardMaterial color="#458d50" flatShading roughness={0.9} />
        </mesh>
        {[
          [-0.14, -0.07],
          [-0.14, 0.07],
          [0.12, -0.07],
          [0.12, 0.07],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.09, z]} castShadow>
            <boxGeometry args={[0.09, 0.18, 0.09]} />
            <meshStandardMaterial color="#458d50" flatShading roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/*
        The helicopter, front and centre of the middle board and standing
        clear of its neighbours: skids, a cabin, a tail with a fin on it, and
        a rotor that turns. This is the thing you press.
      */}
      <group position={[0.42, 1.53, 0.12]} rotation={[0, -0.22, 0]}>
        {/* Skids. */}
        {[-0.13, 0.13].map((z) => (
          <mesh key={z} position={[0, 0.03, z]} castShadow>
            <boxGeometry args={[0.46, 0.05, 0.05]} />
            <meshStandardMaterial color="#3a3f4a" flatShading />
          </mesh>
        ))}
        {[-0.14, 0.14].map((x) =>
          [-0.13, 0.13].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0.1, z]}>
              <boxGeometry args={[0.04, 0.12, 0.04]} />
              <meshStandardMaterial color="#3a3f4a" flatShading />
            </mesh>
          )),
        )}
        {/* Cabin, with a windscreen on the front of it. */}
        <mesh position={[0, 0.27, 0]} castShadow>
          <boxGeometry args={[0.44, 0.28, 0.3]} />
          <meshStandardMaterial color="#e0a33c" flatShading roughness={0.75} />
        </mesh>
        <mesh position={[0.2, 0.29, 0]} castShadow>
          <boxGeometry args={[0.1, 0.2, 0.26]} />
          <meshStandardMaterial
            color="#9fd4e8"
            flatShading
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>
        {/* Tail boom, and the fin standing on the end of it. */}
        <mesh position={[-0.36, 0.3, 0]} castShadow>
          <boxGeometry args={[0.36, 0.09, 0.09]} />
          <meshStandardMaterial color="#e0a33c" flatShading roughness={0.75} />
        </mesh>
        <mesh position={[-0.52, 0.38, 0]} castShadow>
          <boxGeometry args={[0.1, 0.18, 0.05]} />
          <meshStandardMaterial color="#c9862c" flatShading roughness={0.75} />
        </mesh>
        {/* Tail rotor, which does not turn: one moving thing on a toy this
            size is plenty. */}
        <mesh position={[-0.52, 0.38, 0.05]} rotation={[0, 0, 0.7]}>
          <boxGeometry args={[0.02, 0.18, 0.02]} />
          <meshStandardMaterial color="#3a3f4a" flatShading />
        </mesh>
        {/* Mast, and the main rotor over it. */}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.09, 6]} />
          <meshStandardMaterial color="#3a3f4a" flatShading />
        </mesh>
        <group ref={rotor} position={[0, 0.5, 0]}>
          {[0, Math.PI / 2].map((a) => (
            <mesh key={a} rotation={[0, a, 0]} castShadow>
              <boxGeometry args={[0.78, 0.02, 0.07]} />
              <meshStandardMaterial color="#3a3f4a" flatShading />
            </mesh>
          ))}
          <mesh>
            <boxGeometry args={[0.07, 0.05, 0.07]} />
            <meshStandardMaterial color="#8d979d" flatShading metalness={0.4} />
          </mesh>
        </group>
      </group>

      {/* The one light on the shelf, over the helicopter. Nothing says this is
          the switch; it is only the toy you can see properly. */}
      <pointLight
        position={[0.42, 1.85, 0.5]}
        intensity={2.4}
        distance={2.6}
        color="#ffd79a"
      />

      {/* --------------------- the bottom board --------------------- */}

      {/* The car, parked nose out. */}
      <group position={[-0.95, 0.13, 0.06]} rotation={[0, 0.42, 0]}>
        <mesh position={[0, 0.13, 0]} castShadow>
          <boxGeometry args={[0.5, 0.16, 0.26]} />
          <meshStandardMaterial color="#d94f4f" flatShading roughness={0.85} />
        </mesh>
        <mesh position={[-0.04, 0.27, 0]} castShadow>
          <boxGeometry args={[0.26, 0.14, 0.22]} />
          <meshStandardMaterial color="#b83f3f" flatShading roughness={0.85} />
        </mesh>
        {[
          [-0.16, -0.14],
          [-0.16, 0.14],
          [0.16, -0.14],
          [0.16, 0.14],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.07, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.05, 8]} />
            <meshStandardMaterial color="#2b2f38" flatShading />
          </mesh>
        ))}
      </group>

      {/* The boat, with a mast and one square of sail left on it. */}
      <group position={[-0.2, 0.13, 0.04]} rotation={[0, -0.25, 0]}>
        <mesh position={[0, 0.1, 0]} castShadow>
          <boxGeometry args={[0.44, 0.14, 0.2]} />
          <meshStandardMaterial color="#3f7fd4" flatShading roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.32, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.32, 6]} />
          <meshStandardMaterial color={WOOD} flatShading />
        </mesh>
        <mesh position={[0.07, 0.34, 0]}>
          <boxGeometry args={[0.14, 0.2, 0.01]} />
          <meshStandardMaterial color="#f2efe6" flatShading roughness={0.9} />
        </mesh>
      </group>

      {/* And the board games, stacked the way they end up rather than the way
          they are meant to be. */}
      {[
        [0.7, 0.19, '#6b4a72'],
        [0.7, 0.3, '#8a7233'],
        [0.74, 0.41, '#5c8a3a'],
      ].map(([x, y, c], i) => (
        <mesh
          key={i}
          position={[x as number, y as number, 0.02]}
          rotation={[0, i * 0.16 - 0.1, 0]}
          castShadow
        >
          <boxGeometry args={[0.62, 0.1, 0.44]} />
          <meshStandardMaterial
            color={c as string}
            flatShading
            roughness={0.9}
          />
        </mesh>
      ))}
    </group>
  )
}

/**
 * The hearth in the corner of the basement, lit. Out on the twenty-fifth and
 * on no other day, like everything else down there that is worth seeing.
 *
 * A brick surround with a stone mantel, three logs, and a fire that moves:
 * four flame cones on their own phases so no two rise together, and a light
 * that flickers with them rather than on a clock of its own. It is the
 * warmest thing in the room and does most of the lighting at that end of it.
 *
 * The flicker is two sines at unrelated rates plus a small random walk. Pure
 * noise reads as a fault in the renderer; pure sine reads as a pulsing lamp.
 */
function Fireplace() {
  const flames = useRef<Group>(null)
  const glow = useRef<PointLight>(null)
  const drift = useRef(1)

  useFrame((state, rawDelta) => {
    const t = state.clock.elapsedTime
    const delta = Math.min(rawDelta, 0.05)
    // A slow wander either side of full, so the room never settles.
    drift.current +=
      (1 - drift.current) * Math.min(1, delta * 2) + (Math.random() - 0.5) * 0.1
    const lick = 0.82 + Math.sin(t * 7.3) * 0.08 + Math.sin(t * 2.9) * 0.06
    if (glow.current) glow.current.intensity = 26 * lick * drift.current
    if (flames.current) {
      flames.current.children.forEach((flame, i) => {
        const own = 0.72 + Math.abs(Math.sin(t * (4.1 + i * 0.9) + i)) * 0.5
        flame.scale.set(1, own, 1)
      })
    }
  })

  return (
    <group>
      {/* The brick surround: two legs, a lintel over them, and the breast
          carrying on up out of shot. */}
      {[-1.05, 1.05].map((x) => (
        <mesh key={x} position={[x, 1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.6, 2.2, 0.9]} />
          <meshStandardMaterial color="#8a5c46" flatShading roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.7, 0.4, 0.9]} />
        <meshStandardMaterial color="#8a5c46" flatShading roughness={1} />
      </mesh>
      <mesh position={[0, 3.2, -0.15]} castShadow>
        <boxGeometry args={[1.9, 2, 0.6]} />
        <meshStandardMaterial color="#7d5340" flatShading roughness={1} />
      </mesh>
      {/* The mantel, which is the one bit of dressed stone in the room. */}
      <mesh position={[0, 2.28, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.18, 1.2]} />
        <meshStandardMaterial color="#cfc3ad" flatShading roughness={0.9} />
      </mesh>

      {/* The firebox: dark, so the flames have something to read against. */}
      <mesh position={[0, 0.9, -0.12]}>
        <boxGeometry args={[1.5, 1.8, 0.62]} />
        <meshStandardMaterial color="#241c18" flatShading roughness={1} />
      </mesh>
      <mesh position={[0, 0.08, 0.2]} receiveShadow>
        <boxGeometry args={[1.5, 0.16, 1]} />
        <meshStandardMaterial color="#4a413a" flatShading roughness={1} />
      </mesh>

      {/* Three logs, crossed the way somebody who lights fires stacks them. */}
      {(
        [
          [-0.3, 0.22, 0.12, 0.25],
          [0.3, 0.22, 0.05, -0.32],
          [0, 0.42, 0.02, 0.1],
        ] as [number, number, number, number][]
      ).map(([x, y, z, spin], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, spin, Math.PI / 2]}>
          <cylinderGeometry args={[0.11, 0.1, 1.05, 7]} />
          <meshStandardMaterial color="#54382a" flatShading roughness={1} />
        </mesh>
      ))}
      {/* Embers under them. */}
      <mesh position={[0, 0.17, 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 10]} />
        <meshStandardMaterial
          color="#c9491f"
          emissive="#ff6a24"
          emissiveIntensity={1.3}
          toneMapped={false}
        />
      </mesh>

      <group ref={flames} position={[0, 0.3, 0.06]}>
        {(
          [
            [-0.3, 0.44, '#ff7a1f'],
            [0.28, 0.5, '#ff9a2b'],
            [0, 0.72, '#ffc047'],
            [0.06, 0.34, '#ffe08a'],
          ] as [number, number, string][]
        ).map(([x, height, color], i) => (
          <mesh key={i} position={[x, height / 2, 0]}>
            <coneGeometry args={[0.2 - i * 0.02, height, 6]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1.5}
              transparent
              opacity={0.88}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      <pointLight
        ref={glow}
        position={[0, 0.85, 1]}
        intensity={26}
        distance={17}
        decay={1.6}
        color="#ff9a4a"
      />
    </group>
  )
}

/* ------------------------- the twenty-fifth --------------------------- */

/** The lights on everything festive, in the order they were strung. */
const FAIRY = ['#ff5a4e', '#ffd166', '#5fd08a', '#63b8ff', '#ff8ad0']

/**
 * The tree, in four cones with a star on top and a pile of boxes round the
 * foot of it.
 *
 * The lights blink on a slow phase offset per bulb rather than all together,
 * which is what a real string of them does and costs one sine call each.
 */
function ChristmasTree() {
  const lights = useRef<Group>(null)
  useFrame((state) => {
    if (!lights.current) return
    const t = state.clock.elapsedTime
    lights.current.children.forEach((bulb, i) => {
      const on = 0.55 + 0.45 * Math.sin(t * 1.6 + i * 1.1)
      bulb.scale.setScalar(0.8 + on * 0.45)
    })
  })

  /** Radius and height of each tier, bottom to top. */
  const tiers: [number, number, number][] = [
    [1.5, 1.5, 0.55],
    [1.25, 1.4, 1.5],
    [0.95, 1.25, 2.4],
    [0.62, 1.05, 3.2],
  ]

  return (
    <group>
      {/* Bucket and trunk. */}
      <mesh position={[0, 0.26, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.46, 0.36, 0.52, 10]} />
        <meshStandardMaterial color="#b5442f" flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.16, 0.6, 8]} />
        <meshStandardMaterial color="#6b4a2e" flatShading roughness={1} />
      </mesh>

      {tiers.map(([radius, height, y], i) => (
        <mesh key={i} position={[0, y, 0]} castShadow receiveShadow>
          <coneGeometry args={[radius, height, 9]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#2f6b3f' : '#37784a'}
            flatShading
            roughness={0.95}
          />
        </mesh>
      ))}

      {/* The star, which is two crossed plates and reads as one from here. */}
      <group position={[0, 3.86, 0]}>
        {[0, Math.PI / 2].map((r) => (
          <mesh key={r} rotation={[0, r, Math.PI / 4]}>
            <boxGeometry args={[0.34, 0.34, 0.04]} />
            <meshStandardMaterial
              color="#ffd166"
              emissive="#ffb02e"
              emissiveIntensity={0.8}
              flatShading
            />
          </mesh>
        ))}
      </group>

      {/* One bulb per position, spiralling down the way you actually hang
          them: round and round, not in neat rings. */}
      <group ref={lights}>
        {Array.from({ length: 26 }, (_, i) => {
          const down = i / 25
          const y = 3.25 - down * 2.55
          const radius = 0.42 + down * 1.02
          const angle = i * 2.05
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}
            >
              <sphereGeometry args={[0.085, 6, 5]} />
              <meshStandardMaterial
                color={FAIRY[i % FAIRY.length]}
                emissive={FAIRY[i % FAIRY.length]}
                emissiveIntensity={1.1}
                flatShading
              />
            </mesh>
          )
        })}
      </group>

      {/* Presents, stacked the way they end up rather than the way they were
          put down. */}
      {(
        [
          [-0.95, 0.18, 0.7, 0.62, '#c0392b', 0.3],
          [0.85, 0.15, 0.85, 0.52, '#2f6f9d', -0.5],
          [0.2, 0.13, 1.15, 0.44, '#b9974a', 0.15],
          [-0.5, 0.42, 1.0, 0.4, '#5f8f6a', 0.7],
        ] as [number, number, number, number, string, number][]
      ).map(([x, y, z, size, color, spin], i) => (
        <group key={i} position={[x, y, z]} rotation={[0, spin, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[size, size * 0.75, size]} />
            <meshStandardMaterial color={color} flatShading roughness={0.9} />
          </mesh>
          {/* Ribbon, both ways over the lid. */}
          <mesh>
            <boxGeometry args={[size * 0.16, size * 0.78, size * 1.02]} />
            <meshStandardMaterial color="#f5ead2" flatShading />
          </mesh>
          <mesh>
            <boxGeometry args={[size * 1.02, size * 0.78, size * 0.16]} />
            <meshStandardMaterial color="#f5ead2" flatShading />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** A wreath on the wall: a ring of needles, a bow, and four berries. */
function Wreath() {
  return (
    <group position={[0, 3.1, 0.08]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.62, 0.17, 6, 14]} />
        <meshStandardMaterial color="#2f6b3f" flatShading roughness={0.95} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = i * 1.3 + 0.4
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.62, Math.sin(angle) * 0.62, 0.14]}
          >
            <sphereGeometry args={[0.09, 6, 5]} />
            <meshStandardMaterial color="#c0392b" flatShading />
          </mesh>
        )
      })}
      {/* The bow at the bottom, two loops and a knot. */}
      {[-0.22, 0.22].map((x) => (
        <mesh key={x} position={[x, -0.7, 0.06]} rotation={[0, 0, x * 1.6]}>
          <boxGeometry args={[0.34, 0.2, 0.05]} />
          <meshStandardMaterial color="#b5442f" flatShading />
        </mesh>
      ))}
      <mesh position={[0, -0.7, 0.09]}>
        <boxGeometry args={[0.14, 0.14, 0.06]} />
        <meshStandardMaterial color="#8f2f22" flatShading />
      </mesh>
    </group>
  )
}

/**
 * A swag of greenery along a wall with lights in it, hung from two nails so
 * it dips in the middle. Nine segments is enough for the curve to read.
 */
function Garland() {
  const SPAN = 3.2
  const DIP = 0.55
  const segments = 9
  return (
    <group position={[0, 4.1, 0.1]}>
      {Array.from({ length: segments }, (_, i) => {
        const along = i / (segments - 1)
        const x = (along - 0.5) * SPAN * 2
        // A parabola, which is close enough to a hanging chain at this size.
        const sag = -DIP * (1 - (along * 2 - 1) ** 2)
        return (
          <group key={i} position={[x, sag, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.19, 6, 5]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? '#2f6b3f' : '#3a7d4c'}
                flatShading
                roughness={0.95}
              />
            </mesh>
            <mesh position={[0, -0.16, 0.07]}>
              <sphereGeometry args={[0.075, 6, 5]} />
              <meshStandardMaterial
                color={FAIRY[i % FAIRY.length]}
                emissive={FAIRY[i % FAIRY.length]}
                emissiveIntensity={1}
                flatShading
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

/**
 * The meal itself, laid along the long table.
 *
 * It is not there until the host calls it. The plates, the glasses, the
 * platter down the middle and the two candles all appear when he walks up to
 * the head of the table, and go again when he wanders off — so the state is
 * read off `FEAST` every frame rather than through React, the same way the
 * people round it are moved.
 *
 * It swells in over a fifth of a second instead of blinking into existence,
 * which is the difference between a table being laid and a bug.
 */
function FeastTable() {
  const laid = useRef<Group>(null)
  const grown = useRef(0)
  useFrame((_, rawDelta) => {
    if (!laid.current) return
    const delta = Math.min(rawDelta, 0.05)
    grown.current +=
      ((FEAST.seated ? 1 : 0) - grown.current) * Math.min(1, delta * 6)
    laid.current.visible = grown.current > 0.02
    // Rises out of the tabletop rather than scaling from its own middle.
    laid.current.scale.set(1, grown.current, 1)
    laid.current.position.y = 0.85
  })

  /**
   * Five places against the chairs down the two sides, and the sixth at the
   * west end of the cloth — which is the host's, and the one place nobody
   * else is ever given.
   */
  const places: [number, number][] = [
    [-2.6, -0.95],
    [0, -0.95],
    [2.6, -0.95],
    [-1.3, 0.95],
    [1.3, 0.95],
    [-3.85, 0],
  ]

  return (
    <group ref={laid} visible={false}>
      {places.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {/* Plate. */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.3, 12]} />
            <meshStandardMaterial color="#f7f1e2" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.3, 0.26, 0.05, 12]} />
            <meshStandardMaterial color="#efe6d2" flatShading roughness={0.6} />
          </mesh>
          {/* Something on it. */}
          <mesh position={[0, 0.07, 0]}>
            <sphereGeometry args={[0.14, 7, 5]} />
            <meshStandardMaterial color="#c07a3a" flatShading roughness={0.8} />
          </mesh>
          {/* Glass, to the right of the plate from where they stand. */}
          <mesh position={[z > 0 ? -0.34 : 0.34, 0.12, -0.06]}>
            <cylinderGeometry args={[0.07, 0.055, 0.24, 8]} />
            <meshStandardMaterial
              color="#b9433f"
              transparent
              opacity={0.85}
              roughness={0.25}
            />
          </mesh>
        </group>
      ))}

      {/* The platter down the middle, and the bread beside it. */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.62, 0.56, 0.09, 14]} />
        <meshStandardMaterial color="#e8dcc0" flatShading roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.2, 0]} scale={[1.5, 0.9, 1]}>
        <sphereGeometry args={[0.32, 9, 7]} />
        <meshStandardMaterial color="#b5763a" flatShading roughness={0.85} />
      </mesh>
      {[-1.5, 1.5].map((x) => (
        <mesh key={x} position={[x, 0.12, 0]} scale={[1.7, 0.8, 1]}>
          <sphereGeometry args={[0.22, 8, 6]} />
          <meshStandardMaterial color="#cf9c54" flatShading roughness={0.9} />
        </mesh>
      ))}

      {/* Two candles, because it is the twenty-fifth. */}
      {[-2.8, 2.8].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.06, 0.09, 0.32, 8]} />
            <meshStandardMaterial color="#f2e8d0" flatShading />
          </mesh>
          <mesh position={[0, 0.38, 0]}>
            <sphereGeometry args={[0.055, 6, 5]} />
            <meshStandardMaterial
              color="#ffd166"
              emissive="#ffb02e"
              emissiveIntensity={1.4}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** The television, and the console docked under it. */
function Television({ color }: { color?: string }) {
  const glow = useRef<Group>(null)
  useFrame((state) => {
    if (!glow.current) return
    // Something is always playing in here.
    const t = state.clock.elapsedTime
    glow.current.scale.x = 1 + Math.sin(t * 1.7) * 0.02
  })
  return (
    <group>
      <mesh position={[0, 0.34, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 0.68, 0.9]} />
        <meshStandardMaterial color={DARK_WOOD} flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.9, -0.1]} castShadow>
        <boxGeometry args={[4.2, 2.4, 0.14]} />
        <meshStandardMaterial color="#14161c" flatShading roughness={0.6} />
      </mesh>
      <group ref={glow} position={[0, 1.9, 0.01]}>
        <mesh>
          <planeGeometry args={[3.9, 2.1]} />
          <meshStandardMaterial
            color={color ?? '#4a7fd4'}
            emissive={color ?? '#4a7fd4'}
            emissiveIntensity={0.85}
            toneMapped={false}
          />
        </mesh>
      </group>
      <mesh position={[0, 0.72, -0.1]}>
        <boxGeometry args={[0.5, 0.1, 0.4]} />
        <meshStandardMaterial color="#14161c" flatShading />
      </mesh>
      {/* The dock, and a pair of controllers beside it. */}
      <mesh position={[-1.1, 0.78, 0.16]} castShadow>
        <boxGeometry args={[0.44, 0.24, 0.34]} />
        <meshStandardMaterial color="#22242a" flatShading roughness={0.7} />
      </mesh>
      <mesh position={[-1.1, 0.98, 0.16]} castShadow>
        <boxGeometry args={[0.6, 0.36, 0.06]} />
        <meshStandardMaterial
          color="#101218"
          emissive="#2f6fa8"
          emissiveIntensity={0.4}
        />
      </mesh>
      {[
        [-1.36, '#e8442f'],
        [-0.84, '#3fa9d4'],
      ].map(([x, c]) => (
        <mesh key={x as number} position={[x as number, 0.99, 0.16]}>
          <boxGeometry args={[0.16, 0.34, 0.07]} />
          <meshStandardMaterial
            color={c as string}
            flatShading
            roughness={0.6}
          />
        </mesh>
      ))}
      <mesh position={[1.2, 0.76, 0.2]} castShadow>
        <boxGeometry args={[0.72, 0.2, 0.42]} />
        <meshStandardMaterial color="#2b2f36" flatShading roughness={0.75} />
      </mesh>
      <pointLight
        position={[0, 1.9, 1.6]}
        intensity={9}
        distance={11}
        color={color ?? '#6f9ee8'}
      />
    </group>
  )
}
