import { describe, expect, it } from 'vitest'
import {
  HUMAN_MS,
  LIMITS,
  SUBJECTS,
  checkTransmission,
  looksAutomated,
  messageBody,
  subjectLine,
} from './transmission'

/**
 * The rules a message is held to, on both sides of the wire.
 *
 * The Worker hands these whatever `request.json()` produced, so the cases
 * worth checking are the ones a hand-written request could send: wrong
 * types, missing fields, and fields that are the right type and still wrong.
 */

const GOOD = {
  name: 'Ada Lovelace',
  from: 'ada@example.com',
  subject: SUBJECTS[0],
  message: 'Hello from the analytical engine.',
  company: '',
  elapsed: 12_000,
  token: 'token',
}

describe('checking a transmission', () => {
  it('passes a well-formed message, trimmed', () => {
    const checked = checkTransmission({
      ...GOOD,
      name: '  Ada  ',
      message: '  Hi  ',
    })
    expect(checked).toEqual({
      ok: true,
      value: { ...GOOD, name: 'Ada', message: 'Hi' },
    })
  })

  it('lets the name be left out', () => {
    expect(checkTransmission({ ...GOOD, name: '' }).ok).toBe(true)
  })

  it.each([null, 'text', 42, []])('calls %j malformed', (raw) => {
    expect(checkTransmission(raw)).toEqual({ ok: false, problem: 'malformed' })
  })

  it.each(['name', 'from', 'subject', 'message', 'company', 'token'])(
    'calls it malformed when %s is not a string',
    (key) => {
      expect(checkTransmission({ ...GOOD, [key]: 7 })).toEqual({
        ok: false,
        problem: 'malformed',
      })
    },
  )

  it('calls it malformed when the timing is not a number', () => {
    for (const elapsed of ['12000', Number.NaN, Infinity, undefined]) {
      expect(checkTransmission({ ...GOOD, elapsed }).ok).toBe(false)
    }
  })

  it('turns away a token longer than Turnstile ever issues', () => {
    const token = 'x'.repeat(LIMITS.token + 1)
    expect(checkTransmission({ ...GOOD, token })).toEqual({
      ok: false,
      problem: 'malformed',
    })
  })

  it('turns away a name with a line break, which could forge a header', () => {
    expect(checkTransmission({ ...GOOD, name: 'Ada\r\nBcc: x@y.z' })).toEqual({
      ok: false,
      problem: 'name',
    })
  })

  it('turns away a name that is too long', () => {
    const name = 'a'.repeat(LIMITS.name + 1)
    expect(checkTransmission({ ...GOOD, name })).toEqual({
      ok: false,
      problem: 'name',
    })
  })

  it.each(['', 'ada', 'ada@example', 'ada @example.com', 'a@b.c\nx'])(
    'turns away %j as a reply address',
    (from) => {
      expect(checkTransmission({ ...GOOD, from })).toEqual({
        ok: false,
        problem: 'from',
      })
    },
  )

  it('turns away a subject that is not on the list', () => {
    expect(checkTransmission({ ...GOOD, subject: 'Buy now' })).toEqual({
      ok: false,
      problem: 'subject',
    })
  })

  it('turns away an empty message, and one that is too long', () => {
    for (const message of ['   ', 'm'.repeat(LIMITS.message + 1)]) {
      expect(checkTransmission({ ...GOOD, message })).toEqual({
        ok: false,
        problem: 'message',
      })
    }
  })
})

describe('telling a bot from a person', () => {
  it('trusts someone who took their time and left the trap alone', () => {
    expect(looksAutomated({ company: '', elapsed: HUMAN_MS })).toBe(false)
  })

  it('catches anything that filled in the trap', () => {
    expect(looksAutomated({ company: 'ACME', elapsed: 60_000 })).toBe(true)
  })

  it('catches anything faster than a person can type', () => {
    expect(looksAutomated({ company: '', elapsed: HUMAN_MS - 1 })).toBe(true)
  })
})

describe('the mail as it lands', () => {
  it('tags the subject with where it came from', () => {
    expect(subjectLine('Technical question')).toBe(
      '[Kitsos Island] Technical question',
    )
  })

  it('signs the message off with the sender', () => {
    expect(messageBody(GOOD)).toBe(
      [
        'Hello from the analytical engine.',
        '',
        '–',
        'From: Ada Lovelace',
        'Reply to: ada@example.com',
        'Sent from the Radio Center on Kitsos Island.',
      ].join('\n'),
    )
  })

  it('leaves out the lines nobody filled in', () => {
    expect(messageBody({ name: '', from: '', message: 'Hi' })).toBe(
      'Hi\n\n–\nSent from the Radio Center on Kitsos Island.',
    )
  })
})
