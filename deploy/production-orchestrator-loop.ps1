# Production Orchestrator Loop — runs until 08:00 US Central
# Usage: powershell -File deploy/production-orchestrator-loop.ps1

$ErrorActionPreference = "Continue"
$RepoRoot = "C:\Users\jshug\wealth-engine"
$DataRoot = "D:\wealth-engine-data\logs"
$Deadline = [DateTime]::Parse("2026-06-21 08:00:00")
$IntervalMinutes = 18

Set-Location $RepoRoot
New-Item -ItemType Directory -Force -Path $DataRoot | Out-Null
$LogPath = Join-Path $DataRoot "production-orchestrator.log"

function Write-Log($msg) {
    $line = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $msg"
    Add-Content -Path $LogPath -Value $line
    Write-Host $line
}

Write-Log "Production Orchestrator loop starting — deadline 08:00 CT"

while ((Get-Date) -lt $Deadline) {
    Write-Log "── Cycle start ──"
    node scripts/production-orchestrator.mjs --once 2>&1 | ForEach-Object { Write-Log $_ }
    Write-Log "── Cycle end ──"

    $remaining = ($Deadline - (Get-Date)).TotalMinutes
    if ($remaining -le 0) { break }

    $sleepMin = [Math]::Min($IntervalMinutes, [Math]::Max(1, [int]$remaining))
    Write-Log ("Sleeping {0}m ({1} min until 08:00 CT)" -f $sleepMin, [int]$remaining)
    Start-Sleep -Seconds ($sleepMin * 60)
}

Write-Log "Running 8 AM deliverables"
node scripts/production-orchestrator.mjs --final-report 2>&1 | ForEach-Object { Write-Log $_ }
Write-Log "Production Orchestrator loop complete"
