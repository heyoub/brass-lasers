#!/usr/bin/env node
// Brass Lasers build: palette/*.json × templates/** → every port.
//
//   node scripts/build.js          write all generated files
//   node scripts/build.js --check  fail if any generated file is stale (CI)
//
// Template syntax (works in any text format):
//   {{pink}}        → #ff3d9a
//   {{pink@55}}     → #ff3d9a55        (alpha suffix, VS Code / Zed style)
//   {{pink|nohash}} → ff3d9a
//   {{pink|r}} {{pink|g}} {{pink|b}}       → 0-255 channels
//   {{pink|rf}} {{pink|gf}} {{pink|bf}}    → 0-1 floats (iTerm2)
//   {{meta.name}}   → any palette meta field
//
// No dependencies on purpose: Node 18+ only.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const rel = (...p) => path.join(ROOT, ...p);
const read = (p) => fs.readFileSync(rel(p), "utf8");

// Variant order = order in the theme picker and every listing.
const VARIANTS = ["4am", "afterglow", "strobe", "golden-hour"];

function loadPalettes() {
  return VARIANTS.map((slug) => {
    const p = JSON.parse(read(`palette/${slug}.json`));
    if (p.meta.slug !== slug) throw new Error(`palette/${slug}.json has meta.slug ${p.meta.slug}`);
    // computed meta, available to every template
    p.meta.jetbrainsParent = p.meta.appearance === "light" ? "Default" : "Darcula";
    return p;
  });
}

const channel = (hex, i) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
const FILTERS = {
  nohash: (h) => h.slice(1),
  r: (h) => String(channel(h, 0)),
  g: (h) => String(channel(h, 1)),
  b: (h) => String(channel(h, 2)),
  rf: (h) => (channel(h, 0) / 255).toFixed(6),
  gf: (h) => (channel(h, 1) / 255).toFixed(6),
  bf: (h) => (channel(h, 2) / 255).toFixed(6),
  upper: (h) => h.toUpperCase(),
};

function render(tpl, palette, where) {
  return tpl.replace(/\{\{\s*([\w.]+)(?:@([0-9a-fA-F]{2}))?(?:\|(\w+))?\s*\}\}/g, (m, key, alpha, filter) => {
    if (key.startsWith("meta.")) {
      const v = palette.meta[key.slice(5)];
      if (v === undefined) throw new Error(`${where}: palette ${palette.meta.slug} has no ${key}`);
      return v;
    }
    const hex = palette.colors[key];
    if (!hex) throw new Error(`${where}: palette ${palette.meta.slug} has no color "${key}"`);
    let out = hex + (alpha ? alpha.toLowerCase() : "");
    if (filter) {
      if (!FILTERS[filter]) throw new Error(`${where}: unknown filter |${filter}`);
      out = FILTERS[filter](hex);
    }
    return out;
  });
}

// "No Italics" flavor: same palette, italics stripped from every font style.
function withNoItalics(palette) {
  return { ...palette, meta: { ...palette.meta, name: `${palette.meta.name} No Italics`, slug: `${palette.meta.slug}-no-italics` } };
}
const stripItalicVscode = (txt) =>
  txt.replace(/"fontStyle": "([^"]*)"/g, (m, s) => `"fontStyle": "${s.split(/\s+/).filter((w) => w && w !== "italic").join(" ")}"`);
const stripItalicZed = (txt) => txt.replace(/"font_style": "italic"/g, '"font_style": "normal"');

const fileTitle = (p) => p.meta.name.replace(/\s+/g, "-");

function renderZedFamily(themeBlocks, familyName) {
  return (
    "{\n" +
    '  "$schema": "https://zed.dev/schema/themes/v0.2.0.json",\n' +
    `  "name": "${familyName}",\n` +
    '  "author": "heyoub",\n' +
    '  "themes": [\n' +
    themeBlocks.map((b) => b.replace(/\n$/, "")).join(",\n") +
    "\n  ]\n}\n"
  );
}

// Each port: a template rendered once per palette (flavors included where fonts matter).
function portsFor(palettes) {
  const out = {};
  const ports = JSON.parse(read("templates/ports/ports.json"));
  for (const port of ports) {
    const tpl = read(`templates/ports/${port.template}`);
    for (const p of palettes) {
      const file = port.out.replace("{slug}", p.meta.slug).replace("{Title}", fileTitle(p)).replace("{name}", p.meta.name);
      out[file] = render(tpl, p, port.template);
    }
  }
  return out;
}

function buildAll() {
  const palettes = loadPalettes();
  const flavors = palettes.flatMap((p) => [p, withNoItalics(p)]);
  const files = {};

  // VS Code / Cursor / VSCodium
  const vsTpl = read("templates/vscode.json");
  const contributes = [];
  for (const p of flavors) {
    let txt = render(vsTpl, p, "vscode.json");
    if (p.meta.slug.endsWith("-no-italics")) txt = stripItalicVscode(txt);
    const file = `themes/Brass-Lasers-${fileTitle(p)}-color-theme.json`;
    files[file] = txt;
    contributes.push({ label: `Brass Lasers ${p.meta.name}`, uiTheme: p.meta.appearance === "light" ? "vs" : "vs-dark", path: `./${file}` });
  }

  // Zed: one family file with every flavor
  const zedTpl = read("templates/zed-theme.json");
  const blocks = flavors.map((p) => {
    const txt = render(zedTpl, p, "zed-theme.json");
    return p.meta.slug.endsWith("-no-italics") ? stripItalicZed(txt) : txt;
  });
  files["zed/themes/brass-lasers-4am.json"] = renderZedFamily(blocks, "Brass Lasers");

  // T3 Code: no font styles, so palettes only
  const t3Tpl = read("templates/t3.json");
  for (const p of palettes) files[`t3/brass-lasers-${p.meta.slug}.json`] = render(t3Tpl, p, "t3.json");

  Object.assign(files, portsFor(palettes));

  // package.json theme list stays in sync with the flavors
  const pkg = JSON.parse(read("package.json"));
  pkg.contributes.themes = contributes;
  files["package.json"] = JSON.stringify(pkg, null, 2) + "\n";

  return files;
}

function main() {
  const check = process.argv.includes("--check");
  const files = buildAll();
  const stale = [];
  for (const [file, content] of Object.entries(files)) {
    const abs = rel(file);
    const current = fs.existsSync(abs) ? fs.readFileSync(abs, "utf8").replace(/\r\n/g, "\n") : null;
    if (current === content) continue;
    if (check) stale.push(file);
    else {
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, content);
      console.log("wrote", file);
    }
  }
  if (check && stale.length) {
    console.error("Generated files are out of date. Run `node scripts/build.js` and commit:\n  " + stale.join("\n  "));
    process.exit(1);
  }
  console.log(check ? `ok: ${Object.keys(files).length} generated files up to date` : `done: ${Object.keys(files).length} files`);
}

if (require.main === module) main();
module.exports = { buildAll, render, loadPalettes, renderZedFamily, VARIANTS };
