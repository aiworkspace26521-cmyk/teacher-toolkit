param([switch]$Quiet)
# Sync frontend source files to public/ before Firebase deploy
$src = "tools/learning-kpi-dashboard/frontend"
$dst = "public"
$files = @("kpi-dashboard.html", "pokemon-gen2-9.js")
$changed = 0
foreach ($f in $files) {
  $s = Join-Path $src $f
  $d = Join-Path $dst $f
  if (-not (Test-Path $s)) { continue }
  $hashS = (Get-FileHash $s).Hash
  $hashD = if (Test-Path $d) { (Get-FileHash $d).Hash } else { "" }
  if ($hashS -ne $hashD) {
    Copy-Item -Path $s -Destination $d -Force
    if (-not $Quiet) { Write-Host "  synced $f" }
    $changed++
  } elseif (-not $Quiet) { Write-Host "  $f up-to-date" }
}
if (-not $Quiet) {
  if ($changed -eq 0) { Write-Host "All public/ files up-to-date." }
  else { Write-Host "Synced $changed file(s)." }
}
