// Is what's live what the repo says it is? Compares package.json (and Neon Glow's) against every
// place the extension is served: Open VSX, Cursor's store mirror, GitHub Releases, the Pages site,
// and the VS Marketplace once it's published there.
//   node scripts/check-stores.js                 report; exit 1 on any mismatch
//   node scripts/check-stores.js --wait 30       retry for up to 30 min (right after a release)
//   node scripts/check-stores.js --expect 9.9.9  pretend the repo is at 9.9.9 (negative control)
//   STORES_REPORT=file.md                        also write a markdown report (for the issue)
"use strict";
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const pkg = require(path.join(root, "package.json"));
const glow = require(path.join(root, "extensions/glow/package.json"));
const ID = `${pkg.publisher}.${pkg.name}`;
const REPO = (pkg.repository && (pkg.repository.url || pkg.repository)).replace(/^.*github\.com[/:]|\.git$/g, "");
const SITE = pkg.homepage || "https://heyoub.github.io/brass-lasers/";
const expect = process.argv.includes("--expect") ? process.argv[process.argv.indexOf("--expect") + 1] : null;
if (expect) pkg.version = expect;
const waitMin = Number(process.argv[process.argv.indexOf("--wait") + 1]) || 0;

async function get(url, opts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch(url, { ...opts, signal: ctrl.signal, headers: { "user-agent": "brass-lasers-store-check", ...(opts.headers || {}) } });
    return { status: r.status, text: await r.text() };
  } finally { clearTimeout(t); }
}
const json = async (url, opts) => { const r = await get(url, opts); if (r.status !== 200) throw new Error(`HTTP ${r.status}`); return JSON.parse(r.text); };

const gallery = (base, id) => json(`${base}/_apis/public/gallery/extensionquery`, {
  method: "POST",
  headers: { "content-type": "application/json", accept: "application/json;api-version=3.0-preview.1" },
  body: JSON.stringify({ filters: [{ criteria: [{ filterType: 7, value: id }] }], flags: 0x1 | 0x2 | 0x10 | 0x80 | 0x200 }),
}).then((j) => { const e = j.results?.[0]?.extensions?.[0]; return e ? e.versions[0].version : null; });

// [name, expected, fetch live version, optional?]
const CHECKS = [
  ["Open VSX", pkg.version, () => json(`https://open-vsx.org/api/${pkg.publisher}/${pkg.name}`).then((j) => j.version)],
  ["Open VSX changelog", pkg.version, () => get(`https://open-vsx.org/api/${pkg.publisher}/${pkg.name}/latest/file/changelog.md`).then((r) => (r.text.match(/^## (\d+\.\d+\.\d+)/m) || [])[1])],
  ["Cursor store", pkg.version, () => gallery("https://marketplace.cursorapi.com", ID)],
  ["GitHub Releases", pkg.version, () => json(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {} }).then((j) => j.tag_name.replace(/^v/, ""))],
  ["Site install command", pkg.version, () => get(SITE).then((r) => (r.text.match(/brass-lasers-4am-(\d+\.\d+\.\d+)\.vsix/) || [])[1])],
  ["Neon Glow on Open VSX", glow.version, () => json(`https://open-vsx.org/api/${glow.publisher}/${glow.name}`).then((j) => j.version)],
  ["VS Marketplace", pkg.version, () => gallery("https://marketplace.visualstudio.com", ID), "optional"],
];

async function once() {
  const rows = [];
  for (const [name, want, live, optional] of CHECKS) {
    let got, err;
    try { got = await live(); } catch (e) { err = e.message; }
    const ok = got === want;
    const state = ok ? "ok" : optional && !got && !err ? "not published" : "MISMATCH";
    rows.push({ name, want, got: state === "not published" ? "not published" : got || (err ? `error: ${err}` : "missing"), state });
  }
  return rows;
}

(async () => {
  const deadline = Date.now() + waitMin * 60000;
  let rows;
  for (;;) {
    rows = await once();
    if (!rows.some((r) => r.state === "MISMATCH") || Date.now() >= deadline) break;
    console.log(`waiting: ${rows.filter((r) => r.state === "MISMATCH").map((r) => r.name).join(", ")} not caught up yet`);
    await new Promise((r) => setTimeout(r, 120000));
  }
  const bad = rows.filter((r) => r.state === "MISMATCH");
  for (const r of rows) console.log(`${r.state === "ok" ? "ok  " : r.state === "MISMATCH" ? "FAIL" : "--  "} ${r.name}: ${r.got}${r.state === "MISMATCH" ? ` (repo says ${r.want})` : ""}`);
  if (process.env.STORES_REPORT) {
    fs.writeFileSync(process.env.STORES_REPORT, [
      `The repo is at **${pkg.version}** (Neon Glow ${glow.version}), but not every store is serving it:`, "",
      "| Where | Live | Repo |", "|---|---|---|",
      ...rows.map((r) => `| ${r.state === "MISMATCH" ? "❌" : r.state === "ok" ? "✅" : "➖"} ${r.name} | ${r.got} | ${r.want} |`), "",
      "Usual causes: the Release workflow failed (check its run), an expired `OVSX_PAT`, or the version was bumped without pushing a tag (`npm run release`).",
    ].join("\n") + "\n");
  }
  console.log(bad.length ? `stores: ${bad.length} out of date` : `stores: everything serves ${pkg.version}`);
  process.exit(bad.length ? 1 : 0);
})();
