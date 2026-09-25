/**
 * The certificate as a one-page PDF: the drawing, and a link on it.
 *
 * A PDF rather than the picture, because a picture cannot be clicked. The
 * reference along the bottom is meant to be checked, and on paper that means
 * typing it; in a PDF — on LinkedIn, in a mail — it is a link straight to
 * the verifier, carrying the name it was made for.
 *
 * Written out by hand rather than through a library. What is needed is one
 * page, one JPEG and one link annotation, which is a few hundred bytes of
 * structure around the image; a PDF library would be a hundred times that,
 * shipped to every visitor for the one who reaches orbit.
 */

export interface PdfImage {
  /** A baseline JPEG, as bytes. */
  jpeg: Uint8Array
  /** Its size in pixels. */
  width: number
  height: number
}

export interface PdfLink {
  url: string
  /** The clickable area, in the image's own pixels, from its top left. */
  x: number
  y: number
  w: number
  h: number
}

export interface PdfInfo {
  title: string
  author: string
  subject?: string
}

/** The page is A4 landscape across, and as tall as the drawing makes it. */
export const PAGE_WIDTH = 842

/**
 * A string as a PDF text string.
 *
 * Hex-encoded UTF-16 with a byte-order mark, which is the one form every
 * reader takes for text outside Latin-1 — and a name on this certificate is
 * as likely to be Greek as not.
 */
export function pdfText(text: string): string {
  let hex = 'FEFF'
  for (let i = 0; i < text.length; i++) {
    hex += text.charCodeAt(i).toString(16).toUpperCase().padStart(4, '0')
  }
  return `<${hex}>`
}

/**
 * A URL as a PDF string. The link is built with `encodeURIComponent`, so it
 * is ASCII already; only the three characters a literal string treats
 * specially need escaping.
 */
export function pdfAscii(text: string): string {
  return `(${text.replace(/[\\()]/g, (c) => `\\${c}`)})`
}

/** Four numbers to two places, the way a rectangle is written. */
const fmt = (n: number) => String(Math.round(n * 100) / 100)

/**
 * Builds the PDF.
 *
 * Objects are laid down in order and their byte offsets noted as they go,
 * which is all the cross-reference table at the end is: where each one
 * starts. Offsets are bytes, not characters, so everything is encoded as it
 * is written rather than joined as text and encoded at the end.
 */
export function buildPdf(
  image: PdfImage,
  link: PdfLink | null,
  info: PdfInfo,
): Uint8Array {
  const pageW = PAGE_WIDTH
  const scale = pageW / image.width
  const pageH = image.height * scale

  const encoder = new TextEncoder()
  const chunks: Uint8Array[] = []
  const offsets: number[] = []
  let length = 0

  const put = (part: string | Uint8Array) => {
    const bytes = typeof part === 'string' ? encoder.encode(part) : part
    chunks.push(bytes)
    length += bytes.length
  }
  const object = (id: number, body: string | (string | Uint8Array)[]) => {
    offsets[id] = length
    put(`${id} 0 obj\n`)
    for (const part of Array.isArray(body) ? body : [body]) put(part)
    put('\nendobj\n')
  }

  /* The header, and the four high bytes that tell a transfer it is binary. */
  put('%PDF-1.4\n')
  put(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]))

  const draw = `q ${fmt(pageW)} 0 0 ${fmt(pageH)} 0 0 cm /Cert Do Q`

  object(1, '<< /Type /Catalog /Pages 2 0 R >>')
  object(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>')
  object(
    3,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${fmt(pageW)} ${fmt(pageH)}]` +
      ` /Resources << /XObject << /Cert 5 0 R >> >> /Contents 4 0 R` +
      (link ? ' /Annots [6 0 R]' : '') +
      ' >>',
  )
  object(4, [`<< /Length ${draw.length} >>\nstream\n`, draw, '\nendstream'])
  object(5, [
    `<< /Type /XObject /Subtype /Image /Width ${image.width}` +
      ` /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8` +
      ` /Filter /DCTDecode /Length ${image.jpeg.length} >>\nstream\n`,
    image.jpeg,
    '\nendstream',
  ])
  if (link) {
    /* PDF measures from the bottom left; the drawing, from the top left. */
    const x1 = link.x * scale
    const x2 = (link.x + link.w) * scale
    const y1 = pageH - (link.y + link.h) * scale
    const y2 = pageH - link.y * scale
    object(
      6,
      `<< /Type /Annot /Subtype /Link /Rect [${[x1, y1, x2, y2].map(fmt).join(' ')}]` +
        ` /Border [0 0 0] /A << /S /URI /URI ${pdfAscii(link.url)} >> >>`,
    )
  }
  const infoId = link ? 7 : 6
  object(
    infoId,
    `<< /Title ${pdfText(info.title)} /Author ${pdfText(info.author)}` +
      (info.subject ? ` /Subject ${pdfText(info.subject)}` : '') +
      ` /Creator ${pdfAscii('Kitsos Island')} >>`,
  )

  const xref = length
  const count = infoId + 1
  let table = `xref\n0 ${count}\n0000000000 65535 f \n`
  for (let id = 1; id < count; id++) {
    table += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`
  }
  put(table)
  put(
    `trailer\n<< /Size ${count} /Root 1 0 R /Info ${infoId} 0 R >>\n` +
      `startxref\n${xref}\n%%EOF\n`,
  )

  const out = new Uint8Array(length)
  let at = 0
  for (const chunk of chunks) {
    out.set(chunk, at)
    at += chunk.length
  }
  return out
}
