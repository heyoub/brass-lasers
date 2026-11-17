// OKLCH <-> sRGB helpers shared by the palette expander and the art scripts.
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
  let o = { L: Math.min(1, Math.max(0, c.L)), C: Math.max(0, c.C), h: ((c.h % 360) + 360) % 360 };
  // keep lightness and hue; give up chroma until it fits sRGB
  while (!inGamut(oklchToRgb(o)) && o.C > 0) o = { ...o, C: Math.max(0, o.C - 0.002) };
  return "#" + oklchToRgb(o).map((v) => Math.round(toGam(Math.min(1, Math.max(0, v))) * 255).toString(16).padStart(2, "0")).join("");
}
const adjust = (hex, fn) => oklchToHex(fn(hexToOklch(hex)));
const lighten = (hex, dL) => adjust(hex, (c) => ({ ...c, L: c.L + dL }));
// mix two colors in OKLCH (t=0 → a, t=1 → b), hue along the short arc
function mix(a, b, t) {
  const x = hexToOklch(a), y = hexToOklch(b);
  let dh = y.h - x.h;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  // achromatic colors have meaningless hue; borrow the other one's
  const h = x.C < 0.01 ? y.h : y.C < 0.01 ? x.h : x.h + dh * t;
  return oklchToHex({ L: x.L + (y.L - x.L) * t, C: x.C + (y.C - x.C) * t, h });
}

module.exports = { hexToOklch, oklchToHex, adjust, lighten, mix };
