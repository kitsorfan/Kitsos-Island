import { describe, expect, it } from 'vitest'
import { wav } from './wav'

/**
 * The soundtrack leaves the browser as a WAV, and ffmpeg is the only thing
 * that ever reads it — so what matters is that the header says what the
 * samples are, and that the samples are where the header says.
 */

const read = (bytes: Uint8Array) => new DataView(bytes.buffer)
const text = (bytes: Uint8Array, at: number) =>
  String.fromCharCode(...bytes.slice(at, at + 4))

describe('wav', () => {
  const left = new Float32Array([0, 0.5, -0.5, 1])
  const right = new Float32Array([0, -1, 2, -2])
  const file = wav([left, right], 48000)
  const view = read(file)

  it('is a RIFF WAVE of 16-bit PCM', () => {
    expect(text(file, 0)).toBe('RIFF')
    expect(text(file, 8)).toBe('WAVE')
    expect(text(file, 12)).toBe('fmt ')
    expect(view.getUint16(20, true)).toBe(1)
    expect(view.getUint16(34, true)).toBe(16)
  })

  it('says how many channels, how fast, and how much', () => {
    expect(view.getUint16(22, true)).toBe(2)
    expect(view.getUint32(24, true)).toBe(48000)
    expect(view.getUint32(28, true)).toBe(48000 * 2 * 2)
    expect(text(file, 36)).toBe('data')
    expect(view.getUint32(40, true)).toBe(4 * 2 * 2)
    expect(file.length).toBe(44 + 4 * 2 * 2)
  })

  it('interleaves the channels, a frame at a time', () => {
    expect(view.getInt16(44 + 4, true)).toBe(Math.trunc(0.5 * 0x7fff))
    expect(view.getInt16(44 + 6, true)).toBe(-0x8000)
  })

  it('clips at the rails rather than wrapping round', () => {
    expect(view.getInt16(44 + 10, true)).toBe(0x7fff)
    expect(view.getInt16(44 + 14, true)).toBe(-0x8000)
  })
})
