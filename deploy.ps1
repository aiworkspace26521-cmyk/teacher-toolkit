param(
  [switch]$Functions,
  [switch]$Hosting,
  [switch]$Firestore,
  [switch]$All,
  [switch]$Quiet
)
# Deploy script: sync frontend → public, then deploy to Firebase
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

# Step 1: Sync frontend to public
if (-not $Quiet) { Write-Host "=== Syncing frontend → public ===" }
& "$root\sync-public.ps1" -Quiet:$Quiet

# Step 2: Build deploy targets
$targets = @()
if ($Functions -or $All) { $targets += "functions" }
if ($Hosting -or $All)   { $targets += "hosting" }
if ($Firestore -or $All) { $targets += "firestore" }
if ($targets.Count -eq 0) { $targets = @("hosting", "firestore") }

$targetStr = $targets -join ","
if (-not $Quiet) { Write-Host "=== Deploying: $targetStr ===" }

# Step 3: Deploy
$cmd = "firebase deploy --only $targetStr"
if ($Quiet) { $cmd += " --json" }
powershell -ExecutionPolicy Bypass -Command $cmd
if ($LASTEXITCODE -ne 0) { Write-Host "Deploy failed!" -ForegroundColor Red; exit 1 }
if (-not $Quiet) { Write-Host "=== Deploy done ===" -ForegroundColor Green }
