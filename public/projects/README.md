# Side project screenshots

One picture per side project, shown on that project's screen in the Work
District lobby and at the top of its card. The card's picture opens the live
project.

| File                     | Project            |
| ------------------------ | ------------------ |
| `dental-cbct-viewer.jpg` | Dental CBCT Viewer |

**16:9, at 1280 × 720.** The screen and the card are both drawn at that ratio,
so anything else is stretched on one and letterboxed on the other. 1280 wide is
sharp on a high-density screen at the card's full width; anything larger only
costs download and decode time. JPEG at around quality 85 keeps one near
120 KB.

A missing file is not an error: the screen draws the project's name on a dark
card instead, and the card simply goes without a picture. The tests check that
every project's file is here, so it does not go missing quietly.

If the screenshot shows somebody else's material, say whose in the project's
`credit`, and the card prints it under the picture. The Dental CBCT Viewer's is
an anonymised public scan under CC BY 4.0.
