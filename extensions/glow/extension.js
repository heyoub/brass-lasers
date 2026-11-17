// Brass Lasers Neon Glow: patches workbench.html with a <script> tag that adds a
// glow to laser-colored tokens. Fully reversible with "Disable Neon Glow".
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

const TAG_START = "<!-- BRASS-LASERS-GLOW -->";
const TAG_END = "<!-- /BRASS-LASERS-GLOW -->";
const SCRIPT = "brass-lasers-glow.js";

// VS Code has moved workbench.html between versions; try every known spot.
function findWorkbench() {
  const base = path.join(vscode.env.appRoot, "out", "vs", "code");
  const candidates = [
    "electron-browser/workbench/workbench.html",
    "electron-sandbox/workbench/workbench.html",
    "electron-browser/workbench/workbench-dev.html",
  ].map((p) => path.join(base, p));
  return candidates.find((p) => fs.existsSync(p));
}

function lasers(context) {
  // every laser color from every palette that shipped with this extension
  const colors = new Set();
  const dir = path.join(context.extensionPath, "palettes");
  for (const f of fs.readdirSync(dir)) {
    const c = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")).colors;
    for (const k of ["pink", "pinkLight", "cyan", "cyanLight", "lime", "afterglow", "brass", "brassLight", "sunset", "uv"]) colors.add(c[k].toLowerCase());
  }
  return [...colors];
}

async function enable(context) {
  const html = findWorkbench();
  if (!html) return vscode.window.showErrorMessage("Brass Lasers Glow: couldn't find workbench.html in this editor build.");
  const ok = await vscode.window.showWarningMessage(
    "Neon Glow patches your editor's workbench.html. Your editor will say the installation is corrupt or unsupported. That's expected and safe to dismiss. Run \"Disable Neon Glow\" to undo it, and re-enable after editor updates.",
    { modal: true },
    "Light it up",
  );
  if (ok !== "Light it up") return;
  try {
    const intensity = vscode.workspace.getConfiguration("brassLasersGlow").get("intensity", 0.6);
    const js = fs
      .readFileSync(path.join(context.extensionPath, "glow.js"), "utf8")
      .replace("__INTENSITY__", String(Math.min(1, Math.max(0.1, intensity))))
      .replace("__LASERS__", JSON.stringify(lasers(context)));
    fs.writeFileSync(path.join(path.dirname(html), SCRIPT), js);
    let page = strip(fs.readFileSync(html, "utf8"));
    page = page.replace("</html>", `${TAG_START}<script src="${SCRIPT}"></script>${TAG_END}\n</html>`);
    fs.writeFileSync(html, page);
    reload("Neon Glow enabled.");
  } catch (e) {
    permissionHelp(e);
  }
}

function disable() {
  const html = findWorkbench();
  if (!html) return;
  try {
    fs.writeFileSync(html, strip(fs.readFileSync(html, "utf8")));
    const js = path.join(path.dirname(html), SCRIPT);
    if (fs.existsSync(js)) fs.unlinkSync(js);
    reload("Neon Glow disabled.");
  } catch (e) {
    permissionHelp(e);
  }
}

const strip = (page) => page.replace(new RegExp(`${TAG_START}[\\s\\S]*?${TAG_END}\\n?`, "g"), "");

async function reload(msg) {
  const r = await vscode.window.showInformationMessage(`${msg} Restart the editor to see it.`, "Restart now");
  if (r) vscode.commands.executeCommand("workbench.action.reloadWindow");
}

function permissionHelp(e) {
  vscode.window.showErrorMessage(
    `Brass Lasers Glow couldn't write to the editor's install folder (${e.code || e.message}). ` +
      "If it's installed system-wide, run the editor as administrator once, enable the glow, then restart normally.",
  );
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("brassLasersGlow.enable", () => enable(context)),
    vscode.commands.registerCommand("brassLasersGlow.disable", disable),
  );
}

module.exports = { activate, deactivate() {} };
