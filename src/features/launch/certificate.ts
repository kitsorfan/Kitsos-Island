import { PROFILE } from '../cv/profile'

/**
 * The prize: a certificate, in the visitor's own name, saying they walked the
 * whole island and left it by rocket.
 *
 * It is drawn to a canvas and handed over as a PNG rather than written as
 * text, because this is the one thing on the island somebody might actually
 * print or put in a message, and a wall of Markdown is not that. The whole
 * drawing is procedural, like everything else here: no image is fetched, no
 * font beyond what the page already loads, and the bundle does not grow.
 */

/** How big the certificate is, in pixels. Landscape, and print-sharp. */
export const CERT_WIDTH = 1600
export const CERT_HEIGHT = 1130

/** The longest name the card will letter before it starts shrinking. */
export const NAME_LIMIT = 42

/**
 * Tidies what was typed into the box into a name fit to letter.
 *
 * Collapses runs of whitespace, trims the ends and caps the length — a name
 * is what goes on the line, and the line has an end to it. Everything else is
 * left exactly as typed: it is their name, and a certificate that corrects
 * somebody's capitalisation is a certificate that gets their name wrong.
 */
export function cleanName(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, NAME_LIMIT)
}

/** True once there is something on the line worth signing. */
export function nameReady(raw: string): boolean {
  return cleanName(raw).length > 0
}

/** The filename the certificate is saved under. */
export function certFilename(name: string): string {
  const slug =
    cleanName(name)
      .toLowerCase()
      /* Anything that is not a letter or a digit becomes a hyphen — including
         accented letters, which survive as themselves rather than being
         stripped, so a Greek or German name still reads as a name. */
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '') || 'visitor'
  return `kitsos-island-certificate-${slug}.png`
}

/** The date on the certificate, written out long. */
export function certDate(on: Date = new Date()): string {
  return on.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** The wording, kept here so the card and the drawing cannot disagree. */
export const CERT_TEXT = {
  kicker: 'Kitsos Island',
  title: 'Certificate of Completion',
  lead: 'This certifies that',
  body: 'walked every road of Kitsos Island, opened all five locks of the Old Lighthouse, and left the island under their own power aboard the ship inside it.',
  signatory: `${PROFILE.firstName} "${PROFILE.nickname}" ${PROFILE.lastName}`,
  signatoryRole: PROFILE.title,
}

/**
 * Draws the certificate onto a canvas of the given size.
 *
 * Split out from the saving so a test can hand it a stub context and check
 * what was drawn without a document to draw into, and so the card can show
 * the very same drawing as a preview rather than an approximation of it.
 */
export function drawCertificate(
  ctx: CanvasRenderingContext2D,
  name: string,
  date: string = certDate(),
): void {
  const W = CERT_WIDTH
  const H = CERT_HEIGHT
  const mid = W / 2

  /* Parchment, with the lighthouse's own amber in the border. */
  ctx.fillStyle = '#fbf6ea'
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = '#f0a33c'
  ctx.lineWidth = 14
  ctx.strokeRect(34, 34, W - 68, H - 68)
  ctx.strokeStyle = '#2f3a44'
  ctx.lineWidth = 3
  ctx.strokeRect(62, 62, W - 124, H - 124)

  ctx.textAlign = 'center'

  /* The island's own mark: the tower, in the same bands it wears outside. */
  drawTower(ctx, mid, 150)

  ctx.fillStyle = '#8a6a3a'
  ctx.font = '600 34px Georgia, "Times New Roman", serif'
  ctx.fillText(CERT_TEXT.kicker.toUpperCase(), mid, 330)

  ctx.fillStyle = '#2f3a44'
  ctx.font = 'bold 76px Georgia, "Times New Roman", serif'
  ctx.fillText(CERT_TEXT.title, mid, 420)

  ctx.fillStyle = '#5c6670'
  ctx.font = 'italic 36px Georgia, "Times New Roman", serif'
  ctx.fillText(CERT_TEXT.lead, mid, 510)

  /* The name, lettered as large as the line will take it. */
  const clean = cleanName(name)
  let size = 96
  ctx.font = `bold ${size}px Georgia, "Times New Roman", serif`
  while (size > 44 && ctx.measureText(clean).width > W - 320) {
    size -= 4
    ctx.font = `bold ${size}px Georgia, "Times New Roman", serif`
  }
  ctx.fillStyle = '#c0392b'
  ctx.fillText(clean, mid, 610)

  /* A rule under the name, the width of the writing line. */
  ctx.strokeStyle = '#d8cfc0'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(240, 648)
  ctx.lineTo(W - 240, 648)
  ctx.stroke()

  /* The citation, wrapped by hand: canvas will not do it. */
  ctx.fillStyle = '#3c4650'
  ctx.font = '32px Georgia, "Times New Roman", serif'
  wrapText(ctx, CERT_TEXT.body, mid, 716, W - 380, 46)

  /* Signed, bottom right; dated, bottom left. */
  ctx.textAlign = 'left'
  ctx.fillStyle = '#5c6670'
  ctx.font = '26px Georgia, "Times New Roman", serif'
  ctx.fillText(date, 150, H - 150)
  ctx.strokeStyle = '#d8cfc0'
  ctx.beginPath()
  ctx.moveTo(150, H - 176)
  ctx.lineTo(520, H - 176)
  ctx.stroke()
  ctx.fillStyle = '#8a929a'
  ctx.font = '22px Georgia, "Times New Roman", serif'
  ctx.fillText('Date of departure', 150, H - 116)

  ctx.textAlign = 'right'
  ctx.fillStyle = '#2f3a44'
  ctx.font = 'italic 40px Georgia, "Times New Roman", serif'
  ctx.fillText(CERT_TEXT.signatory, W - 150, H - 190)
  ctx.strokeStyle = '#d8cfc0'
  ctx.beginPath()
  ctx.moveTo(W - 520, H - 176)
  ctx.lineTo(W - 150, H - 176)
  ctx.stroke()
  ctx.fillStyle = '#5c6670'
  ctx.font = '24px Georgia, "Times New Roman", serif'
  ctx.fillText(CERT_TEXT.signatoryRole, W - 150, H - 138)
  ctx.fillStyle = '#8a929a'
  ctx.font = '22px Georgia, "Times New Roman", serif'
  ctx.fillText('Keeper of the island', W - 150, H - 104)
}

/** The lighthouse, small, in the bands it is painted in outside. */
function drawTower(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const bands = 5
  const h = 26
  for (let i = 0; i < bands; i++) {
    const top = y + i * h
    const wTop = 62 - i * 7
    const wBottom = 62 - (i - 1) * 7
    ctx.fillStyle = i % 2 === 0 ? '#f6f1e4' : '#c0392b'
    ctx.beginPath()
    ctx.moveTo(x - wBottom / 2, top + h)
    ctx.lineTo(x + wBottom / 2, top + h)
    ctx.lineTo(x + wTop / 2, top)
    ctx.lineTo(x - wTop / 2, top)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = '#2f3a44'
    ctx.lineWidth = 2
    ctx.stroke()
  }
  /* The lamp, lit. */
  ctx.fillStyle = '#ffbe4d'
  ctx.beginPath()
  ctx.arc(x, y - 6, 17, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#2f3a44'
  ctx.lineWidth = 2
  ctx.stroke()
}

/**
 * Lays `text` out in lines no wider than `maxWidth`, centred on `x`.
 *
 * Returns the number of lines drawn, which is what a test can check without
 * a raster to look at.
 */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(' ')
  let line = ''
  let drawn = 0
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (line && ctx.measureText(next).width > maxWidth) {
      ctx.fillText(line, x, y + drawn * lineHeight)
      drawn++
      line = word
    } else {
      line = next
    }
  }
  if (line) {
    ctx.fillText(line, x, y + drawn * lineHeight)
    drawn++
  }
  return drawn
}

/**
 * Draws the certificate and hands it over as a PNG.
 *
 * Touches the document, so it sits apart from the drawing above the way
 * `downloadCv` sits apart from the CV data.
 */
export function downloadCertificate(name: string): void {
  const canvas = document.createElement('canvas')
  canvas.width = CERT_WIDTH
  canvas.height = CERT_HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  drawCertificate(ctx, name)

  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = certFilename(name)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }, 'image/png')
}
