# Brass Lasers Neon Glow (experimental)

Opt-in laser glow for the [Brass Lasers](https://github.com/heyoub/brass-lasers) themes. Keywords, strings, functions and types get a soft neon halo. Everything else stays crisp.

> **Read this first.** VS Code has no API for glow effects. This extension edits your editor's own `workbench.html` to load a small script. Afterwards VS Code (or Cursor) will show **"Your installation appears to be corrupt"**. That warning is expected and safe to dismiss. Editor updates overwrite the patch, so re-run **Enable** after updating.

## Use

1. Install **Brass Lasers 4AM** and this extension.
2. `Ctrl+Shift+P` → **Brass Lasers: Enable Neon Glow** → confirm → restart.
3. Undo any time: **Brass Lasers: Disable Neon Glow** → restart.

The glow only switches on while a Brass Lasers theme is active. Switch to any other theme and it turns off by itself.

## Settings

| Setting | Default | |
|---|---|---|
| `brassLasersGlow.intensity` | `0.6` | `0.1` is subtle, `1` is full rave. Re-run **Enable** after changing it. |

## If Enable fails

If your editor is installed system-wide (for example under `Program Files`), it needs write access once. Run the editor as administrator, enable the glow, then go back to normal.
