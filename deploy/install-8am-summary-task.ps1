# Installs 8 AM daily summary refresh task
$TaskName = "WealthEngine8AMSummary"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $Node) { Write-Error "Node.js not found"; exit 1 }

$Action = New-ScheduledTaskAction -Execute $Node -Argument "scripts\write-overnight-summary.mjs" -WorkingDirectory $ProjectRoot
$Trigger = New-ScheduledTaskTrigger -Daily -At "8:00AM"
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Force | Out-Null
Write-Host "Scheduled task '$TaskName' installed - runs daily at 8:00 AM local time."
Write-Host "Summary writes to D:\wealth-engine-data\reports\ and board\OVERNIGHT_SUMMARY.md"
Write-Host "If your PC timezone is not US Central, adjust the -At time in this script."
