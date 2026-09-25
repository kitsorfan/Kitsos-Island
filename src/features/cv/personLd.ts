import { PROFILE } from './profile.ts'

/**
 * Who the island is about, as schema.org structured data.
 *
 * Search engines read this out of the page's <head> without running the
 * island, and it is how "Christos Orfanopoulos" and "Kitsos Orfanopoulos"
 * are known to be one person. Built from the CV data at build time, so it
 * cannot say anything the CV does not.
 */
export function buildPersonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: `${PROFILE.firstName} ${PROFILE.lastName}`,
    alternateName: `${PROFILE.nickname} ${PROFILE.lastName}`,
    givenName: PROFILE.firstName,
    familyName: PROFILE.lastName,
    jobTitle: PROFILE.title,
    url: `${PROFILE.website}/`,
    image: `${PROFILE.website}/cv/photo.jpg`,
    email: `mailto:${PROFILE.email}`,
    nationality: PROFILE.nationality,
    address: {
      '@type': 'PostalAddress',
      addressLocality: PROFILE.location.split(',')[0].trim(),
      addressCountry: 'GR',
    },
    sameAs: [PROFILE.linkedin],
  }
}

/**
 * The same, ready to drop into a <script type="application/ld+json">.
 * `<` is escaped so no value can ever close the element it sits in.
 */
export function personLdScript() {
  return JSON.stringify(buildPersonLd()).replace(/</g, '\\u003c')
}
