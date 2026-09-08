# Kitsos Island — a playable CV

A frontend-only 3D personal site for **Christos "Kitsos" Orfanopoulos**, built as a
Pokémon-style island you walk around. Townspeople tell you about him, the six
buildings open up as full CV sections, and the Radio Center hands your message
straight to your own mail client.

No backend, no API keys, no runtime network calls beyond the Google Fonts
stylesheet — it deploys as static files anywhere.

## Stack

| Layer | Choice |
| --- | --- |
| Build | Vite 8 + TypeScript 6 |
| UI | React 19 |
| 3D | three.js · @react-three/fiber 9 · @react-three/drei 10 |
| State | Zustand 5 |
| Lint | oxlint |

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static bundle in dist/
npm run preview  # serve the built bundle
npm run lint
```

## Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Move | `W A S D` / arrows | left stick |
| Run | `Shift` | — |
| Interact | `E` / `Space` / `Enter` | `A` button |
| Turn camera | `Q` / `R` | — |
| Journal | `J` | `J` button |
| Mute | `M` | HUD button |
| Back | `Esc` | tap outside |

## The island

Everything radiates from the town plaza. Each building opens a panel of real CV
content; each of the 17 townspeople gives a few lines of dialogue and files an
entry in the journal. Talking to everyone and entering every building fills the
23-entry journal.

| Place | What it holds |
| --- | --- |
| **Kitsos House** (south-west) | Profile, languages, hobbies |
| **NTUA Academy** (north) | MEng at NTUA, thesis, student representation, contests |
| **Work District** (east) | Veltiston.AI, IBM Consulting, full skills matrix |
| **Army Camp** (south-east) | Marine Special Forces reserve service |
| **Town School** (west) | Early education, awards, volunteering and teaching |
| **Radio Center** (south) | Email, phone, LinkedIn and a message desk |

The Radio Center's message desk composes a `mailto:` link from the form and
hands it to the visitor's mail client, with a clipboard fallback — which is what
lets the site stay backend-free.

## Layout of the code

```text
src/
  data/
    profile.ts    all CV copy, as structured panel blocks
    world.ts      island layout: buildings, NPCs, signposts, paths
  game/
    terrain.ts    height field, colliders, prop scattering, camera occlusion
    collision.ts  circle/AABB push-out and the island boundary
    input.ts      keyboard + virtual stick, read by the frame loop
    audio.ts      WebAudio blips and jingles (no audio files)
  state/store.ts  zustand: mode, dialogue, panels, journal progress
  world/          the 3D scene — terrain, water, foliage, props, characters
    buildings/    one low-poly model per building kind
  ui/             title screen, dialogue box, panels, journal, HUD, touch pad
```

Some notes on how it hangs together:

- **Nothing is fetched.** Terrain, water, characters, buildings and props are all
  procedural geometry; signage text is drawn to a canvas at runtime
  (`world/TextSign.tsx`). The only external request is the font stylesheet.
- **The frame loop never re-renders React.** `Player.tsx` reads input, resolves
  collisions and drives the camera inside `useFrame`, writing to refs. The store
  is only touched when something actually changes (a new nearby target, a new
  journal entry).
- **`terrainHeight()` is the single source of truth** for the ground, shared by
  the mesh generator and the player controller, so nothing floats or sinks.
- **The camera swings, it does not clip.** `probeCamera()` finds a building
  standing between the lens and the player and rotates the boom to the open side
  — needed because every door faces the plaza, which puts half the buildings
  behind you as you approach.

## Editing the content

All the wording lives in two files. `src/data/profile.ts` holds the panel copy
as typed blocks (`text`, `list`, `stats`, `tags`, `timeline`, `quote`), and
`src/data/world.ts` holds the map: where each building and person stands, what
they say, and what they file in the journal. Adding a townsperson is one entry
in `NPCS` — the model, marker, dialogue and journal slot follow automatically.
