# Brass Lasers Afterglow boot banner for PowerShell. Needs a truecolor terminal (Windows Terminal is fine).
# Add to your $PROFILE:   . /path/to/brass-lasers-afterglow.ps1
$e = [char]27
function Write-Laser($r, $g, $b, $s) { Write-Host "$e[38;2;${r};${g};${b}m$s$e[0m" }
Write-Host ""
Write-Laser 231 205 156 '  ██████╗ ██████╗  █████╗ ███████╗███████╗'
Write-Laser 229 186 120 '  ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝'
Write-Laser 229 186 120 '  ██████╔╝██████╔╝███████║███████╗███████╗'
Write-Laser 228 158 117 '  ██╔══██╗██╔══██╗██╔══██║╚════██║╚════██║'
Write-Laser 228 158 117 '  ██████╔╝██║  ██║██║  ██║███████║███████║'
Write-Laser 213 157 187 '  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝'
Write-Laser 228 118 161 '  ██╗      █████╗ ███████╗███████╗██████╗ ███████╗'
Write-Laser 228 118 161 '  ██║     ██╔══██╗██╔════╝██╔════╝██╔══██╗██╔════╝'
Write-Laser 229 152 188 '  ██║     ███████║███████╗█████╗  ██████╔╝███████╗'
Write-Laser 176 157 225 '  ██║     ██╔══██║╚════██║██╔══╝  ██╔══██╗╚════██║'
Write-Laser 138 223 212 '  ███████╗██║  ██║███████║███████╗██║  ██║███████║'
Write-Laser 138 223 212 '  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝'
Write-Laser 127 118 169 '  Afterglow · still readable at 4AM'
Write-Host ""
