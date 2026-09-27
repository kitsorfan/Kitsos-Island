import { checkReference, parseReference } from '../launch/certId'
import type { ReferenceCheck } from '../launch/certId'
import { fill } from '../../shared/i18n/text'

/** Turns an English phrase into the page's language; English by default. */
export type Say = (text: string) => string

const ENGLISH: Say = (text) => text

/**
 * What the verifier reads out of the link it was opened with.
 *
 *   /verify/KI-0ABCD-1EFGH?name=Ada%20Lovelace
 *
 * The reference is the path and the name is the query. The name is also
 * taken bare — `?Ada%20Lovelace`, or with quotes round it — because the link
 * is one people will write out by hand, and a verifier that turns away the
 * right name for want of `name=` is not much of one.
 */
export interface VerifyRequest {
  reference: string
  name: string
}

export function readRequest(pathname: string, search: string): VerifyRequest {
  const segment = pathname.replace(/^\/verify\/?/, '').split('/')[0] ?? ''
  const reference = safeDecode(segment).trim().toUpperCase()

  const params = new URLSearchParams(search)
  let name = params.get('name') ?? ''
  if (!name && search.length > 1 && !search.includes('=')) {
    name = safeDecode(search.slice(1).replace(/\+/g, ' '))
  }
  name = name
    .trim()
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return { reference, name }
}

function safeDecode(text: string): string {
  try {
    return decodeURIComponent(text)
  } catch {
    return text
  }
}

/** What the page says, and how it says it. */
export interface Verdict {
  check: ReferenceCheck | 'empty'
  tone: 'good' | 'fair' | 'bad' | 'none'
  headline: string
  detail: string
}

export function judge(
  { reference, name }: VerifyRequest,
  say: Say = ENGLISH,
): Verdict {
  if (!reference) {
    return {
      check: 'empty',
      tone: 'none',
      headline: say('Check a certificate'),
      detail: say(
        'Enter the reference printed along the bottom of the certificate, and the name on it.',
      ),
    }
  }
  const check = checkReference(reference, name)
  switch (check) {
    case 'valid':
      return {
        check,
        tone: 'good',
        headline: say('Certificate verified'),
        detail: fill(
          say(
            'This certificate was issued by Kitsos Island to {name}, for walking every road of the island and leaving it by rocket.',
          ),
          { name },
        ),
      }
    case 'unbound':
      return {
        check,
        tone: 'fair',
        headline: say('Reference verified'),
        detail: name
          ? fill(
              say(
                'The reference is genuine. It dates from before names were signed into certificates, so it cannot confirm that it was issued to {name} in particular.',
              ),
              { name },
            )
          : say(
              'The reference is genuine. It dates from before names were signed into certificates, so it does not say who it was issued to.',
            ),
      }
    case 'mismatch':
      return {
        check,
        tone: 'bad',
        headline: say('Not verified'),
        detail: fill(
          say(
            'This reference was not issued to {name}. Check the name is spelled as it is on the certificate, and the reference is typed exactly.',
          ),
          { name },
        ),
      }
    case 'invalid': {
      const needsName = !name && parseReference(reference) !== null
      return {
        check,
        tone: needsName ? 'none' : 'bad',
        headline: say(needsName ? 'Name needed' : 'Not verified'),
        detail: say(
          needsName
            ? 'Certificates are signed for the name on them. Enter that name to check this one.'
            : 'That is not a Kitsos Island certificate reference. They look like KI-0ABCD-1EFGH.',
        ),
      }
    }
  }
}
