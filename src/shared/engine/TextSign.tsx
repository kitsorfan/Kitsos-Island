import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'

interface TextPlaneProps {
  text: string
  /** World width of the plane; height follows the aspect ratio. */
  width: number
  color?: string
  outline?: string
  bold?: boolean
  aspect?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  /**
   * Drawing order against other transparent surfaces at the same depth. Text
   * laid on a lit panel needs it: two planes a couple of millimetres apart
   * are otherwise sorted by distance alone, which is free to put the panel
   * over the words.
   */
  renderOrder?: number
}

const FONT_STACK =
  '"Baloo 2", "Trebuchet MS", "Segoe UI", system-ui, sans-serif'

function draw(
  text: string,
  color: string,
  outline: string | undefined,
  bold: boolean,
  aspect: number,
) {
  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = Math.round(768 / aspect)
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  const weight = bold ? '800' : '600'
  let size = Math.round(canvas.height * 0.62)
  const maxWidth = canvas.width * 0.92
  do {
    ctx.font = `${weight} ${size}px ${FONT_STACK}`
    size -= 4
  } while (ctx.measureText(text).width > maxWidth && size > 12)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const cx = canvas.width / 2
  const cy = canvas.height / 2

  if (outline) {
    ctx.lineWidth = size * 0.24
    ctx.lineJoin = 'round'
    ctx.strokeStyle = outline
    ctx.strokeText(text, cx, cy)
  }
  ctx.fillStyle = color
  ctx.fillText(text, cx, cy)
  return canvas
}

/** Crisp in-world text, drawn to a canvas so nothing is fetched at runtime. */
export function TextPlane({
  text,
  width,
  color = '#ffffff',
  outline = '#2b2118',
  bold = true,
  aspect = 6,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  renderOrder,
}: TextPlaneProps) {
  const texture = useMemo(() => {
    const tex = new CanvasTexture(draw(text, color, outline, bold, aspect))
    tex.colorSpace = SRGBColorSpace
    tex.anisotropy = 8
    return tex
  }, [text, color, outline, bold, aspect])

  useEffect(() => () => texture.dispose(), [texture])

  return (
    <mesh position={position} rotation={rotation} renderOrder={renderOrder}>
      <planeGeometry args={[width, width / aspect]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  )
}
