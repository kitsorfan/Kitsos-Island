# Letters of reference

Drop scans of the original letters in here and the Recommendations panel picks
them up automatically. Anything missing simply does not render, so the
translated transcript always stands on its own.

Expected filenames (see `scans` in `src/data/profile.ts`):

| File                                     | Letter                                                      |
| ---------------------------------------- | ----------------------------------------------------------- |
| `tsanakas.jpg`                           | Prof. Panagiotis Tsanakas — Dean, School of ECE, NTUA       |
| `mitsidis.jpg`                           | Lt Col Georgios Mitsidis — 575 Marine Battalion             |
| `oikonomou-1.jpg`, `oikonomou-2.jpg`     | Kyriakos Oikonomou — "Pantokrator" Foundation               |
| `kandylakis.jpg`                         | Stelios Kandylakis — LinkedIn recommendation (optional)     |
| `pantou-1.jpg`, `pantou-2.jpg`           | Dr Dimitra Pantou — Biology, Ionidios (scholarship form)    |
| `mitsopoulou-1.jpg`, `mitsopoulou-2.jpg` | Athina Mitsopoulou — Chemistry, Ionidios (scholarship form) |
| `papadakis-1.jpg`, `papadakis-2.jpg`     | Nikolaos Papadakis — Physics, Ionidios (scholarship form)   |

JPG, PNG and WebP render as a thumbnail that opens full size in a new tab. A
`.pdf` renders as a download link instead. Add or rename freely — the list of
filenames lives beside each letter in `profile.ts`.

## Before you add a scan

Cover the referee's phone number, email address and any home address first.
That is their personal data, not mine, and they did not choose to publish it:
the site prints none of it anywhere else, and a scan that shows it hands it to
every crawler that reads a public repo. Signatures are worth covering too.

Git will not take these files by accident — `.gitignore` holds every image and
PDF in this folder, so adding one is a deliberate act:

```bash
git add -f public/letters/tsanakas.jpg
```

Do that only once the scan itself is redacted. A commit that publishes a
referee's phone number cannot be undone by a later commit that removes it:
the image stays in the history, and on a public repo it has already been
cloned, cached and indexed.
