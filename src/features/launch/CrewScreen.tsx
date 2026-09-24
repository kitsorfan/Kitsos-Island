import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { TextPlane } from '../../shared/engine/TextSign'
import { useT } from '../../shared/i18n/useT'
import { CREW } from './crew'

/**
 * The crew screen on the east wall of the flight deck: a panel of little
 * figures, one for everybody on the island, in the colours they wear.
 *
 * Drawn in the exhibit's own frame, which puts +z into the room and the wall
 * about 0.7 behind the origin. It is flat on that wall, so the room's margin
 * keeps him off it and there is nothing to walk into.
 *
 * A cursor steps from face to face, which is what makes it read as a screen
 * that is on rather than a poster of one.
 */

const COLS = 12
const WIDTH = 2.9
const HEIGHT = 1.7
/* Where the glass sits: just proud of the frame, which is on the wall. */
const FACE_Z = -0.44
const CENTRE_Y = 1.85

export function CrewScreen() {
  const t = useT()
  const cursor = useRef<Group>(null)

  const people = useMemo(
    () => CREW.flatMap((group) => group.members.map((m) => m.npc)),
    [],
  )
  const rows = Math.ceil(people.length / COLS)
  const cellW = (WIDTH - 0.3) / COLS
  const cellH = (HEIGHT - 0.3) / rows
  const cellAt = (i: number): [number, number] => [
    -((COLS - 1) * cellW) / 2 + (i % COLS) * cellW,
    ((rows - 1) * cellH) / 2 - Math.floor(i / COLS) * cellH,
  ]

  useFrame((state) => {
    if (!cursor.current) return
    const i = Math.floor(state.clock.elapsedTime * 1.6) % people.length
    const [x, y] = cellAt(i)
    cursor.current.position.set(x, y, 0.004)
  })

  /* Scaled to the cell, so a longer cast shrinks the figures rather than
     running them off the bottom of the glass. */
  const s = Math.min(cellW, cellH) / 0.2

  return (
    <group>
      {/* The bezel, on the wall. */}
      <mesh position={[0, CENTRE_Y, FACE_Z - 0.08]} castShadow>
        <boxGeometry args={[WIDTH + 0.2, HEIGHT + 0.2, 0.12]} />
        <meshStandardMaterial color="#2b333c" flatShading roughness={0.7} />
      </mesh>
      {/* The glass. */}
      <mesh position={[0, CENTRE_Y, FACE_Z - 0.01]}>
        <planeGeometry args={[WIDTH, HEIGHT]} />
        <meshStandardMaterial
          color="#0f2436"
          emissive="#12344f"
          emissiveIntensity={0.9}
        />
      </mesh>

      <group position={[0, CENTRE_Y, FACE_Z]}>
        {people.map((npc, i) => {
          const [x, y] = cellAt(i)
          return (
            <group key={npc.id} position={[x, y, 0]} scale={s}>
              {/* Shoulders */}
              <mesh position={[0, -0.045, 0]}>
                <planeGeometry args={[0.13, 0.07]} />
                <meshBasicMaterial
                  color={npc.blazer ?? npc.dress ?? npc.colors.shirt}
                />
              </mesh>
              {/* Hair behind, then the face on it */}
              <mesh position={[0, 0.032, 0.001]}>
                <circleGeometry args={[0.047, 10]} />
                <meshBasicMaterial color={npc.colors.hair} />
              </mesh>
              <mesh position={[0, 0.022, 0.002]}>
                <circleGeometry args={[0.04, 10]} />
                <meshBasicMaterial color={npc.colors.skin} />
              </mesh>
            </group>
          )
        })}

        {/* The cursor: a lit frame that walks along the faces. */}
        <group ref={cursor}>
          {[
            [0, cellH / 2 - 0.01, cellW - 0.02, 0.012],
            [0, -cellH / 2 + 0.01, cellW - 0.02, 0.012],
            [cellW / 2 - 0.01, 0, 0.012, cellH - 0.02],
            [-cellW / 2 + 0.01, 0, 0.012, cellH - 0.02],
          ].map(([x, y, w, h], i) => (
            <mesh key={i} position={[x, y, 0.003]}>
              <planeGeometry args={[w, h]} />
              <meshBasicMaterial color="#8fd4ff" />
            </mesh>
          ))}
        </group>
      </group>

      <TextPlane
        text={t('MEET THE CHARACTERS')}
        position={[0, CENTRE_Y + HEIGHT / 2 + 0.28, FACE_Z]}
        width={2.6}
        aspect={11}
        color="#9fdcff"
      />

      <pointLight
        position={[0, CENTRE_Y, FACE_Z + 1]}
        intensity={3}
        distance={4}
        decay={2}
        color="#5fb4ff"
      />
    </group>
  )
}
