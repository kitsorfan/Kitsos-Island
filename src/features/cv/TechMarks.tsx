import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'

/**
 * The marks on the technology wall.
 *
 * Every one is drawn in code onto a canvas, in the same spirit as the
 * institution seals in `Emblems.tsx`: these are stylised stand-ins built out
 * of the shape each technology is *known* by — the steaming cup, the leaf, the
 * orbit, the whale, the dolphin — not copies of anybody's registered artwork.
 * Nothing is fetched, so the wall renders offline and at any zoom without a
 * single image file in the repo.
 *
 * Each mark draws into a square of side `w`, on a transparent ground, in flat
 * colour. `u = w / 100` is the unit every figure is measured in, so a mark can
 * be read at any canvas size.
 */

const FONT = '"Baloo 2", "Trebuchet MS", "Segoe UI", system-ui, sans-serif'

type Draw = (ctx: CanvasRenderingContext2D, w: number) => void

/* ------------------------------ small helpers ------------------------- */

/** A rounded rectangle, which half these marks are built out of. */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
  ctx.fill()
}

/** A regular polygon, point-up unless turned. */
function polygon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  sides: number,
  turn = 0,
) {
  ctx.beginPath()
  for (let i = 0; i < sides; i++) {
    const a = turn - Math.PI / 2 + (i * Math.PI * 2) / sides
    const x = cx + Math.cos(a) * r
    const y = cy + Math.sin(a) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
}

/** One of the three ellipses that make an orbit. */
function orbit(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  turn: number,
  width: number,
) {
  ctx.lineWidth = width
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, ry, turn, 0, Math.PI * 2)
  ctx.stroke()
}

/** Letters set in the middle of a mark, for the ones that are wordmarks. */
function letters(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  size: number,
  colour: string,
  weight = 800,
) {
  ctx.fillStyle = colour
  ctx.font = `${weight} ${size}px ${FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, cx, cy)
}

/* --------------------------------- marks ------------------------------ */

/* Languages */

/** Java: the steaming cup. */
const java: Draw = (ctx, w) => {
  const u = w / 100
  ctx.fillStyle = '#e8763a'
  ctx.lineWidth = u * 3.4
  ctx.lineCap = 'round'
  ctx.strokeStyle = '#e8763a'
  // Three curls of steam over the rim.
  for (const [x, lean] of [
    [-u * 12, u * 6],
    [0, -u * 5],
    [u * 12, u * 6],
  ]) {
    ctx.beginPath()
    ctx.moveTo(w / 2 + x, u * 44)
    ctx.bezierCurveTo(
      w / 2 + x + lean,
      u * 34,
      w / 2 + x - lean,
      u * 26,
      w / 2 + x + lean * 0.4,
      u * 16,
    )
    ctx.stroke()
  }
  // The cup.
  ctx.fillStyle = '#3d6a8f'
  ctx.beginPath()
  ctx.moveTo(u * 26, u * 52)
  ctx.lineTo(u * 70, u * 52)
  ctx.lineTo(u * 63, u * 82)
  ctx.quadraticCurveTo(u * 48, u * 88, u * 33, u * 82)
  ctx.closePath()
  ctx.fill()
  // The handle.
  ctx.lineWidth = u * 5
  ctx.strokeStyle = '#3d6a8f'
  ctx.beginPath()
  ctx.arc(u * 71, u * 63, u * 9, -Math.PI * 0.45, Math.PI * 0.45)
  ctx.stroke()
  // The saucer.
  ctx.fillStyle = '#3d6a8f'
  roundRect(ctx, u * 20, u * 84, u * 60, u * 7, u * 3.5)
}

/** JavaScript: the yellow square with two letters. */
const javascript: Draw = (ctx, w) => {
  const u = w / 100
  ctx.fillStyle = '#e8c53a'
  roundRect(ctx, u * 12, u * 12, u * 76, u * 76, u * 8)
  letters(ctx, 'JS', w / 2 + u * 4, w / 2 + u * 10, u * 42, '#2b2a22')
}

/** TypeScript: the blue square with two letters. */
const typescript: Draw = (ctx, w) => {
  const u = w / 100
  ctx.fillStyle = '#3a7bd0'
  roundRect(ctx, u * 12, u * 12, u * 76, u * 76, u * 8)
  letters(ctx, 'TS', w / 2 + u * 4, w / 2 + u * 10, u * 42, '#f4f8fd')
}

/** Python: the two interlocked serpents, one up, one down. */
const python: Draw = (ctx, w) => {
  const u = w / 100
  const body = (colour: string, flip: boolean, eyeX: number, eyeY: number) => {
    ctx.save()
    if (flip) {
      ctx.translate(w, w)
      ctx.rotate(Math.PI)
    }
    ctx.fillStyle = colour
    ctx.beginPath()
    // Head and shoulders at the top, tail curling to the lower right.
    ctx.moveTo(u * 32, u * 24)
    ctx.quadraticCurveTo(u * 32, u * 12, u * 46, u * 12)
    ctx.lineTo(u * 62, u * 12)
    ctx.quadraticCurveTo(u * 74, u * 12, u * 74, u * 26)
    ctx.lineTo(u * 74, u * 40)
    ctx.quadraticCurveTo(u * 74, u * 52, u * 60, u * 52)
    ctx.lineTo(u * 40, u * 52)
    ctx.quadraticCurveTo(u * 26, u * 52, u * 26, u * 66)
    ctx.lineTo(u * 42, u * 66)
    ctx.lineTo(u * 42, u * 58)
    ctx.quadraticCurveTo(u * 42, u * 44, u * 56, u * 44)
    ctx.lineTo(u * 48, u * 44)
    ctx.quadraticCurveTo(u * 44, u * 44, u * 44, u * 34)
    ctx.lineTo(u * 44, u * 24)
    ctx.closePath()
    ctx.fill()
    // The eye.
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(eyeX, eyeY, u * 3.6, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
  body('#3f6f9e', false, u * 52, u * 21)
  body('#e0be4a', true, u * 52, u * 21)
}

/** C++: the letter and the two crosses. */
const cpp: Draw = (ctx, w) => {
  const u = w / 100
  ctx.fillStyle = '#5a7fbe'
  polygon(ctx, w / 2, w / 2, u * 44, 6, Math.PI / 6)
  letters(ctx, 'C', u * 38, w / 2 + u * 2, u * 44, '#f2f6fb')
  ctx.fillStyle = '#f2f6fb'
  for (const cx of [u * 62, u * 79]) {
    ctx.fillRect(cx - u * 7, w / 2 - u * 2.6, u * 14, u * 5.2)
    ctx.fillRect(cx - u * 2.6, w / 2 - u * 7, u * 5.2, u * 14)
  }
}

/* Backend and AI */

/** Spring: the leaf. Used for the framework, Boot, Security, Data JPA and AI. */
function springLeaf(ctx: CanvasRenderingContext2D, w: number, ring: boolean) {
  const u = w / 100
  ctx.fillStyle = '#6aa84f'
  if (ring) {
    // Boot's open circle, broken at the top right.
    ctx.strokeStyle = '#6aa84f'
    ctx.lineWidth = u * 9
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.arc(w / 2, w / 2, u * 36, -Math.PI * 0.28, Math.PI * 1.62)
    ctx.stroke()
  }
  // The leaf: a pointed blade leaning to the upper right, with a midrib.
  ctx.beginPath()
  ctx.moveTo(u * 30, u * 68)
  ctx.bezierCurveTo(u * 30, u * 34, u * 54, u * 22, u * 76, u * 22)
  ctx.bezierCurveTo(u * 76, u * 52, u * 58, u * 70, u * 30, u * 68)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#e9f3e2'
  ctx.lineWidth = u * 3
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(u * 36, u * 64)
  ctx.quadraticCurveTo(u * 56, u * 52, u * 72, u * 28)
  ctx.stroke()
}

const spring: Draw = (ctx, w) => springLeaf(ctx, w, false)
const springBoot: Draw = (ctx, w) => springLeaf(ctx, w, true)

/** Spring AI: the leaf with a spark over it. */
const springAi: Draw = (ctx, w) => {
  const u = w / 100
  springLeaf(ctx, w, false)
  ctx.fillStyle = '#ffd166'
  // A four-pointed spark, top left.
  ctx.beginPath()
  ctx.moveTo(u * 24, u * 8)
  ctx.quadraticCurveTo(u * 27, u * 22, u * 40, u * 25)
  ctx.quadraticCurveTo(u * 27, u * 28, u * 24, u * 42)
  ctx.quadraticCurveTo(u * 21, u * 28, u * 8, u * 25)
  ctx.quadraticCurveTo(u * 21, u * 22, u * 24, u * 8)
  ctx.fill()
}

/** Hibernate: the standing bear-ish glyph, kept to its monogram instead. */
const hibernate: Draw = (ctx, w) => {
  const u = w / 100
  ctx.fillStyle = '#9aa7ad'
  polygon(ctx, w / 2, w / 2, u * 42, 6)
  letters(ctx, 'H', w / 2, w / 2 + u * 2, u * 46, '#2f3a40')
}

/** A neural network: three layers of nodes, wired up. Stands for the AI work. */
const neural: Draw = (ctx, w) => {
  const u = w / 100
  const cols = [
    [u * 22, [u * 30, u * 50, u * 70]],
    [u * 50, [u * 22, u * 42, u * 62, u * 82]],
    [u * 78, [u * 38, u * 62]],
  ] as const
  ctx.strokeStyle = 'rgba(120, 190, 220, 0.55)'
  ctx.lineWidth = u * 1.6
  for (let i = 0; i < cols.length - 1; i++) {
    for (const y0 of cols[i][1]) {
      for (const y1 of cols[i + 1][1]) {
        ctx.beginPath()
        ctx.moveTo(cols[i][0], y0)
        ctx.lineTo(cols[i + 1][0], y1)
        ctx.stroke()
      }
    }
  }
  for (const [x, ys] of cols) {
    for (const y of ys) {
      ctx.fillStyle = '#4fb3d9'
      ctx.beginPath()
      ctx.arc(x, y, u * 6, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

/** REST: a plug and socket, for the API work. */
const rest: Draw = (ctx, w) => {
  const u = w / 100
  ctx.fillStyle = '#7f9cc0'
  roundRect(ctx, u * 10, u * 34, u * 34, u * 32, u * 6)
  ctx.fillStyle = '#e9eff5'
  ctx.fillRect(u * 44, u * 42, u * 14, u * 6)
  ctx.fillRect(u * 44, u * 52, u * 14, u * 6)
  ctx.fillStyle = '#7f9cc0'
  roundRect(ctx, u * 58, u * 34, u * 32, u * 32, u * 6)
}

/** Microservices: four tiles talking to one another. */
const microservices: Draw = (ctx, w) => {
  const u = w / 100
  ctx.strokeStyle = '#8fb4a6'
  ctx.lineWidth = u * 3
  ctx.beginPath()
  ctx.moveTo(u * 30, u * 30)
  ctx.lineTo(u * 70, u * 70)
  ctx.moveTo(u * 70, u * 30)
  ctx.lineTo(u * 30, u * 70)
  ctx.stroke()
  ctx.fillStyle = '#4e9c86'
  for (const [x, y] of [
    [u * 30, u * 30],
    [u * 70, u * 30],
    [u * 30, u * 70],
    [u * 70, u * 70],
  ]) {
    roundRect(ctx, x - u * 13, y - u * 13, u * 26, u * 26, u * 5)
  }
}

/* Frontend */

/** React: the nucleus and its three orbits. */
const react: Draw = (ctx, w) => {
  const u = w / 100
  ctx.strokeStyle = '#4fc3e8'
  for (const turn of [0, Math.PI / 3, -Math.PI / 3]) {
    orbit(ctx, w / 2, w / 2, u * 42, u * 16, turn, u * 4)
  }
  ctx.fillStyle = '#4fc3e8'
  ctx.beginPath()
  ctx.arc(w / 2, w / 2, u * 8.5, 0, Math.PI * 2)
  ctx.fill()
}

/** Angular: the shield with its letter. */
const angular: Draw = (ctx, w) => {
  const u = w / 100
  ctx.fillStyle = '#c3345a'
  ctx.beginPath()
  ctx.moveTo(w / 2, u * 10)
  ctx.lineTo(u * 88, u * 24)
  ctx.lineTo(u * 78, u * 72)
  ctx.lineTo(w / 2, u * 92)
  ctx.lineTo(u * 22, u * 72)
  ctx.lineTo(u * 12, u * 24)
  ctx.closePath()
  ctx.fill()
  letters(ctx, 'A', w / 2, u * 52, u * 44, '#fdeef2')
}

/** HTML: the shield, in its orange. */
const html: Draw = (ctx, w) => {
  const u = w / 100
  ctx.fillStyle = '#e06b3a'
  ctx.beginPath()
  ctx.moveTo(u * 16, u * 12)
  ctx.lineTo(u * 84, u * 12)
  ctx.lineTo(u * 76, u * 80)
  ctx.lineTo(w / 2, u * 92)
  ctx.lineTo(u * 24, u * 80)
  ctx.closePath()
  ctx.fill()
  letters(ctx, '5', w / 2, u * 52, u * 40, '#fceee8')
}

/** CSS: the same shield, in its blue. */
const css: Draw = (ctx, w) => {
  const u = w / 100
  ctx.fillStyle = '#3f74c0'
  ctx.beginPath()
  ctx.moveTo(u * 16, u * 12)
  ctx.lineTo(u * 84, u * 12)
  ctx.lineTo(u * 76, u * 80)
  ctx.lineTo(w / 2, u * 92)
  ctx.lineTo(u * 24, u * 80)
  ctx.closePath()
  ctx.fill()
  letters(ctx, '3', w / 2, u * 52, u * 40, '#eaf1fb')
}

/** Tailwind: the two stacked waves. */
const tailwind: Draw = (ctx, w) => {
  const u = w / 100
  ctx.strokeStyle = '#43b8cc'
  ctx.lineWidth = u * 10
  ctx.lineCap = 'round'
  for (const dy of [-u * 12, u * 12]) {
    ctx.beginPath()
    ctx.moveTo(u * 16, w / 2 + dy + u * 6)
    ctx.bezierCurveTo(
      u * 32,
      w / 2 + dy - u * 14,
      u * 48,
      w / 2 + dy + u * 16,
      u * 84,
      w / 2 + dy - u * 6,
    )
    ctx.stroke()
  }
}

/* Databases */

/** MySQL: the dolphin over the waterline. */
const mysql: Draw = (ctx, w) => {
  const u = w / 100
  ctx.fillStyle = '#2f6d8c'
  // Body, arcing from lower left up to a snout at the right.
  ctx.beginPath()
  ctx.moveTo(u * 14, u * 70)
  ctx.bezierCurveTo(u * 26, u * 34, u * 58, u * 22, u * 86, u * 34)
  ctx.bezierCurveTo(u * 74, u * 40, u * 72, u * 46, u * 74, u * 52)
  ctx.bezierCurveTo(u * 56, u * 46, u * 32, u * 56, u * 24, u * 76)
  ctx.closePath()
  ctx.fill()
  // Dorsal fin.
  ctx.beginPath()
  ctx.moveTo(u * 46, u * 30)
  ctx.quadraticCurveTo(u * 50, u * 14, u * 62, u * 12)
  ctx.quadraticCurveTo(u * 58, u * 24, u * 58, u * 30)
  ctx.closePath()
  ctx.fill()
  // Tail.
  ctx.beginPath()
  ctx.moveTo(u * 18, u * 66)
  ctx.quadraticCurveTo(u * 8, u * 76, u * 10, u * 88)
  ctx.quadraticCurveTo(u * 24, u * 82, u * 26, u * 72)
  ctx.closePath()
  ctx.fill()
  // The eye.
  ctx.fillStyle = '#eef6fa'
  ctx.beginPath()
  ctx.arc(u * 72, u * 38, u * 2.8, 0, Math.PI * 2)
  ctx.fill()
}

/** Flyway: a migration, drawn as versioned bars climbing. */
const flyway: Draw = (ctx, w) => {
  const u = w / 100
  ctx.fillStyle = '#c1584a'
  for (let i = 0; i < 4; i++) {
    const h = u * (18 + i * 17)
    roundRect(ctx, u * (16 + i * 18), u * 84 - h, u * 13, h, u * 3)
  }
}

/* Cloud and DevOps */

/** AWS: the cloud with the smile beneath it. */
const aws: Draw = (ctx, w) => {
  const u = w / 100
  ctx.fillStyle = '#e8963a'
  ctx.beginPath()
  ctx.arc(u * 36, u * 40, u * 16, 0, Math.PI * 2)
  ctx.arc(u * 58, u * 34, u * 20, 0, Math.PI * 2)
  ctx.arc(u * 72, u * 46, u * 14, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillRect(u * 36, u * 38, u * 36, u * 22)
  // The arrowed smile.
  ctx.strokeStyle = '#e8963a'
  ctx.lineWidth = u * 6
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(u * 18, u * 72)
  ctx.quadraticCurveTo(w / 2, u * 94, u * 82, u * 72)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(u * 82, u * 72)
  ctx.lineTo(u * 70, u * 74)
  ctx.moveTo(u * 82, u * 72)
  ctx.lineTo(u * 80, u * 84)
  ctx.stroke()
}

/** Docker: the whale carrying its stacked containers. */
const docker: Draw = (ctx, w) => {
  const u = w / 100
  ctx.fillStyle = '#3d91d6'
  // The containers: a row of six with three on top.
  for (let i = 0; i < 6; i++) {
    roundRect(ctx, u * (18 + i * 11), u * 44, u * 9, u * 12, u * 1.6)
  }
  for (let i = 0; i < 3; i++) {
    roundRect(ctx, u * (29 + i * 11), u * 30, u * 9, u * 12, u * 1.6)
  }
  // The whale beneath them.
  ctx.beginPath()
  ctx.moveTo(u * 10, u * 60)
  ctx.lineTo(u * 84, u * 60)
  ctx.quadraticCurveTo(u * 84, u * 84, u * 54, u * 84)
  ctx.quadraticCurveTo(u * 22, u * 84, u * 10, u * 68)
  ctx.closePath()
  ctx.fill()
  // The tail.
  ctx.beginPath()
  ctx.moveTo(u * 84, u * 62)
  ctx.quadraticCurveTo(u * 94, u * 54, u * 94, u * 44)
  ctx.quadraticCurveTo(u * 88, u * 52, u * 82, u * 54)
  ctx.closePath()
  ctx.fill()
}

/** Podman: the same idea in its own colour, with a seal rather than a whale. */
const podman: Draw = (ctx, w) => {
  const u = w / 100
  ctx.fillStyle = '#8a5fc0'
  ctx.beginPath()
  ctx.arc(w / 2, u * 60, u * 26, Math.PI, 0)
  ctx.fill()
  ctx.fillRect(u * 24, u * 60, u * 52, u * 18)
  // Head and snout.
  ctx.beginPath()
  ctx.arc(u * 66, u * 30, u * 15, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(u * 80, u * 34, u * 9, u * 6, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#f1e9fa'
  ctx.beginPath()
  ctx.arc(u * 68, u * 26, u * 3.2, 0, Math.PI * 2)
  ctx.fill()
}

/** Jenkins: the butler, reduced to hat, face and bow tie. */
const jenkins: Draw = (ctx, w) => {
  const u = w / 100
  // Hat.
  ctx.fillStyle = '#3b4652'
  roundRect(ctx, u * 26, u * 14, u * 48, u * 14, u * 5)
  roundRect(ctx, u * 18, u * 26, u * 64, u * 6, u * 3)
  // Face.
  ctx.fillStyle = '#e8c9a8'
  ctx.beginPath()
  ctx.ellipse(w / 2, u * 50, u * 22, u * 20, 0, 0, Math.PI * 2)
  ctx.fill()
  // Eyes and moustache.
  ctx.fillStyle = '#3b4652'
  ctx.beginPath()
  ctx.arc(u * 42, u * 46, u * 3.4, 0, Math.PI * 2)
  ctx.arc(u * 58, u * 46, u * 3.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(w / 2, u * 58, u * 12, u * 4.4, 0, 0, Math.PI * 2)
  ctx.fill()
  // Collar and bow tie.
  ctx.fillStyle = '#f3f5f7'
  ctx.beginPath()
  ctx.moveTo(u * 32, u * 70)
  ctx.lineTo(u * 68, u * 70)
  ctx.lineTo(u * 74, u * 90)
  ctx.lineTo(u * 26, u * 90)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#c1443c'
  ctx.beginPath()
  ctx.moveTo(w / 2, u * 78)
  ctx.lineTo(u * 38, u * 72)
  ctx.lineTo(u * 38, u * 86)
  ctx.closePath()
  ctx.moveTo(w / 2, u * 78)
  ctx.lineTo(u * 62, u * 72)
  ctx.lineTo(u * 62, u * 86)
  ctx.closePath()
  ctx.fill()
}

/** Git: the commit graph — a trunk with one branch off it. */
function gitGraph(ctx: CanvasRenderingContext2D, w: number, colour: string) {
  const u = w / 100
  ctx.strokeStyle = colour
  ctx.lineWidth = u * 6
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(u * 26, u * 20)
  ctx.lineTo(u * 26, u * 80)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(u * 26, u * 50)
  ctx.quadraticCurveTo(u * 26, u * 34, u * 44, u * 34)
  ctx.lineTo(u * 64, u * 34)
  ctx.stroke()
  ctx.fillStyle = colour
  for (const [x, y] of [
    [u * 26, u * 20],
    [u * 26, u * 80],
    [u * 74, u * 34],
  ]) {
    ctx.beginPath()
    ctx.arc(x, y, u * 10, 0, Math.PI * 2)
    ctx.fill()
  }
}

const git: Draw = (ctx, w) => gitGraph(ctx, w, '#e05a33')

/** GitLab: the fox mark, as a tapering chevron. */
const gitlab: Draw = (ctx, w) => {
  const u = w / 100
  const tile = (x0: number, x1: number, colour: string) => {
    ctx.fillStyle = colour
    ctx.beginPath()
    ctx.moveTo(w / 2, u * 88)
    ctx.lineTo(x0, u * 44)
    ctx.lineTo(x1, u * 44)
    ctx.closePath()
    ctx.fill()
  }
  tile(u * 12, u * 34, '#e8913a')
  tile(u * 34, u * 66, '#e2553a')
  tile(u * 66, u * 88, '#e8913a')
  // The two upper wedges.
  ctx.fillStyle = '#e2553a'
  ctx.beginPath()
  ctx.moveTo(u * 22, u * 12)
  ctx.lineTo(u * 34, u * 44)
  ctx.lineTo(u * 12, u * 44)
  ctx.closePath()
  ctx.moveTo(u * 78, u * 12)
  ctx.lineTo(u * 88, u * 44)
  ctx.lineTo(u * 66, u * 44)
  ctx.closePath()
  ctx.fill()
}

/** Bitbucket: the funnelling bucket. */
const bitbucket: Draw = (ctx, w) => {
  const u = w / 100
  ctx.fillStyle = '#3a72c0'
  ctx.beginPath()
  ctx.moveTo(u * 10, u * 22)
  ctx.lineTo(u * 90, u * 22)
  ctx.lineTo(u * 66, u * 86)
  ctx.lineTo(u * 34, u * 86)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#9ec3ee'
  ctx.beginPath()
  ctx.moveTo(u * 34, u * 40)
  ctx.lineTo(u * 66, u * 40)
  ctx.lineTo(u * 58, u * 68)
  ctx.lineTo(u * 42, u * 68)
  ctx.closePath()
  ctx.fill()
}

/* Observability */

/** Grafana: the flame over its arc. */
const grafana: Draw = (ctx, w) => {
  const u = w / 100
  ctx.fillStyle = '#e8913a'
  ctx.beginPath()
  ctx.moveTo(w / 2, u * 8)
  ctx.bezierCurveTo(u * 30, u * 30, u * 50, u * 36, u * 38, u * 56)
  ctx.bezierCurveTo(u * 34, u * 70, u * 46, u * 82, u * 58, u * 78)
  ctx.bezierCurveTo(u * 50, u * 70, u * 56, u * 60, u * 66, u * 54)
  ctx.bezierCurveTo(u * 76, u * 40, u * 70, u * 22, w / 2, u * 8)
  ctx.fill()
  ctx.strokeStyle = '#e8c53a'
  ctx.lineWidth = u * 5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(w / 2, u * 60, u * 34, Math.PI * 0.15, Math.PI * 0.85)
  ctx.stroke()
}

/** Graylog / ELK: a stack of log lines under a lens. */
const logs: Draw = (ctx, w) => {
  const u = w / 100
  ctx.fillStyle = '#5f7f96'
  for (let i = 0; i < 5; i++) {
    roundRect(
      ctx,
      u * 14,
      u * (22 + i * 13),
      u * (58 - (i % 2) * 16),
      u * 7,
      u * 3,
    )
  }
  ctx.strokeStyle = '#2f3f4c'
  ctx.lineWidth = u * 5
  ctx.beginPath()
  ctx.arc(u * 68, u * 60, u * 16, 0, Math.PI * 2)
  ctx.stroke()
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(u * 79, u * 72)
  ctx.lineTo(u * 90, u * 84)
  ctx.stroke()
}

/** Sentry: the chevron ridge. */
const sentry: Draw = (ctx, w) => {
  const u = w / 100
  ctx.strokeStyle = '#6a4a8f'
  ctx.lineWidth = u * 9
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(u * 14, u * 74)
  ctx.lineTo(u * 38, u * 34)
  ctx.lineTo(u * 62, u * 74)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(u * 50, u * 54)
  ctx.lineTo(u * 66, u * 28)
  ctx.lineTo(u * 88, u * 66)
  ctx.stroke()
}

/* Testing */

/** JUnit / JaCoCo / Mockito: a tick in a ring, in each one's own colour. */
function tickMark(ctx: CanvasRenderingContext2D, w: number, colour: string) {
  const u = w / 100
  ctx.strokeStyle = colour
  ctx.lineWidth = u * 7
  ctx.beginPath()
  ctx.arc(w / 2, w / 2, u * 36, 0, Math.PI * 2)
  ctx.stroke()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = u * 9
  ctx.beginPath()
  ctx.moveTo(u * 32, u * 52)
  ctx.lineTo(u * 45, u * 66)
  ctx.lineTo(u * 70, u * 36)
  ctx.stroke()
}

const junit: Draw = (ctx, w) => tickMark(ctx, w, '#3f9c6e')
const mockito: Draw = (ctx, w) => tickMark(ctx, w, '#9c6a3f')
const jacoco: Draw = (ctx, w) => tickMark(ctx, w, '#c1a33a')

/* Architecture and design */

/** Jira: the three chevrons folded into a diamond. */
const jira: Draw = (ctx, w) => {
  const u = w / 100
  ctx.fillStyle = '#3a72c0'
  ctx.beginPath()
  ctx.moveTo(w / 2, u * 8)
  ctx.lineTo(u * 88, u * 50)
  ctx.lineTo(u * 70, u * 50)
  ctx.lineTo(w / 2, u * 30)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#6a9ee0'
  ctx.beginPath()
  ctx.moveTo(w / 2, u * 30)
  ctx.lineTo(u * 70, u * 50)
  ctx.lineTo(w / 2, u * 70)
  ctx.lineTo(u * 30, u * 50)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#3a72c0'
  ctx.beginPath()
  ctx.moveTo(w / 2, u * 92)
  ctx.lineTo(u * 12, u * 50)
  ctx.lineTo(u * 30, u * 50)
  ctx.lineTo(w / 2, u * 70)
  ctx.closePath()
  ctx.fill()
}

/** Confluence: the two converging arcs. */
const confluence: Draw = (ctx, w) => {
  const u = w / 100
  ctx.fillStyle = '#3a72c0'
  ctx.beginPath()
  ctx.moveTo(u * 10, u * 66)
  ctx.quadraticCurveTo(u * 44, u * 22, u * 90, u * 44)
  ctx.lineTo(u * 90, u * 62)
  ctx.quadraticCurveTo(u * 46, u * 42, u * 22, u * 78)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#6a9ee0'
  ctx.beginPath()
  ctx.moveTo(u * 90, u * 34)
  ctx.quadraticCurveTo(u * 56, u * 78, u * 10, u * 56)
  ctx.lineTo(u * 10, u * 38)
  ctx.quadraticCurveTo(u * 54, u * 58, u * 78, u * 22)
  ctx.closePath()
  ctx.fill()
}

/** Figma: the four-colour stack with its round right eye. */
const figma: Draw = (ctx, w) => {
  const u = w / 100
  const r = u * 15
  const cell = (
    x: number,
    y: number,
    colour: string,
    round: 'left' | 'right' | 'full',
  ) => {
    ctx.fillStyle = colour
    ctx.beginPath()
    if (round === 'full') {
      ctx.arc(x + r, y + r, r, 0, Math.PI * 2)
    } else if (round === 'right') {
      ctx.arc(x + r, y + r, r, -Math.PI / 2, Math.PI / 2)
      ctx.lineTo(x, y + r * 2)
      ctx.lineTo(x, y)
    } else {
      ctx.arc(x + r, y + r, r, Math.PI / 2, -Math.PI / 2)
      ctx.lineTo(x + r * 2, y)
      ctx.lineTo(x + r * 2, y + r * 2)
    }
    ctx.closePath()
    ctx.fill()
  }
  const left = u * 22
  const mid = left + r * 2
  cell(left, u * 10, '#e2553a', 'right')
  cell(mid, u * 10, '#c56ad6', 'right')
  cell(left, u * 10 + r * 2, '#8a5fc0', 'right')
  cell(mid, u * 10 + r * 2, '#3a9ad6', 'full')
  cell(left, u * 10 + r * 4, '#3fa86e', 'left')
}

/** UML: a class box with its compartments. */
const uml: Draw = (ctx, w) => {
  const u = w / 100
  ctx.fillStyle = '#e9eef2'
  ctx.strokeStyle = '#46555f'
  ctx.lineWidth = u * 3.5
  ctx.beginPath()
  ctx.rect(u * 16, u * 18, u * 68, u * 64)
  ctx.fill()
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(u * 16, u * 38)
  ctx.lineTo(u * 84, u * 38)
  ctx.moveTo(u * 16, u * 60)
  ctx.lineTo(u * 84, u * 60)
  ctx.stroke()
  ctx.fillStyle = '#46555f'
  ctx.fillRect(u * 24, u * 46, u * 40, u * 4)
  ctx.fillRect(u * 24, u * 52, u * 28, u * 4)
  ctx.fillRect(u * 24, u * 68, u * 44, u * 4)
}

/** Agile: the sprint cycle, an arrowed ring. */
const agile: Draw = (ctx, w) => {
  const u = w / 100
  ctx.strokeStyle = '#3f9c8a'
  ctx.lineWidth = u * 9
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(w / 2, w / 2, u * 32, Math.PI * 0.35, Math.PI * 2.05)
  ctx.stroke()
  ctx.fillStyle = '#3f9c8a'
  ctx.beginPath()
  ctx.moveTo(u * 76, u * 44)
  ctx.lineTo(u * 90, u * 24)
  ctx.lineTo(u * 62, u * 26)
  ctx.closePath()
  ctx.fill()
}

/* Healthcare and security */

/** FHIR: the flame over the health bars. */
const fhir: Draw = (ctx, w) => {
  const u = w / 100
  ctx.fillStyle = '#c1443c'
  ctx.beginPath()
  ctx.moveTo(u * 56, u * 8)
  ctx.bezierCurveTo(u * 34, u * 30, u * 52, u * 38, u * 40, u * 56)
  ctx.bezierCurveTo(u * 34, u * 68, u * 48, u * 78, u * 60, u * 72)
  ctx.bezierCurveTo(u * 52, u * 64, u * 60, u * 52, u * 68, u * 46)
  ctx.bezierCurveTo(u * 78, u * 32, u * 70, u * 18, u * 56, u * 8)
  ctx.fill()
  ctx.strokeStyle = '#c1443c'
  ctx.lineWidth = u * 4.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(u * 8, u * 84)
  ctx.lineTo(u * 24, u * 84)
  ctx.lineTo(u * 32, u * 70)
  ctx.lineTo(u * 42, u * 92)
  ctx.lineTo(u * 50, u * 84)
  ctx.lineTo(u * 66, u * 84)
  ctx.stroke()
}

/** Epic: the medical cross, for the EHR the platform lives inside. */
const epic: Draw = (ctx, w) => {
  const u = w / 100
  ctx.fillStyle = '#c1443c'
  roundRect(ctx, u * 38, u * 12, u * 24, u * 76, u * 5)
  roundRect(ctx, u * 12, u * 38, u * 76, u * 24, u * 5)
}

/** UKG: a roster grid with the shift picked out. */
const ukg: Draw = (ctx, w) => {
  const u = w / 100
  ctx.fillStyle = '#4a7f9c'
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      ctx.fillStyle = r === 1 && c === 1 ? '#3fa86e' : '#4a7f9c'
      roundRect(
        ctx,
        u * (16 + c * 24),
        u * (16 + r * 24),
        u * 18,
        u * 18,
        u * 4,
      )
    }
  }
}

/** SSO: the key through the ring. Stands for SAML, ADFS and JWT alike. */
const sso: Draw = (ctx, w) => {
  const u = w / 100
  ctx.fillStyle = '#c9a23a'
  ctx.beginPath()
  ctx.arc(u * 32, u * 42, u * 20, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  ctx.arc(u * 32, u * 42, u * 9, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = '#c9a23a'
  ctx.fillRect(u * 44, u * 52, u * 42, u * 9)
  ctx.fillRect(u * 68, u * 61, u * 8, u * 14)
  ctx.fillRect(u * 80, u * 61, u * 6, u * 11)
}

/** HIPAA: the shield with the cross, for the compliance work. */
const hipaa: Draw = (ctx, w) => {
  const u = w / 100
  ctx.fillStyle = '#3f7f9c'
  ctx.beginPath()
  ctx.moveTo(w / 2, u * 10)
  ctx.lineTo(u * 84, u * 26)
  ctx.quadraticCurveTo(u * 84, u * 74, w / 2, u * 92)
  ctx.quadraticCurveTo(u * 16, u * 74, u * 16, u * 26)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#eaf3f7'
  roundRect(ctx, u * 44, u * 30, u * 12, u * 40, u * 3)
  roundRect(ctx, u * 30, u * 44, u * 40, u * 12, u * 3)
}

/** reCAPTCHA: the ticked ring with its rotation arrows. */
const recaptcha: Draw = (ctx, w) => {
  const u = w / 100
  ctx.strokeStyle = '#3a72c0'
  ctx.lineWidth = u * 9
  ctx.lineCap = 'butt'
  ctx.beginPath()
  ctx.arc(w / 2, w / 2, u * 34, Math.PI * 0.2, Math.PI * 1.5)
  ctx.stroke()
  ctx.fillStyle = '#3a72c0'
  ctx.beginPath()
  ctx.moveTo(u * 50, u * 6)
  ctx.lineTo(u * 30, u * 18)
  ctx.lineTo(u * 50, u * 30)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#3a72c0'
  ctx.lineWidth = u * 10
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(u * 34, u * 50)
  ctx.lineTo(u * 46, u * 64)
  ctx.lineTo(u * 70, u * 36)
  ctx.stroke()
}

/* ------------------------------ the roster ---------------------------- */

export interface TechMark {
  id: string
  /** The name written under the mark. */
  name: string
  draw: Draw
}

export interface TechGroup {
  /** The heading over this run of marks, from the CV's own grouping. */
  label: string
  marks: TechMark[]
}

/**
 * The wall, group by group, in the order the CV lists them. Where several
 * technologies share one idea — the Spring family, the three test libraries —
 * each still gets its own tile, because the wall is a list of what he has
 * used, not a diagram of what is related to what.
 */
export const TECH_GROUPS: TechGroup[] = [
  {
    label: 'Languages',
    marks: [
      { id: 'java', name: 'Java 17–25', draw: java },
      { id: 'typescript', name: 'TypeScript', draw: typescript },
      { id: 'javascript', name: 'JavaScript', draw: javascript },
      { id: 'python', name: 'Python', draw: python },
      { id: 'cpp', name: 'C++', draw: cpp },
    ],
  },
  {
    label: 'Backend',
    marks: [
      { id: 'spring-boot', name: 'Spring Boot', draw: springBoot },
      { id: 'spring', name: 'Spring', draw: spring },
      { id: 'hibernate', name: 'Hibernate', draw: hibernate },
      { id: 'rest', name: 'REST APIs', draw: rest },
      { id: 'microservices', name: 'Microservices', draw: microservices },
    ],
  },
  {
    label: 'AI',
    marks: [
      { id: 'spring-ai', name: 'Spring AI', draw: springAi },
      { id: 'neural', name: 'Neural networks', draw: neural },
    ],
  },
  {
    label: 'Frontend',
    marks: [
      { id: 'react', name: 'React', draw: react },
      // React Native's own mark is the same atom.
      { id: 'react-native', name: 'React Native', draw: react },
      { id: 'angular', name: 'Angular', draw: angular },
      { id: 'html', name: 'HTML', draw: html },
      { id: 'css', name: 'CSS', draw: css },
      { id: 'tailwind', name: 'Tailwind', draw: tailwind },
    ],
  },
  {
    label: 'Databases',
    marks: [
      { id: 'mysql', name: 'MySQL', draw: mysql },
      { id: 'flyway', name: 'Flyway', draw: flyway },
    ],
  },
  {
    label: 'Cloud & DevOps',
    marks: [
      { id: 'aws', name: 'AWS', draw: aws },
      { id: 'docker', name: 'Docker', draw: docker },
      { id: 'podman', name: 'Podman', draw: podman },
      { id: 'jenkins', name: 'Jenkins', draw: jenkins },
      { id: 'gitlab', name: 'GitLab CI', draw: gitlab },
      { id: 'bitbucket', name: 'Bitbucket', draw: bitbucket },
      { id: 'git', name: 'Git', draw: git },
    ],
  },
  {
    label: 'Observability',
    marks: [
      { id: 'grafana', name: 'Grafana', draw: grafana },
      { id: 'graylog', name: 'Graylog · ELK', draw: logs },
      { id: 'sentry', name: 'Sentry', draw: sentry },
    ],
  },
  {
    label: 'Testing',
    marks: [
      { id: 'junit', name: 'JUnit', draw: junit },
      { id: 'mockito', name: 'Mockito', draw: mockito },
      { id: 'jacoco', name: 'JaCoCo', draw: jacoco },
    ],
  },
  {
    label: 'Architecture & design',
    marks: [
      { id: 'jira', name: 'Jira', draw: jira },
      { id: 'confluence', name: 'Confluence', draw: confluence },
      { id: 'figma', name: 'Figma', draw: figma },
      { id: 'uml', name: 'UML', draw: uml },
      { id: 'agile', name: 'Agile/Scrum', draw: agile },
    ],
  },
  {
    label: 'Healthcare & security',
    marks: [
      { id: 'fhir', name: 'SMART on FHIR', draw: fhir },
      { id: 'epic', name: 'Epic EHR', draw: epic },
      { id: 'ukg', name: 'UKG', draw: ukg },
      { id: 'sso', name: 'SAML · ADFS · JWT', draw: sso },
      { id: 'hipaa', name: 'HIPAA', draw: hipaa },
      { id: 'recaptcha', name: 'reCAPTCHA', draw: recaptcha },
    ],
  },
]

/* ----------------------------- the tile itself ------------------------ */

const TILE = 256

/**
 * One mark, drawn once onto a transparent canvas and cached by id. The canvas
 * is square and power-of-two so the mark keeps its mipmaps and does not
 * shimmer when you are across the floor from it.
 */
export function useMarkTexture(id: string, draw: Draw) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = TILE
    canvas.height = TILE
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, TILE, TILE)
      draw(ctx, TILE)
    }
    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    tex.anisotropy = 8
    return tex
    // `id` identifies the mark; each draw function is a module constant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => () => texture.dispose(), [texture])
  return texture
}
