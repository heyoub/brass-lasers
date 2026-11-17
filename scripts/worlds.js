// The nine worlds as wallpapers. 4AM keeps the original synthwave composition
// (scripts/make-art.js wallpaperSvg); the other eight are built here from one small
// composition grammar, with the same material language as Brass Lasers Icons:
//
//   sky        a vertical gradient per world
//   body       the light source: soft sun, set sun, moon, chrome ring
//   ground     terrain ridges, water (with a mirrored, fading reflection), stage, road
//   materials  enamel (vertical light falloff + lighter top rim), resin (tinted glass),
//              matte (flat, no sheen)
//   atmosphere fog bands, motes, stars
//   finish     vignette + wordmark
//
// Every scene is laid out from the canvas aspect, so phone versions are recomposed (subjects
// pulled in, horizon lowered), not center crops. All randomness is seeded: CI renders match.
"use strict";
const { mix, lighten } = require("./color.js");

const MONO = "Cascadia Code, JetBrains Mono, Consolas, DejaVu Sans Mono, monospace";
const f = (n) => (Math.round(n * 10) / 10).toString();
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296); }
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// ---------------------------------------------------------------- grammar
function scene(W, H, seed) {
  const portrait = H > W, m = Math.min(W, H), rand = rng(seed * 7919 + W * 3 + H);
  let defs = "", body = "", n = 0;
  const id = (p) => `${p}${n++}`;
  const S = {
    W, H, m, portrait, rand,
    add: (s) => (body += s),
    def: (s) => (defs += s),
    // gradients
    vgrad(stops, y1 = 0, y2 = 1, units = "objectBoundingBox") {
      const g = id("v");
      const a = units === "userSpaceOnUse" ? `gradientUnits="userSpaceOnUse" x1="0" y1="${f(y1)}" x2="0" y2="${f(y2)}"` : `x1="0" y1="${y1}" x2="0" y2="${y2}"`;
      defs += `<linearGradient id="${g}" ${a}>${stops.map(([o, c, op = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${op}"/>`).join("")}</linearGradient>`;
      return `url(#${g})`;
    },
    rgrad(cx, cy, r, stops) {
      const g = id("r");
      defs += `<radialGradient id="${g}" gradientUnits="userSpaceOnUse" cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}">${stops.map(([o, c, op = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${op}"/>`).join("")}</radialGradient>`;
      return `url(#${g})`;
    },
    blur(sd) { const b = id("b"); defs += `<filter id="${b}" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><feGaussianBlur stdDeviation="${f(sd)}"/></filter>`; return `url(#${b})`; },
    glow(sd) { const b = id("g"); defs += `<filter id="${b}" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><feGaussianBlur stdDeviation="${f(sd)}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`; return `url(#${b})`; },
    clip(inner) { const c = id("c"); defs += `<clipPath id="${c}">${inner}</clipPath>`; return `url(#${c})`; },
    mask(inner) { const k = id("k"); defs += `<mask id="${k}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">${inner}</mask>`; return `url(#${k})`; },
    // materials, the same language as the icons
    enamel(color, top = 0, bottom = 1) { return S.vgrad([[0, lighten(color, 0.1)], [0.55, color], [1, lighten(color, -0.09)]], top, bottom, "userSpaceOnUse"); },
    resin(color, a = 0.3) { return S.vgrad([[0, lighten(color, 0.08), a], [1, color, a * 0.35]]); },
    sky(stops) { S.add(`<rect width="${W}" height="${H}" fill="${S.vgrad(stops)}"/>`); },
    stars(count, maxY, colors, rmax = 1.8) {
      let s = "";
      for (let i = 0; i < count; i++) s += `<circle cx="${f(rand() * W)}" cy="${f(Math.pow(rand(), 1.4) * maxY)}" r="${f((rand() * rmax + 0.4) * m / 1440)}" fill="${colors[Math.floor(rand() * colors.length)]}" opacity="${(0.3 + rand() * 0.65).toFixed(2)}"/>`;
      S.add(s);
    },
    motes(count, y0, y1, colors, r = 2.4) {
      let s = "";
      for (let i = 0; i < count; i++) s += `<circle cx="${f(rand() * W)}" cy="${f(y0 + rand() * (y1 - y0))}" r="${f((0.5 + rand() * r) * m / 1440)}" fill="${colors[i % colors.length]}" opacity="${(0.2 + rand() * 0.55).toFixed(2)}"/>`;
      S.add(`<g filter="${S.glow(m / 900)}">${s}</g>`);
    },
    fog(y, h, color, op) { S.add(`<rect x="${-W * 0.1}" y="${f(y - h / 2)}" width="${W * 1.2}" height="${f(h)}" fill="${color}" opacity="${op}" filter="${S.blur(h / 3)}"/>`); },
    // a smooth ridge from y = base(x) with noise; returns a closed path down to the bottom
    ridge(baseY, amp, waves, bottom = H) {
      const ph = [rand() * 6.28, rand() * 6.28, rand() * 6.28];
      const pts = [];
      for (let i = 0; i <= 48; i++) {
        const x = (i / 48) * W, t = i / 48;
        pts.push([x, baseY + amp * (Math.sin(t * waves * 6.28 + ph[0]) * 0.6 + Math.sin(t * waves * 2.3 * 6.28 + ph[1]) * 0.28 + Math.sin(t * waves * 5.1 * 6.28 + ph[2]) * 0.12)]);
      }
      return { pts, d: `M0 ${f(bottom)} L${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L")} L${W} ${f(bottom)} Z`, top: `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L")}` };
    },
    // mirror everything drawn by fn() across y = axis, fading out with depth
    reflect(axis, fn, strength = 0.45) {
      const before = body; body = ""; fn(); const drawn = body; body = before;
      const fade = S.mask(`<rect x="0" y="${f(axis)}" width="${W}" height="${f(H - axis)}" fill="${S.vgrad([[0, "#fff", strength], [1, "#fff", 0]], axis, H, "userSpaceOnUse")}"/>`);
      S.add(drawn);
      S.add(`<g mask="${fade}"><g transform="translate(0 ${f(axis * 2)}) scale(1 -1)">${drawn}</g></g>`);
    },
    vignette(color, op = 0.55) { S.add(`<rect width="${W}" height="${H}" fill="${S.rgrad(W / 2, H * 0.48, Math.hypot(W, H) * 0.62, [[0.55, color, 0], [1, color, op]])}"/>`); },
    // a soft halo in the scene's darkest (or, on light sets, lightest) tone keeps the wordmark
    // readable over foliage, glitter or sparks without moving the composition
    wordmark(name, color, halo) {
      const fs1 = Math.round(m * 0.028);
      S.add(`<text x="${W - fs1 * 1.4}" y="${H - fs1 * 1.4}" text-anchor="end" font-family="${MONO}" font-size="${fs1}" font-weight="700" letter-spacing="${(fs1 * 0.25).toFixed(1)}" fill="${color}" stroke="${halo}" stroke-width="${f(fs1 * 0.32)}" stroke-opacity="0.8" stroke-linejoin="round" paint-order="stroke" opacity="0.95">BRASS LASERS · ${esc(name.toUpperCase())}</text>`);
    },
    svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${body}</svg>`,
  };
  return S;
}

// a leaf: an almond shape along an angle, enamel-finished, with a lighter midrib
function leaf(S, x, y, len, angle, color, wid = 0.32) {
  const a = (angle * Math.PI) / 180, w = len * wid;
  const tx = x + Math.cos(a) * len, ty = y + Math.sin(a) * len;
  const nx = -Math.sin(a) * w, ny = Math.cos(a) * w;
  const mx = (x + tx) / 2, my = (y + ty) / 2;
  const d = `M${f(x)} ${f(y)} Q${f(mx + nx)} ${f(my + ny)} ${f(tx)} ${f(ty)} Q${f(mx - nx)} ${f(my - ny)} ${f(x)} ${f(y)} Z`;
  return `<path d="${d}" fill="${S.enamel(color, Math.min(y, ty) - w, Math.max(y, ty) + w)}" stroke="${lighten(color, -0.16)}" stroke-width="${f(len / 90)}"/><path d="M${f(x)} ${f(y)} L${f(tx)} ${f(ty)}" stroke="${lighten(color, 0.16)}" stroke-width="${f(len / 70)}" opacity="0.7"/>`;
}

// ---------------------------------------------------------------- worlds
const WORLDS = {
  // 5AM · The Greenhouse: brass-framed glass arch, lagoon floor, hanging leaves, amber lamps
  atrium(c, S) {
    const { W, H, m, portrait } = S, horizon = H * (portrait ? 0.66 : 0.7);
    S.sky([[0, c.crust], [0.55, c.mantle], [0.9, mix(c.mantle, c.brass, 0.18)], [1, mix(c.mantle, c.sunset, 0.3)]]);
    S.stars(Math.round(W * H / 90000), horizon * 0.5, [c.text, c.cyanLight]);
    // dawn glow behind the glass
    S.add(`<circle cx="${W / 2}" cy="${f(horizon)}" r="${f(m * 0.42)}" fill="${S.rgrad(W / 2, horizon, m * 0.42, [[0, c.sunset, 0.55], [0.5, c.brass, 0.18], [1, c.brass, 0]])}"/>`);
    S.reflect(horizon, () => {
      // the arch: a brass frame with resin panes
      const aw = portrait ? W * 0.84 : Math.min(W * 0.62, H * 1.05), ax = (W - aw) / 2, top = horizon - (portrait ? H * 0.5 : H * 0.62), r = aw / 2;
      const cx = W / 2, springY = top + r;
      const arch = `M${f(ax)} ${f(horizon)} L${f(ax)} ${f(springY)} A${f(r)} ${f(r)} 0 0 1 ${f(ax + aw)} ${f(springY)} L${f(ax + aw)} ${f(horizon)} Z`;
      const clip = S.clip(`<path d="${arch}"/>`);
      const cols = portrait ? 5 : 7, rows = 6;
      let panes = "";
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        const px = ax + (i / cols) * aw, py = top + (j / rows) * (horizon - top);
        panes += `<rect x="${f(px)}" y="${f(py)}" width="${f(aw / cols)}" height="${f((horizon - top) / rows)}" fill="${S.resin(S.rand() > 0.5 ? c.cyanLight || c.cyan : c.afterglow, 0.16 + S.rand() * 0.2)}"/>`;
      }
      let mullions = "";
      const lw = m / 260;
      for (let i = 1; i < cols; i++) mullions += `<line x1="${f(ax + (i / cols) * aw)}" y1="${f(top - r)}" x2="${f(ax + (i / cols) * aw)}" y2="${f(horizon)}" stroke="${c.brass}" stroke-width="${f(lw)}"/>`;
      for (let j = 1; j < rows; j++) mullions += `<line x1="${f(ax)}" y1="${f(top + (j / rows) * (horizon - top))}" x2="${f(ax + aw)}" y2="${f(top + (j / rows) * (horizon - top))}" stroke="${c.brass}" stroke-width="${f(lw * 0.8)}"/>`;
      for (let k = 1; k < 6; k++) mullions += `<path d="M${f(cx)} ${f(springY)} L${f(cx + Math.cos(Math.PI + (k / 6) * Math.PI) * r)} ${f(springY + Math.sin(Math.PI + (k / 6) * Math.PI) * r)}" stroke="${c.brass}" stroke-width="${f(lw * 0.8)}"/>`;
      S.add(`<g clip-path="${clip}">${panes}${mullions}</g>`);
      S.add(`<path d="${arch}" fill="none" stroke="${S.enamel(c.brass, top, horizon)}" stroke-width="${f(lw * 2.6)}"/>`);
      // amber lamps hanging inside
      for (let i = 0; i < 3; i++) {
        const lx = cx + (i - 1) * aw * 0.28, ly = top + r * (0.55 + (i % 2) * 0.12);
        S.add(`<line x1="${f(lx)}" y1="${f(top - r)}" x2="${f(lx)}" y2="${f(ly)}" stroke="${c.brass}" stroke-width="${f(lw * 0.6)}" opacity="0.7"/>`);
        S.add(`<circle cx="${f(lx)}" cy="${f(ly)}" r="${f(m * 0.05)}" fill="${S.rgrad(lx, ly, m * 0.05, [[0, c.brassLight, 0.75], [1, c.brass, 0]])}"/><circle cx="${f(lx)}" cy="${f(ly)}" r="${f(m * 0.008)}" fill="${c.brassLight}"/>`);
      }
      // a turquoise hologram ring at the center
      S.add(`<g filter="${S.glow(m / 400)}" opacity="0.8"><ellipse cx="${f(cx)}" cy="${f(horizon - (horizon - top) * 0.28)}" rx="${f(aw * 0.12)}" ry="${f(aw * 0.035)}" fill="none" stroke="${c.cyan}" stroke-width="${f(lw * 0.7)}"/><ellipse cx="${f(cx)}" cy="${f(horizon - (horizon - top) * 0.28)}" rx="${f(aw * 0.07)}" ry="${f(aw * 0.02)}" fill="none" stroke="${c.cyanLight}" stroke-width="${f(lw * 0.5)}"/></g>`);
    }, 0.4);
    // lagoon surface lines
    for (let k = 1; k <= 10; k++) { const t = Math.pow(k / 10, 2), y = horizon + (H - horizon) * t; S.add(`<line x1="0" y1="${f(y)}" x2="${W}" y2="${f(y)}" stroke="${c.cyan}" stroke-width="${f(m / 1400 + t * m / 900)}" opacity="${(0.08 + t * 0.12).toFixed(2)}"/>`); }
    S.fog(horizon, H * 0.06, c.afterglow, 0.12);
    // hanging leaves from the top corners, potted leaves at the bottom
    const greens = [c.afterglow, c.lime, mix(c.afterglow, c.cyan, 0.4)];
    for (const side of [-1, 1]) {
      const x0 = side < 0 ? -m * 0.02 : W + m * 0.02;
      for (let i = 0; i < 9; i++) S.add(leaf(S, x0, -m * 0.02 + i * m * 0.045, m * (0.16 + S.rand() * 0.08), side < 0 ? 20 + i * 8 : 160 - i * 8, greens[i % 3]));
      const bx = side < 0 ? W * (portrait ? 0.06 : 0.1) : W * (portrait ? 0.94 : 0.9);
      for (let i = 0; i < 7; i++) S.add(leaf(S, bx, H * 1.01, m * (0.2 + S.rand() * 0.1), -90 + (i - 3) * 16 + side * 6, greens[(i + 1) % 3], 0.36));
    }
    S.motes(Math.round(W * H / 60000), horizon * 0.3, H * 0.95, [c.brassLight, c.cyan, c.sunset]);
    S.vignette(c.crust, 0.6);
  },

  // 6AM · Porcelain mist: layered ridges fading into fog, a low soft sun
  daybreak(c, S, sun) {
    const { W, H, m, portrait } = S, horizon = H * (portrait ? 0.5 : 0.56);
    S.sky([[0, mix(c.base, sun.blue, 0.1)], [0.5, c.base], [0.8, mix(c.base, sun.brassLight, 0.25)], [1, mix(c.base, sun.pinkLight, 0.3)]]);
    const sx = W * (portrait ? 0.62 : 0.68), sy = horizon - m * 0.06;
    S.add(`<circle cx="${f(sx)}" cy="${f(sy)}" r="${f(m * 0.5)}" fill="${S.rgrad(sx, sy, m * 0.5, [[0, sun.brassLight, 0.45], [0.4, sun.pinkLight, 0.14], [1, sun.pinkLight, 0]])}"/>`);
    S.add(`<circle cx="${f(sx)}" cy="${f(sy)}" r="${f(m * 0.075)}" fill="${S.vgrad([[0, "#fffaf0"], [1, mix(sun.brassLight, "#ffffff", 0.35)]])}"/>`);
    const layers = 6;
    for (let i = 0; i < layers; i++) {
      const t = i / (layers - 1), y = horizon + (H - horizon) * (0.02 + t * 0.62);
      const col = mix(mix(c.base, sun.lavender, 0.18), mix(c.surface1, c.blue, 0.3), t);
      const r = S.ridge(y, m * (0.03 + t * 0.06), 1.2 + t * 0.6);
      S.add(`<path d="${r.d}" fill="${S.vgrad([[0, lighten(col, 0.04)], [1, lighten(col, -0.03)]])}"/>`);
      S.add(`<path d="${r.top}" fill="none" stroke="#ffffff" stroke-width="${f(m / 900)}" opacity="${(0.55 - t * 0.3).toFixed(2)}"/>`);
      S.fog(y + m * 0.03, m * (0.07 + t * 0.03), "#ffffff", (0.5 - t * 0.25).toFixed(2));
    }
    // a few gliding birds
    for (let i = 0; i < 5; i++) { const bx = sx - m * 0.35 + S.rand() * m * 0.5, by = sy - m * (0.12 + S.rand() * 0.18), s = m * (0.008 + S.rand() * 0.006); S.add(`<path d="M${f(bx - s)} ${f(by)} q${f(s / 2)} ${f(-s / 2)} ${f(s)} 0 q${f(s / 2)} ${f(-s / 2)} ${f(s)} 0" fill="none" stroke="${mix(c.text, c.base, 0.4)}" stroke-width="${f(m / 1100)}"/>`); }
    S.vignette(mix(c.base, c.blue, 0.2), 0.25);
  },

  // 12PM · The matte stage: truss, speaker stacks, house lights at half, gaffer-tape X
  soundcheck(c, S) {
    const { W, H, m, portrait } = S, floorY = H * (portrait ? 0.7 : 0.72);
    S.sky([[0, c.crust], [0.7, c.mantle], [1, c.base]]);
    // back wall panels (matte, flat)
    const pw = m * 0.18;
    for (let x = 0, i = 0; x < W; x += pw, i++) S.add(`<rect x="${f(x)}" y="0" width="${f(pw - m * 0.004)}" height="${f(floorY)}" fill="${i % 2 ? c.mantle : mix(c.mantle, c.base, 0.4)}"/>`);
    // house lights: soft cones from the truss, at half
    const trussY = H * (portrait ? 0.16 : 0.14), lights = portrait ? 4 : 6;
    for (let i = 0; i < lights; i++) {
      const lx = W * ((i + 0.5) / lights), col = [c.brass, c.cyan, c.pink][i % 3];
      S.add(`<path d="M${f(lx - m * 0.012)} ${f(trussY)} L${f(lx - m * 0.16)} ${f(floorY)} L${f(lx + m * 0.16)} ${f(floorY)} L${f(lx + m * 0.012)} ${f(trussY)} Z" fill="${S.vgrad([[0, col, 0.16], [1, col, 0.02]])}"/>`);
      S.add(`<ellipse cx="${f(lx)}" cy="${f(floorY + m * 0.01)}" rx="${f(m * 0.17)}" ry="${f(m * 0.025)}" fill="${col}" opacity="0.07"/>`);
      S.add(`<rect x="${f(lx - m * 0.016)}" y="${f(trussY)}" width="${f(m * 0.032)}" height="${f(m * 0.03)}" rx="${f(m * 0.006)}" fill="${c.surface1}"/><circle cx="${f(lx)}" cy="${f(trussY + m * 0.03)}" r="${f(m * 0.009)}" fill="${col}" opacity="0.55"/>`);
    }
    // the truss: two rails with a zigzag web
    const th = m * 0.04, lw = m / 700;
    let web = `<line x1="0" y1="${f(trussY - th)}" x2="${W}" y2="${f(trussY - th)}"/><line x1="0" y1="${f(trussY)}" x2="${W}" y2="${f(trussY)}"/>`;
    for (let x = 0, k = 0; x < W; x += th, k++) web += `<line x1="${f(x)}" y1="${f(k % 2 ? trussY - th : trussY)}" x2="${f(x + th)}" y2="${f(k % 2 ? trussY : trussY - th)}"/>`;
    S.add(`<g stroke="${c.overlay1}" stroke-width="${f(lw)}" opacity="0.8">${web}</g>`);
    // floor: matte boards
    S.add(`<rect x="0" y="${f(floorY)}" width="${W}" height="${f(H - floorY)}" fill="${S.vgrad([[0, c.surface0], [1, c.crust]])}"/>`);
    for (let k = 1; k <= 12; k++) { const t = Math.pow(k / 12, 1.8), y = floorY + (H - floorY) * t; S.add(`<line x1="0" y1="${f(y)}" x2="${W}" y2="${f(y)}" stroke="${c.border0 || c.border1}" stroke-width="${f(m / 1600 + t * m / 1400)}" opacity="0.6"/>`); }
    // speaker stacks, matte, with small status LEDs
    const stackW = m * (portrait ? 0.24 : 0.2), cabH = stackW * 0.62;
    for (const side of [0, 1]) {
      const sx = side ? W - stackW - W * 0.04 : W * 0.04;
      for (let k = 0; k < (portrait ? 3 : 3); k++) {
        const y = floorY - (k + 1) * cabH;
        S.add(`<rect x="${f(sx)}" y="${f(y)}" width="${f(stackW)}" height="${f(cabH - m * 0.006)}" rx="${f(m * 0.008)}" fill="${c.surface1}" stroke="${c.border1}" stroke-width="${f(lw)}"/>`);
        for (const [dx, r] of [[0.3, 0.2], [0.72, 0.13]]) S.add(`<circle cx="${f(sx + stackW * dx)}" cy="${f(y + cabH * 0.48)}" r="${f(stackW * r)}" fill="${c.mantle}" stroke="${c.border2}" stroke-width="${f(lw)}"/><circle cx="${f(sx + stackW * dx)}" cy="${f(y + cabH * 0.48)}" r="${f(stackW * r * 0.32)}" fill="${c.surface0}"/>`);
        S.add(`<circle cx="${f(sx + stackW * 0.92)}" cy="${f(y + cabH * 0.12)}" r="${f(m * 0.004)}" fill="${[c.lime, c.cyan, c.brass][k]}"/>`);
      }
    }
    // center: a mic stand and a gaffer-tape X
    const cx = W / 2;
    S.add(`<line x1="${f(cx)}" y1="${f(floorY + m * 0.04)}" x2="${f(cx)}" y2="${f(floorY - m * 0.22)}" stroke="${c.overlay2}" stroke-width="${f(m / 400)}"/><line x1="${f(cx)}" y1="${f(floorY - m * 0.22)}" x2="${f(cx + m * 0.07)}" y2="${f(floorY - m * 0.27)}" stroke="${c.overlay2}" stroke-width="${f(m / 500)}"/><rect x="${f(cx + m * 0.065)}" y="${f(floorY - m * 0.29)}" width="${f(m * 0.03)}" height="${f(m * 0.018)}" rx="${f(m * 0.008)}" fill="${c.overlay2}" transform="rotate(-28 ${f(cx + m * 0.08)} ${f(floorY - m * 0.28)})"/>`);
    S.add(`<g stroke="${c.pink}" stroke-width="${f(m / 160)}" stroke-linecap="square" opacity="0.85"><line x1="${f(cx - m * 0.06)}" y1="${f(floorY + m * 0.02)}" x2="${f(cx + m * 0.06)}" y2="${f(floorY + m * 0.07)}"/><line x1="${f(cx + m * 0.06)}" y1="${f(floorY + m * 0.02)}" x2="${f(cx - m * 0.06)}" y2="${f(floorY + m * 0.07)}"/></g>`);
    S.vignette(c.crust, 0.5);
  },

  // 5PM · The Lagoon Stage: a big low sun, palms, a glittering lagoon, hibiscus
  "golden-hour"(c, S, sun) {
    // light set: the palette's accents are dark inks, so foliage and bark borrow 4AM's light ("sun")
    const { W, H, m, portrait } = S, horizon = H * (portrait ? 0.56 : 0.62);
    S.sky([[0, mix(c.base, sun.cyanLight, 0.25)], [0.45, c.base], [0.8, mix(c.base, sun.brassLight, 0.55)], [1, mix(sun.sunset, sun.brassLight, 0.4)]]);
    const sx = W / 2, sy = horizon - m * 0.05, sr = m * (portrait ? 0.2 : 0.17);
    S.add(`<circle cx="${f(sx)}" cy="${f(sy)}" r="${f(sr * 3)}" fill="${S.rgrad(sx, sy, sr * 3, [[0, sun.brassLight, 0.6], [0.5, sun.sunset, 0.2], [1, sun.sunset, 0]])}"/>`);
    const clip = S.clip(`<rect width="${W}" height="${f(horizon)}"/>`);
    S.add(`<circle cx="${f(sx)}" cy="${f(sy)}" r="${f(sr)}" fill="${S.vgrad([[0, "#fff4c8"], [0.5, sun.brassLight], [1, sun.sunset]])}" clip-path="${clip}"/>`);
    // lagoon with sun glitter
    S.add(`<rect x="0" y="${f(horizon)}" width="${W}" height="${f(H - horizon)}" fill="${S.vgrad([[0, mix(sun.cyan, c.base, 0.35)], [1, mix(c.cyan, c.base, 0.2)]])}"/>`);
    for (let k = 0; k < 60; k++) {
      const t = Math.pow(S.rand(), 1.6), y = horizon + (H - horizon) * t * 0.95 + m * 0.005, spread = sr * (0.6 + t * 2.4), w = m * (0.01 + t * 0.05) * (0.4 + S.rand());
      S.add(`<rect x="${f(sx + (S.rand() - 0.5) * spread * 2 - w / 2)}" y="${f(y)}" width="${f(w)}" height="${f(m * (0.002 + t * 0.005))}" rx="${f(m * 0.003)}" fill="#fff4c8" opacity="${(0.5 + S.rand() * 0.4).toFixed(2)}"/>`);
    }
    S.add(`<line x1="0" y1="${f(horizon)}" x2="${W}" y2="${f(horizon)}" stroke="#fff4c8" stroke-width="${f(m / 700)}" opacity="0.7"/>`);
    // palms framing the edges: curved enamel trunks, fronds
    const palm = (bx, lean, height, scale) => {
      // one smooth tapered trunk (not segments), warm bark enamel, faint growth rings
      const pt = (t) => [bx + lean * Math.pow(t, 1.6), H - height * t];
      const wAt = (t) => m * scale * (0.028 - t * 0.012);
      const left = [], right = [];
      for (let i = 0; i <= 24; i++) { const t = i / 24, [x, y] = pt(t); left.push(`${f(x - wAt(t))} ${f(y)}`); right.unshift(`${f(x + wAt(t))} ${f(y)}`); }
      const bark = mix(sun.sunset, "#3a2414", 0.55), [tx, ty] = pt(1);
      S.add(`<path d="M${left.join(" L")} L${right.join(" L")} Z" fill="${S.enamel(bark, ty, H)}" stroke="${lighten(bark, -0.12)}" stroke-width="${f(m / 1400)}"/>`);
      let rings = "";
      for (let i = 1; i < 14; i++) { const t = i / 14, [x, y] = pt(t), w = wAt(t); rings += `<path d="M${f(x - w)} ${f(y)} q${f(w)} ${f(w * 0.35)} ${f(w * 2)} 0" fill="none" stroke="${lighten(bark, 0.12)}" stroke-width="${f(m / 1600)}" opacity="0.5"/>`; }
      S.add(rings);
      // fronds: bright tropical greens with the sun behind them
      const greens = [mix(sun.lime, c.afterglow, 0.45), mix(sun.afterglow, sun.lime, 0.3), mix(sun.cyan, sun.lime, 0.55)];
      for (let i = 0; i < 10; i++) S.add(leaf(S, tx, ty, m * scale * (0.2 + S.rand() * 0.06), -175 + i * 19 + (S.rand() - 0.5) * 8, greens[i % 3], 0.2));
      S.add(`<circle cx="${f(tx)}" cy="${f(ty)}" r="${f(m * scale * 0.018)}" fill="${bark}"/>`);
    };    // on phones the palms lean in from the very edges so the sun stays clear
    palm(W * (portrait ? -0.02 : 0.12), m * (portrait ? 0.16 : 0.12), H * (portrait ? 0.6 : 0.78), portrait ? 1.15 : 1);
    palm(W * (portrait ? 1.02 : 0.88), -m * (portrait ? 0.14 : 0.1), H * (portrait ? 0.5 : 0.68), portrait ? 1.0 : 0.9);
    // hibiscus in the foreground corners
    const flower = (x, y, r) => {
      for (let i = 0; i < 5; i++) { const a = (i / 5) * 360 - 90; S.add(leaf(S, x, y, r, a, mix(c.pink, c.red, 0.3), 0.55)); }
      S.add(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.16)}" fill="${c.brass}"/>`);
    };
    flower(W * 0.06, H * 0.95, m * 0.08); flower(W * 0.95, H * 0.9, m * 0.065);
    S.vignette(mix(c.sunset, c.text, 0.3), 0.28);
  },

  // 8PM · Dusk: a coral sun just set behind rolling plum hills, last beams fading
  afterglow(c, S) {
    const { W, H, m, portrait } = S, horizon = H * (portrait ? 0.58 : 0.64);
    S.sky([[0, c.crust], [0.45, c.mantle], [0.78, mix(c.mantle, c.pink, 0.3)], [1, mix(c.sunset, c.pink, 0.5)]]);
    S.stars(Math.round(W * H / 40000), horizon * 0.55, [c.text, c.brassLight, c.pinkLight]);
    const sx = W * 0.5, sr = m * 0.2;
    S.add(`<circle cx="${f(sx)}" cy="${f(horizon)}" r="${f(sr * 2.6)}" fill="${S.rgrad(sx, horizon, sr * 2.6, [[0, c.sunset, 0.5], [0.45, c.pink, 0.16], [1, c.pink, 0]])}"/>`);
    S.add(`<circle cx="${f(sx)}" cy="${f(horizon + sr * 0.35)}" r="${f(sr)}" fill="${S.vgrad([[0, c.brassLight], [0.6, c.sunset], [1, c.pink]])}"/>`);
    // last beams, fading upward
    for (let i = 0; i < 7; i++) {
      const a = (-160 + (i / 6) * 140) * (Math.PI / 180), len = Math.max(W, H);
      S.add(`<line x1="${f(sx)}" y1="${f(horizon)}" x2="${f(sx + Math.cos(a) * len)}" y2="${f(horizon + Math.sin(a) * len)}" stroke="${[c.pink, c.sunset, c.brass][i % 3]}" stroke-width="${f(m / 900)}" opacity="0.22"/>`);
    }
    // rolling hills, enamel layers with a coral rim catching the last light
    const layers = 5;
    for (let i = 0; i < layers; i++) {
      const t = i / (layers - 1), y = horizon - m * 0.04 + (H - horizon) * t * 0.7;
      const col = mix(mix(c.mantle, c.pink, 0.34), c.crust, t * 0.75);
      const r = S.ridge(y, m * (0.035 + t * 0.05), 0.9 + t * 0.5);
      S.add(`<path d="${r.d}" fill="${S.enamel(col, y - m * 0.08, H)}"/>`);
      S.add(`<path d="${r.top}" fill="none" stroke="${c.sunset}" stroke-width="${f(m / 800)}" opacity="${(0.6 - t * 0.4).toFixed(2)}"/>`);
    }
    S.fog(horizon + m * 0.02, m * 0.08, c.pink, 0.12);
    S.vignette(c.crust, 0.6);
  },

  // 10PM · The Chrome Stage: a chrome ring over a mercury sea, FBF sparks
  "liquid-metal"(c, S) {
    const { W, H, m, portrait } = S, horizon = H * (portrait ? 0.52 : 0.58);
    S.sky([[0, c.crust], [0.6, c.mantle], [0.92, mix(c.mantle, c.uv, 0.25)], [1, mix(c.mantle, c.cyan, 0.2)]]);
    S.stars(Math.round(W * H / 70000), horizon * 0.6, [c.text, c.cyanLight]);
    const cx = W / 2, cy = horizon - m * (portrait ? 0.2 : 0.17), R = m * (portrait ? 0.26 : 0.21);
    const chrome = (y1, y2) => S.vgrad([[0, "#f7f7fa"], [0.32, c.text], [0.48, c.overlay0 || c.overlay1], [0.52, c.crust], [0.7, c.overlay2], [1, "#ffffff"]], y1, y2, "userSpaceOnUse");
    S.reflect(horizon, () => {
      S.add(`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R * 1.6)}" fill="${S.rgrad(cx, cy, R * 1.6, [[0.55, c.cyan, 0.0], [0.7, c.uv, 0.22], [0.85, c.cyan, 0.08], [1, c.cyan, 0]])}"/>`);
      S.add(`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R)}" fill="none" stroke="${chrome(cy - R, cy + R)}" stroke-width="${f(R * 0.2)}"/>`);
      S.add(`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R * 1.1)}" fill="none" stroke="#ffffff" stroke-width="${f(m / 900)}" opacity="0.35"/>`);
    }, 0.5);
    // the mercury sea: chrome bands compressing toward the horizon
    for (let k = 0; k < 26; k++) {
      const t0 = Math.pow(k / 26, 2.1), t1 = Math.pow((k + 1) / 26, 2.1), y0 = horizon + (H - horizon) * t0, y1 = horizon + (H - horizon) * t1;
      const ph = S.rand() * 6.28, amp = (y1 - y0) * 0.35;
      let d = `M0 ${f(y0)}`;
      for (let i = 1; i <= 24; i++) { const x = (i / 24) * W; d += ` L${f(x)} ${f(y0 + Math.sin(i * 0.7 + ph) * amp)}`; }
      d += ` L${W} ${f(y1)} L0 ${f(y1)} Z`;
      S.add(`<path d="${d}" fill="${chrome(y0, y1)}" opacity="${(0.06 + t0 * 0.22).toFixed(2)}"/>`);
    }
    // FBF sparks: yellow / cyan / purple glints on the swell
    let sparks = "";
    for (let i = 0; i < 70; i++) { const t = Math.pow(S.rand(), 1.4), y = horizon + (H - horizon) * t, x = cx + (S.rand() - 0.5) * W * (0.3 + t); sparks += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(m * (0.0015 + t * 0.003))}" fill="${[c.brass, c.cyan, c.uv][i % 3]}"/>`; }
    S.add(`<g filter="${S.glow(m / 700)}">${sparks}</g>`);
    S.vignette(c.crust, 0.65);
  },

  // 12AM · The Headliner: navy depth, a crescent moon, skyline, sodium streetlights
  midnight(c, S) {
    const { W, H, m, portrait } = S, ground = H * (portrait ? 0.74 : 0.76);
    S.sky([[0, c.crust], [0.6, c.mantle], [1, mix(c.base, c.blue, 0.25)]]);
    S.stars(Math.round(W * H / 18000), ground * 0.8, [c.text, c.text, c.blueLight || c.cyanLight, c.brassLight], 2.2);
    const mx = W * (portrait ? 0.7 : 0.76), my = H * (portrait ? 0.2 : 0.22), mr = m * 0.075;
    S.add(`<circle cx="${f(mx)}" cy="${f(my)}" r="${f(mr * 4)}" fill="${S.rgrad(mx, my, mr * 4, [[0, c.blueLight || c.cyanLight, 0.22], [1, c.blue, 0]])}"/>`);
    const crescent = S.mask(`<rect width="${W}" height="${H}" fill="#fff"/><circle cx="${f(mx + mr * 0.42)}" cy="${f(my - mr * 0.2)}" r="${f(mr * 0.88)}" fill="#000"/>`);
    S.add(`<circle cx="${f(mx)}" cy="${f(my)}" r="${f(mr)}" fill="${S.vgrad([[0, "#fffbe8"], [1, c.brassLight]])}" mask="${crescent}"/>`);
    // skyline: three depths of buildings, sparse warm windows
    for (let layer = 0; layer < 3; layer++) {
      const col = mix(c.mantle, c.crust, layer * 0.45), base = ground, maxH = H * (0.32 - layer * 0.08);
      let x = -m * 0.02, s = "";
      while (x < W) {
        const bw = m * (0.04 + S.rand() * 0.07), bh = maxH * (0.3 + S.rand() * 0.7), top = base - bh;
        s += `<rect x="${f(x)}" y="${f(top)}" width="${f(bw)}" height="${f(bh + 2)}" fill="${S.enamel(col, top, base)}"/>`;
        for (let wy = top + m * 0.015; wy < base - m * 0.02; wy += m * 0.018) for (let wx = x + m * 0.008; wx < x + bw - m * 0.01; wx += m * 0.014) if (S.rand() < 0.07 + layer * 0.04) s += `<rect x="${f(wx)}" y="${f(wy)}" width="${f(m * 0.006)}" height="${f(m * 0.008)}" fill="${S.rand() > 0.3 ? c.brass : c.brassLight}" opacity="${(0.55 + layer * 0.15).toFixed(2)}"/>`;
        x += bw + m * 0.004;
      }
      S.add(s);
    }
    // the road and its sodium lamps
    S.add(`<rect x="0" y="${f(ground)}" width="${W}" height="${f(H - ground)}" fill="${S.vgrad([[0, c.mantle], [1, c.crust]])}"/>`);
    const vx = W / 2;
    S.add(`<path d="M${f(vx - m * 0.01)} ${f(ground)} L${f(W * 0.12)} ${H} L${f(W * 0.88)} ${H} L${f(vx + m * 0.01)} ${f(ground)} Z" fill="${mix(c.crust, c.mantle, 0.5)}"/>`);
    for (let k = 0; k < 8; k++) { const t = Math.pow(k / 8, 2), y = ground + (H - ground) * t; S.add(`<rect x="${f(vx - m * 0.002 * (1 + t * 6))}" y="${f(y)}" width="${f(m * 0.004 * (1 + t * 6))}" height="${f(m * 0.01 * (1 + t * 4))}" fill="${c.brass}" opacity="0.55"/>`); }
    for (const side of [-1, 1]) for (let k = 0; k < 5; k++) {
      const t = Math.pow((k + 1) / 5, 1.7), y = ground + (H - ground) * t, x = vx + side * (m * 0.02 + (W * 0.42) * t), hgt = m * (0.05 + t * 0.22);
      S.add(`<line x1="${f(x)}" y1="${f(y)}" x2="${f(x)}" y2="${f(y - hgt)}" stroke="${c.overlay1}" stroke-width="${f(m / 1500 * (1 + t * 3))}"/>`);
      S.add(`<circle cx="${f(x)}" cy="${f(y - hgt)}" r="${f(m * 0.06 * (0.3 + t))}" fill="${S.rgrad(x, y - hgt, m * 0.06 * (0.3 + t), [[0, c.brassLight, 0.6], [1, c.sunset, 0]])}"/><circle cx="${f(x)}" cy="${f(y - hgt)}" r="${f(m * 0.004 * (1 + t * 2))}" fill="${c.brassLight}"/>`);
      S.add(`<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(m * 0.05 * (0.4 + t))}" ry="${f(m * 0.01 * (0.4 + t))}" fill="${c.brass}" opacity="0.14"/>`);
    }
    S.fog(ground - m * 0.02, m * 0.06, c.blue, 0.18);
    S.vignette(c.crust, 0.6);
  },

  // 2AM · The Warehouse: steel columns, geometric UV beams crossing in haze, a wet floor
  strobe(c, S) {
    const { W, H, m, portrait } = S, floorY = H * (portrait ? 0.68 : 0.7);
    S.sky([[0, c.crust], [1, mix(c.crust, c.uv, 0.12)]]);
    S.reflect(floorY, () => {
      // steel columns and a gantry
      const cols = portrait ? 4 : 7;
      for (let i = 0; i <= cols; i++) { const x = (i / cols) * W; S.add(`<rect x="${f(x - m * 0.012)}" y="0" width="${f(m * 0.024)}" height="${f(floorY)}" fill="${S.enamel(c.surface1, 0, floorY)}"/>`); }
      S.add(`<rect x="0" y="${f(H * 0.08)}" width="${W}" height="${f(m * 0.02)}" fill="${c.surface1}"/>`);
      // beams: straight, geometric, from fixtures on the gantry
      const fixtures = portrait ? 5 : 8, colors = [c.uv, c.cyan, c.pink, c.uv, c.lavender];
      let beams = "";
      for (let i = 0; i < fixtures; i++) {
        const fx = W * ((i + 0.5) / fixtures), fy = H * 0.09 + m * 0.02, col = colors[i % colors.length];
        for (let k = 0; k < 3; k++) {
          const tx = W * (0.5 + (S.rand() - 0.5) * 1.3), ty = floorY;
          beams += `<path d="M${f(fx)} ${f(fy)} L${f(tx - m * 0.012)} ${f(ty)} L${f(tx + m * 0.012)} ${f(ty)} Z" fill="${S.vgrad([[0, col, 0.55], [1, col, 0.08]])}"/>`;
          beams += `<line x1="${f(fx)}" y1="${f(fy)}" x2="${f(tx)}" y2="${f(ty)}" stroke="${col}" stroke-width="${f(m / 1100)}" opacity="0.9"/>`;
        }
        beams += `<circle cx="${f(fx)}" cy="${f(fy)}" r="${f(m * 0.008)}" fill="#ffffff"/>`;
      }
      S.add(`<g filter="${S.glow(m / 500)}">${beams}</g>`);
      // a contained strobe flare at the center, never a white-out
      const sx = W / 2, sy = H * 0.09 + m * 0.02;
      S.add(`<circle cx="${f(sx)}" cy="${f(sy)}" r="${f(m * 0.12)}" fill="${S.rgrad(sx, sy, m * 0.12, [[0, "#ffffff", 0.7], [0.25, c.lavender, 0.3], [1, c.uv, 0]])}"/>`);
    }, 0.35);
    // haze and a grid on the wet floor
    S.fog(floorY - m * 0.1, m * 0.25, c.uv, 0.14);
    for (let i = -10; i <= 10; i++) S.add(`<line x1="${f(W / 2 + i * W / 60)}" y1="${f(floorY)}" x2="${f(W / 2 + i * W / 7)}" y2="${H}" stroke="${c.uv}" stroke-width="${f(m / 1800)}" opacity="0.35"/>`);
    S.vignette(c.crust, 0.7);
  },
};

// light sets use dark "ink" accents for text contrast; scenes need real light from 4AM's
function worldSvg(p, W, H, sun4am) {
  const draw = WORLDS[p.meta.slug];
  if (!draw) return null;
  const S = scene(W, H, [...p.meta.slug].reduce((a, ch) => a * 31 + ch.charCodeAt(0), 7));
  draw(p.colors, S, sun4am);
  const light = p.meta.appearance === "light";
  S.wordmark(p.meta.name, p.colors.brass, light ? p.colors.base : p.colors.crust);
  return S.svg();
}

module.exports = { worldSvg, WORLDS };
