/**
 * @vitest-environment jsdom
 *
 * The whole flight, driven through the real store on a clock the test owns:
 * button, count, burn, climb, orbit. It is here rather than in store.test.ts
 * because what it checks is the store and `launchPhase` agreeing — the seam
 * the two unit suites each stop short of.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGame } from '../../shared/state/store'
import { HOLD, LAUNCH_TOTAL, launchPhase } from './launch'

vi.mock('../../shared/engine/audio', async () => {
  const actual = await vi.importActual<
    typeof import('../../shared/engine/audio')
  >('../../shared/engine/audio')
  return new Proxy(actual, {
    get(target, prop) {
      const real = Reflect.get(target, prop)
      return typeof real === 'function' ? vi.fn() : real
    },
  })
})

const PRISTINE = useGame.getState()

beforeEach(() => {
  localStorage.clear()
  useGame.setState(PRISTINE, true)
})

describe('a whole flight', () => {
  it('runs from the button to the certificate', () => {
    useGame.setState({ area: 'lighthouse', mode: 'explore' })

    /* The rack, then the button: in that order, which is the point of it. */
    useGame.getState().toggleSuit()
    useGame.getState().beginLaunch()
    const launch = useGame.getState().launch!
    expect(useGame.getState().mode).toBe('launch')

    /*
     * The count, read the way the overlay reads it.
     *
     * Every instant below is offset off `launch.started` rather than off a
     * fresh clock reading, and the stage boundaries are crossed rather than
     * landed on exactly. `beginLaunch` stamps `started` from
     * `performance.now()`, so a boundary tested at precisely `started + HOLD`
     * sits on the knife edge between two stages and answers 'hold' or
     * 'ignition' depending on nothing at all.
     */
    const started = launch.started
    expect(launchPhase(launch, started).count).toBe(HOLD)
    expect(launchPhase(launch, started + HOLD - 0.1).stage).toBe('hold')
    expect(launchPhase(launch, started + HOLD + 0.1).stage).toBe('ignition')

    /* Mid-climb the deck is still shaking and he is off the ground. */
    const mid = launchPhase(launch, started + HOLD + 6)
    expect(mid.altitude).toBeGreaterThan(0)
    expect(useGame.getState().mode).toBe('launch')

    /* The climb ends, and the overlay calls it in. */
    expect(launchPhase(launch, started + LAUNCH_TOTAL).arrived).toBe(true)
    useGame.getState().reachOrbit()

    expect(useGame.getState().mode).toBe('orbit')
    expect(useGame.getState().launch?.arrived).toBe(true)
    expect(useGame.getState().launched).toBe(true)
  })

  it('has exactly one door out of it, and this is not it', () => {
    useGame.setState({ area: 'lighthouse', mode: 'explore' })
    useGame.getState().toggleSuit()
    useGame.getState().beginLaunch()
    useGame.getState().reachOrbit()

    /*
     * The ways off every other screen on the island, tried in turn. None of
     * them may hand the walk back sideways: the flight ends by the ride
     * home or it does not end at all.
     */
    const escapes = [
      () => useGame.getState().closePanel(),
      () => useGame.getState().closeJournal(),
      () => useGame.getState().closeMap(),
      () => useGame.getState().leaveBuilding(),
      () => useGame.getState().endLift(),
    ]
    for (const escape of escapes) {
      escape()
      expect(useGame.getState().mode).toBe('orbit')
    }

    /* And the one that is the door. */
    useGame.getState().flyHome()
    expect(useGame.getState().mode).toBe('explore')
    expect(useGame.getState().area).toBe('island')
  })
})
