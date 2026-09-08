import { useMemo } from 'react'
import { BufferAttribute, Color, PlaneGeometry } from 'three'
import { ISLAND_EDGE, smoothstep, terrainHeight } from '../game/terrain'

const GRASS_A = new Color('#7cbb4e')
const GRASS_B = new Color('#5fa23c')
const GRASS_DARK = new Color('#4b8a35')
const SAND = new Color('#eadaa8')
const WET_SAND = new Color('#c9b483')
const SEABED = new Color('#3f7b78')

const scratch = new Color()

/** Low-poly island: a displaced plane with baked vertex colours. */
export function Terrain() {
  const geometry = useMemo(() => {
    const size = ISLAND_EDGE * 2.4
    const segments = 168
    const geo = new PlaneGeometry(size, size, segments, segments)
    geo.rotateX(-Math.PI / 2)

    const pos = geo.attributes.position as BufferAttribute
    const colors = new Float32Array(pos.count * 3)

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      const y = terrainHeight(x, z)
      pos.setY(i, y)

      const r = Math.hypot(x, z)

      // Patchy grass, so the flat interior is not one solid colour.
      const patch =
        0.5 +
        0.5 *
          Math.sin(x * 0.17 + Math.cos(z * 0.13) * 1.7) *
          Math.cos(z * 0.19 - Math.sin(x * 0.11) * 1.3)
      scratch.copy(GRASS_A).lerp(GRASS_B, patch)
      scratch.lerp(GRASS_DARK, smoothstep((r - 20) / 26) * 0.35)

      scratch.lerp(SAND, smoothstep((r - 33.5) / 3.5))
      scratch.lerp(WET_SAND, smoothstep((r - 40) / 4))
      scratch.lerp(SEABED, smoothstep((r - 45) / 8))

      colors[i * 3] = scratch.r
      colors[i * 3 + 1] = scratch.g
      colors[i * 3 + 2] = scratch.b
    }

    geo.setAttribute('color', new BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <mesh geometry={geometry} receiveShadow position={[0, 0, 0]}>
      <meshStandardMaterial vertexColors flatShading roughness={1} metalness={0} />
    </mesh>
  )
}
