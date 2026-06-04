param(
  [switch]$Functions,
  [switch]$Hosting,
  [switch]$Firestore,
  [switch]$All,
  [switch]$Quiet,
  [switch]$SkipLint,
  [switch]$SkipSimTest,
  [switch]$SkipSync
)
# Deploy script: lint → simulation test → sync frontend → Firebase deploy
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

# Step 0: Encoding check
if (-not $Quiet) { Write-Host "=== Encoding check ===" -ForegroundColor Cyan }
node tools/scripts/encoding-check.js
if ($LASTEXITCODE -ne 0) { Write-Host "Encoding check failed! Aborting." -ForegroundColor Red; exit 1 }
if (-not $Quiet) { Write-Host "Encoding check passed" -ForegroundColor Green }

# Step 1: Lint
if (-not $SkipLint) {
  if (-not $Quiet) { Write-Host "=== Linting ===" -ForegroundColor Cyan }
  npm run lint
  if ($LASTEXITCODE -ne 0) { Write-Host "Lint failed! Aborting." -ForegroundColor Red; exit 1 }
  if (-not $Quiet) { Write-Host "Lint passed" -ForegroundColor Green }
}

# Step 2: Simulation test
if (-not $SkipSimTest) {
  if (-not $Quiet) { Write-Host "=== Running simulation test ===" -ForegroundColor Cyan }
  npm test
  if ($LASTEXITCODE -ne 0) { Write-Host "Simulation test failed! Aborting." -ForegroundColor Red; exit 1 }
  if (-not $Quiet) { Write-Host "Simulation test passed" -ForegroundColor Green }
}

# Step 3: Sync frontend → public
if (-not $SkipSync) {
  if (-not $Quiet) { Write-Host "=== Syncing frontend → public ===" -ForegroundColor Cyan }
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
}

# Step 4: Build deploy targets
$targets = @()
if ($Functions -or $All) { $targets += "functions" }
if ($Hosting -or $All)   { $targets += "hosting" }
if ($Firestore -or $All) { $targets += "firestore" }
if ($targets.Count -eq 0) { $targets = @("hosting", "firestore") }

$targetStr = $targets -join ","
if (-not $Quiet) { Write-Host "=== Deploying: $targetStr ===" -ForegroundColor Cyan }

# Step 5: Deploy
$cmd = "firebase deploy --only $targetStr"
if ($Quiet) { $cmd += " --json" }
powershell -ExecutionPolicy Bypass -Command $cmd
if ($LASTEXITCODE -ne 0) { Write-Host "Deploy failed!" -ForegroundColor Red; exit 1 }
if (-not $Quiet) { Write-Host "=== Deploy done ===" -ForegroundColor Green }
