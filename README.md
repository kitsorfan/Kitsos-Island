# Kitsos Island — a playable CV

A 3D personal site for **Kitsos Orfanopoulos**, built as a Pokémon-style
island you walk around. Townspeople tell you about him, seven buildings open
up and let you walk **inside**, five hidden keys unlock the Old Lighthouse —
which turns out to be a spaceship — and the Radio Center sends your message
straight to his inbox.

It is static files plus one small Cloudflare Worker. The island makes no
runtime network calls to anyone else (even its fonts are served from its own
origin), and the only thing that ever reaches the Worker is a message from the
Radio Center.

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
npm run worker:dev     # the built island and the Worker together, on :8787
```

`npm run dev` has no Worker behind it, so the Radio Center's Transmit fails
there and falls back to the mail client. To try the real thing locally, copy
`.dev.vars.example` to `.dev.vars` and run `npm run worker:dev`. It uses
Turnstile's always-pass test keys, and Wrangler writes the mail it would have
sent under `.wrangler/tmp/email/` instead of sending it.

### Quality gates

`npm install` wires up the git hooks (via husky), so every clone checks the
same things before anything leaves it:

| Hook         | Runs                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `pre-commit` | Prettier and oxlint on the staged files only (lint-staged), and a warning if the CV data changed but the PDF was not reprinted |
| `commit-msg` | commitlint: [Conventional Commits](https://www.conventionalcommits.org), `type(scope): subject`                                |
| `pre-push`   | `npm run typecheck` and the whole test suite                                                                                   |

GitHub Actions runs the same gates again on every push to `main` and
`develop` and on every pull request — lint with warnings denied, formatting,
types, tests with coverage, the build — and checks every commit message in a
pull request. Dependabot opens weekly dependency updates against `develop`.

### The PDF CV

The island hands out a two-page A4 PDF, `public/Orfanopoulos-Christos-CV.pdf`,
laid out like a conventional CV with nothing of the island in it. It is printed
from `/resume.html`, which is generated from the same data as everything else,
so re-print it whenever the CV changes and commit the result:

```bash
npm run cv:pdf   # needs Edge or Chrome installed; CV_BROWSER=<path> for others
```

A square portrait at `public/cv/photo.jpg` goes into the header; without one,
the header simply goes without a photo.

### The link preview

A link to the island unfurls (LinkedIn, Slack, email) with
`public/og-image.png`, 1200 × 630, drawn from the CV data in the island's own
palette and typefaces. Like the PDF it takes a browser, so it is committed;
redraw it when the name or the title changes:

```bash
npm run og:image   # same browser lookup as cv:pdf
```

The rest of what crawlers read is in `index.html`: the Open Graph tags, a
`<noscript>` card pointing at the plain CV for anything that does not run the
island, and a JSON-LD `Person` that the build writes from the CV data.
`public/robots.txt` and `public/sitemap.xml` list what is worth finding.

## Deploying

[www.kitsorfan.com](https://www.kitsorfan.com) is a Cloudflare Worker with static assets, set out in
`wrangler.jsonc`. Cloudflare serves `dist/` directly, with the headers in
`public/_headers`; only `/api/*` runs `worker/index.ts`, which checks a Radio
Center message (honeypot, timing, Turnstile, a rate limit) and mails it
through the `send_email` binding. That binding can only deliver to an address
verified in Email Routing, which is what keeps it free and what stops it ever
mailing anyone else. It is a Worker rather than Pages because Pages Functions
cannot be given a `send_email` binding.

One-time setup, in the Cloudflare dashboard:

1. **Domain.** Register `kitsorfan.com` with Cloudflare Registrar, so its DNS
   is on Cloudflare.
2. **Email Routing.** Turn it on for the domain, then add and verify
   `kitsorfan@protonmail.com` as a destination address. The Worker sends as
   `radio@kitsorfan.com`, a name on the domain that needs no mailbox.
3. **Turnstile.** Add a widget for `kitsorfan.com` and `www.kitsorfan.com`
   (managed mode). Put its **site key** in `.env.production` as
   `VITE_TURNSTILE_SITE_KEY=...` and commit it (it is public by design), and
   give the Worker the **secret** with
   `npx wrangler secret put TURNSTILE_SECRET`. Until a site key is built in,
   the desk goes on handing messages to the mail client.
4. **Workers Builds.** Workers & Pages → Create → import this repository.
   Build command `npm run build`, deploy command `npx wrangler deploy`,
   production branch `main`, build variables `NODE_VERSION=24` and `HUSKY=0`.
   Every merge to `main` then deploys, and other branches get preview URLs.
5. **Bare domain.** A Redirect Rule sending `kitsorfan.com/*` to
   `https://www.kitsorfan.com/${1}` (301), since www is the address the CV
   prints.

The custom domains in `wrangler.jsonc` only deploy once the zone exists. For a
first deploy before that, comment out `routes` and use the `*.workers.dev`
address. Once the domain has served cleanly over HTTPS for a couple of weeks,
raise the HSTS `max-age` in `public/_headers`, as the comment there says.

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
worker/           the Cloudflare Worker behind the Radio Center's transmitter
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
  (`shared/engine/TextSign.tsx`). The fonts are self-hosted (`@fontsource`), so
  nothing is requested from anywhere else.
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
  `features/launch/revealLogic.ts` times it. The bands come away one at a
  time from the bottom up, turning as they go, with the seams lit and the
  ground shaking hardest in the middle of it — all at once would be a texture
  fading out rather than a tower coming apart. It plays every time he walks
  in, not just the first, so it is kept to seven seconds.

- **Suited, the front door refuses.** A man in a pressure suit walking the
  island in it would make the suit a costume rather than equipment, so the
  door says no while it is on. It is a refusal and not a trap: the rack is
  three strides away, hanging the suit up always works, and the keeper's
  logbook is in that room.

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
