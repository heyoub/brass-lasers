#!/usr/bin/env node
// Refreshes scripts/ports/contracts/*.json from each app's own source of truth: its config
// schema, option definitions, docs, or (Discord, Obsidian) the live stylesheet. A contract
// records which of OUR keys the upstream app recognizes, so the offline check can verify them.
//
//   node scripts/refresh-port-contracts.js            fetch and write every contract
//   node scripts/refresh-port-contracts.js --check    fetch, compare with the committed
//        contracts, write a drift report to $GITHUB_STEP_SUMMARY (or stdout), and exit:
//          0  no change, or upstream changed without breaking us
//          1  a key we ship is no longer recognized upstream (a real compatibility break)
//   --only discord,firefox   limit to some contracts
"use strict";
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { ROOT, PALETTES, TARGETS } = require("./ports/targets.js");

const CHECK = process.argv.includes("--check");
const only = (process.argv.find((a) => a.startsWith("--only=")) || "").slice(7).split(",").filter(Boolean);
const DIR = path.join(__dirname, "ports", "contracts");
const UA = { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36" };
const get = async (url, opts = {}) => {
  const r = await fetch(url, { headers: { ...UA, ...(opts.headers || {}) } });
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  return opts.binary ? Buffer.from(await r.arrayBuffer()) : r.text();
};
const gh = (repo, file, ref = "master") => `https://raw.githubusercontent.com/${repo}/${ref}/${file}`;
const all = (text, re) => [...text.matchAll(re)].map((m) => m[1]);

// Each source returns { name, url, version?, keys: Set } — every key the app recognizes.
const SOURCES = {
  async sublime() {
    const url = "https://www.sublimetext.com/docs/color_schemes.html";
    return { name: "Sublime Text color scheme docs", url, keys: new Set(all(await get(url), /id="([a-z_]+)"/g)) };
  },
  async jetbrains() {
    const base = "https://raw.githubusercontent.com/JetBrains/intellij-community/master/";
    const files = ["platform/platform-resources/src/DefaultColorSchemesManager.xml", "platform/platform-resources/src/themes/expUI/expUI_darkScheme.xml", "platform/platform-resources/src/themes/expUI/expUI_lightScheme.xml"];
    const keys = new Set();
    for (const f of files) for (const k of all(await get(base + f), /<option name="([A-Z][A-Z0-9_.]*)"/g)) keys.add(k);
    for (const k of all(await get(base + "platform/core-api/src/com/intellij/openapi/editor/DefaultLanguageHighlighterColors.java"), /createTextAttributesKey\(\s*"([A-Z_]+)"/g)) keys.add(k);
    return { name: "IntelliJ default color schemes + DefaultLanguageHighlighterColors", url: "https://github.com/JetBrains/intellij-community", keys };
  },
  async "windows-terminal"() {
    const url = "https://raw.githubusercontent.com/microsoft/terminal/main/doc/cascadia/profiles.schema.json";
    const s = JSON.parse(await get(url));
    return { name: "Windows Terminal settings schema", url, keys: new Set(Object.keys(s.$defs.SchemeList.items.properties)) };
  },
  async ghostty() {
    const url = gh("ghostty-org/ghostty", "src/config/Config.zig", "main");
    const t = await get(url);
    const keys = new Set([...all(t, /^\s*@"([a-z0-9-]+)"\s*:/gm), ...all(t, /^\s*([a-z][a-z0-9_]*)\s*:\s*[A-Za-z?[]/gm).map((k) => k.replace(/_/g, "-"))]);
    return { name: "Ghostty Config.zig", url, keys };
  },
  async kitty() {
    const url = gh("kovidgoyal/kitty", "kitty/options/definition.py");
    const keys = new Set(all(await get(url), /opt\(\s*'([a-z0-9_]+)'/g));
    for (let i = 0; i < 256; i++) keys.add(`color${i}`);
    return { name: "kitty options/definition.py", url, keys };
  },
  async iterm2() {
    const url = gh("gnachman/iTerm2", "sources/Settings/Profiles/ITAddressBookMgr.h");
    return { name: "iTerm2 ITAddressBookMgr.h", url, keys: new Set(all(await get(url), /#define KEY_\w+\s+@"([^"]+)"/g)) };
  },
  async fzf() {
    const url = gh("junegunn/fzf", "man/man1/fzf.1");
    const t = await get(url);
    const i = t.indexOf("COLOR NAMES:");
    if (i < 0) throw new Error("fzf.1: COLOR NAMES section not found");
    const sec = t.slice(i, t.indexOf("ANSI COLORS", i) > 0 ? t.indexOf("ANSI COLORS", i) : i + 6000);
    const keys = new Set();
    for (const m of sec.matchAll(/\\fB([a-z\\+-]+)(?: \(([a-z\\+-]+)\))?\s*\\fR/g)) for (const k of [m[1], m[2]]) if (k) keys.add(k.replace(/\\-/g, "-"));
    return { name: "fzf man page (COLOR NAMES)", url, keys };
  },
  async firefox() {
    const url = gh("mozilla-firefox/firefox", "toolkit/components/extensions/schemas/theme.json", "main");
    const s = JSON.parse((await get(url)).split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n"));
    const theme = s.flatMap((ns) => ns.types || []).find((t) => t.id === "ThemeType");
    return { name: "Firefox theme.json schema", url, keys: new Set(Object.keys(theme.properties.colors.properties)) };
  },
  async discord() {
    const url = "https://discord.com/app";
    const html = await get(url);
    const sheets = [...new Set(all(html, /href="(\/assets\/[^"]+\.css)"/g))];
    if (!sheets.length) throw new Error("discord: no stylesheets found on /app");
    let css = "";
    for (const s of sheets) css += await get("https://discord.com" + s);
    return { name: "Discord live stylesheet", url, version: `${sheets.length} stylesheets`, keys: new Set(all(css, /(--[a-z0-9-]+)\s*:/g)) };
  },
  async obsidian() {
    // the app's own CSS ships inside the release's app.asar; a variable counts only if app.css reads it
    const rel = JSON.parse(await get("https://api.github.com/repos/obsidianmd/obsidian-releases/releases/latest", { headers: { accept: "application/vnd.github+json" } }));
    const asset = rel.assets.find((a) => a.name.endsWith(".asar.gz"));
    const asar = zlib.gunzipSync(await get(asset.browser_download_url, { binary: true }));
    // asar: [4 pickle][4 headerSize][4 payload][4 jsonLen][json...] then file data at 8 + headerSize
    const headerSize = asar.readUInt32LE(4), jsonLen = asar.readUInt32LE(12);
    const header = JSON.parse(asar.toString("utf8", 16, 16 + jsonLen));
    const entry = header.files["app.css"];
    const start = 8 + headerSize + Number(entry.offset);
    const css = asar.toString("utf8", start, start + entry.size);
    return { name: "Obsidian app.css (variables it reads)", url: asset.browser_download_url, version: rel.tag_name, keys: new Set(all(css, /var\((--[\w-]+)/g)) };
  },
};

// the keys our generated files use, per contract (union over all sets), minus deliberate legacy keys
function ourKeys(id) {
  const t = TARGETS.find((x) => x.contract === id);
  const keys = new Set(), legacy = new Set();
  for (const p of PALETTES) for (const rel of t.files(p)) {
    const text = fs.readFileSync(path.join(ROOT, rel), "utf8");
    for (const k of t.keys(t.parse(text, rel), text)) keys.add(k);
    if (t.legacy) for (const k of t.legacy(text)) legacy.add(k);
  }
  for (const k of legacy) keys.delete(k);
  return [...keys].sort();
}

(async () => {
  fs.mkdirSync(DIR, { recursive: true });
  const ids = TARGETS.filter((t) => t.contract).map((t) => t.contract).filter((id) => !only.length || only.includes(id));
  const today = new Date().toISOString().slice(0, 10);
  const report = [];
  let broken = 0;
  for (const id of ids) {
    let src;
    try { src = await SOURCES[id](); } catch (e) { report.push(`| ${id} | ⚠️ couldn't fetch upstream: ${e.message} | — |`); continue; }
    const mine = ourKeys(id);
    const recognized = mine.filter((k) => src.keys.has(k));
    const unrecognized = mine.filter((k) => !src.keys.has(k));
    const file = path.join(DIR, `${id}.json`);
    const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : { recognized: [] };
    const lost = prev.recognized.filter((k) => !src.keys.has(k));
    const gained = recognized.filter((k) => !prev.recognized.includes(k));
    if (CHECK) {
      if (lost.length) { broken++; report.push(`| ${id} | ❌ **break:** upstream no longer recognizes ${lost.map((k) => `\`${k}\``).join(", ")} | ${src.name} |`); }
      else if (gained.length || unrecognized.length) report.push(`| ${id} | ℹ️ source change, still compatible${gained.length ? `; newly recognized: ${gained.join(", ")}` : ""}${unrecognized.length ? `; unverified: ${unrecognized.join(", ")}` : ""} | ${src.name} |`);
      else report.push(`| ${id} | ✅ unchanged (${recognized.length} keys) | ${src.name} |`);
    } else {
      const c = { source: { name: src.name, url: src.url, ...(src.version ? { version: src.version } : {}) }, refreshed: today, recognized };
      fs.writeFileSync(file, JSON.stringify(c, null, 2) + "\n");
      report.push(`| ${id} | ${recognized.length} recognized${unrecognized.length ? `, **${unrecognized.length} NOT recognized: ${unrecognized.join(", ")}**` : ""} | ${src.name} |`);
    }
  }
  const md = `### Port contracts${CHECK ? " drift check" : " refreshed"}\n\n| Contract | Result | Source |\n|---|---|---|\n${report.join("\n")}\n`;
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
  console.log(md);
  if (CHECK && process.env.DRIFT_REPORT) fs.writeFileSync(process.env.DRIFT_REPORT, md);
  process.exit(broken ? 1 : 0);
})();
