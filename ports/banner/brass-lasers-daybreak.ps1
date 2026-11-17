# Brass Lasers Daybreak boot banner for PowerShell. Needs a truecolor terminal (Windows Terminal is fine).
# Add to your $PROFILE:   . /path/to/brass-lasers-daybreak.ps1
$e = [char]27
function Write-Laser($r, $g, $b, $s) { Write-Host "$e[38;2;${r};${g};${b}m$s$e[0m" }
Write-Host ""
Write-Laser 166 84 29 '  ██████╗ ██████╗  █████╗ ███████╗███████╗'
Write-Laser 138 90 0 '  ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝'
Write-Laser 138 90 0 '  ██████╔╝██████╔╝███████║███████╗███████╗'
Write-Laser 194 65 12 '  ██╔══██╗██╔══██╗██╔══██║╚════██║╚════██║'
Write-Laser 194 65 12 '  ██████╔╝██║  ██║██║  ██║███████║███████║'
Write-Laser 140 90 133 '  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝'
Write-Laser 190 50 120 '  ██╗      █████╗ ███████╗███████╗██████╗ ███████╗'
Write-Laser 190 50 120 '  ██║     ██╔══██╗██╔════╝██╔════╝██╔══██╗██╔════╝'
Write-Laser 176 48 107 '  ██║     ███████║███████╗█████╗  ██████╔╝███████╗'
Write-Laser 91 79 196 '  ██║     ██╔══██║╚════██║██╔══╝  ██╔══██╗╚════██║'
Write-Laser 37 99 168 '  ███████╗██║  ██║███████║███████╗██║  ██║███████║'
Write-Laser 37 99 168 '  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝'
Write-Laser 99 106 130 '  Daybreak · still readable at 4AM'
Write-Host ""
