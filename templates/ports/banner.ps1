# Brass Lasers {{meta.name}} boot banner for PowerShell. Needs a truecolor terminal (Windows Terminal is fine).
# Add to your $PROFILE:   . /path/to/brass-lasers-{{meta.slug}}.ps1
$e = [char]27
function Write-Laser($r, $g, $b, $s) { Write-Host "$e[38;2;${r};${g};${b}m$s$e[0m" }
Write-Host ""
Write-Laser {{brassLight|r}} {{brassLight|g}} {{brassLight|b}} '  ██████╗ ██████╗  █████╗ ███████╗███████╗'
Write-Laser {{brass|r}} {{brass|g}} {{brass|b}} '  ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝'
Write-Laser {{brass|r}} {{brass|g}} {{brass|b}} '  ██████╔╝██████╔╝███████║███████╗███████╗'
Write-Laser {{sunset|r}} {{sunset|g}} {{sunset|b}} '  ██╔══██╗██╔══██╗██╔══██║╚════██║╚════██║'
Write-Laser {{sunset|r}} {{sunset|g}} {{sunset|b}} '  ██████╔╝██║  ██║██║  ██║███████║███████║'
Write-Laser {{orchid|r}} {{orchid|g}} {{orchid|b}} '  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝'
Write-Laser {{pink|r}} {{pink|g}} {{pink|b}} '  ██╗      █████╗ ███████╗███████╗██████╗ ███████╗'
Write-Laser {{pink|r}} {{pink|g}} {{pink|b}} '  ██║     ██╔══██╗██╔════╝██╔════╝██╔══██╗██╔════╝'
Write-Laser {{pinkLight|r}} {{pinkLight|g}} {{pinkLight|b}} '  ██║     ███████║███████╗█████╗  ██████╔╝███████╗'
Write-Laser {{uv|r}} {{uv|g}} {{uv|b}} '  ██║     ██╔══██║╚════██║██╔══╝  ██╔══██╗╚════██║'
Write-Laser {{cyan|r}} {{cyan|g}} {{cyan|b}} '  ███████╗██║  ██║███████║███████╗██║  ██║███████║'
Write-Laser {{cyan|r}} {{cyan|g}} {{cyan|b}} '  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝'
Write-Laser {{comment|r}} {{comment|g}} {{comment|b}} '  {{meta.name}} · still readable at 4AM'
Write-Host ""
