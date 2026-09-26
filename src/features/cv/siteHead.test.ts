/**
 * @vitest-environment jsdom
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildPersonLd, personLdScript } from './personLd'
import { CV_NAME, NAME, PROFILE } from './profile'
import { RESUME_PDF } from './resume'

/**
 * What someone who never runs the island reads: a link preview, a crawler,
 * a browser with scripts off.
 *
 * index.html is written by hand, so these hold it to the CV data it repeats,
 * and make sure nothing it points at has gone missing from public/.
 */

// import.meta.dirname rather than import.meta.url: under jsdom the URL class
// is jsdom's, and node:url will not take it.
const ROOT = join(import.meta.dirname, '../../../')
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8')
const doc = new DOMParser().parseFromString(read('index.html'), 'text/html')
const meta = (property: string) =>
  doc
    .querySelector(`meta[property="${property}"], meta[name="${property}"]`)
    ?.getAttribute('content')

describe('the link preview', () => {
  it('unfurls large, with an image that is there to fetch', () => {
    expect(meta('twitter:card')).toBe('summary_large_image')
    const image = meta('og:image')!
    expect(image).toBe(`${PROFILE.website}/og-image.png`)
    expect(existsSync(join(ROOT, 'public/og-image.png'))).toBe(true)
    expect(meta('og:image:width')).toBe('1200')
    expect(meta('og:image:height')).toBe('630')
  })

  it('points at the canonical address, the one the CV prints', () => {
    expect(meta('og:url')).toBe(`${PROFILE.website}/`)
    expect(
      doc.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    ).toBe(`${PROFILE.website}/`)
  })

  it('names him the way the picture does', () => {
    expect(meta('og:image:alt')).toContain(NAME)
  })
})

describe('the page without the island', () => {
  // DOMParser runs with scripts off, so <noscript> parses as markup.
  const card = doc.querySelector('noscript')

  it('names him, and links to every plain copy of the CV', () => {
    expect(card?.textContent).toContain(CV_NAME)
    expect(card?.textContent).toContain(PROFILE.email)
    const links = [...(card?.querySelectorAll('a') ?? [])].map((a) =>
      a.getAttribute('href'),
    )
    expect(links).toEqual(['/cv.html', `/${RESUME_PDF}`, PROFILE.linkedin])
  })

  it('asks for nothing from anywhere else', () => {
    expect(read('index.html')).not.toMatch(/fonts\.(googleapis|gstatic)\.com/)
  })
})

describe('the structured data', () => {
  it('knows both of his names are one person', () => {
    const person = buildPersonLd()
    expect(person['@type']).toBe('Person')
    expect(person.name).toBe(`${PROFILE.firstName} ${PROFILE.lastName}`)
    expect(person.alternateName).toBe(`${PROFILE.nickname} ${PROFILE.lastName}`)
    expect(person.sameAs).toContain(PROFILE.linkedin)
  })

  it('points only at images that exist', () => {
    const path = buildPersonLd().image.replace(PROFILE.website, '')
    expect(existsSync(join(ROOT, 'public', path))).toBe(true)
  })

  it('cannot close the element it is written into', () => {
    expect(personLdScript()).not.toContain('<')
    expect(JSON.parse(personLdScript())).toEqual(buildPersonLd())
  })
})

describe('what crawlers are told', () => {
  it('keeps them out of the transmitter and hands them the sitemap', () => {
    const robots = read('public/robots.txt')
    expect(robots).toContain('Disallow: /api/')
    expect(robots).toContain(`Sitemap: ${PROFILE.website}/sitemap.xml`)
  })

  it('lists the island and the CV in the sitemap', () => {
    const sitemap = read('public/sitemap.xml')
    for (const path of ['/', '/cv', '/resume', `/${RESUME_PDF}`]) {
      expect(sitemap).toContain(`<loc>${PROFILE.website}${path}</loc>`)
    }
  })
})
