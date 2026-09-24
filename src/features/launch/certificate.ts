import { PROFILE } from '../cv/profile'
import { TROPHIES } from './trophies'
import type { Trophy } from './trophies'
import { formatSerial } from './certId'

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
  /* Signed the way he signs things, not the way the CV heads itself: the
     nickname is the name here, so no quoted middle and no given name. */
  signatory: `${PROFILE.nickname} ${PROFILE.lastName}`,
  signatoryRole: PROFILE.title,
}

/**
 * Draws the certificate onto a canvas of the given size.
 *
 * Split out from the saving so a test can hand it a stub context and check
 * what was drawn without a document to draw into, and so the card can show
 * the very same drawing as a preview rather than an approximation of it.
 */
export interface CertificateDetail {
  /** Trophy ids the visitor has actually won. */
  trophies?: Record<string, true>
  /** The serial and its signature, as minted for this certificate. */
  serial?: { serial: number; signature: number }
}

export function drawCertificate(
  ctx: CanvasRenderingContext2D,
  name: string,
  date: string = certDate(),
  detail: CertificateDetail = {},
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

  /*
   * The citation, wrapped by hand: canvas will not do it.
   *
   * Set small enough to keep to two lines, the way the name is set to its
   * line: at 30px it ran to a third, and the third sat right where the
   * "ISLAND GAMES" heading over the stickers is lettered.
   */
  ctx.fillStyle = '#3c4650'
  const citeWidth = W - 380
  let citeSize = 30
  ctx.font = `${citeSize}px Georgia, "Times New Roman", serif`
  while (
    citeSize > 22 &&
    splitLines(ctx, CERT_TEXT.body, citeWidth).length > 2
  ) {
    citeSize -= 2
    ctx.font = `${citeSize}px Georgia, "Times New Roman", serif`
  }
  const citeLead = Math.round(citeSize * 1.4)
  const citeLines = wrapText(ctx, CERT_TEXT.body, mid, 706, citeWidth, citeLead)
  const citeEnd = 706 + (citeLines - 1) * citeLead

  /* The stickers, in a row under the citation, whatever it came to. Their
     heading is lettered 50 above the row, so the row keeps a clear line
     under the last baseline — but never lower than 844, past which the
     labels run into the signature band. */
  const rowY = Math.min(844, Math.max(820, citeEnd + 88))
  drawTrophies(ctx, mid, rowY, detail.trophies ?? {})

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

  /*
   * The reference, centred along the very bottom.
   *
   * Small and monospaced, the way a serial on a real document is: it is not
   * meant to be read so much as typed back in, and the eye should pass over
   * it on the way to the signature.
   */
  if (detail.serial) {
    /*
     * Inside the frame, which is where this went wrong the first time: at
     * H - 52 the baseline sat ten pixels below the inner border and the
     * reference was printed out in the margin, off the document. The border
     * runs to H - 62, so anything meant to be on the certificate has to
     * clear that by a line of its own.
     */
    ctx.textAlign = 'center'
    ctx.fillStyle = '#9a8c74'
    ctx.font = '19px "Courier New", Courier, monospace'
    ctx.fillText(
      formatSerial(detail.serial.serial, detail.serial.signature),
      mid,
      H - 96,
    )
    ctx.fillStyle = '#b8ae9c'
    ctx.font = '15px Georgia, "Times New Roman", serif'
    ctx.fillText('Certificate reference · verifiable', mid, H - 74)
  }
}

/**
 * The row of stickers: one per minigame won, greyed where it was not.
 *
 * All six are always drawn rather than only the won ones. A row that grows
 * says nothing about what is missing, and the point of a sticker sheet is
 * the gaps as much as the stickers — somebody who won four should be able to
 * see which two they did not.
 */
function drawTrophies(
  ctx: CanvasRenderingContext2D,
  mid: number,
  y: number,
  won: Record<string, true>,
): void {
  /*
   * The pitch is set by the labels, not the rings — and the row as a whole
   * has to clear the signature.
   *
   * Widening it alone was not enough: at 176 the row ran out to x = 1280
   * while "Kitsos Orfanopoulos" starts around 1070, and the labels sat at
   * y = 936 against a signature baseline of 940. The last two stickers and
   * the signature were in the same band of the page. Tighter and higher
   * fixes both.
   */
  const gap = 150
  const left = mid - ((TROPHIES.length - 1) * gap) / 2

  ctx.textAlign = 'center'
  ctx.fillStyle = '#a89a80'
  ctx.font = '600 20px Georgia, "Times New Roman", serif'
  ctx.fillText('ISLAND GAMES', mid, y - 50)

  for (let i = 0; i < TROPHIES.length; i++) {
    const trophy = TROPHIES[i]
    drawTrophy(ctx, left + i * gap, y, trophy, Boolean(won[trophy.id]))
  }
}

/** How wide the ring round one sticker is. */
const TROPHY_RADIUS = 32

/** One sticker: a ring, a mark inside it, and the name under it. */
function drawTrophy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  trophy: Trophy,
  won: boolean,
): void {
  /* Unwon ones stay on the sheet in outline, so the gaps are legible. */
  const ink = won ? trophy.color : '#cfc6b6'

  /* The disc. */
  ctx.beginPath()
  ctx.arc(x, y, TROPHY_RADIUS, 0, Math.PI * 2)
  ctx.fillStyle = won ? '#fffdf8' : '#f4efe4'
  ctx.fill()
  ctx.lineWidth = won ? 4 : 2
  ctx.strokeStyle = ink
  ctx.stroke()

  drawTrophyIcon(ctx, x, y, trophy.icon, ink)

  /* The name under it. */
  ctx.fillStyle = won ? '#5c6670' : '#b8ae9c'
  ctx.font = `${won ? '600' : '400'} 14px Georgia, "Times New Roman", serif`
  ctx.fillText(trophy.label, x, y + TROPHY_RADIUS + 22)
}

/**
 * The mark inside a sticker.
 *
 * Six small line drawings rather than emoji: the emoji for half of these
 * render as a blank box on Windows, which is the same trap the flags in
 * `PanelBlock` were built to dodge — and a certificate is the one thing here
 * somebody might print.
 */
function drawTrophyIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  icon: Trophy['icon'],
  ink: string,
): void {
  ctx.strokeStyle = ink
  ctx.fillStyle = ink
  ctx.lineWidth = 3
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  switch (icon) {
    /* Paintball: a target, and a splat off centre. */
    case 'target': {
      for (const r of [18, 11]) {
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.arc(x + 7, y - 8, 4.5, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    /* The circuit: two wheels and a bar over them. */
    case 'bike': {
      for (const dx of [-12, 12]) {
        ctx.beginPath()
        ctx.arc(x + dx, y + 8, 8, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.moveTo(x - 12, y + 8)
      ctx.lineTo(x - 2, y - 6)
      ctx.lineTo(x + 12, y + 8)
      ctx.moveTo(x - 2, y - 6)
      ctx.lineTo(x + 9, y - 9)
      ctx.stroke()
      break
    }
    /* The balloon: an envelope and the basket under it. */
    case 'balloon': {
      ctx.beginPath()
      ctx.arc(x, y - 6, 13, Math.PI * 0.05, Math.PI * 0.95, true)
      ctx.lineTo(x + 5, y + 8)
      ctx.lineTo(x - 5, y + 8)
      ctx.closePath()
      ctx.stroke()
      ctx.strokeRect(x - 5, y + 9, 10, 8)
      break
    }
    /* Sea rescue: a hull on a wave. */
    case 'boat': {
      ctx.beginPath()
      ctx.moveTo(x - 16, y)
      ctx.lineTo(x + 16, y)
      ctx.lineTo(x + 9, y + 11)
      ctx.lineTo(x - 9, y + 11)
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, y - 14)
      ctx.lineTo(x + 11, y - 5)
      ctx.lineTo(x, y - 5)
      ctx.stroke()
      break
    }
    /* Seeking: a torch, and the beam out of it. */
    case 'torch': {
      ctx.beginPath()
      ctx.moveTo(x - 14, y + 10)
      ctx.lineTo(x - 2, y - 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x - 2, y - 2)
      ctx.lineTo(x + 14, y - 12)
      ctx.lineTo(x + 14, y + 4)
      ctx.closePath()
      ctx.fill()
      break
    }
    /*
     * Hiding: two eyes looking out over something you are behind.
     *
     * It was a crescent moon, which was wrong twice over - it reads as a
     * religious symbol before it reads as night, and "it was dark" is the
     * setting rather than the achievement. Not being found is: so the mark
     * is somebody watching from cover, which is the thing the sticker is
     * actually for.
     */
    case 'hiding': {
      /* The cover: a low bank across the bottom of the disc. */
      ctx.beginPath()
      ctx.moveTo(x - 17, y + 13)
      ctx.lineTo(x + 17, y + 13)
      ctx.lineTo(x + 17, y + 4)
      ctx.quadraticCurveTo(x, y - 3, x - 17, y + 4)
      ctx.closePath()
      ctx.fill()
      /* And the pair of eyes over the top of it. */
      for (const dx of [-7, 7]) {
        ctx.beginPath()
        ctx.ellipse(x + dx, y - 6, 5.5, 4, 0, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(x + dx, y - 6, 2.1, 0, Math.PI * 2)
        ctx.fill()
      }
      break
    }
  }
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
  const lines = splitLines(ctx, text, maxWidth)
  lines.forEach((line, i) => ctx.fillText(line, x, y + i * lineHeight))
  return lines.length
}

/** The lines `wrapText` would draw, in the current font, without drawing them. */
export function splitLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

/**
 * Draws the certificate and hands it over as a PNG.
 *
 * Touches the document, so it sits apart from the drawing above the way
 * `downloadCv` sits apart from the CV data.
 */
export function downloadCertificate(
  name: string,
  detail: CertificateDetail = {},
): void {
  const canvas = document.createElement('canvas')
  canvas.width = CERT_WIDTH
  canvas.height = CERT_HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  drawCertificate(ctx, name, certDate(), detail)

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
