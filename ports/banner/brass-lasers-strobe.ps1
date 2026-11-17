# Brass Lasers Strobe boot banner for PowerShell. Needs a truecolor terminal (Windows Terminal is fine).
# Add to your $PROFILE:   . /path/to/brass-lasers-strobe.ps1
$e = [char]27
function Write-Laser($r, $g, $b, $s) { Write-Host "$e[38;2;${r};${g};${b}m$s$e[0m" }
Write-Host ""
Write-Laser 255 211 138 '  ██████╗ ██████╗  █████╗ ███████╗███████╗'
Write-Laser 255 226 77 '  ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝'
Write-Laser 255 226 77 '  ██████╔╝██████╔╝███████║███████╗███████╗'
Write-Laser 255 162 77 '  ██╔══██╗██╔══██╗██╔══██║╚════██║╚════██║'
Write-Laser 255 162 77 '  ██████╔╝██║  ██║██║  ██║███████║███████║'
Write-Laser 255 154 214 '  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝'
Write-Laser 255 95 220 '  ██╗      █████╗ ███████╗███████╗██████╗ ███████╗'
Write-Laser 255 95 220 '  ██║     ██╔══██╗██╔════╝██╔════╝██╔══██╗██╔════╝'
Write-Laser 255 141 226 '  ██║     ███████║███████╗█████╗  ██████╔╝███████╗'
Write-Laser 194 168 255 '  ██║     ██╔══██║╚════██║██╔══╝  ██╔══██╗╚════██║'
Write-Laser 46 232 255 '  ███████╗██║  ██║███████║███████╗██║  ██║███████║'
Write-Laser 46 232 255 '  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝'
Write-Laser 185 180 207 '  Strobe · still readable at 4AM'
Write-Host ""
