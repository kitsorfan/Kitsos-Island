import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { DOCK, DOCK_EDGE, DOCK_PLANKS, FOUNTAIN, KIOSK, SIGNS } from './world'
import {
  BENCHES,
  FENCE_SPACING,
  HOUSE_FENCE,
  LAMPS,
  PLANTERS,
  groundHeight,
  terrainHeight,
} from './terrainLogic'
import { useGame } from '../../shared/state/store'
import { TextPlane } from '../../shared/engine/TextSign'

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
    if (water.current)
      water.current.position.y = 1.24 + Math.sin(t * 1.6) * 0.03
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
            <mesh
              key={i}
              position={[Math.cos(a) * 1.1, 3.3, Math.sin(a) * 1.1]}
            >
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
        <meshStandardMaterial
          color="#c2a878"
          roughness={1}
          polygonOffset
          polygonOffsetFactor={-2}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 20]} />
        <meshStandardMaterial
          color="#c2a878"
          roughness={1}
          polygonOffset
          polygonOffsetFactor={-2}
        />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <group key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 2.7]}>
            <planeGeometry args={[1, 3.2]} />
            <meshStandardMaterial
              color="#b39a6a"
              roughness={1}
              polygonOffset
              polygonOffsetFactor={-3}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 4.5]}>
            <circleGeometry args={[0.62, 3]} />
            <meshStandardMaterial
              color="#9c8354"
              roughness={1}
              polygonOffset
              polygonOffsetFactor={-4}
            />
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
              <meshStandardMaterial
                color="#6f7377"
                flatShading
                roughness={0.9}
              />
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
              <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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
    <group
      position={[x, groundHeight(x, z), z]}
      rotation={[0, facing, 0]}
      scale={1.4}
    >
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
          <meshStandardMaterial
            color={color as string}
            flatShading
            roughness={0.8}
          />
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

/**
 * The volunteers' kiosk on the west green: a gazebo, a trestle table under it
 * and the clutter of a stall that is actually being run.
 *
 * Everything on the table is placed against the table's own local frame, so
 * the whole stall can be turned or moved as one and nothing slides off. The
 * table stands at the back of the canopy rather than under the middle of it,
 * which leaves the front open to walk into: the two of them who run the stall
 * stand in that gap, one behind the table and one out in front.
 *
 * Where it stands and how big it is built come from KIOSK in data/world, so
 * that the collider agrees with the drawing. The group is scaled, so a length
 * written here is that much bigger on the ground; TABLE_Y and the rest are in
 * the unscaled frame, like every other number in this file.
 */

/** Top of the trestle table. Its depth and offset are KIOSK.table. */
const TABLE_Y = 1.01
const TABLE_Z = KIOSK.table.z

function VolunteerTent() {
  const { x, z } = KIOSK
  return (
    <group
      position={[x, groundHeight(x, z), z]}
      rotation={[0, KIOSK.facing, 0]}
      scale={KIOSK.scale}
    >
      {/* Canopy: a valance all round, and the pyramid roof over it. */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[4.6, 0.16, 4]} />
        <meshStandardMaterial color="#e05a6f" flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.72, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[3.4, 0.7, 4]} />
        <meshStandardMaterial color="#f0f2f4" flatShading roughness={0.9} />
      </mesh>

      {/* Scalloped edging along the front lip of the canopy. */}
      {[-1.8, -0.9, 0, 0.9, 1.8].map((sx) => (
        <mesh key={sx} position={[sx, 2.36, 2]} castShadow>
          <cylinderGeometry
            args={[0.28, 0.28, 0.06, 10, 1, false, 0, Math.PI]}
          />
          <meshStandardMaterial color="#f0f2f4" flatShading roughness={0.9} />
        </mesh>
      ))}

      {[
        [-2.1, -1.8],
        [2.1, -1.8],
        [-2.1, 1.8],
        [2.1, 1.8],
      ].map(([px, pz], i) => (
        <mesh key={i} position={[px, 1.25, pz]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 2.5, 6]} />
          <meshStandardMaterial
            color="#c9cdd2"
            metalness={0.4}
            roughness={0.5}
          />
        </mesh>
      ))}

      <KioskBanner />
      <KioskTable />
      <KioskSaplings />
      <KioskCrates />
      <KioskDonorBoard />
    </group>
  )
}

/** The cloth banner slung across the back of the canopy. */
function KioskBanner() {
  return (
    <group position={[0, 1.95, -1.94]}>
      <mesh castShadow>
        <boxGeometry args={[4.1, 0.78, 0.06]} />
        <meshStandardMaterial color="#c8394f" flatShading roughness={0.95} />
      </mesh>
      {/* A white cross at each end: the blood drive is the standing draw. */}
      {[-1.72, 1.72].map((bx) => (
        <group key={bx} position={[bx, 0, 0.04]}>
          <mesh>
            <boxGeometry args={[0.38, 0.12, 0.02]} />
            <meshStandardMaterial color="#fdf7e9" />
          </mesh>
          <mesh>
            <boxGeometry args={[0.12, 0.38, 0.02]} />
            <meshStandardMaterial color="#fdf7e9" />
          </mesh>
        </group>
      ))}
      <TextPlane
        text="GIVE BLOOD / SIGN UP"
        width={2.7}
        aspect={7.5}
        color="#fff3e2"
        outline="rgba(0,0,0,0.45)"
        position={[0, 0, 0.05]}
        renderOrder={2}
      />
    </group>
  )
}

/**
 * The trestle table and what is laid out on it, left to right: the first-aid
 * box, two clipboards with pens on strings, the tin the stickers come out of,
 * and a stack of leaflets with a jar of pens behind them.
 */
function KioskTable() {
  return (
    <group position={[0, 0, TABLE_Z]}>
      {/* Cloth to the ground at the front, so the trestle is not on show. */}
      <mesh position={[0, 0.48, 0.02]} castShadow>
        <boxGeometry args={[KIOSK.table.hx * 2 - 0.08, 0.96, 1.06]} />
        <meshStandardMaterial color="#2f7d6b" flatShading roughness={1} />
      </mesh>
      <mesh position={[0, TABLE_Y - 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[KIOSK.table.hx * 2, 0.12, KIOSK.table.hz * 2]} />
        <meshStandardMaterial color="#c39a63" flatShading roughness={1} />
      </mesh>

      {/* First-aid box. */}
      <group position={[-1.24, TABLE_Y + 0.25, 0]}>
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

      {/* Two clipboards, lying flat and not quite square to each other. */}
      {[
        { cx: -0.32, rot: 0.14 },
        { cx: 0.36, rot: -0.22 },
      ].map(({ cx, rot }) => (
        <group
          key={cx}
          position={[cx, TABLE_Y + 0.02, 0.06]}
          rotation={[0, rot, 0]}
        >
          <mesh castShadow>
            <boxGeometry args={[0.46, 0.03, 0.62]} />
            <meshStandardMaterial color="#8a6642" flatShading roughness={1} />
          </mesh>
          <mesh position={[0, 0.025, -0.02]}>
            <boxGeometry args={[0.4, 0.01, 0.54]} />
            <meshStandardMaterial color="#fdf7e9" roughness={0.95} />
          </mesh>
          {/* The clip, and the pen on its string beside it. */}
          <mesh position={[0, 0.045, -0.26]}>
            <boxGeometry args={[0.18, 0.04, 0.07]} />
            <meshStandardMaterial
              color="#9aa2ab"
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>
          <mesh
            position={[0.16, 0.05, 0.12]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.018, 0.018, 0.3, 6]} />
            <meshStandardMaterial color="#2f3542" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* The sticker tin: lid up, and a bright roll of them inside. */}
      <group position={[1.06, TABLE_Y + 0.08, 0.12]} rotation={[0, -0.3, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.44, 0.16, 0.34]} />
          <meshStandardMaterial color="#3f6fb5" flatShading roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.16, -0.17]} rotation={[-1.05, 0, 0]} castShadow>
          <boxGeometry args={[0.44, 0.02, 0.34]} />
          <meshStandardMaterial color="#3f6fb5" flatShading roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.1, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.06, 12]} />
          <meshStandardMaterial color="#f2b134" flatShading roughness={0.9} />
        </mesh>
      </group>

      {/* Leaflets, and a jar of pens standing behind them. */}
      <group position={[1.52, TABLE_Y + 0.04, -0.2]}>
        {[0, 0.05, 0.1].map((ly, i) => (
          <mesh
            key={ly}
            position={[0, ly, i * 0.01]}
            rotation={[0, i * 0.12, 0]}
            castShadow
          >
            <boxGeometry args={[0.34, 0.04, 0.46]} />
            <meshStandardMaterial
              color="#fdf7e9"
              flatShading
              roughness={0.95}
            />
          </mesh>
        ))}
      </group>
      <group position={[0.7, TABLE_Y + 0.12, -0.34]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.12, 0.1, 0.22, 10]} />
          <meshStandardMaterial
            color="#cfe6f5"
            transparent
            opacity={0.55}
            roughness={0.3}
          />
        </mesh>
        {[
          { color: '#d63d3d', px: -0.04, tilt: 0.12 },
          { color: '#2f7d6b', px: 0.03, tilt: -0.1 },
          { color: '#2f3542', px: 0.05, tilt: 0.04 },
        ].map((pen) => (
          <mesh
            key={pen.color}
            position={[pen.px, 0.2, 0]}
            rotation={[0, 0, pen.tilt]}
            castShadow
          >
            <cylinderGeometry args={[0.016, 0.016, 0.34, 6]} />
            <meshStandardMaterial color={pen.color} roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/** A rack of saplings in pots, waiting to go up the hill in the spring. */
function KioskSaplings() {
  return (
    <group position={[2.55, 0, 0.9]} rotation={[0, -0.5, 0]}>
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.1, 0.62]} />
        <meshStandardMaterial color="#8a6642" flatShading roughness={1} />
      </mesh>
      {[-0.52, 0, 0.52].map((sx, i) => (
        <group key={sx} position={[sx, 0.21, i === 1 ? -0.08 : 0.06]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.19, 0.15, 0.3, 8]} />
            <meshStandardMaterial color="#b4643c" flatShading roughness={1} />
          </mesh>
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.04, 8]} />
            <meshStandardMaterial color="#4a3a2a" flatShading roughness={1} />
          </mesh>
          <mesh
            position={[0, 0.42, 0]}
            rotation={[0, 0, (i - 1) * 0.08]}
            castShadow
          >
            <cylinderGeometry args={[0.032, 0.042, 0.52, 6]} />
            <meshStandardMaterial color="#6b5030" flatShading roughness={1} />
          </mesh>
          {/* The crown clears the top of the stem rather than swallowing it:
              a sapling is mostly stick, which is how you tell it from a tree. */}
          <mesh position={[0, 0.86, 0]} castShadow>
            <icosahedronGeometry args={[0.22, 0]} />
            <meshStandardMaterial color="#4f8f3a" flatShading roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Crates from the donation drive, stacked at the end of the stall. */
function KioskCrates() {
  return (
    <group position={[-2.5, 0, 0.7]} rotation={[0, 0.34, 0]}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.6, 0.7]} />
        <meshStandardMaterial color="#c8a06a" flatShading roughness={1} />
      </mesh>
      <mesh position={[0.08, 0.86, 0.06]} rotation={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.85, 0.52, 0.64]} />
        <meshStandardMaterial color="#b58e5c" flatShading roughness={1} />
      </mesh>
      {/* What is in the top one: folded clothes, and a tin on top of them. */}
      <mesh position={[0.08, 1.16, 0.06]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.7, 0.12, 0.5]} />
        <meshStandardMaterial color="#5f77b5" flatShading roughness={1} />
      </mesh>
      <mesh position={[0.24, 1.28, -0.04]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.16, 10]} />
        <meshStandardMaterial color="#9aa2ab" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  )
}

/**
 * The board on a stake beside the stall: the tally of who has turned up so
 * far, chalked up five to a row. It faces out across the green.
 */
function KioskDonorBoard() {
  return (
    <group position={[-2.35, 0, 2.35]} rotation={[0, 0.18, 0]}>
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.12, 1.7, 0.12]} />
        <meshStandardMaterial color="#8a6642" flatShading roughness={1} />
      </mesh>
      <group position={[0, 1.78, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.5, 1.05, 0.1]} />
          <meshStandardMaterial color="#c39a63" flatShading roughness={1} />
        </mesh>
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[1.32, 0.88, 0.02]} />
          <meshStandardMaterial color="#2f4a3e" roughness={0.95} />
        </mesh>
        <TextPlane
          text="VOLUNTEERS"
          width={1.2}
          aspect={6}
          color="#ffe9c4"
          outline="rgba(0,0,0,0.5)"
          position={[0, 0.3, 0.08]}
          renderOrder={2}
        />
        {/* Three rows of chalk ticks, five to a row, and the rota filling. */}
        {[0, 1, 2].map((row) => (
          <group key={row} position={[0, 0.02 - row * 0.17, 0.08]}>
            {[-0.42, -0.21, 0, 0.21, 0.42].map((tx, i) => (
              <mesh
                key={tx}
                position={[tx, 0, 0]}
                rotation={[0, 0, i % 2 ? 0.2 : -0.16]}
              >
                <boxGeometry args={[0.03, 0.11, 0.01]} />
                <meshBasicMaterial
                  color={row * 5 + i < 11 ? '#fdf7e9' : '#4a6355'}
                />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    </group>
  )
}

/**
 * The jetty: a level deck standing on its piles, a gangway board where it
 * comes down on to the sand, and the run of planks carrying on out until
 * there is nothing but sea underneath.
 *
 * Every plank stands clear of the ground it is over, at the beach end as
 * much as at the sea end. A deck laid at the height of the water would have
 * its first few planks buried in the sand — a walkway you can feel underfoot
 * and cannot see — and the gangway is what lets the rest of it stand up.
 */
const RAMP_THICK = 0.14

function Dock() {
  const Z = DOCK.z
  /** Centre of a plank: the walking surface is the top of it. */
  const DECK_Y = DOCK.deck - DOCK.thickness / 2

  return (
    <group>
      {/* The gangway, laid on the sand at one end and on the deck at the
          other. Barely a slope — it is the join that matters, not the
          climb. */}
      <mesh
        position={[
          DOCK_EDGE + DOCK.ramp / 2,
          DOCK.deck / 2 - RAMP_THICK / 2,
          Z,
        ]}
        rotation={[0, 0, -Math.atan2(DOCK.deck, DOCK.ramp)]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[
            Math.hypot(DOCK.ramp, DOCK.deck),
            RAMP_THICK,
            DOCK.halfWidth * 2,
          ]}
        />
        <meshStandardMaterial color="#a8835a" flatShading roughness={1} />
      </mesh>

      {DOCK_PLANKS.map((x, i) => (
        <group key={i}>
          <mesh position={[x, DECK_Y, Z]} castShadow receiveShadow>
            <boxGeometry
              args={[DOCK.step - 0.1, DOCK.thickness, DOCK.halfWidth * 2]}
            />
            <meshStandardMaterial color="#b08a5c" flatShading roughness={1} />
          </mesh>
          {i % 3 === 0 &&
            [-2, 2].map((dz) => {
              // Down to the sea bed, which is what the piles are driven into
              // — not to the decking, which by now is one of them.
              const ground = terrainHeight(x, Z + dz)
              const height = DECK_Y - ground + 0.6
              return (
                <mesh
                  key={dz}
                  position={[x, DECK_Y - height / 2, Z + dz]}
                  castShadow
                >
                  <cylinderGeometry args={[0.16, 0.16, height, 6]} />
                  <meshStandardMaterial
                    color="#7d6242"
                    flatShading
                    roughness={1}
                  />
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
                <meshStandardMaterial
                  color="#e8e2d2"
                  flatShading
                  roughness={1}
                />
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
        wing.rotation.z =
          (w === 0 ? 1 : -1) * (0.3 + Math.sin(t * 7 + i) * 0.45)
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
