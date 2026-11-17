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
| Zed registry | **Not submitted** | Test `zed/` as a dev extension in Zed, then the PR in step 4 |
| T3 Themes gallery | **4AM only** ([PR #74](https://github.com/SunkenInTime/t3-themes/pull/74)) | One PR per extra set from `t3/` (step 3) |

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

The extension lives in `zed/` (`id = "brass-lasers-4am-theme"`, MIT license copied into `zed/LICENSE`, since Zed requires it inside the extension folder). Publishing is a PR to `zed-industries/extensions`.

**Rules:**
- One extension per PR, at most three open PRs.
- Respond to maintainer feedback within 3 weeks.
- Fork to your personal account, not an org.

**Steps:**

1. **Test first.** In Zed, run `zed: install dev extension`, pick `zed/`, and select the theme. Zed requires a manual test at the exact commit you submit.
2. **Push this repo**, so the commit containing `zed/` is on a branch on GitHub.
3. **Fork and clone** `zed-industries/extensions`, then:

   ```bash
   git clone https://github.com/heyoub/extensions
   cd extensions
   git submodule init
   git submodule update
   git submodule add https://github.com/heyoub/brass-lasers.git extensions/brass-lasers-4am-theme
   ```

4. **Add an entry to the top-level `extensions.toml`.** The version must match `zed/extension.toml`:

   ```toml
   [brass-lasers-4am-theme]
   submodule = "extensions/brass-lasers-4am-theme"
   path = "zed"
   version = "0.2.0"
   ```

5. **Sort, commit and open the PR:**

   ```bash
   pnpm sort-extensions
   git add -A
   git commit -m "Add brass-lasers-4am-theme"
   ```

   Then push and open the PR.

**Updating later:**
1. Bump `version` in `zed/extension.toml`.
2. Push.
3. In your fork, update the submodule to the new commit and bump the version in `extensions.toml`.
4. Open a PR.

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
