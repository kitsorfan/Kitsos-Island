/**
 * @vitest-environment jsdom
 */
// fireEvent from the React package, which turns pointerLeave into the
// pointerout React actually listens for.
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Hud } from './Hud'
import { useGame } from '../state/store'
import { clearKeys, readCameraTurn, setKey } from '../../features/player/input'
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

  it('offers the camera turn on the screen as well as on Q and E', () => {
    render(<Hud />)
    expect(button(/Turn the camera left \(Q\)/)).toBeInTheDocument()
    expect(button(/Turn the camera right \(E\)/)).toBeInTheDocument()
  })
})

describe('the turn buttons', () => {
  afterEach(() => clearKeys())

  it('turn the camera for as long as they are held, and no longer', () => {
    render(<Hud />)
    const left = button(/Turn the camera left/)!
    fireEvent.pointerDown(left)
    expect(readCameraTurn()).toBeGreaterThan(0)
    fireEvent.pointerUp(left)
    expect(readCameraTurn()).toBe(0)
  })

  it('turn the same way as the key they stand in for', () => {
    render(<Hud />)
    const right = button(/Turn the camera right/)!
    fireEvent.pointerDown(right)
    const byButton = readCameraTurn()
    fireEvent.pointerUp(right)
    setKey('KeyE', true)
    expect(Math.sign(byButton)).toBe(Math.sign(readCameraTurn()))
  })

  it('let go if a finger slides off them', () => {
    render(<Hud />)
    const left = button(/Turn the camera left/)!
    fireEvent.pointerDown(left)
    fireEvent.pointerLeave(left)
    expect(readCameraTurn()).toBe(0)
  })

  it('stand down where nothing reads them, and let go as they do', () => {
    render(<Hud />)
    fireEvent.pointerDown(button(/Turn the camera left/)!)
    // A dialogue takes the walk, and the camera with it.
    act(() => {
      useGame.getState().talk({ speaker: 'Somebody', lines: ['Hello.'] })
    })
    expect(button(/Turn the camera/)).not.toBeInTheDocument()
    expect(readCameraTurn()).toBe(0)
  })
})

describe('the HUD on a phone', () => {
  beforeEach(() => {
    fakeScreen({ mobile: true, portrait: true, coarse: true })
  })

  it('keeps only Controls, Settings and Say hi, and the turns at the edges', () => {
    render(<Hud />)
    expect(screen.getAllByRole('button')).toHaveLength(5)
    expect(button(/Controls/)).toBeInTheDocument()
    expect(button(/Settings/)).toBeInTheDocument()
    expect(button(/Say hi/)).toBeInTheDocument()
    expect(button(/Turn the camera left/)).toBeInTheDocument()
    expect(button(/Turn the camera right/)).toBeInTheDocument()
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
