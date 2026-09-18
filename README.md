# Kitsos Island — a playable CV

A frontend-only 3D personal site for **Christos "Kitsos" Orfanopoulos**, built as a
Pokémon-style island you walk around. Townspeople tell you about him, seven
buildings open up and let you walk **inside**, five hidden keys unlock the Old
Lighthouse, and the Radio Center hands your message straight to your own mail
client.

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

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static bundle in dist/
npm run preview  # serve the built bundle
npm run lint
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
| **The Old Lighthouse** (NW cape) | Sealed with five locks. Inside: the career summary, what he is good at, what he is looking for, and a CV download                                                                                                                                                                                                                                                                                                                                                                                                       |

### Missions and keys

Five missions, one per district. Talking to the right person marks the mission
active and sharpens the hint; searching the right piece of furniture hands over
the key. The HUD tracks the next objective, the badge shows the keyring, and the
map lists every mission's state. With all five keys the lighthouse door opens.

Nothing a recruiter needs is ever locked away. The **Say hi** button — on the HUD
and on the title screen, always — opens a card where Kitsos himself waves, warns
you that you will miss all the fun, and then hands over the entire CV plus the
message desk. The lighthouse is a reward, not a gate.

### Getting around

The island is about 220 units across, so the map (`M`) doubles as fast travel:
every building you have walked near is marked, and clicking a found place walks
you to its door. A live minimap sits in the corner with people, roads and your
heading on it.

## Layout of the code

```text
src/
  data/
    profile.ts    all CV copy, as structured panel blocks
    world.ts      island layout: buildings, NPCs, signposts, roads, keys, missions
    interiors.ts  one room per building: furniture, exhibits, key stands
    cv.ts         renders the panel data into a downloadable Markdown CV
  game/
    terrain.ts    height field, colliders, prop scattering, camera occlusion
    interior.ts   furniture footprints and room collision
    collision.ts  circle/AABB push-out, circular and rectangular bounds
    input.ts      keyboard + virtual stick, read by the frame loop
    actors.ts     live NPC positions, shared with the player and the map
    audio.ts      WebAudio blips and jingles (no audio files)
    music.ts      the soundtrack, sequenced note by note in WebAudio
  state/store.ts  zustand: area, dialogue, panels, journal, keys, missions
  world/          the 3D scene
    Island.tsx      terrain, water, foliage, props, buildings
    Interior.tsx    the room shell, exhibits and key stands
    InteriorProps.tsx  the furniture kit, and the Greek flag
    buildings/      one low-poly model per building kind
  ui/             title, dialogue, panels, journal, HUD, minimap, map, touch pad
```

Some notes on how it hangs together:

- **Nothing is fetched.** Terrain, water, characters, buildings, furniture and
  props are all procedural geometry; signage text is drawn to a canvas at runtime
  (`world/TextSign.tsx`). The only external request is the font stylesheet.
- **The music is composed in code**, not shipped as a file — a I–V–vi–IV loop in
  D major with a pad, bass, arpeggio, melody and light percussion, scheduled a
  bar and a half ahead of the audio clock. Original by construction, so there is
  no licence to honour, and it adds nothing to the bundle. It thins out indoors
  and opens up again in the lighthouse. `B` turns it off, `N` mutes everything.
- **One area is mounted at a time.** `Scene.tsx` swaps the island for a room, so
  indoor scenes light themselves and the draw call count stays low. The player
  controller is shared and picks its colliders, bounds, ground height and camera
  from whichever area is active.
- **The lift is the one way through that takes time.** Every other door and
  flight swaps the room the moment you walk into it. Walking into the car
  instead raises its panel (`ui/LiftPanel.tsx`) with a button per floor; press
  one and the doors shut, the indicator counts, and only when the car stops are
  you put out — on the far floor's lift, not on its stairs. `game/lift.ts` owns
  the timing, so the doors in the scene and the number over them read the same
  clock. The button for the third floor is on the panel and does nothing, which
  is the point of it.
- **The frame loop never re-renders React.** `Player.tsx` reads input, resolves
  collisions and drives the camera inside `useFrame`, writing to refs. Walking
  NPCs publish their positions to `game/actors.ts` rather than to state, so a
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

## Editing the content

All the wording lives in three files. `src/data/profile.ts` holds the copy as
typed blocks (`text`, `list`, `stats`, `tags`, `timeline`, `quote`);
`src/data/world.ts` holds the map — where each building and person stands, what
they say, and which mission they hand out; `src/data/interiors.ts` furnishes each
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
District's tenant board when present; without them, `src/world/Emblems.tsx`
draws stylised stand-ins so the island always renders.

Adding a townsperson is one entry in `NPCS` — the model, marker, dialogue,
journal slot and map dot follow automatically. Adding a new exhibit to a room is
one entry in that room's `exhibits`, pointing at a section from `profile.ts`.
The downloadable CV is generated from the same sections, so it never drifts out
of sync with the island.
