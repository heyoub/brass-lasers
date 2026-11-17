# Brass Lasers ports

Every file in this folder (and in `../colors/`) is **generated** from `palette/*.json` by `node scripts/build.js`. Don't edit them by hand. Change a palette or a template in `templates/ports/`, rebuild, and every port updates together.

Each port ships all nine sets, in set-time order: **4AM** (the original), **Atrium 5AM**, **Daybreak** (6AM, light), **Soundcheck** (12PM, matte), **Golden Hour** (5PM, light), **Afterglow** (8PM), **Liquid Metal** (10PM), **Midnight** (12AM) and **Strobe** (2AM, high contrast). Swap `4am` in any file name for `atrium`, `daybreak`, `soundcheck`, `golden-hour`, `afterglow`, `liquid-metal`, `midnight` or `strobe`.

Every port has been tested: see **[TESTED.md](TESTED.md)** for how and what passed.

## Terminals

| Terminal | Install |
|---|---|
| **Windows Terminal** | Settings → **Open JSON file** → paste the object from `windows-terminal/brass-lasers-<variant>.json` into `"schemes"`, then set `"colorScheme": "Brass Lasers 4AM"` on a profile. |
| **Ghostty** | Copy `ghostty/brass-lasers-<variant>` into `~/.config/ghostty/themes/`, then add `theme = brass-lasers-4am` to your config. |
| **WezTerm** | Copy `wezterm/brass-lasers-<variant>.toml` into `~/.config/wezterm/colors/`, then set `config.color_scheme = "Brass Lasers 4AM"`. |
| **Kitty** | Copy `kitty/brass-lasers-<variant>.conf` next to `kitty.conf` and add `include brass-lasers-4am.conf`. |
| **Alacritty** | Add `import = ["~/path/to/alacritty/brass-lasers-4am.toml"]` under `[general]` in `alacritty.toml`. |
| **iTerm2** | Settings → Profiles → Colors → **Color Presets… → Import…** → pick `iterm2/Brass Lasers <Variant>.itermcolors`. |

## Editors

| Editor | Install |
|---|---|
| **Cursor / VSCodium** | Search **Brass Lasers 4AM** in Extensions (Open VSX). All variants, plus **No Italics** versions, appear in the theme picker. |
| **VS Code** | Install the `.vsix` from the [latest release](https://github.com/heyoub/brass-lasers/releases/latest) (Marketplace listing coming). |
| **Zed** | Registry submission [#8369](https://github.com/zed-industries/extensions/pull/8369) is awaiting review; once merged, search **Brass Lasers** in `zed: extensions`. Until then, run `zed: install dev extension` and pick the `zed/` folder. |
| **Neovim** | lazy.nvim: `{ "heyoub/brass-lasers", lazy = false, priority = 1000, config = function() vim.cmd.colorscheme("brass-lasers-4am") end }`. Set `vim.g.brass_lasers_no_italics = true` before loading to drop italics. |
| **Helix** | Copy `helix/brass_lasers_<variant>.toml` into `~/.config/helix/themes/` and set `theme = "brass_lasers_4am"`. |
| **Sublime Text** | Copy `sublime/Brass Lasers <Variant>.sublime-color-scheme` into your `Packages/User/` folder, then pick it in **UI: Select Color Scheme**. |
| **JetBrains IDEs** | Settings → Editor → Color Scheme → ⚙ → **Import Scheme…** → `jetbrains/Brass Lasers <Variant>.icls`. |

## CLI tools

| Tool | Install |
|---|---|
| **bat** | `mkdir -p "$(bat --config-dir)/themes"`, copy `bat/*.tmTheme` in, run `bat cache --build`, then `export BAT_THEME="Brass Lasers 4AM"`.  If colors look slightly off, your terminal isn't advertising truecolor: set `COLORTERM=truecolor`. |
| **delta** | Same `.tmTheme` as bat: install it for bat, then set `syntax-theme = Brass Lasers 4AM` under `[delta]` in `.gitconfig`.  Add `true-color = always` under `[delta]` for exact colors. |
| **fzf** | `source ports/fzf/brass-lasers-4am.sh` from your shell rc. |
| **Starship** | Paste `starship/brass-lasers-<variant>.toml` into `starship.toml`, then use `brass`, `pink`, `cyan`… as color names. |

## Apps

| App | Install |
|---|---|
| **Obsidian** | Copy `obsidian/brass-lasers-<variant>.css` into `<vault>/.obsidian/snippets/` and enable it under Appearance → CSS snippets. |
| **Discord** (Vencord / BetterDiscord) | Drop `discord/brass-lasers-<variant>.theme.css` into your themes folder. |
| **Firefox** | `about:debugging` → This Firefox → **Load Temporary Add-on…** → `firefox/<variant>/manifest.json`. |
| **Slack** | Follow `slack/brass-lasers-<variant>.md` (five hex values). |
| **Raycast** | Open the link in `raycast/brass-lasers-<variant>.md`. |
| **T3 Code** | `t3/brass-lasers-<variant>.json`, or the T3 Themes gallery. |
