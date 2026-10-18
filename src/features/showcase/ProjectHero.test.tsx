/**
 * @vitest-environment jsdom
 */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Panel } from '../../shared/ui/Panel'
import { useGame } from '../../shared/state/store'
import { PROJECTS, PROJECT_EXHIBITS } from './projects'
import { examine } from '../interior/examine'

/**
 * A project's card, as stepping up to its screen in the lobby opens it.
 *
 * What a visitor needs from it is the way out to the real thing, so that is
 * what is held here: that the live demo and the source are on offer before
 * any of the description, that they leave the island in a new tab rather than
 * replacing it, and that a missing screenshot costs the picture and nothing
 * else.
 */

vi.mock('../../shared/engine/audio', async () => {
  const actual = await vi.importActual<
    typeof import('../../shared/engine/audio')
  >('../../shared/engine/audio')
  return new Proxy(actual, {
    get: (target, prop) => {
      const real = Reflect.get(target, prop)
      return typeof real === 'function' && prop !== 'LEVELS' ? vi.fn() : real
    },
  })
})

const PRISTINE = useGame.getState()
const PROJECT = PROJECTS[0]
const SCREEN = PROJECT_EXHIBITS[0]

/** Pressing the prompt at the screen, as the lobby wires it. */
const show = () => examine(SCREEN, '#2fb59a', 'Work District')

beforeEach(() => {
  useGame.setState(PRISTINE, true)
  act(() => {
    useGame.getState().start()
  })
})

const open = () => {
  render(<Panel />)
  act(() => show())
}

describe('a project card', () => {
  it('opens on the project, by name', () => {
    open()
    expect(useGame.getState().mode).toBe('panel')
    expect(
      screen.getByRole('heading', { name: PROJECT.name }),
    ).toBeInTheDocument()
  })

  it('offers every way to the project, each in a new tab', () => {
    open()
    for (const link of PROJECT.links) {
      const anchor = screen.getByRole('link', {
        name: new RegExp(`^${link.label}`),
      })
      expect(anchor).toHaveAttribute('href', link.href)
      expect(anchor).toHaveAttribute('target', '_blank')
      expect(anchor.getAttribute('rel')).toContain('noreferrer')
    }
  })

  it('puts the links ahead of the description', () => {
    const { container } = render(<Panel />)
    act(() => show())
    const main = PROJECT.links.find((l) => l.primary)!
    const link = screen.getByRole('link', {
      name: new RegExp(`^${main.label}`),
    })
    const heading = container.querySelector('.panel__heading')!
    expect(
      link.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('shows the screenshot, which opens the live project too', () => {
    open()
    const shot = screen.getByRole('img')
    expect(shot.getAttribute('src')).toContain(`projects/${PROJECT.image}`)
    const main = PROJECT.links.find((l) => l.primary)!
    expect(shot.closest('a')).toHaveAttribute('href', main.href)
  })

  it('drops the picture, and keeps the links, if the screenshot is missing', () => {
    open()
    fireEvent.error(screen.getByRole('img'))
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(PROJECT.links.length)
  })

  it('files the project in the journal, once', () => {
    open()
    act(() => useGame.getState().closePanel())
    act(() => show())
    const filed = useGame.getState().entries.filter((e) => e.id === PROJECT.id)
    expect(filed).toHaveLength(1)
    expect(filed[0].title).toBe(PROJECT.journal.title)
  })
})
