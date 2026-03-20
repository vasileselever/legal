# Stop Running LegalRO API
# This script will find and stop any running instances of the API

Write-Host "?? Searching for running LegalRO API instances..." -ForegroundColor Yellow

# Method 1: Find by process name
$legalProcesses = Get-Process -Name "legal" -ErrorAction SilentlyContinue
if ($legalProcesses) {
    Write-Host "? Found legal.exe processes:" -ForegroundColor Green
    $legalProcesses | Format-Table Id, ProcessName, StartTime -AutoSize
    
    foreach ($process in $legalProcesses) {
        Write-Host "?? Stopping process $($process.Id)..." -ForegroundColor Red
        Stop-Process -Id $process.Id -Force
        Write-Host "? Stopped process $($process.Id)" -ForegroundColor Green
    }
} else {
    Write-Host "? No legal.exe processes found" -ForegroundColor Yellow
}

# Method 2: Find by port 5053
Write-Host "`n?? Checking port 5053..." -ForegroundColor Yellow
$portInfo = netstat -ano | Select-String ":5053"

if ($portInfo) {
    Write-Host "? Port 5053 is in use:" -ForegroundColor Green
    Write-Host $portInfo
    
    # Extract PID from netstat output
    $portInfo -match '\s+(\d+)\s*$' | Out-Null
    if ($matches[1]) {
        $pid = $matches[1]
        Write-Host "`n?? Stopping process $pid on port 5053..." -ForegroundColor Red
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "? Stopped process $pid" -ForegroundColor Green
    }
} else {
    Write-Host "? Port 5053 is free" -ForegroundColor Green
}

# Method 3: Find any dotnet processes
$dotnetProcesses = Get-Process -Name "dotnet" -ErrorAction SilentlyContinue
if ($dotnetProcesses) {
    Write-Host "`n?? Found dotnet.exe processes:" -ForegroundColor Yellow
    $dotnetProcesses | Format-Table Id, ProcessName, StartTime, @{Name='Memory (MB)';Expression={[math]::Round($_.WorkingSet64/1MB,2)}} -AutoSize
    
    Write-Host "`n??  Do you want to stop ALL dotnet processes? (y/n): " -ForegroundColor Yellow -NoNewline
    $response = Read-Host
    
    if ($response -eq 'y' -or $response -eq 'Y') {
        foreach ($process in $dotnetProcesses) {
            Write-Host "?? Stopping dotnet process $($process.Id)..." -ForegroundColor Red
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        }
        Write-Host "? All dotnet processes stopped" -ForegroundColor Green
    } else {
        Write-Host "??  Skipping dotnet processes" -ForegroundColor Yellow
    }
}

Write-Host "`n?? Done! You can now restart the API." -ForegroundColor Green
Write-Host "?? Run: cd legal; dotnet run --launch-profile https" -ForegroundColor Cyan
