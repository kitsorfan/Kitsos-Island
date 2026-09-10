/**
 * Can this browser draw the island at all?
 *
 * three.js needs WebGL 2, and there are two ordinary ways for a visitor not
 * to have it: an old browser, or — far more likely for someone reading a CV
 * at work — hardware acceleration switched off by IT policy, or a remote
 * desktop with no GPU to pass through. Either way the answer is the same, so
 * the check is made once before anything heavy is fetched.
 */
export function hasWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2')
    if (!gl) return false
    // Hand the context straight back; the real one is made by the canvas.
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}
