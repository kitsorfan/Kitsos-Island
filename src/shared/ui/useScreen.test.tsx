/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useScreen } from './useScreen'
import { fakeScreen } from '../../test/screen'

/**
 * Which kind of screen the island is on decides how much of the HUD it can
 * afford, so the answer has to be right on the first paint and stay right as
 * the phone turns in someone's hand.
 */

describe('useScreen', () => {
  it('takes a big screen for what it is', () => {
    fakeScreen({})
    const { result } = renderHook(() => useScreen())
    expect(result.current).toEqual({ mobile: false, portrait: false })
  })

  it('knows a phone held upright from the first render', () => {
    fakeScreen({ mobile: true, portrait: true })
    const { result } = renderHook(() => useScreen())
    expect(result.current).toEqual({ mobile: true, portrait: true })
  })

  it('follows the phone as it turns on its side', () => {
    const screen = fakeScreen({ mobile: true, portrait: true })
    const { result } = renderHook(() => useScreen())

    act(() => screen.turn({ portrait: false }))
    expect(result.current).toEqual({ mobile: true, portrait: false })
  })

  it('lets go of a phone once the window is a big one again', () => {
    const screen = fakeScreen({ mobile: true })
    const { result } = renderHook(() => useScreen())

    act(() => screen.turn({ mobile: false }))
    expect(result.current.mobile).toBe(false)
  })
})
