/**
 * @vitest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DialogueBox } from './DialogueBox'
import { useGame } from '../state/store'
import { fakeScreen } from '../../test/screen'

/**
 * A conversation on the island: one speaker, a page at a time, each line
 * typing itself out.
 *
 * The rule the whole box turns on is that a press means two different things
 * depending on when it lands — the first one finishes the line that is still
 * typing, and the next one turns the page. Somebody who reads quickly must
 * never lose a line to a press that skipped it. And however long the
 * conversation, there is always a way back out onto the island.
 */

vi.mock('../game/audio', async () => {
  const actual =
    await vi.importActual<typeof import('../engine/audio')>('../game/audio')
  return new Proxy(actual, {
    get: (target, prop) => {
      const real = Reflect.get(target, prop)
      return typeof real === 'function' && prop !== 'LEVELS' ? vi.fn() : real
    },
  })
})

const PRISTINE = useGame.getState()

beforeEach(() => {
  useGame.setState(PRISTINE, true)
  act(() => {
    useGame.getState().start()
  })
})

const say = (lines: string[], speaker = 'Somebody') =>
  act(() => {
    useGame.getState().talk({ speaker, lines })
  })

/** The box itself, which is what a press anywhere on the layer lands on. */
const box = () => screen.getByRole('dialog')

/**
 * One press on the box. The layer listens for a pointer going down rather
 * than a click, so that a line answers the moment a finger touches the glass
 * instead of waiting to see whether it comes back up again.
 */
const press = () =>
  act(() => {
    box().dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
  })

/** Finishes the line that is typing, then turns the page. */
const pressThrough = () => {
  press()
  press()
}

describe('DialogueBox', () => {
  it('shows nothing when nobody is talking', () => {
    const { container } = render(<DialogueBox />)
    expect(container).toBeEmptyDOMElement()
  })

  it('names who is speaking', () => {
    render(<DialogueBox />)
    say(['Hello there.'], 'The keeper')
    expect(screen.getByText('The keeper')).toBeInTheDocument()
  })

  it('is a dialogue, and says so to a screen reader', () => {
    render(<DialogueBox />)
    say(['Hello there.'])
    expect(box()).toHaveAttribute('aria-live', 'polite')
  })

  it('types the line out rather than printing it all at once', () => {
    render(<DialogueBox />)
    say(['A line that takes a moment to appear.'])
    // Nothing has been typed yet on the frame it opens.
    expect(
      screen.queryByText('A line that takes a moment to appear.'),
    ).not.toBeInTheDocument()
  })

  it('finishes the line on the first press, rather than skipping it', () => {
    // Somebody who reads quickly presses on — and must get the whole line,
    // not the next one.
    render(<DialogueBox />)
    say(['The whole of this line.', 'And then this one.'])
    press()
    expect(screen.getByText('The whole of this line.')).toBeInTheDocument()
    expect(useGame.getState().dialogue?.page).toBe(0)
  })

  it('turns the page on the press after that', () => {
    render(<DialogueBox />)
    say(['First.', 'Second.'])
    pressThrough()
    expect(useGame.getState().dialogue?.page).toBe(1)
  })

  it('lets the visitor back out onto the island at the end', () => {
    render(<DialogueBox />)
    say(['The only thing I have to say.'])
    pressThrough()
    expect(useGame.getState().mode).toBe('explore')
  })

  it('reads a long conversation all the way through', () => {
    render(<DialogueBox />)
    say(['One.', 'Two.', 'Three.', 'Four.'])
    for (let i = 0; i < 4; i++) {
      expect(useGame.getState().dialogue?.page).toBe(i)
      pressThrough()
    }
    expect(useGame.getState().mode).toBe('explore')
  })

  it('names the key to press on a keyboard', () => {
    render(<DialogueBox />)
    say(['Hello there.'])
    expect(box().querySelector('.dialogue__hint kbd')).toHaveTextContent(
      'Enter',
    )
  })

  it('names the A button on a touch screen, where there is no Enter', () => {
    fakeScreen({ mobile: true, coarse: true })
    render(<DialogueBox />)
    say(['Hello there.'])
    expect(box().querySelector('.dialogue__hint kbd')).toHaveTextContent('A')
  })
})
