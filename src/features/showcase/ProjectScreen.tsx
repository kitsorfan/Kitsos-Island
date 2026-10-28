import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, SRGBColorSpace, Texture } from 'three'
import type { Mesh, MeshStandardMaterial } from 'three'
import {
  PROJECT_BY_ID,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  SHOWCASE,
  rowAt,
  rowCount,
  rowHalf,
  screensIn,
} from './projects'
import type { Project } from './projects'
import { TextPlane } from '../../shared/engine/TextSign'
import { useT } from '../../shared/i18n/useT'
import { upper } from '../../shared/i18n'

/* The Work District's own materials, so the row reads as part of the lobby. */
const STEEL = '#22313f'
const PANEL = '#2b3a49'
const TEAL = '#2fb59a'
const BEZEL = '#1b2530'

/** Bottom edge of the glass: a little over waist height, as a kiosk is. */
const GLASS_FOOT = 1.1
const GLASS_MID = GLASS_FOOT + SCREEN_HEIGHT / 2
/** The frame round the glass. */
const RIM = 0.07
/** The strip under the glass with the project's name on it. */
const CHIN = 0.28
const CHIN_MID = GLASS_FOOT - RIM - CHIN / 2
const BANNER_MID = GLASS_FOOT + SCREEN_HEIGHT + 0.6
const BANNER_HEIGHT = 0.5

/**
 * One project's screen, on its column, with its name on the chin: drawn at
 * the exhibit's own position, facing into the room.
 *
 * The glass is unlit material, so it glows like a screen does whatever the
 * room's lighting is doing, and it shows the project running — the
 * screenshot from public/projects/, or the name on a dark card until that
 * arrives.
 */
export function ProjectScreen({ id }: { id: string }) {
  const project = PROJECT_BY_ID.get(id)
  if (!project) return null
  return <Screen project={project} />
}

function Screen({ project }: { project: Project }) {
  const t = useT()
  const picture = useScreenshot(project)

  return (
    <group>
      {/* The column, and a foot for it to stand on */}
      <mesh position={[0, 0.06, 0]} castShadow>
        <boxGeometry args={[0.8, 0.12, 0.55]} />
        <meshStandardMaterial color={STEEL} flatShading roughness={0.6} />
      </mesh>
      <mesh position={[0, CHIN_MID / 2, -0.05]} castShadow>
        <boxGeometry args={[0.22, CHIN_MID, 0.22]} />
        <meshStandardMaterial color={STEEL} flatShading roughness={0.6} />
      </mesh>

      {/* The bezel, chin and all, and the glass in it */}
      <mesh position={[0, GLASS_MID - CHIN / 2, 0]} castShadow>
        <boxGeometry
          args={[SCREEN_WIDTH + RIM * 2, SCREEN_HEIGHT + RIM * 2 + CHIN, 0.14]}
        />
        <meshStandardMaterial color={BEZEL} roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, GLASS_MID, 0.072]}>
        <planeGeometry args={[SCREEN_WIDTH, SCREEN_HEIGHT]} />
        <meshBasicMaterial map={picture} toneMapped={false} />
      </mesh>
      <TextPlane
        text={upper(t(project.name))}
        width={SCREEN_WIDTH * 0.62}
        aspect={11}
        color="#e8f6f3"
        outline=""
        position={[-0.12, CHIN_MID, 0.075]}
      />
      <PowerLight x={SCREEN_WIDTH / 2 - 0.12} y={CHIN_MID} />
    </group>
  )
}

/**
 * What the screens stand in: a post at each end of every row and a rail
 * across the top, over a mat on the floor in front. The front row's rail is
 * the banner saying what they are.
 *
 * Drawn by the room rather than by any one screen, because it spans all of
 * them and grows with the stand.
 */
export function ShowcaseFrame() {
  return (
    <>
      {Array.from({ length: rowCount() }, (_, row) => (
        <RowFrame key={row} row={row} />
      ))}
    </>
  )
}

function RowFrame({ row }: { row: number }) {
  const t = useT()
  const [x, z] = rowAt(row)
  const half = rowHalf(screensIn(row))

  return (
    <group position={[x, 0, z]}>
      {/* The mat you stand on to use one, in the building's teal */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 1.1]}>
        <planeGeometry args={[half * 2, 2.2]} />
        <meshStandardMaterial color="#2a6f63" roughness={0.95} />
      </mesh>

      {[-half + 0.1, half - 0.1].map((px) => (
        <mesh key={px} position={[px, BANNER_MID / 2, 0]} castShadow>
          <boxGeometry args={[0.14, BANNER_MID, 0.14]} />
          <meshStandardMaterial color={STEEL} flatShading roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, BANNER_MID, 0]} castShadow>
        <boxGeometry args={[half * 2, BANNER_HEIGHT, 0.2]} />
        <meshStandardMaterial color={PANEL} flatShading roughness={0.7} />
      </mesh>
      {/* Read from either side: the stand is out on the floor, and the
          front row's banner is the one a row behind looks up at too */}
      {[0, Math.PI].map((turn) => (
        <group key={turn} rotation={[0, turn, 0]}>
          <mesh position={[0, BANNER_MID - BANNER_HEIGHT / 2 + 0.05, 0.105]}>
            <planeGeometry args={[half * 2, 0.06]} />
            <meshBasicMaterial color={TEAL} />
          </mesh>
          {row === 0 && (
            <TextPlane
              text={upper(t(SHOWCASE.label))}
              width={Math.min(half * 2 - 0.4, 3.2)}
              aspect={8}
              color="#ffffff"
              outline=""
              position={[0, BANNER_MID + 0.03, 0.11]}
            />
          )}
        </group>
      ))}
    </group>
  )
}

/** The little light on the chin that says the screen is on, breathing. */
function PowerLight({ x, y }: { x: number; y: number }) {
  const lamp = useRef<Mesh>(null)
  useFrame((state) => {
    if (!lamp.current) return
    const pulse = (Math.sin(state.clock.elapsedTime * 2) + 1) / 2
    const mat = lamp.current.material as MeshStandardMaterial
    mat.emissiveIntensity = 0.8 + pulse * 1.6
  })
  return (
    <mesh ref={lamp} position={[x, y, 0.08]}>
      <sphereGeometry args={[0.04, 10, 8]} />
      <meshStandardMaterial
        color={TEAL}
        emissive={TEAL}
        emissiveIntensity={1}
      />
    </mesh>
  )
}

/**
 * The screenshot from public/projects/, and a drawn title card until it is
 * here — or for good, if it never is.
 *
 * The card is what the room shows rather than a blank screen, so a missing
 * file costs the picture and nothing else, the way a missing seal costs the
 * Academy nothing but the engraving.
 */
function useScreenshot(project: Project): Texture {
  const card = useMemo(() => titleCard(project), [project])
  const [shot, setShot] = useState<Texture | null>(null)

  useEffect(() => {
    let alive = true
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => {
      if (!alive || !image.naturalWidth) return
      const texture = new Texture(image)
      texture.colorSpace = SRGBColorSpace
      texture.anisotropy = 8
      texture.needsUpdate = true
      setShot(texture)
    }
    image.onerror = () => {
      /* No screenshot supplied: the title card stays up. */
    }
    image.src = `${import.meta.env.BASE_URL}projects/${project.image}`
    return () => {
      alive = false
    }
  }, [project])

  useEffect(() => () => card.dispose(), [card])
  useEffect(() => () => shot?.dispose(), [shot])

  return shot ?? card
}

/** A dark screen with the project's name across it. */
function titleCard(project: Project): Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 288
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#0e171f'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = TEAL
    ctx.fillRect(0, 0, canvas.width, 22)
    ctx.fillStyle = '#e8f6f3'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '700 40px "Baloo 2", "Trebuchet MS", system-ui, sans-serif'
    ctx.fillText(project.name, canvas.width / 2, canvas.height / 2, 470)
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}
