# Installs Wealth Engine as a Windows Scheduled Task — runs at user logon
$TaskName = "WealthEngineDaemon"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $Node) { Write-Error "Node.js not found"; exit 1 }

$Action = New-ScheduledTaskAction -Execute $Node -Argument "core\daemon.mjs" -WorkingDirectory $ProjectRoot
$Trigger = New-ScheduledTaskTrigger -AtLogOn
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Force | Out-Null
Write-Host "Scheduled task '$TaskName' installed. Starts at logon."
Write-Host "Project: $ProjectRoot"
Write-Host "Ensure .env exists with STRIPE_SECRET_KEY before first run."
