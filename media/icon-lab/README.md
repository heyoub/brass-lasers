# Icon lab: three organic finishes, awaiting a pick

**Experimental. Not shipped.** Nothing here is in the VSIX or the icon theme until one finish is chosen. The current Brass badges stay the default meanwhile.

Regenerate everything with `node scripts/icon-lab.js`.

## What to look at

| Sheet | What it shows |
|---|---|
| [explorer-1x.png](explorer-1x.png) | A real-looking sidebar at **true 16 px**, 4AM and Daybreak, every option side by side, with the unmodified originals for comparison. This is the one that matters. |
| [explorer-2x.png](explorer-2x.png) | The same at 2x (retina, or 125%+ display scaling) |
| [sizes-4am.png](sizes-4am.png) · [sizes-daybreak.png](sizes-daybreak.png) | All 27 icons at 16, 20, 24, 32 and 64 px |
| [all-sets.png](all-sets.png) | Nine icons across all nine sets, per finish |

## The options

| | Geometry | Finish | Feel |
|---|---|---|---|
| **A · Resin** | Catppuccin's 1 px line icons | Recolored from the set's palette; closed outlines get a soft tinted glass body | Organic, airy, lush at 2x |
| **B · Enamel** | Material's filled icons | Palette-harmonized, vertical light falloff, top sheen | Polished, macOS-like, solid |
| **C · Enamel Edge** | Material's filled icons | Enamel plus a darker rim and a small cut shadow | Enamel with a little bite |

Baselines in every sheet: **Material (original)**, **Catppuccin (original)** and the **Brass badges** that ship today.

## Findings

- **Recognition holds in all three.** Geometry is never edited, only paint, so every logo keeps its source proportions.
- **At true 16 px the finishes are subtle.** The gradient, glass body and rim read clearly only at 2x and up. At 1x the choice is mostly *line vs filled* (A vs B/C) plus color.
- **C's rim fills small counters on light sets.** The "TS" letters go muddy on Daybreak. It's the inherent cost of a rim at 16 px.
- **Light sets:** the palette darkens accents for text contrast (4.5:1), but icons are graphics and need only 3:1 (WCAG 1.4.11). So on light sets each icon is lifted as one piece, as far as it can go while keeping 3:1 against the sidebar: vivid instead of bronze.
- **Inner symbols stay distinct:** recoloring keeps each source color's lightness offset from the icon's body color. So the symbols on folders like `docs` and `media` survive on every set.
- **Resin's glass body is applied only to closed silhouettes.** Open line drawings (Python, Git, Docker...) stay pure line; filling them looked wrong.
- **Material has no root or open-folder icon.** B and C use its base folder for both, so open and closed folders look the same there.

## Licensing and provenance

- **Sources:** both packs are MIT. Their licenses are in [sources/catppuccin/LICENSE](sources/catppuccin/LICENSE) and [sources/material/LICENSE](sources/material/LICENSE), and the exact upstream commits are in [sources/PROVENANCE.txt](sources/PROVENANCE.txt). Shipping a finish means shipping that license notice with the extension.
- **Trademarks:** MIT covers the *drawings*, not the trademarks they depict (TypeScript, Rust, Python, Docker, Git...). Every icon pack ships these on the brand owners' usage tolerance. We'd be in the same position, not a worse one.

## After a pick

1. Fold the chosen finish into `scripts/icons.js`, behind the existing icon theme id.
2. Expand from these 27 to the full file and folder coverage of the source pack.
3. Add the source license to the package.
4. Check it in Cursor at real size before release.
5. Wallpapers then borrow the same material language.
