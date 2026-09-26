import { useEffect } from 'react'
import { useGame } from '../state/store'
import * as sfx from '../engine/audio'
import { useT } from '../i18n/useT'
import { useScreen } from './useScreen'

const LABEL = {
  journal: 'Journal updated',
  key: 'Key obtained',
  mission: 'New mission',
  quality: 'Quality changed',
  progress: 'Progress cleared',
} as const

export function Toast() {
  const t = useT()
  const toast = t(useGame((s) => s.toast))
  const dismiss = useGame((s) => s.dismissToast)
  const { mobile } = useScreen()

  useEffect(() => {
    if (!toast) return
    // Good news jingles. A key has its own sound, and the rest — a quality
    // step-down, a cleared save — are notices, not occasions.
    if (toast.kind === 'journal' || toast.kind === 'mission') sfx.jingle()
    const id = window.setTimeout(dismiss, 4200)
    return () => window.clearTimeout(id)
  }, [toast, dismiss])

  /*
   * A phone has no corner to spare for it: the card would sit over the
   * stick's buttons, or over most of a screen held on its side. The jingle
   * and the timer above still run, so the news is still heard, and nothing
   * is left waiting to pop up if the screen turns into a bigger one.
   */
  if (!toast || mobile) return null

  return (
    <div className={`toast toast--${toast.kind}`} role="status">
      <span className="toast__label">{t(LABEL[toast.kind])}</span>
      <strong>{toast.title}</strong>
      <p>{toast.body}</p>
    </div>
  )
}
