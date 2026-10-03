/**
 * Samples to a WAV file: 16-bit PCM, channels interleaved.
 *
 * The trailer's soundtrack leaves the browser this way, for the recorder to
 * lay under the frames. Loudness is the encoder's business rather than this
 * file's, so the samples are written as they come, clipped at the rails and
 * no more.
 */
export function wav(channels: Float32Array[], rate: number): Uint8Array {
  const count = channels.length
  const length = channels[0]?.length ?? 0
  const bytes = length * count * 2
  const out = new DataView(new ArrayBuffer(44 + bytes))

  const text = (at: number, s: string) => {
    for (let i = 0; i < s.length; i++) out.setUint8(at + i, s.charCodeAt(i))
  }

  text(0, 'RIFF')
  out.setUint32(4, 36 + bytes, true)
  text(8, 'WAVE')
  text(12, 'fmt ')
  out.setUint32(16, 16, true)
  out.setUint16(20, 1, true) // PCM
  out.setUint16(22, count, true)
  out.setUint32(24, rate, true)
  out.setUint32(28, rate * count * 2, true)
  out.setUint16(32, count * 2, true)
  out.setUint16(34, 16, true)
  text(36, 'data')
  out.setUint32(40, bytes, true)

  let at = 44
  for (let i = 0; i < length; i++) {
    for (const channel of channels) {
      const s = Math.max(-1, Math.min(1, channel[i]))
      out.setInt16(at, s < 0 ? s * 0x8000 : s * 0x7fff, true)
      at += 2
    }
  }
  return new Uint8Array(out.buffer)
}
