import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  ExtrudeGeometry,
  Shape,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type MeshStandardMaterial,
} from 'three'
import { useGame } from '../../state/store'
import { DOOR_AJAR, DOOR_OPEN, doorAtRest, slideDoor } from '../../game/doors'
import { TextPlane } from '../TextSign'
import { GreekFlag } from '../InteriorProps'
import { IbmMark, NtuaSeal, VeltistonMark } from '../Emblems'

/**
 * Triangular prism used for gable roofs.
 *
 * It comes out of here already standing the right way up: the base spans X by
 * width, the apex is at +Y by height, and the ridge runs along Z by depth. So
 * it wants no rotation at all — every caller sits it on the wall top with a
 * position and nothing else. Turning it a quarter turn about X, which is what
 * every one of them used to do, swaps the vertical axis with the depth one and
 * stands the whole roof on end as a slab through the middle of the building.
 */
function useGable(width: number, height: number, depth: number) {
  return useMemo(() => {
    const shape = new Shape()
    shape.moveTo(-width / 2, 0)
    shape.lineTo(width / 2, 0)
    shape.lineTo(0, height)
    shape.closePath()
    const geo = new ExtrudeGeometry(shape, { depth, bevelEnabled: false })
    geo.translate(0, 0, -depth / 2)
    return geo
  }, [width, height, depth])
}

interface WindowProps {
  position: [number, number, number]
  size?: [number, number]
  rotation?: [number, number, number]
  frame?: string
  glass?: string
  lit?: boolean
}

function Win({
  position,
  size = [1, 1.2],
  rotation = [0, 0, 0],
  frame = '#3f6fb5',
  glass = '#bfe4f5',
  lit = false,
}: WindowProps) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[size[0] + 0.18, size[1] + 0.18, 0.12]} />
        <meshStandardMaterial color={frame} flatShading roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.1]}>
        <planeGeometry args={size} />
        <meshStandardMaterial
          color={lit ? '#ffe9a8' : glass}
          emissive={lit ? '#ffbe4d' : '#000000'}
          emissiveIntensity={lit ? 0.7 : 0}
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>
    </group>
  )
}

function Door({
  position,
  width = 1.4,
  height = 2.4,
  color = '#2f6bb3',
  step = true,
}: {
  position: [number, number, number]
  width?: number
  height?: number
  color?: string
  /** Off for a door that already has a flight of steps under it. */
  step?: boolean
}) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[width, height, 0.18]} />
        <meshStandardMaterial color={color} flatShading roughness={0.7} />
      </mesh>
      <mesh position={[width * 0.28, 0, 0.13]}>
        <sphereGeometry args={[0.08, 8, 6]} />
        <meshStandardMaterial color="#f0c14b" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* The step. Its top used to sit at exactly the height of the ground,
          which put two flat surfaces on the same plane and left the pair of
          them fighting over the depth buffer — the flicker you saw at the
          house, the school, the camp and the radio mast. It stands a little
          proud of the grass now, which is what a doorstep does anyway. */}
      {step && (
        <mesh position={[0, -height / 2 - 0.04, 0.55]} receiveShadow>
          <boxGeometry args={[width + 1, 0.2, 1.2]} />
          <meshStandardMaterial color="#cfc2a6" flatShading roughness={1} />
        </mesh>
      )}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Kitsos House — whitewashed Greek cube with a terracotta roof        */
/* ------------------------------------------------------------------ */

/** Two storeys over a basement, which is what is actually inside it. */
const HOUSE = { W: 8.8, D: 7.8, H: 7.2 }

/**
 * The course of stone the house stands on: how far its face is from the
 * middle of the building, and how high its top is. The front steps are laid
 * off both, and so is the walkable ground pinned to them.
 */
const PLINTH = { z: (HOUSE.D + 0.5) / 2, top: 0.64 }

/**
 * The stretch of the plinth the garage mouth takes up, in the house's own
 * z. The apron is 3.9 wide about z = -1.1, and the cut is a little wider
 * than that so the stone never shows at the edge of the opening.
 */
const GARAGE_BAY = { from: -3.15, to: 0.95 }

/**
 * Louvered shutters, thrown back against the wall either side of a window.
 * Nobody in this climate has a window without them, and they are most of
 * what stops a whitewashed box reading as a whitewashed box.
 */
function Shutters({
  position,
  width = 1,
  height = 1.2,
  rotation = [0, 0, 0],
  color = '#2f6bb3',
}: {
  position: [number, number, number]
  width?: number
  height?: number
  rotation?: [number, number, number]
  color?: string
}) {
  const leaf = width * 0.56
  return (
    <group position={position} rotation={rotation}>
      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[side * (width / 2 + leaf / 2 + 0.02), 0, 0.12]}
          rotation={[0, side * -0.32, 0]}
        >
          <mesh castShadow>
            <boxGeometry args={[leaf, height + 0.16, 0.07]} />
            <meshStandardMaterial color={color} flatShading roughness={0.8} />
          </mesh>
          {Array.from({ length: 5 }, (_, i) => (
            <mesh key={i} position={[0, height * 0.4 - i * (height / 5), 0.05]}>
              <boxGeometry args={[leaf - 0.1, height / 9, 0.03]} />
              <meshStandardMaterial
                color="#25548f"
                flatShading
                roughness={0.85}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

/**
 * The roof. It was a bare triangular prism, which from the road read as a
 * wedge of clay rather than a roof — so this lays courses of pantiles up
 * each pitch, with a ridge along the top and an eaves board under the
 * overhang. Same prism underneath, still one geometry.
 */
function TiledRoof({
  width,
  rise,
  depth,
}: {
  width: number
  rise: number
  depth: number
}) {
  const gable = useGable(width, rise, depth)
  const half = width / 2
  const slope = Math.atan2(rise, half)
  const run = Math.hypot(half, rise)
  const courses = 6

  return (
    <group>
      <mesh geometry={gable} castShadow>
        <meshStandardMaterial color="#b04e35" flatShading roughness={0.9} />
      </mesh>

      {[-1, 1].map((side) =>
        Array.from({ length: courses }, (_, i) => {
          // Up the pitch, from the eaves to just short of the ridge.
          const t = (i + 0.5) / courses
          const x = side * half * (1 - t)
          const y = rise * t
          return (
            <mesh
              key={`${side}-${i}`}
              position={[x, y + 0.04, 0]}
              rotation={[0, 0, side * -slope]}
              castShadow
            >
              <boxGeometry args={[run / courses - 0.05, 0.1, depth + 0.04]} />
              <meshStandardMaterial
                color={i % 2 ? '#bd5739' : '#a9482f'}
                flatShading
                roughness={0.95}
              />
            </mesh>
          )
        }),
      )}

      {/* Ridge capping, and the board that closes the eaves. */}
      <mesh position={[0, rise + 0.02, 0]} castShadow>
        <boxGeometry args={[0.55, 0.22, depth + 0.1]} />
        <meshStandardMaterial color="#8f3d29" flatShading roughness={0.95} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (half - 0.06), 0.02, 0]} castShadow>
          <boxGeometry args={[0.26, 0.3, depth + 0.08]} />
          <meshStandardMaterial color="#8f6242" flatShading roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

export function HouseModel() {
  const { W, D, H } = HOUSE
  const vine = useRef<Group>(null)

  useFrame((state) => {
    if (!vine.current) return
    // The bougainvillea moves, which is the only thing on the whole island
    // that says the air is doing anything.
    const t = state.clock.elapsedTime
    vine.current.rotation.z = Math.sin(t * 0.7) * 0.035
  })

  return (
    <group>
      {/* Stone plinth. A whitewashed box sitting straight on grass looks
          dropped there; every house here stands on a course of stone.

          It is cut away in front of the garage. The course stands a hand
          proud of the wall everywhere else, which in front of a door the car
          drives through would bury the bottom of it and leave the door
          looking like it floats — so along that bay the stone stops at the
          wall face and the mouth runs down to the apron. */}
      {[
        { from: -(D + 0.5) / 2, to: GARAGE_BAY.from },
        { from: GARAGE_BAY.to, to: (D + 0.5) / 2 },
      ].map((bay) => (
        <mesh
          key={bay.from}
          position={[0, PLINTH.top / 2, (bay.from + bay.to) / 2]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[W + 0.5, PLINTH.top, bay.to - bay.from]} />
          <meshStandardMaterial color="#b8ad97" flatShading roughness={1} />
        </mesh>
      ))}
      {/* Behind the mouth the course is still there, just held back to the
          wall face so it never stands in front of the door. */}
      <mesh
        position={[
          -0.25 / 2,
          PLINTH.top / 2,
          (GARAGE_BAY.from + GARAGE_BAY.to) / 2,
        ]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[W + 0.25, PLINTH.top, GARAGE_BAY.to - GARAGE_BAY.from]}
        />
        <meshStandardMaterial color="#b8ad97" flatShading roughness={1} />
      </mesh>

      <mesh position={[0, H / 2 + 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color="#f6f1e4" flatShading roughness={0.95} />
      </mesh>

      <group position={[0, H + 0.5, 0]}>
        <TiledRoof width={W + 0.9} rise={2.4} depth={D + 0.9} />
      </group>

      {/* Front: the door under the pergola, two windows with shutters. */}
      {/* Stood on the plinth rather than a hand's breadth over it: the
          doorstep used to cover that gap, and it has its own steps now. */}
      <Door
        position={[0, PLINTH.top + 1.2, D / 2 + 0.02]}
        color="#2f6bb3"
        step={false}
      />
      {/* Three treads down off the plinth. Without them the front door opens
          two thirds of a metre above the path.
      
          They start where the plinth ends rather than a stride out from it,
          and they climb in four even steps of a sixth of a metre — the three
          treads and the plinth itself. Whoever walks up them is walking on
          LEDGES pinned to exactly this arithmetic, so neither the height of a
          tread nor where the flight begins can be changed here alone. */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[0, 0.4 - i * 0.16, PLINTH.z + 0.45 + i * 0.9]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[3.4, 0.16, 0.9]} />
          <meshStandardMaterial color="#cfc2a6" flatShading roughness={1} />
        </mesh>
      ))}
      <Win position={[-2.6, 2.9, D / 2 + 0.02]} lit />
      <Shutters position={[-2.6, 2.9, D / 2 + 0.02]} />
      <Win position={[2.6, 2.9, D / 2 + 0.02]} />
      <Shutters position={[2.6, 2.9, D / 2 + 0.02]} />
      <Win position={[-2.6, 2.9, -D / 2 - 0.02]} rotation={[0, Math.PI, 0]} />
      <Shutters
        position={[-2.6, 2.9, -D / 2 - 0.02]}
        rotation={[0, Math.PI, 0]}
      />
      {/* Clear of the garage below it: the shutter leaves swing wide, and
          the mouth and its apron take up the rest of this face. */}
      <Win
        position={[W / 2 + 0.02, 2.9, 2.3]}
        rotation={[0, Math.PI / 2, 0]}
        lit
      />
      <Shutters
        position={[W / 2 + 0.02, 2.9, 2.3]}
        rotation={[0, Math.PI / 2, 0]}
      />

      {/* First floor: the landing window over the door, the lab lit at the
          end of it, and shutters on all of them like the floor below. */}
      {[-2.6, 2.6].map((x) => (
        <group key={`up${x}`}>
          <Win position={[x, 5.9, D / 2 + 0.02]} lit={x > 0} />
          <Shutters position={[x, 5.9, D / 2 + 0.02]} />
        </group>
      ))}
      <Win
        position={[W / 2 + 0.02, 5.9, 2.3]}
        rotation={[0, Math.PI / 2, 0]}
        lit
      />
      <Shutters
        position={[W / 2 + 0.02, 5.9, 2.3]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <Win position={[-2.6, 5.9, -D / 2 - 0.02]} rotation={[0, Math.PI, 0]} />

      {/* The balcony off the landing, sitting over the pergola. */}
      <group position={[0, 0, D / 2]}>
        <Win position={[0, 5.7, 0.02]} size={[1.7, 2.5]} />
        <mesh position={[0, 4.42, 0.78]} castShadow receiveShadow>
          <boxGeometry args={[4.6, 0.18, 1.6]} />
          <meshStandardMaterial color="#e6ddca" flatShading roughness={1} />
        </mesh>
        {[-2.24, 2.24].map((x) => (
          <mesh key={x} position={[x, 4.95, 0.78]} castShadow>
            <boxGeometry args={[0.14, 0.88, 1.6]} />
            <meshStandardMaterial color="#f2ece0" flatShading roughness={0.9} />
          </mesh>
        ))}
        <mesh position={[0, 5.35, 1.52]} castShadow>
          <boxGeometry args={[4.6, 0.12, 0.14]} />
          <meshStandardMaterial color="#f2ece0" flatShading roughness={0.9} />
        </mesh>
        {[-1.6, -0.8, 0, 0.8, 1.6].map((x) => (
          <mesh key={`b${x}`} position={[x, 4.92, 1.52]}>
            <boxGeometry args={[0.12, 0.86, 0.12]} />
            <meshStandardMaterial color="#f2ece0" flatShading roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* The basement, from outside: light wells along the plinth, because a
          cellar with a family in it should be visible from the road. */}
      {[-3.2, 3.2].map((x) => (
        <group key={x} position={[x, 0.38, D / 2 + 0.28]}>
          <mesh>
            <boxGeometry args={[1.1, 0.52, 0.12]} />
            <meshStandardMaterial color="#8f8778" flatShading roughness={1} />
          </mesh>
          <mesh position={[0, 0, 0.07]}>
            <planeGeometry args={[0.9, 0.34]} />
            <meshStandardMaterial
              color="#2b2f38"
              emissive="#ffbe4d"
              emissiveIntensity={0.45}
            />
          </mesh>
          {[-0.22, 0.22].map((bx) => (
            <mesh key={bx} position={[bx, 0, 0.09]}>
              <boxGeometry args={[0.05, 0.34, 0.04]} />
              <meshStandardMaterial color="#6f6a5e" flatShading />
            </mesh>
          ))}
        </group>
      ))}

      {/* And the way the car gets in. The ground falls away on this side,
          which is how a basement garage works anywhere with a slope. */}
      <group position={[W / 2 + 0.02, 0, -1.1]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 1.15, 0]}>
          <boxGeometry args={[3.4, 2.3, 0.16]} />
          <meshStandardMaterial color="#6b727a" flatShading roughness={0.7} />
        </mesh>
        {Array.from({ length: 7 }, (_, i) => (
          <mesh key={i} position={[0, 0.24 + i * 0.31, 0.1]}>
            <boxGeometry args={[3.24, 0.24, 0.06]} />
            <meshStandardMaterial
              color={i % 2 ? '#858d96' : '#767e87'}
              flatShading
              roughness={0.65}
              metalness={0.25}
            />
          </mesh>
        ))}
        <mesh position={[0, 2.42, 0.06]} castShadow>
          <boxGeometry args={[3.8, 0.3, 0.44]} />
          <meshStandardMaterial color="#e6ddca" flatShading roughness={1} />
        </mesh>
        {/* The apron it runs out onto. */}
        <mesh position={[0, 0.03, 1.9]} receiveShadow>
          <boxGeometry args={[3.9, 0.1, 3.6]} />
          <meshStandardMaterial color="#b0a894" flatShading roughness={1} />
        </mesh>
      </group>

      {/* Chimney, tapered, with a cap on it. */}
      <mesh position={[-2.6, H + 2.4, -1.6]} castShadow>
        <cylinderGeometry args={[0.42, 0.52, 2, 4]} />
        <meshStandardMaterial color="#e6ddca" flatShading roughness={1} />
      </mesh>
      <mesh position={[-2.6, H + 3.48, -1.6]}>
        <boxGeometry args={[1.05, 0.2, 1.05]} />
        <meshStandardMaterial color="#a8492f" flatShading roughness={1} />
      </mesh>

      {/* The aerial and the dish, which is the lab downstairs showing on the
          roof: that server has to reach the world somehow. */}
      <mesh position={[2.9, H + 3.1, -2.2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 2.2, 5]} />
        <meshStandardMaterial color="#6f757c" flatShading metalness={0.4} />
      </mesh>
      {[0, 0.34, 0.68].map((y, i) => (
        <mesh key={y} position={[2.9, H + 3.6 + y, -2.2]}>
          <boxGeometry args={[1.5 - i * 0.3, 0.05, 0.05]} />
          <meshStandardMaterial color="#6f757c" flatShading metalness={0.4} />
        </mesh>
      ))}
      <group position={[1.9, H + 1.9, -2.9]} rotation={[-0.7, 0.5, 0]}>
        <mesh castShadow>
          <sphereGeometry
            args={[0.52, 12, 8, 0, Math.PI * 2, 0, Math.PI / 3]}
          />
          <meshStandardMaterial
            color="#e8e3d6"
            side={2}
            flatShading
            roughness={0.8}
          />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 5]} />
          <meshStandardMaterial color="#6f757c" flatShading />
        </mesh>
      </group>

      {/* Pergola over the door, with a vine over that. A flat plank canopy
          is a carport; four rafters and a bougainvillea is a house. */}
      <group position={[0, 0, D / 2 + 1.1]}>
        {[-1.85, 1.85].map((x) => (
          <mesh key={x} position={[x, 1.75, 0.7]} castShadow>
            <boxGeometry args={[0.18, 3.5, 0.18]} />
            <meshStandardMaterial color="#8c6242" flatShading roughness={0.9} />
          </mesh>
        ))}
        {[-1.85, 1.85].map((x) => (
          <mesh key={`b${x}`} position={[x, 3.42, -0.25]} castShadow>
            <boxGeometry args={[0.16, 0.16, 2.1]} />
            <meshStandardMaterial color="#8c6242" flatShading roughness={0.9} />
          </mesh>
        ))}
        {[-0.45, 0.15, 0.75, 1.35].map((z) => (
          <mesh key={z} position={[0, 3.56, z - 0.55]} castShadow>
            <boxGeometry args={[4.1, 0.12, 0.12]} />
            <meshStandardMaterial color="#a0764f" flatShading roughness={0.9} />
          </mesh>
        ))}
        <group ref={vine} position={[0, 3.62, 0.1]}>
          {[
            [-1.7, -0.5],
            [-0.9, 0.5],
            [-0.1, -0.2],
            [0.7, 0.6],
            [1.5, -0.4],
            [1.9, 0.3],
          ].map(([x, z], i) => (
            <group key={i} position={[x, 0, z]}>
              <mesh>
                <icosahedronGeometry args={[0.42, 0]} />
                <meshStandardMaterial
                  color="#3f7a42"
                  flatShading
                  roughness={1}
                />
              </mesh>
              <mesh position={[0.08, -0.26, 0.05]}>
                <icosahedronGeometry args={[0.24, 0]} />
                <meshStandardMaterial
                  color={i % 2 ? '#c9366b' : '#e0567c'}
                  flatShading
                  roughness={1}
                />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* Flower pots by the door, and the number on the wall. */}
      {/* Beside the steps rather than on them, and standing on the path. */}
      {[-2.4, 2.4].map((x) => (
        <group key={x} position={[x, 0, D / 2 + 1.5]}>
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.32, 0.24, 0.55, 8]} />
            <meshStandardMaterial color="#c1714b" flatShading roughness={1} />
          </mesh>
          <mesh position={[0, 0.72, 0]}>
            <icosahedronGeometry args={[0.36, 0]} />
            <meshStandardMaterial color="#e0567c" flatShading roughness={1} />
          </mesh>
        </group>
      ))}
      <mesh position={[1.1, 3.05, D / 2 + 0.04]}>
        <boxGeometry args={[0.34, 0.34, 0.06]} />
        <meshStandardMaterial color="#2f6bb3" flatShading roughness={0.7} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* The Polytechnic — the Averof building, in so many words             */
/* ------------------------------------------------------------------ */

const MARBLE = '#faf3e4'
const STONE = '#e6dbc3'

/**
 * An Ionic column: plinth, moulded base, a shaft with a slight entasis, and
 * a capital with the two volutes that are the whole point of the order.
 *
 * The shaft is a sixteen-sided cylinder rather than a fluted one. Real flutes
 * would be sixteen boxes a column and ninety-six across the portico, and at
 * this distance flat shading on sixteen faces reads as fluting anyway.
 */
function IonicColumn({ x, height }: { x: number; height: number }) {
  const shaft = height - 1.1

  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.15, 0.4, 1.15]} />
        <meshStandardMaterial color={STONE} flatShading roughness={1} />
      </mesh>
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.5, 0.56, 0.24, 16]} />
        <meshStandardMaterial color={STONE} flatShading roughness={0.95} />
      </mesh>

      <mesh position={[0, 0.64 + shaft / 2, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.48, shaft, 16]} />
        <meshStandardMaterial color={MARBLE} flatShading roughness={0.9} />
      </mesh>

      {/* Capital: the echinus, the two scrolls, and the abacus over them. */}
      <group position={[0, 0.64 + shaft, 0]}>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.46, 0.4, 0.24, 16]} />
          <meshStandardMaterial color={MARBLE} flatShading roughness={0.9} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * 0.44, 0.3, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.2, 0.2, 1.02, 10]} />
            <meshStandardMaterial color={MARBLE} flatShading roughness={0.9} />
          </mesh>
        ))}
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.88, 0.18, 1.02]} />
          <meshStandardMaterial color={MARBLE} flatShading roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.48, 0]}>
          <boxGeometry args={[1.16, 0.18, 1.16]} />
          <meshStandardMaterial color={MARBLE} flatShading roughness={0.9} />
        </mesh>
      </group>
    </group>
  )
}

/** A cypress. Two cones and a trunk, and it says Athens on its own. */
function Cypress({ x, z, h = 6.4 }: { x: number; z: number; h?: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.22, 0.8, 6]} />
        <meshStandardMaterial color="#6b5236" flatShading roughness={1} />
      </mesh>
      <mesh position={[0, 0.7 + h * 0.38, 0]} castShadow>
        <coneGeometry args={[0.95, h * 0.78, 7]} />
        <meshStandardMaterial color="#2f5136" flatShading roughness={1} />
      </mesh>
      <mesh position={[0, 0.7 + h * 0.74, 0]} castShadow>
        <coneGeometry args={[0.66, h * 0.44, 7]} />
        <meshStandardMaterial color="#37603e" flatShading roughness={1} />
      </mesh>
    </group>
  )
}

export function UniversityModel() {
  const W = 20.8
  const D = 12.8
  const H = 7
  const pediment = useGable(11.2, 2.4, 1.8)
  const columns = [-4, -2.4, -0.8, 0.8, 2.4, 4]

  return (
    <group>
      {/* Steps. These are load-bearing in more than one sense: the walkable
          terrain has a ramp and a ledge pinned to exactly this geometry, so
          the tread heights and the top landing do not move. */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[0, 0.14 + i * 0.28, D / 2 + 2.6 - i * 0.5]}
          receiveShadow
        >
          <boxGeometry args={[12 - i * 0.6, 0.28, 3.4 - i]} />
          <meshStandardMaterial color="#ded4bd" flatShading roughness={1} />
        </mesh>
      ))}

      {/* The stylobate the whole thing stands on.
          Everything above starts at 0.8 and there was nothing under it but
          the front steps, so from any other side the building hung in the
          air. Its top is 0.84 rather than 0.8: that is where the top step
          lands, and where LEDGES puts the floor you actually walk on, so the
          three of them come out flush. It is carried 0.3 proud of the walls
          on each side, which is what a stylobate does anyway. */}
      <mesh position={[0, 0.42, 0.5]} receiveShadow castShadow>
        <boxGeometry args={[W + 0.6, 0.84, D + 1.6]} />
        <meshStandardMaterial color="#e4dac2" flatShading roughness={1} />
      </mesh>

      <mesh position={[0, H / 2 + 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color="#f2e9d6" flatShading roughness={0.95} />
      </mesh>

      {/* End pavilions, stepped forward off the main block the way the
          Patission front is. Without them it is a shed with a temple on it. */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh
            position={[side * (W / 2 - 2.4), H / 2 + 0.8, 0.5]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[4.8, H, D + 1]} />
            <meshStandardMaterial
              color="#efe4cd"
              flatShading
              roughness={0.95}
            />
          </mesh>
          <mesh position={[side * (W / 2 - 2.4), H + 1.05, 0.5]} castShadow>
            <boxGeometry args={[5.5, 0.6, D + 1.7]} />
            <meshStandardMaterial color="#e0d3b6" flatShading roughness={1} />
          </mesh>
          {/* Pilasters on the corners of each pavilion. */}
          {[-2.1, 2.1].map((dx) => (
            <mesh
              key={dx}
              position={[side * (W / 2 - 2.4) + dx, H / 2 + 0.7, D / 2 + 1.1]}
              castShadow
            >
              <boxGeometry args={[0.6, H - 0.2, 0.26]} />
              <meshStandardMaterial
                color={MARBLE}
                flatShading
                roughness={0.9}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Cornice over the main block, and the set-back attic storey. */}
      <mesh position={[0, H + 1, 0]} castShadow>
        <boxGeometry args={[W + 0.7, 0.6, D + 0.7]} />
        <meshStandardMaterial color="#e0d3b6" flatShading roughness={1} />
      </mesh>
      <mesh position={[0, H + 2.1, 0]} castShadow>
        <boxGeometry args={[W - 5, 1.8, D - 3]} />
        <meshStandardMaterial color="#eee2c9" flatShading roughness={1} />
      </mesh>
      {/* Antefixes, standing on the pavilion cornices. */}
      {[-9.8, -6.2, 6.2, 9.8].map((x) => (
        <mesh key={x} position={[x, H + 1.6, D / 2 + 0.9]} castShadow>
          <coneGeometry args={[0.26, 0.5, 4]} />
          <meshStandardMaterial color={STONE} flatShading roughness={1} />
        </mesh>
      ))}

      {/* The portico. */}
      <group position={[0, 0, D / 2 + 1.4]}>
        {columns.map((x) => (
          <IonicColumn key={x} x={x} height={6.4} />
        ))}

        {/* Entablature: architrave, then the frieze that carries the name,
            then a dentil course under the cornice. */}
        <mesh position={[0, 6.65, 0]} castShadow>
          <boxGeometry args={[10.8, 0.5, 2.6]} />
          <meshStandardMaterial color="#f7efdd" flatShading roughness={0.95} />
        </mesh>
        <mesh position={[0, 7.3, 0]} castShadow>
          <boxGeometry args={[10.6, 0.8, 2.5]} />
          <meshStandardMaterial color="#fbf5e7" flatShading roughness={0.95} />
        </mesh>
        {Array.from({ length: 13 }, (_, i) => (
          <mesh key={i} position={[-4.8 + i * 0.8, 7.82, 1.19]}>
            <boxGeometry args={[0.34, 0.24, 0.2]} />
            <meshStandardMaterial color="#efe6d2" flatShading roughness={1} />
          </mesh>
        ))}
        <mesh position={[0, 8.06, 0]} castShadow>
          <boxGeometry args={[11.6, 0.28, 2.78]} />
          <meshStandardMaterial color="#f0e6d0" flatShading roughness={0.95} />
        </mesh>

        <mesh geometry={pediment} position={[0, 8.2, 0]} castShadow>
          <meshStandardMaterial color="#f4ecd8" flatShading roughness={0.95} />
        </mesh>
        {/* Acroteria: one on the apex, one on each corner. */}
        <mesh position={[0, 10.78, 0]} castShadow>
          <coneGeometry args={[0.42, 0.9, 5]} />
          <meshStandardMaterial color={STONE} flatShading roughness={1} />
        </mesh>
        {[-5.6, 5.6].map((x) => (
          <mesh key={x} position={[x, 8.5, 0]} castShadow>
            <coneGeometry args={[0.34, 0.7, 5]} />
            <meshStandardMaterial color={STONE} flatShading roughness={1} />
          </mesh>
        ))}
        {/* The seal, sunk into a roundel. On bare marble it read as a
            sticker; the tympanum is only 2.4 tall, so the disc is about as
            large as the triangle admits once the rim is allowed for. */}
        <group position={[0, 9.35, 0]}>
          <mesh
            position={[0, 0, 0.86]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          >
            <cylinderGeometry args={[1.14, 1.14, 0.12, 32]} />
            <meshStandardMaterial color="#e6dcc4" flatShading roughness={1} />
          </mesh>
          <mesh position={[0, 0, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.02, 1.02, 0.1, 32]} />
            <meshStandardMaterial color="#d9cdb0" flatShading roughness={1} />
          </mesh>
          <NtuaSeal size={2.1} position={[0, 0, 0.97]} />
        </group>

        {/* The name across the frieze, where it is on the real one.
            It used to sit two centimetres off the stone, which at this
            distance is a z-fight, and it sat under the cornice overhang on
            top of that — between them you could not read a word of it. The
            cornice is trimmed back above and the letters stand well clear. */}
        <TextPlane
          text="NATIONAL TECHNICAL UNIVERSITY OF ATHENS"
          width={10.2}
          aspect={18}
          color="#2f5fa8"
          outline="#fbf5e7"
          position={[0, 7.3, 1.4]}
        />
      </group>

      {/* Facade windows, pedimented on the main floor the way they are on
          the real front. */}
      {[-8.4, -6.6, 6.6, 8.4].map((x) => (
        <group key={x}>
          <Win
            position={[x, 3.4, D / 2 + 1.04]}
            size={[1.2, 2]}
            frame="#c3b394"
            lit={x < 0}
          />
          <mesh position={[x, 4.66, D / 2 + 1.06]} castShadow>
            <boxGeometry args={[1.9, 0.2, 0.34]} />
            <meshStandardMaterial color={MARBLE} flatShading roughness={0.9} />
          </mesh>
          <mesh position={[x, 2.26, D / 2 + 1.06]}>
            <boxGeometry args={[1.7, 0.16, 0.3]} />
            <meshStandardMaterial color={MARBLE} flatShading roughness={0.9} />
          </mesh>
        </group>
      ))}
      {[-8.4, -6.6, 8.4, 6.6].map((x) => (
        <Win
          key={`u${x}`}
          position={[x, 7, D / 2 + 1.04]}
          size={[1.1, 1.4]}
          frame="#c3b394"
        />
      ))}
      {[-4, 0, 4].map((z) => (
        <Win
          key={`s${z}`}
          position={[W / 2 + 0.03, 4.2, z]}
          size={[1.2, 2]}
          rotation={[0, Math.PI / 2, 0]}
          frame="#c3b394"
        />
      ))}

      {/* Two cypresses on the forecourt, which do as much for the address as
          the columns do. */}
      <Cypress x={-7.6} z={D / 2 + 5.2} />
      <Cypress x={7.6} z={D / 2 + 5.2} h={5.6} />

      {/* Foundation stone carrying the school's seal */}
      <group position={[-9.4, 0, 9.6]}>
        <mesh position={[0, 0.16, 0]} receiveShadow>
          <boxGeometry args={[3.2, 0.32, 1]} />
          <meshStandardMaterial color="#cfc2a6" flatShading roughness={1} />
        </mesh>
        <mesh position={[0, 1.7, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 2.8, 0.55]} />
          <meshStandardMaterial color={STONE} flatShading roughness={1} />
        </mesh>
        <mesh position={[0, 3.16, 0]} castShadow>
          <boxGeometry args={[3.1, 0.22, 0.75]} />
          <meshStandardMaterial color="#d8cdb4" flatShading roughness={1} />
        </mesh>
        <NtuaSeal size={2.1} position={[0, 1.78, 0.29]} />
      </group>

      {/* Flagpole, kept clear of the foundation stone. Patission flies the
          Greek flag, not a blue rectangle. */}
      <group position={[9.4, 0, D / 2 + 4]}>
        <mesh position={[0, 3.4, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.11, 6.8, 8]} />
          <meshStandardMaterial
            color="#c9cdd2"
            metalness={0.5}
            roughness={0.4}
          />
        </mesh>
        <mesh position={[0, 6.9, 0]}>
          <sphereGeometry args={[0.13, 8, 6]} />
          <meshStandardMaterial
            color="#f0c14b"
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
        <WavingFlag y={5.8}>
          <GreekFlag width={2.6} />
        </WavingFlag>
      </group>
    </group>
  )
}

/** Hangs any banner off a pole and gives it a lazy wave. */
function WavingFlag({ y, children }: { y: number; children: React.ReactNode }) {
  const group = useRef<Group>(null)
  useFrame((state) => {
    if (!group.current) return
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.9) * 0.14
    group.current.position.z = Math.sin(state.clock.elapsedTime * 2.4) * 0.07
  })
  return (
    <group ref={group} position={[0.06, y, 0]}>
      {children}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Work District — glass tower plus a consulting annex                 */
/* ------------------------------------------------------------------ */

export function WorkModel() {
  const W = 12.8
  const D = 11.8
  /** Shared front-face depth so every facade detail lines up. */
  const FRONT = D / 2 - 0.4

  return (
    <group>
      {/* Plaza slab */}
      <mesh position={[0, 0.06, D / 2 + 1.6]} receiveShadow>
        <boxGeometry args={[W, 0.12, 4]} />
        <meshStandardMaterial color="#d5d8da" flatShading roughness={1} />
      </mesh>

      {/* Main tower — front face sits at z = FRONT */}
      <mesh position={[-2.6, 7, FRONT - 4.75]} castShadow receiveShadow>
        <boxGeometry args={[7.2, 14, 9.5]} />
        <meshStandardMaterial color="#33465c" flatShading roughness={0.5} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[-2.6, 2.6 + i * 2.1, FRONT + 0.07]}>
          <boxGeometry args={[6.4, 1.1, 0.14]} />
          <meshStandardMaterial
            color="#6fe6cf"
            emissive="#2fb59a"
            emissiveIntensity={0.5}
            roughness={0.2}
            metalness={0.3}
          />
        </mesh>
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh
          key={`w${i}`}
          position={[-6.27, 2.6 + i * 2.1, FRONT - 4.75]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <boxGeometry args={[8.4, 1.1, 0.14]} />
          <meshStandardMaterial
            color="#6fe6cf"
            emissive="#2fb59a"
            emissiveIntensity={0.4}
            roughness={0.2}
          />
        </mesh>
      ))}
      <mesh position={[-2.6, 14.2, FRONT - 4.75]} castShadow>
        <boxGeometry args={[7.8, 0.5, 10.1]} />
        <meshStandardMaterial color="#22313f" flatShading roughness={0.7} />
      </mesh>
      <VeltistonMark width={6.6} position={[-2.6, 14.2, FRONT + 0.35]} />
      <mesh position={[-2.6, 15.6, FRONT - 4.75]} castShadow>
        <cylinderGeometry args={[0.09, 0.12, 2.4, 6]} />
        <meshStandardMaterial color="#9aa5ad" metalness={0.6} roughness={0.4} />
      </mesh>
      <Beacon position={[-2.6, 16.9, FRONT - 4.75]} color="#2fb59a" />

      {/* Annex */}
      <mesh position={[3.6, 3.2, FRONT - 3.6]} castShadow receiveShadow>
        <boxGeometry args={[5.2, 6.4, 6.6]} />
        <meshStandardMaterial color="#48627a" flatShading roughness={0.7} />
      </mesh>
      {[1.5, 3.5].map((y) => (
        <mesh key={y} position={[3.6, y, FRONT - 0.23]}>
          <boxGeometry args={[4.4, 0.9, 0.14]} />
          <meshStandardMaterial
            color="#bfe4f7"
            emissive="#4a90c8"
            emissiveIntensity={0.3}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* Tenant board on the forecourt, at reading height */}
      <group position={[4.6, 0, 6.2]}>
        <mesh position={[0, 0.14, 0]} receiveShadow>
          <boxGeometry args={[5, 0.28, 1.1]} />
          <meshStandardMaterial color="#d5d8da" flatShading roughness={1} />
        </mesh>
        <mesh position={[0, 2.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.6, 3.6, 0.5]} />
          <meshStandardMaterial color="#2b3a49" flatShading roughness={0.7} />
        </mesh>
        <VeltistonMark width={3.9} position={[0, 2.85, 0.27]} />
        <mesh position={[0, 2.15, 0.27]}>
          <planeGeometry args={[3.7, 0.07]} />
          <meshBasicMaterial color="#2fb59a" />
        </mesh>
        <IbmMark width={2.5} position={[0, 1.35, 0.27]} />
      </group>

      {/* Entrance canopy + doors */}
      <mesh position={[-2.6, 3.6, FRONT + 1.1]} castShadow>
        <boxGeometry args={[6, 0.24, 2.8]} />
        <meshStandardMaterial color="#2fb59a" flatShading roughness={0.6} />
      </mesh>
      {[-5, -0.2].map((x) => (
        <mesh key={x} position={[x, 1.8, FRONT + 2.3]}>
          <cylinderGeometry args={[0.08, 0.08, 3.6, 6]} />
          <meshStandardMaterial
            color="#2fb59a"
            metalness={0.3}
            roughness={0.5}
          />
        </mesh>
      ))}
      <SlidingDoors buildingId="work" x={-2.6} z={FRONT + 0.09} width={3.4} />
    </group>
  )
}

/**
 * Glass that slides apart as somebody walks up to it.
 *
 * Two leaves rather than one pane, because a sliding door is only legible as
 * one while you can see the join travel. They are driven straight off the
 * entrance in the store — the same clock the walk is on — so the glass is
 * always exactly as open as the walk expects it to be.
 */
function SlidingDoors({
  buildingId,
  x,
  z,
  width,
}: {
  buildingId: string
  x: number
  z: number
  width: number
}) {
  const left = useRef<Group>(null)
  const right = useRef<Group>(null)
  const leaf = width / 2
  /* The travel under way. game/doors.ts owns what it means and how it runs. */
  const move = useRef(doorAtRest())

  useFrame((_, delta) => {
    if (!left.current || !right.current) return
    const { nearby, area } = useGame.getState()
    /*
     * The whole of the door's behaviour: how near he is, and nothing else.
     *
     * Wide once the sensor has him — `silent` is set only on a door that
     * opens by itself, so this is already the daylight-and-unlocked case and
     * needs no second opinion about it — ajar while he is merely in range,
     * and shut when he walks off. He is never moved by any of it: he walks in
     * through the opening himself, on the same controls he had on the plaza.
     *
     * Except at the one moment that matters. Crossing the doorstep clears
     * `nearby` — the prompt has to go before the lobby arrives — and reading
     * the target off that alone had the glass start shutting on the very
     * stride he walked through it. So while he is actually inside this
     * building the leaves stand wide: a door does not close on the man it
     * just admitted.
     *
     * `area` and not `mode`: he is inside when he is in the lobby, not
     * whenever the controls are elsewhere. Reading a mode here would hold the
     * glass open across every journal and map opened out on the plaza.
     */
    const inside = area === buildingId
    const sensed = nearby?.id === buildingId
    const target =
      sensed || inside ? (sensed && !nearby.silent ? DOOR_AJAR : DOOR_OPEN) : 0

    /* How far open the glass stands this frame, timed so it reaches its stop
       in DOOR_SLIDE on any machine. See slideDoor for why it is not a lerp. */
    const want = leaf * 0.92 * slideDoor(move.current, target, delta)
    left.current.position.x = -want
    right.current.position.x = want
  })

  return (
    <group position={[x, 1.7, z]}>
      <DoorLeaf side="left" leaf={leaf} ref={left} />
      <DoorLeaf side="right" leaf={leaf} ref={right} />
    </group>
  )
}

/**
 * One leaf of a sliding door.
 *
 * The two leaves are the same glass mirrored, and they used to be drawn by
 * mapping over the pair of refs. That read as accessing a ref during render
 * to anything looking at the shape rather than at what it does — the refs are
 * only ever attached here and read in the frame loop — and a component that
 * takes its ref as a prop says the same thing without the ambiguity.
 */
function DoorLeaf({
  side,
  leaf,
  ref,
}: {
  side: 'left' | 'right'
  leaf: number
  ref: React.Ref<Group>
}) {
  const near = side === 'left'
  return (
    <group ref={ref}>
      <mesh position={[near ? -leaf / 2 : leaf / 2, 0, 0]}>
        <boxGeometry args={[leaf, 3.4, 0.12]} />
        <meshStandardMaterial
          color="#d6f5ee"
          transparent
          opacity={0.8}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>
      {/* The stile on the leading edge: the join you watch travel. */}
      <mesh position={[near ? -0.06 : 0.06, 0, 0.08]}>
        <boxGeometry args={[0.12, 3.4, 0.06]} />
        <meshStandardMaterial color="#22313f" />
      </mesh>
    </group>
  )
}

function Beacon({
  position,
  color,
}: {
  position: [number, number, number]
  color: string
}) {
  const mesh = useRef<Mesh>(null)
  useFrame((state) => {
    if (!mesh.current) return
    const pulse = (Math.sin(state.clock.elapsedTime * 3) + 1) / 2
    mesh.current.scale.setScalar(0.8 + pulse * 0.5)
    const mat = mesh.current.material as MeshStandardMaterial
    mat.emissiveIntensity = 0.6 + pulse * 2
  })
  return (
    <mesh ref={mesh} position={position}>
      <sphereGeometry args={[0.22, 10, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.5}
      />
    </mesh>
  )
}

/* ------------------------------------------------------------------ */
/* Army Camp — barracks, tents, watchtower                             */
/* ------------------------------------------------------------------ */

export function ArmyModel() {
  const D = 10.8
  const barracksRoof = useGable(8.4, 1.5, 7.4)

  return (
    <group>
      {/* Barracks */}
      <group position={[-2.4, 0, -1]}>
        <mesh position={[0, 1.7, 0]} castShadow receiveShadow>
          <boxGeometry args={[8.2, 3.4, 7.2]} />
          <meshStandardMaterial color="#7d8560" flatShading roughness={1} />
        </mesh>
        <mesh geometry={barracksRoof} position={[0, 3.4, 0]} castShadow>
          <meshStandardMaterial color="#4f5a3a" flatShading roughness={1} />
        </mesh>
        <Door
          position={[0, 1.1, 3.62]}
          width={1.3}
          height={2.2}
          color="#4a5233"
        />
        <Win
          position={[-2.6, 2, 3.62]}
          size={[0.9, 0.9]}
          frame="#5c6642"
          glass="#cbd6c4"
        />
        <Win
          position={[2.6, 2, 3.62]}
          size={[0.9, 0.9]}
          frame="#5c6642"
          glass="#cbd6c4"
        />
      </group>

      {/* Tents */}
      {[
        [4.2, 1.6],
        [4.2, -3.4],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh
            position={[0, 1.1, 0]}
            rotation={[0, Math.PI / 4, 0]}
            castShadow
          >
            <coneGeometry args={[2.1, 2.2, 4]} />
            <meshStandardMaterial color="#69754a" flatShading roughness={1} />
          </mesh>
          <mesh position={[0, 0.55, 1.35]}>
            <boxGeometry args={[0.9, 1.1, 0.08]} />
            <meshStandardMaterial color="#3f4a2c" flatShading roughness={1} />
          </mesh>
        </group>
      ))}

      {/* Watchtower */}
      <group position={[-5.4, 0, 3.6]}>
        {[
          [-0.8, -0.8],
          [0.8, -0.8],
          [-0.8, 0.8],
          [0.8, 0.8],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 2.4, z]} castShadow>
            <boxGeometry args={[0.2, 4.8, 0.2]} />
            <meshStandardMaterial color="#6b5a3c" flatShading roughness={1} />
          </mesh>
        ))}
        <mesh position={[0, 4.9, 0]} castShadow>
          <boxGeometry args={[2.4, 0.2, 2.4]} />
          <meshStandardMaterial color="#7a6642" flatShading roughness={1} />
        </mesh>
        <mesh position={[0, 5.5, 0]} castShadow>
          <boxGeometry args={[2.2, 1, 2.2]} />
          <meshStandardMaterial
            color="#8a7a52"
            flatShading
            roughness={1}
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh position={[0, 6.3, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[2, 0.9, 4]} />
          <meshStandardMaterial color="#4f5a3a" flatShading roughness={1} />
        </mesh>
      </group>

      {/* Sandbags along the front */}
      {Array.from({ length: 7 }, (_, i) => (
        <mesh
          key={i}
          position={[-5 + i * 1.7, 0.28, D / 2 - 0.4]}
          rotation={[0, i * 0.4, 0]}
          castShadow
        >
          <capsuleGeometry args={[0.28, 0.55, 3, 6]} />
          <meshStandardMaterial color="#a3936a" flatShading roughness={1} />
        </mesh>
      ))}

      {/* Flagpole */}
      <group position={[5.2, 0, D / 2 - 1.4]}>
        <mesh position={[0, 3.6, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 7.2, 8]} />
          <meshStandardMaterial
            color="#c9cdd2"
            metalness={0.5}
            roughness={0.4}
          />
        </mesh>
        <mesh position={[0, 7.3, 0]}>
          <sphereGeometry args={[0.14, 8, 6]} />
          <meshStandardMaterial
            color="#f0c14b"
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
        <WavingFlag y={6.1}>
          <GreekFlag width={2.6} />
        </WavingFlag>
      </group>

      {/* Gate posts */}
      {[-2.2, 2.2].map((x) => (
        <mesh key={x} position={[x - 2.4, 1.4, D / 2 + 0.6]} castShadow>
          <boxGeometry args={[0.4, 2.8, 0.4]} />
          <meshStandardMaterial color="#5c6642" flatShading roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Town School — bell tower and a yard                                 */
/* ------------------------------------------------------------------ */

export function SchoolModel() {
  const W = 12.8
  const D = 9.8
  const H = 5
  const roof = useGable(W + 0.8, 2.2, D + 0.8)

  return (
    <group>
      <mesh position={[0, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color="#e8b672" flatShading roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.5, D / 2 + 0.02]}>
        <boxGeometry args={[W, 1, 0.14]} />
        <meshStandardMaterial color="#c98f4f" flatShading roughness={1} />
      </mesh>
      <mesh geometry={roof} position={[0, H, 0]} castShadow>
        <meshStandardMaterial color="#a8452f" flatShading roughness={0.95} />
      </mesh>

      <Door
        position={[0, 1.3, D / 2 + 0.02]}
        width={1.8}
        height={2.6}
        color="#7d4a2c"
      />
      {[-4.4, -2.4, 2.4, 4.4].map((x) => (
        <Win
          key={x}
          position={[x, 2.9, D / 2 + 0.02]}
          size={[1.2, 1.6]}
          frame="#f2e2c4"
          lit={x === -2.4 || x === 4.4}
        />
      ))}
      {[-2.6, 2.6].map((z) => (
        <Win
          key={`s${z}`}
          position={[W / 2 + 0.02, 2.9, z]}
          size={[1.2, 1.6]}
          rotation={[0, Math.PI / 2, 0]}
          frame="#f2e2c4"
        />
      ))}

      {/* Bell tower */}
      <group position={[0, 0, -0.4]}>
        <mesh position={[0, H + 1.6, 0]} castShadow>
          <boxGeometry args={[2.6, 3.2, 2.6]} />
          <meshStandardMaterial color="#f2e2c4" flatShading roughness={0.95} />
        </mesh>
        <mesh position={[0, H + 1.9, 1.32]}>
          <circleGeometry args={[0.75, 20]} />
          <meshStandardMaterial color="#fdf8ec" roughness={0.6} />
        </mesh>
        <mesh position={[0, H + 1.9, 1.34]}>
          <ringGeometry args={[0.66, 0.75, 20]} />
          <meshStandardMaterial color="#7d4a2c" />
        </mesh>
        <Clock position={[0, H + 1.9, 1.36]} />
        <mesh
          position={[0, H + 4, 0]}
          rotation={[0, Math.PI / 4, 0]}
          castShadow
        >
          <coneGeometry args={[2.2, 2, 4]} />
          <meshStandardMaterial color="#a8452f" flatShading roughness={0.95} />
        </mesh>
        <mesh position={[0, H + 5.3, 0]}>
          <sphereGeometry args={[0.22, 8, 6]} />
          <meshStandardMaterial
            color="#f0c14b"
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* Yard: basketball hoop */}
      <group position={[6.2, 0, D / 2 + 3.4]}>
        <mesh position={[0, 1.6, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.11, 3.2, 8]} />
          <meshStandardMaterial
            color="#8d979d"
            metalness={0.4}
            roughness={0.5}
          />
        </mesh>
        <mesh position={[0, 3.3, 0.3]} castShadow>
          <boxGeometry args={[1.5, 1, 0.08]} />
          <meshStandardMaterial color="#fdf8ec" roughness={0.8} />
        </mesh>
        <mesh position={[0, 2.9, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.3, 0.05, 6, 14]} />
          <meshStandardMaterial color="#e0552f" roughness={0.6} />
        </mesh>
      </group>
    </group>
  )
}

function Clock({ position }: { position: [number, number, number] }) {
  const hour = useRef<Mesh>(null)
  const minute = useRef<Mesh>(null)
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (minute.current) minute.current.rotation.z = -t * 0.35
    if (hour.current) hour.current.rotation.z = -t * 0.03
  })
  return (
    <group position={position}>
      <mesh ref={minute}>
        <boxGeometry args={[0.06, 1.1, 0.02]} />
        <meshStandardMaterial color="#3a2a1d" />
      </mesh>
      <mesh ref={hour}>
        <boxGeometry args={[0.07, 0.7, 0.02]} />
        <meshStandardMaterial color="#3a2a1d" />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Radio Center — station, dish and lattice mast                       */
/* ------------------------------------------------------------------ */

export function RadioModel() {
  const D = 7.8
  const mast = useRef<import('three').Group>(null)

  useFrame((state) => {
    if (mast.current) {
      mast.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.3
    }
  })

  return (
    <group>
      <mesh position={[0, 2.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.9, 4.1, 4.2, 12]} />
        <meshStandardMaterial color="#efe6f2" flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0, 4.4, 0]} castShadow>
        <cylinderGeometry args={[4.4, 4.4, 0.4, 12]} />
        <meshStandardMaterial color="#8e4fa8" flatShading roughness={0.8} />
      </mesh>
      <mesh position={[0, 5, 0]} castShadow>
        <cylinderGeometry args={[2.6, 3.4, 1.2, 12]} />
        <meshStandardMaterial color="#b95fd0" flatShading roughness={0.85} />
      </mesh>

      <Door
        position={[0, 1.2, D / 2 - 0.05]}
        width={1.5}
        height={2.4}
        color="#7a3f92"
      />
      {[-2.2, 2.2].map((x) => (
        <Win
          key={x}
          position={[x, 2.6, D / 2 - 1.1]}
          size={[1, 1]}
          frame="#c9a6d6"
          lit
        />
      ))}

      {/* Lattice mast */}
      <group position={[0, 0, -2.6]}>
        {Array.from({ length: 9 }, (_, i) => (
          <mesh key={i} position={[0, 6 + i * 1.4, 0]}>
            <boxGeometry args={[1.5 - i * 0.13, 0.1, 1.5 - i * 0.13]} />
            <meshStandardMaterial color="#c0392b" flatShading roughness={0.7} />
          </mesh>
        ))}
        {[
          [-0.62, -0.62],
          [0.62, -0.62],
          [-0.62, 0.62],
          [0.62, 0.62],
        ].map(([x, z], i) => (
          <mesh key={`l${i}`} position={[x * 0.7, 12, z * 0.7]} castShadow>
            <cylinderGeometry args={[0.06, 0.1, 13, 5]} />
            <meshStandardMaterial
              color="#d0d5d8"
              metalness={0.5}
              roughness={0.4}
            />
          </mesh>
        ))}
        <Beacon position={[0, 18.8, 0]} color="#ff4d4d" />
        <mesh position={[0, 18.2, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.6, 5]} />
          <meshStandardMaterial color="#d0d5d8" metalness={0.5} />
        </mesh>
      </group>

      {/* Satellite dish */}
      <group ref={mast} position={[2.9, 6.2, 0.8]}>
        <mesh rotation={[-0.9, 0, 0]} castShadow>
          <sphereGeometry
            args={[1.5, 14, 10, 0, Math.PI * 2, 0, Math.PI / 3]}
          />
          <meshStandardMaterial
            color="#f4f0f6"
            side={2}
            flatShading
            roughness={0.7}
          />
        </mesh>
        <mesh position={[0, 0.5, 0.5]}>
          <cylinderGeometry args={[0.07, 0.07, 1.2, 6]} />
          <meshStandardMaterial color="#8d979d" metalness={0.5} />
        </mesh>
      </group>

      {/* Signal rings */}
      <SignalRings />
    </group>
  )
}

function SignalRings() {
  const group = useRef<import('three').Group>(null)
  useFrame((state) => {
    if (!group.current) return
    group.current.children.forEach((child, i) => {
      const t = (state.clock.elapsedTime * 0.6 + i * 0.33) % 1
      child.scale.setScalar(0.3 + t * 4)
      const mesh = child as Mesh
      const mat = mesh.material as MeshBasicMaterial
      mat.opacity = (1 - t) * 0.5
    })
  })
  return (
    <group ref={group} position={[0, 19, -2.6]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.85, 1, 18]} />
          <meshBasicMaterial
            color="#ff8080"
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* The Old Lighthouse — the locked reward on the north-west cape       */
/* ------------------------------------------------------------------ */

export function LighthouseModel() {
  const beam = useRef<Group>(null)
  const bands = [0, 1, 2, 3, 4, 5]

  useFrame((state) => {
    if (beam.current) beam.current.rotation.y = state.clock.elapsedTime * 0.55
  })

  return (
    <group>
      {/* Rocky outcrop it stands on */}
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <cylinderGeometry args={[6.4, 7.6, 1.6, 12]} />
        <meshStandardMaterial color="#8d949a" flatShading roughness={1} />
      </mesh>

      {/* Tapered tower in painted bands */}
      {bands.map((i) => (
        <mesh key={i} position={[0, 1.4 + i * 2.6, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[3.5 - i * 0.34, 3.85 - i * 0.34, 2.6, 16]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#f6f1e4' : '#c0392b'}
            flatShading
            roughness={0.9}
          />
        </mesh>
      ))}

      {/* Gallery deck and railing */}
      <mesh position={[0, 17.1, 0]} castShadow>
        <cylinderGeometry args={[2.9, 2.4, 0.4, 16]} />
        <meshStandardMaterial color="#4a5057" flatShading roughness={0.8} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 2.6, 17.8, Math.sin(a) * 2.6]}>
            <boxGeometry args={[0.1, 1, 0.1]} />
            <meshStandardMaterial color="#4a5057" flatShading />
          </mesh>
        )
      })}
      <mesh position={[0, 18.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.6, 0.07, 6, 20]} />
        <meshStandardMaterial color="#4a5057" flatShading />
      </mesh>

      {/* Lantern room */}
      <mesh position={[0, 19.4, 0]} castShadow>
        <cylinderGeometry args={[1.7, 1.7, 2.4, 12]} />
        <meshStandardMaterial
          color="#ffe9a8"
          emissive="#ffbe4d"
          emissiveIntensity={0.9}
          transparent
          opacity={0.75}
          roughness={0.2}
        />
      </mesh>
      <group ref={beam} position={[0, 19.4, 0]}>
        <mesh position={[0, 0, 5]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[1.7, 11, 4, 1, true]} />
          <meshBasicMaterial
            color="#ffe9a8"
            transparent
            opacity={0.16}
            depthWrite={false}
            side={2}
          />
        </mesh>
      </group>
      <mesh position={[0, 21, 0]} castShadow>
        <coneGeometry args={[2.2, 1.6, 12]} />
        <meshStandardMaterial color="#2f3a44" flatShading roughness={0.8} />
      </mesh>
      <mesh position={[0, 22.2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 1, 6]} />
        <meshStandardMaterial color="#9aa5ad" metalness={0.6} />
      </mesh>

      {/* Keeper's door, facing the road */}
      <Door
        position={[0, 1.4, 3.75]}
        width={1.6}
        height={2.8}
        color="#7a4a2c"
      />

      {/* Keeper's cottage tucked against the base */}
      <group position={[5.4, 0, 2.6]} rotation={[0, -0.5, 0]}>
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[5, 3, 4.2]} />
          <meshStandardMaterial color="#efe4cd" flatShading roughness={0.95} />
        </mesh>
        <mesh position={[0, 3.4, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[3.7, 1.6, 4]} />
          <meshStandardMaterial color="#8d4a33" flatShading roughness={0.95} />
        </mesh>
        <Win position={[0, 1.7, 2.13]} size={[1, 1]} frame="#b08a5c" lit />
      </group>
    </group>
  )
}
