/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { RESUME, RESUME_UPDATED } from './resume'
import { RESUME_FONT, buildResumeHtml } from './resumeHtml'
import { PROFILE } from './profile'

/**
 * The two-page CV, the one that gets forwarded around.
 *
 * Its facts are read out of the island's data, so the things worth holding
 * it to are the ones a recruiter would notice: it is two pages, it says how
 * to reach him, it carries no phone number, and nothing of the island has
 * leaked into it.
 */

function parse(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html')
}

describe('the resume', () => {
  const doc = parse(buildResumeHtml())

  it('is exactly two sheets', () => {
    expect(doc.querySelectorAll('.sheet')).toHaveLength(2)
  })

  it('leads with the name and the job', () => {
    const head = doc.querySelector('.masthead')?.textContent ?? ''
    expect(head).toContain(PROFILE.lastName)
    expect(head).toContain(RESUME.title)
  })

  it('says how to reach him', () => {
    expect(
      doc.querySelector(`a[href="mailto:${PROFILE.email}"]`),
    ).not.toBeNull()
    expect(doc.querySelector(`a[href="${PROFILE.linkedin}"]`)).not.toBeNull()
  })

  it('publishes no phone number', () => {
    expect(doc.body.textContent).not.toMatch(/\+30|69\d{8}/)
  })

  it('keeps the island out of it', () => {
    const text = doc.querySelector('.desk')?.textContent ?? ''
    expect(text).not.toMatch(/island|lighthouse|trainer card/i)
  })

  it('lists every role with its dates', () => {
    const entries = doc.querySelectorAll('.entry')
    expect(entries.length).toBe(
      RESUME.experience.length +
        RESUME.earlier.length +
        RESUME.education.length +
        RESUME.publications.length,
    )
    for (const e of entries) {
      expect(e.querySelector('.when')?.textContent).toBeTruthy()
    }
  })

  it('puts the portrait in when there is one', () => {
    const withPhoto = parse(buildResumeHtml({ photo: '/cv/photo.jpg' }))
    expect(withPhoto.querySelector('.portrait img')?.getAttribute('src')).toBe(
      '/cv/photo.jpg',
    )
    expect(doc.querySelector('.portrait')).toBeNull()
  })

  it('drops the toolbar for the print', () => {
    expect(doc.querySelector('.toolbar')).not.toBeNull()
    expect(
      parse(buildResumeHtml({ bare: true })).querySelector('.toolbar'),
    ).toBeNull()
  })

  it('is set in its own copy of Inter, not one fetched from Google', () => {
    const html = buildResumeHtml()
    expect(html).not.toMatch(/fonts\.(googleapis|gstatic)\.com/)
    expect(html).toContain(`url("${RESUME_FONT}")`)
    // The PDF render hands the font over inline instead.
    expect(buildResumeHtml({ font: 'data:font/woff2;base64,AA' })).toContain(
      'url("data:font/woff2;base64,AA")',
    )
  })
})

describe('the experience timeline', () => {
  const doc = parse(buildResumeHtml())

  it('shows a promotion as one job with two titles', () => {
    const veltiston = [...doc.querySelectorAll('.company')].find((c) =>
      c.querySelector('.org')?.textContent?.startsWith('Veltiston AI'),
    )
    // Both titles, each with its dates, over one account of the work.
    expect(veltiston?.querySelectorAll('.entry')).toHaveLength(1)
    expect(veltiston?.querySelectorAll('header .when')).toHaveLength(2)
    expect(veltiston?.querySelectorAll('.stack')).toHaveLength(1)
  })
})

describe('the footer', () => {
  it('dates the CV by the latest release note', () => {
    const doc = parse(buildResumeHtml())
    const foot = doc.querySelector('.foot')?.textContent ?? ''
    expect(foot).toContain(`Last updated ${RESUME_UPDATED}`)
    expect(RESUME_UPDATED).toMatch(/^\d{1,2} [A-Z][a-z]+ \d{4}$/)
  })
})
