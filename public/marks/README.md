# Institution marks

Drop the real artwork in here and the buildings use it instead of the drawn
fallback. Nothing is required — anything missing falls back to a mark drawn in
code, so the island always renders.

| File | Used on |
| --- | --- |
| `ntua.png` | The foundation stone at the Academy steps |
| `ibm.png` | The tenant board on the Work District forecourt |
| `veltiston.png` | The same board, and the tower crown |

**Use PNG with transparency.** SVG loads only if the file declares explicit
`width` and `height` attributes; without them the browser reports a zero
intrinsic size and the texture comes out blank. A square export around
1024×1024 is plenty for the NTUA seal; the wordmarks want roughly 4:1.

The fallbacks in `src/world/Emblems.tsx` are deliberately stylised — they are
not attempts to copy the official artwork. Once the real files are here, they
are what the player sees.
