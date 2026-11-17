# Brass Lasers Atrium 5AM boot banner for PowerShell. Needs a truecolor terminal (Windows Terminal is fine).
# Add to your $PROFILE:   . /path/to/brass-lasers-atrium.ps1
$e = [char]27
function Write-Laser($r, $g, $b, $s) { Write-Host "$e[38;2;${r};${g};${b}m$s$e[0m" }
Write-Host ""
Write-Laser 209 142 153 '  ██████╗ ██████╗  █████╗ ███████╗███████╗'
Write-Laser 231 173 112 '  ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝'
Write-Laser 231 173 112 '  ██████╔╝██████╔╝███████║███████╗███████╗'
Write-Laser 227 151 122 '  ██╔══██╗██╔══██╗██╔══██║╚════██║╚════██║'
Write-Laser 227 151 122 '  ██████╔╝██║  ██║██║  ██║███████║███████║'
Write-Laser 143 183 177 '  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝'
Write-Laser 121 201 195 '  ██╗      █████╗ ███████╗███████╗██████╗ ███████╗'
Write-Laser 121 201 195 '  ██║     ██╔══██╗██╔════╝██╔════╝██╔══██╗██╔════╝'
Write-Laser 219 169 179 '  ██║     ███████║███████╗█████╗  ██████╔╝███████╗'
Write-Laser 157 184 214 '  ██║     ██╔══██║╚════██║██╔══╝  ██╔══██╗╚════██║'
Write-Laser 196 162 216 '  ███████╗██║  ██║███████║███████╗██║  ██║███████║'
Write-Laser 196 162 216 '  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝'
Write-Laser 126 143 136 '  Atrium 5AM · still readable at 4AM'
Write-Host ""
