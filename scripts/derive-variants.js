#!/usr/bin/env node
// Derives Afterglow / Strobe / Golden Hour from the 4AM palette in OKLCH,
// then repairs every contrast pair from scripts/contrast.js until it passes.
//
//   node scripts/derive-variants.js            write palette/{afterglow,strobe,golden-hour}.json
//   node scripts/derive-variants.js strobe     just one
//
// The palette JSON files are the source of truth once written. Hand-tune them
// freely; only re-run this when you want to regenerate a variant from 4AM.

const fs = require("fs");
const path = require("path");
const { ratio, PAIRS } = require("./contrast-lib.js");

// ---------- OKLCH <-> sRGB ----------
const toLin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const toGam = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
function hexToOklch(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => toLin(parseInt(hex.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, B), h: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
}
function oklchToRgb({ L, C, h }) {
  const a = C * Math.cos((h * Math.PI) / 180), b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}
const inGamut = (rgb) => rgb.every((c) => c >= -1e-4 && c <= 1 + 1e-4);
function oklchToHex(c) {
  let o = { L: Math.min(1, Math.max(0, c.L)), C: Math.max(0, c.C), h: c.h };
  // keep lightness and hue; give up chroma until it fits sRGB
  while (!inGamut(oklchToRgb(o)) && o.C > 0) o = { ...o, C: o.C - 0.002 };
  return "#" + oklchToRgb(o).map((v) => Math.round(toGam(Math.min(1, Math.max(0, v))) * 255).toString(16).padStart(2, "0")).join("");
}
const adjust = (hex, fn) => oklchToHex(fn(hexToOklch(hex)));

// ---------- roles ----------
const ACCENTS = ["brass", "brassLight", "brassHover", "peach", "sand", "pink", "pinkLight", "pinkHover", "orchid", "cyan", "cyanLight", "sunset", "uv", "lavender", "red", "redLight", "redSoft", "lime", "limeLight", "afterglow", "blue", "blueLight"];
const BGS = ["crust", "codeBlock", "mantle", "base", "stickyBase", "surface0", "lineHighlight", "controlSurface", "surface1", "hover", "border0", "inactiveSelection", "overlaySurface", "border1", "secondary", "whitespace", "secondaryHover", "selectionActive", "terminalSelection", "lineNumber", "border2", "indentActive", "selection"];
const STATUS_SURFACES = ["errorSurface", "warningSurface", "infoSurface", "accentSurface"];
const TEXT = ["text", "textEditor", "textSidebar", "textControl", "subtext1", "subtext0", "docComment", "inlayHint", "comment", "overlay2", "overlay1", "overlay0", "white", "brightWhite", "ansiBlack", "ansiWhite"];
const ON = ["onPink", "onBrass", "onSunset", "onRed"];

// Move fg's lightness away from bg until the pair reaches `min`.
function repair(colors, fg, bg, min) {
  for (let i = 0; i < 400 && ratio(colors[fg], colors[bg]) < min; i++) {
    const f = hexToOklch(colors[fg]), b = hexToOklch(colors[bg]);
    const dir = f.L >= b.L ? 1 : -1;
    // pinned at black/white: stop and let the contrast gate report it
    if (dir > 0 ? f.L >= 0.995 : f.L <= 0.005) break;
    colors[fg] = oklchToHex({ ...f, L: f.L + dir * 0.005 });
  }
  return ratio(colors[fg], colors[bg]) >= min;
}
function repairAll(meta, colors) {
  for (let pass = 0; pass < 6; pass++) {
    let changed = false;
    for (const [fg, bg, baseMin, what, only] of PAIRS) {
      if (only && only !== meta.appearance) continue;
      const min = what === "syntax on editor" && meta.contrastFloor ? Math.max(baseMin, meta.contrastFloor) : baseMin;
      if (ratio(colors[fg], colors[bg]) < min) {
        repair(colors, fg, bg, min + 0.02);
        changed = true;
      }
    }
    if (!changed) break;
  }
}

// ---------- variants ----------
const VARIANTS = {
  afterglow: {
    meta: {
      name: "Afterglow",
      slug: "afterglow",
      appearance: "dark",
      tagline: "The comedown set. Same lot, lasers dimmed, softer saturation for long sessions.",
      t3Description: "Brass Lasers after the headliner: dimmed lasers, softer saturation, warm void-purple. Built for long sessions.",
    },
    map(name, c) {
      if (ACCENTS.includes(name)) return { L: c.L + (0.78 - c.L) * 0.25, C: c.C * 0.6, h: c.h };
      if (BGS.includes(name)) return { L: c.L + 0.025, C: c.C * 0.75, h: c.h };
      if (STATUS_SURFACES.includes(name)) return { L: c.L + 0.02, C: c.C * 0.7, h: c.h };
      if (TEXT.includes(name)) return name === "black" ? c : { L: c.L - 0.035, C: c.C * 0.85, h: c.h };
      return c;
    },
  },
  strobe: {
    meta: {
      name: "Strobe",
      slug: "strobe",
      appearance: "dark",
      contrastFloor: 7,
      tagline: "High contrast. Deeper void, brighter lasers, every syntax color at WCAG AAA (7:1).",
      t3Description: "Brass Lasers at full strobe: deeper void, brighter lasers, AAA contrast everywhere it counts.",
    },
    map(name, c) {
      if (ACCENTS.includes(name)) return { L: Math.min(0.93, c.L + 0.07), C: c.C * 1.05, h: c.h };
      if (BGS.includes(name)) return { L: c.L * 0.62, C: c.C * 0.9, h: c.h };
      if (STATUS_SURFACES.includes(name)) return { L: c.L * 0.8, C: c.C, h: c.h };
      if (["text", "textEditor", "textSidebar", "white", "brightWhite", "ansiWhite"].includes(name)) return { L: Math.min(0.995, c.L + 0.05), C: c.C * 0.6, h: c.h };
      if (name === "ansiBlack") return c;
      if (TEXT.includes(name)) return { L: Math.min(0.95, c.L + 0.1), C: c.C, h: c.h };
      if (ON.includes(name)) return { L: c.L * 0.5, C: c.C, h: c.h };
      return c;
    },
  },
  "golden-hour": {
    meta: {
      name: "Golden Hour",
      slug: "golden-hour",
      appearance: "light",
      tagline: "The daytime set. Warm cream, burnished brass, deep-purple ink, lasers you can see in the sun.",
      t3Description: "Brass Lasers in daylight: warm cream, burnished brass, deep-purple ink, sun-proof lasers.",
    },
    map(name, c, base4am) {
      const baseL = base4am.L;
      if (ACCENTS.includes(name)) {
        // darker, rich ink; "Light"/"Hover" variants a touch lighter for distinction
        const light = /Light|Hover|Soft|sand|peach|lavender|orchid/.test(name);
        return { L: light ? 0.56 : 0.5, C: Math.min(c.C, 0.2), h: c.h };
      }
      if (["selection", "selectionActive", "terminalSelection"].includes(name)) return { L: name === "selection" ? 0.72 : 0.88, C: name === "selection" ? 0.12 : 0.05, h: c.h };
      if (BGS.includes(name)) {
        const L = 0.985 - Math.abs(c.L - baseL) * 1.05;
        return L > 0.9 ? { L, C: 0.022, h: 80 } : { L, C: c.C * 0.55, h: c.h };
      }
      if (STATUS_SURFACES.includes(name)) return { L: 0.93, C: 0.045, h: c.h };
      if (name === "white") return { L: 0.2, C: 0.06, h: 300 };
      if (name === "brightWhite") return { L: 0.93, C: 0.02, h: 80 };
      if (name === "black") return { L: 0.42, C: 0.05, h: 300 };
      if (name === "ansiBlack") return { L: 0.3, C: 0.05, h: c.h };
      if (name === "ansiWhite") return { L: 0.86, C: 0.03, h: c.h };
      if (TEXT.includes(name)) return { L: 1.16 - c.L, C: c.C * 0.9, h: c.h };
      if (ON.includes(name)) return { L: 0.985, C: 0.015, h: 80 };
      return c;
    },
  },
};

function derive(slug) {
  const src = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "palette", "4am.json"), "utf8"));
  const v = VARIANTS[slug];
  const base4am = hexToOklch(src.colors.base);
  const colors = {};
  for (const [name, hex] of Object.entries(src.colors)) colors[name] = oklchToHex(v.map(name, hexToOklch(hex), base4am));
  repairAll(v.meta, colors);
  const out = path.join(__dirname, "..", "palette", `${slug}.json`);
  fs.writeFileSync(out, JSON.stringify({ meta: v.meta, colors }, null, 2) + "\n");
  console.log("wrote", path.relative(process.cwd(), out));
}

const only = process.argv[2];
(only ? [only] : Object.keys(VARIANTS)).forEach(derive);
