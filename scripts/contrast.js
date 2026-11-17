#!/usr/bin/env node
// WCAG 2.x contrast gate for every palette.
//
//   node scripts/contrast.js            check all palettes, exit 1 on any failure
//   node scripts/contrast.js --report   print every ratio, even passing ones
//
const fs = require("fs");
const path = require("path");
const { VARIANTS } = require("./build.js");
const { ratio, PAIRS, floorFor } = require("./contrast-lib.js");

const report = process.argv.includes("--report");
let failures = 0;
for (const slug of VARIANTS) {
  const file = path.join(__dirname, "..", "palette", `${slug}.json`);
  if (!fs.existsSync(file)) continue;
  const { meta, colors } = JSON.parse(fs.readFileSync(file, "utf8"));
  const rows = [];
  for (const [fg, bg, baseMin, what, only] of PAIRS) {
    if (only && only !== meta.appearance) continue;
    if (!colors[fg] || !colors[bg]) throw new Error(`${slug}: missing ${colors[fg] ? bg : fg}`);
    const min = floorFor(meta, what, baseMin);
    const r = ratio(colors[fg], colors[bg]);
    const ok = r + 1e-9 >= min;
    if (!ok) failures++;
    if (report || !ok) rows.push(`${ok ? "  ok " : "  FAIL"} ${r.toFixed(2).padStart(6)} ≥ ${min.toFixed(1)}  ${fg} on ${bg}  (${what})`);
  }
  console.log(`${meta.name}: ${rows.filter((r) => r.includes("FAIL")).length ? "FAILING" : "pass"}`);
  rows.forEach((r) => console.log(r));
}
if (failures) {
  console.error(`\n${failures} contrast failure(s).`);
  process.exit(1);
}

