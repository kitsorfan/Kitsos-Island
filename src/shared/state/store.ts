import { create } from 'zustand'
import { INTERIORS, INTERIOR_BY_ID } from '../../features/interior/interiors'
import {
  BUILDING_BY_ID,
  KEYS,
  KEY_BY_ID,
  MISSIONS,
  MISSION_BY_ID,
  NPCS,
  PLAYER_START,
} from '../../features/island/world'
import {
  FULL_CV_SECTIONS,
  PROFILE,
  RADIO_SECTIONS,
} from '../../features/cv/profile'
import type {
  AreaId,
  Carried,
  ExhibitKind,
  LiftStop,
  PanelSection,
  Quality,
  Vec2,
} from '../../types'
import * as sfx from '../engine/audio'
import { LEVELS, setSfxLevel as applySfxLevel } from '../engine/audio'
import { BIRTHDAY, clampDate, isFeast } from '../../features/calendar/calendar'
import {
  LIFT_DOORS,
  LIFT_PER_FLOOR,
  liftStance,
} from '../../features/lift/lift'
import type { CalendarDate } from '../../features/calendar/calendar'
import type { Locale } from '../i18n'
import { forgetProgress, isEmpty, loadProgress, saveProgress } from './save'
import type { SavedProgress } from './save'
import { setMusicLevel as applyMusicLevel } from '../../features/radio/music'
import {
  callAmalia,
  startParty,
  stopParty,
} from '../../features/party/partyLogic'
import {
  begin as beginProposal,
  end as endProposal,
  settle as settleProposal,
  beachAt,
} from '../../features/proposal/propose'
import type { Phase as ProposalPhase } from '../../features/proposal/propose'
import { AMALIA } from '../../features/party/partyData'
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
} from '../../features/paintball/paintballLogic'
import type { Side, Team } from '../../features/paintball/paintballLogic'
import {
  LAPS,
  MOTO,
  MOTO_START,
  closeRide,
  openRide,
} from '../../features/moto/motoLogic'
import type { Difficulty } from '../../features/moto/motoLogic'
import {
  BOAT_START,
  RESCUE,
  SOULS,
  closeWater,
  openWater,
} from '../../features/rescue/rescue'
import {
  COUNT,
  HEAD_START,
  HIDE,
  closeHide,
  openHide,
} from '../../features/hide/hideLogic'
import type { Role } from '../../features/hide/hideLogic'
import {
  BALLOON,
  BALLOON_START,
  CALL_TOTAL,
  closeFlight,
  landingSpot,
  openFlight,
} from '../../features/balloon/balloonLogic'

/**
 * The settings worth remembering between visits. Someone who had to turn
 * the island down to make it playable, or the music down to take a call,
 * should not have to find the control again every time they open the page.
 *
 * Private windows and blocked site data throw rather than return null, and
 * neither is a reason not to draw the island — so every access is guarded
 * and simply falls back to the default.
 */
const KEY = 'island.settings'

interface Settings {
  quality: Quality
  musicLevel: number
  sfxLevel: number
  locale: Locale
  /** What the calendar on the basement wall is turned to. */
  calendar: CalendarDate
}

const DEFAULTS: Settings = {
  quality: 'auto',
  musicLevel: LEVELS,
  sfxLevel: LEVELS,
  // English first for everyone. The island is a CV before it is a game, and
  // its audience is not only in Greece — so Greek is a choice, never a guess
  // made from the browser’s language.
  locale: 'en',
  calendar: { ...BIRTHDAY },
}

function clampLevel(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.max(0, Math.min(LEVELS, Math.round(value)))
}

function storedSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULTS
    const saved = JSON.parse(raw) as Partial<Settings>
    return {
      quality:
        saved.quality === 'high' ||
        saved.quality === 'low' ||
        saved.quality === 'auto'
          ? saved.quality
          : DEFAULTS.quality,
      musicLevel: clampLevel(saved.musicLevel, DEFAULTS.musicLevel),
      sfxLevel: clampLevel(saved.sfxLevel, DEFAULTS.sfxLevel),
      locale: saved.locale === 'el' ? 'el' : DEFAULTS.locale,
      calendar: clampDate(saved.calendar),
    }
  } catch {
    return DEFAULTS
  }
}

function remember(settings: Settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings))
  } catch {
    // Not being able to remember the choice is no reason to refuse it.
  }
}

const SAVED = storedSettings()

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
  /** The calendar off the basement wall, and the day it is turned to. */
  | 'calendar'
  /** Inside the lift car with the doors shut, between floors. */
  | 'lift'
  /**
   * Strapped into the ship inside the lighthouse, with the count running.
   * Held for the whole of the launch, and released only into 'orbit'.
   */
  | 'launch'
  /**
   * In orbit, the island behind him. The one mode there is no way out of:
   * the certificate is signed here, and the walk does not come back.
   */
  | 'orbit'

export type MissionState = 'idle' | 'active' | 'done'

/**
 * One answer on offer at the end of a dialogue: what it says, what the
 * speaker says back, and what a right one lets out.
 */
export interface DialogueChoice {
  text: string
  lines: string[]
  /** Secret revealed by picking this, with the toast that announces it. */
  reveals?: { id: string; title: string; body: string }
  journal?: JournalEntry
}

export interface DialogueState {
  speaker: string
  role?: string
  lines: string[]
  page: number
  /** Shown on the last page instead of Close; picking one carries on. */
  choices?: DialogueChoice[]
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

/** How long the next race is and how hard, kept between races. */
export interface MotoSetup {
  laps: number
  difficulty: Difficulty
}

export interface MotoRun {
  status: 'briefing' | 'riding' | 'done'
  /** The setup it was actually run with, for the card at the end. */
  laps: number
  difficulty: Difficulty
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
  kind: 'npc' | 'door' | 'sign' | 'exhibit' | 'key' | 'exit' | 'board' | 'toy'
  label: string
  verb: string
  /** Set when the target cannot be used yet. */
  blocked?: boolean
  /**
   * Set when there is no key to press: the thing opens by itself as you
   * reach it. The label still shows, so you know what you are walking into,
   * but offering a keycap for a door already sliding would be a lie.
   */
  silent?: boolean
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
  /** Which way he faces on arrival; into the room, if left off. */
  facing?: number
  token: number
}

/**
 * A short walk he takes on his own, with the controls out of his hands.
 *
 * A spawn is a teleport and draws a curtain over itself, which is right for
 * crossing a building and wrong for crossing a threshold: stepping into a
 * lift is two metres, and it has to be seen to be understood. The player
 * walks this off over a few frames and then it is cleared.
 */
export interface Stride {
  to: Vec2
  /** Which way he ends up facing. */
  facing?: number
}

/**
 * A lift ride in progress. The car is drawn from this: the doors shut, the
 * indicator counts from `from` to `to`, the doors open again, and only then
 * does the player step out onto the far floor.
 *
 * `started` is the clock the ride began on, in seconds; every phase is
 * measured from it so the car and the indicator never drift apart.
 */
/**
 * Standing in the car with the panel in front of you, before a button has
 * been pressed. `linkId` is the car, so the ride knows where it started.
 */
export interface LiftCall {
  linkId: string
  room: string
  floor: number
  stops: LiftStop[]
  /** Said by the car when a button with nothing behind it is pressed. */
  refused?: string[]
}

export interface LiftRide {
  /** The link being taken, so the arrival knows where to put him. */
  linkId: string
  /** Room the car is leaving, and the one it is going to. */
  fromRoom: string
  toRoom: string
  /** Floor numbers, for the indicator over the doors. */
  from: number
  to: number
  started: number
  /** How long the whole ride lasts, doors included. */
  duration: number
}

/**
 * A launch under way, or one that has finished and left him in orbit.
 *
 * `started` is on the same clock `launchPhase` reads, and it is the only
 * thing the sequence needs: every stage, the count, the shake and the
 * altitude are arithmetic on it. There is no field for aborting, because
 * there is no aborting.
 */
export interface Launch {
  started: number
  /** True once the climb is over: the certificate can be signed. */
  arrived: boolean
}

interface GameState {
  mode: Mode
  area: AreaId
  dialogue: DialogueState | null
  panel: PanelPayload | null
  nearby: Nearby | null
  spawn: Spawn
  /** A step he is taking by himself; null whenever he has the controls. */
  stride: Stride | null

  visited: Record<string, true>
  entries: JournalEntry[]
  toast: {
    title: string
    body: string
    kind: 'journal' | 'key' | 'mission' | 'quality' | 'progress'
  } | null

  keys: Record<string, true>
  missions: Record<string, MissionState>
  discovered: Record<string, true>
  /** Things found that are not keys: a shelf that swings, and whatever next. */
  secrets: Record<string, true>
  /**
   * Which visit a way that has to be opened was opened on, secret by secret,
   * as the spawn token that was current at the time.
   *
   * `secrets` is permanent and is what the journal and the keyring are built
   * on: once the helicopter has been found it stays found. The shelf itself
   * is not. It is shut when you walk into the library and shut again the
   * moment you walk out, so every visit is the same room with the same panel
   * in the back wall until a hand goes to the toy shelf.
   *
   * The token is what makes that work, where the room's own id would not:
   * every move between areas bumps it, so walking out of the library and
   * straight back in leaves this pointing at a visit that is over, which is
   * exactly the case the room id cannot tell from never having left.
   */
  swung: Record<string, number>
  lighthouseOpen: boolean
  cvUnlocked: boolean
  greetingReturn: Mode

  paintball: PaintballGame | null
  moto: MotoRun | null
  motoSetup: MotoSetup
  balloon: BalloonFlight | null
  hide: HideGame | null
  rescue: RescueRun | null

  muted: boolean
  musicOn: boolean
  /** What the visitor has asked the renderer to spend on a frame. */
  quality: Quality
  /** Whether 'auto' has measured a machine that cannot keep up. */
  autoDropped: boolean
  /** Which language the island reads in. */
  locale: Locale
  /** Soundtrack loudness, 0 (off) to LEVELS. */
  musicLevel: number
  /** Sound-effect loudness, 0 (off) to LEVELS. */
  sfxLevel: number
  /** Lights out: the island after dark. */
  night: boolean
  /**
   * When the whole table last stood at its places, or null. The toast reads
   * it and takes itself off the screen three seconds later.
   */
  cheer: number | null
  /**
   * How far the thesis defence has got, or null when nobody is at the lectern.
   * The caption under the board reads `slide`, and the banner reads `ovation`.
   * Written from the frame loop, so it only ever changes on a slide turn
   * rather than sixty times a second.
   */
  lecture: { slide: number; ovation: boolean } | null
  /** The lift ride under way, or null when nobody is in the car. */
  lift: LiftRide | null
  /**
   * The launch under way, or the orbit it ended in. Null until the button
   * under the glass is pressed, and never null again afterwards: leaving is
   * the one thing on this island that does not undo.
   */
  launch: Launch | null
  /**
   * Whether the ship has ever flown, kept apart from `launch` because it
   * outlives the session. A visitor who launched, closed the tab and came
   * back finds the island still there to walk — the save remembers that they
   * left, so the certificate is theirs again without a second flight, but it
   * does not strand them in orbit on a page they only reopened.
   */
  launched: boolean
  /** The panel, while he is in the car and has not pressed anything. */
  liftCall: LiftCall | null
  /**
   * What the calendar on the basement wall is turned to, and whether that
   * happens to be Christmas Day. The second is only ever the first read
   * through `isFeast`, kept beside it so the render path does not recompute
   * it on every frame of a room that cares.
   */
  calendar: CalendarDate
  christmas: boolean
  /** Behind his eyes rather than over his shoulder. */
  firstPerson: boolean
  /** What he carries after dark. */
  handLight: Carried
  /**
   * Out of his depth. Only the hand light cares — you do not swim the coast
   * of an island holding a lit torch over your head — but it is a render
   * either way, so it lives here rather than in the swim.
   */
  swimming: boolean
  /** The square, dancing. Only after dark. */
  party: boolean
  /** True once he has walked into the middle and she has been called down. */
  amaliaHere: boolean
  /** What he is wearing. The tuxedo is for her arrival and nothing else. */
  outfit: 'islander' | 'tuxedo'
  /**
   * The beach proposal, and how far through it he is. Null almost always:
   * there is one way to start it and it is not written down anywhere.
   */
  proposal: ProposalPhase | null
  /**
   * Which proposal this is. It only ever goes up, and it is what the scene
   * is keyed on: asking her again lays a fresh heart of candles wherever he
   * is standing now, rather than relighting the one he walked away from.
   */
  proposalRound: number
  hasMoved: boolean

  start: () => void
  setNearby: (n: Nearby | null) => void
  talk: (d: Omit<DialogueState, 'page'>) => void
  advance: () => void
  /** Picks one of the answers on the last page of the dialogue. */
  choose: (index: number) => void
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
  setQuality: (quality: Quality) => void
  reportSlow: () => void
  setMusicLevel: (level: number) => void
  setSfxLevel: (level: number) => void
  setLocale: (locale: Locale) => void
  toggleNight: () => void
  toggleFirstPerson: () => void
  toggleHandLight: () => void
  setSwimming: (value: boolean) => void
  toggleParty: () => void
  callAmalia: () => void
  /**
   * Whether the gesture would do anything from here, which is a question
   * the HUD asks as well: it is what decides whether leaning on the key
   * shows you anything at all.
   */
  canPropose: (x: number, z: number) => boolean
  /** The gesture, made on the sand after dark. */
  proposeToAmalia: (x: number, z: number, facing: number) => boolean
  /** She has walked up the beach and he is on one knee. */
  askAmalia: () => void
  /** Her answer, and then the two of them and the candles. */
  answerAmalia: () => void
  finishProposal: () => void
  /** Escape: the candles out, her away, and back to an ordinary night. */
  clearProposal: () => void
  markMoved: () => void

  /** Takes the calendar off the wall, and puts it back. */
  openCalendar: () => void
  closeCalendar: () => void
  /** Raises the toast, once, when the last of them reaches the table. */
  cheerFeast: () => void
  endCheer: () => void
  setLecture: (slide: number, ovation: boolean) => void
  endLecture: () => void

  /** Turns it to a day. The house does the rest. */
  setCalendar: (next: CalendarDate) => void
  /**
   * Puts it back to his birthday, silently. This is what leaving the room
   * does: the decoration lasts as long as you are standing in it.
   */
  resetCalendar: () => void

  openArcade: () => void
  closeArcade: () => void
  openMoto: () => void
  beginMoto: () => void
  setMotoSetup: (next: Partial<MotoSetup>) => void
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
  goRoom: (to: string, arrive: Vec2, facing?: number) => void
  /** He has finished a walk he was taking by himself. */
  endStride: () => void
  /** The glass slides and he starts walking through it. */
  /** He is through: the lobby replaces the island. */
  /** Into the car: the doors stay open and the panel comes up. */
  callLift: (call: LiftCall) => void
  /** Out of the car without pressing anything. */
  leaveLift: () => void
  /** A button pressed: either the car moves, or it says why it will not. */
  pressFloor: (stop: LiftStop) => void
  /** Shuts the doors and starts the car moving. */
  rideLift: (ride: LiftRide) => void
  /** The car has stopped: swap to the far floor, doors still shut. */
  arriveLift: (arrive: Vec2, facing?: number) => void
  /** The doors have finished opening: hand the controls back. */
  endLift: () => void
  /**
   * The button under the glass. Starts the count, and there is no companion
   * action that stops it.
   */
  beginLaunch: () => void
  /** The climb is over: he is in orbit and the certificate can be signed. */
  reachOrbit: () => void
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
  /** Forgets the visit: the journal, the keyring, and the doors opened. */
  clearProgress: () => void
}

/**
 * Everything the journal can hold: people worth remembering, the exhibits,
 * and the ways through that are worth remembering having found.
 *
 * Stairs and doors file entries too, and leaving them out of the total is how
 * the counter ended up able to read 40 of 38.
 *
 * Written out in full here, in English, because this is also what a restored
 * save is rebuilt from: the file on disk holds ids and nothing else.
 */
/**
 * The one entry nothing on the island points at: it is filed by turning the
 * calendar to the twenty-fifth of December, and it stays filed after the
 * calendar has been turned back. Listed here with the rest so the total it
 * counts toward is honest and a save restores it.
 */
/**
 * The defence, for whoever sits through the whole of it. Like the calendar
 * it is an entry you earn by doing something rather than by walking past a
 * board, so it is declared here beside that one and counted the same way.
 */
export const DEFENCE_GIVEN: JournalEntry = {
  id: 'defence',
  title: 'The thesis defence',
  body: 'Step up to the lectern in the NTUA hall and the class files in for the defence: compliance analysis of movement exercises, pose estimation and a modified Levenshtein distance, running on the phone in the patient’s hand. Supervised by the Dean of the School, graded with distinction, and published on arXiv three years later.',
  source: 'The lectern',
}

export const CHRISTMAS_FOUND: JournalEntry = {
  id: 'christmas',
  title: 'Christmas in the basement',
  body: 'Turn the calendar to the twenty-fifth of December and the basement is dressed, the tree is up and both families are round the table. It is his nameday as well as Christmas, and the meal has always been hosted here.',
  source: 'The calendar',
}

/**
 * Every entry the journal can hold, in the order the journal shows them. The
 * total on the meter, the cards in the grid and what a save is allowed to
 * restore all read this one list.
 */
export const CATALOGUE: JournalEntry[] = [
  CHRISTMAS_FOUND,
  DEFENCE_GIVEN,
  ...NPCS.filter((n) => n.journal).map((n) => ({
    id: n.id,
    title: n.journal!.title,
    body: n.journal!.body,
    source: n.name,
  })),
  ...INTERIORS.flatMap((i) =>
    i.exhibits
      .filter((e) => e.journal)
      .map((e) => ({
        id: e.id,
        title: e.journal!.title,
        body: e.journal!.body,
        source: i.name,
      })),
  ),
  ...INTERIORS.flatMap((i) =>
    (i.links ?? [])
      .filter((l) => l.journal)
      .map((l) => ({
        id: l.id,
        title: l.journal!.title,
        body: l.journal!.body,
        source: i.name,
      })),
  ),
  // What a right answer to somebody's question files, under the question's id.
  ...NPCS.filter((n) => n.quiz?.journal).map((n) => ({
    id: n.quiz!.id,
    title: n.quiz!.journal!.title,
    body: n.quiz!.journal!.body,
    source: n.name,
  })),
]

const ENTRY_BY_ID = new Map(CATALOGUE.map((entry) => [entry.id, entry]))

export const TOTAL_ENTRIES = CATALOGUE.length
export const TOTAL_KEYS = KEYS.length

const IDLE_MISSIONS: Record<string, MissionState> = Object.fromEntries(
  MISSIONS.map((m) => [m.id, 'idle' as MissionState]),
)

/**
 * A saved visit read back into the shapes the store keeps things in.
 *
 * Every id is checked against what the island actually holds today. A save
 * written before an exhibit was renamed, or before a building was pulled, is
 * still worth restoring — it just comes back without the parts that no longer
 * exist, rather than leaving the journal counting to a total it cannot reach.
 */
const SAVED_PROGRESS = loadProgress()

function found(ids: string[] | undefined, known?: Set<string>) {
  const out: Record<string, true> = {}
  for (const id of ids ?? []) {
    if (!known || known.has(id)) out[id] = true
  }
  return out
}

const KEY_IDS = new Set(KEYS.map((k) => k.id))
const BUILDING_IDS = new Set(BUILDING_BY_ID.keys())

const RESTORED = {
  entries: (SAVED_PROGRESS?.entries ?? [])
    .map((id) => ENTRY_BY_ID.get(id))
    .filter((entry): entry is JournalEntry => entry !== undefined),
  keys: found(SAVED_PROGRESS?.keys, KEY_IDS),
  missions: {
    ...IDLE_MISSIONS,
    ...Object.fromEntries(
      Object.entries(SAVED_PROGRESS?.missions ?? {}).filter(
        ([id]) => id in IDLE_MISSIONS,
      ),
    ),
  } as Record<string, MissionState>,
  discovered: found(SAVED_PROGRESS?.discovered, BUILDING_IDS),
  // Secrets are ids invented wherever they are revealed, with no table to
  // check them against; an unknown one simply never unlocks anything.
  secrets: found(SAVED_PROGRESS?.secrets),
  lighthouseOpen: SAVED_PROGRESS?.lighthouseOpen ?? false,
  cvUnlocked: SAVED_PROGRESS?.cvUnlocked ?? false,
  launched: SAVED_PROGRESS?.launched ?? false,
}

/**
 * True while the game is somewhere there is no walking back from: strapped
 * into the ship with the count running, or in orbit afterwards.
 *
 * This exists because "back to explore" is written in a dozen places — every
 * panel close, the journal, the map, the way out of a building — and a launch
 * has to be proof against all of them rather than against the ones that were
 * remembered. The guard goes in `set` itself, below, so a path added later is
 * covered without anybody having to think of it.
 */
export const isSealed = (mode: Mode) => mode === 'launch' || mode === 'orbit'

export const useGame = create<GameState>((raw, get) => {
  /*
   * The seal. Every action still writes what it always wrote; this drops the
   * one field a sealed game will not accept a change to, and lets the rest of
   * the patch through — so closing a panel mid-flight still clears the panel,
   * it just does not hand the walk back with it.
   *
   * `clearProgress` and the launch's own actions reach past it by writing the
   * mode they want through `raw`, which is how starting over still works from
   * orbit.
   */
  const seal = (patch: Partial<GameState>): Partial<GameState> => {
    if (!patch || !('mode' in patch) || !isSealed(get().mode)) return patch
    const { mode: _mode, ...rest } = patch
    return rest as Partial<GameState>
  }

  const set: typeof raw = (partial, replace?) => {
    /* A wholesale replace is the store being rebuilt — a test, or the page
       starting over — and is not an action trying to walk out of a flight. */
    if (replace) {
      return (raw as (p: unknown, r?: boolean) => void)(partial, replace)
    }
    /* The updater form has to be sealed through its result rather than
       waved past: `leaveBuilding` and its like are written that way, and
       they are exactly the ways back to the island that must not work. */
    if (typeof partial === 'function') {
      const fn = partial as (s: GameState) => Partial<GameState>
      return raw((prev: GameState) => seal(fn(prev)))
    }
    return raw(seal(partial as Partial<GameState>))
  }

  return {
    mode: 'title',
    area: 'island',
    dialogue: null,
    panel: null,
    nearby: null,
    spawn: { area: 'island', position: [...PLAYER_START] as Vec2, token: 0 },
    stride: null,

    visited: Object.fromEntries(RESTORED.entries.map((e) => [e.id, true])),
    entries: RESTORED.entries,
    toast: null,

    keys: RESTORED.keys,
    missions: RESTORED.missions,
    discovered: RESTORED.discovered,
    secrets: RESTORED.secrets,
    // Nothing is standing open at the title screen, whatever the save holds.
    swung: {},
    lighthouseOpen: RESTORED.lighthouseOpen,
    cvUnlocked: RESTORED.cvUnlocked,
    greetingReturn: 'explore',
    paintball: null,
    moto: null,
    motoSetup: { laps: LAPS, difficulty: 'normal' },
    balloon: null,
    hide: null,
    rescue: null,

    muted: false,
    musicOn: true,
    quality: SAVED.quality,
    autoDropped: false,
    musicLevel: SAVED.musicLevel,
    sfxLevel: SAVED.sfxLevel,
    locale: SAVED.locale,
    night: false,
    cheer: null,
    lecture: null,
    lift: null,
    liftCall: null,
    /* Nobody is in orbit at the title screen, whatever the save remembers. */
    launch: null,
    launched: RESTORED.launched,
    calendar: SAVED.calendar,
    christmas: isFeast(SAVED.calendar),
    firstPerson: false,
    handLight: 'flashlight',
    swimming: false,
    party: false,
    amaliaHere: false,
    outfit: 'islander',
    proposal: null,
    proposalRound: 0,
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
      } else if (dialogue.choices) {
        // A question waits for an answer; Enter does not close it.
        return
      } else {
        set({ mode: 'explore', dialogue: null })
      }
    },

    choose: (index) => {
      const { dialogue } = get()
      const choice = dialogue?.choices?.[index]
      if (!dialogue || !choice) return
      if (choice.reveals) {
        const { id, title, body } = choice.reveals
        get().revealSecret(id, { title, body })
      } else {
        sfx.cancel()
      }
      if (choice.journal) get().record(choice.journal)
      set({
        dialogue: {
          speaker: dialogue.speaker,
          role: dialogue.role,
          lines: choice.lines,
          page: 0,
        },
      })
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
     * Choosing anything by hand clears what 'auto' decided earlier, so picking
     * 'auto' a second time is a way to ask for a fresh verdict rather than a
     * no-op that leaves the island stuck where one bad patch left it.
     */
    setQuality: (quality) => {
      const { musicLevel, sfxLevel, locale, calendar } = get()
      remember({ quality, musicLevel, sfxLevel, locale, calendar })
      set({ quality, autoDropped: false })
    },

    /**
     * Both levels drive the audio graph directly rather than through an effect,
     * so a drag across the steps is heard as it happens instead of one step
     * behind.
     */
    setMusicLevel: (level) => {
      const musicLevel = Math.max(0, Math.min(LEVELS, Math.round(level)))
      const { quality, sfxLevel, locale, calendar } = get()
      remember({ quality, musicLevel, sfxLevel, locale, calendar })
      applyMusicLevel(musicLevel)
      set({ musicLevel })
    },

    setSfxLevel: (level) => {
      const sfxLevel = Math.max(0, Math.min(LEVELS, Math.round(level)))
      const { quality, musicLevel, locale, calendar } = get()
      remember({ quality, musicLevel, sfxLevel, locale, calendar })
      applySfxLevel(sfxLevel)
      set({ sfxLevel })
      // Let them hear what they just chose.
      if (sfxLevel > 0) sfx.confirm()
    },

    /**
     * What the frame-time watcher calls once it has seen enough. Advisory: it
     * only marks the verdict, and a visitor who disagrees can overrule it.
     */
    setLocale: (locale) => {
      const { quality, musicLevel, sfxLevel, calendar } = get()
      remember({ quality, musicLevel, sfxLevel, locale, calendar })
      set({ locale })
    },

    reportSlow: () => {
      if (get().quality !== 'auto') return
      set({
        autoDropped: true,
        toast: {
          title: 'Shadows off',
          body: 'The island was running slow, so it stepped itself down. The Quality button puts it back.',
          kind: 'quality',
        },
      })
    },
    /**
     * Turning the lights back on ends the party, which needs the dark — and is
     * refused outright mid hide-and-seek, which needs the dark rather more.
     */
    toggleFirstPerson: () => {
      sfx.blip()
      set((s) => ({ firstPerson: !s.firstPerson }))
    },

    toggleNight: () => {
      const game = get()
      // The dark is the whole point of one of these games and the ruin of the
      // rest: hide-and-seek is played in it, and a race, a flight, a match or
      // a rescue lit differently halfway through is a different one. The
      // switch is out of bounds while any of them is on.
      if (game.hide || game.paintball || game.moto) return
      if (game.balloon || game.rescue) return
      sfx.confirm()
      // The candles and the party both belong to the dark. Putting the sun
      // back up ends whichever of them is going on.
      set((s) => {
        const night = !s.night
        if (night) return { night }
        if (s.party) stopParty()
        if (s.proposal) endProposal()
        if (!s.party && !s.proposal) return { night }
        return {
          night,
          party: false,
          proposal: null,
          amaliaHere: false,
          outfit: 'islander',
        }
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
      // She cannot be in two places at once, and a square full of speakers is
      // not where the candles are.
      endProposal()
      startParty()
      sfx.jingle()
      set({
        party: true,
        proposal: null,
        amaliaHere: false,
        outfit: 'islander',
      })
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

    /**
     * The gesture, made on the sand after dark, and she comes up the beach to
     * him. Refused anywhere but on the sand, in the dark, on his own — and it
     * answers so the keyboard knows whether anything came of it.
     */
    canPropose: (x, z) => {
      const s = get()
      if (s.mode !== 'explore' || !s.night || s.area !== 'island') return false
      // Nothing doing in the middle of a game, or a party.
      if (s.party || s.hide || s.paintball || s.moto) return false
      if (s.balloon || s.rescue) return false
      // Not in the middle of a proposal either — but once one has played out
      // he can ask her again, anywhere on the sand, as often as he likes.
      if (s.proposal !== null && s.proposal !== 'done') return false
      // And she cannot be called down to the beach while she is already here
      // for the dancing, which is the other way she turns up.
      if (s.amaliaHere && s.proposal === null) return false
      return beachAt(x, z)
    },

    proposeToAmalia: (x, z, facing) => {
      if (!get().canPropose(x, z)) return false
      // The candles he lit last time go out as the new ones catch.
      endProposal()
      beginProposal(x, z, facing)
      sfx.jingle()
      set((was) => ({
        proposal: 'arriving',
        proposalRound: was.proposalRound + 1,
        amaliaHere: true,
        outfit: 'tuxedo',
      }))
      return true
    },

    /** She has walked up out of the dark and he is down on one knee. */
    askAmalia: () => {
      if (get().proposal !== 'arriving') return
      set({ proposal: 'asking' })
      get().talk({
        speaker: 'Kitsos',
        role: 'On one knee',
        lines: AMALIA.question,
      })
    },

    /** Her answer. The ring changes hands on the same beat. */
    answerAmalia: () => {
      if (get().proposal !== 'asking') return
      sfx.jingle()
      set({ proposal: 'yes' })
      get().talk({
        speaker: AMALIA.name,
        role: 'Already nodding',
        lines: AMALIA.answer,
      })
    },

    /** And afterwards: the two of them, and the candles, and all night. */
    finishProposal: () => {
      if (get().proposal !== 'yes') return
      settleProposal()
      set({ proposal: 'done' })
      get().record({
        id: 'beach-ring',
        title: 'A ring, on the beach',
        body: 'Candles in a heart in the sand, her walking up out of the dark, and a yes before the question was properly out. The island has had a lot of firsts on it. This is the one that counts.',
        source: 'The west beach',
      })
    },
    /**
     * Enough. The candles go out, she goes home, and he is back in his own
     * clothes — which is all Escape has ever meant on this island.
     */
    clearProposal: () => {
      if (!get().proposal) return
      endProposal()
      sfx.cancel()
      set({ proposal: null, amaliaHere: false, outfit: 'islander' })
    },

    /** Flashlight, torch, then nothing at all — which the camp run needs. */
    /**
     * Flashlight, torch, then nothing at all — which the camp run needs.
     *
     * Refused in the water. Both hands are busy out there and neither of them
     * is holding anything that would still be alight. Refused indoors too:
     * the rooms light themselves after dark, so there is nothing to carry.
     */
    toggleHandLight: () => {
      const s0 = get()
      if (s0.swimming || s0.area !== 'island') return
      sfx.confirm()
      set((s) => ({
        handLight:
          s.handLight === 'flashlight'
            ? 'torch'
            : s.handLight === 'torch'
              ? 'none'
              : 'flashlight',
      }))
    },

    setSwimming: (value) => {
      if (get().swimming === value) return
      set({ swimming: value })
    },
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

    /* ----------------------------- calendar --------------------------- */

    openCalendar: () => {
      sfx.confirm()
      set({ mode: 'calendar', dialogue: null, panel: null, nearby: null })
    },

    closeCalendar: () => {
      sfx.cancel()
      set({ mode: 'explore' })
    },

    /**
     * Turns the calendar to a day and remembers it, so the basement is still
     * decorated on the next visit rather than only until the tab closes.
     *
     * Arriving on the twenty-fifth of December is the whole point of the thing,
     * so it announces itself: a jingle, and a journal entry that stays found
     * even after the calendar is turned back.
     */
    setCalendar: (next) => {
      const calendar = clampDate(next)
      const christmas = isFeast(calendar)
      const { quality, musicLevel, sfxLevel, locale } = get()
      remember({ quality, musicLevel, sfxLevel, locale, calendar })
      const arriving = christmas && !get().christmas
      if (arriving) sfx.jingle()
      else sfx.blip()
      set({ calendar, christmas })
      if (arriving) get().record(CHRISTMAS_FOUND)
    },

    /**
     * Called from the frame loop the moment the last of them is in place, so
     * it has to be idempotent — it is asked again every frame after that.
     */
    cheerFeast: () => {
      if (get().cheer !== null) return
      sfx.jingle()
      set({ cheer: Date.now() })
    },

    endCheer: () => {
      if (get().cheer === null) return
      set({ cheer: null })
    },

    /**
     * Called from the frame loop while he is at the lectern, so it has to be
     * cheap to call on a frame that changes nothing: the slide only turns
     * every eight seconds or so, and the ovation once.
     */
    setLecture: (slide, ovation) => {
      const at = get().lecture
      if (at && at.slide === slide && at.ovation === ovation) return
      // The room comes to its feet once, not on every frame it stays on them.
      if (ovation && !at?.ovation) {
        sfx.applause()
        get().record(DEFENCE_GIVEN)
      }
      set({ lecture: { slide, ovation } })
    },

    endLecture: () => {
      if (get().lecture === null) return
      set({ lecture: null })
    },

    resetCalendar: () => {
      const calendar = { ...BIRTHDAY }
      const { quality, musicLevel, sfxLevel, locale } = get()
      remember({ quality, musicLevel, sfxLevel, locale, calendar })
      set({ calendar, christmas: false })
    },

    /* ---------------------------- motocross --------------------------- */

    openMoto: () => {
      const state = get()
      if (state.night) return
      if (state.area !== 'island') state.leaveBuilding()
      sfx.confirm()
      // Puts all four bikes back on the grid, so the briefing shows the island
      // exactly as the race will start it.
      const setup = state.motoSetup
      openRide(setup.laps, setup.difficulty)
      set((s) => ({
        mode: 'moto',
        dialogue: null,
        panel: null,
        nearby: null,
        moto: {
          status: 'briefing',
          laps: setup.laps,
          difficulty: setup.difficulty,
          place: 0,
          seconds: 0,
          best: 0,
          round: (s.moto?.round ?? 0) + 1,
        },
      }))
    },

    /**
     * Changes the board at the briefing. The grid is laid out again as well,
     * so the island behind the card is always showing the race you picked.
     */
    setMotoSetup: (next: Partial<MotoSetup>) => {
      const state = get()
      const setup = { ...state.motoSetup, ...next }
      sfx.blip()
      openRide(setup.laps, setup.difficulty)
      set((s) => ({
        motoSetup: setup,
        moto: s.moto
          ? { ...s.moto, laps: setup.laps, difficulty: setup.difficulty }
          : s.moto,
      }))
    },

    beginMoto: () => {
      const state = get()
      const run = state.moto
      if (!run) return
      openRide(state.motoSetup.laps, state.motoSetup.difficulty)
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
        balloon: {
          ...flight,
          status: 'flying',
          served: 0,
          wrong: 0,
          dropped: 0,
        },
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
      set({
        paintball: { ...game, ...buildTeams(wanted, game.enemies.length) },
      })
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

    /** The step he was taking by himself is done; nothing is walking him now. */
    endStride: () => {
      if (get().stride) set({ stride: null })
    },

    /**
     * Into the car. Nothing moves yet: he walks in, the doors stay open, the
     * panel comes up, and he is free to walk straight back out again.
     */
    callLift: (call) => {
      if (get().lift || get().liftCall) return
      /*
       * Step him into the car. Until this existed a ride was watched from the
       * corridor — the doors shut on an empty shaft in front of him and opened
       * again on a room he had been teleported to, which read as a door with a
       * delay rather than as a lift.
       */
      const room = INTERIOR_BY_ID.get(call.room)
      const car = (room?.links ?? []).find((l) => l.id === call.linkId)
      const stance = car ? liftStance(car, room) : null
      set({
        liftCall: call,
        mode: 'lift',
        nearby: null,
        panel: null,
        dialogue: null,
        /* Walked, not teleported: a spawn here would drop a curtain over the
         one step that makes the ride make sense. */
        stride: stance && { to: stance.inside, facing: stance.facing },
      })
    },

    /**
     * Out of the car without going anywhere — he backs out the way he came in,
     * onto the floor he was already standing on.
     */
    leaveLift: () => {
      const call = get().liftCall
      if (!call) return
      const room = INTERIOR_BY_ID.get(call.room)
      const car = (room?.links ?? []).find((l) => l.id === call.linkId)
      const stance = car ? liftStance(car, room) : null
      set({
        liftCall: null,
        mode: 'explore',
        stride: stance && { to: stance.outside, facing: stance.facing },
      })
    },

    /**
     * A button. A floor with a room behind it shuts the doors and rides; the
     * one with nothing behind it says so and leaves the doors open.
     */
    pressFloor: (stop) => {
      const call = get().liftCall
      if (!call) return
      if (!stop.to || !INTERIOR_BY_ID.has(stop.to)) {
        sfx.dry()
        set({
          liftCall: { ...call, refused: stop.lines ?? ['Nothing happens.'] },
        })
        return
      }
      /*
       * Already on that floor. The panel does not offer the button at all any
       * more, so this is a backstop rather than a path anybody walks — kept
       * because a ride to the floor you are standing on would teleport you
       * across your own room.
       */
      if (stop.to === call.room) {
        sfx.dry()
        set({
          liftCall: { ...call, refused: ['You are on this floor already.'] },
        })
        return
      }
      get().rideLift({
        linkId: call.linkId,
        fromRoom: call.room,
        toRoom: stop.to,
        from: call.floor,
        to: stop.floor,
        started: performance.now() / 1000,
        duration:
          LIFT_DOORS * 2 +
          Math.max(1, Math.abs(stop.floor - call.floor)) * LIFT_PER_FLOOR,
      })
    },

    /**
     * The doors shut and the car moves. The room does not change yet: he stands
     * where he is until `endLift`, once the ride has run its course.
     */
    rideLift: (ride) => {
      if (get().lift) return
      if (!INTERIOR_BY_ID.has(ride.toRoom)) return
      set({
        lift: ride,
        liftCall: null,
        mode: 'lift',
        nearby: null,
        panel: null,
        dialogue: null,
        /* He is already standing in the car; nothing is left to walk. */
        stride: null,
      })
    },

    /**
     * The car has stopped on the far floor. The room changes here, with the
     * doors still shut, so the opening half of the ride plays on the floor he
     * has arrived at rather than being lost with the room he left.
     *
     * The ride itself stays on the store — `endLift` clears it once the doors
     * are wide — which is what keeps the far floor's leaves animating instead
     * of mounting already open.
     */
    arriveLift: (arrive, facing) => {
      const ride = get().lift
      if (!ride || get().area === ride.toRoom) return
      if (!INTERIOR_BY_ID.has(ride.toRoom)) return
      set((s) => ({
        area: ride.toRoom,
        nearby: null,
        panel: null,
        dialogue: null,
        spawn: {
          area: ride.toRoom,
          position: [...arrive] as Vec2,
          facing,
          token: s.spawn.token + 1,
        },
        stride: null,
      }))
    },

    /**
     * The doors are wide and he is out of the car: back in control.
     *
     * `mode` is held at 'lift' for the whole ride and only released here, so
     * the walk is his again exactly when the opening he walks through is.
     */
    endLift: () => {
      if (!get().lift) return
      set({ lift: null, mode: 'explore' })
    },

    /**
     * The button under the glass goes down and the count starts.
     *
     * Everything that could interrupt a launch is cleared here rather than
     * guarded against for the next twenty seconds: no prompt, no panel, nobody
     * talking, and nothing left to walk. From this moment the only thing the
     * store will accept is the climb finishing.
     */
    beginLaunch: () => {
      if (get().launch) return
      if (get().area !== 'lighthouse') return
      sfx.jingle()
      /* Through the seal, which is not yet closed — this is what closes it. */
      set({
        launch: { started: performance.now() / 1000, arrived: false },
        launched: true,
        mode: 'launch',
        nearby: null,
        panel: null,
        dialogue: null,
        stride: null,
        liftCall: null,
      })
    },

    /**
     * The engines are out and the island is a shape below him.
     *
     * The area is left as the lighthouse deliberately: he is still strapped
     * into the room he launched in, and the window is the part that changed.
     * What ends here is the flight, not the place.
     */
    reachOrbit: () => {
      const launch = get().launch
      if (!launch || launch.arrived) return
      /* Through the seal: launch → orbit is the one move it has to permit. */
      raw({ mode: 'orbit' })
      set({ launch: { ...launch, arrived: true } })
    },

    /**
     * Through a door or down the stairs inside one building. Not the same as
     * entering from outside: nothing is discovered, and the way out still knows
     * which doorstep it belongs to.
     */
    goRoom: (to, arrive, facing) => {
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
          facing,
          token: s.spawn.token + 1,
        },
        /* A teleport outranks a walk: whatever step was under way belonged to
         the room he has just left. */
        stride: null,
      }))
    },

    revealSecret: (id, found) => {
      const first = !get().secrets[id]
      if (first) sfx.jingle()
      set((s) => ({
        secrets: first ? { ...s.secrets, [id]: true } : s.secrets,
        /* Swung open on this visit, and only this one: leaving shuts it again,
         and finding the switch a second time on a later visit opens it again
         without filing anything twice. */
        swung: { ...s.swung, [id]: s.spawn.token },
        toast: first && found ? { ...found, kind: 'key' as const } : s.toast,
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
        missions: mission
          ? { ...s.missions, [mission.id]: 'done' }
          : s.missions,
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

    /**
     * Everything found, put back. The saved blob goes with it — the watcher
     * below sees an empty island and takes the row out of site data rather than
     * leaving an encoded nothing behind.
     *
     * The settings are deliberately untouched: someone clearing the island they
     * walked is not asking to have the volume turned back up.
     */
    clearProgress: () => {
      forgetProgress()
      /* Through the seal: starting over is the one thing orbit does allow, and
       it puts the island back at the title screen rather than in the room. */
      raw({ mode: 'title', area: 'island' })
      set({
        visited: {},
        entries: [],
        keys: {},
        missions: { ...IDLE_MISSIONS },
        discovered: {},
        secrets: {},
        swung: {},
        lighthouseOpen: false,
        cvUnlocked: false,
        launch: null,
        launched: false,
        toast: {
          title: 'Starting over',
          body: 'The journal, the keyring and everything found have been forgotten.',
          kind: 'progress',
        },
      })
    },
  }
})

/** Everything a save holds, and nothing else the store happens to keep. */
type Progressed = Pick<
  GameState,
  | 'entries'
  | 'keys'
  | 'missions'
  | 'discovered'
  | 'secrets'
  | 'lighthouseOpen'
  | 'cvUnlocked'
  | 'launched'
>

/** The store's progress in the shape the save file keeps it in. */
function snapshot(s: Progressed): SavedProgress {
  const missions: Record<string, 'active' | 'done'> = {}
  for (const [id, state] of Object.entries(s.missions)) {
    if (state !== 'idle') missions[id] = state
  }
  return {
    entries: s.entries.map((e) => e.id),
    keys: Object.keys(s.keys),
    missions,
    discovered: Object.keys(s.discovered),
    secrets: Object.keys(s.secrets),
    lighthouseOpen: s.lighthouseOpen,
    cvUnlocked: s.cvUnlocked,
    launched: s.launched,
  }
}

/**
 * One watcher rather than a save call in every action that moves the game on.
 * Each of these fields is replaced wholesale when it changes, so comparing the
 * references is enough to tell a step forward from a camera turn — and the
 * island turns the camera rather a lot more often than it hands out a key.
 */
useGame.subscribe((state, previous) => {
  if (
    state.entries === previous.entries &&
    state.keys === previous.keys &&
    state.missions === previous.missions &&
    state.discovered === previous.discovered &&
    state.secrets === previous.secrets &&
    state.lighthouseOpen === previous.lighthouseOpen &&
    state.cvUnlocked === previous.cvUnlocked &&
    state.launched === previous.launched
  ) {
    return
  }
  saveProgress(snapshot(state))
})

/** Whether this visit has anything in it worth clearing. */
export const hasProgress = (s: Progressed) => !isEmpty(snapshot(s))

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
