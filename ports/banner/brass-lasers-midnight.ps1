# Brass Lasers Midnight boot banner for PowerShell. Needs a truecolor terminal (Windows Terminal is fine).
# Add to your $PROFILE:   . /path/to/brass-lasers-midnight.ps1
$e = [char]27
function Write-Laser($r, $g, $b, $s) { Write-Host "$e[38;2;${r};${g};${b}m$s$e[0m" }
Write-Host ""
Write-Laser 255 201 143 '  ██████╗ ██████╗  █████╗ ███████╗███████╗'
Write-Laser 245 215 110 '  ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝'
Write-Laser 245 215 110 '  ██████╔╝██████╔╝███████║███████╗███████╗'
Write-Laser 255 123 114 '  ██╔══██╗██╔══██╗██╔══██║╚════██║╚════██║'
Write-Laser 255 123 114 '  ██████╔╝██║  ██║██║  ██║███████║███████║'
Write-Laser 159 179 214 '  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝'
Write-Laser 255 159 67 '  ██╗      █████╗ ███████╗███████╗██████╗ ███████╗'
Write-Laser 255 159 67 '  ██║     ██╔══██╗██╔════╝██╔════╝██╔══██╗██╔════╝'
Write-Laser 255 184 122 '  ██║     ███████║███████╗█████╗  ██████╔╝███████╗'
Write-Laser 167 166 255 '  ██║     ██╔══██║╚════██║██╔══╝  ██╔══██╗╚════██║'
Write-Laser 108 182 255 '  ███████╗██║  ██║███████║███████╗██║  ██║███████║'
Write-Laser 108 182 255 '  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝'
Write-Laser 116 134 166 '  Midnight · still readable at 4AM'
Write-Host ""
