import { useEffect, useMemo, useState } from 'react'
import { CanvasTexture, SRGBColorSpace, Texture } from 'three'

/**
 * Institution marks. Each one prefers a real file from `public/marks/` and
 * falls back to a version drawn in code, so the island renders with or without
 * the artwork. The fallbacks are deliberately stylised — they stand in for the
 * official marks rather than imitating them.
 */

const FONT = '"Baloo 2", "Trebuchet MS", "Segoe UI", system-ui, sans-serif'

/* ---------------------------- texture plumbing ------------------------ */

function useDrawnTexture(
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  width: number,
  height: number,
  key: string,
) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (ctx) draw(ctx, width, height)
    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    tex.anisotropy = 8
    return tex
    // Each mark passes a stable draw function; `key` identifies it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, width, height])

  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

/** The real artwork, if someone has dropped it into public/marks/. */
function useSuppliedTexture(file: string) {
  const [texture, setTexture] = useState<Texture | null>(null)

  useEffect(() => {
    let alive = true
    const image = new Image()

    image.onload = () => {
      // An SVG without explicit dimensions decodes to nothing useful.
      if (!alive || !image.naturalWidth || !image.naturalHeight) return
      const tex = new Texture(image)
      tex.colorSpace = SRGBColorSpace
      tex.anisotropy = 8
      tex.needsUpdate = true
      setTexture(tex)
    }
    image.onerror = () => {
      /* No file supplied — the drawn fallback stands. */
    }
    image.src = `${import.meta.env.BASE_URL}marks/${file}`

    return () => {
      alive = false
    }
  }, [file])

  useEffect(
    () => () => {
      texture?.dispose()
    },
    [texture],
  )

  return texture
}

/* ------------------------------ NTUA seal ----------------------------- */

const SEAL_INK = '#14110d'
const SEAL_GROUND = '#f7f4ec'

/** Distributes text around an arc, each glyph turned to face outward. */
function arcText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  radius: number,
  centreAngle: number,
  spread: number,
  size: number,
) {
  ctx.save()
  ctx.font = `700 ${size}px ${FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const chars = [...text]
  const step = spread / Math.max(1, chars.length - 1)
  const start = centreAngle - spread / 2

  chars.forEach((ch, i) => {
    const a = start + i * step
    ctx.save()
    ctx.translate(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius)
    ctx.rotate(a + Math.PI / 2)
    ctx.fillText(ch, 0, 0)
    ctx.restore()
  })
  ctx.restore()
}

/**
 * A monochrome stand-in for the NTUA seal: the circumscription, a striding
 * torch-bearer and the flaming column, in the black-figure spirit of the
 * original without pretending to be it.
 */
function drawNtuaSeal(ctx: CanvasRenderingContext2D, w: number) {
  const c = w / 2
  const u = w / 100
  ctx.clearRect(0, 0, w, w)

  ctx.fillStyle = SEAL_GROUND
  ctx.beginPath()
  ctx.arc(c, c, c - u, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = SEAL_INK
  ctx.fillStyle = SEAL_INK
  ctx.lineWidth = u * 2.2
  ctx.beginPath()
  ctx.arc(c, c, c - u * 2, 0, Math.PI * 2)
  ctx.stroke()
  ctx.lineWidth = u * 1.1
  ctx.beginPath()
  ctx.arc(c, c, c - u * 13, 0, Math.PI * 2)
  ctx.stroke()

  arcText(
    ctx,
    'ΕΘΝΙΚΟΝ ΜΕΤΣΟΒΙΟΝ ΠΟΛΥΤΕΧΝΕΙΟΝ',
    c,
    c,
    c - u * 7.5,
    -Math.PI / 2,
    4.5,
    u * 6.4,
  )

  // Ground line the figures stand on.
  ctx.fillRect(c - u * 30, c + u * 27, u * 60, u * 3.4)

  /* --- the flaming column, to the right --- */
  const colX = c + u * 20
  ctx.fillRect(colX - u * 7, c + u * 22, u * 14, u * 4)
  ctx.fillRect(colX - u * 5.5, c + u * 19, u * 11, u * 3)
  for (let i = -2; i <= 2; i++) {
    ctx.fillRect(colX + i * u * 2.4 - u * 0.6, c - u * 7, u * 1.2, u * 26)
  }
  ctx.fillRect(colX - u * 6.5, c - u * 11, u * 13, u * 4)
  ctx.fillRect(colX - u * 7.5, c - u * 14, u * 15, u * 3)

  const tongue = (x: number, base: number, h: number, lean: number) => {
    ctx.beginPath()
    ctx.moveTo(x, base)
    ctx.quadraticCurveTo(
      x + u * 2.1 + lean,
      base - h * 0.62,
      x + lean,
      base - h,
    )
    ctx.quadraticCurveTo(x - u * 2.1 + lean, base - h * 0.55, x, base)
    ctx.fill()
  }
  tongue(colX - u * 4.5, c - u * 14, u * 14, -u * 1.5)
  tongue(colX, c - u * 14, u * 19, u * 0.5)
  tongue(colX + u * 4.5, c - u * 14, u * 13, u * 2)

  /* --- the torch-bearer, striding left of centre --- */
  const fx = c - u * 12

  // Head with a headband, and a beard.
  ctx.beginPath()
  ctx.arc(fx + u * 2, c - u * 20, u * 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillRect(fx - u * 3.6, c - u * 24, u * 11, u * 2.4)
  ctx.beginPath()
  ctx.moveTo(fx - u * 2.5, c - u * 19)
  ctx.lineTo(fx + u * 2, c - u * 13)
  ctx.lineTo(fx + u * 3, c - u * 17)
  ctx.closePath()
  ctx.fill()

  // Torso, leaning into the stride.
  ctx.beginPath()
  ctx.moveTo(fx - u * 2, c - u * 15)
  ctx.lineTo(fx + u * 8, c - u * 14)
  ctx.lineTo(fx + u * 7, c + u * 2)
  ctx.lineTo(fx - u * 1, c + u * 1)
  ctx.closePath()
  ctx.fill()

  // Raised arm, and the arm carrying the torch.
  ctx.lineWidth = u * 2.6
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(fx + u * 4, c - u * 13)
  ctx.lineTo(fx + u * 9, c - u * 22)
  ctx.lineTo(fx + u * 7.5, c - u * 30)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(fx + u * 7.5, c - u * 31.5, u * 2.1, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(fx, c - u * 11)
  ctx.lineTo(fx - u * 8, c - u * 5)
  ctx.stroke()

  // Legs, mid-stride.
  ctx.lineWidth = u * 4.2
  ctx.beginPath()
  ctx.moveTo(fx + u * 5, c + u * 1)
  ctx.lineTo(fx + u * 1, c + u * 14)
  ctx.lineTo(fx - u * 4, c + u * 26)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(fx + u * 6, c + u * 1)
  ctx.lineTo(fx + u * 13, c + u * 13)
  ctx.lineTo(fx + u * 11, c + u * 26)
  ctx.stroke()
  ctx.fillRect(fx - u * 8, c + u * 25, u * 8, u * 2.6)
  ctx.fillRect(fx + u * 8, c + u * 25, u * 8, u * 2.6)

  // The torch itself, held low and to the left.
  ctx.lineWidth = u * 3
  ctx.beginPath()
  ctx.moveTo(fx - u * 6, c - u * 3)
  ctx.lineTo(fx - u * 17, c - u * 13)
  ctx.stroke()
  tongue(fx - u * 19, c - u * 13, u * 15, -u * 2)
  tongue(fx - u * 14.5, c - u * 14, u * 11, u * 1.5)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `700 ${u * 4.4}px ${FONT}`
  ctx.fillText('ΠΡΟΜΗΘΕΥΣ ΠΥΡΦΟΡΟΣ', c, c + u * 34)
}

export function NtuaSeal({
  size = 1.8,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: {
  size?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
}) {
  const drawn = useDrawnTexture(
    (ctx, w) => drawNtuaSeal(ctx, w),
    640,
    640,
    'ntua',
  )
  const supplied = useSuppliedTexture('ntua.png')

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial
        map={supplied ?? drawn}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

/* ------------------------------ IBM mark ------------------------------ */

const IBM_BLUE = '#1f70c1'

/** The letters, then horizontal gaps cut back out of them. */
function drawIbmMark(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h)

  ctx.fillStyle = IBM_BLUE
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `800 ${h * 0.86}px ${FONT}`
  ctx.fillText('IBM', w / 2, h * 0.52)

  ctx.globalCompositeOperation = 'destination-out'
  const bars = 8
  const band = h * 0.66
  const top = h * 0.52 - band / 2
  const pitch = band / bars
  for (let i = 1; i < bars; i++) {
    ctx.fillRect(0, top + i * pitch - pitch * 0.17, w, pitch * 0.34)
  }
  ctx.globalCompositeOperation = 'source-over'
}

export function IbmMark({
  width = 4,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: {
  width?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
}) {
  const drawn = useDrawnTexture(drawIbmMark, 512, 256, 'ibm')
  const supplied = useSuppliedTexture('ibm.png')

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, width / 2]} />
      <meshBasicMaterial
        map={supplied ?? drawn}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

/* --------------------------- Veltiston mark --------------------------- */

function drawVeltiston(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h)

  // A node-and-spoke glyph, then the wordmark beside it.
  const cx = h * 0.52
  const cy = h * 0.5
  const r = h * 0.3
  ctx.strokeStyle = '#7ef0d6'
  ctx.fillStyle = '#7ef0d6'
  ctx.lineWidth = h * 0.07
  ctx.lineCap = 'round'
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 - Math.PI / 2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(
      cx + Math.cos(a) * r,
      cy + Math.sin(a) * r,
      h * 0.085,
      0,
      Math.PI * 2,
    )
    ctx.fill()
  }
  ctx.beginPath()
  ctx.arc(cx, cy, h * 0.1, 0, Math.PI * 2)
  ctx.fill()

  // Fit the wordmark to whatever room is left beside the glyph.
  const label = 'VELTISTON'
  const suffix = '.AI'
  const startX = h * 1.05
  const room = w - startX - h * 0.12

  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  let size = h * 0.52
  do {
    ctx.font = `800 ${size}px ${FONT}`
    size -= 2
  } while (ctx.measureText(label + suffix).width > room && size > 12)

  ctx.fillStyle = '#eafcf7'
  ctx.fillText(label, startX, cy)
  ctx.fillStyle = '#7ef0d6'
  ctx.fillText(suffix, startX + ctx.measureText(label).width, cy)
}

export function VeltistonMark({
  width = 6,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: {
  width?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
}) {
  const drawn = useDrawnTexture(drawVeltiston, 1024, 256, 'veltiston')
  const supplied = useSuppliedTexture('veltiston.png')

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, width / 4]} />
      <meshBasicMaterial
        map={supplied ?? drawn}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}
