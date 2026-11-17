# Brass Lasers Afterglow boot banner for PowerShell. Needs a truecolor terminal (Windows Terminal is fine).
# Add to your $PROFILE:   . /path/to/brass-lasers-afterglow.ps1
$e = [char]27
function Write-Laser($r, $g, $b, $s) { Write-Host "$e[38;2;${r};${g};${b}m$s$e[0m" }
Write-Host ""
Write-Laser 247 210 140 '  ██████╗ ██████╗  █████╗ ███████╗███████╗'
Write-Laser 242 155 178 '  ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝'
Write-Laser 242 155 178 '  ██████╔╝██████╔╝███████║███████╗███████╗'
Write-Laser 255 176 122 '  ██╔══██╗██╔══██╗██╔══██║╚════██║╚════██║'
Write-Laser 255 176 122 '  ██████╔╝██║  ██║██║  ██║███████║███████║'
Write-Laser 229 154 167 '  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝'
Write-Laser 255 122 107 '  ██╗      █████╗ ███████╗███████╗██████╗ ███████╗'
Write-Laser 255 122 107 '  ██║     ██╔══██╗██╔════╝██╔════╝██╔══██╗██╔════╝'
Write-Laser 255 158 143 '  ██║     ███████║███████╗█████╗  ██████╔╝███████╗'
Write-Laser 195 166 255 '  ██║     ██╔══██║╚════██║██╔══╝  ██╔══██╗╚════██║'
Write-Laser 143 184 255 '  ███████╗██║  ██║███████║███████╗██║  ██║███████║'
Write-Laser 143 184 255 '  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝'
Write-Laser 154 128 137 '  Afterglow · still readable at 4AM'
Write-Host ""
