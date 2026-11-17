# Brass Lasers {{meta.name}} for fzf. Source this from your shell rc.
export FZF_DEFAULT_OPTS="$FZF_DEFAULT_OPTS \
  --color=bg:{{crust}},bg+:{{selectionActive}},fg:{{textEditor}},fg+:{{text}} \
  --color=hl:{{brass}},hl+:{{brassLight}},info:{{uv}},marker:{{lime}} \
  --color=prompt:{{pink}},spinner:{{cyan}},pointer:{{pink}},header:{{cyan}} \
  --color=border:{{border1}},label:{{brass}},query:{{text}},gutter:{{crust}}"
