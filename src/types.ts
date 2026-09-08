export type Vec2 = [number, number]

export type PanelBlock =
  | { type: 'text'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'stats'; stats: { label: string; value: string }[] }
  | { type: 'tags'; groups: { label: string; tags: string[] }[] }
  | {
      type: 'timeline'
      entries: {
        title: string
        org?: string
        meta: string
        bullets?: string[]
        tags?: string[]
      }[]
    }

export interface PanelSection {
  heading: string
  blocks: PanelBlock[]
}

export type BuildingKind =
  | 'house'
  | 'university'
  | 'work'
  | 'army'
  | 'school'
  | 'radio'

export interface Building {
  id: string
  kind: BuildingKind
  /** Sign shown above the door. */
  name: string
  subtitle: string
  /** Centre of the footprint on the XZ plane. */
  position: Vec2
  /** Where the player stands to interact. */
  door: Vec2
  /** Axis-aligned half-extents used for collision. */
  half: Vec2
  /** Y-rotation of the model; the door always faces the plaza. */
  rotation: number
  /** Rough silhouette height, used for camera occlusion. */
  height: number
  accent: string
  panel: { title: string; kicker: string; sections: PanelSection[] }
}

export interface Npc {
  id: string
  name: string
  role: string
  position: Vec2
  /** Y-rotation in radians the NPC idles at. */
  facing: number
  colors: { skin: string; hair: string; shirt: string; pants: string }
  /** One page of dialogue per entry. */
  lines: string[]
  journal: { title: string; body: string }
  /** Optional accessory rendered on the character. */
  prop?: 'cap' | 'beret' | 'headset' | 'glasses' | 'hardhat'
}

export interface SignPost {
  id: string
  position: Vec2
  facing: number
  label: string
  lines: string[]
}
