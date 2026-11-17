#!/usr/bin/env node
// Icon lab: three candidate "organic" finishes for Brass Lasers file icons, rendered side by
// side with the unmodified open-source originals so a human can choose. EXPERIMENTAL: writes
// only to media/icon-lab/ and is not wired into the shipped icon theme.
//
//   Resin        Catppuccin line geometry, recolored from the set's palette, with a soft tinted
//                glass body inside the outer shape
//   Enamel       Material filled geometry, palette-harmonized, with a vertical light gradient
//                and a top sheen
//   Enamel Edge  Enamel plus a darker rim and a small cut shadow (the "little bite")
//
// Sources (MIT, see media/icon-lab/sources/*/LICENSE and PROVENANCE.txt):
//   catppuccin/vscode-icons (css-variables variant, so every color is a named role)
//   material-extensions/vscode-material-icon-theme
// Geometry is never edited: proportions stay the source's. Only paint is changed.
"use strict";
const fs = require("fs");
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");
const { hexToOklch, oklchToHex, lighten, mix } = require("./color.js");
const { ratio } = require("./contrast-lib.js");

const ROOT = path.join(__dirname, "..");
const LAB = path.join(ROOT, "media", "icon-lab");
const SRC = path.join(LAB, "sources");
const PALETTES = JSON.parse(fs.readFileSync(path.join(ROOT, "site", "palettes.json"), "utf8"));
const P = (slug) => PALETTES.find((p) => p.meta.slug === slug);

// lab icon -> current Brass badge id (icons/<scheme>/<id>.svg)
const ICONS = [
  ["_root", "root"], ["_folder", "folder"], ["_folder_open", "folder-open"], ["folder_src", "folder"], ["folder_docs", "folder"], ["folder_assets", "folder"],
  ["typescript", "ts"], ["typescript-react", "tsx"], ["javascript", "js"], ["rust", "rs"], ["python", "py"],
  ["json", "json"], ["yaml", "yml"], ["toml", "toml"], ["env", "env"], ["docker", "docker"], ["git", "git"],
  ["bash", "sh"], ["powershell", "ps1"], ["markdown", "md"], ["readme", "readme"], ["package-json", "npm"],
  ["cargo", "cargo"], ["lock", "lock"], ["css", "css"], ["html", "html"], ["license", "license"],
];
const FOLDERS = new Set(["_root", "_folder", "_folder_open"]);
const MATERIAL_FALLBACK = { _root: "_folder", _folder_open: "_folder" };
// Resin: icons whose first path is a closed outer silhouette that can take a glass body.
// Decided by looking at the renders; open line drawings (python, git...) stay pure line.
const NO_BODY = new Set(["python", "git", "docker", "bash", "env", "lock", "license", "cargo", "rust", "markdown", "readme", "package-json", "yaml", "toml"]);

// ---------- color roles ----------
const CTP = { text: "text", subtext0: "overlay2", subtext1: "overlay2", overlay0: "overlay1", overlay1: "overlay1", overlay2: "overlay2", blue: "blue", sapphire: "cyan", sky: "cyan", teal: "cyan", green: "lime", yellow: "brass", peach: "sunset", maroon: "red", red: "red", mauve: "uv", pink: "pink", lavender: "lavender", flamingo: "pinkLight", rosewater: "sand" };
const HUES = ["blue", "cyan", "lime", "brass", "sunset", "red", "pink", "uv", "lavender"];
// On light sets the palette darkens accents for TEXT contrast (4.5:1). Icons are graphics and
// need 3:1 (WCAG 1.4.11), so lift a fill to the brightest tone that still clears 3:1 on the
// sidebar: vivid instead of bronze, never washed out.
function forIcons(c, pal) {
  if (hexToOklch(pal.base).L < 0.5) return c;
  let best = c;
  for (let dL = 0.02; dL <= 0.3; dL += 0.02) {
    const up = lighten(c, dL);
    if (ratio(up, pal.mantle) >= 3.0 && ratio(up, pal.base) >= 3.0) best = up; else break;
  }
  return best;
}
function harmonize(src, pal) {
  const s = hexToOklch(src);
  if (s.C < 0.04) return s.L > 0.6 ? pal.text : pal.overlay2;
  let best = null, bd = 1e9;
  for (const k of HUES) {
    const t = hexToOklch(pal[k]);
    const d = Math.abs(((t.h - s.h + 540) % 360) - 180);
    if (d < bd) { bd = d; best = pal[k]; }
  }
  return mix(src, best, 0.7); // keep a little of the brand color; mostly the set's
}

// ---------- SVG helpers ----------
const parse = (svg) => {
  const vb = (svg.match(/viewBox="([^"]+)"/) || [, "0 0 16 16"])[1].split(/[\s,]+/).map(Number);
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  return { vb, inner };
};
const shapes = (inner) => [...inner.matchAll(/<(path|circle|rect|ellipse|polygon)\b[^>]*?\/>/g)].map((m) => m[0]);

// ---------- treatments: (icon, palette, uid) -> { vb, inner } ----------
// the real finishes, shared with the shipped theme (scripts/icon-finish.js)
const finish = require("./icon-finish.js");
function resin(name, pal, uid) {
  const raw = fs.readFileSync(path.join(SRC, "catppuccin", `${name}.svg`), "utf8");
  return finish.parse(finish.resin(raw, pal, uid, { plain: FOLDERS.has(name), body: !NO_BODY.has(name) }));
}
function enamel(name, pal, uid, { edge = false } = {}) {
  const f = path.join(SRC, "material", `${MATERIAL_FALLBACK[name] || name}.svg`);
  if (!fs.existsSync(f)) return null;
  let svg = fs.readFileSync(f, "utf8");
  // plain folders are brass in the lab's Material columns, as they were in the prototype
  if (FOLDERS.has(name)) svg = svg.replace(/fill="#[0-9a-fA-F]{3,6}"/, `fill="${pal.brass}"`);
  return finish.parse(finish.edge(svg, pal, uid, { rim: edge }));
}
// baselines, untouched
const original = (dir) => (name) => {
  const f = path.join(SRC, dir, `${name}.svg`);
  return fs.existsSync(f) ? parse(fs.readFileSync(f, "utf8")) : null;
};
const badge = (scheme) => (name) => {
  const id = ICONS.find(([n]) => n === name)[1];
  const f = path.join(ROOT, "icons", scheme, `${id}.svg`);
  return fs.existsSync(f) ? parse(fs.readFileSync(f, "utf8")) : null;
};

const VARIANTS = (pal, light) => [
  { key: "material", label: "Material (original)", make: original("material") },
  { key: "catppuccin", label: `Catppuccin ${light ? "Latte" : "Mocha"} (original)`, make: original(light ? "catppuccin-latte" : "catppuccin-mocha") },
  { key: "badges", label: "Brass badges (shipping)", make: badge(light ? "light" : "dark") },
  { key: "resin", label: "A · Resin", make: (n, uid) => resin(n, pal, uid) },
  { key: "enamel", label: "B · Enamel", make: (n, uid) => enamel(n, pal, uid) },
  { key: "edge", label: "C · Enamel Edge", make: (n, uid) => enamel(n, pal, uid, { edge: true }) },
];

let uidN = 0;
const place = (icon, x, y, size) => {
  if (!icon) return `<rect x="${x + size / 2 - 1}" y="${y + size / 2 - 1}" width="2" height="2" fill="#888" opacity=".4"/>`;
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${icon.vb.join(" ")}">${icon.inner}</svg>`;
};
const render = (svg, file, scale = 1) => {
  const png = new Resvg(svg, { fitTo: { mode: "zoom", value: scale }, font: { loadSystemFonts: true, defaultFontFamily: "Segoe UI" }, shapeRendering: 2 }).render().asPng();
  fs.writeFileSync(file, png);
};
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// ---------- sheet 1: native sizes ----------
function sizesSheet(slug) {
  const pal = P(slug), light = pal.meta.appearance === "light", vars = VARIANTS(pal.colors, light);
  const SIZES = [16, 20, 24, 32, 64], COLW = SIZES.reduce((a, s) => a + s + 10, 0) + 24, ROWH = 76, LEFT = 130, TOP = 64;
  const W = LEFT + vars.length * COLW, H = TOP + ICONS.length * ROWH + 20;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="${pal.colors.mantle}"/>`;
  s += `<text x="16" y="28" font-size="16" font-weight="700" fill="${pal.colors.text}">Brass Lasers ${esc(pal.meta.name)} · native sizes ${SIZES.join(" / ")} px (1 image px = 1 screen px)</text>`;
  vars.forEach((v, i) => (s += `<text x="${LEFT + i * COLW}" y="54" font-size="13" font-weight="600" fill="${pal.colors.brass}">${esc(v.label)}</text>`));
  ICONS.forEach(([name], r) => {
    const y = TOP + r * ROWH;
    s += `<text x="16" y="${y + 40}" font-size="12" fill="${pal.colors.subtext0}">${esc(name)}</text>`;
    vars.forEach((v, i) => {
      let x = LEFT + i * COLW;
      for (const sz of SIZES) { s += place(v.make(name, `u${uidN++}`), x, y + (64 - sz) / 2 + 4, sz); x += sz + 10; }
    });
  });
  return s + "</svg>";
}

// ---------- sheet 2: a real-looking explorer ----------
const TREE = [
  [0, "_root", "brass-lasers", 1], [1, "_folder", ".github"], [1, "folder_docs", "docs"], [1, "folder_assets", "media"], [1, "folder_src", "src", 1],
  [2, "typescript", "main.ts"], [2, "typescript-react", "App.tsx"], [2, "javascript", "worker.js"], [2, "rust", "lib.rs"], [2, "python", "build.py"],
  [2, "json", "theme.json"], [2, "yaml", "ci.yaml"], [2, "css", "styles.css"], [2, "html", "index.html"], [2, "bash", "deploy.sh"], [2, "powershell", "setup.ps1"],
  [1, "_folder", "templates"], [1, "env", ".env"], [1, "git", ".gitignore"], [1, "docker", "Dockerfile"], [1, "cargo", "Cargo.toml"], [1, "lock", "Cargo.lock"],
  [1, "toml", "rustfmt.toml"], [1, "markdown", "CHANGELOG.md"], [1, "license", "LICENSE"], [1, "package-json", "package.json"], [1, "lock", "package-lock.json"], [1, "readme", "README.md"],
];
function explorerSheet(slugs) {
  const PW = 236, ROW = 22, HEAD = 34, GAP = 14;
  const panels = slugs.flatMap((slug) => { const pal = P(slug); return VARIANTS(pal.colors, pal.meta.appearance === "light").map((v) => ({ v, pal })); });
  const per = panels.length / slugs.length;
  const W = per * (PW + GAP) + GAP, PH = HEAD + TREE.length * ROW + 10, H = slugs.length * (PH + GAP) + GAP;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#000"/>`;
  panels.forEach(({ v, pal }, i) => {
    const c = pal.colors, x = GAP + (i % per) * (PW + GAP), y = GAP + Math.floor(i / per) * (PH + GAP);
    s += `<rect x="${x}" y="${y}" width="${PW}" height="${PH}" fill="${c.mantle}"/>`;
    s += `<text x="${x + 10}" y="${y + 21}" font-size="11" font-weight="700" letter-spacing=".6" fill="${c.subtext0}">${esc(v.label.toUpperCase())} · ${esc(pal.meta.name.toUpperCase())}</text>`;
    TREE.forEach(([depth, icon, label, open], r) => {
      const ry = y + HEAD + r * ROW;
      if (r === 9) s += `<rect x="${x}" y="${ry}" width="${PW}" height="${ROW}" fill="${c.selectionActive}"/>`;
      const ix = x + 10 + depth * 14 + (FOLDERS.has(icon) || icon.startsWith("folder") ? 0 : 12);
      if (FOLDERS.has(icon) || icon.startsWith("folder")) s += `<text x="${ix}" y="${ry + 15}" font-size="10" fill="${c.overlay2}">${open ? "▾" : "›"}</text>`;
      const name = icon === "_folder" && open ? "_folder_open" : icon;
      s += place(v.make(name, `u${uidN++}`), ix + (FOLDERS.has(icon) || icon.startsWith("folder") ? 12 : 0), ry + 3, 16);
      s += `<text x="${ix + (FOLDERS.has(icon) || icon.startsWith("folder") ? 34 : 22)}" y="${ry + 15}" font-size="13" fill="${r === 9 ? c.text : c.textSidebar}">${esc(label)}</text>`;
    });
  });
  return s + "</svg>";
}

// ---------- sheet 3: one icon row across all nine sets, per treatment ----------
function paletteStrip() {
  const pick = ["_folder", "folder_src", "typescript", "rust", "python", "json", "docker", "git", "markdown"];
  const SZ = 32, CELL = SZ + 10, LEFT = 150, ROWH = SZ + 18;
  const treat = [["A · Resin", (n, pal, u) => resin(n, pal, u)], ["B · Enamel", (n, pal, u) => enamel(n, pal, u)], ["C · Enamel Edge", (n, pal, u) => enamel(n, pal, u, { edge: true })]];
  const W = LEFT + treat.length * (pick.length * CELL + 30), H = 50 + PALETTES.length * ROWH;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#08060c"/>`;
  treat.forEach(([label], t) => (s += `<text x="${LEFT + t * (pick.length * CELL + 30)}" y="30" font-size="14" font-weight="700" fill="#efe6d5">${label}</text>`));
  PALETTES.forEach((p, r) => {
    const y = 44 + r * ROWH;
    s += `<rect x="0" y="${y}" width="${W}" height="${ROWH - 4}" fill="${p.colors.base}"/>`;
    s += `<text x="12" y="${y + ROWH / 2 + 2}" font-size="12" fill="${p.colors.text}">${esc(p.meta.time + " " + p.meta.name)}</text>`;
    treat.forEach(([, make], t) => pick.forEach((n, i) => (s += place(make(n, p.colors, `u${uidN++}`), LEFT + t * (pick.length * CELL + 30) + i * CELL, y + 5, SZ))));
  });
  return s + "</svg>";
}

fs.mkdirSync(LAB, { recursive: true });
for (const slug of ["4am", "daybreak"]) render(sizesSheet(slug), path.join(LAB, `sizes-${slug}.png`));
const ex = explorerSheet(["4am", "daybreak"]);
render(ex, path.join(LAB, "explorer-1x.png"));
render(ex, path.join(LAB, "explorer-2x.png"), 2);
render(paletteStrip(), path.join(LAB, "all-sets.png"));
// the candidate SVGs themselves, every set, for inspection or a later packaging step
for (const p of PALETTES) for (const [key, make] of [["resin", resin], ["enamel", enamel], ["edge", (n, c, u) => enamel(n, c, u, { edge: true })]]) {
  const dir = path.join(LAB, "candidates", key, p.meta.slug);
  fs.mkdirSync(dir, { recursive: true });
  for (const [name] of ICONS) { const ic = make(name, p.colors, "i"); if (ic) fs.writeFileSync(path.join(dir, `${name}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ic.vb.join(" ")}">${ic.inner}</svg>\n`); }
}
console.log("icon lab: media/icon-lab/{sizes-4am,sizes-daybreak,explorer-1x,explorer-2x,all-sets}.png + candidates/");
