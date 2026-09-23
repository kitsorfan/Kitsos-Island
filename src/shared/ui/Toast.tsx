import { useEffect } from 'react'
import { useGame } from '../state/store'
import * as sfx from '../engine/audio'
import { useT } from '../i18n/useT'

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

  useEffect(() => {
    if (!toast) return
    // Good news jingles. A key has its own sound, and the rest — a quality
    // step-down, a cleared save — are notices, not occasions.
    if (toast.kind === 'journal' || toast.kind === 'mission') sfx.jingle()
    const id = window.setTimeout(dismiss, 4200)
    return () => window.clearTimeout(id)
  }, [toast, dismiss])

  if (!toast) return null

  return (
    <div className={`toast toast--${toast.kind}`} role="status">
      <span className="toast__label">{t(LABEL[toast.kind])}</span>
      <strong>{toast.title}</strong>
      <p>{toast.body}</p>
    </div>
  )
}
