# ?? Docker Deployment - Getting Started

**Complete guide to deploy your LegalRO application from Visual Studio to a Docker server.**

---

## ?? Reading Order

Follow these documents in this order:

### For First-Time Deployers
1. **This file** - You are here! Overview and next steps
2. **QUICK_DEPLOY.md** - Quick reference checklist
3. **DEPLOYMENT_GUIDE.md** - Detailed step-by-step guide

### For Ongoing Operations
- **manage.sh** - Use these commands for daily management
- **deploy.sh** - For quick redeployments

---

## ? What's New

I've created a complete Docker deployment system for you. Here's what's included:

### ?? Documentation
- ? **DEPLOYMENT_GUIDE.md** - Comprehensive 250+ line guide with troubleshooting
- ? **QUICK_DEPLOY.md** - One-page quick reference for VS developers
- ? **DOCKER_DEPLOYMENT_OVERVIEW.md** - Architecture and technical overview

### ??? Automation Scripts
- ? **deploy.sh** - Automated server setup and deployment
- ? **manage.sh** - Commands for status, logs, restart, backup, etc.

### ?? Existing Docker Configuration
- ? **Dockerfile** - Multi-stage build (frontend + backend)
- ? **docker-compose.yml** - All services (app, database, proxy)
- ? **.env.example** - Configuration template
- ? **Caddyfile** - Auto HTTPS configuration

---

## ?? Five-Minute Overview

### What This Does
Your application gets deployed in three Docker containers:

```
???????????????????????????????????????????????????
?  Your Server (Ubuntu 22.04+)                   ?
?                                                 ?
?  ???????????????  ???????????????  ????????????
?  ?   Caddy     ?  ?  .NET App   ?  ? SQL DB  ??
?  ?   (Proxy)   ????  (8080)     ???? (1433)  ??
?  ?   (HTTPS)   ?  ?             ?  ?         ??
?  ???????????????  ???????????????  ????????????
?        ?                                        ?
???????????????????????????????????????????????????
         ?
         ?? https://your-domain.com (Internet)
```

### How It Works
1. **You make changes** in Visual Studio
2. **You push to Git** (git push)
3. **Server pulls code** and rebuilds Docker image
4. **Automatic restart** with zero downtime
5. **Users access** at your domain immediately

---

## ?? Quick Start

### For VS Users (What You Do)

```powershell
# In Visual Studio
Build ? Build Solution  # Ensure no errors

# In PowerShell
git add .
git commit -m "Deploy version 1.0"
git push origin main
```

### For Server Admin (What They Do)

```bash
# On Ubuntu server (first time)
bash deploy.sh

# Then just edit .env and wait for build

# For future updates
cd /opt/legalro
git pull origin main
docker compose build --no-cache
docker compose up -d
```

---

## ??? Architecture

### Services
| Service | Container | Port | Purpose |
|---------|-----------|------|---------|
| **Frontend** | legalro-app | 8080 | React SPA |
| **Backend** | legalro-app | 8080 | .NET 8 API |
| **Database** | legalro-db | 1433 | SQL Server |
| **Proxy** | legalro-caddy | 443 | HTTPS + Let's Encrypt |

### Data Persistence
- **Application logs** ? `/opt/legalro/logs/`
- **Database files** ? Docker volume `sqldata` (persists between restarts)
- **SSL certificates** ? Docker volume `caddy-data` (auto-renews)

### Security
- ? Automatic HTTPS with Let's Encrypt (no manual cert management)
- ? Database only accessible from within container network
- ? Firewall blocking everything except SSH, HTTP, HTTPS
- ? Environment variables for sensitive data

---

## ?? Prerequisites

### Your Local Machine
- Visual Studio 2022+ with .NET 8 SDK
- Node.js 20+
- Git
- (Optional: Docker Desktop for local testing)

### Your Server
- Ubuntu 22.04+ (or similar Linux)
- 2GB+ RAM
- 20GB+ disk
- Static IP or DNS domain
- SSH access

### Your Domain
- DNS A record pointing to server IP
- Example: `app.yourcompany.com ? 123.45.67.89`

---

## ?? Next Steps

### Step 1: Read Quick Guide (5 minutes)
```bash
# Open this file
cat QUICK_DEPLOY.md
```

### Step 2: Prepare Locally (10 minutes)
```powershell
# In Visual Studio
Build ? Build Solution

# In PowerShell
cd legal-ui
npm ci && npm run build
cd ..
git add . && git commit -m "Ready for deployment" && git push
```

### Step 3: Setup Server (30 minutes)
```bash
# On your Ubuntu server
ssh user@your-server-ip
cd /home/user
wget https://raw.githubusercontent.com/your-username/legal/main/deploy.sh
bash deploy.sh
# Follow prompts
```

### Step 4: Deploy App (5 minutes)
```bash
# Automatic - deploy.sh did this
# But to manually deploy future updates:
cd /opt/legalro
git pull origin main
docker compose build --no-cache
docker compose up -d
```

### Step 5: Verify (2 minutes)
```bash
# Check services
docker compose ps

# Test API
curl -k https://your-domain.com/health

# View logs
docker compose logs app -f
```

---

## ?? Daily Operations

### Check Status
```bash
docker compose ps        # See all services and health
docker compose logs -f   # Watch logs live
```

### Update Application (After pushing to Git)
```bash
cd /opt/legalro
git pull origin main
docker compose build --no-cache
docker compose up -d
```

### View Logs
```bash
docker compose logs app -f    # Just app
docker compose logs db -f     # Just database
docker compose logs caddy -f  # Just web proxy
```

### Restart Services
```bash
docker compose restart        # Restart all
docker compose restart app    # Just the app
docker compose stop && docker compose start  # Full stop/start
```

### Backup Database
```bash
docker compose exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" -C \
  -Q "BACKUP DATABASE [LegalRO_CaseManagement] TO DISK = '/var/opt/mssql/backup.bak'"

docker compose cp db:/var/opt/mssql/backup.bak ./backup-$(date +%Y%m%d).bak
```

---

## ?? Common Issues

### "Connection refused"
- ? Run `docker compose ps` - are all services healthy?
- ? Check firewall: `sudo ufw status`
- ? Verify DNS: `nslookup your-domain.com`
- ? View logs: `docker compose logs caddy`

### Database won't start
- ? Password must be 8+ chars with uppercase, lowercase, number, special char
- ? Check logs: `docker compose logs db`
- ? Fix: Update `.env`, run `docker compose down -v && docker compose up -d`

### App crashes
- ? Check logs: `docker compose logs app -f`
- ? Restart: `docker compose restart app`
- ? Wait for database to be "healthy" first

### Need to see what's in the database?
```bash
docker compose exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" -C
# Then type SQL commands, press GO to execute
```

---

## ?? Security Checklist

Before going live:

- [ ] Changed `DB_PASSWORD` to unique strong password
- [ ] Generated new `JWT_SECRET_KEY`: `openssl rand -base64 64`
- [ ] Firewall configured: `sudo ufw status` shows 22, 80, 443 only
- [ ] Domain DNS pointing to correct server IP
- [ ] SSH key authentication enabled (password auth disabled)
- [ ] First database backup created and tested
- [ ] HTTPS working: `curl -k https://your-domain.com` shows no errors
- [ ] Application tested in browser at `https://your-domain.com`

---

## ?? Full Documentation

For detailed information, see:

1. **DEPLOYMENT_GUIDE.md**
   - Complete step-by-step instructions
   - Server setup from scratch
   - Troubleshooting section
   - Architecture details

2. **QUICK_DEPLOY.md**
   - One-page quick reference
   - Checklist format
   - Common operations
   - Command reference

3. **DOCKER_DEPLOYMENT_OVERVIEW.md**
   - Technical stack details
   - File structure
   - Update process
   - Backup strategy

---

## ?? Learning Resources

### Docker Basics
- [Docker Official Docs](https://docs.docker.com/)
- [Docker Compose Guide](https://docs.docker.com/compose/)

### .NET + Docker
- [.NET in Docker](https://docs.microsoft.com/en-us/dotnet/architecture/containerized-lifecycle/)

### Let's Encrypt / Caddy
- [Caddy Documentation](https://caddyserver.com/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

---

## ?? FAQ

**Q: Will my users experience downtime?**
A: No! Docker uses health checks and graceful shutdown. Updates happen in seconds with zero downtime.

**Q: How do I roll back to a previous version?**
A: `git checkout <commit-hash>` and redeploy.

**Q: Can I run this on Windows/Mac servers?**
A: Technically yes (via WSL2), but Linux is recommended for production.

**Q: Do I need to know Docker to deploy?**
A: No! The deploy.sh script handles everything. Just follow the prompts.

**Q: What if the database gets corrupted?**
A: Restore from your backup: `docker compose exec db restore ...`

**Q: Can I access the database from my local machine?**
A: Yes, but NOT recommended for security. Use backups or SSH tunneling instead.

---

## ?? You're Ready!

Start with **QUICK_DEPLOY.md** for the checklist format, or jump to **DEPLOYMENT_GUIDE.md** for detailed instructions.

**Questions?** Check the troubleshooting section in DEPLOYMENT_GUIDE.md or view logs with `docker compose logs -f`.

**Good luck! ??**

---

## ?? Support

| Issue | Solution |
|-------|----------|
| Docker won't build | Check `docker compose logs`, ensure 10GB+ disk free |
| Can't SSH to server | Check IP, firewall, username |
| Password requirements failing | 8+ chars, uppercase, lowercase, digit, special char |
| App won't start | Check database is healthy first: `docker compose ps` |
| Need to debug | Run `docker compose logs -f app` and scroll back |

**Always check logs first:** `docker compose logs -f`

