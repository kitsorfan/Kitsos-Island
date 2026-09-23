import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide } from 'three'
import type { Group, Mesh, MeshStandardMaterial } from 'three'
import { BANDS, REVEAL_LINES, bandShed, revealPhase } from './revealLogic'
import { BUILDING_BY_ID } from '../island/world'
import { groundHeight } from '../island/terrainLogic'
import { useGame } from '../../shared/state/store'
import { TextPlane } from '../../shared/engine/TextSign'
import { useT } from '../../shared/i18n/useT'
import * as sfx from '../../shared/engine/audio'

/**
 * The reveal on the doorstep: the tower shedding its paint, and the rocket
 * that was inside it all along.
 *
 * Drawn over the real lighthouse rather than instead of it. The building is
 * still standing there in `Buildings.tsx` — this fades a ship up through it
 * and a shell of paint off it, so for a moment both are on screen and the
 * one is plainly turning into the other. Swapping the models would read as a
 * cut, and a cut is the one thing a reveal must not be.
 */
export function Reveal() {
  const reveal = useGame((s) => s.reveal)
  const endReveal = useGame((s) => s.endReveal)
  /* One group per band, so each can leave on its own beat. */
  const bands = useRef<(Group | null)[]>([])
  const seams = useRef<(Mesh | null)[]>([])
  const ship = useRef<Group>(null)
  const shake = useRef<Group>(null)
  const done = useRef(false)
  const spoke = useRef('')

  const tower = BUILDING_BY_ID.get('lighthouse')

  useFrame((state) => {
    if (!reveal || !tower) return
    const now = performance.now() / 1000
    const phase = revealPhase(reveal, now)
    const time = state.clock.elapsedTime

    /*
     * The bands come away one at a time from the bottom up, each turning as
     * it goes and tipping over as it climbs — which is the difference
     * between a tower coming apart and a texture fading out. They do not
     * all leave the same way, either: the odd ones spin the other way.
     */
    for (let i = 0; i < BANDS; i++) {
      const band = bands.current[i]
      if (!band) continue
      const gone = bandShed(i, phase.shed)
      band.visible = gone < 0.995
      const way = i % 2 === 0 ? 1 : -1
      /* Up, out and over. */
      band.position.y = 1.4 + i * 2.6 + gone * (7 + i * 1.4)
      band.position.x = Math.sin(i * 2.1) * gone * 4.5
      band.position.z = Math.cos(i * 2.1) * gone * 4.5
      band.rotation.y = gone * 2.4 * way
      band.rotation.x = gone * 0.9 * way
      band.scale.setScalar(1 + gone * 0.25)

      const mat = (band.children[0] as Mesh | undefined)?.material as
        MeshStandardMaterial | undefined
      if (mat && 'opacity' in mat) mat.opacity = 0.92 * (1 - gone)
    }

    /* Light at the seams while the shell is splitting. */
    for (const seam of seams.current) {
      if (!seam) continue
      const mat = seam.material as MeshStandardMaterial
      mat.opacity = phase.seam * 0.85
      seam.visible = phase.seam > 0.02
    }

    /* The whole tower shudders as it lets go. */
    if (shake.current) {
      const r = phase.rumble
      shake.current.position.x = Math.sin(time * 43) * r * 0.22
      shake.current.position.z = Math.sin(time * 37) * r * 0.22
    }

    /* And the ship comes up underneath it, rising a little as it firms. */
    if (ship.current) {
      ship.current.visible = phase.ship > 0.01
      ship.current.scale.setScalar(0.9 + phase.ship * 0.1)
      ship.current.traverse((part) => {
        const mat = (part as Mesh).material as MeshStandardMaterial | undefined
        if (mat && 'opacity' in mat) mat.opacity = phase.ship
      })
    }

    /* A note as the paint starts to go, and one as the rocket lands. */
    if (phase.stage !== spoke.current) {
      spoke.current = phase.stage
      if (phase.stage === 'shed') sfx.thud()
      if (phase.stage === 'rocket') sfx.jingle()
    }

    if (phase.done && !done.current) {
      done.current = true
      endReveal()
    }
  })

  if (!reveal || !tower) return null
  const [x, z] = tower.position

  return (
    /*
     * Placed exactly the way `Buildings.tsx` places the real tower: on the
     * ground rather than at y = 0, turned to the same heading, at the same
     * scale.
     *
     * Getting any of the three wrong is why nothing appeared to happen the
     * first time round - the shell was sunk in the hillside and rotated off
     * the building it was supposed to be peeling off, so the animation ran
     * perfectly well somewhere the camera was not looking.
     */
    <group
      ref={shake}
      position={[x, groundHeight(x, z), z]}
      rotation={[0, tower.rotation, 0]}
      scale={tower.scale}
    >
      {/*
        The paint: the bands the tower wears, each its own group so it can
        come away on its own beat. Slightly proud of the real thing so there
        is no z-fighting between the two while both are on screen.
      */}
      {Array.from({ length: BANDS }, (_, i) => (
        <group
          key={i}
          ref={(g) => {
            bands.current[i] = g
          }}
          position={[0, 1.4 + i * 2.6, 0]}
        >
          <mesh>
            <cylinderGeometry
              args={[3.56 - i * 0.34, 3.91 - i * 0.34, 2.6, 16, 1, true]}
            />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#f6f1e4' : '#c0392b'}
              transparent
              opacity={0.92}
              depthWrite={false}
              side={DoubleSide}
              flatShading
            />
          </mesh>
        </group>
      ))}

      {/* The seams between the bands, lit while the shell splits along
          them. They are what says the tower came apart on purpose rather
          than simply falling to bits. */}
      {Array.from({ length: BANDS }, (_, i) => (
        <mesh
          key={`seam-${i}`}
          ref={(m) => {
            seams.current[i] = m
          }}
          position={[0, 2.7 + i * 2.6, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          visible={false}
        >
          <torusGeometry args={[3.6 - i * 0.34, 0.1, 6, 24]} />
          <meshStandardMaterial
            color="#ffd9a0"
            emissive="#f0a33c"
            emissiveIntensity={2.2}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* What was underneath. The same hull the hologram shows and the same
          one he will float beside, so all three are one object. */}
      <group ref={ship} visible={false}>
        <mesh position={[0, 9, 0]}>
          <cylinderGeometry args={[2.5, 3.1, 17, 16]} />
          <meshStandardMaterial
            color="#e8eef4"
            roughness={0.6}
            metalness={0.3}
            transparent
            opacity={0}
          />
        </mesh>
        <mesh position={[0, 12.4, 0]}>
          <cylinderGeometry args={[2.62, 2.62, 2.6, 16]} />
          <meshStandardMaterial
            color="#c0392b"
            roughness={0.7}
            transparent
            opacity={0}
          />
        </mesh>
        <mesh position={[0, 19.6, 0]}>
          <coneGeometry args={[2.5, 4.4, 16]} />
          <meshStandardMaterial
            color="#d8e2ea"
            roughness={0.6}
            metalness={0.3}
            transparent
            opacity={0}
          />
        </mesh>
        {/* Fins at the base. */}
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 3.2, 1.8, Math.sin(a) * 3.2]}
              rotation={[0, -a, 0]}
            >
              <boxGeometry args={[0.4, 5, 2.8]} />
              <meshStandardMaterial
                color="#c0392b"
                roughness={0.8}
                transparent
                opacity={0}
              />
            </mesh>
          )
        })}
        {/* And the bells under it. */}
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2 + Math.PI / 3
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 1.4, 0.2, Math.sin(a) * 1.4]}
            >
              <coneGeometry args={[1.05, 2.4, 12, 1, true]} />
              <meshStandardMaterial
                color="#4a545f"
                roughness={0.7}
                metalness={0.4}
                side={DoubleSide}
                transparent
                opacity={0}
              />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

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
