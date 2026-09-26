/**
 * @vitest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react'
import { fireEvent } from '@testing-library/dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { Hud } from './Hud'
import { useGame } from '../state/store'
import { fakeScreen } from '../../test/screen'

/**
 * The HUD on a big screen has room for a button per job. A phone has room
 * for the island and very little else, so it keeps Settings and Say hi, and
 * everything else goes behind one Controls button — still one tap away, just
 * not standing in the corner of the screen he is trying to walk into.
 */

const PRISTINE = useGame.getState()

beforeEach(() => {
  useGame.setState(PRISTINE, true)
  act(() => {
    useGame.setState({ mode: 'explore' })
  })
})

const button = (name: RegExp) => screen.queryByRole('button', { name })

describe('the HUD on a big screen', () => {
  it('puts every button out where it can be seen', () => {
    render(<Hud />)
    for (const name of [/Map/, /Journal/, /Settings/, /Games/, /Say hi/]) {
      expect(button(name)).toBeInTheDocument()
    }
    expect(button(/Day/)).toBeInTheDocument()
  })

  it('has no need of a Controls button', () => {
    render(<Hud />)
    expect(button(/Controls/)).not.toBeInTheDocument()
  })

  it('shows how far the visit has got', () => {
    render(<Hud />)
    expect(screen.getByText(/discovered/)).toBeInTheDocument()
  })
})

describe('the HUD on a phone', () => {
  beforeEach(() => {
    fakeScreen({ mobile: true, portrait: true, coarse: true })
  })

  it('keeps only Controls, Settings and Say hi on the screen', () => {
    render(<Hud />)
    expect(screen.getAllByRole('button')).toHaveLength(3)
    expect(button(/Controls/)).toBeInTheDocument()
    expect(button(/Settings/)).toBeInTheDocument()
    expect(button(/Say hi/)).toBeInTheDocument()
  })

  it('leaves the progress badge and the objective off the island', () => {
    render(<Hud />)
    expect(screen.queryByText(/discovered/)).not.toBeInTheDocument()
    expect(screen.queryByText('Next')).not.toBeInTheDocument()
  })

  it('has everything else behind Controls', () => {
    render(<Hud />)
    fireEvent.click(button(/Controls/)!)
    const card = screen.getByRole('group', { name: 'Controls' })
    for (const name of [
      'Map',
      'Journal',
      'Games',
      'Day',
      'Walk',
      'In',
      'Out',
    ]) {
      expect(card).toHaveTextContent(name)
    }
  })

  it('folds it away again on a second tap', () => {
    render(<Hud />)
    fireEvent.click(button(/Controls/)!)
    fireEvent.click(button(/Controls/)!)
    expect(screen.queryByRole('group', { name: 'Controls' })).toBeNull()
  })

  it('never has Controls and Settings open on top of each other', () => {
    render(<Hud />)
    fireEvent.click(button(/Controls/)!)
    fireEvent.click(button(/Settings/)!)
    expect(screen.queryByRole('group', { name: 'Controls' })).toBeNull()
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeVisible()
  })

  it('folds Controls away once it has taken him somewhere', () => {
    render(<Hud />)
    fireEvent.click(button(/Controls/)!)
    fireEvent.click(button(/Map/)!)
    expect(useGame.getState().mode).toBe('map')

    // Back from the map, the island is clear rather than covered again.
    act(() => {
      useGame.setState({ mode: 'explore' })
    })
    expect(screen.queryByRole('group', { name: 'Controls' })).toBeNull()
  })

  it('offers the way out of a game from behind Controls', () => {
    act(() => {
      useGame.getState().openPaintball()
      useGame.getState().beginPaintball()
    })
    render(<Hud />)
    fireEvent.click(button(/Controls/)!)
    const card = screen.getByRole('group', { name: 'Controls' })
    expect(card).toHaveTextContent('Quit game')
  })
})
