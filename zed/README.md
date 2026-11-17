# Brass Lasers 4AM for Zed

The Zed port of [Brass Lasers 4AM](https://github.com/heyoub/brass-lasers): void-purple chrome, brass-gold accents, hot-pink lasers, lime strings. It uses the same palette as the VS Code / Cursor theme v0.2.0.

## Install

- **From the Zed extension registry** (once published): `zed: extensions` → search **Brass Lasers 4AM** → Install.
- **Local / dev install:** run `zed: install dev extension` from the command palette and pick this `zed/` folder.

Then open the theme selector (`theme selector: toggle`) and pick **Brass Lasers 4AM**.

## What maps, and what doesn't

Zed themes use Tree-sitter syntax names, not TextMate scopes, and Zed has no semantic-token layer. So:

- **Same as VS Code:** pink keywords, afterglow lime `#a6e85f` strings, cyan functions, brass types, pale-gold italic parameters, sunset constants, fog comments, lime terminal text, and the readable ANSI black `#5f5485` and bright black `#857ab0`.
- **Not available in Zed:**
  - The separate peach type-parameter color. Zed's standard captures don't distinguish type parameters.
  - Rust `mut` underline and bold `unsafe`. Those come from semantic tokens in VS Code.
  - Settings editor and chat colors. Those are VS Code-only UI areas.

## Files

- `extension.toml`: the extension manifest (`id = "brass-lasers-4am-theme"`).
- `themes/brass-lasers-4am.json`: the theme, which follows the `https://zed.dev/schema/themes/v0.2.0.json` schema.
- `LICENSE`: MIT. Zed requires the license file to sit inside the extension folder itself.
