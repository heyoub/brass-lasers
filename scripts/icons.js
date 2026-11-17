// Brass Lasers Icons: a file icon theme generated from the palette.
// Dark themes get 4AM colors; light themes (Golden Hour) get Golden Hour colors.
// Returns { relativePath: content } for scripts/build.js to write and --check.

// [id, label, color role, file extensions, exact file names]
const BADGES = [
  ["ts", "TS", "cyan", ["ts", "mts", "cts"], []],
  ["tsx", "TSX", "cyan", ["tsx"], []],
  ["js", "JS", "brass", ["js", "mjs", "cjs"], []],
  ["jsx", "JSX", "brass", ["jsx"], []],
  ["json", "{}", "brassLight", ["json", "jsonc", "json5"], []],
  ["md", "MD", "lavender", ["md", "mdx", "markdown"], []],
  ["css", "CSS", "uv", ["css"], []],
  ["scss", "SC", "pinkLight", ["scss", "sass", "less"], []],
  ["html", "<>", "sunset", ["html", "htm"], []],
  ["py", "PY", "brass", ["py", "pyi", "ipynb"], []],
  ["rs", "RS", "sunset", ["rs"], []],
  ["go", "GO", "cyan", ["go"], ["go.mod", "go.sum"]],
  ["java", "JV", "red", ["java", "jar"], []],
  ["kt", "KT", "uv", ["kt", "kts"], []],
  ["swift", "SW", "sunset", ["swift"], []],
  ["c", "C", "blue", ["c", "h"], []],
  ["cpp", "C++", "blue", ["cpp", "cc", "cxx", "hpp", "hh"], []],
  ["cs", "C#", "uv", ["cs", "csx"], []],
  ["rb", "RB", "red", ["rb", "erb", "gemspec"], ["Gemfile"]],
  ["php", "PHP", "lavender", ["php"], []],
  ["lua", "LUA", "blue", ["lua"], []],
  ["zig", "ZIG", "brass", ["zig"], []],
  ["sh", "$_", "lime", ["sh", "bash", "zsh", "fish"], []],
  ["ps1", "PS", "blueLight", ["ps1", "psm1", "psd1"], []],
  ["yml", "YML", "pink", ["yml", "yaml"], []],
  ["toml", "TML", "sunset", ["toml"], []],
  ["xml", "XML", "orchid", ["xml", "plist", "xsd"], []],
  ["sql", "SQL", "cyanLight", ["sql", "prisma"], []],
  ["vue", "VUE", "lime", ["vue"], []],
  ["svelte", "SV", "sunset", ["svelte"], []],
  ["astro", "AST", "pink", ["astro"], []],
  ["txt", "TXT", "subtext0", ["txt", "log"], []],
  ["env", "ENV", "brassLight", ["env"], [".env", ".env.local", ".env.example"]],
  ["lock", "LCK", "overlay2", ["lock"], ["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lockb", "Cargo.lock"]],
  ["git", "GIT", "sunset", [], [".gitignore", ".gitattributes", ".gitmodules", ".gitkeep"]],
  ["docker", "DKR", "cyan", ["dockerfile"], ["Dockerfile", "docker-compose.yml", "compose.yaml", ".dockerignore"]],
  ["npm", "NPM", "red", [], ["package.json", ".npmrc"]],
  ["cargo", "CRG", "sunset", [], ["Cargo.toml"]],
  ["make", "MK", "brass", ["mk"], ["Makefile", "makefile", "justfile"]],
  ["license", "LIC", "brassLight", [], ["LICENSE", "LICENSE.md", "LICENSE.txt"]],
  ["readme", "i", "cyan", [], ["README.md", "README", "readme.md"]],
  ["vscode", "VSC", "blue", ["vsix", "code-workspace"], []],
];
const IMAGE_EXT = ["png", "jpg", "jpeg", "gif", "webp", "ico", "bmp", "avif"];
const FONT_EXT = ["ttf", "otf", "woff", "woff2"];

const MONO = "Cascadia Code, Consolas, Menlo, DejaVu Sans Mono, monospace";

function badge(color, label) {
  const size = label.length >= 3 ? 6.2 : label.length === 2 ? 7.6 : 9.5;
  const esc = label.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect x="1" y="1" width="14" height="14" rx="3.5" fill="${color}" fill-opacity=".16" stroke="${color}" stroke-width="1.2"/><text x="8" y="8.4" text-anchor="middle" dominant-baseline="middle" font-family="${MONO}" font-size="${size}" font-weight="700" fill="${color}">${esc}</text></svg>\n`;
}
const file = (color) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M3.5 1.5h6l3.5 3.5v9.5h-9.5z" fill="${color}" fill-opacity=".12" stroke="${color}" stroke-width="1.1" stroke-linejoin="round"/><path d="M9.5 1.5V5H13" fill="none" stroke="${color}" stroke-width="1.1" stroke-linejoin="round"/></svg>\n`;
const folder = (color, open) =>
  open
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M1.5 3.5h4.2l1.4 1.5h6.4v1.6H4.4L1.5 13z" fill="${color}" fill-opacity=".2" stroke="${color}" stroke-width="1.1" stroke-linejoin="round"/><path d="M1.5 13l2.9-6.4h11.1L12.6 13z" fill="${color}" fill-opacity=".35" stroke="${color}" stroke-width="1.1" stroke-linejoin="round"/></svg>\n`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M1.5 3.5h4.2l1.4 1.5h7.4v8H1.5z" fill="${color}" fill-opacity=".2" stroke="${color}" stroke-width="1.1" stroke-linejoin="round"/><path d="M1.5 6.5h13" stroke="${color}" stroke-width="1.1"/></svg>\n`;
const image = (color, accent) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect x="1.5" y="2.5" width="13" height="11" rx="2" fill="${color}" fill-opacity=".14" stroke="${color}" stroke-width="1.1"/><circle cx="5.5" cy="6" r="1.4" fill="${accent}"/><path d="M2 12.5l4-4 3 3 2-2 3.5 3.5" fill="none" stroke="${color}" stroke-width="1.1" stroke-linejoin="round"/></svg>\n`;
const font = (color) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect x="1" y="1" width="14" height="14" rx="3.5" fill="${color}" fill-opacity=".16" stroke="${color}" stroke-width="1.2"/><text x="8" y="8.6" text-anchor="middle" dominant-baseline="middle" font-family="Georgia, serif" font-size="10" font-weight="700" fill="${color}">Aa</text></svg>\n`;

function iconFiles(palettes) {
  const dark = palettes.find((p) => p.meta.slug === "4am").colors;
  const light = palettes.find((p) => p.meta.appearance === "light").colors;
  const out = {};
  const defs = {};
  const sets = [
    ["", dark],
    ["_light", light],
  ];
  for (const [suffix, c] of sets) {
    const dir = suffix ? "light" : "dark";
    const add = (id, svg) => {
      out[`icons/${dir}/${id}.svg`] = svg;
      defs[`${id}${suffix}`] = { iconPath: `./${dir}/${id}.svg` };
    };
    add("file", file(c.lavender));
    add("folder", folder(c.brass, false));
    add("folder-open", folder(c.pink, true));
    add("root", folder(c.pink, false));
    add("root-open", folder(c.brass, true));
    add("image", image(c.uv, c.brass));
    add("font", font(c.orchid));
    for (const [id, label, role] of BADGES) add(id, badge(c[role], label));
  }

  const map = (suffix) => {
    const s = (id) => `${id}${suffix}`;
    const fileExtensions = {}, fileNames = {};
    for (const [id, , , exts, names] of BADGES) {
      exts.forEach((e) => (fileExtensions[e] = s(id)));
      names.forEach((n) => (fileNames[n.toLowerCase()] = s(id)));
    }
    IMAGE_EXT.forEach((e) => (fileExtensions[e] = s("image")));
    fileExtensions.svg = s("xml");
    FONT_EXT.forEach((e) => (fileExtensions[e] = s("font")));
    return {
      file: s("file"),
      folder: s("folder"),
      folderExpanded: s("folder-open"),
      rootFolder: s("root"),
      rootFolderExpanded: s("root-open"),
      fileExtensions,
      fileNames,
      // VS Code matches languageIds when no extension/name rule hits
      languageIds: { typescript: s("ts"), typescriptreact: s("tsx"), javascript: s("js"), javascriptreact: s("jsx"), json: s("json"), jsonc: s("json"), markdown: s("md"), python: s("py"), rust: s("rs"), shellscript: s("sh"), powershell: s("ps1"), yaml: s("yml"), dockerfile: s("docker") },
    };
  };

  const theme = { hidesExplorerArrows: false, iconDefinitions: defs, ...map(""), light: map("_light") };
  out["icons/brass-lasers-icon-theme.json"] = JSON.stringify(theme, null, 2) + "\n";
  return out;
}

module.exports = { iconFiles };
