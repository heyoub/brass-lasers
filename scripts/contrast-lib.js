// Shared contrast math and the list of pairs every palette must pass.
// Thresholds: 4.5 = WCAG AA body text. 3.0 = WCAG AA large text / UI components.
// A few roles are deliberately dim (ghost text, line numbers, ANSI black) and get
// their own documented floor instead of being skipped.

const lin = (c) => {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

// [foreground, background, minimum, what it is]
const SYNTAX = ["pink", "afterglow", "cyan", "sunset", "brass", "brassLight", "peach", "uv", "lavender", "orchid", "pinkLight", "cyanLight", "red", "textEditor", "comment", "docComment", "subtext0"];
const PAIRS = [
  ...SYNTAX.map((c) => [c, "base", 4.5, "syntax on editor"]),
  ["text", "mantle", 4.5, "UI text on chrome"],
  ["textSidebar", "mantle", 4.5, "sidebar text"],
  ["subtext1", "mantle", 4.5, "status bar text"],
  ["subtext0", "surface1", 4.5, "descriptions in widgets"],
  ["text", "selectionActive", 4.5, "selected list row"],
  ["textEditor", "lineHighlight", 4.5, "text on current line"],
  ["brass", "mantle", 4.5, "active titles / activity bar"],
  ["overlay2", "mantle", 4.5, "inactive tabs and icons"],
  ["overlay1", "surface0", 3.0, "input placeholders"],
  ["inlayHint", "surface1", 3.0, "inlay hints"],
  ["overlay2", "base", 4.0, "ghost text (deliberately dimmer than comments)"],
  ["lineNumber", "base", 1.8, "inactive line numbers (decorative)"],
  ["brass", "base", 3.0, "active line number"],
  ["onBrass", "brass", 4.5, "button text"],
  ["onPink", "pink", 4.5, "badge text"],
  ["onSunset", "sunset", 4.5, "debug status bar text"],
  ["onRed", "red", 4.5, "error status item"],
  ["pink", "base", 3.0, "cursor and focus ring"],
  ...["lime", "red", "brass", "blue", "pink", "cyan", "comment", "redLight", "limeLight", "brassLight", "blueLight", "pinkLight", "cyanLight"].map((c) => [c, "crust", 4.5, "terminal ANSI"]),
  // On a dark terminal "white" is text. On a light terminal it's a pale fill, so it is
  // checked against ANSI black instead (white-on-black blocks must read either way).
  ["ansiWhite", "crust", 4.5, "terminal ANSI white", "dark"],
  ["brightWhite", "crust", 4.5, "terminal ANSI bright white", "dark"],
  ["ansiBlack", "crust", 2.5, "ANSI black (must stay visible)"],
  ["ansiWhite", "ansiBlack", 4.5, "white-on-black ANSI blocks"],
];
// Syntax pairs get raised to meta.contrastFloor when a palette sets one (Strobe = 7, AAA).
const floorFor = (meta, what, min) => (what === "syntax on editor" && meta.contrastFloor ? Math.max(min, meta.contrastFloor) : min);

module.exports = { ratio, PAIRS, floorFor };
