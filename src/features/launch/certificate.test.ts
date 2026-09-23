import { describe, expect, it, vi } from 'vitest'
import {
  CERT_TEXT,
  NAME_LIMIT,
  certDate,
  certFilename,
  cleanName,
  drawCertificate,
  nameReady,
  wrapText,
} from './certificate'

describe('the name on the certificate', () => {
  it('tidies the spacing without touching the name itself', () => {
    expect(cleanName('  Ada   Lovelace ')).toBe('Ada Lovelace')
    /* Capitalisation is theirs. A certificate that corrects somebody's name
       has got their name wrong. */
    expect(cleanName('e e cummings')).toBe('e e cummings')
    expect(cleanName('Χρήστος Ορφανόπουλος')).toBe('Χρήστος Ορφανόπουλος')
  })

  it('caps the length so it still fits on the line', () => {
    expect(cleanName('a'.repeat(200))).toHaveLength(NAME_LIMIT)
  })

  it('is not ready until something has been typed', () => {
    expect(nameReady('')).toBe(false)
    expect(nameReady('   ')).toBe(false)
    expect(nameReady('A')).toBe(true)
  })
})

describe('the filename', () => {
  it('slugs the name and keeps the extension', () => {
    expect(certFilename('Ada Lovelace')).toBe(
      'kitsos-island-certificate-ada-lovelace.png',
    )
  })

  it('keeps letters that are not ASCII rather than stripping them', () => {
    /* A Greek name that slugged to nothing would hand every Greek visitor
       the same anonymous file. */
    expect(certFilename('Χρήστος')).toBe(
      'kitsos-island-certificate-χρήστος.png',
    )
  })

  it('falls back rather than producing a bare or trailing-hyphen name', () => {
    expect(certFilename('!!!')).toBe('kitsos-island-certificate-visitor.png')
    expect(certFilename('  ')).toBe('kitsos-island-certificate-visitor.png')
    expect(certFilename('Ada!')).toBe('kitsos-island-certificate-ada.png')
  })
})

describe('the date', () => {
  it('is written out long rather than as digits', () => {
    expect(certDate(new Date('2026-09-23T12:00:00Z'))).toContain('September')
    expect(certDate(new Date('2026-09-23T12:00:00Z'))).toContain('2026')
  })
})

/**
 * A context that records what was asked of it. The certificate is a drawing
 * and there is no raster to assert against here, so what is worth checking
 * is that the name and the wording actually reach the canvas.
 */
function stubContext() {
  const filled: string[] = []
  const ctx = {
    filled,
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    font: '',
    textAlign: '',
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn((text: string) => filled.push(text)),
    measureText: vi.fn((text: string) => ({ width: text.length * 18 })),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
  }
  return ctx as unknown as CanvasRenderingContext2D & { filled: string[] }
}

describe('drawing the certificate', () => {
  it('letters the name, the title and who signed it', () => {
    const ctx = stubContext()
    drawCertificate(ctx, 'Ada Lovelace', '23 September 2026')

    expect(ctx.filled).toContain('Ada Lovelace')
    expect(ctx.filled).toContain(CERT_TEXT.title)
    expect(ctx.filled).toContain(CERT_TEXT.signatory)
    expect(ctx.filled).toContain('23 September 2026')
  })

  it('shrinks a long name rather than letting it run off the card', () => {
    const ctx = stubContext()
    drawCertificate(ctx, 'a'.repeat(NAME_LIMIT), '23 September 2026')
    /* The font is set repeatedly as it steps down; what matters is that it
       ended up smaller than the size it starts at. */
    const size = Number(/(\d+)px/.exec(ctx.font)?.[1] ?? 0)
    expect(size).toBeGreaterThan(0)
    expect(size).toBeLessThan(96)
  })
})

describe('wrapping the citation', () => {
  it('breaks into as many lines as the width needs', () => {
    const ctx = stubContext()
    /* 18px a character in the stub, so 360px is about twenty characters. */
    const lines = wrapText(ctx, 'one two three four five six', 0, 0, 360, 40)
    expect(lines).toBeGreaterThan(1)
  })

  it('keeps short text on one line', () => {
    const ctx = stubContext()
    expect(wrapText(ctx, 'short', 0, 0, 9999, 40)).toBe(1)
  })
})
