# Publish Brass Lasers

## Ship a release

1. As you work, add notes under `## Unreleased` at the top of `CHANGELOG.md`. You can give it a name: `## Unreleased — the night shift`.
2. When you're ready:

   ```bash
   npm run release -- minor          # or patch, major, or an exact version like 0.7.0
   git push --follow-tags            # this is the step that publishes
   ```

`npm run release` bumps `package.json` and `zed/extension.toml` together, turns `## Unreleased` into the version heading, rebuilds, runs every check, then commits and tags. Nothing leaves your machine until you push. Add `--push` to do both in one go.

Pushing the tag runs `.github/workflows/release.yml`. It checks that the tag, `package.json`, `zed/extension.toml` and the CHANGELOG agree, runs every gate (build, contrast, ports, icons), packages the VSIX and publishes it everywhere that has a token. It publishes Neon Glow too when its version is new, then creates the GitHub Release with that version's CHANGELOG notes.

Versions and counts in the docs (`README.md`, this file, `zed/README.md`, `ports/README.md`) are filled in by `npm run build`, so don't edit them by hand:
- `brass-lasers-4am-X.Y.Z.vsix` always follows `package.json`.
- Values wrapped like `<!--=themes-->18<!--/-->` come from the data. The keys are listed in `scripts/build.js` under `docVars`.

CI fails if any of them is stale.

## Where it lives

Extension ID on every registry: **`heyoub.brass-lasers-4am`**. Site: https://heyoub.github.io/brass-lasers/

| Where | Status | What it needs |
|---|---|---|
| Open VSX (Cursor, VSCodium) | **Live**, published on every tag. Cursor's store mirrors it within minutes | `OVSX_PAT` repo secret (set) |
| GitHub Releases | **Live**, VSIX attached on every tag | nothing |
| GitHub Pages site | **Live**, redeploys on site changes and after the Art bot redraws | nothing |
| VS Marketplace | **Not published** | An Azure DevOps PAT saved as the `VSCE_PAT` repo secret (below). The next tag publishes |
| Zed registry | **Submitted:** [zed-industries/extensions#8369](https://github.com/zed-industries/extensions/pull/8369), awaiting maintainer review | Reply to review comments within 3 weeks. Later versions: see [Zed](#zed-registry) |
| T3 Themes gallery | **Live**, all nine sets | Re-submit a set only if its palette changes |
| Neon Glow (`heyoub.brass-lasers-glow`) | **Live on Open VSX** | Bump `extensions/glow/package.json`; the next tag publishes it |

## Install it yourself: from the store, not a file

Install from the Extensions panel (search **Brass Lasers 4AM**) so it updates on its own. An extension installed from a `.vsix` file is pinned to that version and never updates. If you have one of those:

```bash
cursor --uninstall-extension heyoub.brass-lasers-4am
cursor --install-extension heyoub.brass-lasers-4am      # from the store
```

Use `code` instead of `cursor` for VS Code. To test a build before it ships, `npm run package` makes `brass-lasers-4am-0.6.0.vsix`; install that, then switch back to the store version afterwards.

## VS Marketplace

1. Create an Azure DevOps organization, then go to User settings → Personal access tokens → New token.
   - Organization: **All accessible organizations**
   - Scopes: **Marketplace → Manage**
2. Create the publisher **`heyoub`** at https://marketplace.visualstudio.com/manage (it must match `publisher` in `package.json`).
3. Save the token as the `VSCE_PAT` repo secret: `gh secret set VSCE_PAT`. The next tag publishes there too.

## Zed registry

The extension lives in `zed/` (`id = "brass-lasers-theme"`, all <!--=themes-->18<!--/--> themes in `zed/themes/brass-lasers.json`, MIT license copied into `zed/LICENSE` because Zed requires it there). The fork is `heyoub/extensions`, branch `add-brass-lasers-theme`.

Rules: one extension per PR, at most three open PRs, replies to feedback within 3 weeks, and the fork must be on a personal account.

**Updating after #8369 merges:**
1. Ship a release as above.
2. In Zed, run `zed: install dev extension` on `zed/` at that commit and check the themes.
3. In the fork, sync with upstream, point the submodule at the new commit, and set the same `version` under `[brass-lasers-theme]` in `extensions.toml`:

   ```bash
   git -C extensions/brass-lasers-theme fetch
   git -C extensions/brass-lasers-theme checkout <release commit>
   ```

   Commit, then open a PR titled `Update brass-lasers-theme to <version>`.

## T3 Themes gallery

The gallery JSON is generated into `t3/`. Submit at https://www.t3themes.com/submit/ while signed in as `heyoub` (the `author` field is already set), or open a PR touching only `themes/<file>.json` on https://github.com/SunkenInTime/t3-themes. Single-theme PRs auto-merge once checks pass.
