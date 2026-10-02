/**
 * @vitest-environment jsdom
 */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LiveCard } from './LiveCard'
import { useGame } from '../../shared/state/store'
import { PRESETS } from './places'

/**
 * The card is where the live sky is moved: to another place, or to another
 * time of day. What it is held to is that each control does the one thing
 * it says, that it says honestly when the weather has not come, and that it
 * keeps its hands off the sky while a game is being played under it.
 */

const PRISTINE = useGame.getState()
const TOKYO = PRESETS.find((p) => p.name === 'Tokyo')!

beforeEach(() => {
  useGame.setState(PRISTINE, true)
  act(() => {
    useGame.setState({ mode: 'explore', live: true })
  })
})

afterEach(() => vi.unstubAllGlobals())

const chip = (name: string) => screen.getByRole('button', { name })

describe('what the card says', () => {
  it('says where the sky is from', () => {
    render(<LiveCard />)
    expect(screen.getByText('Greece', { exact: false })).toBeInTheDocument()
    expect(chip('Athens')).toHaveAttribute('aria-pressed', 'true')
  })

  it('says it is still reading the sky until the forecast is in', () => {
    render(<LiveCard />)
    expect(screen.getByText(/Reading the sky/)).toBeInTheDocument()
  })

  it('reads the weather out once it is', () => {
    act(() => {
      useGame.setState({
        liveStatus: 'ready',
        weather: {
          at: Date.now(),
          code: 63,
          temperature: 16.6,
          cloud: 100,
          precipitation: 2,
          wind: 7,
          windFrom: 200,
        },
      })
    })
    render(<LiveCard />)
    expect(screen.getByText(/Rain · 17°C · Wind 25 km\/h/)).toBeInTheDocument()
  })

  it('owns up when no forecast came', () => {
    act(() => {
      useGame.setState({ liveStatus: 'offline' })
    })
    render(<LiveCard />)
    expect(
      screen.getByText(/No forecast reached the island/),
    ).toBeInTheDocument()
  })

  it('names where the weather comes from', () => {
    render(<LiveCard />)
    expect(screen.getByRole('link', { name: /Open-Meteo/ })).toHaveAttribute(
      'href',
      'https://open-meteo.com/',
    )
  })
})

describe('moving the sky', () => {
  it('goes to a place one tap away', () => {
    render(<LiveCard />)
    fireEvent.click(chip('Tokyo'))
    expect(useGame.getState().livePlace).toEqual(TOKYO)
    expect(chip('Tokyo')).toHaveAttribute('aria-pressed', 'true')
  })

  it('finds anywhere else by name', async () => {
    const fetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            results: [
              {
                name: 'Thessaloniki',
                latitude: 40.64,
                longitude: 22.93,
                timezone: 'Europe/Athens',
                country: 'Greece',
                admin1: 'Central Macedonia',
              },
            ],
          }),
        ),
    )
    vi.stubGlobal('fetch', fetch)
    render(<LiveCard />)
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'Thessa' },
    })
    fireEvent.click(await screen.findByRole('button', { name: /Thessaloniki/ }))
    expect(useGame.getState().livePlace.name).toBe('Thessaloniki')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('says so when nowhere answers to the name', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({}))),
    )
    render(<LiveCard />)
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'Qwxz' },
    })
    expect(await screen.findByText('Nowhere by that name.')).toBeInTheDocument()
  })

  it('holds a time of day, and lets it go again', () => {
    render(<LiveCard />)
    fireEvent.change(screen.getByRole('slider'), { target: { value: '1290' } })
    expect(useGame.getState().liveClock).toBe(1290)
    expect(screen.getByText('21:30')).toBeInTheDocument()
    expect(chip('Now')).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(chip('Now'))
    expect(useGame.getState().liveClock).toBeNull()
  })
})

describe('in the middle of a game', () => {
  it('leaves the sky alone', () => {
    act(() => {
      useGame.setState({ moto: {} as never })
    })
    render(<LiveCard />)
    expect(chip('Tokyo')).toBeDisabled()
    expect(screen.getByRole('slider')).toBeDisabled()
    expect(screen.getByRole('searchbox')).toBeDisabled()
    expect(screen.getByText(/until the game is over/)).toBeInTheDocument()
  })
})
