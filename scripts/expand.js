// Palette expander: a short, hand-designed spec → the full ~70-color palette every
// template uses. The 4AM palette is the structural reference: each derived color keeps
// 4AM's *relationship* to the background and ink (how far a border sits from the canvas,
// how dim a comment is), re-expressed in the new set's own hues. Then contrast repair
// nudges anything below its WCAG floor.
//
// Spec shape (palette/<slug>.json):
//   { "meta": {...}, "spec": {
//       "base": "#hex",            editor background
//       "text": "#hex",            main ink
//       "selection": "#hex",       hue source for selections (optional, defaults to keyword)
//       "accents": { keyword, string, function, type, param, generic, number, namespace,
//                    property, operator, self, macro, comment, error, terminal, blue },
//       "overrides": { anyPaletteKey: "#hex" }   (optional, applied before repair)
//   } }
//
// Palette keys are named after the 4AM colors that first filled them ("pink" is the
// keyword / focus slot, "brass" the type / button slot...). docs: palette/README.md.

const fs = require("fs");
const path = require("path");
const { hexToOklch, oklchToHex, lighten, mix } = require("./color.js");
const { ratio, PAIRS, floorFor } = require("./contrast-lib.js");

const REF = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "palette", "4am.json"), "utf8")).colors;
const REF_L = Object.fromEntries(Object.entries(REF).map(([k, v]) => [k, hexToOklch(v)]));

const BGS = ["crust", "codeBlock", "mantle", "base", "stickyBase", "surface0", "lineHighlight", "controlSurface", "surface1", "hover", "border0", "inactiveSelection", "overlaySurface", "border1", "secondary", "whitespace", "secondaryHover", "lineNumber", "border2", "indentActive"];
const SELECTIONS = { selection: [0.42, 0.13, -0.22, 0.12], selectionActive: [0.26, 0.07, -0.1, 0.06], terminalSelection: [0.32, 0.1, -0.14, 0.08] };
const TEXT = ["textEditor", "textSidebar", "textControl", "subtext1", "subtext0", "docComment", "inlayHint", "overlay2", "overlay1", "overlay0"];

function expand(meta, spec) {
  const a = spec.accents, dark = meta.appearance === "dark";
  const base = hexToOklch(spec.base), ink = hexToOklch(spec.text);
  const refBase = REF_L.base, refText = REF_L.text;
  const c = {};

  // --- backgrounds: keep 4AM's lightness offsets from the canvas, in this set's hue
  for (const k of BGS) {
    const r = REF_L[k], dL = r.L - refBase.L;
    const L = dark ? base.L + dL : base.L - Math.abs(dL) * 0.9;
    const C = Math.min(0.09, base.C * (r.C / Math.max(refBase.C, 0.001)) * 0.9);
    c[k] = oklchToHex({ L, C, h: base.h });
  }
  c.base = spec.base;

  // --- selections take the selection hue
  const selHue = hexToOklch(spec.selection || a.keyword).h;
  for (const [k, [dLd, Cd, dLl, Cl]] of Object.entries(SELECTIONS))
    c[k] = oklchToHex(dark ? { L: base.L + dLd, C: Cd, h: selHue } : { L: base.L + dLl, C: Cl, h: selHue });

  // --- status surfaces: tinted with their meaning
  const surf = (hex) => { const h = hexToOklch(hex).h; return oklchToHex(dark ? { L: base.L + 0.08, C: 0.05, h } : { L: base.L - 0.05, C: 0.045, h }); };
  c.errorSurface = surf(a.error);
  c.warningSurface = surf(a.number);
  c.infoSurface = surf(a.function);
  c.accentSurface = surf(a.type);

  // --- ink ramp: each dim role sits where 4AM put it between canvas and ink
  c.text = spec.text;
  for (const k of TEXT) {
    const t = (REF_L[k].L - refBase.L) / (refText.L - refBase.L);
    const L = base.L + t * (ink.L - base.L);
    // dim ink leans toward the canvas hue so it feels part of the room
    const h = t > 0.8 ? ink.h : base.h;
    const C = Math.max(ink.C, base.C) * (0.6 + 0.4 * t) + 0.01;
    c[k] = oklchToHex({ L, C, h });
  }
  c.comment = a.comment;
  c.docComment = mix(a.comment, spec.text, 0.18);
  c.white = oklchToHex({ L: dark ? Math.min(0.99, ink.L + 0.06) : Math.max(0.12, ink.L - 0.06), C: ink.C * 0.6, h: ink.h });
  c.brightWhite = oklchToHex(dark ? { L: 0.97, C: 0.015, h: ink.h } : { L: base.L - 0.06, C: 0.02, h: base.h });
  c.black = dark ? "#000000" : oklchToHex({ L: 0.42, C: 0.04, h: ink.h });
  c.ansiBlack = dark ? c.overlay0 : oklchToHex({ L: ink.L + 0.1, C: ink.C, h: ink.h });
  c.ansiWhite = dark ? c.textSidebar : oklchToHex({ L: base.L - 0.13, C: 0.02, h: base.h });

  // --- accents
  const up = dark ? 0.07 : -0.07;
  Object.assign(c, {
    pink: a.keyword, pinkLight: a.self, pinkHover: lighten(a.keyword, up * 0.8), orchid: a.operator,
    cyan: a.function, cyanLight: a.macro,
    brass: a.type, brassLight: a.param, brassHover: lighten(a.type, up * 0.8), peach: a.generic, sand: mix(spec.text, a.type, 0.3),
    sunset: a.number, uv: a.namespace, lavender: a.property,
    red: a.error, redLight: lighten(a.error, up), redSoft: lighten(a.error, up * 2),
    lime: a.terminal, limeLight: lighten(a.terminal, up),
    afterglow: a.string, blue: a.blue, blueLight: lighten(a.blue, up),
  });

  // --- text on accent fills (buttons, badges)
  const on = (hex) => { const h = hexToOklch(hex).h; return oklchToHex(dark ? { L: 0.17, C: 0.04, h } : { L: 0.985, C: 0.012, h }); };
  c.onPink = on(a.keyword); c.onBrass = on(a.type); c.onSunset = on(a.number); c.onRed = on(a.error);

  Object.assign(c, spec.overrides || {});

  // order keys like 4AM so diffs read well
  const colors = {};
  for (const k of Object.keys(REF)) {
    if (!c[k]) throw new Error(`${meta.slug}: expander produced no "${k}"`);
    colors[k] = c[k].toLowerCase();
  }
  repairAll(meta, colors);
  return colors;
}

// Move fg's lightness away from bg until the pair reaches its floor.
function repair(colors, fg, bg, min) {
  for (let i = 0; i < 400 && ratio(colors[fg], colors[bg]) < min; i++) {
    const f = hexToOklch(colors[fg]), b = hexToOklch(colors[bg]);
    const dir = f.L >= b.L ? 1 : -1;
    if (dir > 0 ? f.L >= 0.995 : f.L <= 0.005) break; // pinned: let the gate report it
    colors[fg] = oklchToHex({ ...f, L: f.L + dir * 0.005 });
  }
}
function repairAll(meta, colors) {
  for (let pass = 0; pass < 8; pass++) {
    let changed = false;
    for (const [fg, bg, baseMin, what, only] of PAIRS) {
      if (only && only !== meta.appearance) continue;
      const min = floorFor(meta, what, baseMin);
      if (ratio(colors[fg], colors[bg]) < min) {
        repair(colors, fg, bg, min + 0.02);
        changed = true;
      }
    }
    if (!changed) break;
  }
}

module.exports = { expand };
