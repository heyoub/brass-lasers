# Changelog

All notable drops of **Brass Lasers 4AM** land here. Newest first. Hydrate accordingly.

## 0.3.0 — the full lineup

**One palette, every venue.** Brass Lasers is now a family: four sets, a No Italics flavor of each, a file icon theme, and ports to 25+ apps, all generated from a single palette and contrast-checked on every commit.

### New sets

- **Afterglow:** the comedown set. Same lot, lasers dimmed, softer saturation for long sessions.
- **Strobe:** high contrast. Deeper void, brighter lasers, every syntax color at WCAG **AAA** (7:1).
- **Golden Hour:** the daytime set, a light theme. Warm cream, burnished brass, deep-purple ink.
- **No Italics** flavor for every set (8 themes in the picker).
- Pair 4AM and Golden Hour with `window.autoDetectColorScheme` to follow your OS light/dark mode.

### Brass Lasers Icons

A file icon theme in the same colors: brass folders, pink when open, and tinted badges for 40+ languages and config files. Dark themes use 4AM colors and light themes switch to Golden Hour automatically. Pick it under **File Icon Theme**.

### Ports (all four sets each)

- **Editors:** Neovim (the repo works as a lazy.nvim plugin), Helix, Sublime Text, JetBrains. Zed now ships all 8 themes.
- **Terminals:** Windows Terminal, Ghostty, WezTerm, Kitty, Alacritty, iTerm2.
- **CLI:** bat, delta, fzf, Starship, truecolor boot banners for sh and PowerShell.
- **Apps:** Obsidian, Discord (Vencord / BetterDiscord), Firefox, Slack, Raycast, T3 Code.

### Extras

- **Neon Glow** (experimental, separate opt-in extension in `extensions/glow/`): makes the lasers actually glow by patching the editor workbench. Fully reversible.
- Wallpapers for every set, 4K desktop and phone, plus swatch cards and a social preview card.
- Code previews rendered from the shipped theme files with Shiki.
- A landing site with a live playground (`site/`).

### Under the hood

- `palette/*.json` is the single source of truth; `templates/` hold every target. `npm run build` regenerates everything and `npm run check` fails CI on stale output or contrast regressions (52 WCAG pairs per palette).
- The 4AM output stays byte-identical to 0.2.0: nothing about the original changed.
- Tagging a release now publishes to Open VSX, the VS Marketplace (when a token is set) and GitHub Releases automatically.
- Issue templates for color bugs (with the scope inspector) and port requests.

## 0.2.0 — the afterglow set

**Same party, easier on the eyes.** Readability fixes where colors were too dim, a calmer lime on strings, and coverage for UI areas that were still falling back to default gray. The lasers stay where they mean something.

All contrast ratios are WCAG 2.x, computed with a script.

### Readability fixes

- **Terminal text is lime now, as promised:** `terminal.foreground` `#e6dcf5` → `#b6ff5c` (16.84:1 on `#07050c`). It now matches the README and the T3 port.
- **ANSI black is visible:** `terminal.ansiBlack` `#1c1433` → `#5f5485` (1.16:1 → 2.99:1). White-on-black blocks still read at 4.56:1.
- **ANSI bright black (dim output) is readable:** `terminal.ansiBrightBlack` `#6f6494` → `#857ab0` (3.79:1 → 5.22:1). It now matches the comment color.
- **Ghost text** (Copilot / Cursor suggestions): `editorGhostText.foreground` `#5f5485` → `#7d71a3`. That's 2.88:1 → 4.43:1 on the editor background. It stays dimmer than comments, so suggestions still look provisional.
- **Inactive activity bar icons:** `activityBar.inactiveForeground` `#5f5485` → `#7d71a3` (2.94:1 → 4.53:1).

### Syntax

- **Afterglow lime strings:** `#b6ff5c` → `#a6e85f` for strings, Markdown code, semantic `string`, and the string symbol icon. That's 13.34:1, a notch calmer on large JSON or config files. Laser lime `#b6ff5c` stays on terminal, git-added, diff-inserted, and bracket pair 4.
- **Peach fuzz type parameters:** semantic `typeParameter` `#ffd27a` → `#ffb98a` italic (11.69:1), plus a matching TextMate rule. Generics no longer look the same as regular parameters.

### New UI coverage (47 keys, all from the existing palette)

- Overview ruler git marks: added, modified, deleted
- Sticky scroll: background, border, shadow, hover
- Settings editor: headers, modified indicator, focused and hover rows, dropdowns, checkboxes, text and number inputs
- Chat (`chat.*`): request bubbles, slash commands, avatars, edited files, lines added and removed
- Inline chat (`inlineChat*`): widget, input, focus border, diff colors

Every key was checked against the official VS Code theme-color reference. Cursor's own Composer/Agent panels use the generic `input.*`, `button.*`, `list.*`, and `editorWidget.*` keys, which were already themed.

### Marketplace

- Display name: **Brass Lasers 4AM — Neon Synthwave Dark Theme**. The theme picker label is still **Brass Lasers 4AM**, so existing `workbench.colorTheme` settings keep working.
- Description rewritten to lead with searchable terms.
- Keywords expanded to 27: festival culture (yes, `wook` stays) plus the terms people actually search for.

### Docs and packaging

- README: three screenshots, `releases/latest` install link, new palette rows, and a typo fix ("mileage")
- `media/screenshots/`: real, type-checked TSX and Rust samples, a terminal color demo clearly labeled as simulated output, and a step-by-step capture guide
- `.vscodeignore`: excludes screenshots and samples, plans, `.github`, Cargo `target/`, and release notes
- `.gitignore`: ignores Cargo `target/` and `Cargo.lock`, plus the temporary `RELEASE_NOTES.md`

### Zed (new)

- New native Zed port in `zed/`. It's a self-contained extension (`brass-lasers-4am-theme`) built on Zed's theme schema v0.2.0.
- Covers 143 style keys and 8 multiplayer cursor colors. It also includes the 9 newer keys Zed's built-in One Dark already uses (version-control colors, active search match, hover line number).
- All 46 syntax highlight names Zed's built-in One Dark uses, with the same color roles as the VS Code theme: pink keywords, afterglow lime strings, cyan functions, brass types, pale-gold italic parameters.
- Zed has no semantic-token layer, so peach type parameters, Rust `mut` underline and bold `unsafe` stay VS Code-only.

### T3 Code

- Checked key by key. The T3 palette has no syntax, ANSI, ghost-text, chat, or settings roles, and `terminalForeground` was already `#b6ff5c`. **No changes needed.**

## 0.1.0 — first light on the lot

**The debut set.** Void-purple chrome, brass-gold hardware, hot-pink lasers — a full dark theme for VS Code & Cursor, plus a matching T3 Code palette for the unofficial gallery.

### Editor theme

- Workbench colors for editor, sidebar, tabs, terminal, diff, git decorations, notifications, and focus chrome
- TextMate token colors with enough personality that invalid tokens feel like “the rail-rider who lost their friends”
- Semantic token colors for languages that speak LSP
- Marketplace packaging as `heyoub.brass-lasers-4am` (VS Code Marketplace + Open VSX)

### T3 Code

- Gallery-ready export: `t3/brass-lasers-4am.json` (`id`: `brass-lasers-4am`, `author`: `heyoub`)
- Same hex party as the editor theme, mapped to T3 color roles

### Docs

- README with install paths for VS Code, Cursor, and VSIX
- Activate steps, palette map, T3 import instructions
- This changelog, because even wooks deserve a setlist
