import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { PerspectiveCamera } from 'three'
import { useGame } from '../../shared/state/store'
import { setMuted } from '../../shared/engine/audio'
import { renderScore } from '../radio/music'
import { PLAYER_POS, PLAYER_VIEW } from '../player/playerLogic'
import { FPS, barFrame, layout, presence } from './cut'
import type { Pose, Subject } from './moves'
import { RIG } from './rig'
import { light, release, reset, type Memo } from './direct'
import { CARDS, SCORE, SHOTS } from './shots'
import { STAGE, type Phase, type Tally } from './stage'
import { wav } from './wav'

/** Seconds of island before the first shot, while it builds and compiles. */
const WARMUP = 1.5

/** Seconds a shot runs unrecorded before its first frame, unless it says. */
const LEAD = 0.75

/** Frames the trailer fades up out of black, and back down into it. */
const FADE_UP = 30
const FADE_DOWN = 45

/** Frames a card takes to come up, and to go. */
const RISE = 16
const FALL = 12

const SLOTS = layout(SHOTS.map((s) => s.bars))
const TOTAL = SLOTS[SLOTS.length - 1].to
const CARD_SLOTS = CARDS.map((card) => ({
  id: card.id,
  slot: { from: barFrame(card.from), to: barFrame(card.to) },
}))

/** Unwound, so easing towards a heading never goes the long way round. */
const turn = (from: number, to: number) => {
  let d = to - from
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return d
}

async function score(): Promise<string> {
  const buffer = await renderScore(SCORE.cues, SCORE.bars)
  const bytes = wav(
    [buffer.getChannelData(0), buffer.getChannelData(1)],
    buffer.sampleRate,
  )
  const url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(new Blob([bytes as BlobPart], { type: 'audio/wav' }))
  })
  return url.slice(url.indexOf(',') + 1)
}

/**
 * Runs the trailer: shot after shot, each one set up, given a moment to get
 * going, and then rolled for exactly its length in bars.
 *
 * It renders last, at a priority of its own, so the camera it sets is set
 * after everything on the island has moved for the frame — a tracking shot
 * aimed at where he was a frame ago judders.
 */
export function Director() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  const run = useRef({
    phase: 'warmup' as Phase,
    shot: -1,
    lead: 0,
    local: 0,
    warm: 0,
    /** The next shot is due: set up at the top of the next frame. */
    due: false,
    memo: {} as Memo,
  })
  const subject = useRef<Subject>({
    x: PLAYER_POS.x,
    y: PLAYER_POS.y,
    z: PLAYER_POS.z,
    facing: PLAYER_VIEW.facing,
  })
  const fonts = useRef(false)
  const tally = useRef<Tally>({
    phase: 'warmup',
    take: false,
    frame: 0,
    total: TOTAL,
    shot: '',
    shots: SHOTS.map((s, i) => ({ id: s.id, ...SLOTS[i] })),
    score,
  })

  useEffect(() => {
    // The island makes its own noises as it is played, and they are not the
    // trailer's: its music is the score, rendered on its own.
    setMuted(true)
    useGame.setState({ quality: 'high', musicOn: false })
    useGame.getState().start()
    document.body.dataset.trailer = 'clean'
    void document.fonts.ready.then(() => (fonts.current = true))
    window.__trailer = tally.current
    return () => {
      RIG.camera = false
      release()
      delete document.body.dataset.trailer
      delete window.__trailer
    }
  }, [])

  const aim = (pose: Pose) => {
    const [x, y, z] = pose.position
    const [tx, ty, tz] = pose.target
    camera.position.set(x, y, z)
    camera.lookAt(tx, ty, tz)
    // Close in on him and the near plane has to come in too, or his face is
    // cut away; far out, it stays back where the depth is wanted.
    const near = Math.min(
      2,
      Math.max(0.2, Math.hypot(tx - x, ty - y, tz - z) * 0.08),
    )
    if (camera.fov !== pose.fov || camera.near !== near) {
      camera.fov = pose.fov
      camera.near = near
      camera.far = 2200
      camera.updateProjectionMatrix()
    }
  }

  const stage = (frame: number, covered: boolean) => {
    for (const card of CARD_SLOTS) {
      const el = STAGE.cards.get(card.id)
      if (!el) continue
      const p = presence(frame, card.slot, RISE, FALL)
      el.style.opacity = String(p)
      el.style.setProperty('--p', String(p))
    }
    if (STAGE.slate) {
      const up = 1 - frame / FADE_UP
      const down = (frame - (TOTAL - FADE_DOWN)) / FADE_DOWN
      const black = covered ? 1 : Math.max(0, Math.min(1, Math.max(up, down)))
      STAGE.slate.style.opacity = String(black)
    }
  }

  const begin = (index: number) => {
    const r = run.current
    const shot = SHOTS[index]
    reset()
    light({ night: shot.night ?? false, party: shot.party ?? false })
    r.shot = index
    r.phase = 'lead'
    r.lead = 0
    r.local = 0
    r.memo = {}
    shot.setup?.()
    RIG.camera = Boolean(shot.camera)
    document.body.dataset.trailer = shot.ui ?? 'clean'
    tally.current.shot = shot.id
  }

  useFrame((state, delta) => {
    const r = run.current
    const t = tally.current
    // On the recorder's clock every frame is exactly a sixtieth; in a
    // browser left to play it, the frames are as long as they took.
    const recording = window.__clock !== undefined
    const dt = recording ? 1 / FPS : Math.min(delta, 0.1)
    t.take = false

    if (r.due) {
      r.due = false
      begin(r.shot + 1)
    }

    // Where he is — or the bike, or the boat — a little behind: a lens
    // bolted to him jolts with every hop and every turn, and one that trails
    // him by a breath does not.
    const s = subject.current
    const at = SHOTS[r.shot]?.subject?.() ?? {
      x: PLAYER_POS.x,
      y: PLAYER_POS.y,
      z: PLAYER_POS.z,
      facing: PLAYER_VIEW.facing,
    }
    const moved = Math.hypot(at.x - s.x, at.z - s.z)
    if (moved > 6 || r.phase === 'warmup') {
      Object.assign(s, at)
    } else {
      const k = 1 - Math.exp(-dt * 10)
      s.x += (at.x - s.x) * k
      s.z += (at.z - s.z) * k
      s.y += (at.y - s.y) * (1 - Math.exp(-dt * 2.5))
      s.facing += turn(s.facing, at.facing) * (1 - Math.exp(-dt * 4))
    }

    if (r.phase === 'warmup') {
      r.warm += dt
      stage(0, true)
      if (r.warm >= WARMUP && fonts.current) begin(0)
    } else if (r.phase === 'lead') {
      const shot = SHOTS[r.shot]
      const lead = shot.lead ?? LEAD
      r.lead += dt
      shot.act?.(r.lead - lead, r.memo)
      if (shot.camera) aim(shot.camera(0, s))
      stage(SLOTS[r.shot].from, !recording)
      if (r.lead >= lead) r.phase = 'roll'
    } else if (r.phase === 'roll') {
      const shot = SHOTS[r.shot]
      const slot = SLOTS[r.shot]
      const frames = slot.to - slot.from
      const f = Math.min(frames - 1, Math.floor(r.local))
      shot.act?.(f / FPS, r.memo)
      if (shot.camera) aim(shot.camera(f / frames, s))
      stage(slot.from + f, false)
      t.take = true
      t.frame = slot.from + f
      r.local += recording ? 1 : dt * FPS
      if (r.local >= frames) {
        if (r.shot + 1 < SHOTS.length) r.due = true
        else {
          r.phase = 'done'
          RIG.camera = false
          release()
        }
      }
    }
    t.phase = r.phase

    state.gl.render(state.scene, state.camera)
  }, 1)

  return null
}
