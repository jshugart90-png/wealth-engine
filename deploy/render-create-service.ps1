# Creates Render web service for wealth-engine (requires GitHub repo first)
param(
  [string]$RepoUrl = "https://github.com/jshugart90-png/wealth-engine",
  [string]$RenderApiKey = (Get-Content "$env:USERPROFILE\.render\cli.yaml" | Select-String 'key: (.+)' | ForEach-Object { $_.Matches.Groups[1].Value })
)

$ownerId = (Get-Content "$env:USERPROFILE\.render\cli.yaml" | Select-String 'workspace: (.+)' | ForEach-Object { $_.Matches.Groups[1].Value })
$envFile = Join-Path $PSScriptRoot "..\.env"
$envVars = @{}
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^([^#=]+)=(.+)$') { $envVars[$matches[1].Trim()] = $matches[2].Trim() }
  }
}

$body = @{
  type = "web_service"
  name = "wealth-engine"
  ownerId = $ownerId
  repo = $RepoUrl
  branch = "main"
  serviceDetails = @{
    env = "node"
    region = "oregon"
    plan = "free"
    buildCommand = "npm install && npm run build"
    startCommand = "npm run run:daemon"
    healthCheckPath = "/api/health"
    envVars = @(
      @{ key = "NODE_VERSION"; value = "20" },
      @{ key = "RUN_INTERVAL_MINUTES"; value = "360" },
      @{ key = "STRIPE_SECRET_KEY"; value = $envVars["STRIPE_SECRET_KEY"] },
      @{ key = "STRIPE_WEBHOOK_SECRET"; value = $envVars["STRIPE_WEBHOOK_SECRET"] },
      @{ key = "RESEND_API_KEY"; value = $envVars["RESEND_API_KEY"] },
      @{ key = "FROM_EMAIL"; value = $envVars["FROM_EMAIL"] },
      @{ key = "AUTO_STRIPE_SYNC"; value = "true" },
      @{ key = "AUTO_BUILD"; value = "true" }
    )
  }
} | ConvertTo-Json -Depth 6

$headers = @{ Authorization = "Bearer $RenderApiKey"; "Content-Type" = "application/json" }
try {
  $r = Invoke-RestMethod -Method Post -Uri "https://api.render.com/v1/services" -Headers $headers -Body $body
  Write-Host "Created Render service: $($r.service.name)"
  Write-Host "URL: $($r.service.serviceDetails.url)"
} catch {
  Write-Host "Render create failed (repo may need to exist first): $($_.Exception.Message)"
}
