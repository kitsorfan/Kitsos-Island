/**
 * The serial on a certificate, and the signature that proves it came from
 * here.
 *
 * ## This is a demonstration, not security
 *
 * Both keys ship in the bundle. Anyone who opens devtools can read the
 * "private" one and mint a certificate saying whatever they like, so this
 * proves nothing about who issued a given serial.
 *
 * The scheme itself is real RSA — the arithmetic below is exactly what a
 * signature does — but at a key size of twenty-four bits, which is to say a
 * modulus anybody could factor by hand in an afternoon. Both halves of that
 * matter: the mechanism is genuine, and the parameters are a demonstration.
 * It is here because the shape of the idea — a serial, a signature over it
 * that only the issuer can produce, and a public half anybody can check it
 * with — is worth showing, and this shows it in twenty lines with no
 * dependencies.
 *
 * Nothing on the island depends on it being sound. The certificate is a
 * souvenir; the verifier is a party trick that happens to be honest about
 * what it is.
 *
 * ## The scheme
 *
 * Textbook RSA, at a size a browser can do in plain numbers:
 *
 *   signature = id^d mod n     (signing, with the private exponent)
 *   id        = signature^e mod n   (checking, with the public one)
 *
 * The modulus is the product of two primes and is small enough that every
 * intermediate stays inside a double once the multiply is done stepwise —
 * which is what `powMod` below is for. Real RSA uses numbers hundreds of
 * digits long and would need BigInt; this one is deliberately sized to be
 * read rather than relied on.
 */

/**
 * The modulus: 3 571 × 4 099, two primes chosen so the product is under
 * 2^24 and every squaring inside `powMod` stays exact in a double.
 */
export const MODULUS = 14_637_529

/** The public exponent. The usual one, and coprime to (p-1)(q-1). */
export const PUBLIC_KEY = 65_537

/**
 * The private exponent: the inverse of PUBLIC_KEY modulo (p-1)(q-1), where
 * (p-1)(q-1) = 3570 × 4098 = 14_629_860.
 *
 * In a real system this is the half you never ship. Here it is four lines
 * above the public one, which is the joke and also the point: the mechanism
 * works, the secrecy does not, and pretending otherwise would be worse than
 * saying so.
 */
export const PRIVATE_KEY = 1_282_013

/**
 * Modular exponentiation by squaring.
 *
 * Written out rather than reached for, because `(a * b) % n` overflows a
 * double long before `n` does: with a modulus under 2^24 the product of two
 * residues fits in 2^48, which is inside the 2^53 a double holds exactly, so
 * this is safe at this size and would not be at any real one.
 */
export function powMod(base: number, exponent: number, modulus: number) {
  let result = 1
  let b = base % modulus
  let e = exponent
  while (e > 0) {
    if (e & 1) result = (result * b) % modulus
    b = (b * b) % modulus
    e = Math.floor(e / 2)
  }
  return result
}

/** A fresh serial: a number the modulus can actually carry. */
export function mintSerial(random: () => number = Math.random): number {
  /* Non-zero and well inside the modulus, so signing is reversible: 0 and 1
     sign to themselves, which would look like the scheme had failed. */
  return 2 + Math.floor(random() * (MODULUS - 3))
}

/** Signs a serial with the private half. */
export const sign = (serial: number) => powMod(serial, PRIVATE_KEY, MODULUS)

/** Recovers a serial from a signature with the public half. */
export const recover = (signature: number) =>
  powMod(signature, PUBLIC_KEY, MODULUS)

/** True when a signature really is this serial, signed here. */
export const verify = (serial: number, signature: number) =>
  recover(signature) === serial % MODULUS

/**
 * How a serial is written on the certificate.
 *
 * Base 36 and grouped, so it reads as a reference somebody could type back
 * in rather than a long decimal nobody would.
 */
export function formatSerial(serial: number, signature: number): string {
  const left = serial.toString(36).toUpperCase().padStart(5, '0')
  const right = signature.toString(36).toUpperCase().padStart(5, '0')
  return `KI-${left}-${right}`
}

/**
 * Splits a printed reference into its two numbers, without checking them.
 * Null if it is not the shape of one of ours.
 */
export function parseReference(
  text: string,
): { serial: number; signature: number } | null {
  const match = /^KI-([0-9A-Z]{1,6})-([0-9A-Z]{1,6})$/.exec(
    text.trim().toUpperCase(),
  )
  if (!match) return null
  return { serial: parseInt(match[1], 36), signature: parseInt(match[2], 36) }
}

/**
 * Reads a printed reference back. Null if it is not one of ours — a wrong
 * shape, a bad character, or a signature that does not check out.
 *
 * This is the 1.1 check, which signs the serial alone. Certificates from
 * then on sign the name with it; see `checkReference`.
 */
export function readSerial(
  text: string,
): { serial: number; signature: number } | null {
  const parsed = parseReference(text)
  if (!parsed || !verify(parsed.serial, parsed.signature)) return null
  return parsed
}

/**
 * The name, reduced to what the signature covers.
 *
 * Spacing and case are forgiven, because the name comes back in through a
 * link somebody may have retyped; the letters themselves are not. NFC first,
 * so an accented letter typed as one character and as two is the same name.
 */
export function nameKey(name: string): number {
  const text = name.normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase()
  /* FNV-1a, 32 bits, then folded into the modulus. Not a secure hash, and
     it does not need to be: the modulus beside it is not a secure key. */
  let hash = 0x811c9dc5
  for (const unit of new TextEncoder().encode(text)) {
    hash ^= unit
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash % MODULUS
}

/**
 * Signs a serial and a name together.
 *
 * The number signed is the serial shifted by the name's key, so the printed
 * reference only checks out against the name it was made for: change a
 * letter of the name in the link and the arithmetic no longer closes.
 */
export const signFor = (serial: number, name: string) =>
  sign((serial + nameKey(name)) % MODULUS)

/**
 * What the verifier makes of a reference and a name.
 *
 * - `valid`: signed here, for exactly this name.
 * - `unbound`: signed here, but by the 1.1 scheme, which did not sign the
 *   name — so the reference is genuine and the name is only as good as the
 *   link it came in.
 * - `mismatch`: a reference of the right shape that does not check out
 *   against this name — the wrong name, or a mistyped reference.
 * - `invalid`: not one of ours at all.
 */
export type ReferenceCheck = 'valid' | 'unbound' | 'mismatch' | 'invalid'

export function checkReference(text: string, name: string): ReferenceCheck {
  const parsed = parseReference(text)
  if (!parsed) return 'invalid'
  const { serial, signature } = parsed
  if (serial >= MODULUS || signature >= MODULUS) return 'invalid'
  const recovered = recover(signature)
  if (name.trim() && recovered === (serial + nameKey(name)) % MODULUS) {
    return 'valid'
  }
  if (recovered === serial) return 'unbound'
  return name.trim() ? 'mismatch' : 'invalid'
}

/** Where a certificate is checked. */
export const VERIFY_ORIGIN = 'https://www.kitsorfan.com'

/** The link printed on a certificate: its reference, and the name on it. */
export function verifyUrl(reference: string, name: string): string {
  const clean = name.normalize('NFC').replace(/\s+/g, ' ').trim()
  return `${VERIFY_ORIGIN}/verify/${reference}?name=${encodeURIComponent(clean)}`
}
