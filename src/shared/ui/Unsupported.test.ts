/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { showUnsupported } from './Unsupported'
import { PROFILE } from '../../features/cv/profile'

/**
 * The page somebody gets when the island cannot be drawn at all: an old
 * browser, or hardware acceleration switched off by IT policy, or a remote
 * desktop with no GPU to pass through.
 *
 * This is the one screen that has to work on a machine that has already shown
 * it cannot do the fancy thing, so the thing to hold it to is that it is
 * still a way to read the CV and still a way to get in touch. A visitor who
 * cannot see the island must not also be a visitor who cannot reach him.
 */

let root: HTMLElement

beforeEach(() => {
  document.head.replaceChildren()
  document.body.replaceChildren()
  root = document.createElement('div')
  document.body.append(root)
})

describe('showUnsupported', () => {
  it('says what has gone wrong', () => {
    showUnsupported(root)
    expect(root.textContent).toMatch(/3D|graphics|WebGL/i)
  })

  it('still offers the CV', () => {
    showUnsupported(root)
    const cv = root.querySelector('a[href="/cv.html"]')
    expect(cv).not.toBeNull()
    expect(cv?.textContent?.length).toBeGreaterThan(0)
  })

  it('still offers a way to get in touch', () => {
    showUnsupported(root)
    const email = root.querySelector('a[href^="mailto:"]')
    expect(email?.getAttribute('href')).toContain(PROFILE.email)
  })

  it('opens the outside links safely', () => {
    showUnsupported(root)
    for (const link of root.querySelectorAll<HTMLAnchorElement>(
      'a[target="_blank"]',
    )) {
      expect(link.rel).toContain('noopener')
    }
  })

  it('suggests what the visitor might try', () => {
    showUnsupported(root)
    expect(root.querySelectorAll('li').length).toBeGreaterThan(0)
  })

  it('brings its own styles, rather than asking for a second request', () => {
    // It has to render on a machine that has already failed once: no
    // framework, no stylesheet, no round trip.
    showUnsupported(root)
    expect(document.head.querySelector('style')).not.toBeNull()
  })

  it('replaces whatever was in the root, rather than adding to it', () => {
    root.append(document.createElement('canvas'))
    showUnsupported(root)
    expect(root.querySelector('canvas')).toBeNull()
  })
})
