// Every port target, declared once: how to parse it, which keys it uses (checked against an
// upstream contract snapshot), and which palette roles its main surfaces must carry
// (semantic parity). scripts/check-ports.js runs these on every PR, offline.
//
// Role families (the intent, stated once):
//   editor ports   — background = base,  text = textEditor, keyword = pink
//   terminal ports — background = crust, foreground = lime
"use strict";
const fs = require("fs");
const path = require("path");
const TOML = require("smol-toml");
const { XMLValidator } = require("fast-xml-parser");

const ROOT = path.join(__dirname, "..", "..");
const PALETTES = JSON.parse(fs.readFileSync(path.join(ROOT, "site", "palettes.json"), "utf8"));
const PORTS = JSON.parse(fs.readFileSync(path.join(ROOT, "templates", "ports", "ports.json"), "utf8"));

const outFor = (template, p) => {
  const e = PORTS.find((x) => x.template === template);
  if (!e) throw new Error(`ports.json has no ${template}`);
  return e.out.replace("{slug}", p.meta.slug).replace("{name}", p.meta.name);
};
const vscodeName = (p) => `themes/Brass-Lasers-${p.meta.name.replace(/ /g, "-")}-color-theme.json`;

// ---- parsers ----
const json = (t) => JSON.parse(t);
const toml = (t) => TOML.parse(t);
const xml = (t) => { const r = XMLValidator.validate(t); if (r !== true) throw new Error(`XML: ${r.err.msg} (line ${r.err.line})`); return t; };
const lines = (re) => (t) => { const out = []; for (const l of t.split(/\r?\n/)) { const m = l.match(re); if (m) out.push([m[1], m[2]]); } return out; };
const cssVars = (t) => [...t.matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm)].map((m) => [m[1], m[2].trim()]);
const hex = (v) => (typeof v === "string" ? v.trim().toLowerCase() : v);
const plistColor = (t, key) => {
  const m = t.match(new RegExp(`<key>${key}</key>\\s*<dict>([\\s\\S]*?)</dict>`));
  if (!m) return undefined;
  const c = (n) => Math.round(parseFloat(m[1].match(new RegExp(`<key>${n} Component</key>\\s*<real>([\\d.]+)</real>`))[1]) * 255);
  return "#" + [c("Red"), c("Green"), c("Blue")].map((v) => v.toString(16).padStart(2, "0")).join("");
};

// ---- targets ----
// files(p): output path(s) for palette p
// parse(text): throws on malformed input (L1)
// keys(parsed, text): the upstream-facing keys this file uses (L2 contract)
// roles: { name: [extract(parsed, text) -> hex, paletteKey] } (L2 semantic parity)
// legacy: keys deliberately kept even though upstream no longer recognizes them
// inject(text): the same file with one bogus key added (negative control for the contract)
// runtime: how real-app loading is proven (L3); visual: sets seen on screen (L4)
const TARGETS = [
  {
    id: "vscode", name: "VS Code / Cursor", files: (p) => [vscodeName(p)], parse: json,
    roles: {
      background: [(o) => o.colors["editor.background"], "base"],
      text: [(o) => o.colors["editor.foreground"], "textEditor"],
      keyword: [(o) => o.tokenColors.find((r) => [].concat(r.scope).includes("keyword"))?.settings.foreground, "pink"],
    },
  },
  {
    id: "zed", name: "Zed", files: () => ["zed/themes/brass-lasers.json"], parse: json, shared: true,
    roles: {
      background: [(o, _, p) => zedTheme(o, p).style["editor.background"], "base"],
      text: [(o, _, p) => zedTheme(o, p).style["editor.foreground"], "textEditor"],
      keyword: [(o, _, p) => zedTheme(o, p).style.syntax.keyword.color, "pink"],
    },
  },
  {
    id: "neovim", name: "Neovim", files: (p) => [outFor("neovim.lua", p)],
    parse: (t) => { const c = {}; const m = t.match(/local c = \{([\s\S]*?)\n\}/); if (!m) throw new Error("no color table"); for (const [, k, v] of m[1].matchAll(/(\w+) = "(#[0-9a-fA-F]{6})"/g)) c[k] = v; return { c, t }; },
    roles: {
      background: [(o) => o.c[o.t.match(/\bNormal = \{ fg = c\.(\w+), bg = c\.(\w+)/)[2]], "base"],
      text: [(o) => o.c[o.t.match(/\bNormal = \{ fg = c\.(\w+)/)[1]], "textEditor"],
      keyword: [(o) => o.c[o.t.match(/\bKeyword = \{ fg = c\.(\w+)/)[1]], "pink"],
    },
  },
  {
    id: "helix", name: "Helix", files: (p) => [outFor("helix.toml", p)], parse: toml,
    roles: {
      background: [(o) => o.palette[o["ui.background"].bg], "base"],
      keyword: [(o) => o.palette[typeof o.keyword === "string" ? o.keyword : o.keyword.fg], "pink"],
    },
  },
  {
    id: "sublime", name: "Sublime Text", files: (p) => [outFor("sublime.sublime-color-scheme", p)], parse: json,
    contract: "sublime", keys: (o) => Object.keys(o.globals),
    inject: (t) => t.replace('"globals": {', '"globals": { "brass_bogus_key": "#ffffff",'),
    roles: {
      background: [(o) => varOf(o, o.globals.background), "base"],
      keyword: [(o) => varOf(o, o.rules.find((r) => r.name === "Keyword").foreground), "pink"],
    },
  },
  {
    id: "jetbrains", name: "JetBrains IDEs", files: (p) => [outFor("jetbrains.icls", p)], parse: xml,
    contract: "jetbrains", keys: (t) => [...t.matchAll(/<option name="([A-Z][A-Z0-9_.]*)"(?: value=| *>)/g)].map((m) => m[1]).filter((k) => !["FOREGROUND", "BACKGROUND", "FONT_TYPE", "EFFECT_COLOR", "EFFECT_TYPE", "ERROR_STRIPE_COLOR"].includes(k)),
    inject: (t) => t.replace("<colors>", '<colors>\n    <option name="BRASS_BOGUS_KEY" value="ffffff" />'),
    roles: {
      background: [(t) => "#" + t.match(/<option name="TEXT"><value>.*?name="BACKGROUND" value="(\w+)"/)[1], "base"],
      text: [(t) => "#" + t.match(/<option name="TEXT"><value><option name="FOREGROUND" value="(\w+)"/)[1], "textEditor"],
      keyword: [(t) => "#" + t.match(/<option name="DEFAULT_KEYWORD"><value><option name="FOREGROUND" value="(\w+)"/)[1], "pink"],
    },
  },
  {
    id: "bat", name: "bat / delta", files: (p) => [outFor("bat.tmTheme", p)], parse: xml,
    roles: {
      background: [(t) => t.match(/<key>background<\/key><string>(#\w+)<\/string>/)[1], "base"],
      text: [(t) => t.match(/<key>foreground<\/key><string>(#\w+)<\/string>/)[1], "textEditor"],
      keyword: [(t) => t.match(/<string>Keyword<\/string>[\s\S]*?<key>foreground<\/key><string>(#\w+)/)[1], "pink"],
    },
  },
  {
    id: "windows-terminal", name: "Windows Terminal", files: (p) => [outFor("windows-terminal.json", p)], parse: json,
    contract: "windows-terminal", keys: (o) => Object.keys(o),
    inject: (t) => t.replace("{", '{ "brassBogusKey": "#FFFFFF",'),
    roles: { background: [(o) => o.background, "crust"], foreground: [(o) => o.foreground, "lime"] },
  },
  {
    id: "ghostty", name: "Ghostty", files: (p) => [outFor("ghostty.conf", p)], parse: lines(/^([a-z][\w-]*)\s*=\s*(.+)$/),
    contract: "ghostty", keys: (o) => [...new Set(o.map(([k]) => k))],
    inject: (t) => t + "\nbrass-bogus-key = #ffffff\n",
    roles: { background: [(o) => o.find(([k]) => k === "background")[1], "crust"], foreground: [(o) => o.find(([k]) => k === "foreground")[1], "lime"] },
  },
  {
    id: "kitty", name: "Kitty", files: (p) => [outFor("kitty.conf", p)], parse: lines(/^([a-z][\w]*)\s+(\S+)/),
    contract: "kitty", keys: (o) => o.map(([k]) => k),
    inject: (t) => t + "\nbrass_bogus_key #ffffff\n",
    roles: { background: [(o) => o.find(([k]) => k === "background")[1], "crust"], foreground: [(o) => o.find(([k]) => k === "foreground")[1], "lime"] },
  },
  {
    id: "wezterm", name: "WezTerm", files: (p) => [outFor("wezterm.toml", p)], parse: toml,
    roles: { background: [(o) => o.colors.background, "crust"], foreground: [(o) => o.colors.foreground, "lime"] },
  },
  {
    id: "alacritty", name: "Alacritty", files: (p) => [outFor("alacritty.toml", p)], parse: toml,
    roles: { background: [(o) => o.colors.primary.background, "crust"], foreground: [(o) => o.colors.primary.foreground, "lime"] },
  },
  {
    id: "iterm2", name: "iTerm2", files: (p) => [outFor("iterm2.itermcolors", p)], parse: xml,
    contract: "iterm2", keys: (t) => [...t.matchAll(/^\t<key>([^<]+)<\/key>/gm)].map((m) => m[1]),
    inject: (t) => t.replace("<dict>", "<dict>\n\t<key>Brass Bogus Color</key>\n\t<dict><key>Red Component</key><real>1</real></dict>"),
    roles: { background: [(t) => plistColor(t, "Background Color"), "crust"], foreground: [(t) => plistColor(t, "Foreground Color"), "lime"] },
  },
  {
    id: "starship", name: "Starship", files: (p) => [outFor("starship.toml", p)], parse: toml,
    roles: {
      pink: [(o) => Object.values(o.palettes)[0].pink, "pink"],
      brass: [(o) => Object.values(o.palettes)[0].brass, "brass"],
      cyan: [(o) => Object.values(o.palettes)[0].cyan, "cyan"],
    },
  },
  {
    id: "fzf", name: "fzf", files: (p) => [outFor("fzf.sh", p)],
    parse: (t) => { const o = {}; for (const [, spec] of t.matchAll(/--color=([^\s\\"]+)/g)) for (const pair of spec.split(",")) { const [k, v] = pair.split(":"); if (!/^#[0-9a-f]{6}$/i.test(v)) throw new Error(`fzf: bad color ${pair}`); o[k] = v; } if (!Object.keys(o).length) throw new Error("no --color"); return o; },
    contract: "fzf", keys: (o) => Object.keys(o),
    inject: (t) => t.replace("--color=bg:", "--color=brassbogus:#ffffff,bg:"),
    roles: { background: [(o) => o.bg, "crust"], text: [(o) => o.fg, "textEditor"] },
  },
  {
    id: "obsidian", name: "Obsidian", files: (p) => [outFor("obsidian.css", p)], parse: cssVars,
    contract: "obsidian", keys: (o) => o.map(([k]) => k),
    inject: (t) => t.replace(/\{/, "{\n  --brass-bogus-var: #ffffff;"),
    roles: { background: [(o) => o.find(([k]) => k === "--background-primary")[1], "base"], text: [(o) => o.find(([k]) => k === "--text-normal")[1], "textEditor"] },
  },
  {
    id: "discord", name: "Discord (Vencord / BetterDiscord)", files: (p) => [outFor("discord.theme.css", p)], parse: cssVars,
    contract: "discord", keys: (o) => o.map(([k]) => k),
    legacy: (t) => cssVars(t.slice(t.indexOf("/* legacy"))).map(([k]) => k),
    inject: (t) => t.replace(/:root \{/, ":root {\n  --brass-bogus-var: #ffffff;"),
    roles: { background: [(o) => o.find(([k]) => k === "--background-base-low")[1], "base"], text: [(o) => o.find(([k]) => k === "--text-default")[1], "textEditor"] },
  },
  {
    id: "firefox", name: "Firefox", files: (p) => [outFor("firefox-manifest.json", p)], parse: json,
    contract: "firefox", keys: (o) => Object.keys(o.theme.colors),
    inject: (t) => t.replace('"colors": {', '"colors": { "brass_bogus_key": "#ffffff",'),
    roles: { frame: [(o) => o.theme.colors.frame, "mantle"], text: [(o) => o.theme.colors.toolbar_text, "text"] },
  },
  {
    id: "raycast", name: "Raycast", files: (p) => [outFor("raycast.md", p)],
    parse: (t) => { const u = new URL(t.match(/raycast:\/\/theme\?[^\s`]+/)[0]); const cols = u.searchParams.get("colors").split(","); if (cols.length !== 12) throw new Error(`raycast: ${cols.length} colors, Raycast takes 12`); if (!cols.every((c) => /^#[0-9a-f]{6}$/i.test(c))) throw new Error("raycast: bad color"); return { u, cols }; },
    roles: { background: [(o) => o.cols[0], "base"], text: [(o) => o.cols[2], "text"], loader: [(o) => o.cols[4], "pink"] },
  },
  {
    id: "slack", name: "Slack", files: (p) => [outFor("slack.md", p)],
    parse: (t) => { const c = [...t.matchAll(/\| ([^|]+) \| `(#[0-9a-f]{6})` \|/gi)].map((m) => [m[1].trim(), m[2]]); if (c.length !== 5) throw new Error(`slack: ${c.length} fields, expected 5`); return c; },
    roles: { window: [(o) => o.find(([k]) => k === "Window background")[1], "mantle"], selected: [(o) => o.find(([k]) => k === "Selected items")[1], "pink"] },
  },
  {
    id: "banner", name: "Boot banners", files: (p) => [outFor("banner.sh", p), outFor("banner.ps1", p)],
    parse: (t, f) => {
      if (f.endsWith(".ps1") && t.charCodeAt(0) !== 0xfeff) throw new Error("ps1 without UTF-8 BOM (Windows PowerShell 5.1 can't parse it)");
      if (f.endsWith(".sh") && !t.startsWith("#!")) throw new Error("sh without shebang");
      return t;
    },
  },
  {
    id: "t3", name: "T3 Code", files: (p) => [`t3/brass-lasers-${p.meta.slug}.json`], parse: json,
    roles: { background: [(o) => o.colors.canvas, "base"], text: [(o) => o.colors.text, "text"], accent: [(o) => o.colors.accent, "brass"] },
  },
];

// ---- helpers used by role extractors ----
function zedTheme(o, p) {
  const t = o.themes.find((x) => x.name === `Brass Lasers ${p.meta.name}`);
  if (!t) throw new Error(`zed: no theme "Brass Lasers ${p.meta.name}"`);
  return t;
}
function varOf(o, v) { const m = /^var\((\w+)\)$/.exec(v); return m ? o.variables[m[1]] : v; }

module.exports = { ROOT, PALETTES, TARGETS, hex };
