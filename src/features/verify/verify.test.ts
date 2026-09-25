import { describe, expect, it } from 'vitest'
import { formatSerial, mintSerial, sign, signFor } from '../launch/certId'
import { judge, readRequest } from './verify'

describe('reading the link', () => {
  it('takes the reference from the path and the name from the query', () => {
    expect(readRequest('/verify/KI-00001-00002', '?name=John%20Doe')).toEqual({
      reference: 'KI-00001-00002',
      name: 'John Doe',
    })
  })

  it('takes a bare name, quoted or not', () => {
    /* The way the link gets written out by hand: no `name=`, and sometimes
       the name in quotes the way it was said. */
    expect(readRequest('/verify/KI-1-2', '?John%20Doe').name).toBe('John Doe')
    expect(readRequest('/verify/KI-1-2', '?"John Doe"').name).toBe('John Doe')
    expect(readRequest('/verify/KI-1-2', '?%22John%20Doe%22').name).toBe(
      'John Doe',
    )
    expect(readRequest('/verify/KI-1-2', '?John+Doe').name).toBe('John Doe')
  })

  it('upper-cases the reference and ignores a trailing slash', () => {
    expect(readRequest('/verify/ki-1-2/', '').reference).toBe('KI-1-2')
  })

  it('is empty on the bare page', () => {
    expect(readRequest('/verify', '')).toEqual({ reference: '', name: '' })
    expect(readRequest('/verify/', '')).toEqual({ reference: '', name: '' })
  })

  it('does not throw on a malformed escape', () => {
    expect(readRequest('/verify/%E0%A4%A', '?%E0%A4%A').reference).toBe(
      '%E0%A4%A',
    )
  })
})

describe('the verdict', () => {
  const serial = mintSerial(() => 0.5)
  const reference = formatSerial(serial, signFor(serial, 'John Doe'))

  it('verifies a certificate against its own name', () => {
    const v = judge({ reference, name: 'John Doe' })
    expect(v.tone).toBe('good')
    expect(v.detail).toContain('John Doe')
  })

  it('refuses it against somebody else', () => {
    expect(judge({ reference, name: 'Jane Doe' }).tone).toBe('bad')
  })

  it('asks for the name when the link has none', () => {
    expect(judge({ reference, name: '' }).headline).toBe('Name needed')
  })

  it('says what a 1.1 certificate can and cannot vouch for', () => {
    const old = formatSerial(serial, sign(serial))
    const v = judge({ reference: old, name: 'John Doe' })
    expect(v.tone).toBe('fair')
    expect(v.detail).toContain('cannot confirm')
  })

  it('offers the form on the bare page', () => {
    expect(judge({ reference: '', name: '' }).check).toBe('empty')
  })
})
