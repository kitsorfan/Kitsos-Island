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
import type { Exhibit, Interior as InteriorData, InteriorLink } from '../types'

const DOOR_WIDTH = 4

export function Interior({ id }: { id: string }) {
  const interior = INTERIOR_BY_ID.get(id)
  const secrets = useGame((s) => s.secrets)
  if (!interior) return null

  // Underground there is no sun and no sky: the light comes off whatever is
  // screwed to the joists, so it is warmer, flatter and lower.
  const under = Boolean(interior.underground)

  return (
    <>
      <color attach="background" args={[under ? '#120f18' : '#1b1622']} />
      <ambientLight intensity={under ? 0.62 : 0.9} />
      <hemisphereLight
        args={under ? ['#ffe0b4', '#2b2536', 0.5] : ['#fff4e2', '#4a4152', 0.7]}
      />
      <directionalLight
        position={[8, 18, 10]}
        intensity={under ? 0.55 : 1.1}
        color={under ? '#ffe6c0' : '#fff2dd'}
      />
      <directionalLight
        position={[-10, 14, -8]}
        intensity={under ? 0.3 : 0.45}
        color={under ? '#9fb2d8' : '#bcd4ff'}
      />

      <Room interior={interior} />
      <InteriorFurniture props={interior.props} />
      {(interior.links ?? []).map((link) => (
        <LinkPiece
          key={link.id}
          link={link}
          accent={interior.accent}
          shown={!link.needs || Boolean(secrets[link.needs])}
        />
      ))}
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
  const night = useGame((s) => s.night)

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
        {/* Windows go in the wall group so they fade with the wall they are
            cut into, rather than hanging in mid air once it goes. */}
        {(interior.windows ?? []).map((w, i) => (
          <group key={i} userData={{ side: w.side }}>
            <Window side={w.side} at={w.at} hx={hx} hz={hz} night={night} />
          </group>
        ))}
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

      {/* Down here the ceiling is the floor above: joists, and a strip
          light screwed between them every so often. */}
      {interior.underground && (
        <group>
          {Array.from({ length: Math.round(hx / 2.6) * 2 + 1 }, (_, i) => {
            const x = (i - Math.round(hx / 2.6)) * 2.6
            return (
              <mesh key={i} position={[x, WALL_HEIGHT - 0.24, 0]}>
                <boxGeometry args={[0.28, 0.46, hz * 2]} />
                <meshStandardMaterial
                  color="#8a6f4e"
                  flatShading
                  roughness={1}
                />
              </mesh>
            )
          })}
          {/* Four of them, not six. Every one is a point light the shader has
              to walk per pixel, and the ambient down here is doing most of
              the work anyway. */}
          {[-hz * 0.45, hz * 0.5].map((z, i) =>
            [-hx * 0.5, hx * 0.5].map((x) => (
              <group key={`${i}${x}`} position={[x, WALL_HEIGHT - 0.62, z]}>
                <mesh>
                  <boxGeometry args={[2.6, 0.14, 0.34]} />
                  <meshStandardMaterial
                    color="#fff3d4"
                    emissive="#ffe6b0"
                    emissiveIntensity={1.5}
                    toneMapped={false}
                  />
                </mesh>
                <pointLight
                  position={[0, -0.5, 0]}
                  intensity={34}
                  distance={22}
                  color="#ffdfae"
                />
              </group>
            )),
          )}
        </group>
      )}

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
  const label = interior.exit?.label ?? 'Way out'

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
        text={label}
        width={interior.exit ? 5 : 3}
        aspect={interior.exit ? 7.6 : 4.4}
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
      <meshBasicMaterial
        color={accent}
        transparent
        opacity={0.8}
        depthWrite={false}
      />
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
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.5}
        />
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
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.6}
        />
      </mesh>
      {[-1.5, 1.5].map((x) => (
        <mesh key={x} position={[x, 0.8, 0.73]}>
          <circleGeometry args={[0.34, 16]} />
          <meshStandardMaterial color="#2f2a38" roughness={0.8} />
        </mesh>
      ))}
      <group ref={dish} position={[0, 2.6, 0]}>
        <mesh rotation={[-0.9, 0, 0]} castShadow>
          <sphereGeometry
            args={[0.9, 14, 10, 0, Math.PI * 2, 0, Math.PI / 3]}
          />
          <meshStandardMaterial
            color="#f4f0f6"
            side={2}
            flatShading
            roughness={0.7}
          />
        </mesh>
      </group>
    </group>
  )
}

function Logbook({ accent }: { accent: string }) {
  const book = useRef<Group>(null)
  useFrame((state) => {
    if (book.current) {
      book.current.position.y =
        1.28 + Math.sin(state.clock.elapsedTime * 1.4) * 0.04
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
      <pointLight
        position={[0, 2.4, 0.6]}
        intensity={6}
        distance={7}
        color="#ffdca8"
      />
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
              <meshStandardMaterial
                color="#f0c14b"
                metalness={0.7}
                roughness={0.28}
              />
            </mesh>
            {[-0.62, -0.75].map((y) => (
              <mesh key={y} position={[0.16, y, 0]}>
                <boxGeometry args={[0.24, 0.1, 0.1]} />
                <meshStandardMaterial
                  color="#f0c14b"
                  metalness={0.7}
                  roughness={0.28}
                />
              </mesh>
            ))}
          </group>
          <pointLight
            position={[0, 1.8, 0]}
            intensity={5}
            distance={6}
            color={accent}
          />
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

/* --------------------------- windows and ways --------------------------- */

/**
 * A window, and the outside coming through it. There is no real world behind
 * it, so the pane is simply lit — daylight or a night sky, whichever hour it
 * is out there.
 */
function Window({
  side,
  at,
  hx,
  hz,
  night,
}: {
  side: 'north' | 'east' | 'west'
  at: number
  hx: number
  hz: number
  night: boolean
}) {
  const glass = night ? '#26375e' : '#cfeaf7'
  const glow = night ? 0.35 : 1.15
  const along = side === 'north' ? at * hx : at * hz
  const position: [number, number, number] =
    side === 'north'
      ? [along, 2.9, -hz - 0.02]
      : side === 'east'
        ? [hx + 0.02, 2.9, along]
        : [-hx - 0.02, 2.9, along]
  const turn =
    side === 'north' ? 0 : side === 'east' ? -Math.PI / 2 : Math.PI / 2

  return (
    <group position={position} rotation={[0, turn, 0]}>
      <mesh>
        <boxGeometry args={[3.4, 2.6, 0.3]} />
        <meshStandardMaterial color="#f7f2e6" flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.14]}>
        <planeGeometry args={[2.9, 2.1]} />
        <meshStandardMaterial
          color={glass}
          emissive={glass}
          emissiveIntensity={glow}
          toneMapped={false}
        />
      </mesh>
      {/* Glazing bars, which is most of what makes a window read as one. */}
      <mesh position={[0, 0, 0.16]}>
        <boxGeometry args={[0.12, 2.1, 0.06]} />
        <meshStandardMaterial color="#f7f2e6" flatShading />
      </mesh>
      <mesh position={[0, 0, 0.16]}>
        <boxGeometry args={[2.9, 0.12, 0.06]} />
        <meshStandardMaterial color="#f7f2e6" flatShading />
      </mesh>
      <mesh position={[0, -1.42, 0.28]}>
        <boxGeometry args={[3.7, 0.18, 0.5]} />
        <meshStandardMaterial color="#e6dcc6" flatShading roughness={0.9} />
      </mesh>
      <pointLight
        position={[0, 0, 1.6]}
        intensity={night ? 6 : 22}
        distance={night ? 9 : 18}
        color={glass}
      />
    </group>
  )
}

/** The stairs, the door nobody has the key to, and the shelf that swings. */
function LinkPiece({
  link,
  accent,
  shown,
}: {
  link: InteriorLink
  accent: string
  shown: boolean
}) {
  const active = useGame((s) => s.nearby?.id === link.id)
  if (!shown) return null

  return (
    <group
      position={[link.position[0], 0, link.position[1]]}
      rotation={[0, link.rotation ?? 0, 0]}
    >
      {link.kind === 'stairsDown' ? (
        <Stairwell active={active} />
      ) : link.kind === 'locked' ? (
        <ShutDoor accent={accent} />
      ) : link.kind === 'door' ? (
        <OpenDoor accent={accent} />
      ) : (
        <SwungShelf />
      )}
      {active && <Halo accent={accent} />}
      {link.kind !== 'locked' && (
        <TextPlane
          text={link.kind === 'stairsDown' ? 'Down' : 'Through'}
          width={2.2}
          aspect={3.4}
          color="#ffe9c4"
          outline="rgba(0,0,0,0.6)"
          position={[0, 3.2, 0]}
        />
      )}
    </group>
  )
}

/**
 * A hole in the floor with steps going into it. The floor is a single plane
 * and cannot be cut, so this is a dark box sunk into it with the treads
 * drawn inside — which from a camera that never gets below the ceiling is
 * indistinguishable from the real thing.
 */
function Stairwell({ active }: { active: boolean }) {
  const glow = useRef<Mesh>(null)
  useFrame((state) => {
    if (!glow.current) return
    const material = glow.current.material as { opacity: number }
    const pulse = (Math.sin(state.clock.elapsedTime * 2.2) + 1) / 2
    material.opacity = (active ? 0.5 : 0.28) + pulse * 0.12
  })

  return (
    <group>
      {/* The shaft. */}
      <mesh position={[0, -1.4, 0]}>
        <boxGeometry args={[3, 2.9, 3.4]} />
        <meshStandardMaterial color="#231d29" flatShading roughness={1} />
      </mesh>
      {/* Treads down the near half, so it reads as descending and not as a pit. */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[0, -0.24 - i * 0.34, 1.3 - i * 0.52]}>
          <boxGeometry args={[2.9, 0.2, 0.56]} />
          <meshStandardMaterial color="#c3b393" flatShading roughness={0.95} />
        </mesh>
      ))}
      {/* Warm light coming up out of it. */}
      <mesh
        ref={glow}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.06, -0.4]}
      >
        <planeGeometry args={[2.8, 2.4]} />
        <meshBasicMaterial
          color="#ffca7a"
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>
      <pointLight
        position={[0, -0.9, 0]}
        intensity={9}
        distance={7}
        color="#ffca7a"
      />
      {/* Newel posts and a handrail down one side. */}
      {[-1.62, 1.62].map((x) => (
        <mesh key={x} position={[x, 0.56, 1.7]} castShadow>
          <boxGeometry args={[0.16, 1.12, 0.16]} />
          <meshStandardMaterial color="#7d5a3a" flatShading />
        </mesh>
      ))}
      <mesh position={[-1.62, 0.98, 0.3]} rotation={[0.42, 0, 0]} castShadow>
        <boxGeometry args={[0.12, 0.12, 3.1]} />
        <meshStandardMaterial color="#7d5a3a" flatShading />
      </mesh>
      <mesh position={[1.62, 0.98, 0.3]} rotation={[0.42, 0, 0]} castShadow>
        <boxGeometry args={[0.12, 0.12, 3.1]} />
        <meshStandardMaterial color="#7d5a3a" flatShading />
      </mesh>
    </group>
  )
}

/** The door down the hall. It does not open, and it is meant to look like it. */
function ShutDoor({ accent }: { accent: string }) {
  return (
    <group>
      <mesh position={[0, 1.7, 0]}>
        <boxGeometry args={[2.4, 3.4, 0.22]} />
        <meshStandardMaterial color="#8a6642" flatShading roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.68, 0.12]}>
        <boxGeometry args={[1.9, 3, 0.08]} />
        <meshStandardMaterial color="#a97c4e" flatShading roughness={0.9} />
      </mesh>
      {/* Two panels, a handle, and a keyhole with nothing behind it. */}
      {[2.42, 0.96].map((y) => (
        <mesh key={y} position={[0, y, 0.17]}>
          <boxGeometry args={[1.4, 1.1, 0.04]} />
          <meshStandardMaterial color="#8f6741" flatShading roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0.72, 1.62, 0.22]}>
        <sphereGeometry args={[0.13, 10, 8]} />
        <meshStandardMaterial color="#d8b25c" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.72, 1.3, 0.19]}>
        <boxGeometry args={[0.14, 0.2, 0.05]} />
        <meshStandardMaterial color="#2b2119" flatShading />
      </mesh>
      <mesh position={[0, 3.52, 0.06]}>
        <boxGeometry args={[2.6, 0.2, 0.34]} />
        <meshStandardMaterial color={accent} flatShading roughness={0.85} />
      </mesh>
    </group>
  )
}

/** The bookshelf, standing a foot off the wall on a hinge nobody admits to. */
function SwungShelf() {
  return (
    <group>
      {/* The dark of the room behind it, which is the tell. */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[0.3, 3.2, 2.6]} />
        <meshStandardMaterial color="#191420" flatShading roughness={1} />
      </mesh>
      <group position={[0.62, 0, 0.5]} rotation={[0, -0.42, 0]}>
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[0.36, 3, 2.4]} />
          <meshStandardMaterial color="#8a6642" flatShading roughness={0.95} />
        </mesh>
        {[0.5, 1.24, 1.98].map((y) => (
          <mesh key={y} position={[0.06, y, 0]}>
            <boxGeometry args={[0.3, 0.08, 2.2]} />
            <meshStandardMaterial color="#7d5a3a" flatShading />
          </mesh>
        ))}
        {/* Books, still on it. Whoever built this did not clear the shelf. */}
        {[0.5, 1.24, 1.98].map((y) =>
          Array.from({ length: 7 }, (_, i) => (
            <mesh
              key={`${y}-${i}`}
              position={[0.08, y + 0.28, -0.95 + i * 0.31]}
              castShadow
            >
              <boxGeometry args={[0.22, 0.44, 0.22]} />
              <meshStandardMaterial
                color={
                  ['#8c4b3a', '#3f5f8a', '#5d7a4a', '#8a7233', '#6b4a72'][i % 5]
                }
                flatShading
                roughness={0.9}
              />
            </mesh>
          )),
        )}
      </group>
      <pointLight
        position={[0.4, 1.6, 0]}
        intensity={5}
        distance={5}
        color="#8f7ad4"
      />
    </group>
  )
}

/**
 * A doorway between two rooms of the same building: a lined opening with the
 * next room's light coming through it, and the door itself standing open
 * against the wall. Nobody in this house shuts an internal door.
 */
function OpenDoor({ accent }: { accent: string }) {
  return (
    <group>
      {/* The opening, which is a dark panel with a warm wash over it: there
          is no geometry behind it, and at this camera angle there does not
          need to be. */}
      <mesh position={[0, 1.7, -0.06]}>
        <boxGeometry args={[2.2, 3.4, 0.12]} />
        <meshStandardMaterial color="#1d1822" flatShading roughness={1} />
      </mesh>
      <mesh position={[0, 1.5, 0.02]}>
        <planeGeometry args={[2, 3]} />
        <meshBasicMaterial color="#ffca7a" transparent opacity={0.16} />
      </mesh>
      {/* Lining: two jambs and a head. */}
      {[-1.24, 1.24].map((x) => (
        <mesh key={x} position={[x, 1.75, 0.06]} castShadow>
          <boxGeometry args={[0.28, 3.7, 0.34]} />
          <meshStandardMaterial color="#f2ece0" flatShading roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 3.5, 0.06]} castShadow>
        <boxGeometry args={[2.76, 0.28, 0.34]} />
        <meshStandardMaterial color="#f2ece0" flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.72, 0.06]}>
        <boxGeometry args={[2.9, 0.16, 0.4]} />
        <meshStandardMaterial color={accent} flatShading roughness={0.85} />
      </mesh>
      {/* The door, folded back flat against the wall beside the opening. */}
      <group position={[1.62, 0, 0.24]} rotation={[0, -0.28, 0]}>
        <mesh position={[0, 1.62, 0]} castShadow>
          <boxGeometry args={[1.9, 3.2, 0.12]} />
          <meshStandardMaterial color="#a97c4e" flatShading roughness={0.9} />
        </mesh>
        {[2.3, 0.95].map((y) => (
          <mesh key={y} position={[0, y, 0.08]}>
            <boxGeometry args={[1.4, 1.05, 0.04]} />
            <meshStandardMaterial color="#8f6741" flatShading roughness={0.9} />
          </mesh>
        ))}
        <mesh position={[-0.72, 1.6, 0.12]}>
          <sphereGeometry args={[0.11, 8, 6]} />
          <meshStandardMaterial
            color="#d8b25c"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      </group>
      <pointLight
        position={[0, 1.8, 0.8]}
        intensity={6}
        distance={7}
        color="#ffca7a"
      />
    </group>
  )
}
