#!/usr/bin/env node
// Icon theme gate (CI): every icon path exists, every association points at a defined icon,
// and every SVG parses, renders, and isn't blank at 16 px. Exits 1 on any problem.
const fs = require("fs"), path = require("path");
const { Resvg } = require("@resvg/resvg-js");
let bad = 0;
for (const theme of ["icons/brass-lasers-icon-theme.json", "icons/brass-lasers-classic-icon-theme.json"]) {
  const t = JSON.parse(fs.readFileSync(theme, "utf8"));
  const ids = new Set(Object.keys(t.iconDefinitions));
  for (const [id, d] of Object.entries(t.iconDefinitions)) if (!fs.existsSync(path.join("icons", d.iconPath))) { bad++; console.log("missing file", id, d.iconPath); }
  const refs = (o) => Object.values(o || {});
  for (const scope of [t, t.light]) {
    for (const k of ["file", "folder", "folderExpanded", "rootFolder", "rootFolderExpanded"]) if (!ids.has(scope[k])) { bad++; console.log("dangling", theme, k, scope[k]); }
    for (const m of ["fileExtensions", "fileNames", "languageIds", "folderNames", "folderNamesExpanded"]) for (const id of refs(scope[m])) if (!ids.has(id)) { bad++; console.log("dangling", theme, m, id); }
  }
}
// every SVG must parse and render, and must not come out blank
let n = 0, blank = [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith(".svg") ? [path.join(d, e.name)] : []));
for (const f of walk("icons")) {
  try {
    const img = new Resvg(fs.readFileSync(f, "utf8"), { fitTo: { mode: "width", value: 16 }, font: { loadSystemFonts: false } }).render();
    const px = img.pixels; let ink = 0; for (let i = 3; i < px.length; i += 4) if (px[i] > 40) ink++;
    if (ink < 6) blank.push(f);
    n++;
  } catch (e) { bad++; console.log("render error", f, e.message); }
}
// Coverage regression: a finished icon may gain some weight from its rim and cut shadow (up to
// ~0.4 of the box for thin-line glyphs), but a mostly-empty source must never turn into a solid
// block (the bug where an invisible bounding box lost its inherited fill="none" and went black).
const cover = (svg) => { const px = new Resvg(svg, { fitTo: { mode: "width", value: 32 }, font: { loadSystemFonts: false } }).render().pixels; let k = 0; for (let i = 3; i < px.length; i += 4) if (px[i] > 40) k++; return k / (px.length / 4); };
const MAT = "node_modules/material-icon-theme/dist";
const mat = JSON.parse(fs.readFileSync(path.join(MAT, "material-icons.json"), "utf8"));
const grew = [];
for (const scheme of ["dark", "light"]) for (const f of fs.readdirSync(`icons/files/${scheme}`)) {
  const id = f.replace(/\.svg$/, "");
  const src = cover(fs.readFileSync(path.join(MAT, mat.iconDefinitions[id].iconPath), "utf8"));
  const ours = cover(fs.readFileSync(`icons/files/${scheme}/${f}`, "utf8"));
  if (ours - src > 0.45 || (ours > 0.97 && src < 0.75)) grew.push(`${scheme}/${id} ${src.toFixed(2)}->${ours.toFixed(2)}`);
}
if (grew.length) { bad += grew.length; console.log("coverage blew up:", grew.slice(0, 12).join(", ")); }
// built-in control: the exact shape of that bug must stay fixed
{
  const { edge } = require("./icon-finish.js");
  const probe = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path d="M0 0h24v24H0z"/><path fill="#8bc34a" d="M4 4h6v6H4z"/></svg>';
  const pal = JSON.parse(fs.readFileSync("site/palettes.json", "utf8"))[0].colors;
  const c = cover(edge(probe, pal));
  if (c > 0.3) { bad++; console.log(`control: root fill="none" lost (coverage ${c.toFixed(2)})`); }
}
console.log(`icons: rendered ${n} SVGs; blank at 16px: ${blank.length}${blank.length ? " -> " + blank.slice(0, 12).join(", ") : ""}; problems: ${bad}`);
process.exit(bad || blank.length ? 1 : 0);
