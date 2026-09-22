/**
 * Which model stands on which plot.
 *
 * It lives apart from the models themselves so that Models.tsx exports nothing
 * but components, which is what Vite's fast refresh asks for: one non-component
 * export in that file and every model in it reloads by remounting the island.
 */
import type { ReactElement } from 'react'
import type { BuildingKind } from '../../../types'
import {
  ArmyModel,
  HouseModel,
  LighthouseModel,
  RadioModel,
  SchoolModel,
  UniversityModel,
  WorkModel,
} from './Models'

export const BUILDING_MODELS: Record<BuildingKind, () => ReactElement> = {
  lighthouse: LighthouseModel,
  house: HouseModel,
  university: UniversityModel,
  work: WorkModel,
  army: ArmyModel,
  school: SchoolModel,
  radio: RadioModel,
}
