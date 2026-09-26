import { describe, expect, it } from 'vitest'
import { linkedinAddUrl, linkedinShareUrl } from './linkedin'
import { verifyUrl } from './certId'

describe('adding the certificate to a LinkedIn profile', () => {
  const url = new URL(
    linkedinAddUrl('KI-00001-00002', 'Ada Lovelace', new Date(2026, 8, 26)),
  )
  const field = (key: string) => url.searchParams.get(key)

  it('opens the add-certification form', () => {
    expect(`${url.origin}${url.pathname}`).toBe(
      'https://www.linkedin.com/profile/add',
    )
    expect(field('startTask')).toBe('CERTIFICATION_NAME')
  })

  it('fills in the fields the card lists, so nothing is copied by hand', () => {
    expect(field('certId')).toBe('KI-00001-00002')
    expect(field('certUrl')).toBe(verifyUrl('KI-00001-00002', 'Ada Lovelace'))
  })

  it('names the certificate and the island that issued it', () => {
    expect(field('name')).toBe('Certificate of Completion')
    expect(field('organizationName')).toBe('Kitsos Island')
  })

  it('dates it by the calendar month, counted from one', () => {
    /* getMonth() is zero-based; LinkedIn's issueMonth is not. */
    expect(field('issueYear')).toBe('2026')
    expect(field('issueMonth')).toBe('9')
  })

  it('keeps a name that would otherwise break the link', () => {
    const odd = new URL(linkedinAddUrl('KI-1-2', 'A&B?=Ω'))
    expect(odd.searchParams.get('certUrl')).toBe(verifyUrl('KI-1-2', 'A&B?=Ω'))
  })
})

describe('sharing the certificate as a post', () => {
  it('hands LinkedIn the verify link and nothing else', () => {
    const url = new URL(linkedinShareUrl('KI-00001-00002', 'Ada Lovelace'))
    expect(`${url.origin}${url.pathname}`).toBe(
      'https://www.linkedin.com/sharing/share-offsite/',
    )
    expect([...url.searchParams.keys()]).toEqual(['url'])
    expect(url.searchParams.get('url')).toBe(
      verifyUrl('KI-00001-00002', 'Ada Lovelace'),
    )
  })
})
