# Brass Lasers Soundcheck boot banner for PowerShell. Needs a truecolor terminal (Windows Terminal is fine).
# Add to your $PROFILE:   . /path/to/brass-lasers-soundcheck.ps1
$e = [char]27
function Write-Laser($r, $g, $b, $s) { Write-Host "$e[38;2;${r};${g};${b}m$s$e[0m" }
Write-Host ""
Write-Laser 242 190 137 '  ██████╗ ██████╗  █████╗ ███████╗███████╗'
Write-Laser 240 194 95 '  ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝'
Write-Laser 240 194 95 '  ██████╔╝██████╔╝███████║███████╗███████╗'
Write-Laser 236 154 94 '  ██╔══██╗██╔══██╗██╔══██║╚════██║╚════██║'
Write-Laser 236 154 94 '  ██████╔╝██║  ██║██║  ██║███████║███████║'
Write-Laser 161 161 168 '  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝'
Write-Laser 229 128 179 '  ██╗      █████╗ ███████╗███████╗██████╗ ███████╗'
Write-Laser 229 128 179 '  ██║     ██╔══██╗██╔════╝██╔════╝██╔══██╗██╔════╝'
Write-Laser 239 175 209 '  ██║     ███████║███████╗█████╗  ██████╔╝███████╗'
Write-Laser 165 145 231 '  ██║     ██╔══██║╚════██║██╔══╝  ██╔══██╗╚════██║'
Write-Laser 96 207 227 '  ███████╗██║  ██║███████║███████╗██║  ██║███████║'
Write-Laser 96 207 227 '  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝'
Write-Laser 128 128 137 '  Soundcheck · still readable at 4AM'
Write-Host ""
