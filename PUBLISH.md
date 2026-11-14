# Publish Brass Lasers 4AM

You already have a local VSIX: `brass-lasers-4am-0.1.0.vsix`.

Extension ID on both registries: **`heyoub.brass-lasers-4am`**

---

## Smoke test (before you ship)

### Cursor

1. Extensions → `…` → **Install from VSIX…**
2. Select `brass-lasers-4am-0.1.0.vsix`
3. `Ctrl+K Ctrl+T` → choose **Brass Lasers 4AM**
4. Check: editor void purple, pink cursor/focus, brass line numbers, lime terminal text

### VS Code

Same steps, or:

```bash
code --install-extension .\brass-lasers-4am-0.1.0.vsix
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
npx @vscode/vsce publish --packagePath brass-lasers-4am-0.1.0.vsix -p YOUR_VSCE_PAT
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
4. Claim the namespace (once):

```bash
npx ovsx create-namespace heyoub -p YOUR_OVSX_PAT
```

5. Publish the same VSIX:

```bash
npx ovsx publish brass-lasers-4am-0.1.0.vsix -p YOUR_OVSX_PAT
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

## Repo checklist

- Push this folder to https://github.com/heyoub/brass-lasers so `repository` / `bugs` links resolve
- Attach the `.vsix` to a GitHub Release for “Install from VSIX” folks
- After Open VSX is live, search **Brass Lasers 4AM** inside Cursor Extensions

---

## Env vars (optional)

```bash
# PowerShell examples — do not commit these
$env:VSCE_PAT = "..."
$env:OVSX_PAT = "..."
npx @vscode/vsce publish --packagePath brass-lasers-4am-0.1.0.vsix -p $env:VSCE_PAT
npx ovsx publish brass-lasers-4am-0.1.0.vsix -p $env:OVSX_PAT
```
