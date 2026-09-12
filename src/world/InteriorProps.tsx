import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BackSide } from 'three'
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

    case 'stairwell':
      return <Stairwell />

    case 'shutter':
      return (
        <group>
          <mesh position={[0, 1.7, 0]}>
            <boxGeometry args={[5.2, 3.4, 0.18]} />
            <meshStandardMaterial color="#5a6068" flatShading roughness={0.7} />
          </mesh>
          {Array.from({ length: 9 }, (_, i) => (
            <mesh key={i} position={[0, 0.26 + i * 0.38, 0.11]}>
              <boxGeometry args={[5, 0.3, 0.06]} />
              <meshStandardMaterial
                color={i % 2 ? '#7b828b' : '#6b727a'}
                flatShading
                roughness={0.65}
                metalness={0.25}
              />
            </mesh>
          ))}
          <mesh position={[0, 3.56, 0]}>
            <boxGeometry args={[5.5, 0.34, 0.4]} />
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

/** The bicycle, leaning against whatever is behind it. */
function Bicycle({ color }: { color?: string }) {
  const frame = color ?? '#2fb59a'
  return (
    <group rotation={[0, 0, 0.09]}>
      {[-0.62, 0.62].map((x) => (
        <group key={x} position={[x, 0.62, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh castShadow>
            <torusGeometry args={[0.6, 0.055, 6, 18]} />
            <meshStandardMaterial color="#23262c" flatShading roughness={0.9} />
          </mesh>
          {[0, Math.PI / 3, (2 * Math.PI) / 3].map((a) => (
            <mesh key={a} rotation={[0, 0, a]}>
              <boxGeometry args={[1.14, 0.025, 0.025]} />
              <meshStandardMaterial color={METAL} metalness={0.55} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Frame: two triangles and a fork, which is all a bicycle really is. */}
      {[
        { p: [-0.16, 0.98, 0], r: 0.5, l: 1.02 },
        { p: [-0.3, 0.66, 0], r: -0.36, l: 0.86 },
        { p: [0.28, 0.82, 0], r: 1.16, l: 0.92 },
        { p: [0.5, 0.94, 0], r: 1.32, l: 0.78 },
      ].map((bar, i) => (
        <mesh
          key={i}
          position={bar.p as [number, number, number]}
          rotation={[0, 0, bar.r]}
          castShadow
        >
          <boxGeometry args={[bar.l, 0.07, 0.07]} />
          <meshStandardMaterial color={frame} flatShading roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[-0.42, 1.16, 0]} castShadow>
        <boxGeometry args={[0.42, 0.1, 0.16]} />
        <meshStandardMaterial color="#1b1d22" flatShading roughness={0.95} />
      </mesh>
      <mesh position={[0.56, 1.2, 0]} castShadow>
        <boxGeometry args={[0.07, 0.07, 0.62]} />
        <meshStandardMaterial color="#1b1d22" flatShading />
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

/**
 * A flight going down through the floor, for the landing at the top of it.
 *
 * The shaft is drawn inside out. A plain box has a lid, and a lid sitting
 * flush over the opening hides every tread underneath it — which is exactly
 * how the first one of these ended up looking like a dark rug.
 */
function Stairwell() {
  return (
    <group>
      <mesh position={[0, -1.5, 0]}>
        <boxGeometry args={[3.2, 3, 3.6]} />
        <meshStandardMaterial
          color="#241e2a"
          flatShading
          roughness={1}
          side={BackSide}
        />
      </mesh>
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[0, -0.26 - i * 0.36, 1.4 - i * 0.56]}>
          <boxGeometry args={[3.1, 0.22, 0.6]} />
          <meshStandardMaterial color="#c3b393" flatShading roughness={0.95} />
        </mesh>
      ))}
      {/* The newels and the rail round the opening, so nobody walks into it
          by accident and it reads as a stairwell rather than a trapdoor. */}
      {[-1.7, 1.7].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.55, 1.75]} castShadow>
            <boxGeometry args={[0.16, 1.1, 0.16]} />
            <meshStandardMaterial color={DARK_WOOD} flatShading />
          </mesh>
          <mesh position={[x, 0.55, -1.75]} castShadow>
            <boxGeometry args={[0.16, 1.1, 0.16]} />
            <meshStandardMaterial color={DARK_WOOD} flatShading />
          </mesh>
          <mesh position={[x, 1.02, 0]}>
            <boxGeometry args={[0.12, 0.12, 3.5]} />
            <meshStandardMaterial color={DARK_WOOD} flatShading />
          </mesh>
        </group>
      ))}
      <pointLight
        position={[0, -1, 0]}
        intensity={7}
        distance={7}
        color="#ffca7a"
      />
    </group>
  )
}
