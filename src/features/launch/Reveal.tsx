import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { REVEAL_LINES, revealPhase } from './revealLogic'
import { useGame } from '../../shared/state/store'
import { TextPlane } from '../../shared/engine/TextSign'
import { useT } from '../../shared/i18n/useT'

/**
 * The player's half of the doorstep reveal.
 *
 * The tower's half is not here: it is in `LighthouseModel` itself, because
 * the tower is the thing that comes apart. Drawing a see-through copy of it
 * over the top was the first attempt and it does not work - the real model
 * is solid and stands in front of the copy, so the whole cutscene played
 * inside a building nobody could see into.
 *
 * What is left here is the mark over his head and what he says under it.
 */

/**
 * The mark over his head, and what he says under it.
 *
 * Mounted on the player rather than in the world, so it rides with him — and
 * it is the first thing that happens, before anything it could be a reaction
 * to, because the whole job of it is to say that the man has noticed.
 */
export function RevealMark() {
  const t = useT()
  const reveal = useGame((s) => s.reveal)
  const mark = useRef<Group>(null)
  /* What he is saying, as state rather than read off the clock at render
     time: the frame loop owns the clock, and a render that samples it is a
     render whose output depends on when React happened to run it. */
  const [saying, setSaying] = useState<string | null>(null)

  useFrame((state) => {
    if (!reveal) return
    const phase = revealPhase(reveal, performance.now() / 1000)

    if (mark.current) {
      /* Springs up past its resting height and settles back, which is the
         whole of what makes it read as a start rather than a fade. */
      const pop = phase.mark
      const overshoot = Math.sin(Math.min(1, pop) * Math.PI) * 0.35
      mark.current.position.y = 2.6 + pop * 0.7 + overshoot
      mark.current.scale.setScalar(pop * (1 + overshoot * 0.5))
      /* A small bob once it has arrived, so it is not a frozen decal. */
      if (pop >= 1) {
        mark.current.position.y += Math.sin(state.clock.elapsedTime * 4) * 0.08
      }
    }

    /* The line under it only exists once there is something to say, and it
       is only set when it actually changes - this runs every frame. */
    const wanted = REVEAL_LINES[phase.stage] ?? null
    setSaying((was) => (was === wanted ? was : wanted))
  })

  if (!reveal) return null

  return (
    <group>
      {/* The mark: a bar and a dot, which is a '!' anywhere. */}
      <group ref={mark} position={[0, 2.6, 0]}>
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[0.17, 0.62, 0.17]} />
          <meshStandardMaterial
            color="#ffd23f"
            emissive="#f0a33c"
            emissiveIntensity={0.9}
            flatShading
          />
        </mesh>
        <mesh position={[0, -0.16, 0]}>
          <boxGeometry args={[0.17, 0.17, 0.17]} />
          <meshStandardMaterial
            color="#ffd23f"
            emissive="#f0a33c"
            emissiveIntensity={0.9}
            flatShading
          />
        </mesh>
      </group>

      {/* What he says, hung above the mark and facing the camera. */}
      {saying && (
        <group position={[0, 4.3, 0]}>
          <TextPlane
            text={t(saying)}
            width={saying.length > 20 ? 7 : 3}
            aspect={saying.length > 20 ? 14 : 7}
            color="#fff3d8"
          />
        </group>
      )}
    </group>
  )
}
