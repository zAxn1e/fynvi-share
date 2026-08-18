# Fynvi Share Docker Helper Script for Windows PowerShell
param (
    [Parameter(Position=0)]
    [ValidateSet("up", "down", "restart", "rebuild", "logs", "build")]
    [string]$Action = "rebuild",

    [Parameter(Position=1)]
    [ValidateSet("default", "local")]
    [string]$ComposeTarget = "local"
)

$ComposeFile = if ($ComposeTarget -eq "local") { "docker-compose.local.yml" } else { "docker-compose.yml" }

switch ($Action) {
    "rebuild" {
        Write-Host "==> Rebuilding and restarting Fynvi Share using $ComposeFile..." -ForegroundColor Cyan
        docker compose -f $ComposeFile down
        docker compose -f $ComposeFile up -d --build
        Write-Host "==> Fynvi Share is running at http://localhost:3000" -ForegroundColor Green
        docker compose -f $ComposeFile logs -f
    }
    "up" {
        Write-Host "==> Starting Fynvi Share using $ComposeFile..." -ForegroundColor Cyan
        docker compose -f $ComposeFile up -d
        Write-Host "==> Fynvi Share is running at http://localhost:3000" -ForegroundColor Green
    }
    "build" {
        Write-Host "==> Building Fynvi Share image using $ComposeFile..." -ForegroundColor Cyan
        docker compose -f $ComposeFile build
    }
    "down" {
        Write-Host "==> Stopping Fynvi Share using $ComposeFile..." -ForegroundColor Yellow
        docker compose -f $ComposeFile down
    }
    "restart" {
        Write-Host "==> Restarting Fynvi Share using $ComposeFile..." -ForegroundColor Cyan
        docker compose -f $ComposeFile restart
    }
    "logs" {
        docker compose -f $ComposeFile logs -f
    }
}
