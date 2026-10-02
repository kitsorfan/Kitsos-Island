import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { forecastUrl } from './forecast'
import { ATHENS, searchUrl } from './places'

/**
 * The page's Content-Security-Policy names every origin the island may
 * fetch from, and the browser refuses the rest without a word to anyone:
 * Live would simply never hear a forecast, on the real site only, and look
 * from the inside exactly like a network that is down. So what the code
 * asks for is checked against what the headers allow.
 */

const headers = readFileSync(
  join(import.meta.dirname, '../../../public/_headers'),
  'utf8',
)

/** The origins connect-src lets the page reach. */
const connectable = (() => {
  const policy = headers.match(/Content-Security-Policy:(.*)/)?.[1] ?? ''
  const directive = policy
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('connect-src'))
  return (directive ?? '').split(/\s+/).slice(1)
})()

describe('what the live sky is allowed to reach', () => {
  it('may ask for the forecast', () => {
    expect(connectable).toContain(new URL(forecastUrl(ATHENS)).origin)
  })

  it('may search for a place', () => {
    expect(connectable).toContain(new URL(searchUrl('Athens', 'en')).origin)
  })

  it('may still reach its own Worker', () => {
    expect(connectable).toContain("'self'")
  })
})
