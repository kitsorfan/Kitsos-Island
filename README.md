# Kitsos Island — a playable CV

A frontend-only 3D personal site for **Christos "Kitsos" Orfanopoulos**, built as a
Pokémon-style island you walk around. Townspeople tell you about him, seven
buildings open up and let you walk **inside**, five hidden keys unlock the Old
Lighthouse — which turns out to be a spaceship — and the Radio Center hands
your message straight to your own mail client.

No backend, no API keys, no runtime network calls beyond the Google Fonts
stylesheet — it deploys as static files anywhere.

## Stack

| Layer | Choice                                                 |
| ----- | ------------------------------------------------------ |
| Build | Vite 8 + TypeScript 6                                  |
| UI    | React 19                                               |
| 3D    | three.js · @react-three/fiber 9 · @react-three/drei 10 |
| State | Zustand 5                                              |
| Lint  | oxlint                                                 |
| Tests | Vitest 3 · Testing Library · jsdom                     |

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static bundle in dist/
npm run preview  # serve the built bundle
npm run lint
npm test         # the whole suite, once
npm run test:watch     # re-runs what a change touches
npm run test:coverage  # text summary, plus coverage/ for the full report
```

## Controls

| Action                  | Keyboard           | Touch                |
| ----------------------- | ------------------ | -------------------- |
| Move                    | `W A S D` / arrows | left stick           |
| Sprint                  | `Shift`            | —                    |
| Interact                | `E` / `Enter`      | `A` button           |
| Jump                    | `Space`            | `⤒` button           |
| Turn camera             | `Q` / `R`          | —                    |
| Map & fast travel       | `M`                | minimap / Map button |
| Journal                 | `J`                | `J` button           |
| Contact & full CV       | `C`                | Say hi button        |
| Music                   | `B`                | HUD button           |
| Sound                   | `N`                | HUD button           |
| Back / leave a building | `Esc`              | tap outside          |

## The island

Seven roads radiate from the town square. Each district building can be entered:
walking through the door swaps the world for a hand-built room full of exhibits,
people and — in five of them — a key.

| Place                            | Inside                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Kitsos House** (SW)            | Trainer card, languages, hobbies, the workbench · 🔑 Brass Key                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **NTUA Academy** (N)             | The lecture hall: the Dean, the degree, thesis and contests, published research, certifications, two academic references · 🔑 Lecture Hall Key. West door: the programming lab, the transcript and the Survival Guide. East door: the council room, the petition and the Independent movement                                                                                                                                                                                                                           |
| **Work District** (E)            | Three floors, one employer each, reached by stairs or by a lift that takes its time. Ground: capabilities, the certification wall, the jobs he held as an NTUA student and the Vice-President who gave him the first of them. First: IBM — the Cosmos Project at the National Bank of Greece, his supervisor there, and Hamburg · 🔑 Server Room Key. Second: Veltiston AI — the founder, the stack, the team across three time zones, the data-science side. The lift has a button for a third floor and it is not lit |
| **Army Camp** (SE)               | Service record and the Battalion Commander's letter, under the Greek flag · 🔑 Footlocker Key                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Town School** (W)              | The hall: his first teacher, two cups, volunteering and the foundation's letter · 🔑 Cabinet Key. West door: the Evangeliki classroom, the principal, the Pascal tutor, the robotics bench and the after-school clubs. East door: the Ionidios classroom, three teachers and their scholarship letters, the EUSO bench and the machine he learned C++ on                                                                                                                                                                |
| **Radio Center** (S)             | The transmitter — email, LinkedIn and a message desk                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **The Old Lighthouse** (NW cape) | Sealed with five locks, and not a lighthouse. Inside is a flight deck: a hologram of the tower cut away to show the ship inside it, an airlock with a pressure suit on the rack, and the button under the glass. Suit up, launch, sign the certificate in orbit, fly home in the star shirt                                                                                                                                                                                                                             |

### Missions and keys

Five missions, one per district. Talking to the right person marks the mission
active and sharpens the hint; searching the right piece of furniture hands over
the key. The HUD tracks the next objective, the badge shows the keyring, and the
map lists every mission's state. With all five keys the lighthouse door opens.

Nothing a recruiter needs is ever locked away. The **Say hi** button — on the HUD
and on the title screen, always — opens a card where Kitsos himself waves, warns
you that you will miss all the fun, and then hands over the entire CV plus the
message desk. The lighthouse is a reward, not a gate — and taking the shortcut
hands over the CV without opening its door, because the tower is what the keys
are _for_. Skipping the hunt should not also finish it.

### Getting around

The island is about 220 units across, so the map (`M`) doubles as fast travel:
every building you have walked near is marked, and clicking a found place walks
you to its door. A live minimap sits in the corner with people, roads and your
heading on it.

## Layout of the code

The island is laid out by **feature**: everything one part of it needs — its
rules, its 3D pieces, its panels and its tests — sits in one directory, so a
change to the lift is a change to one folder rather than a tour of four.

```text
src/
  features/
    island/       terrain, water, foliage, paths, props, buildings, daylight
    interior/     the room shell, its furniture kit, doors and what you examine
    player/       the controller, the character, input and the touch pad
    npc/          the townspeople, the guards, and who is standing where
    cv/           the CV itself: the journal, the panels, the downloads
    lift/         the car, its panel, and the one journey that takes time
    launch/       the ship in the lighthouse, the flight, and the certificate
    map/          the minimap and the full map overlay
    arcade/       the games board and the list it offers
    paintball/  moto/  balloon/  hide/  rescue/     one minigame each
    lecture/  party/  proposal/  calendar/  radio/  toys/
  shared/
    engine/       the r3f scene, collision, audio, signage, quality
    ui/           the HUD, panels, dialogue, toasts, title and settings
    state/        zustand: area, dialogue, journal, keys, missions, saves
    i18n/         the translator, and the Greek dictionary it fetches
  test/           shared fixtures, and the setup every test file runs first
config/           vite, vitest, oxlint, prettier and the project tsconfigs
```

Within a feature, the plain `.ts` modules hold the rules and the `.tsx` ones
draw them. Where a feature has both under one name, the logic carries a
`Logic` suffix — `balloonLogic.ts` beside `Balloon.tsx` — because a file
system that ignores case cannot tell `balloon.ts` from `Balloon.tsx`, and a
pair that differs only in case is a trap on Windows and a merge conflict
waiting to happen.

Some notes on how it hangs together:

- **Nothing is fetched.** Terrain, water, characters, buildings, furniture and
  props are all procedural geometry; signage text is drawn to a canvas at runtime
  (`shared/engine/TextSign.tsx`). The only external request is the font stylesheet.
- **The music is composed in code**, not shipped as a file — a I–V–vi–IV loop in
  D major with a pad, bass, arpeggio, melody and light percussion, scheduled a
  bar and a half ahead of the audio clock. Original by construction, so there is
  no licence to honour, and it adds nothing to the bundle. It thins out indoors
  and opens up again in the lighthouse. `B` turns it off, `N` mutes everything.
- **One area is mounted at a time.** `shared/engine/Scene.tsx` swaps the island for a room, so
  indoor scenes light themselves and the draw call count stays low. The player
  controller is shared and picks its colliders, bounds, ground height and camera
  from whichever area is active.
- **The tower tells you what it is before it lets you in.** The first time
  the door opens, he stops on the doorstep, a `!` springs up over his head,
  and the painted bands lift off the tower while the rocket underneath fades
  up through them — both on screen at once, so it reads as one thing becoming
  another rather than a swap. "This is not a lighthouse. This is a space
  rocket." Then the screen goes and the deck takes over.
  `features/launch/revealLogic.ts` times it; it plays exactly once and the
  save remembers, because a surprise standing between you and a door you have
  just unlocked five keys' worth is only welcome the first time.

- **The lighthouse is a spaceship.** The summit room is a flight deck
  (`features/launch/FlightDeck.tsx`), and it says so before a word is read: a
  hologram turns on a plinth in the middle of the floor with the painted tower
  in translucent bands and the ship inside it in wireframe, engines and all.
  Ribbed bulkheads, a lit floor strip and cold lighting do the rest.

- **The airlock is the gate, and the walk across the room is the point.** The
  suit hangs on a rack in a lit alcove on the west wall, as far from the
  console as the room allows. The button is dull and reads `SUIT UP FIRST`
  until he has been over and put it on; press it in shirtsleeves and the deck
  says so. Suited, he gets a bubble helmet, a life-support pack and an amber
  collar (`Character.tsx`), the rack stands empty, and its lamp goes green.

- **The flight is one clock.** `features/launch/launch.ts` times hold,
  ignition, climb and orbit, so the count on the screen, the shake on the
  camera and the island shrinking in the window all agree. A phase is
  arithmetic on elapsed time rather than a frame-stepped machine, so a dropped
  frame or a backgrounded tab costs nothing.

- **The hologram flies the flight.** Idling it turns slowly and shows the
  cutaway; once the button is pressed the painted shell lifts away and thins
  out, the ship climbs on the same altitude the window is reading, and the
  engines light under it. It is the only place the launch can be watched from
  outside — he is strapped in behind the glass for the whole of it.

- **In orbit he is outside the ship.** The engines cut and the room is
  replaced by open space (`features/launch/Space.tsx`): a starfield, the sun,
  the island turning under him as a blue-green globe with a band of air round
  its rim, and the ship he came up in holding station a little way off. That
  is why he can move freely out there — a cabin is a room with walls, and
  nothing about weightlessness survives being boxed in. He sculls along with
  his forearms, drawn half again as big, with nothing to bump into.

- **And the credits roll.** `features/launch/credits.ts` — a crew list as
  long as a real one with almost nobody on it, which is the joke; his own
  name appears twice. The last credit before the thanks is Movement, You,
  which is the only line on the roll that is literally true of whoever is
  reading it.

- **The prize is a certificate and a shirt.** In orbit he types his name onto
  a certificate drawn to a canvas and handed over as a PNG
  (`features/launch/certificate.ts`), signed by Kitsos Orfanopoulos; the full
  CV is on the same card. Then he flies home, landing at the crossroads in the
  blue-and-yellow star shirt: deep flight blue, a gold star extruded off the
  chest, gold collar, cuffs and hem, and a mission patch on the sleeve. It is
  the only thing on the island that has to be earned, and the settings card
  will swap it back for anybody who would rather have the red one.

- **While he is up there the game is sealed.** Every other screen can be
  backed out of sideways; this one has exactly one door, which is the ride
  home. That is enforced in one place rather than a dozen: `isSealed` wraps
  the store’s own `set`, so every existing way back to `explore` — a panel
  closing, the map, walking out of a building — silently drops the mode change
  and keeps the rest of its patch, the functional-updater form included. A
  path added later is covered without anybody having to remember it.

- **The lift is the one way through that takes time.** Every other door and
  flight swaps the room the moment you walk into it. Walking into the car
  instead raises its panel (`features/lift/LiftPanel.tsx`) with a button per floor; press
  one and the doors shut, the indicator counts, and only when the car stops are
  you put out — on the far floor's lift, not on its stairs. `features/lift/lift.ts` owns
  the timing, so the doors in the scene and the number over them read the same
  clock. The button for the third floor is on the panel and does nothing, which
  is the point of it.
- **The frame loop never re-renders React.** `features/player/Player.tsx` reads input, resolves
  collisions and drives the camera inside `useFrame`, writing to refs. Walking
  NPCs publish their positions to `features/npc/actors.ts` rather than to state, so a
  strolling townsperson costs nothing.
- **`terrainHeight()` is the single source of truth** for the ground, shared by
  the mesh generator and the player controller, so nothing floats or sinks.
- **The Academy's steps are real.** `groundHeight()` layers walkable ramps and
  ledges over the terrain, so you climb the colonnade rather than gliding
  through it; the door and its marker sit on the top tread.
- **Ground decals use polygon offset**, not hair-thin Y gaps, and the camera's
  near plane is far enough out to keep depth precision — between them that is
  what stopped the entrance rings shimmering.
- **The camera swings, it does not clip.** `probeCamera()` finds a building or
  hill standing between the lens and the player and rotates the boom to the open
  side — needed because every door faces the plaza, which puts half the buildings
  behind you as you approach. Indoors, the wall nearest the camera hides itself.

## Tests

Tests sit beside what they test — `collision.ts` next to `collision.test.ts` —
so a change and its test are read together and neither is easy to forget.

Most of the island is arithmetic, and most of the suite runs in plain Node with
no DOM at all. A file that wants a document says so at the top:

```ts
/**
 * @vitest-environment jsdom
 */
```

What is worth testing here, and what is not: the pieces with a rule worth
stating — collision push-out, the lift, the save format, the aiming ring, the
translator — are covered closely. The r3f components are meshes and materials
that a headless run cannot render, so the logic they used to hold was pulled
into plain modules, and those are what the tests hold. The data tables and the
Greek dictionary are declarations rather than behaviour and are measured only
where something reads them.

Two habits worth keeping when adding to it. Assert the rule rather than the
arithmetic: a test that pins the exact push distance of every collider will
fail the next time a fence moves, whereas one that asserts he ends up outside
the fence will not. And where a module is random — the paintball draw, the
flare positions — either hold the randomness off and put the pieces on the
board by hand, or assert only what is true of every draw.

## Editing the content

All the wording lives in three files. `src/features/cv/profile.ts` holds the copy as
typed blocks (`text`, `list`, `stats`, `tags`, `timeline`, `quote`);
`src/features/island/world.ts` holds the map — where each building and person stands, what
they say, and which mission they hand out; `src/features/interior/interiors.ts` furnishes each
room and places its exhibits.

Referees live in `profile.ts` as `Letter` objects, grouped into
`REFERENCE_*_SECTIONS` so each is shown in the district it came from, with all
four concatenated into the full CV. They render as a **Recommendations**
accordion — collapsed until you click a name. The two Greek letters are
translated there; referees' own contact details are deliberately left out.

Scans of the originals go in `public/letters/` (see the README there for the
filenames). Any that are absent simply do not render, so the transcripts always
stand on their own.

Institution marks work the same way. `public/marks/ntua.png`, `ibm.png` and
`veltiston.png` are used on the Academy's foundation stone and the Work
District's tenant board when present; without them, `src/shared/engine/Emblems.tsx`
draws stylised stand-ins so the island always renders.

Adding a townsperson is one entry in `NPCS` — the model, marker, dialogue,
journal slot and map dot follow automatically. Adding a new exhibit to a room is
one entry in that room's `exhibits`, pointing at a section from `profile.ts`.
The downloadable CV is generated from the same sections, so it never drifts out
of sync with the island.
