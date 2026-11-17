// Validates zed/themes/brass-lasers-4am.json against Zed's v0.2.0 schema
// and Zed's built-in One Dark theme (for keys newer than the published schema).
const fs = require("fs");
const T = process.env.TEMP + "/zedres/";
const s = JSON.parse(fs.readFileSync(T + "v0.2.0.json", "utf8"));
const one = JSON.parse(fs.readFileSync(T + "one.json", "utf8")).themes.find((x) => x.appearance === "dark").style;
const th = JSON.parse(fs.readFileSync("zed/themes/brass-lasers-4am.json", "utf8"));
const problems = [];

for (const r of s.required) if (!(r in th)) problems.push("missing root " + r);
const t = th.themes[0];
for (const r of s.definitions.ThemeContent.required) if (!(r in t)) problems.push("missing theme " + r);
if (!s.definitions.AppearanceContent.enum.includes(t.appearance)) problems.push("bad appearance");

const schemaKeys = new Set(Object.keys(s.definitions.ThemeStyleContent.properties));
const oneKeys = new Set(Object.keys(one));
const styleKeys = Object.keys(t.style);
const newerThanSchema = styleKeys.filter((k) => !schemaKeys.has(k) && oneKeys.has(k));
const unknown = styleKeys.filter((k) => !schemaKeys.has(k) && !oneKeys.has(k));
unknown.forEach((k) => problems.push("unknown style key " + k));

const oneSyntax = new Set(Object.keys(one.syntax));
const syntaxKeys = Object.keys(t.style.syntax);
const unusedSyntax = syntaxKeys.filter((k) => !oneSyntax.has(k));
unusedSyntax.forEach((k) => problems.push("syntax key not used by Zed One Dark " + k));

const hex = /^#([0-9a-f]{6}|[0-9a-f]{8})$/i;
const walk = (o, p) => {
  for (const [k, v] of Object.entries(o)) {
    if (typeof v === "string" && v.startsWith("#") && !hex.test(v)) problems.push("bad hex " + p + k);
    else if (v && typeof v === "object") walk(v, p + k + ".");
  }
};
walk(t.style, "");

const fontStyles = new Set(s.definitions.FontStyleContent.enum);
const hlFields = s.definitions.HighlightStyleContent.properties;
for (const [k, v] of Object.entries(t.style.syntax)) {
  if (v.font_style && !fontStyles.has(v.font_style)) problems.push("bad font_style " + k);
  for (const f of Object.keys(v)) if (!(f in hlFields)) problems.push("bad syntax field " + k + "." + f);
}
const winBg = s.definitions.WindowBackgroundContent.enum;
if (!winBg.includes(t.style["background.appearance"])) problems.push("bad background.appearance");

const manifest = fs.readFileSync("zed/extension.toml", "utf8");
const id = /^id = "([^"]+)"/m.exec(manifest)[1];
if (/zed|extension/i.test(id)) problems.push("id contains zed/extension");
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) problems.push("id not kebab-case");
if (!id.endsWith("-theme")) problems.push("theme id should end with -theme");
const ver = /^version = "([^"]+)"/m.exec(manifest)[1];
const pkgVer = JSON.parse(fs.readFileSync("package.json", "utf8")).version;
if (!fs.existsSync("zed/LICENSE")) problems.push("zed/LICENSE missing");

console.log("style keys:", styleKeys.length, "| in v0.2.0 schema:", styleKeys.length - newerThanSchema.length - unknown.length);
console.log("newer than published schema but used by Zed One Dark:", newerThanSchema.length, newerThanSchema.join(", "));
console.log("syntax keys:", syntaxKeys.length, "| One Dark syntax keys:", oneSyntax.size, "| One Dark keys we skip:", [...oneSyntax].filter((k) => !syntaxKeys.includes(k)).join(", ") || "none");
console.log("players:", t.style.players.length, "| accents:", t.style.accents.length);
console.log("manifest id:", id, "| version:", ver, "| package.json version:", pkgVer);
console.log(problems.length ? "PROBLEMS:\n  " + problems.join("\n  ") : "PROBLEMS: none");
process.exit(problems.length ? 1 : 0);
