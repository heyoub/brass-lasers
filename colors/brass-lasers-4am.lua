-- Brass Lasers 4AM for Neovim
-- Void-purple lot lights, brass-gold hardware, hot-pink lasers. The original set.
-- Generated from palette/4am.json by scripts/build.js. Do not edit by hand.
-- https://github.com/heyoub/brass-lasers

vim.cmd("highlight clear")
if vim.fn.exists("syntax_on") == 1 then vim.cmd("syntax reset") end
vim.o.background = "dark"
vim.o.termguicolors = true
vim.g.colors_name = "brass-lasers-4am"

local c = {
  crust = "#07050c", mantle = "#0a0711", base = "#0e0a17", surface0 = "#140f21", surface1 = "#1b142e",
  line = "#171028", hover = "#1c1433", border = "#2a1f47", border2 = "#4b3a80", whitespace = "#2f2550",
  selection = "#6a2c9a", selActive = "#3a1640", lineNr = "#4b3f70",
  text = "#efe6d5", fg = "#e6dcf5", sub1 = "#b9add9", sub0 = "#9c90bd", comment = "#857ab0",
  doc = "#9488bf", ghost = "#7d71a3", dim = "#6f6494",
  brass = "#ffb627", brassLight = "#ffd27a", peach = "#ffb98a", pink = "#ff3d9a", pinkLight = "#ff7fc0",
  orchid = "#e88cc0", cyan = "#3df2e0", cyanLight = "#8ff7ec", sunset = "#ff8a3d", uv = "#b18cff",
  lavender = "#c9b8ff", red = "#ff4d6d", lime = "#b6ff5c", afterglow = "#a6e85f", blue = "#7c8cff",
  errorBg = "#3a1226", warnBg = "#3a2010", infoBg = "#0d2e38",
  onPink = "#1a0410", onBrass = "#170f02",
}
local italic = true -- set vim.g.brass_lasers_no_italics = true to disable
if vim.g.brass_lasers_no_italics then italic = false end

local hl = function(group, spec) vim.api.nvim_set_hl(0, group, spec) end
local groups = {
  -- editor chrome
  Normal = { fg = c.fg, bg = c.base }, NormalNC = { fg = c.fg, bg = c.base }, NormalFloat = { fg = c.text, bg = c.surface1 },
  FloatBorder = { fg = c.border2, bg = c.surface1 }, FloatTitle = { fg = c.brass, bg = c.surface1, bold = true },
  Cursor = { fg = c.base, bg = c.pink }, lCursor = { link = "Cursor" }, TermCursor = { link = "Cursor" },
  CursorLine = { bg = c.line }, CursorColumn = { bg = c.line }, ColorColumn = { bg = c.surface0 },
  LineNr = { fg = c.lineNr }, CursorLineNr = { fg = c.brass, bold = true }, SignColumn = { bg = c.base },
  Visual = { bg = c.selection }, VisualNOS = { link = "Visual" }, Search = { fg = c.onBrass, bg = c.brass },
  IncSearch = { fg = c.onPink, bg = c.pink }, CurSearch = { link = "IncSearch" }, Substitute = { fg = c.onPink, bg = c.pink },
  MatchParen = { fg = c.pink, bold = true, underline = true }, NonText = { fg = c.whitespace }, Whitespace = { fg = c.whitespace },
  EndOfBuffer = { fg = c.base }, VertSplit = { fg = c.border }, WinSeparator = { fg = c.border },
  StatusLine = { fg = c.sub1, bg = c.mantle }, StatusLineNC = { fg = c.ghost, bg = c.mantle },
  TabLine = { fg = c.ghost, bg = c.mantle }, TabLineFill = { bg = c.mantle }, TabLineSel = { fg = c.text, bg = c.base, bold = true },
  WinBar = { fg = c.sub0, bg = c.base }, WinBarNC = { fg = c.ghost, bg = c.base },
  Pmenu = { fg = c.text, bg = c.surface1 }, PmenuSel = { fg = c.text, bg = c.selActive, bold = true },
  PmenuSbar = { bg = c.surface0 }, PmenuThumb = { bg = c.border2 }, PmenuMatch = { fg = c.brass, bold = true },
  Folded = { fg = c.sub0, bg = c.surface0 }, FoldColumn = { fg = c.lineNr }, Conceal = { fg = c.dim },
  Directory = { fg = c.cyan }, Title = { fg = c.brass, bold = true }, Question = { fg = c.cyan }, MoreMsg = { fg = c.lime },
  ModeMsg = { fg = c.brass, bold = true }, ErrorMsg = { fg = c.red, bold = true }, WarningMsg = { fg = c.sunset },
  SpellBad = { undercurl = true, sp = c.red }, SpellCap = { undercurl = true, sp = c.sunset },
  SpellRare = { undercurl = true, sp = c.uv }, SpellLocal = { undercurl = true, sp = c.cyan },
  WildMenu = { link = "PmenuSel" }, QuickFixLine = { bg = c.selActive }, Special = { fg = c.cyan },

  -- syntax
  Comment = { fg = c.comment, italic = italic }, Constant = { fg = c.sunset }, String = { fg = c.afterglow },
  Character = { fg = c.afterglow }, Number = { fg = c.sunset }, Boolean = { fg = c.sunset }, Float = { fg = c.sunset },
  Identifier = { fg = c.fg }, Function = { fg = c.cyan }, Statement = { fg = c.pink }, Conditional = { fg = c.pink, italic = italic },
  Repeat = { fg = c.pink, italic = italic }, Label = { fg = c.sunset, italic = italic }, Operator = { fg = c.orchid },
  Keyword = { fg = c.pink }, Exception = { fg = c.pink, italic = italic }, PreProc = { fg = c.uv }, Include = { fg = c.pink },
  Define = { fg = c.pink }, Macro = { fg = c.cyanLight, bold = true }, Type = { fg = c.brass }, StorageClass = { fg = c.pink },
  Structure = { fg = c.brass }, Typedef = { fg = c.brass }, SpecialChar = { fg = c.cyan }, Tag = { fg = c.pink },
  Delimiter = { fg = c.sub0 }, SpecialComment = { fg = c.doc, italic = italic }, Debug = { fg = c.red },
  Underlined = { fg = c.cyan, underline = true }, Error = { fg = c.red }, Todo = { fg = c.onBrass, bg = c.brass, bold = true },

  -- treesitter
  ["@variable"] = { fg = c.fg }, ["@variable.builtin"] = { fg = c.pinkLight, italic = italic },
  ["@variable.parameter"] = { fg = c.brassLight, italic = italic }, ["@variable.member"] = { fg = c.lavender },
  ["@property"] = { fg = c.lavender }, ["@constant"] = { fg = c.sunset }, ["@constant.builtin"] = { fg = c.sunset },
  ["@module"] = { fg = c.uv }, ["@label"] = { fg = c.sunset, italic = italic }, ["@string"] = { fg = c.afterglow },
  ["@string.escape"] = { fg = c.cyan }, ["@string.regexp"] = { fg = c.cyan }, ["@string.special.url"] = { fg = c.cyan, underline = true },
  ["@type"] = { fg = c.brass }, ["@type.builtin"] = { fg = c.brass }, ["@type.parameter"] = { fg = c.peach, italic = italic },
  ["@attribute"] = { fg = c.uv, italic = italic }, ["@function"] = { fg = c.cyan }, ["@function.builtin"] = { fg = c.cyan },
  ["@function.macro"] = { fg = c.cyanLight, bold = true }, ["@function.method"] = { fg = c.cyan }, ["@constructor"] = { fg = c.brass },
  ["@operator"] = { fg = c.orchid }, ["@keyword"] = { fg = c.pink }, ["@keyword.return"] = { fg = c.pink, italic = italic },
  ["@keyword.conditional"] = { fg = c.pink, italic = italic }, ["@keyword.repeat"] = { fg = c.pink, italic = italic },
  ["@keyword.exception"] = { fg = c.pink, italic = italic }, ["@punctuation"] = { fg = c.sub0 },
  ["@punctuation.special"] = { fg = c.cyan }, ["@comment"] = { link = "Comment" }, ["@comment.documentation"] = { fg = c.doc, italic = italic },
  ["@tag"] = { fg = c.pink }, ["@tag.attribute"] = { fg = c.brassLight, italic = italic }, ["@tag.delimiter"] = { fg = c.sub0 },
  ["@markup.heading"] = { fg = c.brass, bold = true }, ["@markup.strong"] = { fg = c.sunset, bold = true },
  ["@markup.italic"] = { fg = c.pinkLight, italic = true }, ["@markup.raw"] = { fg = c.afterglow },
  ["@markup.link"] = { fg = c.cyan }, ["@markup.link.url"] = { fg = c.cyan, underline = true }, ["@markup.quote"] = { fg = c.uv },
  ["@markup.list"] = { fg = c.uv }, ["@diff.plus"] = { fg = c.lime }, ["@diff.minus"] = { fg = c.red }, ["@diff.delta"] = { fg = c.brass },

  -- LSP semantic tokens
  ["@lsp.type.namespace"] = { link = "@module" }, ["@lsp.type.typeParameter"] = { link = "@type.parameter" },
  ["@lsp.type.parameter"] = { link = "@variable.parameter" }, ["@lsp.type.property"] = { link = "@property" },
  ["@lsp.type.macro"] = { link = "@function.macro" }, ["@lsp.type.lifetime"] = { fg = c.sunset, italic = italic },
  ["@lsp.mod.mutable"] = { underline = true }, ["@lsp.mod.unsafe"] = { fg = c.red, bold = true },
  ["@lsp.mod.deprecated"] = { strikethrough = true }, ["@lsp.type.selfKeyword"] = { link = "@variable.builtin" },

  -- diagnostics
  DiagnosticError = { fg = c.red }, DiagnosticWarn = { fg = c.sunset }, DiagnosticInfo = { fg = c.cyan }, DiagnosticHint = { fg = c.uv },
  DiagnosticOk = { fg = c.lime }, DiagnosticVirtualTextError = { fg = c.red, bg = c.errorBg },
  DiagnosticVirtualTextWarn = { fg = c.sunset, bg = c.warnBg }, DiagnosticVirtualTextInfo = { fg = c.cyan, bg = c.infoBg },
  DiagnosticVirtualTextHint = { fg = c.uv, bg = c.surface0 }, DiagnosticUnderlineError = { undercurl = true, sp = c.red },
  DiagnosticUnderlineWarn = { undercurl = true, sp = c.sunset }, DiagnosticUnderlineInfo = { undercurl = true, sp = c.cyan },
  DiagnosticUnderlineHint = { undercurl = true, sp = c.uv }, LspInlayHint = { fg = "#8a7fb0", bg = c.surface1 },
  LspReferenceText = { bg = c.hover }, LspReferenceRead = { bg = c.hover }, LspReferenceWrite = { bg = c.selActive },

  -- diff and git
  DiffAdd = { bg = c.infoBg }, DiffChange = { bg = c.surface0 }, DiffDelete = { fg = c.red, bg = c.errorBg },
  DiffText = { bg = c.selActive }, Added = { fg = c.lime }, Changed = { fg = c.brass }, Removed = { fg = c.red },
  GitSignsAdd = { fg = c.lime }, GitSignsChange = { fg = c.brass }, GitSignsDelete = { fg = c.red },

  -- popular plugins
  TelescopeBorder = { link = "FloatBorder" }, TelescopeSelection = { link = "PmenuSel" },
  TelescopeMatching = { fg = c.brass, bold = true }, TelescopePromptPrefix = { fg = c.pink },
  NvimTreeFolderName = { fg = c.cyan }, NvimTreeRootFolder = { fg = c.brass, bold = true },
  NeoTreeRootName = { fg = c.brass, bold = true }, WhichKey = { fg = c.pink }, WhichKeyGroup = { fg = c.brass },
  WhichKeyDesc = { fg = c.text }, IndentBlanklineChar = { fg = c.whitespace }, IblIndent = { fg = c.whitespace },
  IblScope = { fg = "#5a3fa0" }, FlashLabel = { fg = c.onPink, bg = c.pink, bold = true },
}
for group, spec in pairs(groups) do hl(group, spec) end

-- terminal
local term = { "#5f5485", "#ff4d6d", "#b6ff5c", "#ffb627", "#7c8cff", "#ff3d9a", "#3df2e0", "#d9cfee",
  "#857ab0", "#ff7d95", "#d0ff94", "#ffd27a", "#a5b0ff", "#ff7fc0", "#8ff7ec", "#fff8ea" }
for i, color in ipairs(term) do vim.g["terminal_color_" .. (i - 1)] = color end
