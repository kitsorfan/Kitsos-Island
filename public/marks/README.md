# Institution marks

The real NTUA seal goes in here, and the Academy uses it instead of the drawn
fallback. If the file is missing, the seal is drawn in code instead, so the
island still renders.

| File       | Used on                                   |
| ---------- | ----------------------------------------- |
| `ntua.png` | The foundation stone at the Academy steps |

**Use PNG with transparency.** SVG loads only if the file declares explicit
`width` and `height` attributes; without them the browser reports a zero
intrinsic size and the texture comes out blank. Export it at 1024×1024: the
texture is capped at that size, so anything larger only costs download and
decode time.

The IBM and Veltiston wordmarks are not files. They are drawn in code in
`src/shared/engine/Emblems.tsx`, deliberately stylised rather than copies of
the official artwork, and nothing is fetched for them. A file dropped in here
under their names would not be used.
