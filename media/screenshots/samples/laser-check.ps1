# Brass Lasers 4AM: terminal color demo.
# Everything this script prints is SIMULATED sample output for screenshots.
# It does not build, test, or verify anything.
# Compatible with Windows PowerShell 5.1 and PowerShell 7+.

$e = [char]27
function C([string]$code, [string]$text) { return "$e[${code}m$text$e[0m" }

Write-Host ""
Write-Host "Brass Lasers 4AM - terminal color demo (simulated output, not real results)"
Write-Host ""

# 16-color ANSI swatches: normal row (30-37), bright row (90-97)
$names = 'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'
$normal = for ($i = 0; $i -lt 8; $i++) { C (30 + $i) $names[$i].PadRight(8) }
$bright = for ($i = 0; $i -lt 8; $i++) { C (90 + $i) $names[$i].PadRight(8) }
Write-Host ("normal  " + ($normal -join ''))
Write-Host ("bright  " + ($bright -join ''))
Write-Host ""

# Labeled demo lines: none of these are real results.
Write-Host ((C 35 '[demo]') + ' ' + (C 36 'https://github.com/heyoub/brass-lasers'))
Write-Host ((C 35 '[demo]') + ' ' + (C 32 'PASS') + ' sample suite: drop timing      ' + (C 90 '(12 ms)'))
Write-Host ((C 35 '[demo]') + ' ' + (C 32 'PASS') + ' sample suite: brass stabs      ' + (C 90 '(8 ms)'))
Write-Host ((C 35 '[demo]') + ' ' + (C 33 'WARN') + ' sample warning: fog machine at 92%')
Write-Host ((C 35 '[demo]') + ' ' + (C 31 'FAIL') + ' sample failure: friend lost the rail, needs water')
Write-Host ((C 35 '[demo]') + ' ' + (C 94 'info') + ' ' + (C 90 'end of simulated output'))
Write-Host ""
