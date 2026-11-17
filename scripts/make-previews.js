#!/usr/bin/env node
// Code previews rendered from the *generated* VS Code theme files with Shiki
// (the same TextMate grammars VS Code uses), drawn as SVG and rasterized with resvg.
// These can never drift from the shipped themes: CI regenerates them on palette changes.
//
//   npm run previews
//
// Output: media/previews/<variant>-<lang>.png and media/previews/lineup.png

const fs = require("fs");
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");
const { loadPalettes } = require("./build.js");

const ROOT = path.resolve(__dirname, "..");
// fonts with real italic faces first (Cascadia ships without one on Windows)
const MONO = "Consolas, DejaVu Sans Mono, Menlo, monospace";
const SANS = "Segoe UI, Inter, Helvetica, Arial, sans-serif";
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const SAMPLES = {
  tsx: { file: "neon-setlist.tsx", lang: "tsx", cur: 1, code: fs.readFileSync(path.join(ROOT, "media/screenshots/samples/neon-setlist.tsx"), "utf8").split(/\r?\n/).slice(15, 61).join("\n") },
  rust: { file: "main.rs", lang: "rust", cur: 29, code: fs.readFileSync(path.join(ROOT, "media/screenshots/samples/laser-rig/src/main.rs"), "utf8").split(/\r?\n/).slice(0, 46).join("\n") },
  python: {
    file: "lightshow.py",
    lang: "python",
    cur: 9,
    code: `from dataclasses import dataclass, field

MAX_STROBE_HZ = 24


@dataclass
class Laser:
    """One beam in the rig. Colors come straight from the palette."""
    color: str
    strobe_hz: int = MAX_STROBE_HZ // 2
    cues: list[str] = field(default_factory=list)

    def fire(self, beats: int) -> str:
        # the fog machine never sleeps
        self.cues.append(f"{self.color} x{beats}")
        return f"{self.color} at {self.strobe_hz}hz for {beats} beats"


async def light_show(rig: list[Laser]) -> None:
    for laser in rig:
        if laser.strobe_hz > MAX_STROBE_HZ:
            raise ValueError(f"{laser.color} is strobing too hard")
        print(laser.fire(beats=4))


rig = [Laser("hot pink"), Laser("lime", strobe_hz=30), Laser("brass")]
`,
  },
};

function cardSvg(p, tokens, sample, W, fontSize) {
  const c = p.colors, lh = Math.round(fontSize * 1.6), padTop = 86, gutter = Math.round(fontSize * 4);
  const lines = tokens.length, H = padTop + lines * lh + 28;
  let body = "";
  tokens.forEach((line, i) => {
    const y = padTop + i * lh + Math.round(lh * 0.72);
    if (i === sample.cur) body += `<rect x="0" y="${padTop + i * lh}" width="${W}" height="${lh}" fill="${c.lineHighlight}"/>`;
    body += `<text x="${gutter - 18}" y="${y}" text-anchor="end" font-family="${MONO}" font-size="${fontSize}" fill="${i === sample.cur ? c.brass : c.lineNumber}">${i + 1}</text>`;
    const spans = line
      .map((t) => {
        const st = t.fontStyle || 0;
        return `<tspan fill="${t.color || c.textEditor}"${st & 1 ? ' font-style="italic"' : ""}${st & 2 ? ' font-weight="700"' : ""}${st & 4 ? ' text-decoration="underline"' : ""}>${esc(t.content)}</tspan>`;
      })
      .join("");
    body += `<text x="${gutter}" y="${y}" font-family="${MONO}" font-size="${fontSize}" xml:space="preserve">${spans}</text>`;
  });
  return {
    H,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" rx="14" fill="${c.base}"/>
  <path d="M0 14a14 14 0 0 1 14-14h${W - 28}a14 14 0 0 1 14 14v26H0z" fill="${c.mantle}"/>
  <circle cx="22" cy="20" r="6" fill="${c.red}"/><circle cx="42" cy="20" r="6" fill="${c.brass}"/><circle cx="62" cy="20" r="6" fill="${c.lime}"/>
  <text x="${W / 2}" y="25" text-anchor="middle" font-family="${SANS}" font-size="13" fill="${c.subtext0}">Brass Lasers ${esc(p.meta.name)}</text>
  <rect x="0" y="40" width="${W}" height="34" fill="${c.mantle}"/>
  <rect x="0" y="40" width="190" height="34" fill="${c.base}"/><rect x="0" y="40" width="190" height="2" fill="${c.pink}"/>
  <text x="18" y="62" font-family="${SANS}" font-size="13" fill="${c.text}">${esc(sample.file)}</text>
  <rect x="0" y="74" width="${W}" height="1" fill="${c.border0}"/>
  ${body}
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="none" stroke="${c.border1}"/>
</svg>`,
  };
}

function png(svg, out) {
  const r = new Resvg(svg, { font: { loadSystemFonts: true, defaultFontFamily: "Consolas" }, fitTo: { mode: "zoom", value: 2 } });
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, r.render().asPng());
  console.log("wrote", path.relative(ROOT, out));
}

async function main() {
  const { createHighlighter } = await import("shiki");
  const palettes = loadPalettes();
  const themes = palettes.map((p) => {
    const file = path.join(ROOT, "themes", `Brass-Lasers-${p.meta.name.replace(/\s+/g, "-")}-color-theme.json`);
    const t = JSON.parse(fs.readFileSync(file, "utf8"));
    return { ...t, name: `brass-lasers-${p.meta.slug}`, type: p.meta.appearance };
  });
  const hl = await createHighlighter({ themes, langs: ["tsx", "rust", "python"] });

  const lineup = [];
  for (const p of palettes) {
    for (const [key, sample] of Object.entries(SAMPLES)) {
      const { tokens } = hl.codeToTokens(sample.code, { lang: sample.lang, theme: `brass-lasers-${p.meta.slug}` });
      const { svg } = cardSvg(p, tokens, sample, 980, 15);
      png(svg, path.join(ROOT, "media/previews", `${p.meta.slug}-${key}.png`));
      if (key === "tsx") lineup.push({ p, tokens: tokens.slice(0, 22), sample: { ...sample, cur: 1 } });
    }
  }

  // 2x2 lineup of the four sets
  const cw = 900, gap = 28, cards = lineup.map(({ p, tokens, sample }) => cardSvg(p, tokens, sample, cw, 13));
  const ch = Math.max(...cards.map((c) => c.H)), W = cw * 2 + gap * 3, H = ch * 2 + gap * 3;
  const inner = cards.map((c, i) => `<g transform="translate(${gap + (i % 2) * (cw + gap)},${gap + Math.floor(i / 2) * (ch + gap)})">${c.svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "")}</g>`).join("");
  png(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${palettes[0].colors.crust}"/>${inner}</svg>`, path.join(ROOT, "media/previews/lineup.png"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
