# ?? Backend Running Issues - Root Cause & Solution

## ?? TL;DR (Too Long; Didn't Read)

**Problem:** Your backend won't stay running  
**Root Cause:** Port conflicts - previous instance still running  
**Quick Fix:** Run `.\StartAPI.bat` (it handles everything)  
**To Stop:** Always press `Ctrl+C` before closing terminal  

**Note:** If using PowerShell, you may need to enable scripts first. See [ENABLE_POWERSHELL.md](ENABLE_POWERSHELL.md)

---

## ?? What's Actually Happening

### The Issue in Simple Terms:

1. You start the API ? It works! Runs on port 5001 ?
2. You close the terminal ? The process keeps running in background ??
3. You try to start again ? **ERROR: Port 5001 already in use!** ?
4. Backend crashes immediately ??

### Why This Happens:

When you run `dotnet run` and then just **close the terminal window**:
- The `dotnet.exe` or `legal.exe` process **doesn't stop**
- It continues running invisibly in the background
- The port (5001) stays **occupied**
- Next time you try to start, it **can't bind to the port**
- Result: Immediate crash with "address already in use" error

---

## ? The Solution (3 Steps)

### Step 1: Stop Any Existing Instances
```cmd
.\StopAPI.bat
```
This kills any running API processes.

### Step 2: Start Fresh

**Option A - Batch File (Easiest):**
```cmd
.\StartAPI.bat
```

**Option B - PowerShell (Requires Setup):**
```powershell
# If this is your first time, enable PowerShell scripts:
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Then run:
.\StartAPI.ps1
```

Both scripts:
- Check for existing instances
- Stop them if found
- Verify ports are free
- Build the project
- Start cleanly

### Step 3: From Now On - Stop Properly
**When you want to stop the API:**
- Press **`Ctrl+C`** in the terminal
- Wait for "Application shut down" message
- **DON'T** just close the window!

---

## ?? Visual Flow

### ? Wrong Way (Causes Problems):
```
???????????????????????
?  dotnet run         ? ? API starts on port 5001
???????????????????????
          ?
???????????????????????
? Close terminal ?   ? ? Process keeps running!
???????????????????????
          ?
???????????????????????
? dotnet run again    ? ? ERROR: Port in use!
???????????????????????
```

### ? Right Way:
```
???????????????????????
? .\StartAPI.ps1      ? ? API starts cleanly
???????????????????????
          ?
???????????????????????
? Press Ctrl+C ?     ? ? Graceful shutdown
???????????????????????
          ?
???????????????????????
? .\StartAPI.ps1      ? ? Starts fresh, no issues!
???????????????????????
```

---

## ?? What I Fixed

### 1. Improved Program.cs
- Added proper error handling
- Added graceful shutdown with `RunAsync()`
- Added proper logging of startup/shutdown
- Added try-catch-finally for clean disposal

### 2. Created Smart Start Scripts

**StartAPI.ps1** (PowerShell):
- Checks for existing processes
- Stops them automatically (with confirmation)
- Verifies ports are available
- Builds and starts cleanly

**StartAPI.bat** (Batch):
- Simpler version
- Kills existing instances
- Starts fresh

### 3. Updated Documentation
- **HOW_TO_RUN.md** - Quick reference guide
- **TROUBLESHOOTING.md** - Complete troubleshooting
- This file - Visual explanation

---

## ?? How to Verify It's Fixed

### Test 1: Start Normally
```powershell
.\StartAPI.ps1
# Should start without errors
# Browser opens to https://localhost:5001
```

### Test 2: Stop Properly
```powershell
# While API is running, press Ctrl+C
# Should see: "Application shut down gracefully"
```

### Test 3: Restart
```powershell
.\StartAPI.ps1
# Should start again without port conflicts
```

### Test 4: Health Check
```powershell
# While API is running
Invoke-WebRequest -Uri https://localhost:5001/health -SkipCertificateCheck
# Should return: StatusCode 200, Content "Healthy"
```

---

## ?? Understanding the Error

### The Error You See:
```
System.IO.IOException: Failed to bind to address http://127.0.0.1:5001: 
address already in use.
---> Microsoft.AspNetCore.Connections.AddressInUseException: 
Only one usage of each socket address (protocol/network address/port) 
is normally permitted.
```

### What It Means:
- **"Failed to bind"** = Can't listen on the port
- **"address already in use"** = Something else is using port 5001
- **"Only one usage"** = Port can only be used by one process at a time

### How to Diagnose:
```powershell
# Check what's using port 5001
Get-NetTCPConnection -LocalPort 5001

# Get the process name
Get-Process -Id (Get-NetTCPConnection -LocalPort 5001).OwningProcess

# Usually it's "legal.exe" or "dotnet.exe"
```

---

## ?? Prevention Tips

### Always Remember:
1. ? Use `StartAPI.ps1` to start
2. ? Press `Ctrl+C` to stop
3. ? Never just close the terminal
4. ? Check if running before starting: `Get-Process -Name "legal"`

### If You Forget:
```powershell
# Just run the stop script
.\StopAPI.bat

# Or kill manually
Get-Process -Name "legal" | Stop-Process -Force
```

---

## ?? Debug Commands

### Check if API is Running:
```powershell
Get-Process -Name "legal" -ErrorAction SilentlyContinue
# If you see output = it's running
# If no output = not running
```

### Check Port Usage:
```powershell
Get-NetTCPConnection -LocalPort 5000,5001 -ErrorAction SilentlyContinue
# If you see output = port is occupied
# If no output = port is free
```

### View Recent Errors:
```powershell
Get-Content logs\legalro-*.txt -Tail 30
# Look for [ERR] lines
```

### Full Diagnostic:
```powershell
# Check processes
Get-Process -Name "legal","dotnet" | Format-Table Id, ProcessName, StartTime

# Check ports
netstat -ano | findstr ":5000 :5001"

# Check logs
Get-ChildItem logs\*.txt | Sort-Object LastWriteTime -Descending | 
  Select-Object -First 1 | Get-Content -Tail 20
```

---

## ?? Demonstration

### Scenario: "It won't start!"

```powershell
# Try to start
PS> dotnet run
[ERR] Failed to bind to address http://127.0.0.1:5001: address already in use

# Diagnosis - check if running
PS> Get-Process -Name "legal"
Id    ProcessName
--    -----------
12345 legal

# Solution - stop it
PS> Stop-Process -Name "legal" -Force

# Verify it's stopped
PS> Get-Process -Name "legal" -ErrorAction SilentlyContinue
# No output = stopped

# Start fresh
PS> .\StartAPI.ps1
[INF] Starting LegalRO Case Management API
[INF] Now listening on: https://localhost:5001
# Success! ?
```

---

## ?? Related Files

| File | Purpose |
|------|---------|
| `StartAPI.ps1` | Smart PowerShell startup script |
| `StartAPI.bat` | Simple batch startup script |
| `StopAPI.ps1` | PowerShell stop script |
| `StopAPI.bat` | Batch stop script |
| `HOW_TO_RUN.md` | Quick start guide |
| `TROUBLESHOOTING.md` | Complete troubleshooting |
| `Program.cs` | Updated with graceful shutdown |

---

## ? Success Criteria

Your backend is working correctly when:

- ? Starts without port conflict errors
- ? Shows "Now listening on: https://localhost:5001"
- ? Swagger UI loads at https://localhost:5001
- ? Health endpoint returns "Healthy"
- ? Can stop cleanly with Ctrl+C
- ? Can restart without issues

---

## ?? Still Having Issues?

If these solutions don't work:

1. **Restart Computer** - Clears all stuck processes
2. **Check Firewall** - May be blocking ports
3. **Run as Administrator** - Some operations need elevation
4. **Different Ports** - Edit `launchSettings.json` to use 7000/7001
5. **Check Antivirus** - May be blocking dotnet.exe

---

## ?? Summary

**The Problem:**  
Port conflicts from improperly stopped instances

**The Fix:**  
1. Use `StartAPI.ps1` to start (auto-cleanup)
2. Use `Ctrl+C` to stop (graceful shutdown)
3. Never just close the terminal

**The Result:**  
Backend runs reliably every time! ??

---

**Last Updated:** December 15, 2024  
**Status:** ? **FIXED**  
**Confidence Level:** ?? High

Now go ahead and run `.\StartAPI.ps1` - it should work perfectly! ??
