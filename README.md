# Brass Lasers 4AM

Void-purple chrome. Brass-gold hardware. Hot-pink lasers cutting the fog.

This is a dark color theme for **VS Code** and **Cursor** — built for that stretch of night when the playlist goes Griz → Pretty Lights → Big G and the only responsible adult left in the room is your syntax highlighter. Funky EDM energy. Still readable. Still slap.

> Not affiliated with Griz, Pretty Lights, Big G, T3 Tools, or anyone's light show. Just vibes + hex codes.

---

## Install

### VS Code (Marketplace)

1. Open Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
2. Search **Brass Lasers 4AM**
3. Install **heyoub.brass-lasers-4am**

Or from the command line:

```bash
code --install-extension heyoub.brass-lasers-4am
```

### Cursor (Open VSX)

Cursor pulls third-party extensions from **Open VSX**, not the Microsoft Marketplace.

1. Open Extensions in Cursor
2. Search **Brass Lasers 4AM**
3. Install when it shows publisher **heyoub**

If search is being weird (or before Open VSX lists it), grab the `.vsix` from [v0.1.0](https://github.com/heyoub/brass-lasers/releases/tag/v0.1.0) and use **Install from VSIX…**

### From a VSIX (both editors)

```bash
npx @vscode/vsce package
```

Then in the editor: Extensions → `…` → **Install from VSIX…** → pick `brass-lasers-4am-0.1.0.vsix`.

---

## Activate

1. `Ctrl+K` then `Ctrl+T` (Mac: `Cmd+K` then `Cmd+T`)
2. Pick **Brass Lasers 4AM**
3. Let the void purple settle in. Hydrate. Maybe stretch.

You can also set it permanently in settings:

```json
{
  "workbench.colorTheme": "Brass Lasers 4AM"
}
```

---

## Palette map (the useful part)

| Role | Hex | What it does |
|------|-----|--------------|
| Void canvas | `#0e0a17` | Editor / deep background |
| Lot chrome | `#0a0711` | Sidebar, activity bar, terminal chrome |
| Brass gold | `#ffb627` | Accents, active line numbers, find matches |
| Hot pink laser | `#ff3d9a` | Focus rings, cursor, keywords, send-button energy |
| Laser lime | `#b6ff5c` | Strings, terminal text, “this is good” green |
| Cyan beam | `#3df2e0` | Functions, links, info |
| Soft cream | `#efe6d5` | UI foreground that doesn’t fight the purple |

**Cursor / selection:** magenta-purple haze so you can still see what you highlighted after three hours of bass music.

**Errors:** `#ff4d6d` — the friend who lost the rail and needs a water.

---

## T3 Code twin

Same party, different venue. A matching T3 Code theme lives in [`t3/brass-lasers-4am.json`](t3/brass-lasers-4am.json).

1. Open that file, copy the JSON
2. In T3 Code: **Settings → Themes → Import theme** (paste or drop)
3. Or grab it from the community gallery once it’s live: [t3themes.com](https://www.t3themes.com/) → search **Brass Lasers 4AM**

Gallery listing (after merge): `https://www.t3themes.com/themes/brass-lasers-4am/`

---

## Smoke-check after install

Open any project and glance at:

- Editor background / foreground
- Sidebar + activity bar
- Selection + find highlight
- Terminal (lime on near-black)
- Focus border on an input (should be hot pink)

If something still looks like factory-default gray, make sure the theme name is selected (not just installed).

---

## Influence

Late-night funky EDM — think brass stabs, laser fog, and that “one more song” optimism. Griz / Pretty Lights / Big G energy as *palette inspiration*, not samples, logos, or official merch. Your milage (and hydration) may vary.

---

## Publisher

- Extension ID: `heyoub.brass-lasers-4am`
- GitHub: [heyoub/brass-lasers](https://github.com/heyoub/brass-lasers)
- License: [MIT](LICENSE)

---

## Contributing / tweaking

PRs welcome if you find a token that still looks sober. Keep the chaos; keep the contrast. Open an issue if Cursor’s chat chrome needs a specific workbench key we missed.

Stay weird. Ship code. Respect the lasers.
