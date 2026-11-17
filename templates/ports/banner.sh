#!/usr/bin/env sh
# Brass Lasers {{meta.name}} boot banner. Needs a truecolor terminal.
# Add to ~/.bashrc or ~/.zshrc:   sh /path/to/brass-lasers-{{meta.slug}}.sh
c() { printf '\033[38;2;%s;%s;%sm%s\033[0m\n' "$1" "$2" "$3" "$4"; }
echo
c {{brassLight|r}} {{brassLight|g}} {{brassLight|b}} '  ██████╗ ██████╗  █████╗ ███████╗███████╗'
c {{brass|r}} {{brass|g}} {{brass|b}} '  ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝'
c {{brass|r}} {{brass|g}} {{brass|b}} '  ██████╔╝██████╔╝███████║███████╗███████╗'
c {{sunset|r}} {{sunset|g}} {{sunset|b}} '  ██╔══██╗██╔══██╗██╔══██║╚════██║╚════██║'
c {{sunset|r}} {{sunset|g}} {{sunset|b}} '  ██████╔╝██║  ██║██║  ██║███████║███████║'
c {{orchid|r}} {{orchid|g}} {{orchid|b}} '  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝'
c {{pink|r}} {{pink|g}} {{pink|b}} '  ██╗      █████╗ ███████╗███████╗██████╗ ███████╗'
c {{pink|r}} {{pink|g}} {{pink|b}} '  ██║     ██╔══██╗██╔════╝██╔════╝██╔══██╗██╔════╝'
c {{pinkLight|r}} {{pinkLight|g}} {{pinkLight|b}} '  ██║     ███████║███████╗█████╗  ██████╔╝███████╗'
c {{uv|r}} {{uv|g}} {{uv|b}} '  ██║     ██╔══██║╚════██║██╔══╝  ██╔══██╗╚════██║'
c {{cyan|r}} {{cyan|g}} {{cyan|b}} '  ███████╗██║  ██║███████║███████╗██║  ██║███████║'
c {{cyan|r}} {{cyan|g}} {{cyan|b}} '  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝'
c {{comment|r}} {{comment|g}} {{comment|b}} '  {{meta.name}} · still readable at 4AM'
echo
