#!/usr/bin/env pwsh
# StartAPI.ps1 - Smart API Startup Script
# Checks for existing instances and starts the API cleanly

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LegalRO Case Management API Starter  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to project directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "[1/5] Checking for existing API instances..." -ForegroundColor Yellow

# Check if any dotnet process is running legal.dll
$existingProcesses = Get-Process -Name "legal" -ErrorAction SilentlyContinue

if ($existingProcesses) {
    Write-Host "   Found running API instance(s)!" -ForegroundColor Red
    Write-Host "   PID: $($existingProcesses.Id -join ', ')" -ForegroundColor Red
    Write-Host ""
    $response = Read-Host "   Do you want to stop them? (Y/N)"
    
    if ($response -eq 'Y' -or $response -eq 'y') {
        foreach ($proc in $existingProcesses) {
            Write-Host "   Stopping process $($proc.Id)..." -ForegroundColor Yellow
            Stop-Process -Id $proc.Id -Force
        }
        Write-Host "   Stopped." -ForegroundColor Green
        Start-Sleep -Seconds 2
    } else {
        Write-Host "   Cannot start - port will be in use. Exiting." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   No existing instances found." -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/5] Checking ports availability..." -ForegroundColor Yellow

# Check if ports 5000, 5001 are free
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
$port5001 = Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue

if ($port5000 -or $port5001) {
    Write-Host "   Warning: Ports 5000 or 5001 are in use!" -ForegroundColor Red
    
    if ($port5000) {
        $proc5000 = Get-Process -Id $port5000.OwningProcess -ErrorAction SilentlyContinue
        Write-Host "   Port 5000 used by: $($proc5000.ProcessName) (PID: $($proc5000.Id))" -ForegroundColor Red
    }
    
    if ($port5001) {
        $proc5001 = Get-Process -Id $port5001.OwningProcess -ErrorAction SilentlyContinue
        Write-Host "   Port 5001 used by: $($proc5001.ProcessName) (PID: $($proc5001.Id))" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "   The API may fail to start. Continue anyway? (Y/N)" -ForegroundColor Yellow
    $response = Read-Host
    
    if ($response -ne 'Y' -and $response -ne 'y') {
        Write-Host "   Cancelled by user." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   Ports 5000 and 5001 are available." -ForegroundColor Green
}

Write-Host ""
Write-Host "[3/5] Restoring NuGet packages..." -ForegroundColor Yellow
dotnet restore --verbosity quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Packages restored." -ForegroundColor Green
} else {
    Write-Host "   Warning: Package restore had issues." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[4/5] Building project..." -ForegroundColor Yellow
dotnet build --no-restore --verbosity quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Build successful." -ForegroundColor Green
} else {
    Write-Host "   Build failed! Check errors above." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[5/5] Starting API..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  API Starting on HTTPS Profile         " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access at:" -ForegroundColor Cyan
Write-Host "  - HTTPS: https://localhost:5001" -ForegroundColor Cyan
Write-Host "  - HTTP:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "  - Swagger: https://localhost:5001" -ForegroundColor Cyan
Write-Host "  - Health: https://localhost:5001/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the API" -ForegroundColor Yellow
Write-Host ""

# Start the API
dotnet run --launch-profile https
