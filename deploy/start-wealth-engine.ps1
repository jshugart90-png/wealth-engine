# Starts Wealth Engine daemon + public tunnel (no admin required)
$Root = "C:\Users\jshug\wealth-engine"
$Node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $Node) { exit 1 }

Set-Location $Root

# Wealth Engine daemon (orchestrator + server)
$daemon = Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -like '*core\\daemon.mjs*' }
if (-not $daemon) {
  Start-Process -FilePath $Node -ArgumentList "core\daemon.mjs" -WorkingDirectory $Root -WindowStyle Hidden
  Start-Sleep -Seconds 2
}

# Money Machine daemon (agent pipeline + growth ramp rotation)
$mmDaemon = Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -like '*money-machine-daemon.mjs*' }
if (-not $mmDaemon) {
  Start-Process -FilePath $Node -ArgumentList "scripts\money-machine-daemon.mjs" -WorkingDirectory $Root -WindowStyle Hidden
  Start-Sleep -Seconds 2
}

# Localtunnel (public URL for Stripe webhooks)
$tunnel = Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -like '*localtunnel*8787*' }
if (-not $tunnel) {
  Start-Process -FilePath $Node -ArgumentList "@(Join-Path $env:APPDATA\npm\node_modules\localtunnel\bin\lt.js)", "--port", "8787" -WorkingDirectory $Root -WindowStyle Hidden -ErrorAction SilentlyContinue
  if ($LASTEXITCODE -ne 0) {
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c npx --yes localtunnel --port 8787 > `"$Root\data\logs\tunnel.log`" 2>&1" -WorkingDirectory $Root -WindowStyle Hidden
  }
}
