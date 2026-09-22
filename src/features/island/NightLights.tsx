import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh, Object3D, SpotLight } from 'three'
import { BUILDINGS, BUILDING_BY_ID } from './world'
import { groundHeight } from './terrainLogic'
import { useGame } from '../../shared/state/store'

import type { Building } from '../../types'

const WINDOW_WARM = '#ffd487'
const WINDOW_COLD = '#bcd8ff'

/**
 * Everything that only exists after dark: lit windows on the buildings, the
 * beam off the lighthouse, and the searchlight going round the camp.
 */
export function NightLights() {
  // Hide and seek is played with every light on the island put out — the lit
  // windows, the lighthouse and the camp searchlight included. Somebody's
  // torch is the only thing burning anywhere.
  const dark = useGame((s) => s.hide !== null)
  if (dark) return null

  return (
    <group>
      {BUILDINGS.map((building) => (
        <Windows key={building.id} building={building} />
      ))}
      <LighthouseBeam />
      <CampSearchlight />
    </group>
  )
}

/* ----------------------------- camp searchlight --------------------------- */

/**
 * Where the lamp sits above the camp, and the radius the pool runs round at
 * — far enough out to cross the perimeter, the gate and whoever is standing
 * on the road in, and no further.
 */
const MAST = 14
const SWEEP_RADIUS = 20
const POOL = 5.5
/** One turn every twenty-odd seconds — a patrol, not a disco. */
const SWEEP_SPEED = 0.3

/**
 * The searchlight on the camp mast: one beam, turning all night, with a pool
 * of light dragging round the perimeter under it. Anything it crosses — the
 * sentries, the road in, you — is lit as it goes past.
 */
function CampSearchlight() {
  const sweep = useRef<Group>(null)
  const light = useRef<SpotLight>(null)
  const aim = useRef<Object3D>(null)
  const building = BUILDING_BY_ID.get('army')

  useEffect(() => {
    if (light.current && aim.current) light.current.target = aim.current
  }, [])

  useFrame((state) => {
    if (sweep.current)
      sweep.current.rotation.y = state.clock.elapsedTime * SWEEP_SPEED
  })

  if (!building) return null
  const [x, z] = building.position
  const ground = groundHeight(x, z)
  // Cone from the lamp down to where the pool sits, so the two line up.
  const drop = MAST
  const length = Math.hypot(SWEEP_RADIUS, drop)
  const tilt = Math.atan2(drop, SWEEP_RADIUS)
  const shaft = Math.max(2, MAST - building.height)

  return (
    <group position={[x, ground + MAST, z]}>
      {/* Only the part of the mast that clears the roof is drawn; the rest
          of it would be inside the barracks. */}
      <mesh position={[0, -shaft / 2, 0]}>
        <cylinderGeometry args={[0.22, 0.3, shaft, 8]} />
        <meshStandardMaterial color="#3a3f33" flatShading roughness={0.9} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.7, 10, 8]} />
        <meshBasicMaterial color="#fff6d2" />
      </mesh>
      <pointLight intensity={70} distance={30} decay={1.6} color="#ffeec2" />

      <group ref={sweep}>
        {/* The beam, tipped down onto the ground it is searching. */}
        <group rotation={[tilt, 0, 0]}>
          <mesh position={[0, 0, length / 2]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[POOL, length, 14, 1, true]} />
            <meshBasicMaterial
              color="#fff4cf"
              transparent
              opacity={0.09}
              depthWrite={false}
            />
          </mesh>
        </group>

        {/* And the pool it drags round the perimeter. */}
        <mesh
          position={[0, -MAST + 0.08, SWEEP_RADIUS]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[POOL, 22]} />
          <meshBasicMaterial
            color="#fff2c2"
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>

        <spotLight
          ref={light}
          angle={0.26}
          penumbra={0.5}
          intensity={700}
          distance={44}
          decay={1.3}
          color="#fff3d0"
        />
        <object3D ref={aim} position={[0, -MAST, SWEEP_RADIUS]} />
      </group>
    </group>
  )
}

/**
 * Lit windows, placed off the building's own data rather than its model: the
 * face that carries the door is the face that faces the town, so that is the
 * side the light shows on.
 */
function Windows({ building }: { building: Building }) {
  const rows = useMemo(() => {
    const [bx, bz] = building.position
    const [dx, dz] = building.door
    const away = Math.hypot(dx - bx, dz - bz) || 1
    // Outward normal of the door face, and the direction along that wall.
    const nx = (dx - bx) / away
    const nz = (dz - bz) / away
    const sx = -nz
    const sz = nx

    // Just clear of the wall, so a window never sinks into the model.
    const reach = Math.min(building.half[0], building.half[1]) + 0.12
    const wide = Math.max(building.half[0], building.half[1])
    const floors = building.height > 14 ? 3 : building.height > 9 ? 2 : 1
    const across = wide > 12 ? 3 : 2

    const out: {
      position: [number, number, number]
      rotation: [number, number, number]
      lit: boolean
      cold: boolean
    }[] = []

    for (let f = 0; f < floors; f++) {
      for (let a = 0; a < across; a++) {
        const offset = (a - (across - 1) / 2) * Math.min(4.6, wide * 0.62)
        const x = bx + nx * reach + sx * offset
        const z = bz + nz * reach + sz * offset
        const y = groundHeight(bx, bz) + 2.6 + f * 3.4
        out.push({
          position: [x, y, z],
          rotation: [0, Math.atan2(nx, nz), 0],
          // A couple of windows are dark, which reads as a real building —
          // and one that shuts for the night keeps a single light burning,
          // for whoever is left standing on the gate.
          lit: building.closesAtNight
            ? f === 0 && a === 0
            : (f * 7 + a * 3 + building.id.length) % 5 !== 0,
          cold: building.id === 'work' || building.id === 'radio',
        })
      }
    }
    return out
  }, [building])

  return (
    <group>
      {rows.map((row, i) =>
        row.lit ? (
          <group key={i} position={row.position} rotation={row.rotation}>
            <mesh>
              <planeGeometry args={[1.5, 1.1]} />
              <meshBasicMaterial
                color={row.cold ? WINDOW_COLD : WINDOW_WARM}
                transparent
                opacity={0.92}
              />
            </mesh>
            {/* A wider, fainter pane behind it stands in for spill. */}
            <mesh position={[0, 0, -0.02]}>
              <planeGeometry args={[3.2, 2.6]} />
              <meshBasicMaterial
                color={row.cold ? WINDOW_COLD : WINDOW_WARM}
                transparent
                opacity={0.12}
              />
            </mesh>
          </group>
        ) : null,
      )}
    </group>
  )
}

/** The old lighthouse, doing the one job it was built for. */
function LighthouseBeam() {
  const sweep = useRef<Group>(null)
  const lamp = useRef<Mesh>(null)
  const building = BUILDING_BY_ID.get('lighthouse')

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (sweep.current) sweep.current.rotation.y = t * 0.55
    // The lamp itself pulses a little as the optic turns.
    if (lamp.current) lamp.current.scale.setScalar(1 + Math.sin(t * 1.1) * 0.06)
  })

  if (!building) return null
  const [x, z] = building.position
  const y = groundHeight(x, z) + building.height * 0.86

  return (
    <group position={[x, y, z]}>
      <mesh ref={lamp}>
        <sphereGeometry args={[1.1, 12, 10]} />
        <meshBasicMaterial color="#fff3c4" />
      </mesh>
      <pointLight intensity={220} distance={70} decay={1.7} color="#ffe9b8" />

      <group ref={sweep}>
        {/* Two beams, opposite each other, as a real optic throws. */}
        {[0, Math.PI].map((turn) => (
          <group key={turn} rotation={[0, turn, 0]}>
            <mesh position={[0, 0, 46]} rotation={[-Math.PI / 2, 0, 0]}>
              <coneGeometry args={[7, 92, 4, 1, true]} />
              <meshBasicMaterial
                color="#ffeec2"
                transparent
                opacity={0.09}
                depthWrite={false}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}
