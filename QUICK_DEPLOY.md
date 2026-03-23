# Docker Deployment - Quick Start for VS Users

A simplified checklist-based guide for deploying from Visual Studio to a Docker server.

---

## ?? Pre-Deployment Checklist (Local Machine)

- [ ] Visual Studio 2022+ with .NET 8 SDK installed
- [ ] Node.js 20+ installed
- [ ] Git configured and installed
- [ ] Project builds without errors (Build ? Build Solution)
- [ ] Frontend builds without errors (`npm run build` in legal-ui folder)
- [ ] All changes committed to Git (`git status` should be clean)

### Verify Everything Works

**In Visual Studio:**
```
Build ? Build Solution ? ? Build succeeded
```

**In PowerShell (from project root):**
```powershell
# Frontend
cd legal-ui
npm ci
npm run build
cd ..

# Backend
cd legal
dotnet publish -c Release -o publish
cd ..
```

**Commit everything:**
```powershell
git add .
git commit -m "Prepare for deployment"
git push origin main
```

---

## ??? Server Setup (One-Time)

### Option A: Automated (Recommended)

1. **SSH into server:**
   ```bash
   ssh user@your-server-ip
   ```

2. **Download and run deployment script:**
   ```bash
   cd /home/user
   wget https://raw.githubusercontent.com/your-username/legal/main/deploy.sh
   bash deploy.sh
   ```

3. **Answer prompts:**
   - Git repo URL: `https://github.com/your-username/legal.git`
   - Edit `.env` when prompted
   - Wait for build to complete

### Option B: Manual

```bash
# SSH to server
ssh user@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
exit && ssh user@your-server-ip

# Install Git
sudo apt install -y git

# Create app directory
mkdir -p /opt/legalro
cd /opt/legalro

# Clone repo
git clone https://github.com/your-username/legal.git .

# Configure
cp .env.example .env
nano .env  # Edit your domain, passwords, etc.

# Setup firewall
sudo ufw --force enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

---

## ?? Deploy Application

### Initial Deployment

```bash
# SSH to server
ssh user@your-server-ip
cd /opt/legalro

# Build and start
docker compose build --no-cache
docker compose up -d

# Wait 30-60 seconds, then check
docker compose ps
docker compose logs -f
```

### Subsequent Deployments (Updates)

**From your local machine (in VS):**

1. Make changes in Visual Studio
2. Test locally
3. Commit and push:
   ```powershell
   git add .
   git commit -m "Update feature X"
   git push origin main
   ```

**Then on server:**

```bash
ssh user@your-server-ip
cd /opt/legalro
git pull origin main
docker compose build --no-cache
docker compose up -d
docker compose logs -f app
```

---

## ? Verification

### Check Services Running

```bash
docker compose ps

# Should see:
# legalro-db     running (healthy)
# legalro-app    running (healthy)
# legalro-caddy  running
```

### Test API Health

```bash
curl -k https://your-domain.com/health
# Should return: Healthy
```

### Visit Application

Open browser: `https://your-domain.com`

---

## ?? Common Operations

### View Logs

```bash
# All services
docker compose logs -f

# Just app
docker compose logs app -f

# Just database
docker compose logs db -f
```

### Restart Service

```bash
docker compose restart app   # Restart app
docker compose restart db    # Restart database
docker compose restart       # Restart all
```

### Stop/Start

```bash
docker compose stop          # Stop all
docker compose start         # Start all
docker compose down          # Stop and remove (keeps data)
```

### Backup Database

```bash
docker compose exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" -C \
  -Q "BACKUP DATABASE [LegalRO_CaseManagement] TO DISK = '/var/opt/mssql/backup.bak'"

docker compose cp db:/var/opt/mssql/backup.bak ./backup-$(date +%Y%m%d).bak
```

---

## ?? Troubleshooting

### "Connection refused"

```bash
# Check if containers running
docker compose ps

# Check logs
docker compose logs caddy
docker compose logs app

# Verify DNS
nslookup your-domain.com

# Check firewall
sudo ufw status
```

### Database won't start

```bash
# Check password requirements
# Must be: 8+ chars, uppercase, lowercase, number, special char

# View logs
docker compose logs db

# Recreate with new password
docker compose down -v  # Removes database
# Edit .env with strong password
docker compose up -d --build
```

### App crashes

```bash
# Check logs
docker compose logs app

# Try restart
docker compose restart app

# Check if database is healthy first
docker compose ps
```

### Out of disk space

```bash
# Check usage
df -h

# Clean up
docker system prune -a --volumes
```

---

## ?? Useful Information

### Environment File Location
```
/opt/legalro/.env
```

### App Logs Location
```
Inside container: /app/logs/legalro-YYYYMMDD.txt
From host: docker compose logs app -f
```

### Database Location
```
Inside container: /var/opt/mssql
Docker volume: sqldata
```

### Application URL
```
https://your-domain.com
```

### API Health Endpoint
```
https://your-domain.com/health
```

---

## ?? Security Reminders

- ? Use strong DB password (8+ chars, mixed case, numbers, special)
- ? Generate unique JWT_SECRET_KEY: `openssl rand -base64 64`
- ? Keep domain pointing to correct IP
- ? Let Caddy auto-manage SSL certificates
- ? Don't expose port 1433 externally
- ? Run regular backups
- ? Keep system updated: `sudo apt update && sudo apt upgrade`

---

## ?? Quick Command Reference

```bash
# Status
docker compose ps
docker compose logs -f

# Deploy
git pull origin main
docker compose build --no-cache
docker compose up -d

# Stop/Start
docker compose down
docker compose up -d

# Backup
docker compose exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" -C \
  -Q "BACKUP DATABASE [LegalRO_CaseManagement] TO DISK = '/var/opt/mssql/backup.bak'"

# Logs
docker compose logs app -f          # App
docker compose logs db -f           # Database
docker compose logs caddy -f        # Web proxy
```

---

## ?? More Information

For detailed deployment guide, see: `DEPLOYMENT_GUIDE.md`

