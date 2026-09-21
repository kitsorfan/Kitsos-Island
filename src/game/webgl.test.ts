/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { hasWebGL2 } from './webgl'

/**
 * Whether the island can be drawn at all.
 *
 * This is the first question the page asks, and the one place where being
 * wrong is worst: a false yes is a blank screen with no explanation, on a
 * machine that cannot say why. So it answers no to everything it is not sure
 * about — an old browser, hardware acceleration switched off by IT policy, a
 * remote desktop with no GPU to pass through — and it never throws, because
 * the code that would have caught the throw is the island itself.
 */

afterEach(() => {
  vi.restoreAllMocks()
})

describe('hasWebGL2', () => {
  it('says no when the browser cannot give a context', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    expect(hasWebGL2()).toBe(false)
  })

  it('says yes when it can', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      getExtension: () => ({ loseContext: () => {} }),
    } as unknown as RenderingContext)
    expect(hasWebGL2()).toBe(true)
  })

  it('says yes even where the context cannot be handed back', () => {
    // Giving the trial context back is a courtesy, not the question being
    // asked; a browser without that extension still draws the island.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      getExtension: () => null,
    } as unknown as RenderingContext)
    expect(hasWebGL2()).toBe(true)
  })

  it('says no rather than throwing when asking itself throws', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      () => {
        throw new Error('no GPU on this machine')
      },
    )
    expect(() => hasWebGL2()).not.toThrow()
    expect(hasWebGL2()).toBe(false)
  })

  it('asks for the version the island actually needs', () => {
    const getContext = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(null)
    hasWebGL2()
    expect(getContext).toHaveBeenCalledWith('webgl2')
  })
})
