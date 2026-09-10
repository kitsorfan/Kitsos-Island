export type Vec2 = [number, number]

/** Where an actor or pickup lives: the island, or a building interior. */
export type AreaId = 'island' | string

/** One letter of reference, collapsed until clicked. */
export interface Letter {
  id: string
  /** Who wrote it. */
  from: string
  /** Their standing, and how they know him. */
  role: string
  /** Date, language, and the relationship in one line. */
  note: string
  paragraphs: string[]
  /**
   * Scans of the original, as filenames inside `public/letters/`. Any that are
   * missing simply do not render, so the transcript stands on its own.
   */
  scans?: string[]
}

export type PanelBlock =
  | { type: 'text'; text: string }
  | { type: 'letters'; letters: Letter[] }
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
  'house' | 'university' | 'work' | 'army' | 'school' | 'radio' | 'lighthouse'

export interface Building {
  id: string
  kind: BuildingKind
  /** Sign shown above the door. */
  name: string
  subtitle: string
  /** Short label for the map. */
  short: string
  /** Centre of the footprint on the XZ plane. */
  position: Vec2
  /** Where the player stands to enter. */
  door: Vec2
  /** Axis-aligned half-extents used for collision. */
  half: Vec2
  /** Y-rotation of the model; the door always faces the plaza. */
  rotation: number
  /** Uniform scale applied to the model. */
  scale: number
  /** Rough silhouette height, used for camera occlusion. */
  height: number
  accent: string
  /** Number of keys needed before the door opens, if it is locked. */
  locksWith?: number
  /**
   * Shuts when the lamps come on. These are the lines the door itself gives
   * you; there is somebody left on the gate to say more.
   */
  closesAtNight?: string[]
  /** Soldiers on the gate rather than a dark lobby: they whistle you back. */
  sentries?: boolean
}

/** What the player can carry in his off hand after dark, or nothing. */
export type HandLight = 'torch' | 'flashlight'
export type Carried = HandLight | 'none'

/* ------------------------------ people ----------------------------- */

export interface Npc {
  id: string
  name: string
  role: string
  /** Island, or the id of the building whose interior they stand in. */
  area: AreaId
  position: Vec2
  /** Y-rotation in radians the NPC idles at. */
  facing: number
  colors: { skin: string; hair: string; shirt: string; pants: string }
  /** One page of dialogue per entry. */
  lines: string[]
  /** Omitted for ambient townsfolk, who do not count toward the journal. */
  journal?: { title: string; body: string }
  /** Optional accessory rendered on the character. */
  prop?: 'cap' | 'beret' | 'headset' | 'glasses' | 'hardhat' | 'bag' | 'flowers'
  /** Waypoints this NPC strolls between; they stop when you come close. */
  route?: Vec2[]
  /** Units per second along the route. */
  pace?: number
  /** Mission this character hands out when you talk to them. */
  gives?: string
  /** Extra dialogue once their mission is active but unfinished. */
  missionLines?: string[]
  /**
   * When they are out. Left off, they are there whatever the hour; a night
   * shift only appears once the lamps are on, and does not stop for a party.
   */
  shift?: 'day' | 'night'
  /** Carried in the off hand, for anyone working in the dark. */
  hand?: HandLight
}

export interface SignPost {
  id: string
  position: Vec2
  facing: number
  label: string
  lines: string[]
}

/* ----------------------------- missions ---------------------------- */

export interface KeyItem {
  id: string
  name: string
  /** Building whose interior hides it. */
  buildingId: string
  color: string
}

export interface Mission {
  id: string
  title: string
  /** Building the mission sends you to. */
  buildingId: string
  keyId: string
  /** Shown before you have spoken to the giver. */
  brief: string
  /** Shown once the mission is active — says where to look. */
  hint: string
  /** Shown in the log once the key is in hand. */
  done: string
}

/* ---------------------------- interiors ---------------------------- */

export type PropKind =
  | 'desk'
  | 'chair'
  | 'bookshelf'
  | 'locker'
  | 'bunk'
  | 'monitor'
  | 'serverRack'
  | 'rug'
  | 'plant'
  | 'whiteboard'
  | 'crate'
  | 'table'
  | 'sofa'
  | 'bed'
  | 'counter'
  | 'pillar'
  | 'lamp'
  | 'schoolDesk'
  | 'blackboard'
  | 'kitchen'
  | 'console'
  | 'stove'
  | 'weightBench'
  | 'sandbag'
  | 'globe'
  | 'painting'
  | 'stairs'
  | 'chessTable'
  | 'greekFlag'
  | 'lectern'
  /* Downstairs: the garage, the lab, the library and the playroom. */
  | 'car'
  | 'bicycle'
  | 'workbench'
  | 'pegboard'
  | 'toolChest'
  | 'shelfUnit'
  | 'boiler'
  | 'longTable'
  | 'photoWall'
  | 'shutter'
  | 'armchair'
  | 'tv'
  | 'beanbag'
  | 'poster'

export interface InteriorProp {
  kind: PropKind
  position: Vec2
  rotation?: number
  scale?: number
  color?: string
  /** Set false for low props you should be able to walk over. */
  solid?: boolean
}

export type ExhibitKind =
  | 'board'
  | 'terminal'
  | 'case'
  | 'key'
  | 'radio'
  /** Opens the summary panel and offers a generated CV download. */
  | 'cv'

export interface Exhibit {
  id: string
  kind: ExhibitKind
  /** Prompt shown when you stand next to it. */
  label: string
  position: Vec2
  rotation?: number
  /** Panel opened on interaction. */
  panel?: { kicker: string; title: string; sections: PanelSection[] }
  /** Dialogue shown instead of a panel. */
  lines?: string[]
  /** For kind 'key': which key this hands over. */
  keyId?: string
  /** Journal entry filed the first time you use it. */
  journal?: { title: string; body: string }
  /**
   * Lets a secret out the first time it is examined, which is what opens an
   * `InteriorLink` that needs one: the shelf tells you it is a door.
   */
  reveals?: { id: string; title: string; body: string }
}

/**
 * A way from one room to another inside the same building: the stairs to the
 * cellar, the door nobody has the key to, the shelf that turns out to swing.
 */
export interface InteriorLink {
  id: string
  /** Prompt shown when you stand at it. */
  label: string
  position: Vec2
  rotation?: number
  kind: 'stairsDown' | 'stairsUp' | 'door' | 'hatch' | 'locked'
  /** Area it opens onto, and where you arrive in it. */
  to?: string
  arrive?: Vec2
  /** What it says when it does not open, or on the way through. */
  lines?: string[]
  /**
   * Stays shut until this secret has been let out — the id passed to
   * `revealSecret`. Until then it is furniture.
   */
  needs?: string
  /** Journal entry filed the first time it opens. */
  journal?: { title: string; body: string }
}

export interface Interior {
  /** Same id as the building it belongs to. */
  id: string
  name: string
  kicker: string
  /**
   * The building on the island this room sits inside, for rooms that are not
   * the one behind the front door. Defaults to the room's own id, and is what
   * puts the player back on the right doorstep from two floors down.
   */
  building?: string
  /** Half-extents of the room, walls sit on the boundary. */
  half: Vec2
  floor: string
  rug: string
  wall: string
  accent: string
  /** Where you appear when you walk in, just inside the door. */
  spawn: Vec2
  props: InteriorProp[]
  exhibits: Exhibit[]
  /** Stairs and doors to other rooms of the same building. */
  links?: InteriorLink[]
  /**
   * Where the way out leads, for a room with no front door of its own. Left
   * off, it steps straight outside onto the island.
   */
  exit?: { to: string; arrive: Vec2; label: string }
  /**
   * Windows punched through the walls, as a fraction along each side from its
   * middle. They light the room and give it an outside.
   */
  windows?: { side: 'north' | 'east' | 'west'; at: number }[]
  /** No windows down here: a cellar is lit by what is screwed to the joists. */
  underground?: boolean
}
