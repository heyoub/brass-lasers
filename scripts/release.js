// Cut a release locally:  npm run release -- <patch|minor|major|X.Y.Z> [--push]
// Bumps package.json + zed/extension.toml, turns "## Unreleased" into the version heading,
// rebuilds, runs every check, commits "Release X.Y.Z" and tags vX.Y.Z. Pushing the tag publishes
// (see .github/workflows/release.yml); without --push nothing leaves the machine.
"use strict";
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const rel = (p) => path.join(root, p);
const sh = (cmd, opts = {}) => execSync(cmd, { cwd: root, stdio: "inherit", ...opts });
const out = (cmd) => execSync(cmd, { cwd: root, encoding: "utf8" }).trim();
const die = (msg) => { console.error(`release: ${msg}`); process.exit(1); };

const args = process.argv.slice(2);
const push = args.includes("--push");
const bump = args.find((a) => !a.startsWith("--"));
if (!bump) die("usage: npm run release -- <patch|minor|major|X.Y.Z> [--push]");

if (out("git status --porcelain")) die("working tree is not clean; commit or stash first");
const branch = out("git rev-parse --abbrev-ref HEAD");
if (branch !== "master") die(`on ${branch}; releases are cut from master`);

const pkgPath = rel("package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const cur = pkg.version.split(".").map(Number);
let next;
if (bump === "patch") next = [cur[0], cur[1], cur[2] + 1];
else if (bump === "minor") next = [cur[0], cur[1] + 1, 0];
else if (bump === "major") next = [cur[0] + 1, 0, 0];
else if (/^\d+\.\d+\.\d+$/.test(bump)) next = bump.split(".").map(Number);
else die(`can't read "${bump}" as a version`);
const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
if (cmp(next, cur) <= 0) die(`${next.join(".")} is not newer than ${pkg.version}`);
const version = next.join(".");
if (out(`git tag -l v${version}`)) die(`tag v${version} already exists`);

// CHANGELOG: "## Unreleased[ — name]" becomes "## X.Y.Z[ — name]" and must have notes
const clPath = rel("CHANGELOG.md");
const cl = fs.readFileSync(clPath, "utf8").replace(/\r\n/g, "\n");
const m = cl.match(/^## Unreleased(.*)\n([\s\S]*?)(?=^## |(?![\s\S]))/m);
if (!m) die("CHANGELOG.md has no \"## Unreleased\" section; add your notes there first");
if (!m[2].trim()) die("the \"## Unreleased\" section in CHANGELOG.md is empty");
fs.writeFileSync(clPath, cl.replace(/^## Unreleased/m, `## ${version}`));

pkg.version = version;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
const zedPath = rel("zed/extension.toml");
fs.writeFileSync(zedPath, fs.readFileSync(zedPath, "utf8").replace(/^version\s*=\s*"[^"]+"/m, `version = "${version}"`));
for (const lock of ["package-lock.json"]) {
  const p = rel(lock);
  if (!fs.existsSync(p)) continue;
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  j.version = version;
  if (j.packages && j.packages[""]) j.packages[""].version = version;
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n");
}

sh("node scripts/build.js");
sh("npm run check");
sh("git add -A");
sh(`git commit -q -m "Release ${version}${m[1]}"`);
sh(`git tag -a v${version} -m "Brass Lasers ${version}"`);
console.log(`\nrelease: v${version} committed and tagged.`);
if (push) { sh("git push --follow-tags"); console.log("release: pushed; the Release workflow publishes from here."); }
else console.log("release: run `git push --follow-tags` to publish (or `git tag -d v" + version + " && git reset --hard HEAD~1` to undo).");
