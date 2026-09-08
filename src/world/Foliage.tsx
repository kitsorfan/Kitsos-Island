import { useMemo } from 'react'
import { Instance, Instances } from '@react-three/drei'
import { FLOWERS, HILLS, HILL_TREES, ROCKS, TREES, TUFTS } from '../game/terrain'
import type { Scatter } from '../game/terrain'

const CANOPY_COLORS = ['#4f9c3f', '#3f8a37', '#63ad46', '#2f7a35']
const FLOWER_COLORS = ['#f4d03f', '#ef6f8b', '#f0f3f5', '#a06fd6']

/** Everything beyond this radius gets palms instead of round trees. */
const PALM_RADIUS = 92

export function Foliage() {
  const { broadleaf, palms } = useMemo(() => {
    const b: Scatter[] = []
    const p: Scatter[] = []
    for (const t of TREES) {
      const r = Math.hypot(t.position[0], t.position[1])
      ;(r > PALM_RADIUS ? p : b).push(t)
    }
    return { broadleaf: b, palms: p }
  }, [])

  return (
    <group>
      <Hills />
      <BroadleafTrees trees={broadleaf} />
      <Pines trees={HILL_TREES} />
      {palms.map((t, i) => (
        <Palm key={`palm${i}`} data={t} />
      ))}
      <Rocks />
      <Flowers />
      <Tufts />
    </group>
  )
}

function Hills() {
  return (
    <group>
      {HILLS.map((hill, i) => (
        <mesh
          key={i}
          position={[hill.position[0], -hill.height * 0.35, hill.position[1]]}
          scale={[hill.radius, hill.height * 1.35, hill.radius]}
          castShadow
          receiveShadow
        >
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color="#67a83e" flatShading roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

function BroadleafTrees({ trees }: { trees: Scatter[] }) {
  return (
    <group>
      <Instances limit={640} range={trees.length} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.32, 2.4, 6]} />
        <meshStandardMaterial color="#7d5a3a" flatShading roughness={1} />
        {trees.map((t, i) => (
          <Instance
            key={i}
            position={[t.position[0], t.y + 1.2 * t.scale, t.position[1]]}
            scale={t.scale}
            rotation={[0, t.rotation, 0]}
          />
        ))}
      </Instances>

      <Instances limit={640} range={trees.length} castShadow>
        <icosahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial flatShading roughness={1} />
        {trees.map((t, i) => (
          <Instance
            key={i}
            position={[t.position[0], t.y + 3.1 * t.scale, t.position[1]]}
            scale={t.scale}
            rotation={[t.rotation * 0.3, t.rotation, 0]}
            color={CANOPY_COLORS[t.variant % CANOPY_COLORS.length]}
          />
        ))}
      </Instances>

      <Instances limit={640} range={trees.length} castShadow>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial flatShading roughness={1} />
        {trees.map((t, i) => (
          <Instance
            key={i}
            position={[
              t.position[0] + Math.cos(t.rotation) * 0.6 * t.scale,
              t.y + 4.1 * t.scale,
              t.position[1] + Math.sin(t.rotation) * 0.6 * t.scale,
            ]}
            scale={t.scale}
            rotation={[0, -t.rotation, 0.4]}
            color={CANOPY_COLORS[(t.variant + 1) % CANOPY_COLORS.length]}
          />
        ))}
      </Instances>
    </group>
  )
}

function Pines({ trees }: { trees: Scatter[] }) {
  const tiers = [
    { y: 1.9, r: 1.25, h: 2.2 },
    { y: 3.0, r: 0.95, h: 1.9 },
    { y: 4.0, r: 0.6, h: 1.5 },
  ]
  return (
    <group>
      <Instances limit={120} range={trees.length} castShadow>
        <cylinderGeometry args={[0.16, 0.24, 1.6, 5]} />
        <meshStandardMaterial color="#6b4a30" flatShading roughness={1} />
        {trees.map((t, i) => (
          <Instance
            key={i}
            position={[t.position[0], t.y + 0.8 * t.scale, t.position[1]]}
            scale={t.scale}
          />
        ))}
      </Instances>
      {tiers.map((tier, ti) => (
        <Instances key={ti} limit={120} range={trees.length} castShadow>
          <coneGeometry args={[tier.r, tier.h, 7]} />
          <meshStandardMaterial color="#2f7a45" flatShading roughness={1} />
          {trees.map((t, i) => (
            <Instance
              key={i}
              position={[t.position[0], t.y + tier.y * t.scale, t.position[1]]}
              scale={t.scale}
              rotation={[0, t.rotation, 0]}
            />
          ))}
        </Instances>
      ))}
    </group>
  )
}

function Palm({ data }: { data: Scatter }) {
  const [x, z] = data.position
  const lean = Math.sin(data.rotation) * 0.16
  const fronds = 7
  return (
    <group position={[x, data.y, z]} rotation={[0, data.rotation, 0]} scale={data.scale}>
      <mesh position={[lean * 1.6, 2.1, 0]} rotation={[0, 0, -lean]} castShadow>
        <cylinderGeometry args={[0.17, 0.3, 4.4, 6]} />
        <meshStandardMaterial color="#8a6a45" flatShading roughness={1} />
      </mesh>
      <group position={[lean * 3.2, 4.25, 0]}>
        {Array.from({ length: fronds }, (_, i) => {
          const a = (i / fronds) * Math.PI * 2
          return (
            <group key={i} rotation={[0, a, 0]}>
              <mesh
                position={[0, -0.18, 1.2]}
                rotation={[Math.PI / 2 + 0.32, 0, 0]}
                scale={[1, 1, 0.28]}
                castShadow
              >
                <coneGeometry args={[0.55, 2.8, 4]} />
                <meshStandardMaterial
                  color={i % 2 ? '#3f9a4c' : '#4fae57'}
                  flatShading
                  roughness={1}
                />
              </mesh>
            </group>
          )
        })}
        <mesh position={[0, -0.35, 0]}>
          <sphereGeometry args={[0.28, 6, 5]} />
          <meshStandardMaterial color="#8a6a45" flatShading roughness={1} />
        </mesh>
      </group>
    </group>
  )
}

function Rocks() {
  return (
    <Instances limit={260} range={ROCKS.length} castShadow receiveShadow>
      <dodecahedronGeometry args={[0.7, 0]} />
      <meshStandardMaterial color="#9aa3a8" flatShading roughness={1} />
      {ROCKS.map((r, i) => (
        <Instance
          key={i}
          position={[r.position[0], r.y + 0.18 * r.scale, r.position[1]]}
          rotation={[r.rotation * 0.4, r.rotation, r.rotation * 0.2]}
          scale={[r.scale, r.scale * 0.65, r.scale * 0.9]}
          color={r.variant === 0 ? '#a8b0b4' : r.variant === 1 ? '#8d979d' : '#b3a99a'}
        />
      ))}
    </Instances>
  )
}

function Flowers() {
  return (
    <group>
      <Instances limit={460} range={FLOWERS.length}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 4]} />
        <meshStandardMaterial color="#3d8a3a" roughness={1} />
        {FLOWERS.map((f, i) => (
          <Instance
            key={i}
            position={[f.position[0], f.y + 0.2 * f.scale, f.position[1]]}
            scale={f.scale}
          />
        ))}
      </Instances>
      <Instances limit={460} range={FLOWERS.length}>
        <icosahedronGeometry args={[0.13, 0]} />
        <meshStandardMaterial flatShading roughness={0.8} />
        {FLOWERS.map((f, i) => (
          <Instance
            key={i}
            position={[f.position[0], f.y + 0.44 * f.scale, f.position[1]]}
            scale={f.scale}
            color={FLOWER_COLORS[f.variant % FLOWER_COLORS.length]}
          />
        ))}
      </Instances>
    </group>
  )
}

function Tufts() {
  return (
    <Instances limit={560} range={TUFTS.length}>
      <coneGeometry args={[0.22, 0.6, 4]} />
      <meshStandardMaterial color="#57a03d" flatShading roughness={1} />
      {TUFTS.map((t, i) => (
        <Instance
          key={i}
          position={[t.position[0], t.y + 0.28 * t.scale, t.position[1]]}
          rotation={[0, t.rotation, 0]}
          scale={[t.scale, t.scale * (t.variant === 0 ? 1 : 0.7), t.scale]}
          color={t.variant === 0 ? '#57a03d' : '#6db34a'}
        />
      ))}
    </Instances>
  )
}
