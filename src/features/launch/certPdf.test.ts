import { describe, expect, it } from 'vitest'
import { PAGE_WIDTH, buildPdf, pdfAscii, pdfText } from './certPdf'

/** A stand-in for a JPEG: the reader never decodes it here, only frames it. */
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 1, 2, 3, 0xff, 0xd9])

const decode = (bytes: Uint8Array) => new TextDecoder('latin1').decode(bytes)

function build(link = true) {
  return buildPdf(
    { jpeg: JPEG, width: 1600, height: 1130 },
    link
      ? {
          url: 'https://www.kitsorfan.com/verify/KI-1-2?name=Ada',
          x: 560,
          y: 1012,
          w: 480,
          h: 52,
        }
      : null,
    { title: 'Certificate — Χρήστος', author: 'Kitsos Orfanopoulos' },
  )
}

describe('the certificate PDF', () => {
  it('is framed as a PDF, start and end', () => {
    const text = decode(build())
    expect(text.startsWith('%PDF-1.4\n')).toBe(true)
    expect(text.trimEnd().endsWith('%%EOF')).toBe(true)
  })

  it('points its cross-reference table at the objects it wrote', () => {
    /*
     * The one part a reader is strict about. An offset that is a character
     * count rather than a byte count is off by every non-ASCII byte before
     * it, and the JPEG is nothing but - so each has to land exactly on its
     * `n 0 obj`.
     */
    const text = decode(build())
    const xref = Number(/startxref\n(\d+)/.exec(text)![1])
    expect(text.slice(xref, xref + 4)).toBe('xref')
    const entries = [...text.slice(xref).matchAll(/(\d{10}) 00000 n /g)]
    expect(entries).toHaveLength(7)
    entries.forEach(([, offset], i) => {
      expect(text.slice(Number(offset)).startsWith(`${i + 1} 0 obj`)).toBe(true)
    })
  })

  it('carries the image bytes untouched', () => {
    const text = decode(build())
    expect(text).toContain(decode(JPEG))
    expect(text).toContain('/Filter /DCTDecode /Length 10')
  })

  it('puts the link where the reference is printed, measured from the bottom', () => {
    const text = decode(build())
    const scale = PAGE_WIDTH / 1600
    const pageH = 1130 * scale
    const rect = /\/Rect \[([^\]]+)\]/.exec(text)![1].split(' ').map(Number)
    expect(rect[0]).toBeCloseTo(560 * scale, 1)
    expect(rect[2]).toBeCloseTo(1040 * scale, 1)
    expect(rect[1]).toBeCloseTo(pageH - 1064 * scale, 1)
    expect(rect[3]).toBeCloseTo(pageH - 1012 * scale, 1)
    expect(text).toContain(
      '/URI (https://www.kitsorfan.com/verify/KI-1-2?name=Ada)',
    )
  })

  it('leaves the annotation out when there is nothing to link to', () => {
    const text = decode(build(false))
    expect(text).not.toContain('/Annots')
    expect(text).not.toContain('/Subtype /Link')
  })
})

describe('PDF strings', () => {
  it('writes text as UTF-16 so a Greek name survives', () => {
    expect(pdfText('Ωa')).toBe('<FEFF03A90061>')
  })

  it('escapes the characters a literal string treats specially', () => {
    expect(pdfAscii('a(b)c\\d')).toBe('(a\\(b\\)c\\\\d)')
  })
})
