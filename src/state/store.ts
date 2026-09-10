import { create } from 'zustand'
import { INTERIORS, INTERIOR_BY_ID } from '../data/interiors'
import {
  BUILDING_BY_ID,
  KEYS,
  KEY_BY_ID,
  MISSIONS,
  MISSION_BY_ID,
  NPCS,
  PLAYER_START,
} from '../data/world'
import { FULL_CV_SECTIONS, PROFILE, RADIO_SECTIONS } from '../data/profile'
import type { AreaId, Carried, ExhibitKind, PanelSection, Vec2 } from '../types'
import * as sfx from '../game/audio'
import { callAmalia, startParty, stopParty } from '../game/party'
import {
  ARENA_CENTER,
  MAG_SIZE,
  MAX_FRIENDS,
  RELOAD_MS,
  START_LIVES,
  buildTeams,
  closeArena,
  combatantName,
  openArena,
  pickTeams,
} from '../game/paintball'
import type { Side, Team } from '../game/paintball'
import { MOTO, MOTO_START, closeRide, openRide } from '../game/moto'
import {
  BOAT_START,
  RESCUE,
  SOULS,
  closeWater,
  openWater,
} from '../game/rescue'
import { COUNT, HEAD_START, HIDE, closeHide, openHide } from '../game/hide'
import type { Role } from '../game/hide'
import {
  BALLOON,
  BALLOON_START,
  CALL_TOTAL,
  closeFlight,
  landingSpot,
  openFlight,
} from '../game/balloon'

export type Mode =
  | 'title'
  | 'explore'
  | 'dialogue'
  | 'panel'
  | 'journal'
  | 'map'
  /** The skip-ahead card, always reachable from the HUD. */
  | 'greeting'
  /** The paintball briefing, or the card at the end of a match. */
  | 'paintball'
  /** The games board's list of minigames. */
  | 'arcade'
  /** The motocross briefing, or the card at the end of a run. */
  | 'moto'
  /** The balloon briefing, or the card at the end of a flight. */
  | 'balloon'
  /** The hide-and-seek briefing, or the card at the end of a game. */
  | 'hide'
  /** The sea-rescue briefing, or the card at the end of a run. */
  | 'rescue'

export type MissionState = 'idle' | 'active' | 'done'

export interface DialogueState {
  speaker: string
  role?: string
  lines: string[]
  page: number
}

export interface PanelPayload {
  kicker: string
  title: string
  sections: PanelSection[]
  accent: string
  kind: ExhibitKind
}

export type PaintballStatus = 'briefing' | 'playing' | 'won' | 'lost'

export interface PaintballGame {
  /** The two islanders on your side, by NPC id. */
  friends: string[]
  enemies: string[]
  /** Everyone painted so far, friend or foe. */
  out: Record<string, true>
  lives: number
  ammo: number
  /** Timestamp the hopper refills at, or null while it still has rounds. */
  reloadAt: number | null
  status: PaintballStatus
  /** Enemies you painted yourself, and friends you caught by mistake. */
  hits: number
  friendlyFire: number
  /** Last thing that happened, for the line under the HUD. */
  feed: { text: string; kind: 'good' | 'bad'; at: number } | null
  /** Bumped each match so the HUD can restart its animations. */
  round: number
}

export interface MotoRun {
  status: 'briefing' | 'riding' | 'done'
  /** Where you came of the four, and the race and best-lap times with it. */
  place: number
  seconds: number
  best: number
  round: number
}

export interface BalloonFlight {
  status: 'briefing' | 'flying' | 'done'
  /**
   * How it went, read off the flight when it ends. Everything up to that
   * point lives in the flight itself and the HUD polls it, so a parcel
   * leaving the basket never touches React.
   */
  served: number
  wrong: number
  dropped: number
  seconds: number
  round: number
}

export interface RescueRun {
  status: 'briefing' | 'sailing' | 'done'
  /** How many came out of the water, and how long it took. */
  saved: number
  seconds: number
  /** Everyone aboard, rather than a flare that went out. */
  won: boolean
  round: number
}

export interface HideGame {
  status: 'briefing' | 'playing' | 'done'
  /** Which way round it is being played. */
  role: Role
  /** How it went, read off the game when it ends. */
  found: number
  seconds: number
  won: boolean
  round: number
}

export interface Nearby {
  id: string
  kind: 'npc' | 'door' | 'sign' | 'exhibit' | 'key' | 'exit' | 'board'
  label: string
  verb: string
  /** Set when the target cannot be used yet. */
  blocked?: boolean
}

export interface JournalEntry {
  id: string
  title: string
  body: string
  source: string
}

/** Where the player should be placed after an area change. */
export interface Spawn {
  area: AreaId
  position: Vec2
  token: number
}

interface GameState {
  mode: Mode
  area: AreaId
  dialogue: DialogueState | null
  panel: PanelPayload | null
  nearby: Nearby | null
  spawn: Spawn

  visited: Record<string, true>
  entries: JournalEntry[]
  toast: {
    title: string
    body: string
    kind: 'journal' | 'key' | 'mission'
  } | null

  keys: Record<string, true>
  missions: Record<string, MissionState>
  discovered: Record<string, true>
  /** Things found that are not keys: a shelf that swings, and whatever next. */
  secrets: Record<string, true>
  lighthouseOpen: boolean
  cvUnlocked: boolean
  greetingReturn: Mode

  paintball: PaintballGame | null
  moto: MotoRun | null
  balloon: BalloonFlight | null
  hide: HideGame | null
  rescue: RescueRun | null

  muted: boolean
  musicOn: boolean
  /** Lights out: the island after dark. */
  night: boolean
  /** What he carries after dark. */
  handLight: Carried
  /** The square, dancing. Only after dark. */
  party: boolean
  /** True once he has walked into the middle and she has been called down. */
  amaliaHere: boolean
  /** What he is wearing. The tuxedo is for her arrival and nothing else. */
  outfit: 'islander' | 'tuxedo'
  hasMoved: boolean

  start: () => void
  setNearby: (n: Nearby | null) => void
  talk: (d: Omit<DialogueState, 'page'>) => void
  advance: () => void
  closeDialogue: () => void
  openPanel: (p: PanelPayload) => void
  closePanel: () => void
  openJournal: () => void
  closeJournal: () => void
  openMap: () => void
  closeMap: () => void
  openGreeting: () => void
  closeGreeting: () => void
  unlockCv: () => void
  openContact: () => void
  record: (entry: JournalEntry) => void
  dismissToast: () => void
  toggleMute: () => void
  toggleMusic: () => void
  toggleNight: () => void
  toggleHandLight: () => void
  toggleParty: () => void
  callAmalia: () => void
  markMoved: () => void

  openArcade: () => void
  closeArcade: () => void
  openMoto: () => void
  beginMoto: () => void
  finishMoto: () => void
  exitMoto: () => void

  openBalloon: () => void
  beginBalloon: () => void
  finishBalloon: () => void
  exitBalloon: () => void

  openRescue: () => void
  beginRescue: () => void
  finishRescue: () => void
  exitRescue: () => void

  openHide: () => void
  setRole: (role: Role) => void
  beginHide: () => void
  finishHide: (won: boolean) => void
  exitHide: () => void

  openPaintball: () => void
  beginPaintball: () => void
  toggleAlly: (id: string) => void
  setEnemyCount: (count: number) => void
  redrawTeams: () => void
  exitPaintball: () => void
  fireRound: () => void
  finishReload: () => void
  splatCombatant: (id: string, team: Team, by: Side) => void
  hitPlayer: () => void

  enterBuilding: (id: string) => void
  leaveBuilding: () => void
  /** Stairs and doors between the rooms of one building. */
  goRoom: (to: string, arrive: Vec2) => void
  /** Lets a secret out, which is what opens the doors that need one. */
  /**
   * Lets a secret out, which is what opens the doors that need one. The line
   * is what the corner of the screen says about it.
   */
  revealSecret: (id: string, found?: { title: string; body: string }) => void
  travelTo: (buildingId: string) => void
  discover: (buildingId: string) => void
  activateMission: (id: string) => void
  takeKey: (keyId: string) => void
  unlockLighthouse: () => void
}

const JOURNAL_NPCS = NPCS.filter((n) => n.journal)
const JOURNAL_EXHIBITS = INTERIORS.flatMap((i) =>
  i.exhibits.filter((e) => e.journal),
)
/**
 * Stairs and doors file entries too, and leaving them out of the total is how
 * the counter ended up able to read 40 of 38.
 */
const JOURNAL_LINKS = INTERIORS.flatMap((i) =>
  (i.links ?? []).filter((l) => l.journal),
)

/**
 * Everything the journal can hold: people worth remembering, the exhibits,
 * and the ways through that are worth remembering having found.
 */
export const TOTAL_ENTRIES =
  JOURNAL_NPCS.length + JOURNAL_EXHIBITS.length + JOURNAL_LINKS.length
export const TOTAL_KEYS = KEYS.length

export const useGame = create<GameState>((set, get) => ({
  mode: 'title',
  area: 'island',
  dialogue: null,
  panel: null,
  nearby: null,
  spawn: { area: 'island', position: [...PLAYER_START] as Vec2, token: 0 },

  visited: {},
  entries: [],
  toast: null,

  keys: {},
  missions: Object.fromEntries(
    MISSIONS.map((m) => [m.id, 'idle' as MissionState]),
  ),
  discovered: {},
  secrets: {},
  lighthouseOpen: false,
  cvUnlocked: false,
  greetingReturn: 'explore',
  paintball: null,
  moto: null,
  balloon: null,
  hide: null,
  rescue: null,

  muted: false,
  musicOn: true,
  night: false,
  handLight: 'flashlight',
  party: false,
  amaliaHere: false,
  outfit: 'islander',
  hasMoved: false,

  start: () => set({ mode: 'explore' }),

  setNearby: (n) => {
    const current = get().nearby
    if (current?.id === n?.id && current?.blocked === n?.blocked) return
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

  openPanel: (panel) => set({ mode: 'panel', panel, dialogue: null }),
  closePanel: () => set({ mode: 'explore', panel: null }),

  openJournal: () => set({ mode: 'journal' }),
  closeJournal: () => set({ mode: 'explore' }),
  openMap: () => set({ mode: 'map' }),
  closeMap: () => set({ mode: 'explore' }),

  openGreeting: () =>
    set((s) => ({
      mode: 'greeting',
      greetingReturn: s.mode === 'title' ? 'title' : 'explore',
    })),

  closeGreeting: () => set((s) => ({ mode: s.greetingReturn })),

  /** Hands over the whole CV without the key hunt. */
  unlockCv: () => {
    set({ lighthouseOpen: true, cvUnlocked: true })
    get().openPanel({
      kicker: 'The full CV',
      title: `${PROFILE.firstName} "${PROFILE.nickname}" ${PROFILE.lastName}`,
      sections: FULL_CV_SECTIONS,
      accent: '#f0a33c',
      kind: 'cv',
    })
  },

  /** The Radio Center's message desk, without walking there. */
  openContact: () =>
    get().openPanel({
      kicker: 'Radio Center',
      title: 'Get in touch',
      sections: RADIO_SECTIONS,
      accent: '#b95fd0',
      kind: 'radio',
    }),

  record: (entry) => {
    if (get().visited[entry.id]) return
    set((s) => ({
      visited: { ...s.visited, [entry.id]: true },
      entries: [...s.entries, entry],
      toast: { title: entry.title, body: entry.body, kind: 'journal' },
    }))
  },

  dismissToast: () => set({ toast: null }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  toggleMusic: () => set((s) => ({ musicOn: !s.musicOn })),
  /**
   * Turning the lights back on ends the party, which needs the dark — and is
   * refused outright mid hide-and-seek, which needs the dark rather more.
   */
  toggleNight: () => {
    if (get().hide) return
    set((s) => {
      const night = !s.night
      if (!night && s.party) stopParty()
      if (night || !s.party) return { night }
      return { night, party: false, amaliaHere: false, outfit: 'islander' }
    })
  },

  toggleParty: () => {
    const { night, party, hide } = get()
    if (!night) return
    // A party walks every islander into the square to dance, which would
    // empty every hiding place on the island. Not during a game.
    if (hide) return
    if (party) {
      stopParty()
      sfx.cancel()
      set({ party: false, amaliaHere: false, outfit: 'islander' })
      return
    }
    startParty()
    sfx.jingle()
    set({ party: true, amaliaHere: false, outfit: 'islander' })
  },

  /**
   * He has walked into the middle of the floor. She comes down out of the
   * sky, and he is suddenly dressed for it.
   */
  callAmalia: () => {
    if (get().amaliaHere) return
    callAmalia()
    sfx.jingle()
    set({ amaliaHere: true, outfit: 'tuxedo' })
  },
  /** Flashlight, torch, then nothing at all — which the camp run needs. */
  toggleHandLight: () =>
    set((s) => ({
      handLight:
        s.handLight === 'flashlight'
          ? 'torch'
          : s.handLight === 'torch'
            ? 'none'
            : 'flashlight',
    })),
  markMoved: () => {
    if (!get().hasMoved) set({ hasMoved: true })
  },

  /* ----------------------------- arcade ----------------------------- */

  /**
   * The board in the plaza, and the P key, both land here. It reads at any
   * hour now — three of the four want daylight and one wants the dark, and
   * the card itself says which is which.
   */
  openArcade: () => {
    const state = get()
    if (state.area !== 'island') state.leaveBuilding()
    sfx.confirm()
    set({ mode: 'arcade', dialogue: null, panel: null, nearby: null })
  },

  closeArcade: () => {
    sfx.cancel()
    set({ mode: 'explore' })
  },

  /* ---------------------------- motocross --------------------------- */

  openMoto: () => {
    const state = get()
    if (state.night) return
    if (state.area !== 'island') state.leaveBuilding()
    sfx.confirm()
    // Puts all four bikes back on the grid, so the briefing shows the island
    // exactly as the race will start it.
    openRide()
    set((s) => ({
      mode: 'moto',
      dialogue: null,
      panel: null,
      nearby: null,
      moto: {
        status: 'briefing',
        place: 0,
        seconds: 0,
        best: 0,
        round: (s.moto?.round ?? 0) + 1,
      },
    }))
  },

  beginMoto: () => {
    const run = get().moto
    if (!run) return
    openRide()
    sfx.jingle()
    set((s) => ({
      mode: 'explore',
      area: 'island',
      nearby: null,
      moto: { ...run, status: 'riding', place: 0, seconds: 0, best: 0 },
      spawn: {
        area: 'island',
        position: [MOTO_START.x, MOTO_START.z] as Vec2,
        token: s.spawn.token + 1,
      },
    }))
  },

  /** The flag is out: park the bike and show the race's card. */
  finishMoto: () => {
    const run = get().moto
    if (!run || run.status !== 'riding') return
    sfx.jingle()
    set({
      mode: 'moto',
      moto: {
        ...run,
        status: 'done',
        place: MOTO.finish,
        seconds: MOTO.elapsed,
        best: MOTO.best,
      },
    })
  },

  /** Steps off the bike, wherever it ended up. */
  exitMoto: () => {
    const parked: Vec2 = [MOTO.x, MOTO.z]
    closeRide()
    sfx.cancel()
    set((s) => ({
      mode: 'explore',
      moto: null,
      nearby: null,
      spawn: { area: 'island', position: parked, token: s.spawn.token + 1 },
    }))
  },

  /* ----------------------------- balloon ---------------------------- */

  openBalloon: () => {
    const state = get()
    if (state.night) return
    if (state.area !== 'island') state.leaveBuilding()
    sfx.confirm()
    // Puts the balloon back over the plaza with every gathering still
    // waiting, so the briefing shows the island the flight will start on.
    openFlight()
    set((s) => ({
      mode: 'balloon',
      dialogue: null,
      panel: null,
      nearby: null,
      balloon: {
        status: 'briefing',
        served: 0,
        wrong: 0,
        dropped: 0,
        seconds: 0,
        round: (s.balloon?.round ?? 0) + 1,
      },
    }))
  },

  beginBalloon: () => {
    const flight = get().balloon
    if (!flight) return
    openFlight()
    sfx.jingle()
    set((s) => ({
      mode: 'explore',
      area: 'island',
      nearby: null,
      balloon: { ...flight, status: 'flying', served: 0, wrong: 0, dropped: 0 },
      // He is in the basket, not on the grass, but the token still draws the
      // curtain over the moment the camera jumps into the sky.
      spawn: {
        area: 'island',
        position: [BALLOON_START.x, BALLOON_START.z] as Vec2,
        token: s.spawn.token + 1,
      },
    }))
  },

  /** The last gathering has had its parcel: bring the card up. */
  finishBalloon: () => {
    const flight = get().balloon
    if (!flight || flight.status !== 'flying') return
    sfx.jingle()
    set({
      mode: 'balloon',
      balloon: {
        ...flight,
        status: 'done',
        served: Math.min(CALL_TOTAL, BALLOON.count),
        wrong: BALLOON.wrong,
        dropped: BALLOON.dropped,
        seconds: BALLOON.elapsed,
      },
    })
  },

  /** Sets him down on the grass under wherever the basket ended up. */
  exitBalloon: () => {
    const parked = landingSpot()
    closeFlight()
    sfx.cancel()
    set((s) => ({
      mode: 'explore',
      balloon: null,
      nearby: null,
      spawn: { area: 'island', position: parked, token: s.spawn.token + 1 },
    }))
  },

  /* --------------------------- the sea rescue ------------------------ */

  /**
   * The lifeboat. She is tied up off the end of the dock, so opening the
   * briefing puts the boat and the sea back the way the run will start them.
   */
  openRescue: () => {
    const state = get()
    if (state.night) return
    if (state.area !== 'island') state.leaveBuilding()
    sfx.confirm()
    openWater()
    set((s) => ({
      mode: 'rescue',
      dialogue: null,
      panel: null,
      nearby: null,
      rescue: {
        status: 'briefing',
        saved: 0,
        seconds: 0,
        won: false,
        round: (s.rescue?.round ?? 0) + 1,
      },
    }))
  },

  beginRescue: () => {
    const run = get().rescue
    if (!run) return
    openWater()
    sfx.jingle()
    set((s) => ({
      mode: 'explore',
      area: 'island',
      nearby: null,
      rescue: { ...run, status: 'sailing', saved: 0, seconds: 0, won: false },
      // He is aboard rather than on the sand, but the token still draws the
      // curtain over the moment the camera goes out to sea.
      spawn: {
        area: 'island',
        position: [BOAT_START.x, BOAT_START.z] as Vec2,
        token: s.spawn.token + 1,
      },
    }))
  },

  /** Everyone out of the water, or a flare that went out. */
  finishRescue: () => {
    const run = get().rescue
    if (!run || run.status !== 'sailing') return
    if (RESCUE.won) sfx.jingle()
    else sfx.hurt()
    set({
      mode: 'rescue',
      rescue: {
        ...run,
        status: 'done',
        saved: Math.min(SOULS, RESCUE.saved),
        seconds: RESCUE.elapsed,
        won: RESCUE.won,
      },
    })
  },

  /** Ties her up again and puts him back on the dock. */
  exitRescue: () => {
    closeWater()
    sfx.cancel()
    set((s) => ({
      mode: 'explore',
      rescue: null,
      nearby: null,
      spawn: {
        area: 'island',
        position: [-100, 22] as Vec2,
        token: s.spawn.token + 1,
      },
    }))
  },

  /* ------------------------- hide and seek -------------------------- */

  /**
   * The night game. Either they hide and you go looking, or you hide and
   * every one of them does — and either way the island's lights go out for
   * the duration, so a torch is the only thing burning on it.
   */
  openHide: () => {
    const state = get()
    if (!state.night) return
    if (state.area !== 'island') state.leaveBuilding()
    // Nobody can hide while they are all dancing in the middle of the plaza.
    if (state.party) state.toggleParty()
    sfx.confirm()
    const role = state.hide?.role ?? 'seeker'
    openHide(role)
    set((s) => ({
      mode: 'hide',
      dialogue: null,
      panel: null,
      nearby: null,
      hide: {
        status: 'briefing',
        role,
        found: 0,
        seconds: 0,
        won: false,
        round: (s.hide?.round ?? 0) + 1,
      },
    }))
  },

  /** Swapping ends, on the briefing card. */
  setRole: (role) => {
    const game = get().hide
    if (!game || game.status !== 'briefing' || game.role === role) return
    sfx.blip()
    openHide(role)
    set({ hide: { ...game, role } })
  },

  beginHide: () => {
    const game = get().hide
    if (!game) return
    openHide(game.role)
    sfx.jingle()
    set((s) => ({
      mode: 'explore',
      area: 'island',
      nearby: null,
      hide: { ...game, status: 'playing', found: 0, won: false },
      spawn: {
        area: 'island',
        position: [0, 22] as Vec2,
        token: s.spawn.token + 1,
      },
    }))
  },

  finishHide: (won) => {
    const game = get().hide
    if (!game || game.status !== 'playing') return
    if (won) sfx.jingle()
    else sfx.hurt()
    set({
      mode: 'hide',
      hide: {
        ...game,
        status: 'done',
        won,
        found: Math.min(COUNT, HIDE.found),
        seconds:
          game.role === 'hider'
            ? Math.max(0, HIDE.elapsed - HEAD_START)
            : HIDE.elapsed,
      },
    })
  },

  exitHide: () => {
    closeHide()
    sfx.cancel()
    set((s) => ({
      mode: 'explore',
      hide: null,
      nearby: null,
      spawn: {
        area: 'island',
        position: [0, 22] as Vec2,
        token: s.spawn.token + 1,
      },
    }))
  },

  /* ---------------------------- paintball --------------------------- */

  /** Draws the teams and shows the briefing. Always fought on the island. */
  openPaintball: () => {
    const state = get()
    if (state.night) return
    if (state.area !== 'island') state.leaveBuilding()
    sfx.confirm()
    set((s) => ({
      mode: 'paintball',
      dialogue: null,
      panel: null,
      nearby: null,
      paintball: {
        ...pickTeams(),
        out: {},
        lives: START_LIVES,
        ammo: MAG_SIZE,
        reloadAt: null,
        status: 'briefing',
        hits: 0,
        friendlyFire: 0,
        feed: null,
        round: (s.paintball?.round ?? 0) + 1,
      },
    }))
  },

  /**
   * The three ways the briefing lets you change the sides before the whistle:
   * put somebody on your side or take them off it, set how many are against
   * you, or throw the whole thing back in the hat.
   */
  toggleAlly: (id) => {
    const game = get().paintball
    if (!game || game.status !== 'briefing') return
    const on = game.friends.includes(id)
    const wanted = on
      ? game.friends.filter((f) => f !== id)
      : [...game.friends, id]
    // Silently refuses a sixth: the card greys the rest out to say so.
    if (!on && wanted.length > MAX_FRIENDS) {
      sfx.cancel()
      return
    }
    sfx.blip()
    set({ paintball: { ...game, ...buildTeams(wanted, game.enemies.length) } })
  },

  setEnemyCount: (count) => {
    const game = get().paintball
    if (!game || game.status !== 'briefing') return
    if (count === game.enemies.length) return
    set({ paintball: { ...game, ...buildTeams(game.friends, count) } })
  },

  redrawTeams: () => {
    const game = get().paintball
    if (!game || game.status !== 'briefing') return
    sfx.confirm()
    set({ paintball: { ...game, ...pickTeams() } })
  },

  beginPaintball: () => {
    const game = get().paintball
    if (!game) return
    openArena(game.friends, game.enemies)
    sfx.jingle()
    set((s) => ({
      mode: 'explore',
      area: 'island',
      nearby: null,
      paintball: {
        ...game,
        out: {},
        lives: START_LIVES,
        ammo: MAG_SIZE,
        reloadAt: null,
        status: 'playing',
        hits: 0,
        friendlyFire: 0,
        feed: null,
      },
      spawn: {
        area: 'island',
        position: [ARENA_CENTER.x, ARENA_CENTER.z] as Vec2,
        token: s.spawn.token + 1,
      },
    }))
  },

  exitPaintball: () => {
    closeArena()
    sfx.cancel()
    set({ mode: 'explore', paintball: null, nearby: null })
  },

  /** Spends one round; emptying the hopper starts the six-second refill. */
  fireRound: () => {
    const game = get().paintball
    if (!game || game.ammo <= 0 || game.reloadAt) return
    const ammo = game.ammo - 1
    set({
      paintball: {
        ...game,
        ammo,
        reloadAt: ammo === 0 ? Date.now() + RELOAD_MS : game.reloadAt,
      },
    })
  },

  finishReload: () => {
    const game = get().paintball
    if (!game || !game.reloadAt) return
    set({ paintball: { ...game, ammo: MAG_SIZE, reloadAt: null } })
  },

  splatCombatant: (id, team, by) => {
    const game = get().paintball
    if (!game || game.status !== 'playing' || game.out[id]) return
    const name = combatantName(id)
    const out = { ...game.out, [id]: true as const }
    const mine = by === 'player'
    const friendly = team === 'friend'
    const won = game.enemies.every((e) => out[e])

    set({
      mode: won ? 'paintball' : 'explore',
      paintball: {
        ...game,
        out,
        status: won ? 'won' : 'playing',
        hits: game.hits + (mine && !friendly ? 1 : 0),
        friendlyFire: game.friendlyFire + (mine && friendly ? 1 : 0),
        feed: {
          text: friendly
            ? `${name} was on your side!`
            : mine
              ? `You painted ${name}`
              : `${name} is out`,
          kind: friendly ? 'bad' : 'good',
          at: Date.now(),
        },
      },
    })
  },

  hitPlayer: () => {
    const game = get().paintball
    if (!game || game.status !== 'playing') return
    const lives = Math.max(0, game.lives - 1)
    const lost = lives === 0

    set({
      mode: lost ? 'paintball' : 'explore',
      paintball: {
        ...game,
        lives,
        status: lost ? 'lost' : 'playing',
        feed: {
          text: lost
            ? 'Painted out.'
            : `Hit! ${lives} ${lives === 1 ? 'life' : 'lives'} left`,
          kind: 'bad',
          at: Date.now(),
        },
      },
    })
  },

  /* ------------------------------ areas ----------------------------- */

  enterBuilding: (id) => {
    // Every door on the island is locked while hide and seek is on. The game
    // is played out in the dark between the buildings, and a room nobody can
    // follow you into is not a hiding place.
    if (get().hide) return
    const interior = INTERIOR_BY_ID.get(id)
    if (!interior) return
    get().discover(id)
    set((s) => ({
      area: id,
      mode: 'explore',
      nearby: null,
      panel: null,
      dialogue: null,
      spawn: {
        area: id,
        position: [...interior.spawn] as Vec2,
        token: s.spawn.token + 1,
      },
    }))
  },

  leaveBuilding: () => {
    const { area } = get()
    // A room two floors down still belongs to a door on the island, and this
    // is what puts the player back on the right doorstep rather than nowhere.
    const interior = INTERIOR_BY_ID.get(area)
    const building = BUILDING_BY_ID.get(interior?.building ?? area)
    if (!building) return
    set((s) => ({
      area: 'island',
      mode: 'explore',
      nearby: null,
      panel: null,
      dialogue: null,
      spawn: {
        area: 'island',
        position: [...building.door] as Vec2,
        token: s.spawn.token + 1,
      },
    }))
  },

  /**
   * Through a door or down the stairs inside one building. Not the same as
   * entering from outside: nothing is discovered, and the way out still knows
   * which doorstep it belongs to.
   */
  goRoom: (to, arrive) => {
    if (get().hide) return
    if (!INTERIOR_BY_ID.has(to)) return
    set((s) => ({
      area: to,
      mode: 'explore',
      nearby: null,
      panel: null,
      dialogue: null,
      spawn: {
        area: to,
        position: [...arrive] as Vec2,
        token: s.spawn.token + 1,
      },
    }))
  },

  revealSecret: (id, found) => {
    if (get().secrets[id]) return
    sfx.jingle()
    set((s) => ({
      secrets: { ...s.secrets, [id]: true },
      toast: found ? { ...found, kind: 'key' as const } : s.toast,
    }))
  },

  travelTo: (buildingId) => {
    const building = BUILDING_BY_ID.get(buildingId)
    if (!building) return
    sfx.confirm()
    set((s) => ({
      area: 'island',
      mode: 'explore',
      nearby: null,
      spawn: {
        area: 'island',
        position: [...building.door] as Vec2,
        token: s.spawn.token + 1,
      },
    }))
  },

  discover: (buildingId) => {
    if (get().discovered[buildingId]) return
    set((s) => ({ discovered: { ...s.discovered, [buildingId]: true } }))
  },

  /* ---------------------------- missions ---------------------------- */

  activateMission: (id) => {
    const mission = MISSION_BY_ID.get(id)
    if (!mission || get().missions[id] !== 'idle') return
    set((s) => ({
      missions: { ...s.missions, [id]: 'active' },
      toast: { title: mission.title, body: mission.hint, kind: 'mission' },
    }))
  },

  takeKey: (keyId) => {
    const key = KEY_BY_ID.get(keyId)
    if (!key || get().keys[keyId]) return
    const mission = MISSIONS.find((m) => m.keyId === keyId)
    set((s) => ({
      keys: { ...s.keys, [keyId]: true },
      missions: mission ? { ...s.missions, [mission.id]: 'done' } : s.missions,
      toast: {
        title: key.name,
        body: mission
          ? `${mission.done} ${Object.keys(s.keys).length + 1} of ${TOTAL_KEYS} keys.`
          : 'Key taken.',
        kind: 'key',
      },
    }))
  },

  unlockLighthouse: () => {
    if (get().lighthouseOpen) return
    set({ lighthouseOpen: true })
  },
}))

/** True while the 3D world should accept movement input. */
export const isInteractive = (mode: Mode) => mode === 'explore'

export const keyCount = (keys: Record<string, true>) => Object.keys(keys).length

export interface Objective {
  buildingId: string
  title: string
  detail: string
}

/** What the map and the HUD should point at next. */
export function nextObjective(state: {
  missions: Record<string, MissionState>
  keys: Record<string, true>
  lighthouseOpen: boolean
}): Objective | null {
  const pending = MISSIONS.find((m) => state.missions[m.id] !== 'done')
  if (pending) {
    const active = state.missions[pending.id] === 'active'
    return {
      buildingId: pending.buildingId,
      title: pending.title,
      detail: active ? pending.hint : pending.brief,
    }
  }
  if (!state.lighthouseOpen) {
    return {
      buildingId: 'lighthouse',
      title: 'Five of five',
      detail: 'Every key is in hand. The Old Lighthouse will open now.',
    }
  }
  return null
}
