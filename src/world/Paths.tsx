import { useMemo } from 'react'
import { PATHS, PLAZA_RADIUS } from '../data/world'
import { PATH_WIDTH } from '../game/terrain'

const PATH_COLOR = '#dcc394'
const PLAZA_COLOR = '#e8d8b2'

interface Segment {
  x: number
  z: number
  length: number
  angle: number
}

export function Paths() {
  const { segments, joints } = useMemo(() => {
    const segs: Segment[] = []
    const points = new Map<string, [number, number]>()

    for (const [a, b] of PATHS) {
      const dx = b[0] - a[0]
      const dz = b[1] - a[1]
      segs.push({
        x: (a[0] + b[0]) / 2,
        z: (a[1] + b[1]) / 2,
        length: Math.hypot(dx, dz),
        angle: Math.atan2(dx, dz),
      })
      for (const p of [a, b]) {
        points.set(`${p[0]}:${p[1]}`, p)
      }
    }
    return { segments: segs, joints: [...points.values()] }
  }, [])

  return (
    <group>
      {/* Plaza */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.015, 0]}
        receiveShadow
      >
        <circleGeometry args={[PLAZA_RADIUS, 64]} />
        <meshStandardMaterial
          color={PLAZA_COLOR}
          roughness={1}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[PLAZA_RADIUS - 1.1, PLAZA_RADIUS, 64]} />
        <meshStandardMaterial
          color="#c2a878"
          roughness={1}
          polygonOffset
          polygonOffsetFactor={-2}
        />
      </mesh>

      {segments.map((s, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[s.x, 0.01, s.z]}
          receiveShadow
        >
          <planeGeometry args={[PATH_WIDTH, s.length]} />
          <meshStandardMaterial
            color={PATH_COLOR}
            roughness={1}
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </mesh>
      ))}

      {/* Rounded joints so corners do not show a notch. */}
      {joints.map((p, i) => (
        <mesh
          key={`j${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[p[0], 0.011, p[1]]}
        >
          <circleGeometry args={[PATH_WIDTH / 2, 16]} />
          <meshStandardMaterial
            color={PATH_COLOR}
            roughness={1}
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </mesh>
      ))}
    </group>
  )
}
