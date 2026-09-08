import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { FOUNTAIN, PATHS, SIGNS } from '../data/world'
import { terrainHeight } from '../game/terrain'
import { useGame } from '../state/store'
import { TextPlane } from './TextSign'

export function Props() {
  return (
    <group>
      <Fountain />
      <CompassRose />
      <Lamps />
      <Benches />
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
    if (water.current) {
      water.current.position.y = 0.92 + Math.sin(t * 1.6) * 0.02
    }
    if (jets.current) {
      jets.current.children.forEach((drop, i) => {
        const phase = (t * 0.9 + i * 0.17) % 1
        drop.position.y = 2.4 + phase * 1.5 - phase * phase * 2.6
        drop.scale.setScalar(0.9 - phase * 0.5)
      })
    }
  })

  return (
    <group position={[FOUNTAIN[0], 0, FOUNTAIN[1]]}>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.3, 2.5, 0.7, 20]} />
        <meshStandardMaterial color="#dcd3bd" flatShading roughness={1} />
      </mesh>
      <mesh position={[0, 0.75, 0]}>
        <torusGeometry args={[2.3, 0.16, 8, 24]} />
        <meshStandardMaterial color="#c7bda4" flatShading roughness={1} />
      </mesh>
      <mesh ref={water} position={[0, 0.92, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.15, 24]} />
        <meshStandardMaterial
          color="#59c6e0"
          transparent
          opacity={0.85}
          roughness={0.15}
          metalness={0.15}
        />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.45, 1.5, 10]} />
        <meshStandardMaterial color="#dcd3bd" flatShading roughness={1} />
      </mesh>
      <mesh position={[0, 2.35, 0]} castShadow>
        <cylinderGeometry args={[1, 0.35, 0.35, 14]} />
        <meshStandardMaterial color="#dcd3bd" flatShading roughness={1} />
      </mesh>
      <group ref={jets}>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * 0.8, 2.4, Math.sin(a) * 0.8]}>
              <sphereGeometry args={[0.13, 6, 5]} />
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

/** Mosaic in the middle of the square, pointing at the four districts. */
function CompassRose() {
  return (
    <group position={[0, 0.03, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.1, 2.45, 40]} />
        <meshStandardMaterial color="#c2a878" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 20]} />
        <meshStandardMaterial color="#c2a878" roughness={1} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <group key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 1.3]}>
            <planeGeometry args={[0.5, 1.5]} />
            <meshStandardMaterial color="#b39a6a" roughness={1} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 2.15]}>
            <circleGeometry args={[0.3, 3]} />
            <meshStandardMaterial color="#9c8354" roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Benches() {
  const spots: [number, number, number][] = [
    [8.2, 1.6, -Math.PI * 0.72],
    [-6.4, -4.2, Math.PI * 0.42],
    [1.8, -6.9, -Math.PI * 0.08],
    [14.8, 5.4, -Math.PI * 0.7],
  ]
  return (
    <group>
      {spots.map(([x, z, rot], i) => (
        <group key={i} position={[x, terrainHeight(x, z), z]} rotation={[0, rot, 0]}>
          <mesh position={[0, 0.52, 0]} castShadow>
            <boxGeometry args={[2.2, 0.14, 0.7]} />
            <meshStandardMaterial color="#a97c4e" flatShading roughness={1} />
          </mesh>
          <mesh position={[0, 0.95, -0.32]} rotation={[-0.2, 0, 0]} castShadow>
            <boxGeometry args={[2.2, 0.6, 0.12]} />
            <meshStandardMaterial color="#a97c4e" flatShading roughness={1} />
          </mesh>
          {[-0.9, 0.9].map((lx) => (
            <mesh key={lx} position={[lx, 0.25, 0]}>
              <boxGeometry args={[0.14, 0.5, 0.62]} />
              <meshStandardMaterial color="#6f7377" flatShading roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

/* ------------------------------- lamps ---------------------------- */

function Lamps() {
  const positions = useMemo(() => {
    const out: [number, number][] = []
    for (const [a, b] of PATHS) {
      const dx = b[0] - a[0]
      const dz = b[1] - a[1]
      const length = Math.hypot(dx, dz)
      const nx = -dz / length
      const nz = dx / length
      const step = 10
      for (let d = step; d < length - 2; d += step) {
        const t = d / length
        const side = out.length % 2 === 0 ? 1 : -1
        out.push([
          a[0] + dx * t + nx * side * 2.6,
          a[1] + dz * t + nz * side * 2.6,
        ])
      }
    }
    return out
  }, [])

  return (
    <group>
      {positions.map(([x, z], i) => (
        <group key={i} position={[x, terrainHeight(x, z), z]}>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.28, 0.34, 0.3, 8]} />
            <meshStandardMaterial color="#4a5057" flatShading roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.8, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.11, 3.4, 8]} />
            <meshStandardMaterial color="#4a5057" flatShading roughness={0.9} />
          </mesh>
          <mesh position={[0, 3.6, 0]}>
            <icosahedronGeometry args={[0.32, 0]} />
            <meshStandardMaterial
              color="#fff3c4"
              emissive="#ffd166"
              emissiveIntensity={0.9}
              flatShading
            />
          </mesh>
          <mesh position={[0, 3.92, 0]}>
            <coneGeometry args={[0.38, 0.28, 8]} />
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
        <SignpostMesh key={sign.id} id={sign.id} label={sign.label} pos={sign.position} facing={sign.facing} />
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
    <group position={[x, terrainHeight(x, z), z]} rotation={[0, facing, 0]}>
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
  const x = 12.6
  const z = 8.4
  return (
    <group position={[x, terrainHeight(x, z), z]} rotation={[0, -0.6, 0]}>
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
  const x = -11
  const z = 9.6
  return (
    <group position={[x, terrainHeight(x, z), z]} rotation={[0, 0.4, 0]}>
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
      {/* Red cross box for the blood drive */}
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
  const Z = 7
  const planks = Array.from({ length: 9 }, (_, i) => -39 - i * 1.35)

  return (
    <group>
      {planks.map((x, i) => (
        <group key={i}>
          <mesh position={[x, DECK_Y, Z]} castShadow receiveShadow>
            <boxGeometry args={[1.25, 0.16, 3.2]} />
            <meshStandardMaterial color="#b08a5c" flatShading roughness={1} />
          </mesh>
          {i % 3 === 0 &&
            [-1.45, 1.45].map((dz) => {
              const ground = terrainHeight(x, Z + dz)
              const height = DECK_Y - ground + 0.5
              return (
                <mesh
                  key={dz}
                  position={[x, DECK_Y - height / 2, Z + dz]}
                  castShadow
                >
                  <cylinderGeometry args={[0.13, 0.13, height, 6]} />
                  <meshStandardMaterial color="#7d6242" flatShading roughness={1} />
                </mesh>
              )
            })}
        </group>
      ))}

      {/* Moored rowing boat at the far end */}
      <group position={[-51.4, -1.05, Z + 2.4]} rotation={[0, 0.25, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.62, 2.5, 4, 8]} />
          <meshStandardMaterial color="#e6eaed" flatShading roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.38, 0]}>
          <boxGeometry args={[0.95, 0.3, 2.7]} />
          <meshStandardMaterial color="#3f6f8c" flatShading roughness={0.9} />
        </mesh>
      </group>
    </group>
  )
}

function HouseFence() {
  const segments = useMemo(() => {
    const out: { x: number; z: number; rot: number }[] = []
    const cx = -20
    const cz = 18
    const hw = 7.5
    const hd = 7
    for (let x = -hw; x <= hw; x += 1.5) {
      out.push({ x: cx + x, z: cz + hd, rot: 0 })
      out.push({ x: cx + x, z: cz - hd, rot: 0 })
    }
    for (let z = -hd + 1.5; z <= hd - 1.5; z += 1.5) {
      out.push({ x: cx - hw, z: cz + z, rot: Math.PI / 2 })
      out.push({ x: cx + hw, z: cz + z, rot: Math.PI / 2 })
    }
    // Leave a gap for the front path.
    return out.filter((p) => !(Math.abs(p.x - cx) < 1.6 && p.z < cz))
  }, [])

  return (
    <group>
      {segments.map((p, i) => (
        <group key={i} position={[p.x, terrainHeight(p.x, p.z), p.z]} rotation={[0, p.rot, 0]}>
          <mesh position={[0, 0.55, 0]} castShadow>
            <boxGeometry args={[0.12, 1.1, 0.12]} />
            <meshStandardMaterial color="#e8e2d2" flatShading roughness={1} />
          </mesh>
          <mesh position={[0.75, 0.75, 0]}>
            <boxGeometry args={[1.5, 0.12, 0.06]} />
            <meshStandardMaterial color="#e8e2d2" flatShading roughness={1} />
          </mesh>
          <mesh position={[0.75, 0.4, 0]}>
            <boxGeometry args={[1.5, 0.12, 0.06]} />
            <meshStandardMaterial color="#e8e2d2" flatShading roughness={1} />
          </mesh>
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
      Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2 + 0.4
        const r = 42 + (i % 3) * 12
        return {
          x: Math.cos(a) * r,
          y: 26 + (i % 4) * 4,
          z: Math.sin(a) * r,
          scale: 2.4 + (i % 3) * 0.9,
        }
      }),
    [],
  )

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.006
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
    flock.current.rotation.y = t * 0.07
    flock.current.children.forEach((bird, i) => {
      bird.position.y = 17 + Math.sin(t * 0.8 + i) * 1.6
      bird.children.forEach((wing, w) => {
        wing.rotation.z = (w === 0 ? 1 : -1) * (0.3 + Math.sin(t * 7 + i) * 0.45)
      })
    })
  })

  return (
    <group ref={flock}>
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2
        const r = 26 + i * 2.5
        return (
          <group key={i} position={[Math.cos(a) * r, 18, Math.sin(a) * r]} rotation={[0, -a, 0]}>
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
