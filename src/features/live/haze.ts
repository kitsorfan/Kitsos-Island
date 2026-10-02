import { useMemo } from 'react'
import { Color } from 'three'
import { useGame } from '../../shared/state/store'
import { conditionsOf, gloom } from './weatherLogic'
import type { Conditions } from './weatherLogic'

/**
 * The weather as the scene reads it, and the colour of the air in it.
 *
 * The sky, the sea and the fog are three different materials, and they only
 * look like one piece of weather if they all go the same grey. So the grey
 * is worked out here, once, and the three of them ask for it.
 */

/** The weather on the island now: fair whenever Live is off. */
export function useConditions(): Conditions {
  const weather = useGame((s) => s.weather)
  return useMemo(() => conditionsOf(weather), [weather])
}

/** A bright overcast: the colour of a sky that is all cloud at noon. */
const PALE = new Color('#c3cbd3')
/** The underside of a thunderstorm. */
const DARK = new Color('#69717b')
/** The night's own haze, which <Daylight/> has always used. */
const NIGHT = new Color('#0b1a2e')

/** The colour the air goes when there is weather in it. */
export function hazeColor(weather: Conditions, night: boolean): Color {
  if (night) return NIGHT.clone()
  return PALE.clone().lerp(DARK, gloom(weather))
}

/**
 * How much the weather thickens the air, as a fogExp2 density, on top of
 * whatever haze the sky keeps of its own.
 *
 * Steep, because the camera stands only some twenty-five metres off him:
 * a density that hides the far side of the island does nothing at all
 * there, and fog that does not swallow the next street is not fog. Rain
 * gets a haze you see across the plaza, and fog gets fog.
 */
export function weatherHaze(weather: Conditions): number {
  const thick = weather.fog
  return thick * 0.012 + thick * thick * 0.022
}
