# Brass Lasers Strobe boot banner for PowerShell. Needs a truecolor terminal (Windows Terminal is fine).
# Add to your $PROFILE:   . /path/to/brass-lasers-strobe.ps1
$e = [char]27
function Write-Laser($r, $g, $b, $s) { Write-Host "$e[38;2;${r};${g};${b}m$s$e[0m" }
Write-Host ""
Write-Laser 255 228 179 '  ██████╗ ██████╗  █████╗ ███████╗███████╗'
Write-Laser 255 213 149 '  ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝'
Write-Laser 255 213 149 '  ██████╔╝██████╔╝███████║███████╗███████╗'
Write-Laser 254 175 129 '  ██╔══██╗██╔══██╗██╔══██║╚════██║╚════██║'
Write-Laser 254 175 129 '  ██████╔╝██║  ██║██║  ██║███████║███████║'
Write-Laser 255 163 214 '  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝'
Write-Laser 254 122 175 '  ██╗      █████╗ ███████╗███████╗██████╗ ███████╗'
Write-Laser 254 122 175 '  ██║     ██╔══██╗██╔════╝██╔════╝██╔══██╗██╔════╝'
Write-Laser 255 169 209 '  ██║     ███████║███████╗█████╗  ██████╔╝███████╗'
Write-Laser 195 171 255 '  ██║     ██╔══██║╚════██║██╔══╝  ██╔══██╗╚════██║'
Write-Laser 146 255 241 '  ███████╗██║  ██║███████║███████╗██║  ██║███████║'
Write-Laser 146 255 241 '  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝'
Write-Laser 163 152 208 '  Strobe · still readable at 4AM'
Write-Host ""
