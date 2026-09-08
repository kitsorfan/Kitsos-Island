import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { BOARD, MINIGAMES } from '../data/minigames'
import { groundHeight } from '../game/terrain'
import { useGame } from '../state/store'
import { TextPlane } from './TextSign'

const WOOD = '#b07a42'
const WOOD_DARK = '#8a5c2f'
const FRAME = '#6d451f'

/** Depth of the panel the two faces are pinned to. */
const PANEL_DEPTH = 0.3

/**
 * The noticeboard in the plaza where the island's games are signed up.
 *
 * It is read from either side: the panel is a slab with the same notices
 * pinned front and back, so nobody has to walk around it to find out what it
 * says. It stands clear of the lamp ring and off the lines the seven roads
 * take across the square.
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
      {[-2.45, 2.45].map((px) => (
        <mesh key={px} position={[px, 1.05, 0]} castShadow>
          <boxGeometry args={[0.2, 2.1, 0.2]} />
          <meshStandardMaterial color={FRAME} flatShading roughness={0.9} />
        </mesh>
      ))}

      {/* The panel itself, centred so a face can go on either side */}
      <mesh position={[0, 2.05, 0]} castShadow>
        <boxGeometry args={[5.3, 1.9, PANEL_DEPTH]} />
        <meshStandardMaterial color={FRAME} flatShading roughness={0.9} />
      </mesh>

      {/* A little gabled roof, so the notices keep the rain off both sides */}
      {[1, -1].map((side) => (
        <mesh
          key={side}
          position={[0, 3.16, side * 0.36]}
          rotation={[side * -0.36, 0, 0]}
          castShadow
        >
          <boxGeometry args={[5.7, 0.13, 0.86]} />
          <meshStandardMaterial color={WOOD_DARK} flatShading roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 3.32, 0]}>
        <boxGeometry args={[5.74, 0.12, 0.18]} />
        <meshStandardMaterial color={FRAME} flatShading roughness={0.9} />
      </mesh>

      {/* Both faces carry the same notices. */}
      {[0, Math.PI].map((turn) => (
        <group key={turn} rotation={[0, turn, 0]}>
          <mesh position={[0, 2.05, PANEL_DEPTH / 2 + 0.01]}>
            <boxGeometry args={[5.02, 1.62, 0.05]} />
            <meshStandardMaterial color={WOOD} flatShading roughness={0.85} />
          </mesh>

          <TextPlane
            text="ISLAND GAMES"
            width={2.5}
            aspect={7}
            color="#ffe9b8"
            outline="#3a2411"
            position={[0, 2.72, PANEL_DEPTH / 2 + 0.06]}
          />

          {/* Three notices across the panel, each pinned a shade off true. */}
          {MINIGAMES.map((game, i) => {
            const px = (i - (MINIGAMES.length - 1) / 2) * 1.62
            const tilt = [0.03, -0.02, 0.025][i % 3]
            return (
              <group
                key={game.id}
                position={[px, 2.0, PANEL_DEPTH / 2 + 0.05]}
              >
                <mesh rotation={[0, 0, tilt]}>
                  <planeGeometry args={[1.5, 1.24]} />
                  <meshStandardMaterial color="#fdf7e9" roughness={0.9} />
                </mesh>
                <mesh position={[0, 0.47, 0.01]} rotation={[0, 0, tilt]}>
                  <planeGeometry args={[1.5, 0.3]} />
                  <meshStandardMaterial color={game.accent} roughness={0.7} />
                </mesh>
                <TextPlane
                  text={game.title.toUpperCase()}
                  width={1.32}
                  aspect={7}
                  color="#fdf7e9"
                  outline="#2b2118"
                  position={[0, 0.47, 0.02]}
                />
                <TextPlane
                  text={game.kicker}
                  width={1.3}
                  aspect={9}
                  color="#4a3a2a"
                  outline=""
                  bold={false}
                  position={[0, 0.12, 0.02]}
                />
                {/* A pin at each top corner */}
                {[-0.62, 0.62].map((cx) => (
                  <mesh key={cx} position={[cx, 0.54, 0.03]}>
                    <sphereGeometry args={[0.045, 8, 6]} />
                    <meshStandardMaterial color="#c0392b" roughness={0.4} />
                  </mesh>
                ))}
              </group>
            )
          })}
        </group>
      ))}

      {/* A nudge that this is a thing you can use, seen from anywhere */}
      {nearby && (
        <group ref={arrow}>
          <mesh rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.24, 0.44, 4]} />
            <meshBasicMaterial color="#ffd166" />
          </mesh>
        </group>
      )}
    </group>
  )
}
