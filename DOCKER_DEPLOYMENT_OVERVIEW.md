# Docker Deployment - Complete Overview

A complete guide for deploying your LegalRO application from Visual Studio to a Docker server.

---

## ?? Documentation Files Created

1. **DEPLOYMENT_GUIDE.md** - Comprehensive step-by-step guide
2. **QUICK_DEPLOY.md** - Quick reference for VS developers
3. **deploy.sh** - Automated deployment script
4. **manage.sh** - Application management script

---

## ?? Quick Start (3 Steps)

### Step 1: Prepare Locally (VS)

```powershell
# Build solution
Build ? Build Solution (Ctrl+Shift+B)

# Test frontend build
cd legal-ui
npm ci && npm run build
cd ..

# Commit everything
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Setup Server (First Time Only)

```bash
# SSH to your Ubuntu server
ssh user@your-server-ip

# Run automated setup
cd /home/user
wget https://raw.githubusercontent.com/your-username/legal/main/deploy.sh
bash deploy.sh

# Answer prompts and edit .env when asked
```

### Step 3: Deploy Application

```bash
# On server
ssh user@your-server-ip
cd /opt/legalro

# Deploy
docker compose build --no-cache
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f app
```

---

## ?? What Gets Deployed

### Architecture
```
[Your Browser]
      ?
[Caddy - Reverse Proxy + Auto HTTPS]
      ?
[.NET 8 API + React SPA Frontend]
      ?
[SQL Server Database]
```

### Components
- **Frontend:** React (built to static files in `dist/`)
- **Backend:** .NET 8 (ASP.NET Core)
- **Database:** SQL Server 2022 Express
- **Proxy:** Caddy (with automatic SSL/TLS)

### Ports
- **80/443:** Caddy (external internet access)
- **8080:** .NET app (internal to containers)
- **1433:** SQL Server (internal to containers, not exposed)

---

## ?? Files in the Repository

```
legal/                           # Main project
??? docker-compose.yml          # Docker services definition
??? Dockerfile                  # Multi-stage build
??? .env.example                # Environment template
??? Caddyfile                   # Web proxy config
??? DEPLOYMENT_GUIDE.md         # Detailed guide
??? QUICK_DEPLOY.md             # Quick reference
??? deploy.sh                   # Auto-deploy script
??? manage.sh                   # Management script
?
??? legal/                      # .NET backend
?   ??? legal.csproj
?   ??? appsettings.json
?   ??? appsettings.Production.json
?   ??? ... (API code)
?
??? legal-ui/                   # React frontend
    ??? package.json
    ??? vite.config.ts
    ??? src/
    ??? dist/                   # Built output (in container)
```

---

## ?? Environment Configuration (.env)

```env
# Your domain (must have DNS A record pointing to server)
DOMAIN=app.yourcompany.com

# SQL Server password (8+ chars, mixed case, number, special char)
DB_PASSWORD=SuperStr0ng!P@ss

# JWT secret (generate: openssl rand -base64 64)
JWT_SECRET_KEY=<64-char-random-string>

# Azure OpenAI (optional)
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_KEY=
AZURE_OPENAI_DEPLOYMENT=gpt-4o
```

---

## ?? Update/Redeploy Process

After making changes in VS:

```bash
# Local: Commit and push
git add .
git commit -m "Feature: Add X"
git push origin main

# Server: Pull and redeploy
cd /opt/legalro
git pull origin main
docker compose build --no-cache
docker compose up -d
docker compose logs -f app
```

---

## ?? Useful Commands

### Check Status
```bash
docker compose ps              # See all services
docker compose logs -f         # Real-time logs
curl -k https://your-domain/health  # Test API
```

### Management
```bash
docker compose stop            # Stop all
docker compose start           # Start all
docker compose restart         # Restart all
docker compose restart app     # Restart just app
docker compose down            # Stop and remove
```

### Database
```bash
# Backup
docker compose exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" -C \
  -Q "BACKUP DATABASE [LegalRO_CaseManagement] TO DISK = '/var/opt/mssql/backup.bak'"

docker compose cp db:/var/opt/mssql/backup.bak ./backup-$(date +%Y%m%d).bak
```

### Logs
```bash
docker compose logs app -f     # App logs
docker compose logs db -f      # Database logs
docker compose logs caddy -f   # Web proxy logs
```

---

## ??? Using Management Script

```bash
bash manage.sh status          # Check status
bash manage.sh logs            # View logs
bash manage.sh logs-app        # App logs only
bash manage.sh deploy          # Pull and redeploy
bash manage.sh restart         # Restart services
bash manage.sh backup          # Backup database
bash manage.sh test            # Health check
bash manage.sh clean           # Cleanup old images
```

---

## ?? Security Checklist

- [ ] Changed `DB_PASSWORD` to strong, unique value
- [ ] Generated new `JWT_SECRET_KEY` (64+ characters)
- [ ] Configured firewall (only 22, 80, 443 open)
- [ ] Domain DNS pointing to server IP
- [ ] SSH key authentication enabled
- [ ] First backup taken and verified
- [ ] HTTPS certificate auto-renewing (Caddy handles this)
- [ ] Server regularly updated: `sudo apt update && sudo apt upgrade`

---

## ?? Common Issues

### "Connection refused" / Can't access domain
- Check: `docker compose ps` (all healthy?)
- Check: `sudo ufw status` (firewall allowing traffic?)
- Check: Domain DNS pointing to server IP?
- Logs: `docker compose logs caddy`

### Database won't start
- Password requirements: 8+ chars, uppercase, lowercase, number, special char
- Check: `docker compose logs db`
- Fix: Update `.env` with stronger password, then `docker compose down -v && docker compose up -d`

### App crashes/errors
- Logs: `docker compose logs app -f`
- Try: `docker compose restart app`
- If database issue: Wait for `legalro-db` to show "healthy"

### Out of disk space
- Check: `df -h`
- Cleanup: `docker system prune -a --volumes`

---

## ?? Support Resources

For more details, see:
- **DEPLOYMENT_GUIDE.md** - Complete step-by-step instructions
- **QUICK_DEPLOY.md** - Quick reference for developers
- **Dockerfile** - Build process details
- **docker-compose.yml** - Service configuration

---

## ?? Next Steps

1. **Read:** QUICK_DEPLOY.md (if new to this)
2. **Setup:** Run deploy.sh on server
3. **Configure:** Edit .env with your values
4. **Deploy:** `docker compose build && docker compose up -d`
5. **Verify:** `curl -k https://your-domain/health`
6. **Access:** Open https://your-domain in browser

---

## ?? Technical Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** .NET 8 + ASP.NET Core
- **Database:** SQL Server 2022 Express
- **Containers:** Docker + Docker Compose
- **Reverse Proxy:** Caddy 2 (with Let's Encrypt auto-SSL)
- **Server:** Ubuntu 22.04+ on any Linux host (AWS, Azure, DigitalOcean, etc.)

---

## ?? Backup Strategy

**Automatic:**
- Docker volumes persist data between restarts
- Database files stored in `sqldata` volume

**Manual Backups:**
```bash
# Backup command (safe to run anytime)
docker compose exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" -C \
  -Q "BACKUP DATABASE [LegalRO_CaseManagement] TO DISK = '/var/opt/mssql/backup.bak'"

docker compose cp db:/var/opt/mssql/backup.bak ./backup-$(date +%Y%m%d).bak
```

**Recommended:** Weekly or after major changes

---

**Happy Deploying! ??**

