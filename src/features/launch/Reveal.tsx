import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { Quaternion } from 'three'
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
/** Scratch, so squaring the text to the camera allocates nothing a frame. */
const faceAway = new Quaternion()

export function RevealMark() {
  const t = useT()
  const reveal = useGame((s) => s.reveal)
  const mark = useRef<Group>(null)
  /**
   * The text, kept square to the camera.
   *
   * It has to be, and this is the second reason the lines were invisible:
   * the whole rig sits inside the player's group, which is turned to
   * whichever way he is facing. Walking up to the door turns him away from
   * the camera, which turns the lettering edge-on - so a flat plane parented
   * to him is readable from exactly one angle and that is not the one he is
   * standing at.
   */
  const billboard = useRef<Group>(null)
  /* What he is saying, as state rather than read off the clock at render
     time: the frame loop owns the clock, and a render that samples it is a
     render whose output depends on when React happened to run it. */
  const [saying, setSaying] = useState<string[] | null>(null)
  /** The stage it belongs to, so a change of line restarts its entrance. */
  const [spoken, setSpoken] = useState<string>('')

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
      /* Square to the camera, whichever way he is facing. The group's own
         rotation is undone rather than the camera's applied, because the
         camera also pitches down and text tilted to match reads as lying
         on the ground. */
      if (billboard.current) {
        /*
         * Square to the camera in world terms, not local ones.
         *
         * The parent is the player group and it yaws with his facing, so
         * writing the camera's quaternion straight onto this would be
         * composed with that turn and come out wrong by exactly his heading.
         * Taking the parent's world rotation out first is what makes it hold
         * still whichever way he is pointed.
         */
        const parent = billboard.current.parent
        if (parent) {
          parent.getWorldQuaternion(faceAway)
          faceAway.invert()
          billboard.current.quaternion
            .copy(faceAway)
            .multiply(state.camera.quaternion)
        } else {
          billboard.current.quaternion.copy(state.camera.quaternion)
        }
      }
      /* A small bob once it has arrived, so it is not a frozen decal. */
      if (pop >= 1) {
        mark.current.position.y += Math.sin(state.clock.elapsedTime * 4) * 0.08
      }
    }

    /* The line under it only exists once there is something to say, and it
       is only set when it actually changes - this runs every frame. */
    const wanted = REVEAL_LINES[phase.stage] ?? null
    setSpoken((was) => (was === phase.stage ? was : phase.stage))
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
      {/*
        What he says, stacked over the mark.

        Each line is its own plane rather than one long strip: the punchline
        is a turn between two halves and it needs the break to land. The
        second line is the answer, so it is drawn in the island's amber and
        the first in plain white - the eye reads down.
      */}
      {saying && (
        <group ref={billboard} key={spoken} position={[0, 4.8, 0]}>
          {saying.map((row, i) => (
            <TextPlane
              key={row}
              text={t(row)}
              position={[0, -i * 1.05, 0]}
              /*
               * A fixed, wide plane rather than one measured off the string.
               *
               * Sizing it by character count was how this ended up invisible:
               * a 24-character line came out at aspect 15, which is a plane
               * 8 units across and half a unit tall - a sliver of text seen
               * from thirty metres away and edge-on to boot. The canvas is
               * 768 wide whatever happens, so a low aspect is what actually
               * makes the letters big; `draw` shrinks the font to fit the
               * width on its own.
               */
              width={7}
              aspect={7}
              color={i === 0 ? '#ffffff' : '#ffd23f'}
            />
          ))}
        </group>
      )}
    </group>
  )
}
