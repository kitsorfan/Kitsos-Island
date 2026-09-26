/**
 * @vitest-environment jsdom
 */
import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { ArcadeCard } from './ArcadeCard'
import { MINIGAMES } from './minigames'
import { useGame } from '../../shared/state/store'
import { EL } from '../../shared/i18n/el/index'
import { fakeScreen } from '../../test/screen'

/**
 * The board in the plaza: every game, what it is, and whether it can be
 * played right now. A big screen also has the room for the rules of each;
 * a phone keeps to the part that decides which one to pick.
 */

const PRISTINE = useGame.getState()

beforeEach(() => {
  useGame.setState(PRISTINE, true)
})

const [first] = MINIGAMES
/** A daylight game, which the board shuts once the lamps are lit. */
const dayGame = MINIGAMES.find((g) => g.when === 'day')!

describe('the games board on a big screen', () => {
  it('lists every game with what it is and how it is played', () => {
    render(<ArcadeCard />)
    for (const game of MINIGAMES) {
      expect(screen.getByText(game.title)).toBeInTheDocument()
    }
    expect(screen.getByText(first.rules[0])).toBeInTheDocument()
  })

  it('names the key that turns the lights round', () => {
    act(() => {
      useGame.setState({ night: true })
    })
    render(<ArcadeCard />)
    expect(
      screen.getAllByText('Daylight only. Press L.').length,
    ).toBeGreaterThan(0)
  })
})

describe('the games board on a phone', () => {
  beforeEach(() => {
    fakeScreen({ mobile: true, portrait: true, coarse: true })
  })

  it('keeps every game and the line that says what it is', () => {
    render(<ArcadeCard />)
    for (const game of MINIGAMES) {
      expect(screen.getByText(game.title)).toBeInTheDocument()
      expect(screen.getByText(game.blurb)).toBeInTheDocument()
    }
  })

  it('leaves the rules to the briefing card each game opens with', () => {
    render(<ArcadeCard />)
    for (const rule of first.rules) {
      expect(screen.queryByText(rule)).not.toBeInTheDocument()
    }
    expect(screen.queryByText(/Leave any of them with Esc/)).toBeNull()
  })

  it('still says why a game cannot be played, without a key to press', () => {
    act(() => {
      useGame.setState({ night: true })
    })
    render(<ArcadeCard />)
    expect(screen.queryByText(/Press L/)).toBeNull()
    expect(screen.getAllByText('Daylight only.').length).toBeGreaterThan(0)
    expect(screen.getByText(dayGame.title)).toBeInTheDocument()
  })
})

describe('the games board in Greek', () => {
  it('reads the games in Greek as well as its heading', async () => {
    act(() => {
      useGame.setState({ locale: 'el' })
    })
    render(<ArcadeCard />)
    // The dictionary arrives a tick after the render that asked for it.
    await waitFor(() => {
      expect(screen.getByText(EL[first.blurb])).toBeInTheDocument()
    })
  })
})
