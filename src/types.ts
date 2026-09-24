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

/** The flags `PanelBlock` can draw. Each one has a case in `Flag`. */
export type FlagCode = 'gr' | 'cy' | 'de' | 'fr' | 'it' | 'ch'

export type PanelBlock =
  | { type: 'text'; text: string }
  | { type: 'letters'; letters: Letter[] }
  | { type: 'quote'; text: string }
  | { type: 'list'; items: string[] }
  /**
   * A list of countries, each with its flag drawn beside it.
   *
   * Drawn rather than typed: the flag emoji are pairs of regional-indicator
   * letters, and Windows renders those as the bare letter pairs — 'GR',
   * 'DE' — in every browser on it. An SVG of a few rectangles is the same
   * picture everywhere.
   */
  | { type: 'flags'; countries: { code: FlagCode; name: string }[] }
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
  /**
   * Sliding glass on a sensor: walking up to it is enough, and no prompt is
   * ever offered. Only while the door would have let you in anyway — a night
   * that shuts it, or a lock that has not been opened, still turns you away
   * at a press, because a refusal you did not ask for is a door that grabs
   * at you.
   */
  autoDoor?: boolean
}

/**
 * A dinner jacket over a white shirt, and what is worn at the throat of it.
 * Every man in the house is in one for Christmas dinner.
 */
export interface DinnerSuit {
  bowTie: string
  buttonhole: string
}

/** What the player can carry in his off hand after dark, or nothing. */
export type HandLight = 'torch' | 'flashlight'
export type Carried = HandLight | 'none'

/**
 * How much the island is allowed to spend on a frame.
 *
 * 'auto' measures and steps down on hardware that cannot keep up; the other
 * two are the visitor overriding that judgement in either direction.
 */
export type Quality = 'auto' | 'high' | 'low'

/* ------------------------------ people ----------------------------- */

/**
 * A question a character puts to you at the end of their lines, with the
 * answers on buttons. Get it right and they say `right` — and say it again
 * every time after, because the secret is out. Get it wrong and they say
 * `wrong`, and you can come back and try again.
 */
export interface Quiz {
  /** The secret let out by a right answer, which is also what settles it. */
  id: string
  question: string
  choices: { text: string; right?: boolean }[]
  right: string[]
  wrong: string[]
  /** Journal entry filed with the right answer. */
  journal?: { title: string; body: string }
}

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
  /** A question after their lines, and what a right answer buys. */
  quiz?: Quiz
  /**
   * When they are out. Left off, they are there whatever the hour; a night
   * shift only appears once the lamps are on, and does not stop for a party.
   */
  shift?: 'day' | 'night'
  /** Carried in the off hand, for anyone working in the dark. */
  hand?: HandLight
  /**
   * A child: the same figure built smaller, so height alone tells you who is
   * a grown-up across a green. Their chat bubble and journal marker are
   * raised back off the top of the head, which a bare scale would sink.
   */
  child?: boolean
  /** Worn down the back instead of the cropped default. */
  hair?: 'short' | 'long'
  /** A skirt in this colour over the legs, with a trim at the hem. */
  dress?: string
  dressTrim?: string
  /**
   * A tailored jacket in this colour, over a blouse. Office wear, as against
   * the `suit` that is only ever worn to Christmas dinner: it squares the
   * shoulders, and it straightens a `dress` into a pencil skirt rather than
   * leaving it the flared one the village wears.
   */
  blazer?: string
  /** The blouse under it. Off-white if not given. */
  blouse?: string
  /** A mouth, turned up. Reserved for the people he is glad to see. */
  smile?: boolean
  /** In a dinner jacket. Set for the day by `feastWear`, never otherwise. */
  suit?: DinnerSuit
  /**
   * Their place at the long table for the Christmas meal. Anybody with one
   * leaves their own room for that day and turns up in the basement instead,
   * standing about talking until the host calls the meal — see game/feast.ts,
   * which owns both halves of the day.
   */
  feast?: Vec2
  /** In the house for the meal and no other day: the in-laws. */
  feastOnly?: boolean
  /**
   * Their desk in the lecture hall for the thesis defence. Anybody with one
   * files in when he steps up to the lectern and leaves when he steps down —
   * see game/lecture.ts, which owns the whole of the defence.
   */
  lecture?: Vec2
  /** In the hall for the defence and at no other time: the class. */
  lectureOnly?: boolean
  /** What they say at the table, instead of what they say the rest of the year. */
  feastLines?: string[]
  /**
   * What they change into for it. Everybody in this family dresses for
   * Christmas dinner, so these are merged over their everyday colours on the
   * day and ignored every other one.
   */
  feastWear?: {
    shirt?: string
    pants?: string
    /** A skirt, for anyone in one. `shirt` is the bodice above it. */
    dress?: string
    dressTrim?: string
    /** A dinner jacket and a bow tie, for the men. */
    suit?: DinnerSuit
  }
}

export interface SignPost {
  id: string
  position: Vec2
  facing: number
  label: string
  lines: string[]
  /**
   * Filed the first time the board is read. Most signs are directions and
   * have none; one that is a landmark in its own right does.
   */
  journal?: { title: string; body: string }
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
  | 'toyBox'
  /* Out only on the twenty-fifth of December. */
  | 'fireplace'
  | 'christmasTree'
  | 'wreath'
  | 'garland'
  /* And this one only once the host has called the meal. */
  | 'feastTable'
  | 'shutter'
  | 'armchair'
  | 'tv'
  | 'beanbag'
  | 'poster'
  /* The shelf of toys in the library, one of which is a switch. */
  | 'toyShelf'

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
  /** The one on the basement wall. Says 8 April, and can be told otherwise. */
  | 'calendar'
  /**
   * The run of technology marks along a wall, grouped the way the CV groups
   * them. Flat against the wall like the calendar, so the room's margin keeps
   * you off it and there is nothing to walk into.
   */
  | 'techWall'
  /**
   * A thing already standing in the room as furniture — the toys on their
   * shelf. Draws nothing of its own: the prop is the object, and this only
   * puts a prompt and a halo on it.
   */
  | 'toy'
  /**
   * A piece of furniture already in the room that opens a panel and nothing
   * else — the globe in the corner at Evangeliki. Like 'toy' it draws
   * nothing of its own and is reached through a `hitbox` on the prop, but it
   * hides no puzzle, so it files its journal entry on the first look the way
   * every other exhibit does.
   */
  | 'prop'
  /**
   * The screen on the flight deck with everybody on the island on it. Its
   * panel draws the roster itself, from the world's own list of people.
   */
  | 'crew'

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
  /**
   * For kinds 'toy' and 'prop': where the thing you actually click sits, and
   * how big a target it is. `at` is in room coordinates like `position`, `y` is its
   * height off the floor, and `size` is the half-extent of the invisible box
   * the pointer has to hit. Without one a toy is only pressable from up close
   * with the keyboard; with one it can simply be clicked.
   */
  hitbox?: { at: Vec2; y: number; size: number }
}

/**
 * A way from one room to another inside the same building: the stairs to the
 * cellar, the door nobody has the key to, the shelf that turns out to swing.
 *
 * A 'lift' is the exception to the instant ones: walking into the car shuts
 * the doors and rides, and only then puts you out on the far floor. It needs a
 * `floor` so the indicator has a number to count to.
 *
 * Every one sits on a wall and is taken by walking into it. `position` is the
 * point on the wall and `rotation` turns its own +z to face into the room —
 * so 0 for the north wall, π for the south, π/2 for the west and -π/2 for the
 * east. Two rooms are joined by a link on each side pointing at the other:
 * going through one, you come out just inside the other, facing the room.
 */
export interface InteriorLink {
  id: string
  /** What it is, for the prompt on the one kind that has to be pressed. */
  label: string
  position: Vec2
  rotation?: number
  kind: 'stairsDown' | 'stairsUp' | 'door' | 'hatch' | 'locked' | 'lift'
  /** Area it opens onto. */
  to?: string
  /**
   * Where you arrive, if not just inside the matching link on the other side.
   * Only needed when the far room has no link pointing back here.
   */
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
  /**
   * For kind 'lift': the floor this car is standing on. The indicator counts
   * from here to the floor you press, so the ride takes as long as the number
   * of floors crossed.
   */
  floor?: number
  /**
   * For kind 'lift': the panel inside the car, from the ground floor up.
   * Every floor of the building appears, including the one you are already
   * standing on and the one nothing has been built on yet. The panel draws
   * them the other way round — top floor at the top — the way the building
   * actually stands.
   */
  serves?: LiftStop[]
}

/** One button on a lift panel. */
export interface LiftStop {
  /** The number on the button. */
  floor: number
  /** What that floor is, under the number. */
  label: string
  /** The years that floor covers, beside the name. Left off for the empty one. */
  when?: string
  /** The room it opens onto. Left off, the button is not wired to anything. */
  to?: string
  /** What the car says when a button with nowhere to go is pressed. */
  lines?: string[]
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
  /**
   * Where you appear when you walk in from the island, just inside the front
   * door. Rooms deeper in the building are entered through their links, and
   * only fall back on this if a link has nowhere better to put you.
   */
  spawn: Vec2
  props: InteriorProp[]
  /**
   * Dressing that only goes up when the calendar on the basement wall says
   * the twenty-fifth of December. Folded in on top of `props` for that day
   * alone, furniture and colliders together.
   */
  festive?: InteriorProp[]
  exhibits: Exhibit[]
  /**
   * Stairs and doors to other rooms of the same building. The front room is
   * the one without a `building`: it alone has a doorway in its south wall,
   * and that doorway leads outside. Every other room is reached, and left,
   * through these.
   */
  links?: InteriorLink[]
  /**
   * Windows punched through the walls, as a fraction along each side from its
   * middle. They light the room and give it an outside.
   */
  windows?: { side: 'north' | 'east' | 'west'; at: number }[]
  /** No windows down here: a cellar is lit by what is screwed to the joists. */
  underground?: boolean
}
