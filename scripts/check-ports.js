#!/usr/bin/env node
// Offline port qualification, run on every PR. No downloads, no apps.
//   L1 structural — every generated file exists and parses
//   L2 semantic   — every key is in the upstream contract snapshot (scripts/ports/contracts/),
//                   and each port's main surfaces carry the intended palette roles
// Every check also runs a negative control: a deliberately broken copy must fail it,
// which proves the check can catch what it claims to.
// L3 (real app loads it) and L4 (seen on screen) come from ports/qualification.json and the
// weekly runtime smoke job; they're merged into the generated ports/COMPAT.md.
//
//   node scripts/check-ports.js            check everything, verify COMPAT.md is fresh
//   node scripts/check-ports.js --write    also regenerate ports/COMPAT.md
"use strict";
const fs = require("fs");
const path = require("path");
const { ROOT, PALETTES, TARGETS, hex } = require("./ports/targets.js");

const WRITE = process.argv.includes("--write");
const contractDir = path.join(__dirname, "ports", "contracts");
const contract = (id) => {
  const f = path.join(contractDir, `${id}.json`);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null;
};
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

let failures = 0;
const fail = (msg) => { failures++; console.error(`  FAIL ${msg}`); };
const results = {};

function checkFile(t, p, rel, text) {
  const errs = [];
  let parsed;
  try { parsed = t.parse(text, rel); } catch (e) { return [`L1 parse: ${e.message}`]; }
  if (t.contract) {
    const c = contract(t.contract);
    if (!c) errs.push(`L2 no contract snapshot for ${t.contract} (run: node scripts/refresh-port-contracts.js)`);
    else {
      const ok = new Set(c.recognized), legacy = new Set(t.legacy ? t.legacy(text) : []);
      const bad = t.keys(parsed, text).filter((k) => !ok.has(k) && !legacy.has(k));
      if (bad.length) errs.push(`L2 contract: not recognized by ${c.source.name}: ${[...new Set(bad)].join(", ")}`);
    }
  }
  for (const [role, [get, key]] of Object.entries(t.roles || {})) {
    let got;
    try { got = hex(get(parsed, text, p)); } catch (e) { errs.push(`L2 parity ${role}: ${e.message}`); continue; }
    const want = hex(p.colors[key]);
    if (got !== want) errs.push(`L2 parity ${role}: ${got} ≠ ${key} ${want}`);
  }
  return errs;
}

for (const t of TARGETS) {
  const r = (results[t.id] = { name: t.name, files: 0, sets: 0, contract: !!t.contract, parity: Object.keys(t.roles || {}), controls: [] });
  for (const p of PALETTES) {
    let setOk = true;
    for (const rel of t.files(p)) {
      if (!fs.existsSync(path.join(ROOT, rel))) { fail(`${t.id} ${p.meta.slug}: missing ${rel}`); setOk = false; continue; }
      r.files++;
      for (const e of checkFile(t, p, rel, read(rel))) { fail(`${t.id} ${p.meta.slug} ${rel}: ${e}`); setOk = false; }
    }
    if (setOk) r.sets++;
  }

  // negative controls, on the first set
  const p = PALETTES[0], rel = t.files(p)[0], text = read(rel);
  const expectFail = (label, broken, file = rel) => {
    const errs = checkFile(t, p, file, broken);
    if (errs.length) r.controls.push(label);
    else fail(`${t.id}: negative control "${label}" was NOT caught; the check is blind to it`);
  };
  if (t.contract && t.inject) expectFail("unknown key", t.inject(text));
  const roles = Object.entries(t.roles || {});
  if (roles.length) {
    const [, [, key]] = roles[0];
    const h = p.colors[key].replace("#", "");
    const replacement = h.toLowerCase() === "123456" ? "654321" : "123456";
    const mutated = t.id === "iterm2"
      ? text.replace(/(<key>Background Color<\/key>\s*<dict>[\s\S]*?<key>Blue Component<\/key>\s*<real>)[\d.]+/, "$10.5")
      : text.replace(new RegExp(h, "gi"), replacement);
    if (mutated === text) fail(`${t.id}: parity control couldn't mutate ${key}`);
    else expectFail("wrong surface color", mutated);
  }
  if (rel.endsWith(".ps1") || t.id === "banner") expectFail("missing BOM", read(t.files(p)[1]).replace(/^﻿/, ""));
  else if (/\.(json|toml|tmTheme|icls|itermcolors|sublime-color-scheme)$/.test(rel)) expectFail("malformed file", text + "\n<<<{{ brass broken ]]");
}

// ---------- compatibility matrix ----------
const qual = JSON.parse(read("ports/qualification.json"));
const ALL = PALETTES.map((p) => p.meta.slug);
const setsLabel = (sets) => (!sets ? "" : sets.length === ALL.length ? "all 9 sets" : `${sets.length}/9 (${sets.join(", ")})`);
const rows = TARGETS.map((t) => {
  const r = results[t.id], q = qual.targets[t.id] || {};
  const l1 = r.sets === PALETTES.length ? "✅" : "❌";
  const l2parts = [r.contract && "contract", r.parity.length && "parity"].filter(Boolean);
  const l2 = l2parts.length ? (r.sets === PALETTES.length ? `✅ ${l2parts.join(" + ")}` : "❌") : "—";
  const l3 = q.runtime ? `✅ ${[q.runtime.app, q.runtime.version].filter(Boolean).join(" ")}, ${setsLabel(q.runtime.sets)} (${q.runtime.date}${q.runtime.ci ? ", weekly CI" : ""})` : "—";
  const l4 = q.visual ? `✅ ${q.visual.app}, ${setsLabel(q.visual.sets)} (${q.visual.date})` : "—";
  const controls = r.controls.length ? r.controls.join(", ") : "—";
  return `| **${t.name}** | ${l1} | ${l2} | ${l3} | ${l4} | ${controls} |`;
});
const md = `# Port compatibility matrix

Generated by \`node scripts/check-ports.js --write\` from the port checks and [qualification.json](qualification.json). Don't edit by hand. For how each port was tested, see [TESTED.md](TESTED.md).

| Level | Meaning | Where it runs |
|---|---|---|
| **L1** structural | The file exists and parses | Every PR, offline |
| **L2** semantic | Every key is recognized by the app's own source or schema (*contract*), and the main surfaces carry the intended palette colors (*parity*) | Every PR, offline; contracts refreshed weekly |
| **L3** runtime | The real app or CLI loaded it and applied the colors | Weekly CI for the Linux CLIs; by hand for the rest |
| **L4** visual | Seen on screen in the real app | By hand, per set |

A level counts only for the app version and sets listed. "Negative controls" are the deliberately broken copies each check must catch.

| Port | L1 | L2 | L3 | L4 | Negative controls caught |
|---|---|---|---|---|---|
${rows.join("\n")}

Contract snapshots: ${fs.readdirSync(contractDir).filter((f) => f.endsWith(".json")).map((f) => { const c = JSON.parse(fs.readFileSync(path.join(contractDir, f), "utf8")); return `${f.replace(".json", "")} (${c.source.name}, ${c.refreshed})`; }).join("; ")}.
`;
const out = path.join(ROOT, "ports", "COMPAT.md");
if (WRITE) fs.writeFileSync(out, md);
else if (!fs.existsSync(out) || fs.readFileSync(out, "utf8").replace(/\r\n/g, "\n") !== md) fail("ports/COMPAT.md is stale (run: node scripts/check-ports.js --write)");

const total = Object.values(results).reduce((a, r) => a + r.files, 0);
const controls = Object.values(results).reduce((a, r) => a + r.controls.length, 0);
console.log(`ports: ${TARGETS.length} targets, ${total} files, ${controls} negative controls caught${failures ? `, ${failures} FAILURES` : ", all passing"}`);
process.exit(failures ? 1 : 0);
