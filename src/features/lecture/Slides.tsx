import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { useGame } from '../../shared/state/store'
import { SLIDES } from './lecture'
import { useT } from '../../shared/i18n/useT'

/**
 * The slide on the blackboard, while the defence is being given.
 *
 * It is chalk rather than a projector: the hall has a blackboard in it and
 * nothing else, and a lit rectangle floating over a 1970s polytechnic board
 * would be the one thing in the room that came from somewhere else. So the
 * whole slide — heading, rule and body — is drawn to one canvas in a hand
 * that is not quite straight and laid over the board's face.
 *
 * One canvas rather than a plane per line: a slide turns every eight seconds
 * and there are eight of them, so this is eight textures over the whole
 * defence rather than forty, and each one is thrown away as it goes.
 */

const CHALK = '#eef3ea'
const CHALK_SOFT = '#cfd8cd'

/** The board is 6.2 wide by 2 high, and the slide is drawn to fit it. */
const ASPECT = 6.2 / 2
const WIDTH = 1280

function draw(title: string, lines: string[]): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = Math.round(WIDTH / ASPECT)
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  const font = '"Baloo 2", "Trebuchet MS", "Segoe UI", system-ui, sans-serif'
  const pad = canvas.width * 0.055

  /* The heading, shrunk until it fits the width rather than wrapped: these
     are slide titles, and a slide title that takes two lines is a sentence. */
  let size = Math.round(canvas.height * 0.15)
  const room = canvas.width - pad * 2
  do {
    ctx.font = `700 ${size}px ${font}`
    size -= 2
  } while (ctx.measureText(title).width > room && size > 14)

  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = CHALK
  const top = pad + size
  ctx.fillText(title, pad, top)

  /* The rule under it, drawn as a chalk line: a stroke that wanders a pixel
     or two, because nobody rules a straight line on a blackboard. */
  ctx.strokeStyle = CHALK_SOFT
  ctx.lineWidth = 3
  ctx.globalAlpha = 0.75
  ctx.beginPath()
  const ruleY = top + size * 0.32
  const ruleTo = Math.min(
    canvas.width - pad,
    pad + ctx.measureText(title).width,
  )
  for (let x = pad; x <= ruleTo; x += 16) {
    const wobble = Math.sin(x * 0.07) * 1.6
    if (x === pad) ctx.moveTo(x, ruleY + wobble)
    else ctx.lineTo(x, ruleY + wobble)
  }
  ctx.stroke()
  ctx.globalAlpha = 1

  /* And the body under that, one line per line: they are written to fit, so
     nothing here wraps and nothing is measured twice. */
  let body = Math.round(canvas.height * 0.098)
  const fits = () => {
    ctx.font = `600 ${body}px ${font}`
    return lines.every((line) => ctx.measureText(line).width <= room)
  }
  while (!fits() && body > 12) body -= 2

  ctx.fillStyle = CHALK_SOFT
  const lead = body * 1.45
  const start = ruleY + body * 1.5
  lines.forEach((line, i) => {
    ctx.fillText(line, pad, start + i * lead)
  })

  return canvas
}

/**
 * The board's face during the defence, and nothing at all outside it.
 *
 * Drawn in the blackboard's own frame — the hall's board stands at [0, -12.4]
 * against the north wall — a shade proud of the slate so it never fights it
 * for the same depth.
 */
export function Slides() {
  const at = useGame((s) => s.lecture)
  const t = useT()
  const index = at?.slide ?? 0
  const slide = SLIDES[index]

  const texture = useMemo(() => {
    if (!slide) return null
    const tex = new CanvasTexture(draw(t(slide.title), slide.lines.map(t)))
    tex.colorSpace = SRGBColorSpace
    tex.anisotropy = 8
    return tex
  }, [slide, t])

  useEffect(() => () => texture?.dispose(), [texture])

  if (!at || !texture) return null

  return (
    <mesh position={[0, 1.7, -12.24]}>
      <planeGeometry args={[6.2, 2]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  )
}
