# ? Deployment Ready - Server Setup Instructions

## ?? Current Status

Your LegalRO application is **ready to deploy** to a production server!

### Latest Commit
```
8c290a6 - Add deployment instructions with GitHub URL guidance
```

### What's Deployed
- ? .NET 8 Backend API (fully functional)
- ? React Frontend (optimized build with code splitting)
- ? Docker configuration (multi-stage build)
- ? Deployment automation scripts
- ? Complete documentation
- ? All dependencies and configurations

---

## ?? Deploy to Server Now

### For Ubuntu 22.04+ Server

**One-Command Deployment:**

```bash
# SSH to your server and run this single command:
ssh user@your-server-ip

# Then on the server:
mkdir -p /opt/legalro && cd /opt/legalro && git clone https://github.com/vasileselever/legal.git . && bash deploy.sh
```

Or step by step:

```bash
# 1. SSH to server
ssh user@your-server-ip

# 2. Create directory
mkdir -p /opt/legalro
cd /opt/legalro

# 3. Clone repository
git clone https://github.com/vasileselever/legal.git .

# 4. Run deployment script
bash deploy.sh

# 5. Follow the prompts
# - Edit .env when asked
# - Wait for Docker build (5-10 minutes on first run)
# - Application starts automatically
```

---

## ?? What You Need

### Server Requirements
- ? Ubuntu 22.04+ (or similar Linux)
- ? 2GB+ RAM
- ? 20GB+ disk space
- ? Internet connection
- ? SSH access
- ? Static IP or DNS domain

### Before Deploying
- ? Domain name registered
- ? DNS A record pointing to server IP
- ? Example: `app.yourcompany.com` ? `123.45.67.89`

---

## ?? Configuration (.env)

The `deploy.sh` script will create `.env` from `.env.example`. Edit these values:

```env
# Your domain name
DOMAIN=app.yourcompany.com

# SQL Server password (8+ chars, mixed case, number, special char)
DB_PASSWORD=SuperStr0ng!P@ss

# JWT secret (generate: openssl rand -base64 64)
JWT_SECRET_KEY=<64-character-random-string>

# Azure OpenAI (optional)
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_KEY=
AZURE_OPENAI_DEPLOYMENT=gpt-4o
```

---

## ? Deployment Process

### Automated (deploy.sh)
```
1. ? Install Docker & Docker Compose
2. ? Clone repository
3. ? Create .env configuration
4. ? Build Docker image
5. ? Start all services
6. ? Verify health checks
```

**Time: ~10 minutes** (mostly Docker build)

### Manual (If needed)

```bash
cd /opt/legalro
docker compose build --no-cache
docker compose up -d
docker compose logs -f
```

---

## ?? After Deployment

### Verify Services Running

```bash
docker compose ps
# Should show:
# legalro-db     running (healthy)
# legalro-app    running (healthy)
# legalro-caddy  running
```

### Test Application

```bash
# Test API health
curl -k https://your-domain.com/health

# Should return: Healthy
```

### Access Application

Open in browser: `https://your-domain.com`

---

## ?? Daily Operations

### Check Status
```bash
docker compose ps
docker compose logs -f
```

### Update Code
```bash
cd /opt/legalro
git pull origin main
docker compose build --no-cache
docker compose up -d
```

### Restart Services
```bash
docker compose restart app
```

### Backup Database
```bash
docker compose exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" -C \
  -Q "BACKUP DATABASE [LegalRO_CaseManagement] TO DISK = '/var/opt/mssql/backup.bak'"

docker compose cp db:/var/opt/mssql/backup.bak ./backup-$(date +%Y%m%d).bak
```

---

## ?? Documentation

| File | Purpose |
|------|---------|
| **README_DOCKER_DEPLOYMENT.md** | Overview and quick start |
| **QUICK_DEPLOY.md** | Checklist for fast deployment |
| **DEPLOYMENT_GUIDE.md** | Detailed step-by-step guide |
| **DOCKER_DEPLOYMENT_OVERVIEW.md** | Technical architecture |
| **DOCKER_DEPLOYMENT_DIAGRAMS.md** | Visual diagrams |
| **DEPLOY_INSTRUCTIONS.md** | GitHub URL and troubleshooting |
| **deploy.sh** | Automated setup script |
| **manage.sh** | Daily operations commands |

---

## ?? Security Checklist

Before going live:

- [ ] Changed `DB_PASSWORD` to unique strong password
- [ ] Generated new `JWT_SECRET_KEY`
- [ ] Firewall configured (only 22, 80, 443 open)
- [ ] Domain DNS pointing to server IP
- [ ] SSH key authentication enabled
- [ ] First database backup created
- [ ] HTTPS certificate auto-renewing (Caddy handles this)
- [ ] Application tested in browser

---

## ?? Common Issues & Solutions

### "Connection refused"
```bash
docker compose ps
docker compose logs caddy
```

### "Database won't start"
```bash
# Check password format (8+ chars, mixed case, number, special)
docker compose logs db
# Fix: Update .env, run: docker compose down -v && docker compose up -d
```

### "App crashes"
```bash
docker compose logs app -f
docker compose restart app
```

---

## ?? Next Steps

### Step 1: Prepare (5 minutes)
- [ ] Have server IP or domain ready
- [ ] SSH access to server
- [ ] .env values ready

### Step 2: Deploy (10 minutes)
- [ ] Run deployment script
- [ ] Edit .env configuration
- [ ] Wait for Docker build

### Step 3: Verify (5 minutes)
- [ ] Check services: `docker compose ps`
- [ ] Test API: `curl -k https://your-domain/health`
- [ ] Open in browser

---

## ?? Support Resources

- **Docker Docs**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **.NET 8**: https://dotnet.microsoft.com/
- **React**: https://react.dev/
- **Caddy**: https://caddyserver.com/docs/

---

## ?? Ready to Deploy!

**Your application is production-ready!**

### Deploy Now:
```bash
git clone https://github.com/vasileselever/legal.git /opt/legalro
cd /opt/legalro
bash deploy.sh
```

### Questions?
- Check: **DEPLOY_INSTRUCTIONS.md** (troubleshooting)
- Read: **DEPLOYMENT_GUIDE.md** (detailed steps)
- See: **QUICK_DEPLOY.md** (quick reference)

---

**Deployment Date**: March 23, 2026  
**Status**: ? Ready for Production  
**Last Updated**: Commit 8c290a6  

