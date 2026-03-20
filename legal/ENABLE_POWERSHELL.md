# How to Enable PowerShell Scripts

## ?? The Error You're Seeing

```
.\StartAPI.ps1 : File cannot be loaded because running scripts is disabled on this system.
```

This is Windows PowerShell's **Execution Policy** blocking the script for security.

---

## ? Solution 1: Use the Batch File (Easiest)

**No configuration needed!** Just use:

```cmd
.\StartAPI.bat
```

The `.bat` file does the same thing and works immediately.

---

## ? Solution 2: Enable PowerShell Scripts

### Option A: One-Time Bypass (Temporary)

Run this command in PowerShell **as Administrator**:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Then you can run:
```powershell
.\StartAPI.ps1
```

**Note:** This only works for the current PowerShell session.

---

### Option B: Enable for Current User (Recommended)

Run PowerShell **as Administrator**, then:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

When prompted, type **Y** and press Enter.

**What this does:**
- Allows local scripts to run
- Still requires remote scripts to be signed
- Only affects your user account
- Persists across sessions

After this, you can run `.\StartAPI.ps1` anytime.

---

### Option C: Unrestricted (Not Recommended for Security)

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Unrestricted
```

?? **Warning:** This allows all scripts to run without any checks.

---

## ?? Check Current Policy

To see your current execution policy:

```powershell
Get-ExecutionPolicy -List
```

Output example:
```
Scope          ExecutionPolicy
-----          ---------------
MachinePolicy  Undefined
UserPolicy     Undefined
Process        Undefined
CurrentUser    Restricted     ? This is blocking scripts
LocalMachine   Undefined
```

---

## ?? Recommended Approach

### For Daily Use:
```cmd
# Just use the batch file - it works without any setup
.\StartAPI.bat
```

### If You Need PowerShell Features:
```powershell
# Run as Administrator once:
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Then use normally:
.\StartAPI.ps1
```

---

## ?? What Each Policy Means

| Policy | Description |
|--------|-------------|
| **Restricted** | No scripts allowed (default) |
| **RemoteSigned** | Local scripts OK, remote must be signed |
| **Unrestricted** | All scripts allowed, prompts for remote |
| **Bypass** | Nothing blocked, no prompts |

---

## ? Quick Test

After changing the policy:

```powershell
# Should show RemoteSigned
Get-ExecutionPolicy -Scope CurrentUser

# Should work now
.\StartAPI.ps1
```

---

## ?? Still Having Issues?

If you still can't run PowerShell scripts:

1. **Make sure you ran PowerShell as Administrator**
   - Right-click PowerShell ? "Run as Administrator"

2. **Check if Group Policy is blocking**
   ```powershell
   Get-ExecutionPolicy -Scope MachinePolicy
   # If not "Undefined", your organization may have restrictions
   ```

3. **Use the batch file instead**
   ```cmd
   .\StartAPI.bat
   # This always works!
   ```

---

## ?? Summary

**Easiest Solution:** Use `.\StartAPI.bat` (no setup needed)

**To Enable PowerShell:**
1. Open PowerShell as Administrator
2. Run: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`
3. Type `Y` to confirm
4. Now `.\StartAPI.ps1` will work

---

**Last Updated:** December 15, 2024
