/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { downloadCv } from './downloadCv'
import { RESUME_PDF } from './resume'

/**
 * Saving the CV out of the island.
 *
 * The whole thing is one gesture with no UI of its own, so what is worth
 * checking is that it offers the PDF as a file rather than navigating away,
 * that the file is named something a stranger can find again in a downloads
 * folder, and that it does not leave its anchor behind it.
 */

afterEach(() => {
  vi.restoreAllMocks()
})

function clickedLink(): HTMLAnchorElement {
  const click = vi
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => {})
  downloadCv()
  return click.mock.contexts[0] as HTMLAnchorElement
}

describe('downloadCv', () => {
  it('hands the visitor the PDF', () => {
    expect(new URL(clickedLink().href).pathname).toBe(`/${RESUME_PDF}`)
  })

  it('names it so a stranger can find it again', () => {
    expect(clickedLink().download).toBe('Orfanopoulos-Christos-CV.pdf')
  })

  it('leaves nothing of itself behind in the page', () => {
    clickedLink()
    expect(document.querySelectorAll('a[download]')).toHaveLength(0)
  })

  it('can be asked for twice', () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})
    downloadCv()
    downloadCv()
    expect(click).toHaveBeenCalledTimes(2)
  })
})
