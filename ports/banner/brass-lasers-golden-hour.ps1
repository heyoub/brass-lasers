# Brass Lasers Golden Hour boot banner for PowerShell. Needs a truecolor terminal (Windows Terminal is fine).
# Add to your $PROFILE:   . /path/to/brass-lasers-golden-hour.ps1
$e = [char]27
function Write-Laser($r, $g, $b, $s) { Write-Host "$e[38;2;${r};${g};${b}m$s$e[0m" }
Write-Host ""
Write-Laser 168 80 42 '  ██████╗ ██████╗  █████╗ ███████╗███████╗'
Write-Laser 157 89 1 '  ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝'
Write-Laser 157 89 1 '  ██████╔╝██████╔╝███████║███████╗███████╗'
Write-Laser 186 76 13 '  ██╔══██╗██╔══██╗██╔══██║╚════██║╚════██║'
Write-Laser 186 76 13 '  ██████╔╝██║  ██║██║  ██║███████║███████║'
Write-Laser 153 87 122 '  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝'
Write-Laser 192 46 109 '  ██╗      █████╗ ███████╗███████╗██████╗ ███████╗'
Write-Laser 192 46 109 '  ██║     ██╔══██╗██╔════╝██╔════╝██╔══██╗██╔════╝'
Write-Laser 184 56 95 '  ██║     ███████║███████╗█████╗  ██████╔╝███████╗'
Write-Laser 100 85 184 '  ██║     ██╔══██║╚════██║██╔══╝  ██╔══██╗╚════██║'
Write-Laser 0 117 122 '  ███████╗██║  ██║███████║███████╗██║  ██║███████║'
Write-Laser 0 117 122 '  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝'
Write-Laser 107 107 85 '  Golden Hour · still readable at 4AM'
Write-Host ""
