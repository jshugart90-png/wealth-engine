# Marketing Director Loop — runs until 08:00 US Central
# Usage: powershell -File deploy/marketing-director-loop.ps1

$ErrorActionPreference = "Continue"
$RepoRoot = "C:\Users\jshug\wealth-engine"
$DataRoot = "D:\wealth-engine-data\marketing"
$Deadline = [DateTime]::Parse("2026-06-21 08:00:00")
$IntervalMinutes = 45

Set-Location $RepoRoot

function Get-CycleNumber {
    $statePath = Join-Path $DataRoot "director-state.json"
    if (Test-Path $statePath) {
        $s = Get-Content $statePath -Raw | ConvertFrom-Json
        return [int]$s.cycles + 1
    }
    return 1
}

function Run-Cycle {
    param([int]$Cycle)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Marketing Director cycle $Cycle"
    node core/marketing/director-cycle.mjs --cycle=$Cycle 2>&1 | Write-Host
    $logLine = "$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss') cycle=$Cycle status=ok"
    Add-Content -Path (Join-Path $DataRoot "director-loop.log") -Value $logLine
}

$cycle = Get-CycleNumber
Run-Cycle -Cycle $cycle

while ((Get-Date) -lt $Deadline) {
    $remaining = ($Deadline - (Get-Date)).TotalMinutes
    if ($remaining -le 0) { break }
    $sleepMin = [Math]::Min($IntervalMinutes, [Math]::Max(1, [int]$remaining))
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Sleeping ${sleepMin}m ($([int]$remaining)m until 08:00 CT)"
    Start-Sleep -Seconds ($sleepMin * 60)
    if ((Get-Date) -ge $Deadline) { break }
    $cycle = Get-CycleNumber
    Run-Cycle -Cycle $cycle
    $tick = "AGENT_LOOP_TICK_MARKETING_DIRECTOR cycle=$cycle"
    Write-Host $tick
}

Write-Host "AGENT_LOOP_TICK_MARKETING_DIRECTOR final=true"
Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Marketing Director loop complete at 08:00 CT"
