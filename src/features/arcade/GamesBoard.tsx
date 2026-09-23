import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { BOARD, MINIGAMES } from './minigames'
import { groundHeight } from '../island/terrainLogic'
import { useGame } from '../../shared/state/store'
import { TextPlane } from '../../shared/engine/TextSign'

const WOOD = '#b07a42'
const WOOD_DARK = '#8a5c2f'
const FRAME = '#6d451f'

/** Depth of the panel the two faces are pinned to. */
const PANEL_DEPTH = 0.3
/** Width of the panel, and of the face pinned to it. */
const W = BOARD.width
const FACE = W - 0.28
/**
 * It stands as tall as it always did — it was only ever too wide. The height
 * is what makes the narrow board work: five notices stack down it where they
 * used to run along it.
 */
const LEGS = 2.1
const PANEL_HEIGHT = 1.9
const MID = LEGS - 0.05

/**
 * One slip to a game, the full width of the board. Side by side they had to
 * be a third of the panel each, and a title painted a third of a panel wide
 * is not a title anybody can read from the square.
 */
const SLIP_W = FACE - 0.16
const SLIP_H = 0.23
const SLIP_PITCH = 0.27

/**
 * The noticeboard in the plaza where the island's games are signed up.
 *
 * It is read from either side: the panel is a slab with the same notices
 * pinned front and back, so nobody has to walk around it to find out what it
 * says. It stands clear of the lamp ring and off the lines the seven roads
 * take across the square.
 *
 * It is a narrow board rather than a wide one: five notices side by side made
 * a hoarding that stood over the whole square. They run down it instead, one
 * name apiece, and what each game actually is waits on the pop-up.
 */
export function GamesBoard() {
  const [x, z] = BOARD.position
  const y = groundHeight(x, z)
  const nearby = useGame((s) => s.nearby?.id === 'games-board')
  const arrow = useRef<Group>(null)

  useFrame((state) => {
    if (arrow.current) {
      arrow.current.position.y =
        3.9 + Math.sin(state.clock.elapsedTime * 2.4) * 0.09
    }
  })

  return (
    <group position={[x, y, z]} rotation={[0, BOARD.facing, 0]}>
      {/* Posts */}
      {[-(W / 2 - 0.2), W / 2 - 0.2].map((px) => (
        <mesh key={px} position={[px, LEGS / 2, 0]} castShadow>
          <boxGeometry args={[0.2, LEGS, 0.2]} />
          <meshStandardMaterial color={FRAME} flatShading roughness={0.9} />
        </mesh>
      ))}

      {/* The panel itself, centred so a face can go on either side */}
      <mesh position={[0, MID, 0]} castShadow>
        <boxGeometry args={[W, PANEL_HEIGHT, PANEL_DEPTH]} />
        <meshStandardMaterial color={FRAME} flatShading roughness={0.9} />
      </mesh>

      {/* A little gabled roof, so the notices keep the rain off both sides */}
      {[1, -1].map((side) => (
        <mesh
          key={side}
          position={[0, MID + PANEL_HEIGHT / 2 + 0.16, side * 0.36]}
          rotation={[side * -0.36, 0, 0]}
          castShadow
        >
          <boxGeometry args={[W + 0.4, 0.13, 0.86]} />
          <meshStandardMaterial color={WOOD_DARK} flatShading roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, MID + PANEL_HEIGHT / 2 + 0.32, 0]}>
        <boxGeometry args={[W + 0.44, 0.12, 0.18]} />
        <meshStandardMaterial color={FRAME} flatShading roughness={0.9} />
      </mesh>

      {/* Both faces carry the same notices. */}
      {[0, Math.PI].map((turn) => (
        <group key={turn} rotation={[0, turn, 0]}>
          <mesh position={[0, MID, PANEL_DEPTH / 2 + 0.01]}>
            <boxGeometry args={[FACE, PANEL_HEIGHT - 0.28, 0.05]} />
            <meshStandardMaterial color={WOOD} flatShading roughness={0.85} />
          </mesh>

          <TextPlane
            text="ISLAND GAMES"
            width={1.2}
            aspect={8}
            color="#ffe9b8"
            outline="#3a2411"
            position={[0, MID + 0.73, PANEL_DEPTH / 2 + 0.06]}
          />

          {/* The notices: a coloured tab and the name, and nothing else.
              What each of them is belongs on the pop-up, which has the room
              for it — this only has to be legible from where you stand. */}
          {MINIGAMES.map((game, i) => {
            const py = MID + 0.47 - i * SLIP_PITCH
            const tilt = [0.006, -0.005, 0.007, -0.006][i % 4]
            return (
              <group
                key={game.id}
                position={[0, py, PANEL_DEPTH / 2 + 0.04]}
                rotation={[0, 0, tilt]}
              >
                <mesh>
                  <planeGeometry args={[SLIP_W, SLIP_H]} />
                  <meshStandardMaterial color="#fdf7e9" roughness={0.9} />
                </mesh>
                <mesh position={[-SLIP_W / 2 + 0.09, 0, 0.01]}>
                  <planeGeometry args={[0.18, SLIP_H]} />
                  <meshStandardMaterial color={game.accent} roughness={0.7} />
                </mesh>
                <TextPlane
                  text={game.title.toUpperCase()}
                  width={SLIP_W - 0.34}
                  aspect={10}
                  color="#3a2d22"
                  outline=""
                  position={[0.08, 0, 0.02]}
                />
              </group>
            )
          })}
        </group>
      ))}

      {/* A nudge that this is a thing you can use, seen from anywhere */}
      {nearby && (
        <group ref={arrow}>
          <mesh rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.2, 0.38, 4]} />
            <meshBasicMaterial color="#ffd166" />
          </mesh>
        </group>
      )}
    </group>
  )
}
