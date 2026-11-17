// The Brass Lasers icon finishes, shared by the shipped icon theme (scripts/icons.js) and the
// icon lab (scripts/icon-lab.js). Geometry is never edited — only paint — so every icon keeps
// its source's proportions.
//
//   edge(svg, pal)       Enamel Edge, for file icons (Material geometry): palette-harmonized
//                        color, vertical light falloff, top sheen, darker rim, small cut shadow
//   resin(svg, pal, o)   Resin, for folders (Catppuccin line geometry): palette-recolored
//                        strokes with a soft tinted glass body
"use strict";
const { hexToOklch, oklchToHex, lighten, mix } = require("./color.js");
const { ratio } = require("./contrast-lib.js");

const HUES = ["blue", "cyan", "lime", "brass", "sunset", "red", "pink", "uv", "lavender"];
// Minimum icon contrast against the sidebar on light sets. 3:1 is WCAG 1.4.11 for graphics; it
// keeps yellows a deep mustard on near-white. Lower it for more vivid (less legible) icons.
const ICON_CONTRAST = 3.0;

// a brand color, pulled 70% toward the set's nearest accent hue (neutrals map to text tones)
function harmonize(src, pal) {
  const s = hexToOklch(src);
  if (s.C < 0.04) return s.L > 0.6 ? pal.text : pal.overlay2;
  let best = null, bd = 1e9;
  for (const k of HUES) {
    const t = hexToOklch(pal[k]);
    const d = Math.abs(((t.h - s.h + 540) % 360) - 180);
    if (d < bd) { bd = d; best = pal[k]; }
  }
  return mix(src, best, 0.7);
}

// Light sets darken accents for TEXT contrast (4.5:1). Icons are graphics and need 3:1
// (WCAG 1.4.11), so lift to the brightest tone that still clears 3:1 on the sidebar.
function forIcons(c, pal) {
  if (hexToOklch(pal.base).L < 0.5) return c;
  let best = c;
  for (let dL = 0.02; dL <= 0.3; dL += 0.02) {
    const up = lighten(c, dL);
    if (ratio(up, pal.mantle) >= ICON_CONTRAST && ratio(up, pal.base) >= ICON_CONTRAST) best = up; else break;
  }
  return best;
}

const expand = (s) => (s.length === 4 ? "#" + [...s.slice(1)].map((c) => c + c).join("") : s).toLowerCase();
const parse = (svg) => {
  const vb = (svg.match(/viewBox="([^"]+)"/) || [, "0 0 16 16"])[1].trim().split(/[\s,]+/).map(Number);
  const root = (svg.match(/<svg\b([^>]*)>/) || [, ""])[1];
  let inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  // presentation attributes on the root <svg> (fill="none", stroke...) are inherited by the
  // artwork; keep them on a wrapper group, or e.g. an invisible bounding box turns solid black
  const inherited = [...root.matchAll(/\s((?:fill|stroke)[\w-]*|opacity|style)="[^"]*"/g)].map((m) => m[0]).join("");
  if (inherited) inner = `<g${inherited}>${inner}</g>`;
  return { vb, inner };
};
const wrap = ({ vb, inner }) => `<svg xmlns="http://www.w3.org/2000/svg"${/xlink:/.test(inner) ? ' xmlns:xlink="http://www.w3.org/1999/xlink"' : ""} viewBox="${vb.join(" ")}">${inner}</svg>\n`;
const SHAPE = /<(path|circle|rect|ellipse|polygon|polyline|line|g)\b([^>]*?)(\/?)>/g;

// copy of the artwork with ids and defs stripped and every paint forced to one color
// (for the sheen mask and the cut shadow); keeps groups and transforms, unlike a clipPath
const silhouette = (inner, color) =>
  `<g fill="${color}">${inner
    .replace(/<defs>[\s\S]*?<\/defs>/g, "")
    .replace(/<(linearGradient|radialGradient|clipPath|mask)\b[\s\S]*?<\/\1>/g, "")
    .replace(/\sid="[^"]*"/g, "")
    .replace(/\s(clip-path|mask)="[^"]*"/g, "")
    .replace(/\sfill="(?!none)[^"]*"/g, ` fill="${color}"`)
    .replace(/\sstroke="(?!none)[^"]*"/g, ` stroke="${color}"`)}</g>`;

function edge(svg, pal, uid = "e", { rim = true } = {}) {
  let { vb, inner } = parse(svg);
  const [x, y, w, h] = vb, u = w / 16; // one 16-px-grid unit in this viewBox
  const srcs = [...new Set([...inner.matchAll(/(?:fill|stroke|stop-color)="(#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?)"/g)].map((m) => expand(m[1])))];
  if (!srcs.length) return wrap({ vb, inner });
  // recolor the icon as one piece: each color takes its palette hue, but keeps its lightness
  // offset from the body color, so inner symbols stay distinct; then lift once for light sets
  const bodySrc = hexToOklch(srcs[0]);
  const bodyNew = hexToOklch(harmonize(srcs[0], pal));
  const lift = hexToOklch(forIcons(oklchToHex(bodyNew), pal)).L - bodyNew.L;
  const recolor = new Map(srcs.map((s) => {
    const o = hexToOklch(s), base = hexToOklch(harmonize(s, pal));
    return [s, oklchToHex({ ...base, L: Math.min(0.97, Math.max(0.05, bodyNew.L + (o.L - bodySrc.L) + lift)) })];
  }));
  const grads = new Map();
  let defs = "";
  const gradFor = (c) => {
    if (!grads.has(c)) {
      const id = `${uid}g${grads.size}`;
      grads.set(c, id);
      defs += `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${y}" x2="0" y2="${y + h}"><stop offset="0" stop-color="${lighten(c, 0.09)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${lighten(c, -0.08)}"/></linearGradient>`;
    }
    return grads.get(c);
  };
  inner = inner.replace(/stop-color="(#[0-9a-fA-F]{3,6})"/g, (_, s) => `stop-color="${recolor.get(expand(s))}"`);
  inner = inner.replace(SHAPE, (all, tag, attrs, close) => {
    const fill = attrs.match(/\sfill="(#[0-9a-fA-F]{3,6})"/);
    let a = attrs.replace(/\sstroke="(#[0-9a-fA-F]{3,6})"/, (_, s) => ` stroke="${recolor.get(expand(s))}"`);
    if (fill) {
      const c = recolor.get(expand(fill[1]));
      a = a.replace(fill[0], ` fill="url(#${gradFor(c)})"`);
      // rim only where the source sets no stroke styling of its own (a second copy of an
      // attribute makes the SVG invalid, and the icon renders blank)
      if (rim && !/\s(stroke|stroke-width|stroke-linejoin|paint-order)=/.test(attrs)) a += ` stroke="${lighten(c, -0.2)}" stroke-width="${(0.55 * u).toFixed(3)}" stroke-linejoin="round" paint-order="stroke"`;
    }
    return `<${tag}${a}${close}>`;
  });
  defs += `<linearGradient id="${uid}s" gradientUnits="userSpaceOnUse" x1="0" y1="${y}" x2="0" y2="${y + h * 0.55}"><stop offset="0" stop-color="#fff" stop-opacity=".30"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
  defs += `<mask id="${uid}m" maskUnits="userSpaceOnUse" x="${x}" y="${y}" width="${w}" height="${h}">${silhouette(inner, "#fff")}</mask>`;
  const shadow = rim ? `<g transform="translate(0 ${(0.7 * u).toFixed(3)})" opacity=".45">${silhouette(inner, pal.crust)}</g>` : "";
  const sheen = `<rect x="${x}" y="${y}" width="${w}" height="${h * 0.55}" fill="url(#${uid}s)" mask="url(#${uid}m)"/>`;
  return wrap({ vb, inner: `<defs>${defs}</defs>${shadow}${inner}${sheen}` });
}

// Catppuccin role names -> Brass palette roles
const CTP = { text: "text", subtext0: "overlay2", subtext1: "overlay2", overlay0: "overlay1", overlay1: "overlay1", overlay2: "overlay2", surface0: "surface1", surface1: "surface1", surface2: "overlay0", blue: "blue", sapphire: "cyan", sky: "cyan", teal: "cyan", green: "lime", yellow: "brass", peach: "sunset", maroon: "red", red: "red", mauve: "uv", pink: "pink", lavender: "lavender", flamingo: "pinkLight", rosewater: "sand" };

function resin(svg, pal, uid = "r", { plain = false, body = true } = {}) {
  let { vb, inner } = parse(svg);
  const roleOf = (v) => (plain && v === "text" ? "brass" : CTP[v] || "text");
  const first = (inner.match(/var\(--vscode-ctp-(\w+)\)/) || [, "text"])[1];
  inner = inner.replace(/var\(--vscode-ctp-(\w+)\)/g, (_, v) => pal[roleOf(v)]);
  const d = body && (inner.match(/<path[^>]*\sd="([^"]+)"/) || [])[1];
  if (!d) return wrap({ vb, inner });
  const c = pal[roleOf(first)];
  const defs = `<defs><linearGradient id="${uid}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lighten(c, 0.06)}" stop-opacity=".42"/><stop offset="1" stop-color="${c}" stop-opacity=".16"/></linearGradient></defs>`;
  return wrap({ vb, inner: `${defs}<path d="${d}" fill="url(#${uid}b)" stroke="none"/>${inner}` });
}

module.exports = { edge, resin, harmonize, forIcons, parse };
