/**
 * @vitest-environment jsdom
 */
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CloseMark } from './CloseMark'
import { fakeScreen } from '../../test/screen'

/**
 * Every card's close button says how else to close it. That is only worth
 * saying about a key the visitor actually has.
 */

describe('CloseMark', () => {
  it('names Esc beside the cross where there is a keyboard', () => {
    const { container } = render(<CloseMark />)
    expect(container).toHaveTextContent('✕Esc')
  })

  it('is the cross alone on a touch screen, which has no Esc', () => {
    fakeScreen({ mobile: true, coarse: true })
    const { container } = render(<CloseMark />)
    expect(container).toHaveTextContent('✕')
    expect(container.querySelector('kbd')).toBeNull()
  })
})
