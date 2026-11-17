# Brass Lasers Golden Hour boot banner for PowerShell. Needs a truecolor terminal (Windows Terminal is fine).
# Add to your $PROFILE:   . /path/to/brass-lasers-golden-hour.ps1
$e = [char]27
function Write-Laser($r, $g, $b, $s) { Write-Host "$e[38;2;${r};${g};${b}m$s$e[0m" }
Write-Host ""
Write-Laser 135 102 5 '  ██████╗ ██████╗  █████╗ ███████╗███████╗'
Write-Laser 131 90 3 '  ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝'
Write-Laser 131 90 3 '  ██████╔╝██████╔╝███████║███████╗███████╗'
Write-Laser 155 72 1 '  ██╔══██╗██╔══██╗██╔══██║╚════██║╚════██║'
Write-Laser 155 72 1 '  ██████╔╝██║  ██║██║  ██║███████║███████║'
Write-Laser 168 82 133 '  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝'
Write-Laser 178 9 101 '  ██╗      █████╗ ███████╗███████╗██████╗ ███████╗'
Write-Laser 178 9 101 '  ██║     ██╔══██╗██╔════╝██╔════╝██╔══██╗██╔════╝'
Write-Laser 183 61 129 '  ██║     ███████║███████╗█████╗  ██████╔╝███████╗'
Write-Laser 111 71 180 '  ██║     ██╔══██║╚════██║██╔══╝  ██╔══██╗╚════██║'
Write-Laser 1 115 106 '  ███████╗██║  ██║███████║███████╗██║  ██║███████║'
Write-Laser 1 115 106 '  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝'
Write-Laser 111 101 145 '  Golden Hour · still readable at 4AM'
Write-Host ""
