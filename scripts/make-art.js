#!/usr/bin/env node
// Palette art: swatch cards, wallpapers (desktop + phone) and the social preview.
// Everything is drawn as SVG from palette/*.json, then rasterized with resvg.
//
//   npm run art            (= node scripts/make-art.js)
//
// Output: media/swatches/<variant>.png, media/wallpapers/<variant>-{desktop,phone}.png,
//         media/social-preview.png

const fs = require("fs");
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");
const { loadPalettes } = require("./build.js");

const ROOT = path.resolve(__dirname, "..");
const SUN_4AM = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "palette", "4am.json"), "utf8")).colors;
const MONO = "Cascadia Code, JetBrains Mono, Consolas, DejaVu Sans Mono, monospace";
const SANS = "Segoe UI, Inter, Helvetica, Arial, sans-serif";

function png(svg, out) {
  const r = new Resvg(svg, { font: { loadSystemFonts: true, defaultFontFamily: "Consolas" } });
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, r.render().asPng());
  console.log("wrote", path.relative(ROOT, out));
}

// deterministic pseudo-random so art is reproducible
function rng(seed) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

// ---------- swatch card ----------
const SWATCH_ROLES = [
  ["base", "editor"], ["mantle", "chrome"], ["crust", "terminal"], ["textEditor", "text"],
  ["pink", "keywords"], ["afterglow", "strings"], ["cyan", "functions"], ["brass", "types"],
  ["brassLight", "parameters"], ["sunset", "numbers"], ["uv", "namespaces"], ["lavender", "properties"],
  ["peach", "generics"], ["orchid", "operators"], ["comment", "comments"], ["lime", "terminal text"],
  ["red", "errors"], ["blue", "ANSI blue"],
];
function swatchSvg(p) {
  const c = p.colors, W = 1280, H = 720, cols = 6, sw = 188, sh = 150, gx = 16, x0 = 48, y0 = 168;
  let cells = "";
  SWATCH_ROLES.forEach(([role, label], i) => {
    const x = x0 + (i % cols) * (sw + gx), y = y0 + Math.floor(i / cols) * (sh + gx);
    cells += `<rect x="${x}" y="${y}" width="${sw}" height="${sh}" rx="14" fill="${c.surface0}" stroke="${c.border1}"/>`;
    cells += `<rect x="${x + 10}" y="${y + 10}" width="${sw - 20}" height="${sh - 66}" rx="9" fill="${c[role]}" stroke="${c.border2}" stroke-opacity="0.6"/>`;
    cells += `<text x="${x + 14}" y="${y + sh - 32}" font-family="${MONO}" font-size="19" font-weight="700" fill="${c.text}">${c[role]}</text>`;
    cells += `<text x="${x + 14}" y="${y + sh - 11}" font-family="${SANS}" font-size="15" fill="${c.subtext0}">${label}</text>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${c.mantle}"/>
  <rect x="0" y="0" width="${W}" height="6" fill="${c.pink}"/>
  <text x="48" y="92" font-family="${SANS}" font-size="52" font-weight="800" fill="${c.brass}">Brass Lasers <tspan fill="${c.pink}">${p.meta.name}</tspan></text>
  <text x="50" y="132" font-family="${SANS}" font-size="21" fill="${c.subtext1}">${esc(p.meta.tagline)}</text>
  ${cells}
</svg>`;
}
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// ---------- synthwave wallpaper ----------
// blend a color toward white (t=0 unchanged, t=1 white)
const tint = (hex, t) => "#" + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) + (255 - parseInt(hex.slice(i, i + 2), 16)) * t).toString(16).padStart(2, "0")).join("");

function wallpaperSvg(p, W, H, opts = {}) {
  const c = p.colors, light = p.meta.appearance === "light";
  // light palettes use dark "ink" accents for text contrast; the sun needs real light
  const v = light ? SUN_4AM : c;
  const sunCol = light ? [tint(v.brassLight, 0.25), v.brass, v.sunset, tint(v.pink, 0.1)] : [c.brassLight, c.brass, c.sunset, c.pink];
  const rand = rng(W * 7 + H);
  const horizon = Math.round(H * (W > H ? 0.62 : 0.58));
  const sunR = Math.round(Math.min(W, H) * (W > H ? 0.24 : 0.36));
  const cx = W * (opts.sunX ?? 0.5), sunY = horizon - sunR * 0.35;

  // sky
  const sky = light
    ? [[0, c.base], [0.55, c.overlaySurface], [1, c.accentSurface]]
    : [[0, c.crust], [0.5, c.mantle], [0.82, c.terminalSelection], [1, c.selection]];
  const skyStops = sky.map(([o, col]) => `<stop offset="${o}" stop-color="${col}"/>`).join("");

  // stars (dark only)
  let stars = "";
  if (!light) for (let i = 0; i < Math.round((W * H) / 26000); i++) {
    const x = rand() * W, y = rand() * horizon * 0.85, r = rand() * 1.8 + 0.4;
    stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${rand() > 0.85 ? c.brassLight : c.text}" opacity="${(0.35 + rand() * 0.6).toFixed(2)}"/>`;
  }

  // sun with stripe cutouts
  let stripes = "";
  for (let i = 0; i < 9; i++) {
    const t = i / 9, y = sunY + sunR * (0.05 + t * 0.95), h = sunR * (0.018 + t * 0.06);
    stripes += `<rect x="${cx - sunR}" y="${y.toFixed(1)}" width="${sunR * 2}" height="${h.toFixed(1)}" fill="black"/>`;
  }

  // lasers fanning from the sun
  const beamColors = [c.pink, c.cyan, c.lime, c.brass, c.uv, c.pinkLight];
  let beams = "";
  for (let i = 0; i < 14; i++) {
    const a = (-170 + (i / 13) * 160) * (Math.PI / 180), len = Math.max(W, H) * 1.2;
    const x2 = cx + Math.cos(a) * len, y2 = sunY + Math.sin(a) * len;
    const col = beamColors[i % beamColors.length];
    beams += `<line x1="${cx}" y1="${sunY}" x2="${x2.toFixed(0)}" y2="${y2.toFixed(0)}" stroke="${col}" stroke-width="${(W / 900).toFixed(1)}" opacity="${light ? 0.35 : 0.5}"/>`;
  }

  // perspective grid
  let grid = "";
  const gridCol = light ? c.pink : c.pink;
  for (let i = -24; i <= 24; i++) {
    const xb = cx + i * (W / 9);
    grid += `<line x1="${cx + i * (W / 90)}" y1="${horizon}" x2="${xb}" y2="${H}" stroke="${i % 4 === 0 ? c.cyan : gridCol}" stroke-width="${(W / 1400).toFixed(2)}" opacity="0.75"/>`;
  }
  for (let k = 1; k <= 16; k++) {
    const t = Math.pow(k / 16, 2.2), y = horizon + (H - horizon) * t;
    grid += `<line x1="0" y1="${y.toFixed(1)}" x2="${W}" y2="${y.toFixed(1)}" stroke="${gridCol}" stroke-width="${(W / 1600 + t * W / 900).toFixed(2)}" opacity="${(0.35 + t * 0.6).toFixed(2)}"/>`;
  }

  const fs1 = Math.round(Math.min(W, H) * 0.028);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">${skyStops}</linearGradient>
    <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${sunCol[0]}"/><stop offset="0.45" stop-color="${sunCol[1]}"/>
      <stop offset="0.8" stop-color="${sunCol[2]}"/><stop offset="1" stop-color="${sunCol[3]}"/>
    </linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${light ? c.surface1 : c.mantle}"/><stop offset="1" stop-color="${light ? c.base : c.crust}"/>
    </linearGradient>
    <radialGradient id="haze" cx="0.5" cy="${(horizon / H).toFixed(3)}" r="0.6">
      <stop offset="0" stop-color="${c.pink}" stop-opacity="${light ? 0.25 : 0.45}"/><stop offset="1" stop-color="${c.pink}" stop-opacity="0"/>
    </radialGradient>
    <mask id="sunmask"><rect width="${W}" height="${H}" fill="white"/>${stripes}</mask>
    <clipPath id="sky-clip"><rect width="${W}" height="${horizon}"/></clipPath>
    <filter id="glow" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><feGaussianBlur stdDeviation="${(W / 700).toFixed(1)}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="sunglow" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><feGaussianBlur stdDeviation="${(sunR / 6).toFixed(0)}"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${stars}
  <rect width="${W}" height="${H}" fill="url(#haze)"/>
  <g clip-path="url(#sky-clip)">
    <g filter="url(#glow)">${beams}</g>
    <circle cx="${cx}" cy="${sunY}" r="${sunR * 1.05}" fill="${c.pink}" opacity="0.55" filter="url(#sunglow)"/>
    <circle cx="${cx}" cy="${sunY}" r="${sunR}" fill="url(#sun)" mask="url(#sunmask)"/>
  </g>
  <rect y="${horizon}" width="${W}" height="${H - horizon}" fill="url(#floor)"/>
  <g filter="url(#glow)">${grid}
    <line x1="0" y1="${horizon}" x2="${W}" y2="${horizon}" stroke="${c.brassLight}" stroke-width="${(W / 1000).toFixed(1)}"/></g>
  <text x="${W - fs1 * 1.4}" y="${H - fs1 * 1.4}" text-anchor="end" font-family="${MONO}" font-size="${fs1}" font-weight="700" letter-spacing="${(fs1 * 0.25).toFixed(1)}" fill="${c.brass}" opacity="0.9">BRASS LASERS · ${p.meta.name.toUpperCase()}</text>
</svg>`;
}

// ---------- social preview (GitHub repo card, 1280x640) ----------
function socialSvg(palettes) {
  const p = palettes.find((v) => v.meta.slug === "4am"), c = p.colors, W = 1280, H = 640;
  const wall = wallpaperSvg(p, W, H, { sunX: 0.76 }).replace(/<text[^]*?<\/text>\n<\/svg>$/, "</svg>");
  const inner = wall.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
  const chipW = Math.min(136, Math.floor((W - 128) / palettes.length) - 8);
  const chips = palettes.map((v, i) => `<g transform="translate(${64 + i * (chipW + 8)},508)"><rect width="${chipW}" height="44" rx="22" fill="${v.colors.base}" stroke="${v.colors.brass}" stroke-width="2"/><text x="${chipW / 2}" y="28" text-anchor="middle" font-family="${SANS}" font-size="13" font-weight="700" fill="${v.colors.brass}">${v.meta.name}</text></g>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${inner}
  <text x="64" y="150" font-family="${SANS}" font-size="92" font-weight="900" fill="${c.brass}">Brass Lasers</text>
  <text x="66" y="212" font-family="${SANS}" font-size="34" font-weight="600" fill="${c.pink}">Neon synthwave themes, readable at 4AM</text>
  <text x="66" y="262" font-family="${MONO}" font-size="22" fill="${c.textEditor}">VS Code · Cursor · Zed · Neovim · JetBrains · 6 terminals · +more</text>
  ${chips}
</svg>`;
}

function main() {
  const palettes = loadPalettes();
  for (const p of palettes) {
    png(swatchSvg(p), path.join(ROOT, "media/swatches", `${p.meta.slug}.png`));
    png(wallpaperSvg(p, 3840, 2160), path.join(ROOT, "media/wallpapers", `${p.meta.slug}-desktop.png`));
    png(wallpaperSvg(p, 1290, 2796), path.join(ROOT, "media/wallpapers", `${p.meta.slug}-phone.png`));
    png(wallpaperSvg(p, 960, 600), path.join(ROOT, "media/wallpapers/thumbs", `${p.meta.slug}.png`));
  }
  png(socialSvg(palettes), path.join(ROOT, "media/social-preview.png"));
}

if (require.main === module) main();
module.exports = { swatchSvg, wallpaperSvg };
