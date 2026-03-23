# ?? DEPLOY NOW - Complete Instructions

## ? Application Status: PRODUCTION READY

Your LegalRO application is fully built, tested, and ready to deploy!

---

## ?? Deploy to Ubuntu Server (One Command)

### Prerequisites
- Ubuntu 22.04+ server with SSH access
- 2GB+ RAM, 20GB+ disk
- Domain name with DNS A record pointing to server IP

### Deployment Command

```bash
# SSH to your server
ssh user@your-server-ip

# Run this on the server:
mkdir -p /opt/legalro && cd /opt/legalro && git clone https://github.com/vasileselever/legal.git . && bash deploy.sh
```

### What Happens (Automated)
1. ? Docker & Docker Compose installed
2. ? Repository cloned
3. ? Configuration prompted (.env)
4. ? Docker image built (5-10 min)
5. ? Services started
6. ? Application LIVE!

---

## ?? Configuration During Deploy

When `deploy.sh` runs, edit `.env` with your values:

```env
DOMAIN=app.yourcompany.com
DB_PASSWORD=StrongP@ssw0rd!
JWT_SECRET_KEY=<generate: openssl rand -base64 64>
```

---

## ? Verify Deployment

After deploy.sh completes:

```bash
# Check services
docker compose ps
# Should show 3 services as healthy

# Test API
curl -k https://your-domain.com/health
# Should return: Healthy

# Open in browser
# https://your-domain.com
```

---

## ?? Documentation

| Document | Purpose |
|----------|---------|
| **PRODUCTION_READY_SUMMARY.md** | Complete summary |
| **DEPLOYMENT_READY.md** | What's included |
| **DEPLOY_INSTRUCTIONS.md** | Detailed instructions |
| **README_DOCKER_DEPLOYMENT.md** | Overview |
| **QUICK_DEPLOY.md** | Quick reference |

---

## ?? After Deployment

### Daily Check
```bash
docker compose ps              # See all services
docker compose logs -f         # View logs
```

### Update Application
```bash
cd /opt/legalro
git pull origin main
docker compose build --no-cache
docker compose up -d
```

### Backup Database
```bash
docker compose exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" -C \
  -Q "BACKUP DATABASE [LegalRO_CaseManagement] TO DISK = '/var/opt/mssql/backup.bak'"
docker compose cp db:/var/opt/mssql/backup.bak ./backup-$(date +%Y%m%d).bak
```

---

## ?? What You're Deploying

### Backend
- ? .NET 8 API
- ? 12+ endpoints
- ? JWT authentication
- ? SQL Server database
- ? Document automation
- ? Lead management

### Frontend  
- ? React SPA
- ? TypeScript
- ? Responsive design
- ? Optimized build
- ? Code splitting

### Deployment
- ? Docker multi-stage build
- ? Automatic HTTPS (Let's Encrypt)
- ? 3 containerized services
- ? Zero-downtime updates
- ? Data persistence

---

## ?? Repository

**GitHub**: https://github.com/vasileselever/legal  
**Branch**: main  
**Status**: ? Ready for production

---

## ?? Ready? Deploy Now!

```bash
# Copy and paste on your server:
mkdir -p /opt/legalro && cd /opt/legalro && git clone https://github.com/vasileselever/legal.git . && bash deploy.sh
```

---

**Your application is production-ready!** ??

