# Publish Brass Lasers

**Releases are automated.** Bump `version` in `package.json` and `zed/extension.toml`, add a `## <version> — <name>` section to `CHANGELOG.md`, then:

```bash
git tag v0.6.0 && git push origin v0.6.0
```

`.github/workflows/release.yml` checks the tag against `package.json`, runs `build --check` and the contrast gate, packages the VSIX, publishes to every registry that has a token secret, and creates the GitHub Release with notes from the CHANGELOG.

Extension ID on every registry: **`heyoub.brass-lasers-4am`**. Site: https://heyoub.github.io/brass-lasers/

| Where | Status | What it needs |
|---|---|---|
| Open VSX (Cursor, VSCodium) | **Live**, published on every tag | `OVSX_PAT` repo secret (set) |
| GitHub Releases | **Live**, VSIX attached on every tag | nothing |
| GitHub Pages site | **Live**, redeploys on site changes and after the Art bot redraws | nothing |
| VS Marketplace | **Not published** | Make an Azure DevOps PAT (step 1 below) and save it as the `VSCE_PAT` repo secret. The next tag publishes. |
| Zed registry | **Submitted:** [zed-industries/extensions#8369](https://github.com/zed-industries/extensions/pull/8369). CLA signed, all checks green (cla, package, danger), awaiting maintainer review | Reply to review comments within 3 weeks. For later versions, see step 4's "Updating later" |
| T3 Themes gallery | **4AM live**; the other 8 sets are open PRs [#94](https://github.com/SunkenInTime/t3-themes/pull/94) to [#101](https://github.com/SunkenInTime/t3-themes/pull/101) | Merge (the gallery auto-merges theme PRs when checks pass) |
| Neon Glow (`heyoub.brass-lasers-glow`) | **Live on Open VSX** v0.1.0, tested end to end in Cursor (enable, glow, disable restores the install byte for byte) | Publish manually: `cd extensions/glow && npx @vscode/vsce package`, then `npx ovsx publish <vsix> -p $OVSX_PAT` |

The manual steps below still work for one-off publishing.
---|---|
| Open VSX (Cursor) | **Live:** v0.2.0 at https://open-vsx.org/extension/heyoub/brass-lasers-4am (namespace `heyoub` claimed) |
| VS Marketplace | **Not yet published:** needs a `VSCE_PAT`. Azure DevOps sign-in was failing when 0.2.0 shipped. Run step 1 below once you have the token. |

---

## Smoke test (before you ship)

### Cursor

1. Extensions → `…` → **Install from VSIX…**
2. Select `brass-lasers-4am-0.2.0.vsix`
3. `Ctrl+K Ctrl+T` → choose **Brass Lasers 4AM**
4. Check: editor void purple, pink cursor/focus, brass line numbers, lime terminal text

### VS Code

Same steps, or:

```bash
code --install-extension .\brass-lasers-4am-0.2.0.vsix
```

If anything still looks default-gray, the theme isn’t selected yet — install ≠ activate.

---

## 1) Visual Studio Marketplace

1. Create an Azure DevOps org (if you don’t have one)
2. User Settings → Personal Access Tokens → New Token
   - Organization: **All accessible organizations**
   - Scopes: **Marketplace → Manage** (or Publish)
3. Create publisher **`heyoub`** at https://marketplace.visualstudio.com/manage  
   (must match `package.json` → `publisher`)
4. Publish:

```bash
npx @vscode/vsce publish --packagePath brass-lasers-4am-0.2.0.vsix -p YOUR_VSCE_PAT
```

Or login once, then publish from the folder:

```bash
npx @vscode/vsce login heyoub
npx @vscode/vsce publish
```

---

## 2) Open VSX (Cursor)

Cursor installs third-party extensions from Open VSX.

1. Sign in at https://open-vsx.org with GitHub **`heyoub`**
2. Connect Eclipse account + sign the **Publisher Agreement**
3. Settings → Access Tokens → generate one
4. Claim the namespace (once, already done for `heyoub`):

```bash
npx ovsx create-namespace heyoub -p YOUR_OVSX_PAT
```

5. Publish the same VSIX:

```bash
npx ovsx publish brass-lasers-4am-0.2.0.vsix -p YOUR_OVSX_PAT
```

---

## 3) T3 Themes gallery (unofficial)

Gallery JSON is ready: [`t3/brass-lasers-4am.json`](t3/brass-lasers-4am.json)

**Easiest:** https://www.t3themes.com/submit/

1. Paste the JSON from `t3/brass-lasers-4am.json`
2. Preview in the real T3 UI
3. Open the prefilled PR **while signed in as `heyoub`**
4. `author` must be `heyoub` (already set)

CI auto-merges single-theme PRs when checks are green (often under an hour).

Manual path: PR only `themes/brass-lasers-4am.json` into https://github.com/SunkenInTime/t3-themes

---

## 4) Zed extension registry

**Status:** submitted as [zed-industries/extensions#8369](https://github.com/zed-industries/extensions/pull/8369). The CLA is signed, and all checks pass (cla-signed, package, danger). It's waiting on maintainer review. Zed asks for replies to review feedback within 3 weeks.

The extension lives in `zed/` (`id = "brass-lasers-theme"`, name **Brass Lasers**, all 18 themes in `zed/themes/brass-lasers.json`). The MIT license is copied into `zed/LICENSE`, since Zed requires it inside the extension folder. The fork is `heyoub/extensions`, branch `add-brass-lasers-theme`. The submodule is pinned to `ab5bc1f`, the commit that was tested as a dev extension (screenshots in `media/screenshots/zed/`).

**Rules:**
- One extension per PR, at most three open PRs.
- Respond to maintainer feedback within 3 weeks.
- Fork to your personal account, not an org.

**Updating later** (after #8369 merges):
1. Bump `version` in `zed/extension.toml` (the release workflow requires it to match `package.json`), regenerate with `npm run build`, push, and tag the release.
2. In Zed, run `zed: install dev extension` on `zed/` at that commit and check the themes.
3. In your fork of `zed-industries/extensions`, sync with upstream, then:

   ```bash
   git -C extensions/brass-lasers-theme fetch
   git -C extensions/brass-lasers-theme checkout <new commit>
   ```

   Set the same `version` under `[brass-lasers-theme]` in `extensions.toml`, then commit and open a PR titled `Update brass-lasers-theme to <version>`.

---
## Repo checklist

- Push this folder to https://github.com/heyoub/brass-lasers so `repository` / `bugs` links resolve
- Attach the `.vsix` to a GitHub Release for “Install from VSIX” folks
- Open VSX is live; search **Brass Lasers 4AM** inside Cursor Extensions

---

## Env vars (optional)

```bash
# PowerShell examples — do not commit these
$env:VSCE_PAT = "..."
$env:OVSX_PAT = "..."
npx @vscode/vsce publish --packagePath brass-lasers-4am-0.2.0.vsix -p $env:VSCE_PAT
npx ovsx publish brass-lasers-4am-0.2.0.vsix -p $env:OVSX_PAT
```
