import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { FOUNTAIN, SIGNS } from '../data/world'
import {
  BENCHES,
  FENCE_SPACING,
  HOUSE_FENCE,
  LAMPS,
  PLANTERS,
  groundHeight,
} from '../game/terrain'
import { useGame } from '../state/store'
import { TextPlane } from './TextSign'

export function Props() {
  return (
    <group>
      <Fountain />
      <CompassRose />
      <Lamps />
      <Benches />
      <Planters />
      <Signposts />
      <ChessCorner />
      <VolunteerTent />
      <Dock />
      <HouseFence />
      <Clouds />
      <Birds />
    </group>
  )
}

/* ------------------------------- plaza ---------------------------- */

function Fountain() {
  const water = useRef<Mesh>(null)
  const jets = useRef<Group>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (water.current) water.current.position.y = 1.24 + Math.sin(t * 1.6) * 0.03
    if (jets.current) {
      jets.current.children.forEach((drop, i) => {
        const phase = (t * 0.9 + i * 0.17) % 1
        drop.position.y = 3.3 + phase * 2 - phase * phase * 3.4
        drop.scale.setScalar(1.1 - phase * 0.6)
      })
    }
  })

  return (
    <group position={[FOUNTAIN[0], 0, FOUNTAIN[1]]}>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.1, 3.4, 0.9, 22]} />
        <meshStandardMaterial color="#dcd3bd" flatShading roughness={1} />
      </mesh>
      <mesh position={[0, 1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.1, 0.2, 8, 26]} />
        <meshStandardMaterial color="#c7bda4" flatShading roughness={1} />
      </mesh>
      <mesh ref={water} position={[0, 1.24, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.95, 26]} />
        <meshStandardMaterial
          color="#59c6e0"
          transparent
          opacity={0.85}
          roughness={0.15}
          metalness={0.15}
        />
      </mesh>
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.62, 2.1, 10]} />
        <meshStandardMaterial color="#dcd3bd" flatShading roughness={1} />
      </mesh>
      <mesh position={[0, 3.25, 0]} castShadow>
        <cylinderGeometry args={[1.4, 0.5, 0.45, 16]} />
        <meshStandardMaterial color="#dcd3bd" flatShading roughness={1} />
      </mesh>
      <group ref={jets}>
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * 1.1, 3.3, Math.sin(a) * 1.1]}>
              <sphereGeometry args={[0.17, 6, 5]} />
              <meshStandardMaterial
                color="#9fe4f5"
                transparent
                opacity={0.8}
                roughness={0.1}
              />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

/** Mosaic in the middle of the square, pointing at the districts. */
function CompassRose() {
  return (
    <group position={[0, 0.03, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.4, 5, 48]} />
        <meshStandardMaterial color="#c2a878" roughness={1} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 20]} />
        <meshStandardMaterial color="#c2a878" roughness={1} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <group key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 2.7]}>
            <planeGeometry args={[1, 3.2]} />
            <meshStandardMaterial color="#b39a6a" roughness={1} polygonOffset polygonOffsetFactor={-3} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 4.5]}>
            <circleGeometry args={[0.62, 3]} />
            <meshStandardMaterial color="#9c8354" roughness={1} polygonOffset polygonOffsetFactor={-4} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Benches() {
  return (
    <group>
      {BENCHES.map(({ position: [x, z], rotation }, i) => (
        <group
          key={i}
          position={[x, groundHeight(x, z), z]}
          rotation={[0, rotation, 0]}
        >
          <mesh position={[0, 0.52, 0]} castShadow>
            <boxGeometry args={[2.4, 0.14, 0.75]} />
            <meshStandardMaterial color="#a97c4e" flatShading roughness={1} />
          </mesh>
          <mesh position={[0, 0.95, -0.34]} rotation={[-0.2, 0, 0]} castShadow>
            <boxGeometry args={[2.4, 0.6, 0.12]} />
            <meshStandardMaterial color="#a97c4e" flatShading roughness={1} />
          </mesh>
          {[-1, 1].map((lx) => (
            <mesh key={lx} position={[lx, 0.25, 0]}>
              <boxGeometry args={[0.14, 0.5, 0.66]} />
              <meshStandardMaterial color="#6f7377" flatShading roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

/** Stone planters that keep the big square from reading as empty. */
function Planters() {
  return (
    <group>
      {PLANTERS.map(([x, z], i) => (
        <group key={i} position={[x, groundHeight(x, z), z]}>
          <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.5, 1.7, 0.9, 10]} />
            <meshStandardMaterial color="#d8cdb4" flatShading roughness={1} />
          </mesh>
          <mesh position={[0, 0.98, 0]}>
            <cylinderGeometry args={[1.4, 1.4, 0.2, 10]} />
            <meshStandardMaterial color="#6b4a30" roughness={1} />
          </mesh>
          {[0, 1, 2, 3].map((j) => {
            const a = (j / 4) * Math.PI * 2 + i
            return (
              <mesh
                key={j}
                position={[Math.cos(a) * 0.6, 1.5, Math.sin(a) * 0.6]}
                castShadow
              >
                <icosahedronGeometry args={[0.7, 0]} />
                <meshStandardMaterial
                  color={j % 2 ? '#4f9c3f' : '#63ad46'}
                  flatShading
                  roughness={1}
                />
              </mesh>
            )
          })}
        </group>
      ))}
    </group>
  )
}

/* ------------------------------- lamps ---------------------------- */

function Lamps() {
  // Out entirely during hide and seek: the island is supposed to be dark.
  const lit = useGame((s) => s.night && s.hide === null)

  return (
    <group>
      {LAMPS.map(([x, z], i) => (
        <group key={i} position={[x, groundHeight(x, z), z]}>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.3, 0.36, 0.3, 8]} />
            <meshStandardMaterial color="#4a5057" flatShading roughness={0.9} />
          </mesh>
          <mesh position={[0, 2, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.12, 3.8, 8]} />
            <meshStandardMaterial color="#4a5057" flatShading roughness={0.9} />
          </mesh>
          <mesh position={[0, 4, 0]}>
            <icosahedronGeometry args={[0.36, 0]} />
            <meshStandardMaterial
              color="#fff3c4"
              emissive="#ffd166"
              emissiveIntensity={lit ? 2.6 : 0.9}
              flatShading
            />
          </mesh>
          {lit && (
            <>
              {/* Glow around the bulb, and the pool it throws on the road.
                  Both are flat meshes: a light per lamp would be dozens. */}
              <mesh position={[0, 4, 0]}>
                <sphereGeometry args={[0.95, 12, 10]} />
                <meshBasicMaterial
                  color="#ffd9a0"
                  transparent
                  opacity={0.2}
                  depthWrite={false}
                />
              </mesh>
              <mesh
                position={[0, 0.06, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <circleGeometry args={[3.6, 18]} />
                <meshBasicMaterial
                  color="#ffc978"
                  transparent
                  opacity={0.13}
                  depthWrite={false}
                />
              </mesh>
            </>
          )}
          <mesh position={[0, 4.36, 0]}>
            <coneGeometry args={[0.42, 0.3, 8]} />
            <meshStandardMaterial color="#3c4148" flatShading roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ----------------------------- signposts -------------------------- */

function Signposts() {
  return (
    <group>
      {SIGNS.map((sign) => (
        <SignpostMesh
          key={sign.id}
          id={sign.id}
          label={sign.label}
          pos={sign.position}
          facing={sign.facing}
        />
      ))}
    </group>
  )
}

function SignpostMesh({
  id,
  label,
  pos,
  facing,
}: {
  id: string
  label: string
  pos: [number, number]
  facing: number
}) {
  const board = useRef<Group>(null)
  const active = useGame((s) => s.nearby?.id === id)

  useFrame((state) => {
    if (board.current) {
      board.current.rotation.z = active
        ? Math.sin(state.clock.elapsedTime * 6) * 0.05
        : 0
    }
  })

  const [x, z] = pos
  return (
    <group position={[x, groundHeight(x, z), z]} rotation={[0, facing, 0]} scale={1.4}>
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.16, 1.7, 0.16]} />
        <meshStandardMaterial color="#8a6642" flatShading roughness={1} />
      </mesh>
      <group ref={board} position={[0, 1.85, 0]}>
        <mesh castShadow>
          <boxGeometry args={[2.2, 0.75, 0.14]} />
          <meshStandardMaterial color="#c39a63" flatShading roughness={1} />
        </mesh>
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[2, 0.56, 0.02]} />
          <meshStandardMaterial color="#5c4326" roughness={0.9} />
        </mesh>
        <TextPlane
          text={label}
          width={1.95}
          aspect={4.4}
          color="#ffe9c4"
          outline="rgba(0,0,0,0.5)"
          position={[0, 0, 0.1]}
        />
      </group>
    </group>
  )
}

/* ------------------------- scenery vignettes ---------------------- */

function ChessCorner() {
  const x = 29.5
  const z = 18.5
  return (
    <group position={[x, groundHeight(x, z), z]} rotation={[0, -0.6, 0]}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.18, 0.8, 8]} />
        <meshStandardMaterial color="#7a6a55" flatShading roughness={1} />
      </mesh>
      <mesh position={[0, 0.84, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.1, 1.3]} />
        <meshStandardMaterial color="#f0e6d2" flatShading roughness={0.9} />
      </mesh>
      {Array.from({ length: 16 }, (_, i) => {
        const cx = (i % 4) - 1.5
        const cz = Math.floor(i / 4) - 1.5
        if ((cx + cz) % 2 !== 0) return null
        return (
          <mesh key={i} position={[cx * 0.3, 0.9, cz * 0.3]}>
            <boxGeometry args={[0.3, 0.02, 0.3]} />
            <meshStandardMaterial color="#4c3b2a" roughness={0.9} />
          </mesh>
        )
      })}
      {[
        [-0.42, -0.42, '#f7f2e6'],
        [0.12, -0.12, '#2f2721'],
        [0.42, 0.3, '#f7f2e6'],
      ].map(([px, pz, color], i) => (
        <mesh key={i} position={[px as number, 1.05, pz as number]} castShadow>
          <cylinderGeometry args={[0.07, 0.11, 0.28, 8]} />
          <meshStandardMaterial color={color as string} flatShading roughness={0.8} />
        </mesh>
      ))}
      {[-1.2, 1.2].map((sx) => (
        <mesh key={sx} position={[sx, 0.28, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.34, 0.56, 10]} />
          <meshStandardMaterial color="#a97c4e" flatShading roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

function VolunteerTent() {
  const x = -27
  const z = 23.5
  return (
    <group position={[x, groundHeight(x, z), z]} rotation={[0, 0.4, 0]} scale={1.3}>
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[4.6, 0.16, 4]} />
        <meshStandardMaterial color="#e05a6f" flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.72, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[3.4, 0.7, 4]} />
        <meshStandardMaterial color="#f0f2f4" flatShading roughness={0.9} />
      </mesh>
      {[
        [-2.1, -1.8],
        [2.1, -1.8],
        [-2.1, 1.8],
        [2.1, 1.8],
      ].map(([px, pz], i) => (
        <mesh key={i} position={[px, 1.25, pz]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 2.5, 6]} />
          <meshStandardMaterial color="#c9cdd2" metalness={0.4} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 0.95, -1.5]} castShadow>
        <boxGeometry args={[3.4, 0.12, 1.1]} />
        <meshStandardMaterial color="#c39a63" flatShading roughness={1} />
      </mesh>
      <group position={[0, 1.25, -1.5]}>
        <mesh castShadow>
          <boxGeometry args={[0.7, 0.5, 0.5]} />
          <meshStandardMaterial color="#f7f2e6" flatShading roughness={0.9} />
        </mesh>
        <mesh position={[0, 0, 0.26]}>
          <boxGeometry args={[0.36, 0.12, 0.02]} />
          <meshStandardMaterial color="#d63d3d" />
        </mesh>
        <mesh position={[0, 0, 0.26]}>
          <boxGeometry args={[0.12, 0.36, 0.02]} />
          <meshStandardMaterial color="#d63d3d" />
        </mesh>
      </group>
    </group>
  )
}

function Dock() {
  const DECK_Y = -0.55
  const Z = 20
  const planks = Array.from({ length: 10 }, (_, i) => -116 - i * 2)

  return (
    <group>
      {planks.map((x, i) => (
        <group key={i}>
          <mesh position={[x, DECK_Y, Z]} castShadow receiveShadow>
            <boxGeometry args={[1.9, 0.2, 4.4]} />
            <meshStandardMaterial color="#b08a5c" flatShading roughness={1} />
          </mesh>
          {i % 3 === 0 &&
            [-2, 2].map((dz) => {
              const ground = groundHeight(x, Z + dz)
              const height = DECK_Y - ground + 0.6
              return (
                <mesh key={dz} position={[x, DECK_Y - height / 2, Z + dz]} castShadow>
                  <cylinderGeometry args={[0.16, 0.16, height, 6]} />
                  <meshStandardMaterial color="#7d6242" flatShading roughness={1} />
                </mesh>
              )
            })}
        </group>
      ))}

      {/* Moored rowing boat at the far end */}
      <group position={[-137, -1.05, Z + 3.4]} rotation={[0, 0.25, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.8, 3.2, 4, 8]} />
          <meshStandardMaterial color="#e6eaed" flatShading roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[1.2, 0.36, 3.4]} />
          <meshStandardMaterial color="#3f6f8c" flatShading roughness={0.9} />
        </mesh>
      </group>
    </group>
  )
}

/**
 * The garden fence, drawn from the same runs the player collides with, so the
 * rails and the thing that stops you are never in two different places.
 */
function HouseFence() {
  const bays = useMemo(
    () =>
      HOUSE_FENCE.flatMap((run) => {
        const dx = run.to[0] - run.from[0]
        const dz = run.to[1] - run.from[1]
        const length = Math.hypot(dx, dz)
        const count = Math.max(1, Math.round(length / FENCE_SPACING))
        const span = length / count
        const rot = Math.atan2(-dz, dx)
        // One post per division plus the one that closes the run, and a pair
        // of rails spanning every gap between them.
        return Array.from({ length: count + 1 }, (_, i) => ({
          x: run.from[0] + (dx * i) / count,
          z: run.from[1] + (dz * i) / count,
          rot,
          span: i < count ? span : 0,
        }))
      }),
    [],
  )

  return (
    <group>
      {bays.map((p, i) => (
        <group
          key={i}
          position={[p.x, groundHeight(p.x, p.z), p.z]}
          rotation={[0, p.rot, 0]}
        >
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[0.14, 1.2, 0.14]} />
            <meshStandardMaterial color="#e8e2d2" flatShading roughness={1} />
          </mesh>
          {p.span > 0 &&
            [0.82, 0.44].map((y) => (
              <mesh key={y} position={[p.span / 2, y, 0]}>
                <boxGeometry args={[p.span, 0.13, 0.07]} />
                <meshStandardMaterial color="#e8e2d2" flatShading roughness={1} />
              </mesh>
            ))}
        </group>
      ))}
    </group>
  )
}

/* --------------------------- sky dressing ------------------------- */

function Clouds() {
  const group = useRef<Group>(null)
  const clouds = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2 + 0.4
        const r = 110 + (i % 4) * 26
        return {
          x: Math.cos(a) * r,
          y: 52 + (i % 5) * 9,
          z: Math.sin(a) * r,
          scale: 5 + (i % 3) * 2.4,
        }
      }),
    [],
  )

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.004
  })

  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} scale={c.scale}>
          {[
            [0, 0, 0, 1],
            [1.1, -0.2, 0.2, 0.75],
            [-1.2, -0.15, -0.1, 0.8],
            [0.3, 0.5, -0.3, 0.6],
          ].map(([x, y, z, s], j) => (
            <mesh key={j} position={[x, y, z]} scale={s}>
              <icosahedronGeometry args={[1, 1]} />
              <meshStandardMaterial color="#ffffff" flatShading roughness={1} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function Birds() {
  const flock = useRef<Group>(null)
  useFrame((state) => {
    if (!flock.current) return
    const t = state.clock.elapsedTime
    flock.current.rotation.y = t * 0.05
    flock.current.children.forEach((bird, i) => {
      bird.position.y = 34 + Math.sin(t * 0.8 + i) * 3
      bird.children.forEach((wing, w) => {
        wing.rotation.z = (w === 0 ? 1 : -1) * (0.3 + Math.sin(t * 7 + i) * 0.45)
      })
    })
  })

  return (
    <group ref={flock}>
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2
        const r = 62 + i * 6
        return (
          <group
            key={i}
            position={[Math.cos(a) * r, 34, Math.sin(a) * r]}
            rotation={[0, -a, 0]}
            scale={2}
          >
            {[0, 1].map((w) => (
              <mesh key={w} position={[w === 0 ? -0.4 : 0.4, 0, 0]}>
                <boxGeometry args={[0.9, 0.06, 0.24]} />
                <meshStandardMaterial color="#3d4750" flatShading />
              </mesh>
            ))}
          </group>
        )
      })}
    </group>
  )
}
