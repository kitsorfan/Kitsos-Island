/**
 * One definition of the sea's shape, shared by everything that touches it.
 *
 * The water is a shader and the boat is a mesh, so the only way the hull can
 * ride the same swell the player can see is for both to evaluate the same
 * function. It used to be copied into two files and they drifted apart by a
 * hand's width, which is exactly enough to see daylight under a boat.
 */

/**
 * The long swell, in GLSL. Displaced in the vertex shader and sampled on the
 * CPU by `waveAt`, so the two must stay literally the same arithmetic.
 */
export const SWELL_GLSL = /* glsl */ `
  float swellAt(vec2 p, float t) {
    return
      sin(p.x * 0.085 + t * 0.9) * 0.24 +
      sin(p.y * 0.11 - t * 1.05) * 0.19 +
      sin((p.x + p.y) * 0.042 + t * 0.55) * 0.16;
  }

  /**
   * The chop on top of it: too fine to be worth tessellating for, so it is
   * never displaced — only the normal knows about it. That keeps the CPU
   * side honest, since the hull only has to match the swell.
   */
  float chopAt(vec2 p, float t) {
    return
      sin(p.x * 0.62 - p.y * 0.31 + t * 2.3) * 0.085 +
      sin(p.y * 0.83 + p.x * 0.24 - t * 2.9) * 0.062 +
      sin((p.x - p.y) * 1.44 + t * 3.7) * 0.032 +
      sin((p.x * 0.7 + p.y * 1.9) * 1.7 - t * 4.6) * 0.018;
  }
`

/** The same swell on the CPU, for anything that has to float on it. */
export function waveAt(x: number, z: number, t: number) {
  return (
    Math.sin(x * 0.085 + t * 0.9) * 0.24 +
    Math.sin(z * 0.11 - t * 1.05) * 0.19 +
    Math.sin((x + z) * 0.042 + t * 0.55) * 0.16
  )
}

/**
 * Everything laid on the sea has to be told to draw after it: the water is
 * rendered at order 1 with depth writes off, so anything at a lower order is
 * simply painted over. This cost a whole evening once already.
 */
export const ON_WATER = 3

/**
 * Vertex shader for a flat sheet that has to lie *on* the water rather than
 * near it — a wake, a gauge, a patch of foam. It throws away the mesh's own
 * height and takes the sea's, so a sheet the size of a tanker still follows
 * every crest under it instead of slicing through them.
 *
 * `uLift` is the hair of clearance that keeps it out of a depth fight with
 * the water, and `uSea` is the mean sea level in world space.
 */
export const LIE_ON_SEA_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uSea;
  uniform float uLift;
  varying vec2 vUv;
  varying vec3 vWorld;

  ${SWELL_GLSL}

  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    world.y = uSea + swellAt(world.xz, uTime) + uLift;
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`
