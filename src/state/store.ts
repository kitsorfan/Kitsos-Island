import { create } from 'zustand'
import { BUILDINGS, NPCS } from '../data/world'

export type Mode = 'title' | 'explore' | 'dialogue' | 'panel' | 'journal'

export interface DialogueState {
  speaker: string
  role?: string
  lines: string[]
  page: number
  accent?: string
}

export interface Nearby {
  id: string
  kind: 'npc' | 'building' | 'sign'
  label: string
  verb: string
}

export interface JournalEntry {
  id: string
  title: string
  body: string
  source: string
}

interface GameState {
  mode: Mode
  dialogue: DialogueState | null
  panelId: string | null
  nearby: Nearby | null
  visited: Record<string, true>
  entries: JournalEntry[]
  toast: JournalEntry | null
  muted: boolean
  hasMoved: boolean

  start: () => void
  setNearby: (n: Nearby | null) => void
  talk: (d: Omit<DialogueState, 'page'>) => void
  advance: () => void
  closeDialogue: () => void
  openPanel: (id: string) => void
  closePanel: () => void
  openJournal: () => void
  closeJournal: () => void
  record: (entry: JournalEntry) => void
  dismissToast: () => void
  toggleMute: () => void
  markMoved: () => void
}

/** Total collectables: every NPC plus every building. */
export const TOTAL_ENTRIES = NPCS.length + BUILDINGS.length

export const useGame = create<GameState>((set, get) => ({
  mode: 'title',
  dialogue: null,
  panelId: null,
  nearby: null,
  visited: {},
  entries: [],
  toast: null,
  muted: false,
  hasMoved: false,

  start: () => set({ mode: 'explore' }),

  setNearby: (n) => {
    const current = get().nearby
    if (current?.id === n?.id) return
    set({ nearby: n })
  },

  talk: (d) => set({ mode: 'dialogue', dialogue: { ...d, page: 0 } }),

  advance: () => {
    const { dialogue } = get()
    if (!dialogue) return
    if (dialogue.page < dialogue.lines.length - 1) {
      set({ dialogue: { ...dialogue, page: dialogue.page + 1 } })
    } else {
      set({ mode: 'explore', dialogue: null })
    }
  },

  closeDialogue: () => set({ mode: 'explore', dialogue: null }),

  openPanel: (id) => set({ mode: 'panel', panelId: id, dialogue: null }),
  closePanel: () => set({ mode: 'explore', panelId: null }),

  openJournal: () => set({ mode: 'journal' }),
  closeJournal: () => set({ mode: 'explore' }),

  record: (entry) => {
    if (get().visited[entry.id]) return
    set((s) => ({
      visited: { ...s.visited, [entry.id]: true },
      entries: [...s.entries, entry],
      toast: entry,
    }))
  },

  dismissToast: () => set({ toast: null }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  markMoved: () => {
    if (!get().hasMoved) set({ hasMoved: true })
  },
}))

/** True while the 3D world should accept movement input. */
export const isInteractive = (mode: Mode) => mode === 'explore'
