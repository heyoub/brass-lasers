# Brass Lasers Liquid Metal boot banner for PowerShell. Needs a truecolor terminal (Windows Terminal is fine).
# Add to your $PROFILE:   . /path/to/brass-lasers-liquid-metal.ps1
$e = [char]27
function Write-Laser($r, $g, $b, $s) { Write-Host "$e[38;2;${r};${g};${b}m$s$e[0m" }
Write-Host ""
Write-Laser 103 232 249 '  ██████╗ ██████╗  █████╗ ███████╗███████╗'
Write-Laser 234 179 8 '  ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝'
Write-Laser 234 179 8 '  ██████╔╝██████╔╝███████║███████╗███████╗'
Write-Laser 255 107 107 '  ██╔══██╗██╔══██╗██╔══██║╚════██║╚════██║'
Write-Laser 255 107 107 '  ██████╔╝██║  ██║██║  ██║███████║███████║'
Write-Laser 161 161 170 '  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝'
Write-Laser 167 139 250 '  ██╗      █████╗ ███████╗███████╗██████╗ ███████╗'
Write-Laser 167 139 250 '  ██║     ██╔══██╗██╔════╝██╔════╝██╔══██╗██╔════╝'
Write-Laser 196 181 253 '  ██║     ███████║███████╗█████╗  ██████╔╝███████╗'
Write-Laser 140 94 248 '  ██║     ██╔══██║╚════██║██╔══╝  ██╔══██╗╚════██║'
Write-Laser 34 211 238 '  ███████╗██║  ██║███████║███████╗██║  ██║███████║'
Write-Laser 34 211 238 '  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝'
Write-Laser 124 124 133 '  Liquid Metal · still readable at 4AM'
Write-Host ""
