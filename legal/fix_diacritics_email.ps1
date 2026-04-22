$f = "C:\projects\Juridic\legal\legal\docs\marketing-email.html"
$t = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)

# Word-final ? -> a  (?)
$t = $t -replace '([a-zA-Z])\?(?=[<\s,\.;:\-])', '$1a'
# Mid-word ? -> s  (s/t)
$t = $t -replace '([a-zA-Z])\?([a-zA-Z])', '$1s$2'

# Emoji ?? / ? in visible content -> ASCII labels
$t = $t.Replace(">?? LegalRO<",         ">LegalRO<")
$t = $t.Replace(">?? LegalRO</div>",    ">LegalRO</div>")
$t = $t.Replace("?? Solutia completa",  "[*] Solutia completa")
$t = $t.Replace("?? Suna familiara",    "[!] Suna familiara")
$t = $t.Replace("?? Ce include platforma", "[>] Ce include platforma")
$t = $t.Replace("?? Preturi transparente", "[*] Preturi transparente")
$t = $t -replace '(?<=width:24px">)\?(?=</td>)',  '[x]'
$t = $t -replace '(?<=font-size:22px">)\?\?(?=</div>)', '+'
$t = $t -replace '(?<=bottom:8px">)\?(?=</div>)', '"'
# Strip remaining orphan ?
$t = $t -replace '\?(?=[<\s,\.])', ''

[System.IO.File]::WriteAllText($f, $t, [System.Text.Encoding]::UTF8)
$r = [regex]::Matches($t, '.{0,12}\?.{0,12}') | Where-Object { $_.Value -notmatch 'href=|#\w|url\(|<!--' }
Write-Host "Remaining: $($r.Count)"
$r | Select-Object -First 15 | ForEach-Object { Write-Host "  [$($_.Index)] $($_.Value.Trim())" }
