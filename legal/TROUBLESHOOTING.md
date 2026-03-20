# Troubleshooting Guide - LegalRO Backend API

## ?? Problem: Backend Cannot Keep Running

### Root Cause
Your backend **is working correctly** but crashes because:
1. **Port Conflict**: A previous instance is still running on the port
2. **Ungraceful Shutdown**: The process doesn't terminate properly when you close the terminal
3. **Multiple Instances**: Multiple dotnet processes try to bind to the same port

### ? Complete Solution

## ?? Quick Fix (Recommended Method)

### Use the New Start Scripts

I've created smart startup scripts that automatically handle cleanup:

#### **Method 1: PowerShell (Recommended)**
```powershell
cd C:\Users\vasileselever\Desktop\projects\Juridic\legal\legal
.\StartAPI.ps1
```

This script will:
- ? Check for existing API instances
- ? Stop them if found
- ? Verify ports are available
- ? Restore packages and build
- ? Start the API cleanly

#### **Method 2: Batch File**
```cmd
cd C:\Users\vasileselever\Desktop\projects\Juridic\legal\legal
StartAPI.bat
```

Simpler version that stops existing instances and starts fresh.

---

## ?? Manual Fix

If you prefer to do it manually:

### Step 1: Stop All Running Instances

**Option A - Use the Stop Script:**
```powershell
.\StopAPI.bat
```

**Option B - PowerShell:**
```powershell
Get-Process -Name "legal" -ErrorAction SilentlyContinue | Stop-Process -Force
```

**Option C - Task Manager:**
1. Press `Ctrl+Shift+Esc`
2. Find `legal.exe` or `dotnet.exe` processes
3. Right-click ? End Task

**Option D - Command Prompt:**
```cmd
taskkill /F /IM legal.exe
taskkill /F /IM dotnet.exe /FI "WINDOWTITLE eq legal*"
```

### Step 2: Verify Ports Are Free

```powershell
# Check if ports are free
Get-NetTCPConnection -LocalPort 5000,5001 -ErrorAction SilentlyContinue

# Should return nothing if ports are free
```

Or using netstat:
```cmd
netstat -ano | findstr :5000
netstat -ano | findstr :5001
```

**No output = Ports are free ?**

### Step 3: Start the API

```powershell
dotnet run --launch-profile https
```

Or for HTTP only:
```powershell
dotnet run --launch-profile http
```

### Step 4: Verify It's Running

Open browser to: **https://localhost:5001**

You should see the Swagger UI interface.

---

## ?? Permanent Solution

### Configure Consistent Ports

Edit `Properties/launchSettings.json` to use consistent ports:

```json
{
  "profiles": {
    "https": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": true,
      "applicationUrl": "https://localhost:5001;http://localhost:5000",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

### Use Visual Studio

If using Visual Studio:
1. Open `legal.csproj` or `legal.sln`
2. Press **F5** to start with debugging
3. Press **Shift+F5** to stop
4. VS handles process management automatically

### Always Use Ctrl+C to Stop

When running `dotnet run` in terminal:
- **Press Ctrl+C** to stop gracefully
- Don't just close the terminal window
- Wait for "Application shut down" message

---

## ?? Understanding the Error

When you see this error:
```
System.IO.IOException: Failed to bind to address http://127.0.0.1:5053: address already in use.
```

It means:
- ? Port 5053 (or 5000/5001) is already occupied
- ? Another process is listening on that port
- ? The new instance cannot start

**The fix:** Stop the existing process first!

---

## ?? Diagnostic Commands

### Check What's Using a Port
```powershell
# PowerShell
Get-NetTCPConnection -LocalPort 5000 | Select-Object -Property LocalAddress, LocalPort, State, OwningProcess

# Get process name
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess
```

```cmd
# Command Prompt
netstat -ano | findstr :5000
# Note the PID (last column), then:
tasklist /FI "PID eq <PID>"
```

### Check All API Processes
```powershell
# PowerShell
Get-Process -Name "legal","dotnet" -ErrorAction SilentlyContinue | 
  Format-Table Id, ProcessName, StartTime, Path -AutoSize
```

```cmd
# Command Prompt
tasklist | findstr "legal.exe dotnet.exe"
```

### View Recent Logs
```powershell
# PowerShell
Get-ChildItem logs\*.txt | Sort-Object LastWriteTime -Descending | 
  Select-Object -First 1 | Get-Content -Tail 50
```

```cmd
# Command Prompt
cd logs
dir /O-D
more <latest-log-file>
```

---

## ?? Common Issues

### Issue 1: "Port Already in Use"

**Symptom:**
```
Failed to bind to address http://127.0.0.1:5001: address already in use
```

**Solution:**
1. Run `.\StopAPI.bat` or `taskkill /F /IM legal.exe`
2. Wait 2 seconds
3. Verify port is free: `netstat -ano | findstr :5001`
4. Start again: `dotnet run --launch-profile https`

### Issue 2: "Cannot Connect to SQL Server"

**Symptom:**
```
A connection was successfully established but then an error occurred during login
```

**Solution:**
1. Check SQL Server is running:
   ```powershell
   Get-Service -Name 'MSSQL$SQLEXPRESS','MSSQLLOCALDB'
   ```
2. Start if needed:
   ```powershell
   Start-Service -Name 'MSSQLLOCALDB'
   ```
3. Verify connection string in `appsettings.json`

### Issue 3: Multiple Dotnet Processes

**Symptom:**
Several `dotnet.exe` processes running, eating resources

**Solution:**
```powershell
# Stop ALL dotnet processes (careful!)
Get-Process dotnet | Stop-Process -Force

# Or more selective:
Get-Process dotnet | Where-Object {$_.Path -like "*legal*"} | Stop-Process -Force
```

### Issue 4: Browser Shows "This Site Can't Be Reached"

**Symptom:**
Browser can't connect to https://localhost:5001

**Solution:**
1. Check API is actually running:
   ```powershell
   Get-Process -Name "legal" -ErrorAction SilentlyContinue
   ```
2. Check logs for startup errors:
   ```powershell
   Get-Content logs\*.txt -Tail 20
   ```
3. Try HTTP instead: http://localhost:5000
4. Check firewall isn't blocking

### Issue 5: Swagger UI Not Loading

**Symptom:**
Blank page or 404 on https://localhost:5001

**Solution:**
1. Ensure you're in **Development** environment
2. Check `launchSettings.json` has `ASPNETCORE_ENVIRONMENT`: `Development`
3. Clear browser cache
4. Try incognito/private window
5. Check console for JavaScript errors (F12)

---

## ? Verification Checklist

After starting the API, verify:

- [ ] No errors in terminal output
- [ ] Log shows: `Now listening on: https://localhost:5001`
- [ ] Browser opens to Swagger UI
- [ ] Health endpoint works: https://localhost:5001/health returns `Healthy`
- [ ] Can expand and test API endpoints in Swagger
- [ ] No port conflict errors

---

## ?? Best Practices

### DO ?
- ? Use `StartAPI.ps1` or `StartAPI.bat` scripts
- ? Press **Ctrl+C** to stop the API gracefully
- ? Check logs regularly: `logs/legalro-*.txt`
- ? Run `dotnet build` before `dotnet run` if you made code changes
- ? Use Visual Studio for automatic process management
- ? Keep only one instance running at a time

### DON'T ?
- ? Close terminal window without stopping (Ctrl+C)
- ? Start multiple instances on the same ports
- ? Ignore port conflict errors
- ? Run without checking if already running
- ? Kill processes randomly without understanding impact

---

## ?? Quick Reference

### Start API (Smart Way)
```powershell
.\StartAPI.ps1
```

### Start API (Manual)
```powershell
dotnet run --launch-profile https
```

### Stop API
```powershell
# Press Ctrl+C in terminal
# Or run:
.\StopAPI.bat
```

### Check Status
```powershell
Get-Process -Name "legal" -ErrorAction SilentlyContinue
```

### Check Ports
```powershell
Get-NetTCPConnection -LocalPort 5000,5001 -ErrorAction SilentlyContinue
```

### View Logs
```powershell
Get-Content logs\legalro-*.txt -Tail 50 -Wait
```

### Health Check
```powershell
# PowerShell
Invoke-WebRequest -Uri https://localhost:5001/health -SkipCertificateCheck

# Browser
https://localhost:5001/health
```

---

## ?? Still Having Issues?

If you're still having problems:

1. **Restart your computer** - Sometimes the simplest solution works
2. **Check Windows Firewall** - May be blocking local ports
3. **Run as Administrator** - Some operations may need elevated privileges
4. **Check antivirus** - May be interfering with dotnet.exe
5. **Reinstall .NET 8 SDK** - Ensure clean installation
6. **Use different ports** - Edit `launchSettings.json` to use 7000/7001
7. **Check Event Viewer** - Windows Logs ? Application for errors

### Get Diagnostic Info
```powershell
# System info
dotnet --info

# SDK version
dotnet --version

# Running processes
Get-Process -Name "dotnet","legal" | Format-List *

# Port usage
netstat -ano | findstr "5000 5001 5053"

# SQL Server status
Get-Service -Name "*SQL*"
```

---

## ?? Summary

**Problem:** Backend won't stay running  
**Root Cause:** Port conflicts from previous instances  
**Quick Fix:** Run `.\StartAPI.ps1`  
**Manual Fix:** Stop processes, verify ports, restart  
**Prevention:** Always use Ctrl+C to stop, use smart start scripts  
