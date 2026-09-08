import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { INTERIOR_BY_ID } from '../data/interiors'
import { WALL_HEIGHT } from '../game/interior'
import { useGame } from '../state/store'
import { InteriorFurniture } from './InteriorProps'
import { Npcs } from './Npcs'
import { Player } from './Player'
import { TextPlane } from './TextSign'
import type { Exhibit, Interior as InteriorData } from '../types'

const DOOR_WIDTH = 4

export function Interior({ id }: { id: string }) {
  const interior = INTERIOR_BY_ID.get(id)
  if (!interior) return null

  return (
    <>
      <color attach="background" args={['#1b1622']} />
      <ambientLight intensity={0.9} />
      <hemisphereLight args={['#fff4e2', '#4a4152', 0.7]} />
      <directionalLight position={[8, 18, 10]} intensity={1.1} color="#fff2dd" />
      <directionalLight position={[-10, 14, -8]} intensity={0.45} color="#bcd4ff" />

      <Room interior={interior} />
      <InteriorFurniture props={interior.props} />
      {interior.exhibits.map((exhibit) => (
        <ExhibitPiece
          key={exhibit.id}
          exhibit={exhibit}
          accent={interior.accent}
        />
      ))}
      <ExitPad interior={interior} />
      <Npcs area={id} />
      <Player />
    </>
  )
}

/** Floor, skirting and four walls — the near ones fade out of the way. */
function Room({ interior }: { interior: InteriorData }) {
  const [hx, hz] = interior.half
  const walls = useRef<Group>(null)
  const camera = useThree((s) => s.camera)

  useFrame(() => {
    if (!walls.current) return
    for (const wall of walls.current.children) {
      const side = wall.userData.side as string
      wall.visible =
        side === 'north'
          ? camera.position.z > -hz
          : side === 'south'
            ? camera.position.z < hz
            : side === 'east'
              ? camera.position.x < hx
              : camera.position.x > -hx
    }
  })

  const wallMat = (
    <meshStandardMaterial color={interior.wall} flatShading roughness={0.95} />
  )

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[hx * 2, hz * 2]} />
        <meshStandardMaterial color={interior.floor} roughness={1} />
      </mesh>

      <group ref={walls}>
        <mesh
          userData={{ side: 'north' }}
          position={[0, WALL_HEIGHT / 2, -hz - 0.2]}
          receiveShadow
        >
          <boxGeometry args={[hx * 2 + 0.8, WALL_HEIGHT, 0.4]} />
          {wallMat}
        </mesh>
        <mesh
          userData={{ side: 'east' }}
          position={[hx + 0.2, WALL_HEIGHT / 2, 0]}
          receiveShadow
        >
          <boxGeometry args={[0.4, WALL_HEIGHT, hz * 2 + 0.8]} />
          {wallMat}
        </mesh>
        <mesh
          userData={{ side: 'west' }}
          position={[-hx - 0.2, WALL_HEIGHT / 2, 0]}
          receiveShadow
        >
          <boxGeometry args={[0.4, WALL_HEIGHT, hz * 2 + 0.8]} />
          {wallMat}
        </mesh>
        {/* South wall, split around the doorway */}
        <group userData={{ side: 'south' }}>
          {[-1, 1].map((sign) => {
            const width = hx - DOOR_WIDTH / 2
            return (
              <mesh
                key={sign}
                position={[
                  sign * (DOOR_WIDTH / 2 + width / 2),
                  WALL_HEIGHT / 2,
                  hz + 0.2,
                ]}
                receiveShadow
              >
                <boxGeometry args={[width, WALL_HEIGHT, 0.4]} />
                {wallMat}
              </mesh>
            )
          })}
          <mesh position={[0, WALL_HEIGHT - 0.5, hz + 0.2]}>
            <boxGeometry args={[DOOR_WIDTH, 1, 0.4]} />
            {wallMat}
          </mesh>
        </group>
      </group>

      {/* Skirting picks out the room's accent colour */}
      {[
        { p: [0, 0.16, -hz - 0.02] as const, a: [hx * 2, 0.32, 0.16] as const },
        { p: [hx + 0.02, 0.16, 0] as const, a: [0.16, 0.32, hz * 2] as const },
        { p: [-hx - 0.02, 0.16, 0] as const, a: [0.16, 0.32, hz * 2] as const },
      ].map((s, i) => (
        <mesh key={i} position={[...s.p]}>
          <boxGeometry args={[...s.a]} />
          <meshStandardMaterial color={interior.accent} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function ExitPad({ interior }: { interior: InteriorData }) {
  const ring = useRef<Mesh>(null)
  const active = useGame((s) => s.nearby?.id === 'exit')
  const z = interior.half[1] - 1.8

  useFrame((state) => {
    if (!ring.current) return
    const pulse = (Math.sin(state.clock.elapsedTime * 2.4) + 1) / 2
    ring.current.scale.setScalar((active ? 1.15 : 1) + pulse * 0.08)
  })

  return (
    <group position={[0, 0, z]}>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[1.1, 1.6, 28]} />
        <meshBasicMaterial
          color="#ffd166"
          transparent
          opacity={0.75}
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-4}
          polygonOffsetUnits={-4}
        />
      </mesh>
      <TextPlane
        text="Way out"
        width={3}
        aspect={4.4}
        color="#ffe9c4"
        outline="rgba(0,0,0,0.6)"
        position={[0, 3.4, 0]}
      />
    </group>
  )
}

/* ---------------------------- the exhibits --------------------------- */

function ExhibitPiece({
  exhibit,
  accent,
}: {
  exhibit: Exhibit
  accent: string
}) {
  const taken = useGame((s) =>
    exhibit.keyId ? Boolean(s.keys[exhibit.keyId]) : false,
  )
  const active = useGame((s) => s.nearby?.id === exhibit.id)

  return (
    <group
      position={[exhibit.position[0], 0, exhibit.position[1]]}
      rotation={[0, exhibit.rotation ?? 0, 0]}
    >
      {exhibit.kind === 'key' ? (
        <KeyStand taken={taken} active={active} accent={accent} />
      ) : exhibit.kind === 'case' ? (
        <DisplayCase accent={accent} />
      ) : exhibit.kind === 'terminal' ? (
        <Terminal accent={accent} />
      ) : exhibit.kind === 'radio' ? (
        <Transmitter accent={accent} />
      ) : exhibit.kind === 'cv' ? (
        <Logbook accent={accent} />
      ) : (
        <NoticeBoard accent={accent} />
      )}
      {active && <Halo accent={accent} />}
    </group>
  )
}

function Halo({ accent }: { accent: string }) {
  const ring = useRef<Mesh>(null)
  useFrame((state) => {
    if (ring.current) {
      ring.current.rotation.z = state.clock.elapsedTime * 0.8
    }
  })
  return (
    <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
      <ringGeometry args={[1.1, 1.4, 24, 1, 0, Math.PI * 1.5]} />
      <meshBasicMaterial color={accent} transparent opacity={0.8} depthWrite={false} />
    </mesh>
  )
}

function NoticeBoard({ accent }: { accent: string }) {
  return (
    <group>
      <mesh position={[0, 2.1, 0]} castShadow>
        <boxGeometry args={[3.2, 2.2, 0.18]} />
        <meshStandardMaterial color="#8a6642" flatShading roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.1, 0.11]}>
        <planeGeometry args={[2.9, 1.9]} />
        <meshStandardMaterial color={accent} roughness={0.85} />
      </mesh>
      {[
        [-0.8, 0.45],
        [0.7, 0.35],
        [-0.5, -0.35],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, 2.1 + y, 0.13]}>
          <planeGeometry args={[1.1, 0.55]} />
          <meshStandardMaterial color="#fdf7e9" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function DisplayCase({ accent }: { accent: string }) {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 1, 1.2]} />
        <meshStandardMaterial color="#7d5a3a" flatShading roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.75, 0]}>
        <boxGeometry args={[2.2, 1.5, 1]} />
        <meshStandardMaterial
          color="#d8ecf5"
          transparent
          opacity={0.32}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.9, 0.5, 0.5]} />
        <meshStandardMaterial color={accent} flatShading roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.55, 0]}>
        <boxGeometry args={[2.3, 0.12, 1.1]} />
        <meshStandardMaterial color="#5c4326" flatShading />
      </mesh>
    </group>
  )
}

function Terminal({ accent }: { accent: string }) {
  return (
    <group>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[1.8, 1.1, 0.9]} />
        <meshStandardMaterial color="#3a4350" flatShading roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.6, 0]} rotation={[-0.25, 0, 0]} castShadow>
        <boxGeometry args={[1.9, 1.2, 0.12]} />
        <meshStandardMaterial color="#22313f" flatShading />
      </mesh>
      <mesh position={[0, 1.63, 0.09]} rotation={[-0.25, 0, 0]}>
        <planeGeometry args={[1.7, 1]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

function Transmitter({ accent }: { accent: string }) {
  const dish = useRef<Group>(null)
  useFrame((state) => {
    if (dish.current) {
      dish.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.7) * 0.25
    }
  })
  return (
    <group>
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 2.2, 1.4]} />
        <meshStandardMaterial color="#4a3f57" flatShading roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.5, 0.73]}>
        <planeGeometry args={[2.4, 0.9]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} />
      </mesh>
      {[-1.5, 1.5].map((x) => (
        <mesh key={x} position={[x, 0.8, 0.73]}>
          <circleGeometry args={[0.34, 16]} />
          <meshStandardMaterial color="#2f2a38" roughness={0.8} />
        </mesh>
      ))}
      <group ref={dish} position={[0, 2.6, 0]}>
        <mesh rotation={[-0.9, 0, 0]} castShadow>
          <sphereGeometry args={[0.9, 14, 10, 0, Math.PI * 2, 0, Math.PI / 3]} />
          <meshStandardMaterial color="#f4f0f6" side={2} flatShading roughness={0.7} />
        </mesh>
      </group>
    </group>
  )
}

function Logbook({ accent }: { accent: string }) {
  const book = useRef<Group>(null)
  useFrame((state) => {
    if (book.current) {
      book.current.position.y = 1.28 + Math.sin(state.clock.elapsedTime * 1.4) * 0.04
    }
  })
  return (
    <group>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[1.6, 1.2, 1]} />
        <meshStandardMaterial color="#8a6642" flatShading roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.24, -0.1]} rotation={[-0.4, 0, 0]} castShadow>
        <boxGeometry args={[1.7, 0.1, 1]} />
        <meshStandardMaterial color="#a97c4e" flatShading />
      </mesh>
      <group ref={book} position={[0, 1.28, 0]} rotation={[-0.4, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 0.16, 0.8]} />
          <meshStandardMaterial color={accent} flatShading roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[1.1, 0.06, 0.72]} />
          <meshStandardMaterial color="#fdf7e9" roughness={0.9} />
        </mesh>
      </group>
      <pointLight position={[0, 2.4, 0.6]} intensity={6} distance={7} color="#ffdca8" />
    </group>
  )
}

function KeyStand({
  taken,
  active,
  accent,
}: {
  taken: boolean
  active: boolean
  accent: string
}) {
  const key = useRef<Group>(null)
  useFrame((state) => {
    if (!key.current) return
    const t = state.clock.elapsedTime
    key.current.rotation.y = t * 1.2
    key.current.position.y = 1.7 + Math.sin(t * 1.8) * 0.12
    key.current.scale.setScalar(active ? 1.15 : 1)
  })

  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.85, 1, 10]} />
        <meshStandardMaterial color="#7d5a3a" flatShading roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.03, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.1, 10]} />
        <meshStandardMaterial color="#5c4326" flatShading />
      </mesh>

      {taken ? (
        <mesh position={[0, 1.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.5, 16]} />
          <meshStandardMaterial color="#3d3227" roughness={1} />
        </mesh>
      ) : (
        <>
          <group ref={key} position={[0, 1.7, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <torusGeometry args={[0.22, 0.07, 6, 14]} />
              <meshStandardMaterial
                color="#f0c14b"
                metalness={0.7}
                roughness={0.28}
                emissive="#8a6a10"
                emissiveIntensity={0.35}
              />
            </mesh>
            <mesh position={[0, -0.45, 0]} castShadow>
              <boxGeometry args={[0.1, 0.7, 0.1]} />
              <meshStandardMaterial color="#f0c14b" metalness={0.7} roughness={0.28} />
            </mesh>
            {[-0.62, -0.75].map((y) => (
              <mesh key={y} position={[0.16, y, 0]}>
                <boxGeometry args={[0.24, 0.1, 0.1]} />
                <meshStandardMaterial color="#f0c14b" metalness={0.7} roughness={0.28} />
              </mesh>
            ))}
          </group>
          <pointLight position={[0, 1.8, 0]} intensity={5} distance={6} color={accent} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
            <ringGeometry args={[1, 1.35, 24]} />
            <meshBasicMaterial
              color={accent}
              transparent
              opacity={0.5}
              depthWrite={false}
            />
          </mesh>
        </>
      )}
    </group>
  )
}
