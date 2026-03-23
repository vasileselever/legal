# LegalRO - Docker Deployment Guide (From VS to Server)

Complete step-by-step guide to deploy the LegalRO application from Visual Studio to a Docker server.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Preparation (VS)](#local-preparation-vs)
3. [Server Setup](#server-setup)
4. [Deploy to Server](#deploy-to-server)
5. [Verify Deployment](#verify-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### On Your Local Machine
- ? Visual Studio 2022 (or later) with .NET 8 SDK
- ? Node.js 20+
- ? Git
- ? Docker Desktop (optional, for testing locally first)

### On Your Server
- ? Linux server (Ubuntu 22.04+ recommended)
- ? SSH access
- ? At least 2GB RAM
- ? 20GB disk space
- ? Static IP address
- ? Domain name pointing to server IP

---

## Local Preparation (VS)

### Step 1: Verify Everything Builds Locally

```bash
# Open Visual Studio and build the solution
# Build ? Build Solution (Ctrl+Shift+B)
# Verify: Build succeeded with 0 errors
```

### Step 2: Test the Frontend Build

```bash
# In PowerShell, navigate to the frontend
cd legal-ui

# Install and build React
npm ci                    # Clean install dependencies
npm run build             # Build for production
# Output should be in: legal-ui/dist/
```

### Step 3: Test Backend Publish

```bash
# In PowerShell, navigate to the backend
cd legal

# Publish the .NET app
dotnet publish -c Release -o publish
# Output should be in: legal/publish/
```

### Step 4: Commit and Push to Git

```bash
# Make sure all changes are committed
git add .
git commit -m "Prepare for Docker deployment"
git push origin main

# Note the commit hash for reference
git rev-parse HEAD
```

---

## Server Setup

### Step 1: SSH into Your Server

```bash
# From your local machine
ssh user@your-server-ip

# Example:
ssh ubuntu@192.168.1.100
```

### Step 2: Install Docker & Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Add current user to docker group (no sudo needed)
sudo usermod -aG docker $USER
exit

# Re-login for group changes to take effect
ssh user@your-server-ip

# Verify Docker
docker --version
docker compose version
```

### Step 3: Configure Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP  (for Caddy cert renewal)
sudo ufw allow 443/tcp   # HTTPS (your app)

# Verify
sudo ufw status
```

### Step 4: Install Git & Clone Repository

```bash
# Install Git
sudo apt install -y git

# Create app directory
mkdir -p /opt/legalro
cd /opt/legalro

# Clone your repository
git clone https://github.com/your-username/legal.git .
# OR
git clone git@github.com:your-username/legal.git .
```

---

## Deploy to Server

### Step 1: Create Environment File

```bash
# On the server, in /opt/legalro
cd /opt/legalro

# Copy the template
cp .env.example .env

# Edit with your values
nano .env
```

**Example .env:**
```env
DOMAIN=app.legalro.ro
DB_PASSWORD=SuP3rStr0ng!P@ssw0rd
JWT_SECRET_KEY=<generate-64-char-random-string>
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_KEY=
AZURE_OPENAI_DEPLOYMENT=gpt-4o
```

**To generate JWT_SECRET_KEY:**
```bash
openssl rand -base64 64
```

Save the file with `Ctrl+O`, `Enter`, `Ctrl+X`.

### Step 2: Build the Docker Image

```bash
# This builds both frontend and backend in one image
docker compose build --no-cache

# Progress output:
# Step 1/15 : FROM node:20-alpine AS frontend-build
# ...
# Successfully tagged legalro-app:latest
```

**Note:** First build takes 5-10 minutes. Subsequent builds are faster.

### Step 3: Start All Services

```bash
# Start all containers (-d = detached mode)
docker compose up -d

# Watch the startup logs
docker compose logs -f

# Wait for "legalro-app is healthy" message (30-60 seconds)
```

### Step 4: Verify Services Running

```bash
# Check all containers
docker compose ps

# Expected output:
# NAME           STATUS                 PORTS
# legalro-db     running (healthy)      1433/tcp
# legalro-app    running (healthy)      8080/tcp
# legalro-caddy  running                80/tcp, 443/tcp
```

---

## Verify Deployment

### Test 1: Health Check Endpoint

```bash
# From server or your local machine
curl -k https://your-domain.com/health

# Expected response:
# Healthy
```

### Test 2: Check Logs

```bash
# All services
docker compose logs -f

# Just the app
docker compose logs app -f

# Just the database
docker compose logs db -f

# Just Caddy
docker compose logs caddy -f
```

### Test 3: Database Connection

```bash
# Verify database is initialized
docker compose exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" -C -Q "SELECT @@VERSION"
```

### Test 4: Access the Web UI

Open your browser and go to:
```
https://your-domain.com
```

You should see:
- ? SSL certificate (no warnings)
- ? React frontend loading
- ? Login screen

### Test 5: API Connectivity

```bash
# From your browser DevTools (F12 ? Network tab)
# Navigate to any page and check API calls

# Or from command line:
curl -k https://your-domain.com/api/health
```

---

## Continuous Deployment (After Initial Setup)

### Update App Code

```bash
# On server, pull latest changes
cd /opt/legalro
git pull origin main

# Rebuild and restart
docker compose build --no-cache
docker compose up -d

# Watch logs
docker compose logs -f app
```

### Database Backups

```bash
# Create backup
docker compose exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" -C \
  -Q "BACKUP DATABASE [LegalRO_CaseManagement] TO DISK = '/var/opt/mssql/backup.bak'"

# Copy backup to host
docker compose cp db:/var/opt/mssql/backup.bak ./backup-$(date +%Y%m%d).bak

# Restore backup
docker compose exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" -C \
  -Q "RESTORE DATABASE [LegalRO_CaseManagement] FROM DISK = '/var/opt/mssql/backup.bak'"
```

### View Application Logs

```bash
# Real-time logs
docker compose logs -f app

# With timestamps
docker compose logs --timestamps app

# Last 100 lines
docker compose logs app --tail=100

# Application file logs (inside container)
docker compose exec app cat /app/logs/legalro-*.txt
```

---

## Troubleshooting

### Issue: "Connection refused" when accessing domain

**Solution:**
```bash
# Check if containers are running
docker compose ps

# Check Caddy logs
docker compose logs caddy

# Verify firewall
sudo ufw status

# Check DNS
nslookup your-domain.com
```

### Issue: Database won't start (SQL Server)

**Solution:**
```bash
# Check database logs
docker compose logs db

# Common causes:
# 1. Password doesn't meet SQL Server requirements (8+ chars, mixed case, number, special)
# 2. Port 1433 already in use

# Fix: Edit .env with stronger password
nano .env
docker compose down -v  # Remove everything
docker compose up -d --build
```

### Issue: SSL certificate not auto-renewing

**Solution:**
```bash
# Check Caddy logs
docker compose logs caddy

# Restart Caddy
docker compose restart caddy

# Manual renewal
docker compose exec caddy caddy reload
```

### Issue: App crashes with database errors

**Solution:**
```bash
# Check app logs
docker compose logs app

# Wait for database to be healthy
docker compose ps

# Restart app after DB is ready
docker compose restart app
```

### Issue: Out of disk space

**Solution:**
```bash
# Check disk usage
df -h

# Check Docker disk usage
docker system df

# Clean up old images/containers
docker system prune -a --volumes

# Remove old backups
ls -lh backup-*.bak
rm backup-2024-01-*.bak  # Remove old backups
```

---

## Architecture

```
Internet
   ?
[Caddy :443] ? Automatic HTTPS with Let's Encrypt
   ?
[.NET App :8080] ? API + React SPA
   ?
[SQL Server :1433] ? Data persistence
```

| Component | Container | Port | Function |
|-----------|-----------|------|----------|
| Caddy | legalro-caddy | 80, 443 | Reverse proxy, auto-SSL |
| App | legalro-app | 8080 | .NET 8 backend + React frontend |
| Database | legalro-db | 1433 | SQL Server 2022 Express |

---

## Security Checklist

- [ ] Changed DB_PASSWORD to a strong, unique password
- [ ] Generated a new JWT_SECRET_KEY (64+ random characters)
- [ ] Firewall configured (only 22, 80, 443 open)
- [ ] SSH key authentication enabled (password auth disabled)
- [ ] Regular backups configured
- [ ] Domain DNS pointing to server IP
- [ ] HTTPS certificate auto-renewing
- [ ] Not exposing port 1433 externally (remove from docker-compose.yml if not needed)
- [ ] Running updates: `sudo apt update && sudo apt upgrade`

---

## Quick Reference Commands

```bash
# Check status
docker compose ps
docker compose logs -f

# Stop/Start
docker compose stop
docker compose start
docker compose restart

# Update app
cd /opt/legalro
git pull origin main
docker compose build --no-cache
docker compose up -d

# Database backup
docker compose exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" -C \
  -Q "BACKUP DATABASE [LegalRO_CaseManagement] TO DISK = '/var/opt/mssql/backup.bak'"

# View logs
docker compose logs app -f          # App only
docker compose logs db -f           # DB only
docker compose logs caddy -f        # Caddy only
docker compose logs -f              # All

# Health check
curl -k https://your-domain.com/health
```

---

## Support

For issues or questions:
1. Check logs: `docker compose logs -f`
2. Check Docker status: `docker compose ps`
3. Review error messages in application logs
4. Restart problematic service: `docker compose restart <service-name>`

