/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextObjective, useGame } from './store'
import { KEYS, MISSIONS, PLAYER_START } from '../../features/island/world'
import { BIRTHDAY, FEAST } from '../../features/calendar/calendar'
import { INTERIORS } from '../../features/interior/interiors'
import { liftArrival, liftStance } from '../../features/lift/lift'

/**
 * The store is the island's memory of the visit: where you are, what you have
 * found, and what the screen is showing. Almost everything else reads it, so
 * what is worth holding it to is the handful of rules that the rest of the
 * island assumes without checking.
 *
 * The big one is that finding something twice is not finding it twice. The
 * journal, the keyring and the secrets are all idempotent, and they have to
 * be, because a visitor can walk back into a room and press the same thing
 * again — and a journal that filed the lighthouse lamp four times would be a
 * worse record of the visit than one that filed it once.
 *
 * The audio is stubbed throughout: none of these rules are about sound, and a
 * test should not need a speaker to check that a key opens a door.
 */

vi.mock('../game/audio', async () => {
  const actual =
    await vi.importActual<typeof import('../engine/audio')>('../game/audio')
  return new Proxy(actual, {
    get(target, prop) {
      const real = Reflect.get(target, prop)
      return typeof real === 'function' && prop !== 'LEVELS' ? vi.fn() : real
    },
  })
})

vi.mock('../game/music', async () => {
  const actual =
    await vi.importActual<typeof import('../../features/radio/music')>(
      '../game/music',
    )
  return new Proxy(actual, {
    get(target, prop) {
      const real = Reflect.get(target, prop)
      return typeof real === 'function' ? vi.fn() : real
    },
  })
})

/** The store as it was when the page opened, for a test to go back to. */
const PRISTINE = useGame.getState()

beforeEach(() => {
  localStorage.clear()
  useGame.setState(PRISTINE, true)
})

const state = () => useGame.getState()

describe('where the island starts', () => {
  it('opens on the title screen, outdoors, with nothing found', () => {
    expect(state().mode).toBe('title')
    expect(state().area).toBe('island')
    expect(state().entries).toEqual([])
    expect(state().toast).toBeNull()
  })

  it('walks out onto the island when the visit begins', () => {
    state().start()
    expect(state().mode).toBe('explore')
  })
})

describe('the journal', () => {
  const lamp = {
    id: 'lighthouse-lamp',
    title: 'The lamp',
    body: 'It still turns.',
    source: 'The lighthouse',
  }

  it('files an entry and raises a toast for it', () => {
    state().record(lamp)
    expect(state().entries).toHaveLength(1)
    expect(state().entries[0].id).toBe(lamp.id)
    expect(state().toast?.title).toBe('The lamp')
    expect(state().toast?.kind).toBe('journal')
  })

  it('files the same thing once, however many times it is found', () => {
    // A visitor can walk back into a room and press the same thing again.
    state().record(lamp)
    state().dismissToast()
    state().record(lamp)
    state().record(lamp)
    expect(state().entries).toHaveLength(1)
    expect(state().toast).toBeNull()
  })

  it('keeps entries in the order they were found in', () => {
    state().record(lamp)
    state().record({ ...lamp, id: 'second', title: 'Another' })
    expect(state().entries.map((e) => e.id)).toEqual([
      'lighthouse-lamp',
      'second',
    ])
  })

  it('opens and shuts on the journal', () => {
    state().start()
    state().openJournal()
    expect(state().mode).toBe('journal')
    state().closeJournal()
    expect(state().mode).toBe('explore')
  })
})

describe('the toast', () => {
  it('can be dismissed', () => {
    state().record({ id: 'a', title: 'A', body: 'b', source: 's' })
    expect(state().toast).not.toBeNull()
    state().dismissToast()
    expect(state().toast).toBeNull()
  })
})

describe('the keyring', () => {
  const first = KEYS[0]

  it('takes a key and says which one it is', () => {
    state().takeKey(first.id)
    expect(state().keys[first.id]).toBe(true)
    expect(state().toast?.kind).toBe('key')
  })

  it('takes a key only once', () => {
    state().takeKey(first.id)
    state().dismissToast()
    state().takeKey(first.id)
    expect(state().toast).toBeNull()
  })

  it('ignores a key the island has not got', () => {
    state().takeKey('a-key-that-does-not-exist')
    expect(Object.keys(state().keys)).toHaveLength(0)
  })

  it('finishes the mission the key belonged to', () => {
    const mission = MISSIONS.find((m) => m.keyId)
    if (!mission?.keyId) return
    state().activateMission(mission.id)
    state().takeKey(mission.keyId)
    expect(state().missions[mission.id]).toBe('done')
  })
})

describe('the missions', () => {
  const mission = MISSIONS[0]

  it('starts one and says what it is', () => {
    state().activateMission(mission.id)
    expect(state().missions[mission.id]).toBe('active')
    expect(state().toast?.kind).toBe('mission')
  })

  it('starts one only once', () => {
    state().activateMission(mission.id)
    state().dismissToast()
    state().activateMission(mission.id)
    expect(state().toast).toBeNull()
  })

  it('ignores a mission the island has not got', () => {
    state().activateMission('no-such-mission')
    expect(state().missions['no-such-mission']).toBeUndefined()
  })
})

describe('the secrets', () => {
  it('lets one out, with the card that announces it', () => {
    state().revealSecret('the-switch', {
      title: 'A switch',
      body: 'Behind the shelf.',
    })
    expect(state().secrets['the-switch']).toBe(true)
    expect(state().toast?.title).toBe('A switch')
  })

  it('keeps its counsel from the second time on', () => {
    // The shelf only stands open for the visit it was opened on, so this
    // happens again on a later visit — and says nothing the second time.
    state().revealSecret('the-switch', { title: 'A switch', body: 'Behind.' })
    state().dismissToast()
    state().revealSecret('the-switch', { title: 'A switch', body: 'Behind.' })
    expect(state().toast).toBeNull()
    expect(state().secrets['the-switch']).toBe(true)
  })
})

describe('discovering the island', () => {
  it('remembers a building once it has been found', () => {
    state().discover('lighthouse')
    expect(state().discovered.lighthouse).toBe(true)
  })

  it('does not re-find what is already found', () => {
    state().discover('lighthouse')
    const was = state().discovered
    state().discover('lighthouse')
    expect(state().discovered).toBe(was)
  })
})

describe('what is on the screen', () => {
  beforeEach(() => {
    state().start()
  })

  it('opens a panel and comes back to exploring', () => {
    state().openPanel({
      kicker: 'Work',
      title: 'A job',
      sections: [],
      accent: '#fff',
      kind: 'board',
    })
    expect(state().mode).toBe('panel')
    state().closePanel()
    expect(state().mode).toBe('explore')
  })

  it('opens a conversation and comes back to exploring', () => {
    state().talk({ speaker: 'Somebody', lines: ['One line.'] })
    expect(state().mode).toBe('dialogue')
    state().closeDialogue()
    expect(state().mode).toBe('explore')
  })

  it('works through the pages of a conversation', () => {
    state().talk({ speaker: 'Somebody', lines: ['One.', 'Two.'] })
    expect(state().dialogue?.page).toBe(0)
    state().advance()
    expect(state().dialogue?.page).toBe(1)
  })

  it('closes a conversation by advancing past its last line', () => {
    state().talk({ speaker: 'Somebody', lines: ['Only line.'] })
    state().advance()
    expect(state().mode).toBe('explore')
  })

  it('opens and shuts the map', () => {
    state().openMap()
    expect(state().mode).toBe('map')
    state().closeMap()
    expect(state().mode).toBe('explore')
  })

  it('opens and shuts the greeting card', () => {
    state().openGreeting()
    expect(state().mode).toBe('greeting')
    state().closeGreeting()
    expect(state().mode).toBe('explore')
  })
})

describe('the settings', () => {
  it('turns the sound off and on', () => {
    const was = state().muted
    state().toggleMute()
    expect(state().muted).toBe(!was)
  })

  it('turns the music off and on', () => {
    const was = state().musicOn
    state().toggleMusic()
    expect(state().musicOn).toBe(!was)
  })

  it('takes a quality by hand', () => {
    state().setQuality('low')
    expect(state().quality).toBe('low')
    state().setQuality('high')
    expect(state().quality).toBe('high')
  })

  it('keeps the levels inside their range, whatever it is handed', () => {
    state().setMusicLevel(-10)
    expect(state().musicLevel).toBeGreaterThanOrEqual(0)
    state().setMusicLevel(9999)
    expect(state().musicLevel).toBeLessThanOrEqual(5)
    state().setSfxLevel(-10)
    expect(state().sfxLevel).toBeGreaterThanOrEqual(0)
    state().setSfxLevel(9999)
    expect(state().sfxLevel).toBeLessThanOrEqual(5)
  })

  it('changes language', () => {
    state().setLocale('el')
    expect(state().locale).toBe('el')
    state().setLocale('en')
    expect(state().locale).toBe('en')
  })

  it('remembers the choices for the next visit', () => {
    state().setLocale('el')
    state().setQuality('low')
    const saved = localStorage.getItem('island.settings')
    expect(saved).not.toBeNull()
    expect(JSON.parse(saved!)).toMatchObject({ locale: 'el', quality: 'low' })
  })

  it('does not interrupt the visit when site data cannot be written', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota')
    })
    expect(() => state().setLocale('el')).not.toThrow()
    expect(state().locale).toBe('el')
  })
})

describe('the calendar on the basement wall', () => {
  it('reads his birthday until somebody turns it', () => {
    expect(state().calendar).toEqual(BIRTHDAY)
  })

  it('can be turned to another day', () => {
    state().setCalendar({ day: 1, month: 1 })
    expect(state().calendar).toEqual({ day: 1, month: 1 })
  })

  it('drags a day that does not exist into its month', () => {
    state().setCalendar({ day: 31, month: 2 })
    expect(state().calendar.day).toBeLessThanOrEqual(29)
  })

  it('decorates the house on the one day that does', () => {
    state().setCalendar(FEAST)
    expect(state().christmas).toBe(true)
    state().setCalendar(BIRTHDAY)
    expect(state().christmas).toBe(false)
  })

  it('goes back on its nail', () => {
    state().setCalendar(FEAST)
    state().resetCalendar()
    expect(state().calendar).toEqual(BIRTHDAY)
  })
})

describe('the night', () => {
  it('turns the lights on and off', () => {
    const was = state().night
    state().toggleNight()
    expect(state().night).toBe(!was)
  })
})

describe('what the visit remembers between sessions', () => {
  it('writes a save once something has been found', () => {
    state().record({ id: 'a', title: 'A', body: 'b', source: 's' })
    expect(localStorage.getItem('island.progress')).not.toBeNull()
  })

  it('keeps nothing in site data before anything has happened', () => {
    expect(localStorage.getItem('island.progress')).toBeNull()
  })

  it('forgets the visit when asked, and puts the island back', () => {
    state().record({ id: 'a', title: 'A', body: 'b', source: 's' })
    state().takeKey(KEYS[0].id)
    state().clearProgress()
    expect(state().entries).toEqual([])
    expect(Object.keys(state().keys)).toHaveLength(0)
    expect(localStorage.getItem('island.progress')).toBeNull()
  })

  it('leaves the settings alone when the island is cleared', () => {
    // Somebody clearing the island they walked is not asking to have the
    // volume turned back up.
    state().setLocale('el')
    state().setMusicLevel(1)
    state().record({ id: 'a', title: 'A', body: 'b', source: 's' })
    state().clearProgress()
    expect(state().locale).toBe('el')
    expect(state().musicLevel).toBe(1)
  })
})

describe('getting into the lift and out of it', () => {
  /**
   * The ride used to be watched from the corridor: the panel came up while he
   * stood outside, the doors shut on an empty shaft, and the far floor
   * arrived by teleport. What these hold on to is that he is walked in and
   * walked out — and walked, not spawned, because a spawn draws a curtain
   * over the screen and hides the one step that explains the ride.
   */
  const CAR = 'work-lift'

  function car(room: string) {
    const interior = INTERIORS.find((r) => r.id === room)!
    return (interior.links ?? []).find((l) => l.kind === 'lift')!
  }

  function callIt(room = 'work') {
    const link = car(room)
    useGame.getState().callLift({
      linkId: link.id,
      room,
      floor: link.floor ?? 0,
      stops: link.serves ?? [],
    })
  }

  it('walks him into the car rather than spawning him there', () => {
    const before = useGame.getState().spawn.token
    callIt()

    const { stride, spawn } = useGame.getState()
    expect(stride?.to).toEqual(
      liftStance(
        car('work'),
        INTERIORS.find((r) => r.id === 'work'),
      ).inside,
    )
    /* No curtain over a step taken in the room he is standing in. */
    expect(spawn.token).toBe(before)
  })

  it('walks him back out again when he presses nothing', () => {
    callIt()
    useGame.getState().leaveLift()

    const { stride, mode } = useGame.getState()
    expect(mode).toBe('explore')
    expect(stride?.to).toEqual(
      liftStance(
        car('work'),
        INTERIORS.find((r) => r.id === 'work'),
      ).outside,
    )
  })

  it('leaves nothing walking him once he is in the car and moving', () => {
    callIt()
    useGame
      .getState()
      .pressFloor({ floor: 2, label: 'x', to: 'work-veltiston' })

    /* He is already inside; a leftover step would drag him through a door. */
    expect(useGame.getState().stride).toBeNull()
    expect(useGame.getState().lift?.linkId).toBe(CAR)
  })

  it('drops a pending step when a teleport overrules it', () => {
    callIt()
    expect(useGame.getState().stride).not.toBeNull()

    useGame.getState().goRoom('work-ibm', [0, 0])
    expect(useGame.getState().stride).toBeNull()
  })

  it('forgets the step once it has been walked', () => {
    callIt()
    useGame.getState().endStride()
    expect(useGame.getState().stride).toBeNull()
  })

  it('puts him down outside the car when the car arrives', () => {
    callIt()
    useGame
      .getState()
      .pressFloor({ floor: 2, label: 'x', to: 'work-veltiston' })

    const dest = INTERIORS.find((r) => r.id === 'work-veltiston')!
    const { at } = liftArrival(dest, 'work', car('work'))
    useGame.getState().arriveLift(at)

    const { area, spawn } = useGame.getState()
    expect(area).toBe('work-veltiston')
    /* Out in the room, not still standing in the shaft. */
    expect(spawn.position).toEqual(
      liftStance(
        car('work-veltiston'),
        INTERIORS.find((r) => r.id === 'work-veltiston'),
      ).outside,
    )
  })

  it('keeps the ride on the store while the doors are still opening', () => {
    /*
     * The arrival changes the room under shut doors; the ride has to outlive
     * it, because the far floor's leaves are drawn from it. Clearing it here
     * is what used to leave them mounting already wide.
     */
    callIt()
    useGame
      .getState()
      .pressFloor({ floor: 2, label: 'x', to: 'work-veltiston' })

    const dest = INTERIORS.find((r) => r.id === 'work-veltiston')!
    const { at } = liftArrival(dest, 'work', car('work'))
    useGame.getState().arriveLift(at)

    expect(useGame.getState().lift).not.toBeNull()
    /* And the controls are still the car's until the doors are wide. */
    expect(useGame.getState().mode).toBe('lift')
  })

  it('hands the controls back only once the doors have opened', () => {
    callIt()
    useGame
      .getState()
      .pressFloor({ floor: 2, label: 'x', to: 'work-veltiston' })

    const dest = INTERIORS.find((r) => r.id === 'work-veltiston')!
    const { at } = liftArrival(dest, 'work', car('work'))
    useGame.getState().arriveLift(at)
    useGame.getState().endLift()

    const { lift, mode, area } = useGame.getState()
    expect(lift).toBeNull()
    expect(mode).toBe('explore')
    /* And he stayed where the arrival put him. */
    expect(area).toBe('work-veltiston')
  })

  it('arrives once, however many frames call it', () => {
    /* Two frames in flight at the stop must not bump the spawn token twice
       and re-teleport him to the doors he has already stepped out of. */
    callIt()
    useGame
      .getState()
      .pressFloor({ floor: 2, label: 'x', to: 'work-veltiston' })

    const dest = INTERIORS.find((r) => r.id === 'work-veltiston')!
    const { at } = liftArrival(dest, 'work', car('work'))
    useGame.getState().arriveLift(at)
    const once = useGame.getState().spawn.token
    useGame.getState().arriveLift(at)
    expect(useGame.getState().spawn.token).toBe(once)
  })
})

/**
 * The launch: the suit that gates it, the flight that cannot be interrupted,
 * and the shirt he comes home in.
 *
 * Two rules the rest of the island assumes. The first is that the button does
 * nothing until he has been to the rack — the walk across the room is the
 * whole of the ceremony, and skipping it would make the deck a checkbox. The
 * second is that while he is up there the game is sealed: every other screen
 * on the island can be backed out of sideways, and this one has exactly one
 * door, which is the ride home.
 */
describe('the launch', () => {
  /** On the deck with the walk his, which is where the button is pressed. */
  const onDeck = () => {
    useGame.setState({ area: 'lighthouse', mode: 'explore' })
  }

  /** On the deck and dressed for it: what the button actually answers. */
  const suited = () => {
    onDeck()
    useGame.getState().toggleSuit()
  }

  it('will not go up in shirtsleeves', () => {
    onDeck()
    useGame.getState().beginLaunch()

    expect(useGame.getState().launch).toBeNull()
    expect(useGame.getState().mode).toBe('explore')
    /* And it says why, rather than simply not answering. */
    expect(useGame.getState().toast).not.toBeNull()
  })

  it('puts the suit on at the rack, and takes it off again', () => {
    onDeck()
    useGame.getState().toggleSuit()
    expect(useGame.getState().suited).toBe(true)
    expect(useGame.getState().outfit).toBe('spacesuit')

    useGame.getState().toggleSuit()
    expect(useGame.getState().suited).toBe(false)
    expect(useGame.getState().outfit).toBe('islander')
  })

  it('only hands out the suit on the deck', () => {
    useGame.setState({ area: 'island', mode: 'explore' })
    useGame.getState().toggleSuit()
    expect(useGame.getState().suited).toBe(false)
  })

  it('is only offered from the deck', () => {
    useGame.setState({ area: 'island', mode: 'explore', suited: true })
    useGame.getState().beginLaunch()
    expect(useGame.getState().launch).toBeNull()
    expect(useGame.getState().mode).toBe('explore')
  })

  it('starts the count and takes the walk away', () => {
    suited()
    useGame.getState().beginLaunch()

    const { launch, mode } = useGame.getState()
    expect(launch).not.toBeNull()
    expect(launch?.arrived).toBe(false)
    expect(mode).toBe('launch')
    /* Nothing is left on the screen to click through mid-count. */
    expect(useGame.getState().nearby).toBeNull()
    expect(useGame.getState().panel).toBeNull()
    expect(useGame.getState().dialogue).toBeNull()
  })

  it('cannot be started twice', () => {
    suited()
    useGame.getState().beginLaunch()
    const first = useGame.getState().launch
    useGame.getState().beginLaunch()
    /* The same flight, not a second one that restarts the clock. */
    expect(useGame.getState().launch).toBe(first)
  })

  it('reaches orbit once, however many frames call it', () => {
    suited()
    useGame.getState().beginLaunch()
    useGame.getState().reachOrbit()

    const arrived = useGame.getState().launch
    expect(arrived?.arrived).toBe(true)
    expect(useGame.getState().mode).toBe('orbit')

    useGame.getState().reachOrbit()
    expect(useGame.getState().launch).toBe(arrived)
  })

  it('does not reach orbit without a flight', () => {
    useGame.getState().reachOrbit()
    expect(useGame.getState().launch).toBeNull()
    expect(useGame.getState().mode).not.toBe('orbit')
  })

  it('remembers across visits that the ship has flown', () => {
    suited()
    useGame.getState().beginLaunch()
    expect(useGame.getState().launched).toBe(true)
  })

  it('is forgotten, like everything else, when the island is cleared', () => {
    suited()
    useGame.getState().beginLaunch()
    useGame.getState().clearProgress()

    expect(useGame.getState().launched).toBe(false)
    expect(useGame.getState().launch).toBeNull()
    expect(useGame.getState().starShirt).toBe(false)
    expect(useGame.getState().outfit).toBe('islander')
  })
})

describe('coming home', () => {
  const flown = () => {
    useGame.setState({ area: 'lighthouse', mode: 'explore' })
    useGame.getState().toggleSuit()
    useGame.getState().beginLaunch()
    useGame.getState().reachOrbit()
  }

  it('will not land a flight that has not arrived', () => {
    useGame.setState({ area: 'lighthouse', mode: 'explore' })
    useGame.getState().toggleSuit()
    useGame.getState().beginLaunch()
    /* Still climbing: there is nothing to step out of yet. */
    useGame.getState().flyHome()
    expect(useGame.getState().mode).toBe('launch')
  })

  it('puts him down in the middle of the island', () => {
    flown()
    useGame.getState().flyHome()

    const { area, mode, spawn, launch } = useGame.getState()
    expect(area).toBe('island')
    expect(mode).toBe('explore')
    expect(spawn.position).toEqual([...PLAYER_START])
    /* The flight is over rather than merely finished. */
    expect(launch).toBeNull()
  })

  it('takes the suit off and leaves the shirt on', () => {
    flown()
    useGame.getState().flyHome()

    expect(useGame.getState().suited).toBe(false)
    expect(useGame.getState().starShirt).toBe(true)
    expect(useGame.getState().outfit).toBe('star')
  })

  it('lets him change back out of the shirt, and into it again', () => {
    flown()
    useGame.getState().flyHome()

    useGame.getState().wearStarShirt(false)
    expect(useGame.getState().outfit).toBe('islander')
    useGame.getState().wearStarShirt(true)
    expect(useGame.getState().outfit).toBe('star')
  })

  it('does not offer the shirt to somebody who has not earned it', () => {
    useGame.getState().wearStarShirt(true)
    expect(useGame.getState().outfit).toBe('islander')
  })

  it('leaves the island walkable again', () => {
    flown()
    useGame.getState().flyHome()
    /* The seal is off: the ordinary screens answer once more. */
    useGame.getState().openMap()
    expect(useGame.getState().mode).toBe('map')
  })
})

/**
 * The skip-ahead card, and the line it must not cross.
 *
 * Nothing a recruiter needs is locked away, so the greeting hands over the
 * whole CV on request. What it must not do is hand over the island with it:
 * the lighthouse is the reward for walking the place, and opening its door
 * for somebody who has just said they would rather not is the one way to
 * make that reward mean nothing.
 */
describe('unlocking the CV', () => {
  it('hands over the CV', () => {
    useGame.getState().unlockCv()

    expect(useGame.getState().cvUnlocked).toBe(true)
    expect(useGame.getState().mode).toBe('panel')
    expect(useGame.getState().panel?.kind).toBe('cv')
  })

  it('does not open the lighthouse with it', () => {
    useGame.getState().unlockCv()

    /* The door stays shut, the keyring quest stays unfinished, and the
       arcade's locked game stays locked. */
    expect(useGame.getState().lighthouseOpen).toBe(false)
  })

  it('leaves the keys still worth finding', () => {
    useGame.getState().unlockCv()

    const objective = nextObjective(useGame.getState())
    /* Still pointing at the hunt rather than at nothing. */
    expect(objective).not.toBeNull()
  })
})

/**
 * The credits, and the one thing they gate.
 *
 * The certificate is the end of the game and so is the roll, so the card
 * waits for it: throwing the certificate up over the first title card is how
 * you make sure nobody reads either.
 */
describe('the credits', () => {
  const inOrbit = () => {
    useGame.setState({ area: 'lighthouse', mode: 'explore' })
    useGame.getState().toggleSuit()
    useGame.getState().beginLaunch()
    useGame.getState().reachOrbit()
  }

  it('start the moment the engines cut', () => {
    inOrbit()
    expect(useGame.getState().credits).toBe(true)
  })

  it('end when the roll says so, and only once', () => {
    inOrbit()
    useGame.getState().endCredits()
    expect(useGame.getState().credits).toBe(false)

    /* A second call from a frame still in flight changes nothing. */
    useGame.getState().endCredits()
    expect(useGame.getState().credits).toBe(false)
  })

  it('leave him in orbit rather than handing the island back', () => {
    inOrbit()
    useGame.getState().endCredits()
    /* The roll finishing is not the flight finishing: only flyHome is. */
    expect(useGame.getState().mode).toBe('orbit')
    expect(useGame.getState().launch?.arrived).toBe(true)
  })

  it('are over once he lands, however far they got', () => {
    inOrbit()
    /* Flying home mid-roll must not leave the credits playing over the
       island he has just landed on. */
    useGame.getState().flyHome()
    expect(useGame.getState().credits).toBe(false)
  })
})
