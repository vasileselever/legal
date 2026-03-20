# ?? QUICK REFERENCE - Start Here!

## ?? **START THE API** (Choose ONE)

### ? **Easiest Way** (Double-click or run):
```cmd
.\StartAPI.bat
```
OR even simpler:
```cmd
.\run.bat
```

### ?? **Advanced Way** (PowerShell - requires one-time setup):
```powershell
# First time only - Run PowerShell as Administrator:
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Then use:
.\StartAPI.ps1
```

---

## ?? **STOP THE API** (Choose ONE)

### Best Way:
Press **`Ctrl+C`** in the terminal

### Alternative:
```cmd
.\StopAPI.bat
```

---

## ? **VERIFY IT'S WORKING**

1. **Check terminal output:**
   ```
   [INF] Now listening on: https://localhost:5001
   ```

2. **Open browser:**
   ```
   https://localhost:5001
   ```
   Should show Swagger UI

3. **Health check:**
   ```
   https://localhost:5001/health
   ```
   Should show "Healthy"

---

## ? **TROUBLESHOOTING**

### Problem: "Port already in use"

**Fix:**
```cmd
.\StopAPI.bat
.\StartAPI.bat
```

### Problem: "PowerShell scripts disabled"

**Fix - Use batch file instead:**
```cmd
.\StartAPI.bat
```

**Or enable PowerShell (run as Administrator):**
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Problem: "Can't connect to localhost:5001"

**Check if API is running:**
```cmd
tasklist | findstr legal.exe
```

**Check logs:**
```cmd
cd logs
dir /O-D
type legalro-*.txt
```

---

## ?? **COMMON COMMANDS**

| Task | Command |
|------|---------|
| **Start API** | `.\StartAPI.bat` or `.\run.bat` |
| **Stop API** | Press `Ctrl+C` or `.\StopAPI.bat` |
| **Check if running** | `tasklist \| findstr legal.exe` |
| **View logs** | `type logs\legalro-*.txt` |
| **Build project** | `dotnet build` |
| **Clean build** | `dotnet clean` then `dotnet build` |

---

## ?? **TYPICAL WORKFLOW**

### Starting Work:
```cmd
cd C:\Users\vasileselever\Desktop\projects\Juridic\legal\legal
.\StartAPI.bat
```
Wait for "Now listening on..." message, then open browser to https://localhost:5001

### Making Changes:
1. Press `Ctrl+C` to stop API
2. Edit your code
3. Run `.\StartAPI.bat` to restart

### Ending Work:
Press `Ctrl+C` in the terminal

---

## ?? **FILE REFERENCE**

| File | Purpose |
|------|---------|
| `run.bat` | ? **Quickest start** - Just run it! |
| `StartAPI.bat` | ?? Smart start with checks |
| `StartAPI.ps1` | ?? PowerShell version (requires setup) |
| `StopAPI.bat` | ?? Stop the API |
| `appsettings.json` | ?? Configuration |
| `logs/legalro-*.txt` | ?? Application logs |

---

## ?? **NEED MORE HELP?**

| Question | See File |
|----------|----------|
| PowerShell scripts blocked? | [ENABLE_POWERSHELL.md](ENABLE_POWERSHELL.md) |
| Detailed startup guide | [HOW_TO_RUN.md](HOW_TO_RUN.md) |
| Why won't it stay running? | [ROOT_CAUSE_ANALYSIS.md](ROOT_CAUSE_ANALYSIS.md) |
| Complete troubleshooting | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |
| Full documentation | [README.md](README.md) |

---

## ?? **REMEMBER**

? **DO:**
- Use `.\StartAPI.bat` or `.\run.bat` to start
- Press `Ctrl+C` to stop
- Check logs when issues occur

? **DON'T:**
- Close terminal without stopping (Ctrl+C)
- Start multiple instances
- Ignore "port already in use" errors

---

## ?? **YOU'RE READY!**

Just run:
```cmd
.\StartAPI.bat
```

Then open: **https://localhost:5001**

That's it! ??

---

**Last Updated:** December 15, 2024  
**Quick Help:** Just run `.\StartAPI.bat` - it handles everything!
