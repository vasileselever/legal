# ?? Quick Start - How to Keep Your Backend Running

## ? The Right Way to Start Your API

### **Method 1: Use the Batch File** (Recommended - Always Works)

```cmd
cd C:\Users\vasileselever\Desktop\projects\Juridic\legal\legal
.\StartAPI.bat
```

This works immediately without any configuration!

### **Method 2: Use PowerShell Script** (Requires One-Time Setup)

?? **First time:** PowerShell may block scripts. See [ENABLE_POWERSHELL.md](ENABLE_POWERSHELL.md) for setup.

```powershell
cd C:\Users\vasileselever\Desktop\projects\Juridic\legal\legal
.\StartAPI.ps1
```

**If you get "scripts disabled" error:**
```powershell
# Run PowerShell as Administrator, then:
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Then try again:
.\StartAPI.ps1
```

### **What These Scripts Do:**
Both scripts automatically:
- ? Stop any existing instances
- ? Check ports are available  
- ? Build your project
- ? Start the API cleanly

---

## ?? The Right Way to Stop Your API

### **Method 1: Press Ctrl+C** (Recommended)
When the API is running in your terminal:
1. Press **Ctrl+C** once
2. Wait for "Application shut down gracefully" message
3. Done! ?

### **Method 2: Use the Stop Script**
```powershell
.\StopAPI.bat
```

### **Method 3: Task Manager**
1. Press `Ctrl+Shift+Esc`
2. Find `legal.exe` process
3. Right-click ? End Task

---

## ? What NOT to Do

### DON'T:
- ? Close the terminal window without stopping (Ctrl+C)
- ? Start the API when it's already running
- ? Ignore "port already in use" errors
- ? Kill the process randomly

### WHY:
When you close the terminal without proper shutdown:
- The process keeps running in the background
- The port stays occupied
- Next start attempt fails with "port in use"
- You have to manually kill the process

---

## ?? Typical Workflow

### Starting Fresh
```powershell
# 1. Navigate to project
cd C:\Users\vasileselever\Desktop\projects\Juridic\legal\legal

# 2. Start API (smart way)
.\StartAPI.ps1

# 3. Wait for "Now listening on..."
# Output: Now listening on: https://localhost:5001

# 4. Open browser
# Navigate to: https://localhost:5001
```

### Making Code Changes
```powershell
# 1. Stop the running API
# Press Ctrl+C in the terminal

# 2. Make your code changes
# Edit files as needed

# 3. Restart
.\StartAPI.ps1
```

### End of Day
```powershell
# Just press Ctrl+C in the terminal
# Or close Visual Studio (it stops automatically)
```

---

## ?? When Things Go Wrong

### "Port Already in Use" Error

**Problem:**
```
Failed to bind to address http://127.0.0.1:5001: address already in use
```

**Solution:**
```powershell
# Quick fix
.\StopAPI.bat
.\StartAPI.ps1

# Or manual
Get-Process -Name "legal" | Stop-Process -Force
dotnet run --launch-profile https
```

### Can't Access https://localhost:5001

**Check these:**
```powershell
# 1. Is the API actually running?
Get-Process -Name "legal"

# 2. Check the logs
Get-Content logs\legalro-*.txt -Tail 20

# 3. Try HTTP instead
# Navigate to: http://localhost:5000
```

### Multiple Processes Running

**Solution:**
```powershell
# Stop all legal processes
Get-Process -Name "legal" | Stop-Process -Force

# Start fresh
.\StartAPI.ps1
```

---

## ?? How to Know It's Working

### ? Good Signs:
```
[INF] Starting LegalRO Case Management API
[INF] Now listening on: https://localhost:5001
[INF] Now listening on: http://localhost:5000
[INF] Application started. Press Ctrl+C to shut down.
```

### ? Bad Signs:
```
[ERR] Failed to bind to address
[ERR] address already in use
[ERR] Unable to start Kestrel
```

---

## ?? Pro Tips

### Tip 1: Use One Terminal
Keep one PowerShell/terminal window dedicated to running the API.
Use a separate window for other commands.

### Tip 2: Check Before Starting
```powershell
# Before starting, check if already running
Get-Process -Name "legal" -ErrorAction SilentlyContinue

# If nothing shows, you're good to start
```

### Tip 3: Use Visual Studio
If you have Visual Studio:
- Press **F5** to start (auto-stops previous instance)
- Press **Shift+F5** to stop
- VS manages everything automatically!

### Tip 4: Monitor Logs
Keep an eye on logs while developing:
```powershell
Get-Content logs\legalro-*.txt -Tail 20 -Wait
```

### Tip 5: Health Check
Verify API is healthy:
```powershell
# PowerShell
Invoke-WebRequest -Uri https://localhost:5001/health -SkipCertificateCheck

# Or browser
https://localhost:5001/health
# Should show: Healthy
```

---

## ?? Files Reference

### Start Scripts
- `StartAPI.ps1` - Smart PowerShell startup (checks everything)
- `StartAPI.bat` - Simple batch file startup
- `StopAPI.ps1` - PowerShell stop script
- `StopAPI.bat` - Batch file stop script

### Configuration
- `appsettings.json` - App configuration
- `Properties/launchSettings.json` - Launch profiles & ports

### Logs
- `logs/legalro-YYYYMMDD.txt` - Daily rolling logs

---

## ?? Summary

| Action | Command |
|--------|---------|
| **Start API** | `.\StartAPI.ps1` |
| **Stop API** | Press `Ctrl+C` or `.\StopAPI.bat` |
| **Check if Running** | `Get-Process -Name "legal"` |
| **View Logs** | `Get-Content logs\legalro-*.txt -Tail 20` |
| **Test API** | Open `https://localhost:5001` |
| **Health Check** | `https://localhost:5001/health` |

---

## ?? More Help

- **Full Troubleshooting Guide:** See `TROUBLESHOOTING.md`
- **Complete Documentation:** See `README.md`
- **Architecture Details:** See `ARCHITECTURE.md`

---

**Remember:** Always use **Ctrl+C** to stop gracefully! ??

---

**Last Updated:** December 15, 2024  
**Version:** 1.0
