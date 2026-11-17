# Brass Lasers 4AM boot banner for PowerShell. Needs a truecolor terminal (Windows Terminal is fine).
# Add to your $PROFILE:   . /path/to/brass-lasers-4am.ps1
$e = [char]27
function Write-Laser($r, $g, $b, $s) { Write-Host "$e[38;2;${r};${g};${b}m$s$e[0m" }
Write-Host ""
Write-Laser 255 210 122 '  ██████╗ ██████╗  █████╗ ███████╗███████╗'
Write-Laser 255 182 39 '  ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝'
Write-Laser 255 182 39 '  ██████╔╝██████╔╝███████║███████╗███████╗'
Write-Laser 255 138 61 '  ██╔══██╗██╔══██╗██╔══██║╚════██║╚════██║'
Write-Laser 255 138 61 '  ██████╔╝██║  ██║██║  ██║███████║███████║'
Write-Laser 232 140 192 '  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝'
Write-Laser 255 61 154 '  ██╗      █████╗ ███████╗███████╗██████╗ ███████╗'
Write-Laser 255 61 154 '  ██║     ██╔══██╗██╔════╝██╔════╝██╔══██╗██╔════╝'
Write-Laser 255 127 192 '  ██║     ███████║███████╗█████╗  ██████╔╝███████╗'
Write-Laser 177 140 255 '  ██║     ██╔══██║╚════██║██╔══╝  ██╔══██╗╚════██║'
Write-Laser 61 242 224 '  ███████╗██║  ██║███████║███████╗██║  ██║███████║'
Write-Laser 61 242 224 '  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝'
Write-Laser 133 122 176 '  4AM · still readable at 4AM'
Write-Host ""
