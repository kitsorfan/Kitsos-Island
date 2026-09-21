import { afterEach, expect, vi } from 'vitest'

/**
 * What every test file gets before it runs.
 *
 * Two jobs. The first is jest-dom's matchers, so a component test can say
 * `toBeInTheDocument()` rather than picking through nodes by hand. The second
 * is the handful of browser APIs the island reaches for that jsdom does not
 * implement at all: an unimplemented API throws, and a test that fails inside
 * `matchMedia` tells you nothing about the thing it was testing.
 *
 * Nothing here fakes island behaviour. Stubs stand in for the browser only —
 * anything the island itself decides is left to the code under test.
 */

/*
 * Only in a DOM run. Half the suite is arithmetic with `environment: node`,
 * where there is no `expect.extend` target to speak of and no document to
 * hang a matcher off.
 */
if (typeof window !== 'undefined') {
  const matchers = await import('@testing-library/jest-dom/matchers')
  expect.extend(matchers.default ?? matchers)

  const { cleanup } = await import('@testing-library/react')
  afterEach(cleanup)

  /**
   * jsdom has no media queries. The island asks after two: a coarse pointer,
   * which decides whether the touch sticks are drawn, and reduced motion.
   * Both answer "no" here, so tests get the desktop island unless one of them
   * says otherwise for itself.
   */
  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  }

  /** No WebGL in jsdom, so a canvas answers with nothing rather than throwing. */
  HTMLCanvasElement.prototype.getContext = vi.fn(
    () => null,
  ) as unknown as HTMLCanvasElement['getContext']

  /** Neither of these exists in jsdom; the minimap and the HUD both watch. */
  if (!window.ResizeObserver) {
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver
  }

  if (!window.scrollTo) {
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
  }

  /**
   * jsdom lays nothing out, so it implements none of the scrolling. A panel
   * that puts its body back to the top when a new one opens would otherwise
   * throw on the way in, and the test would fail somewhere far from what it
   * was actually checking.
   */
  if (!Element.prototype.scrollTo) {
    Element.prototype.scrollTo =
      vi.fn() as unknown as typeof Element.prototype.scrollTo
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView =
      vi.fn() as unknown as typeof Element.prototype.scrollIntoView
  }
}

/**
 * Site data does not carry between tests. The island keeps its settings and
 * its progress in localStorage, so a test that saves a game would otherwise
 * hand it to whichever test ran next.
 */
afterEach(() => {
  try {
    localStorage.clear()
  } catch {
    // No storage in this environment; nothing to clear.
  }
  vi.restoreAllMocks()
})
