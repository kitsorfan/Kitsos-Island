import { CERT_TEXT } from './certificate'
import { verifyUrl } from './certId'

/**
 * The two ways a certificate goes to LinkedIn, as links.
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
 * A post, with the verify link in it.
 *
 * LinkedIn takes only the link and writes the rest itself: the card it
 * unfurls comes from the page's own og tags, which the verify route serves
 * because it answers with the island page. The text of the post is theirs to
 * write; the old `title` and `summary` parameters are ignored now.
 */
export function linkedinShareUrl(reference: string, name: string): string {
  const params = new URLSearchParams({ url: verifyUrl(reference, name) })
  return `https://www.linkedin.com/sharing/share-offsite/?${params}`
}
