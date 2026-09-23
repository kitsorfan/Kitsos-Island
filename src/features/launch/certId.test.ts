import { describe, expect, it } from 'vitest'
import {
  MODULUS,
  PRIVATE_KEY,
  PUBLIC_KEY,
  formatSerial,
  mintSerial,
  powMod,
  readSerial,
  recover,
  sign,
  verify,
} from './certId'

/** A deterministic 0→1 source, so a test never depends on the draw. */
function seeded(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a * 1664525 + 1013904223) >>> 0
    return a / 0x100000000
  }
}

describe('the keys', () => {
  it('are a working pair', () => {
    /*
     * The one thing that has to be true, and the one I got wrong first time
     * by inventing a private exponent rather than computing it. If d is not
     * the inverse of e mod (p-1)(q-1), signing and checking disagree and
     * every certificate is born invalid.
     */
    const sample = [2, 3, 1000, 999_983, MODULUS - 2]
    for (const serial of sample) {
      expect(recover(sign(serial))).toBe(serial % MODULUS)
    }
  })

  it('round-trips every serial it is willing to mint', () => {
    const draw = seeded(20260924)
    for (let i = 0; i < 2000; i++) {
      const serial = mintSerial(draw)
      expect(verify(serial, sign(serial))).toBe(true)
    }
  })

  it('keeps the modulus small enough for exact arithmetic', () => {
    /*
     * `powMod` multiplies two residues before taking the modulus, so the
     * product has to stay inside the 2^53 a double holds exactly. Raise the
     * modulus past 2^26 and the signatures quietly start coming out wrong.
     */
    expect(MODULUS * MODULUS).toBeLessThan(Number.MAX_SAFE_INTEGER)
  })

  it('has a public exponent that is not the private one', () => {
    expect(PUBLIC_KEY).not.toBe(PRIVATE_KEY)
  })
})

describe('powMod', () => {
  it('agrees with the naive version on small numbers', () => {
    const slow = (b: number, e: number, m: number) => {
      let r = 1
      for (let i = 0; i < e; i++) r = (r * b) % m
      return r
    }
    for (const [b, e, m] of [
      [7, 13, 101],
      [2, 20, 1009],
      [5, 0, 97],
      [123, 45, 65_537],
    ]) {
      expect(powMod(b, e, m)).toBe(slow(b, e, m))
    }
  })

  it('is 1 to the power of nothing', () => {
    expect(powMod(12_345, 0, MODULUS)).toBe(1)
  })
})

describe('minting', () => {
  it('never mints a serial that signs to itself', () => {
    /* 0 and 1 are their own signatures, which would look like the scheme
       had failed even though the arithmetic was right. */
    const draw = seeded(7)
    for (let i = 0; i < 500; i++) {
      const serial = mintSerial(draw)
      expect(serial).toBeGreaterThan(1)
      expect(serial).toBeLessThan(MODULUS)
    }
  })

  it('gives different visitors different serials', () => {
    const draw = seeded(99)
    const seen = new Set<number>()
    for (let i = 0; i < 500; i++) seen.add(mintSerial(draw))
    /* Not a uniqueness guarantee - it is a random draw - but a generator
       that returned the same number twice in 500 would be broken. */
    expect(seen.size).toBeGreaterThan(490)
  })
})

describe('the reference printed on the certificate', () => {
  const draw = seeded(4)
  const serial = mintSerial(draw)
  const signature = sign(serial)
  const printed = formatSerial(serial, signature)

  it('reads back as what was written', () => {
    expect(readSerial(printed)).toEqual({ serial, signature })
  })

  it('survives being typed back in badly', () => {
    expect(readSerial(`  ${printed.toLowerCase()}  `)).toEqual({
      serial,
      signature,
    })
  })

  it('refuses a reference that was not signed here', () => {
    /* The signature is the only part that cannot be guessed, so changing
       the serial and keeping the signature has to fail. */
    const forged = formatSerial(serial + 1, signature)
    expect(readSerial(forged)).toBeNull()
  })

  it('refuses nonsense', () => {
    expect(readSerial('')).toBeNull()
    expect(readSerial('hello')).toBeNull()
    expect(readSerial('KI-ZZZZ')).toBeNull()
    expect(readSerial('KI-!!!-???')).toBeNull()
  })

  it('looks like a reference somebody could read out', () => {
    expect(printed).toMatch(/^KI-[0-9A-Z]+-[0-9A-Z]+$/)
  })
})
