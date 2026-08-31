# ============================================================
# AgriSensa n8n AI Engine — Setup Script (PowerShell)
# ============================================================
# Run: .\setup_n8n_engine.ps1
# ============================================================

param(
    [switch]$SkipDocker,
    [switch]$ImportWorkflows,
    [switch]$TestWorkflows,
    [string]$N8NUrl = "http://localhost:5678",
    [string]$N8NUser = "agrisensa",
    [string]$N8NPassword = "agrisensa2026"
)

$ErrorActionPreference = "Continue"
$AgriSensaColor = "Green"

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor $AgriSensaColor
    Write-Host "  $Title" -ForegroundColor $AgriSensaColor
    Write-Host "=" * 60 -ForegroundColor $AgriSensaColor
}

function Write-Step {
    param([string]$Step, [string]$Status = "INFO")
    $color = switch($Status) {
        "OK"    { "Green" }
        "WARN"  { "Yellow" }
        "ERROR" { "Red" }
        default { "Cyan" }
    }
    Write-Host "  [$Status] $Step" -ForegroundColor $color
}

# ============================================================
# HEADER
# ============================================================
Write-Host ""
Write-Host "  ╔══════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║   🌾 AgriSensa n8n AI Engine Setup           ║" -ForegroundColor Green
Write-Host "  ║   Version 2.0 — Workflow Orchestrator        ║" -ForegroundColor Green
Write-Host "  ╚══════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir

# ============================================================
# STEP 1: Check prerequisites
# ============================================================
Write-Header "Step 1: Checking Prerequisites"

# Check Docker
if (-not $SkipDocker) {
    try {
        $dockerVersion = docker --version 2>&1
        Write-Step "Docker: $dockerVersion" "OK"
    } catch {
        Write-Step "Docker not found! Install Docker Desktop first." "ERROR"
        Write-Host "  Download: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        exit 1
    }

    # Check Docker Compose
    try {
        $composeVersion = docker compose version 2>&1
        Write-Step "Docker Compose: $composeVersion" "OK"
    } catch {
        Write-Step "Docker Compose not found!" "ERROR"
        exit 1
    }
}

# Check if .env.n8n exists
if (-not (Test-Path ".env.n8n")) {
    if (Test-Path ".env.n8n.example") {
        Write-Step "Creating .env.n8n from template..." "WARN"
        Copy-Item ".env.n8n.example" ".env.n8n"
        Write-Step ".env.n8n created. EDIT IT with your API keys before proceeding!" "WARN"
        Write-Host ""
        Write-Host "  ⚠️  Please edit .env.n8n with your credentials:" -ForegroundColor Yellow
        Write-Host "     - GEMINI_API_KEY" -ForegroundColor Yellow
        Write-Host "     - ROBOFLOW_API_KEY" -ForegroundColor Yellow
        Write-Host "     - OPENWEATHER_API_KEY" -ForegroundColor Yellow
        Write-Host "     - TELEGRAM_BOT_TOKEN" -ForegroundColor Yellow
        Write-Host ""
        $confirm = Read-Host "  Press Enter after editing .env.n8n to continue, or Ctrl+C to abort"
    } else {
        Write-Step ".env.n8n not found and no template available!" "ERROR"
        exit 1
    }
} else {
    Write-Step ".env.n8n found" "OK"
}

# ============================================================
# STEP 2: Start Docker Stack
# ============================================================
if (-not $SkipDocker) {
    Write-Header "Step 2: Starting Docker Stack"

    Write-Step "Pulling latest images..." "INFO"
    docker compose -f docker-compose.n8n.yml --env-file .env.n8n pull

    Write-Step "Starting containers..." "INFO"
    docker compose -f docker-compose.n8n.yml --env-file .env.n8n up -d

    Write-Step "Waiting for containers to be healthy..." "INFO"
    $maxWait = 60
    $waited = 0
    do {
        Start-Sleep -Seconds 5
        $waited += 5
        $health = docker compose -f docker-compose.n8n.yml ps --format json 2>&1
        Write-Host "    Waiting... ($waited/$maxWait sec)" -ForegroundColor Gray
    } while ($waited -lt $maxWait)

    # Check containers
    $containers = @("agrisensa_n8n", "agrisensa_n8n_postgres", "agrisensa_n8n_redis", "agrisensa_chromadb")
    foreach ($container in $containers) {
        $status = docker inspect --format='{{.State.Health.Status}}' $container 2>&1
        if ($status -eq "healthy" -or $LASTEXITCODE -eq 0) {
            Write-Step "$container is running" "OK"
        } else {
            Write-Step "$container may not be healthy (status: $status)" "WARN"
        }
    }
}

# ============================================================
# STEP 3: Wait for n8n to be ready
# ============================================================
Write-Header "Step 3: Waiting for n8n to be Ready"

$n8nReady = $false
$attempts = 0
$maxAttempts = 20

while (-not $n8nReady -and $attempts -lt $maxAttempts) {
    $attempts++
    try {
        $response = Invoke-WebRequest -Uri "$N8NUrl/healthz" -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $n8nReady = $true
            Write-Step "n8n is ready at $N8NUrl" "OK"
        }
    } catch {
        Write-Host "    Attempt $attempts/$maxAttempts — n8n not ready yet..." -ForegroundColor Gray
        Start-Sleep -Seconds 5
    }
}

if (-not $n8nReady) {
    Write-Step "n8n did not start in time. Check docker logs: docker logs agrisensa_n8n" "ERROR"
    exit 1
}

# ============================================================
# STEP 4: Import Workflows
# ============================================================
if ($ImportWorkflows -or $true) {
    Write-Header "Step 4: Importing n8n Workflows"

    $workflowDir = Join-Path $ScriptDir "workflows"
    $workflowFiles = Get-ChildItem -Path $workflowDir -Filter "*.json" | Sort-Object Name

    $credentials = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${N8NUser}:${N8NPassword}"))
    $headers = @{
        "Authorization" = "Basic $credentials"
        "Content-Type"  = "application/json"
    }

    foreach ($file in $workflowFiles) {
        try {
            $workflowJson = Get-Content -Path $file.FullName -Raw
            $response = Invoke-WebRequest `
                -Uri "$N8NUrl/api/v1/workflows" `
                -Method POST `
                -Headers $headers `
                -Body $workflowJson `
                -ErrorAction Stop

            if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 201) {
                Write-Step "Imported: $($file.Name)" "OK"
            }
        } catch {
            Write-Step "Failed to import $($file.Name): $($_.Exception.Message)" "WARN"
        }
    }
}

# ============================================================
# STEP 5: Test Workflows
# ============================================================
if ($TestWorkflows) {
    Write-Header "Step 5: Testing Workflow Endpoints"

    $testCases = @(
        @{
            Name = "WF-00 Master Gateway"
            Url  = "$N8NUrl/webhook/agrisensa/gateway"
            Body = '{"intent":"rag_chat","query":"Apa itu tanaman padi?"}'
        },
        @{
            Name = "WF-01 RAG Chat"
            Url  = "$N8NUrl/webhook/agrisensa/chat"
            Body = '{"query":"Apa itu pupuk NPK?","session_id":"test_session_001"}'
        },
        @{
            Name = "WF-02 ML Inference (Crop Recommend)"
            Url  = "$N8NUrl/webhook/agrisensa/ml"
            Body = '{"task":"recommend_crop","n_value":90,"p_value":42,"k_value":43,"temperature":20.8,"humidity":82,"ph":6.5,"rainfall":202.9}'
        },
        @{
            Name = "WF-04 Market Intelligence"
            Url  = "$N8NUrl/webhook/agrisensa/market"
            Body = '{"commodity":"padi","days":30}'
        },
        @{
            Name = "WF-05 Weather Climate"
            Url  = "$N8NUrl/webhook/agrisensa/weather"
            Body = '{"latitude":-6.9175,"longitude":107.6191,"location_name":"Bandung"}'
        }
    )

    foreach ($test in $testCases) {
        try {
            $response = Invoke-WebRequest `
                -Uri $test.Url `
                -Method POST `
                -Body $test.Body `
                -ContentType "application/json" `
                -TimeoutSec 30 `
                -ErrorAction Stop

            if ($response.StatusCode -eq 200) {
                Write-Step "$($test.Name): HTTP $($response.StatusCode) ✓" "OK"
            } else {
                Write-Step "$($test.Name): HTTP $($response.StatusCode)" "WARN"
            }
        } catch {
            Write-Step "$($test.Name): FAILED - $($_.Exception.Message)" "ERROR"
        }
    }
}

# ============================================================
# STEP 6: Summary
# ============================================================
Write-Header "Setup Complete!"

Write-Host ""
Write-Host "  🌾 AgriSensa n8n AI Engine is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "  📱 n8n UI:          $N8NUrl" -ForegroundColor Cyan
Write-Host "  👤 Username:        $N8NUser" -ForegroundColor Cyan
Write-Host "  🔑 Password:        $N8NPassword" -ForegroundColor Cyan
Write-Host ""
Write-Host "  🔗 Webhook Endpoints:" -ForegroundColor Yellow
Write-Host "     Gateway:    $N8NUrl/webhook/agrisensa/gateway" -ForegroundColor White
Write-Host "     Chat:       $N8NUrl/webhook/agrisensa/chat" -ForegroundColor White
Write-Host "     ML:         $N8NUrl/webhook/agrisensa/ml" -ForegroundColor White
Write-Host "     Vision:     $N8NUrl/webhook/agrisensa/vision" -ForegroundColor White
Write-Host "     Market:     $N8NUrl/webhook/agrisensa/market" -ForegroundColor White
Write-Host "     Weather:    $N8NUrl/webhook/agrisensa/weather" -ForegroundColor White
Write-Host "     MLOps:      $N8NUrl/webhook/agrisensa/mlops" -ForegroundColor White
Write-Host "     Notify:     $N8NUrl/webhook/agrisensa/notify" -ForegroundColor White
Write-Host ""
Write-Host "  📊 Monitoring:" -ForegroundColor Yellow
Write-Host "     PostgreSQL: localhost:5433" -ForegroundColor White
Write-Host "     Redis:      localhost:6380" -ForegroundColor White
Write-Host "     ChromaDB:   localhost:8001" -ForegroundColor White
Write-Host ""
Write-Host "  📋 Useful Commands:" -ForegroundColor Yellow
Write-Host "     View logs:  docker compose -f docker-compose.n8n.yml logs -f n8n" -ForegroundColor White
Write-Host "     Stop all:   docker compose -f docker-compose.n8n.yml down" -ForegroundColor White
Write-Host "     Restart n8n: docker restart agrisensa_n8n" -ForegroundColor White
Write-Host ""
