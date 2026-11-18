# Brass Lasers for Zed

The Zed port of [Brass Lasers](https://github.com/heyoub/brass-lasers): <!--=sets-->nine<!--/--> color themes, one for every hour of the festival, each with a No Italics flavor (<!--=themes-->18<!--/--> themes).

| Time | Set |
|---|---|
| 4AM | **4AM**, the original: void purple, brass, hot-pink lasers |
| 5AM | **Atrium 5AM**: biophilic greenhouse, lagoon and moss |
| 6AM | **Daybreak** (light): porcelain mist, indigo ink |
| 12PM | **Soundcheck** (matte): heyoub.dev's palette with the shine sanded off |
| 5PM | **Golden Hour** (light): solarized-subtropical daylight |
| 8PM | **Afterglow**: wine-plum dusk, coral and mint |
| 10PM | **Liquid Metal**: FBF's chrome and yellow-cyan-purple spark spectrum |
| 12AM | **Midnight**: navy, moonlight, sodium streetlights |
| 2AM | **Strobe** (high contrast): pure black, UV magenta, AAA syntax |

## Install

- **From the Zed extension registry** (submitted in [zed-industries/extensions#8369](https://github.com/zed-industries/extensions/pull/8369), awaiting review): `zed: extensions` → search **Brass Lasers** → Install.
- **Local / dev install:** run `zed: install dev extension` from the command palette and pick this `zed/` folder.

Then open the theme selector (`theme selector: toggle`) and pick any **Brass Lasers** theme.

## What maps, and what doesn't

Zed themes use Tree-sitter syntax names, not TextMate scopes, and Zed has no semantic-token layer. So:

- **Same as VS Code:** every set's keyword, string, function, type, parameter, constant, comment and terminal colors.
- **Not available in Zed:** the separate type-parameter color (Zed's standard captures don't distinguish type parameters), Rust `mut` underline and bold `unsafe` (semantic tokens in VS Code), and VS Code-only UI areas like the settings editor and chat.

## Files

- `extension.toml`: the extension manifest (`id = "brass-lasers-theme"`).
- `themes/brass-lasers.json`: every theme, generated from `palette/*.json` by `scripts/build.js` (Zed theme schema v0.2.0). Don't edit it by hand.
