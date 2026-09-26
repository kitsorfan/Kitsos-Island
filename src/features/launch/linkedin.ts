import { PROFILE } from '../cv/profile'
import { CERT_TEXT } from './certificate'
import { verifyUrl } from './certId'

/**
 * The two ways the end of the island goes to LinkedIn, as links: the
 * certificate onto the visitor's profile, and the island into their feed.
 *
 * Links rather than an API: LinkedIn opens both of these in its own tab, on
 * its own login, so nothing here needs a key, an app, or a backend - and the
 * name still goes nowhere but the link the visitor chose to click.
 */

/**
 * The "Add license or certification" form on the visitor's own profile, with
 * every field filled in.
 *
 * This is what the Credential ID and URL on the card are for; the link saves
 * copying them across by hand. `organizationName` is free text rather than a
 * company page id, so the entry carries no logo, which is the honest thing
 * for an island that has no company page.
 */
export function linkedinAddUrl(
  reference: string,
  name: string,
  on: Date = new Date(),
): string {
  const params = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: CERT_TEXT.title,
    organizationName: CERT_TEXT.kicker,
    issueYear: String(on.getFullYear()),
    issueMonth: String(on.getMonth() + 1),
    certUrl: verifyUrl(reference, name),
    certId: reference,
  })
  return `https://www.linkedin.com/profile/add?${params}`
}

/**
 * A post, with the island in it.
 *
 * The site rather than the certificate: the certificate goes on the profile,
 * and what is worth telling a feed about is the place, so the next person
 * can walk it too. The same address the og:url names, so the post unfurls
 * with the island's own card. LinkedIn takes only the link; the text of the
 * post is theirs to write, and the old `title` and `summary` parameters are
 * ignored now.
 */
export function linkedinShareUrl(): string {
  const params = new URLSearchParams({ url: `${PROFILE.website}/` })
  return `https://www.linkedin.com/sharing/share-offsite/?${params}`
}
