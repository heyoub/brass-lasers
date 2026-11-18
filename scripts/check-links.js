// Every link in the docs and on the site still goes somewhere.
//   node scripts/check-links.js             external + relative links; exit 1 if any is broken
//   node scripts/check-links.js --local     relative links only (fast, offline; runs in CI)
//   LINKS_REPORT=file.md                    also write a markdown report (for the issue)
// "Broken" means 404/410, DNS failure, or a missing local file. Rate limits, bot walls (403/429)
// and timeouts are reported as unverified, not broken, so the issue only opens on real rot.
"use strict";
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const local = process.argv.includes("--local");

// Hand-written sources only: generated files inherit their links from these
const DOCS = ["README.md", "PUBLISH.md", "CHANGELOG.md", "zed/README.md", "extensions/glow/README.md", "templates/site/index.html", "media/icon-lab/README.md",
  ...fs.readdirSync(path.join(root, "ports")).filter((f) => f.endsWith(".md")).map((f) => `ports/${f}`),
  ...fs.readdirSync(path.join(root, "templates/ports")).filter((f) => f.endsWith(".md")).map((f) => `templates/ports/${f}`)]
  .filter((f) => fs.existsSync(path.join(root, f)));

const SKIP = /^(mailto:|javascript:|data:|#)|localhost|127\.0\.0\.1|example\.(com|org)|\{\{|\$\{|<|YOUR_/;
const links = new Map(); // url -> [where]
const add = (url, where) => { if (!links.has(url)) links.set(url, []); links.get(url).push(where); };

for (const doc of DOCS) {
  const src = fs.readFileSync(path.join(root, doc), "utf8");
  const lines = src.split(/\r?\n/);
  let fence = false;
  lines.forEach((line, i) => {
    if (/^\s*```/.test(line)) fence = !fence;
    if (fence) return; // commands in code blocks aren't links
    if (/rel="(preconnect|dns-prefetch)"/.test(line)) return; // origins, not pages
    const found = [
      ...[...line.matchAll(/\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\)/g)].map((m) => m[1]), // markdown
      ...[...line.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((m) => m[1]),               // html
      ...[...line.matchAll(/(?<![("=])\bhttps?:\/\/[^\s)<>"'`\]]+/g)].map((m) => m[0]),  // bare
    ];
    for (let u of found) {
      u = u.replace(/[.,;:!?*]+$/, "");
      if (SKIP.test(u)) continue;
      add(u, `${doc}:${i + 1}`);
    }
  });
}

// The site is assembled by the Pages workflow's `cp ... _site/...` lines; read them so the
// check resolves site links exactly the way the deploy lays files out.
const SITE_MOUNTS = [...fs.readFileSync(path.join(root, ".github/workflows/pages.yml"), "utf8")
  .matchAll(/cp (?:-r )?(\S+?)(?:\/\*|\/\.)? _site\/(\S*)/g)].map((m) => ({ from: m[1], to: m[2] }));

function checkLocal(u, where) {
  const doc = where.split(":")[0];
  const clean = decodeURIComponent(u.split(/[?#]/)[0]).replace(/^\.\//, "");
  if (!clean) return true;
  if (!doc.startsWith("templates/site/")) return fs.existsSync(path.join(path.dirname(path.join(root, doc)), clean));
  return SITE_MOUNTS.some(({ from, to }) => {
    if (to && !to.endsWith("/")) return clean === to && fs.existsSync(path.join(root, from)); // single file
    if (!clean.startsWith(to)) return false;
    return fs.existsSync(path.join(root, from, clean.slice(to.length)));
  });
}

async function checkRemote(u) {
  for (const method of ["HEAD", "GET"]) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 20000);
    try {
      const r = await fetch(u, { method, redirect: "follow", signal: ctrl.signal, headers: { "user-agent": "Mozilla/5.0 (brass-lasers link check)", accept: "text/html,*/*" } });
      if (r.ok) return { state: "ok" };
      if (method === "HEAD" && r.status !== 404 && r.status !== 410) continue; // many servers reject HEAD
      if (r.status === 404 || r.status === 410) { if (method === "HEAD") continue; return { state: "broken", why: `HTTP ${r.status}` }; }
      return { state: "unverified", why: `HTTP ${r.status}` };
    } catch (e) {
      const code = e.cause && e.cause.code;
      if (code === "ENOTFOUND") return { state: "broken", why: "domain not found" };
      if (method === "GET") return { state: "unverified", why: e.name === "AbortError" ? "timeout" : code || e.message };
    } finally { clearTimeout(t); }
  }
  return { state: "unverified", why: "no answer" };
}

(async () => {
  const results = [];
  const remote = [];
  for (const [u, where] of links) {
    if (/^https?:\/\//.test(u)) remote.push([u, where]);
    else if (!/^[a-z]+:/i.test(u)) results.push({ u, where, ...(where.every((w) => checkLocal(u, w)) ? { state: "ok" } : { state: "broken", why: "file not found" }) });
  }
  if (!local) {
    const queue = [...remote];
    await Promise.all(Array.from({ length: 8 }, async () => {
      for (let job; (job = queue.shift());) results.push({ u: job[0], where: job[1], ...(await checkRemote(job[0])) });
    }));
  }
  const broken = results.filter((r) => r.state === "broken");
  const unverified = results.filter((r) => r.state === "unverified");
  for (const r of [...broken, ...unverified]) console.log(`${r.state === "broken" ? "BROKEN" : "unverified"}  ${r.u}  (${r.why}; ${r.where.slice(0, 3).join(", ")})`);
  if (process.env.LINKS_REPORT) {
    const row = (r) => `| ${r.u} | ${r.why} | ${r.where.slice(0, 3).map((w) => `\`${w}\``).join(", ")} |`;
    fs.writeFileSync(process.env.LINKS_REPORT, [
      `${broken.length} link${broken.length === 1 ? "" : "s"} no longer resolve:`, "", "| Link | Problem | Where |", "|---|---|---|", ...broken.map(row), "",
      unverified.length ? `Couldn't verify ${unverified.length} more (rate limits or bot walls), probably fine:\n\n| Link | Problem | Where |\n|---|---|---|\n${unverified.map(row).join("\n")}\n` : "",
    ].join("\n"));
  }
  console.log(`links: ${results.length} checked${local ? " (local only)" : ""}, ${broken.length} broken, ${unverified.length} unverified`);
  process.exit(broken.length ? 1 : 0);
})();
