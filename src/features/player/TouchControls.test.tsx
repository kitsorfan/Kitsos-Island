/**
 * @vitest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { TouchControls } from './TouchControls'
import { useGame } from '../../shared/state/store'
import { fakeScreen } from '../../test/screen'

/**
 * The stick and the round buttons beside it. Which buttons stand there is
 * the whole point of them: every one should be something the game in hand
 * will actually answer, and nothing it will not.
 */

type State = ReturnType<typeof useGame.getState>

const PRISTINE = useGame.getState()

beforeEach(() => {
  useGame.setState(PRISTINE, true)
  fakeScreen({ mobile: true, portrait: true, coarse: true })
  act(() => {
    useGame.setState({ mode: 'explore' })
  })
})

const buttons = () => screen.queryAllByRole('button').map((b) => b.textContent)

describe('the touch controls', () => {
  it('stay off a screen with a keyboard and a mouse', () => {
    fakeScreen({})
    const { container } = render(<TouchControls />)
    expect(container).toBeEmptyDOMElement()
  })

  it('offer jump and A on foot', () => {
    render(<TouchControls />)
    expect(screen.getByRole('button', { name: 'Jump' })).toBeInTheDocument()
    expect(buttons()).toContain('A')
  })

  it('leave the stick on its own at the helm, which is all the boat needs', () => {
    act(() => {
      useGame.setState({
        rescue: { status: 'sailing' } as unknown as State['rescue'],
      })
    })
    render(<TouchControls />)
    expect(buttons()).toEqual([])
  })

  it('give the balloon an up and a down rather than a burner', () => {
    act(() => {
      useGame.setState({
        balloon: { status: 'flying' } as unknown as State['balloon'],
      })
    })
    render(<TouchControls />)
    expect(buttons()).toEqual(expect.arrayContaining(['UP', 'DOWN']))
    expect(buttons()).not.toContain('BURN')
  })
})
