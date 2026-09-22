/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { downloadCv } from './downloadCv'
import { PROFILE } from './profile'

/**
 * Saving the CV out of the island.
 *
 * The whole thing is one gesture with no UI of its own, so what is worth
 * checking is that it offers a file rather than navigating away, that the file
 * is named something a stranger can find again in a downloads folder, and
 * that it does not leave the object URL or the anchor behind it.
 */

let created: string[] = []
let revoked: string[] = []

beforeEach(() => {
  created = []
  revoked = []
  // jsdom implements neither of these, so they are stood up by hand.
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: vi.fn((_blob: Blob) => {
      const url = `blob:island/${created.length}`
      created.push(url)
      return url
    }),
    revokeObjectURL: vi.fn((url: string) => revoked.push(url)),
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('downloadCv', () => {
  it('hands the visitor a file', () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})
    downloadCv()
    expect(click).toHaveBeenCalledOnce()
  })

  it('names it so a stranger can find it again', () => {
    let name = ''
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      name = this.download
    })
    downloadCv()
    expect(name).toBe(`${PROFILE.lastName}-${PROFILE.firstName}-CV.md`)
  })

  it('offers it as a file rather than navigating the page away', () => {
    let href = ''
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      href = this.href
      expect(this.download).not.toBe('')
    })
    downloadCv()
    expect(href).toContain('blob:')
  })

  it('gives the object URL back when it is done with it', () => {
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    downloadCv()
    expect(revoked).toEqual(created)
    expect(created).toHaveLength(1)
  })

  it('leaves nothing of itself behind in the page', () => {
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    downloadCv()
    expect(document.querySelectorAll('a[download]')).toHaveLength(0)
  })

  it('can be asked for twice', () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})
    downloadCv()
    downloadCv()
    expect(click).toHaveBeenCalledTimes(2)
    expect(revoked).toHaveLength(2)
  })
})
