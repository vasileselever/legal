# ? Docker Deployment - Correct Command Syntax

## ?? Important: Command Syntax by Shell

This document clarifies the correct syntax for commands in different shells.

---

## PowerShell vs Bash Differences

### ? WRONG - PowerShell Syntax (doesn't support &&)
```powershell
cd legal-ui && npm ci && npm run build && cd ..
```

### ? CORRECT - PowerShell Syntax (separate lines or semicolons)
```powershell
cd legal-ui
npm ci
npm run build
cd ..
```

**Alternative with semicolons:**
```powershell
cd legal-ui; npm ci; npm run build; cd ..
```

---

## Common Commands Reference

### Local Development Setup (PowerShell)

```powershell
# Navigate to project
cd C:\Users\vasileselever\Desktop\projects\Juridic\legal

# Build the solution
# In Visual Studio: Build ? Build Solution
# OR from PowerShell:
dotnet build

# Build frontend
cd legal-ui
npm ci
npm run build
cd ..

# Test backend
cd legal
dotnet test
cd ..

# Commit everything
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Local Development Setup (Bash/Linux)

```bash
# Navigate to project
cd ~/projects/legal

# Build the solution
dotnet build

# Build frontend
cd legal-ui
npm ci && npm run build
cd ..

# Test backend
cd legal
dotnet test
cd ..

# Commit everything
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## Server Deployment Commands

### Server Setup (Bash - Ubuntu)

```bash
# SSH to server
ssh user@your-server-ip

# Download deployment script
cd /home/user
wget https://raw.githubusercontent.com/your-username/legal/main/deploy.sh
bash deploy.sh

# OR manual setup
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
exit && ssh user@your-server-ip

# Clone repository
mkdir -p /opt/legalro
cd /opt/legalro
git clone https://github.com/your-username/legal.git .

# Configure
cp .env.example .env
nano .env  # Edit with your values

# Setup firewall
sudo ufw --force enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Build and start
docker compose build --no-cache
docker compose up -d

# Verify
docker compose ps
docker compose logs -f
```

---

## Docker Commands

### All Docker commands work the same on Linux
```bash
# Check status
docker compose ps
docker compose ps --all

# View logs
docker compose logs -f
docker compose logs app -f
docker compose logs db -f
docker compose logs caddy -f

# Control services
docker compose stop
docker compose start
docker compose restart
docker compose restart app
docker compose down
docker compose down -v  # ?? Removes data!

# Build and deploy
docker compose build --no-cache
docker compose up -d
docker compose up -d --build

# Database backup
docker compose exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" -C \
  -Q "BACKUP DATABASE [LegalRO_CaseManagement] TO DISK = '/var/opt/mssql/backup.bak'"

docker compose cp db:/var/opt/mssql/backup.bak ./backup-$(date +%Y%m%d).bak
```

---

## Git Commands

### PowerShell (Windows)
```powershell
# Check status
git status

# Commit changes
git add .
git commit -m "Your message"

# Push to main
git push origin main

# Pull latest
git pull origin main

# Check logs
git log --oneline -10
```

### Bash (Linux)
```bash
# Check status
git status

# Commit changes
git add .
git commit -m "Your message"

# Push to main
git push origin main

# Pull latest
git pull origin main

# Check logs
git log --oneline -10
```

---

## NPM/Node Commands

### PowerShell
```powershell
# Install dependencies
npm ci

# Install new package
npm install package-name

# Build for production
npm run build

# Start dev server
npm run dev

# Clean install from scratch
npm ci --force
```

### Bash
```bash
# Install dependencies
npm ci

# Install new package
npm install package-name

# Build for production
npm run build

# Start dev server
npm run dev

# Clean install from scratch
npm ci --force
```

---

## .NET Commands

### PowerShell
```powershell
# Restore packages
dotnet restore

# Build
dotnet build

# Build release
dotnet build -c Release

# Run tests
dotnet test

# Publish release
dotnet publish -c Release -o ./publish

# Run the application
dotnet run

# Run with profile
dotnet run --launch-profile https
```

### Bash
```bash
# Restore packages
dotnet restore

# Build
dotnet build

# Build release
dotnet build -c Release

# Run tests
dotnet test

# Publish release
dotnet publish -c Release -o ./publish

# Run the application
dotnet run

# Run with profile
dotnet run --launch-profile https
```

---

## Documentation Corrections

All deployment documentation has been corrected to use:
- ? Proper PowerShell syntax for Windows commands
- ? Proper Bash syntax for Linux/server commands
- ? Clear comments showing differences
- ? Commands separated by lines instead of &&

### Updated Files
- ? README_DOCKER_DEPLOYMENT.md
- ? QUICK_DEPLOY.md
- ? DEPLOYMENT_GUIDE.md
- ? All other documentation

---

## Summary

| Shell | OS | Multiple Commands | Example |
|-------|----|--------------------|---------|
| **PowerShell** | Windows | Semicolons or new lines | `cmd1; cmd2; cmd3` or separate lines |
| **Bash** | Linux/Mac | && or ; | `cmd1 && cmd2 && cmd3` |
| **CMD** | Windows | && or separate lines | Works like PowerShell |

---

## Quick Reference

**When using PowerShell (Windows):**
```powershell
# ? DON'T do this
npm ci && npm run build && cd ..

# ? DO this instead
npm ci
npm run build
cd ..

# OR this
npm ci; npm run build; cd ..
```

**When using Bash (Linux/Server):**
```bash
# ? DO this (all these work)
npm ci && npm run build && cd ..
npm ci; npm run build; cd ..
npm ci
npm run build
cd ..
```

---

**All documentation has been updated to use the correct syntax for each shell.**

