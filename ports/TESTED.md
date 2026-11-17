# Port test report

Every port, all nine sets, tested on Windows 11 on 2026-11-17. Where a tool runs on Windows, the port was loaded in the **real app or CLI**. Where it doesn't, each key was checked against the **app's own source code or schema**. Every check was paired with a deliberately broken control, to prove the check catches failures.

| Port | How it was tested | Result |
|---|---|---|
| **VS Code / Cursor** | Loaded in Cursor; screenshots of all nine sets (`media/screenshots/sets/`) | ✅ 9/9 |
| **Zed** | Installed as a dev extension; all 18 themes in the selector; 6 screenshotted (`media/screenshots/zed/`) | ✅ 18/18 |
| **Neovim** 0.12.6 | `:colorscheme` headless; `Normal`, `Keyword`, `String`, `Function`, `Type` and `@variable.parameter` match the palette hex exactly; `g:brass_lasers_no_italics` works | ✅ 9/9 |
| **Helix** 25.07.1 | Launched with each theme; log has zero theme warnings (a single bad color reference is warned on) | ✅ 9/9 |
| **bat** 0.26.1 | Theme cache built; highlighted output has the palette's truecolor keyword, string, function and type | ✅ 9/9 |
| **delta** 0.20.1 | Syntax theme found via bat's cache; diff output carries the palette colors | ✅ 9/9 |
| **fzf** 0.75.0 | All `--color` groups accepted (fzf rejects invalid specs at startup) | ✅ 9/9 |
| **Starship** 1.27.0 | Palette names render as the palette's truecolor values in a real prompt | ✅ 9/9 |
| **WezTerm** 20240203 | `wezterm.color.load_scheme` parses each file; background, foreground, ANSI and name read back correctly | ✅ 9/9 |
| **Alacritty** 0.17.0 | Launched with each theme imported; the theme is in the loaded-config list with zero warnings (an unknown key is warned on) | ✅ 9/9 |
| **Windows Terminal** | Validated against Microsoft's official settings schema (strict: unknown keys and bad colors fail) | ✅ 9/9 |
| **Firefox** | `web-ext lint` clean, and all 34 color keys exist in Firefox's own `theme.json` schema | ✅ 9/9 |
| **JetBrains** | All 62 keys exist in IntelliJ's `DefaultColorSchemesManager.xml` / `DefaultLanguageHighlighterColors`; light sets inherit from Default, dark from Darcula | ✅ 9/9 (keys; not opened in an IDE) |
| **Obsidian** 1.15.1 | All 60 variables are actually read (`var(...)`) by Obsidian's `app.css` | ✅ 9/9 (not opened in Obsidian) |
| **Discord** | All 35 current variables exist in Discord's live stylesheet | 🔧 **Fixed:** 18 of 33 variables had been renamed by Discord; remapped to the current system, legacy names kept as a fallback (not rendered in Discord) |
| **Kitty** | All 37 options exist in kitty's `options/definition.py` | ✅ 9/9 (macOS/Linux only) |
| **Ghostty** | All keys exist in Ghostty's `Config.zig`; 16 palette entries | ✅ 9/9 (macOS/Linux only) |
| **iTerm2** | All keys exist in iTerm2's `ITAddressBookMgr.h` | ✅ 9/9 (macOS only) |
| **Sublime Text** | All 17 globals are documented settings; every `var()` resolves | ✅ 9/9 (not opened in Sublime) |
| **Raycast** | Link matches Raycast's own `ray.so` builder | 🔧 **Fixed:** an extra "border" color shifted every slot after it, and names with spaces weren't URL-encoded |
| **Boot banners** | `.sh` in Git Bash; `.ps1` in PowerShell 7 **and** Windows PowerShell 5.1 | 🔧 **Fixed:** PowerShell 5.1 failed to parse BOM-less UTF-8; `.ps1` files now ship with a UTF-8 BOM |
| **T3 Code** | The gallery's own validator (`npm run validate`) | ✅ 9/9 |
| **Slack** | Five hex values typed in by hand; nothing to execute | ➖ not testable |

## Known gaps

- **Rendered visually only in Cursor and Zed.** Everything else is verified at the format and key level (or, for terminals, by the app loading the file without warnings), not by looking at it in the app.
- **Discord** renames its variables periodically. Re-run the check when it looks off.
