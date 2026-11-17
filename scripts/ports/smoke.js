#!/usr/bin/env node
// L3 runtime smoke: load every set in the real CLI tools and check the palette's colors come
// out the other end. Run by .github/workflows/ports-weekly.yml (Linux); works anywhere the
// tools are on PATH (or pass BL_BIN=<dir>). Each tool also gets a broken-config control.
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { ROOT, PALETTES } = require("./targets.js");

const BIN = process.env.BL_BIN;
const exe = (n) => (BIN ? path.join(BIN, process.platform === "win32" ? `${n}.exe` : n) : n);
const run = (cmd, args, opts = {}) => {
  const r = spawnSync(exe(cmd), args, { encoding: "utf8", maxBuffer: 1 << 26, ...opts, env: { ...process.env, ...(opts.env || {}) } });
  if (r.error) throw new Error(`${cmd}: ${r.error.message}`);
  return { out: (r.stdout || "") + (r.stderr || ""), code: r.status };
};
const tc = (h) => `38;2;${parseInt(h.slice(1, 3), 16)};${parseInt(h.slice(3, 5), 16)};${parseInt(h.slice(5, 7), 16)}`;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bl-smoke-"));
const sample = path.join(ROOT, "media", "screenshots", "samples", "neon-setlist.tsx");
let failures = 0;
const report = (tool, slug, ok, detail = "") => { if (!ok) failures++; console.log(`${ok ? "PASS" : "FAIL"} ${tool.padEnd(9)} ${slug.padEnd(13)} ${detail}`); };

// ---- Neovim: :colorscheme, then exact highlight values ----
const nvimLua = path.join(tmp, "check.lua");
fs.writeFileSync(nvimLua, `
local ok, err = pcall(vim.cmd.colorscheme, "brass-lasers-" .. vim.env.BL_SLUG)
local function hex(g, k) local h = vim.api.nvim_get_hl(0, { name = g, link = false }); return h[k] and string.format("#%06x", h[k]) or "nil" end
io.stdout:write((ok and "ok" or "ERR") .. "|" .. hex("Normal", "bg") .. "|" .. hex("Normal", "fg") .. "|" .. hex("Keyword", "fg") .. "\\n")
vim.cmd("qa!")`);
const nvim = (slug) => run("nvim", ["--headless", "--clean", "--cmd", `set rtp+=${ROOT.replace(/\\/g, "/")}`, "-c", `luafile ${nvimLua.replace(/\\/g, "/")}`], { env: { BL_SLUG: slug } }).out.trim().split("|");
for (const p of PALETTES) {
  const c = p.colors, got = nvim(p.meta.slug), want = ["ok", c.base, c.textEditor, c.pink];
  report("neovim", p.meta.slug, got.join("|") === want.join("|"), got.join("|") === want.join("|") ? "" : `got ${got.join("|")} want ${want.join("|")}`);
}
report("neovim", "control", nvim("does-not-exist")[0] === "ERR", "unknown colorscheme must error");

// ---- bat + delta: build a theme cache in an isolated XDG/APPDATA dir both tools read ----
const home = path.join(tmp, "home");
const isolated = { XDG_CACHE_HOME: path.join(home, "cache"), XDG_CONFIG_HOME: path.join(home, "config"), LOCALAPPDATA: path.join(home, "local"), APPDATA: path.join(home, "roaming"), COLORTERM: "truecolor" };
const batCfg = run("bat", ["--config-dir"], { env: isolated }).out.trim();
fs.mkdirSync(path.join(batCfg, "themes"), { recursive: true });
for (const f of fs.readdirSync(path.join(ROOT, "ports", "bat"))) fs.copyFileSync(path.join(ROOT, "ports", "bat", f), path.join(batCfg, "themes", f));
run("bat", ["cache", "--build"], { env: isolated });
// delta finds bat's cache through dirs::cache_dir(). On Linux/macOS that honors XDG_CACHE_HOME
// (isolated above); on Windows it asks the OS for %LOCALAPPDATA% directly, so build a temporary
// cache there, and only when none exists already (never touch a real one).
const winCache = process.platform === "win32" ? path.join(process.env.LOCALAPPDATA || "", "bat") : null;
const ownWinCache = winCache && !fs.existsSync(winCache);
if (ownWinCache) run("bat", ["cache", "--build"], { env: { ...isolated, LOCALAPPDATA: process.env.LOCALAPPDATA } });
const deltaTestable = !winCache || ownWinCache;
const a = path.join(tmp, "a.ts"), b = path.join(tmp, "b.ts");
fs.copyFileSync(sample, a);
fs.writeFileSync(b, fs.readFileSync(sample, "utf8").replace("const MAX_BPM = 128;", 'const MAX_BPM = 140; // "turn it up"').replace("return [];", 'return ["fallback"];'));
for (const p of PALETTES) {
  const name = `Brass Lasers ${p.meta.name}`, c = p.colors;
  const bat = run("bat", ["--theme", name, "--color=always", "--style=plain", "--paging=never", sample], { env: isolated }).out;
  const miss = ["pink", "afterglow", "cyan", "brass"].filter((k) => !bat.includes(tc(c[k])));
  report("bat", p.meta.slug, !miss.length, miss.length ? `missing ${miss.join(",")}` : "");
  if (!deltaTestable) { console.log(`SKIP delta     ${p.meta.slug.padEnd(13)} a real bat cache exists in %LOCALAPPDATA%; not touching it`); continue; }
  const delta = run("delta", ["--syntax-theme", name, "--true-color", "always", "--paging", "never", a, b], { env: isolated }).out;
  const dmiss = ["pink", "afterglow"].filter((k) => !delta.includes(tc(c[k])));
  report("delta", p.meta.slug, !/unknown theme/i.test(delta) && !dmiss.length, /unknown theme/i.test(delta) ? "theme not found" : dmiss.length ? `missing ${dmiss.join(",")}` : "");
}
report("bat", "control", /unknown theme|not found/i.test(run("bat", ["--theme", "Brass Lasers Nope", "--color=always", sample], { env: isolated }).out), "unknown theme must warn");

// ---- fzf: every --color spec accepted ----
for (const p of PALETTES) {
  const sh = fs.readFileSync(path.join(ROOT, "ports", "fzf", `brass-lasers-${p.meta.slug}.sh`), "utf8");
  const opts = [...sh.matchAll(/--color=([^\s\\"]+)/g)].map((m) => `--color=${m[1]}`);
  const r = run("fzf", ["--filter", "alp", ...opts], { input: "alpha\nbeta\n" });
  report("fzf", p.meta.slug, r.code === 0 && r.out.trim() === "alpha", r.code === 0 ? "" : r.out.trim().slice(0, 120));
}
report("fzf", "control", run("fzf", ["--filter", "x", "--color=bg:#zzzzzz"], { input: "x\n" }).code !== 0, "invalid color must be rejected");

// ---- Starship: palette names render as the palette's truecolor values ----
for (const p of PALETTES) {
  const cfg = path.join(tmp, `starship-${p.meta.slug}.toml`);
  fs.writeFileSync(cfg, `format = "[KW](pink)[ST](afterglow)[FN](cyan)[TY](brass)"\n` + fs.readFileSync(path.join(ROOT, "ports", "starship", `brass-lasers-${p.meta.slug}.toml`), "utf8"));
  const out = run("starship", ["prompt"], { env: { STARSHIP_CONFIG: cfg, STARSHIP_LOG: "warn" } }).out;
  const miss = ["pink", "afterglow", "cyan", "brass"].filter((k) => !out.includes(tc(p.colors[k])));
  report("starship", p.meta.slug, !miss.length && !/\[(WARN|ERROR)\]/.test(out), miss.length ? `missing ${miss.join(",")}` : "");
}

fs.rmSync(tmp, { recursive: true, force: true });
if (ownWinCache) fs.rmSync(winCache, { recursive: true, force: true });
console.log(failures ? `\n${failures} FAILURES` : "\nall runtime smoke checks passed");
process.exit(failures ? 1 : 0);
