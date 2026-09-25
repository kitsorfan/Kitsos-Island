/**
 * @vitest-environment jsdom
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CV_NAME, PROFILE } from './profile'

/**
 * What a link to the island unfurls with in LinkedIn, Slack or an email,
 * read out of index.html by something that never runs the island.
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

  it('names him the way the CV does', () => {
    expect(meta('og:image:alt')).toContain(CV_NAME)
  })
})
