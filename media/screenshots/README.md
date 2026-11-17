# Screenshot capture guide

This folder holds the sample files and the instructions for capturing the three Marketplace screenshots. It is excluded from the VSIX (`.vscodeignore` → `media/screenshots/**`). The final PNGs live here too, and the README embeds them through `raw.githubusercontent.com` URLs.

| Output file | Shows |
|---|---|
| `tsx.png` | TypeScript + React: keywords, strings, generics, parameters, type params, JSX, comments |
| `rust.png` | Rust: lifetimes, traits, generics, macros, attributes, `&mut self`, `unsafe` |
| `full-window.png` | Whole window: sidebar, tabs, editor, integrated terminal with ANSI colors |

The samples are real code, not mockups:

- `samples/neon-setlist.tsx` type-checks cleanly with strict mode on (`npm exec --prefix media/screenshots/samples -- tsc -p media/screenshots/samples`, 0 errors). From the repo root, a bare `npx tsc` resolves to the unrelated npm package named `tsc` and prints an error banner.
- `samples/laser-rig` passes `cargo check` with 0 warnings.
- `samples/laser-check.ps1` prints **simulated** output for color demonstration. Every line says so (banner plus a `[demo]` prefix).

---

## 0. One-time setup

1. From the repo root, build and install the theme you are about to publish:

   ```bash
   npx @vscode/vsce package
   code --install-extension brass-lasers-4am-0.2.0.vsix --force
   ```

   (In Cursor: Extensions → `…` → **Install from VSIX…**.)

2. `Ctrl+K Ctrl+T` → select **Brass Lasers 4AM**.
3. Install the TSX sample's real dependencies so the editor shows no errors:

   ```bash
   cd media/screenshots/samples
   npm install
   npx tsc -p .
   ```

   The last command must print nothing (0 errors).

4. Make sure the **rust-analyzer** extension is installed.
5. Add these **temporary** user settings (`Ctrl+Shift+P` → *Preferences: Open User Settings (JSON)*). Note your previous values so you can restore them:

   ```json
   "editor.fontSize": 15,
   "editor.lineHeight": 1.6,
   "editor.minimap.enabled": false,
   "editor.stickyScroll.enabled": false,
   "workbench.statusBar.visible": true,
   "window.zoomLevel": 0
   ```

   Don't disable TypeScript validation. The samples are meant to be genuinely error-free.

6. Maximize the window on a 1920×1080 or larger display. Close the Welcome tab, notifications, and any Copilot or Cursor popups.

---

## 1. `tsx.png`: TypeScript / React

1. **File → Open Folder** → the repo root.
2. Open `media/screenshots/samples/neon-setlist.tsx`.
3. Confirm the Problems panel (`Ctrl+Shift+M`) shows **0** problems for this file.
4. Click inside `pickHeadliner` on the word `acts`, so the word highlight and bracket-pair colors show.
5. `Ctrl+B` hides the sidebar, to focus on code.
6. `Win+Shift+S` → **Window** mode → click the editor window.
7. Paste into Paint (or any editor), crop to the tab bar plus editor area, and save as **`media/screenshots/tsx.png`**.

## 2. `rust.png`: Rust

1. **File → Open Folder** → `media/screenshots/samples/laser-rig`. rust-analyzer needs `Cargo.toml` at the workspace root.
2. Open `src/main.rs`.
3. Wait until the status bar shows rust-analyzer finished indexing. Semantic colors (lifetimes, `&mut self` underline, bold `unsafe`) appear only after that.
4. Confirm 0 problems in the Problems panel.
5. Put the cursor inside `impl<T: Display> Projector for Rig<T>`.
6. `Ctrl+B` hides the sidebar.
7. Capture the same way and save as **`media/screenshots/rust.png`**.

## 3. `full-window.png`: everything plus the terminal

1. **File → Open Recent** → the repo root.
2. Show the sidebar (`Ctrl+B`) with Explorer open. Uncommitted changes in the repo show git decoration colors.
3. Open `media/screenshots/samples/neon-setlist.tsx`.
4. Open the terminal with ``Ctrl+` `` and drag it to about 40% of the window height.
5. Run the color demo. Its output is clearly labeled as simulated:

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File media/screenshots/samples/laser-check.ps1
   ```

6. Then run two **real** commands below it:

   ```bash
   git log --oneline --graph --decorate --color -n 6
   npm exec --prefix media/screenshots/samples -- tsc -p media/screenshots/samples
   ```

7. Capture the **whole window** (no crop) and save as **`media/screenshots/full-window.png`**.

---

## 4. Finish

1. PNG only. The Marketplace rejects SVG images in READMEs.
2. Keep each file under about 1 MB. Optionally: `npx --yes oxipng -o 4 media/screenshots/*.png`.
3. Restore your previous user settings.
4. Commit and push **before** publishing, so the raw GitHub URLs in the README resolve:

   ```bash
   git add media/screenshots/*.png
   git commit -m "Add v0.2.0 screenshots"
   git push origin master
   ```

5. Check that each URL loads in a browser:
   - https://raw.githubusercontent.com/heyoub/brass-lasers/master/media/screenshots/tsx.png
   - https://raw.githubusercontent.com/heyoub/brass-lasers/master/media/screenshots/rust.png
   - https://raw.githubusercontent.com/heyoub/brass-lasers/master/media/screenshots/full-window.png
