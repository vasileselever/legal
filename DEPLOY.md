# LegalRO - Server Deployment Guide

## Prerequisites

- A Linux server (Ubuntu 22.04+ recommended) with at least 2GB RAM and 20GB disk
- A domain name pointed to your server's IP address (A record)
- SSH access to the server

---

## 1. Server Setup

### Install Docker & Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Log out and back in for group changes
exit
# Re-SSH into the server

# Verify
docker --version
docker compose version
```

### Open Firewall Ports

```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP  (Caddy redirect)
sudo ufw allow 443   # HTTPS (Caddy auto-cert)
sudo ufw enable
```

---

## 2. Deploy the Application

### Copy Project to Server

From your local machine:

```bash
# Option A: git clone (if you have a git repo)
ssh user@your-server
git clone https://your-repo-url.git /opt/legalro
cd /opt/legalro

# Option B: rsync from local machine
rsync -avz --exclude='node_modules' --exclude='bin' --exclude='obj' --exclude='.git' \
  C:/Users/vasileselever/Desktop/projects/Juridic/legal/ user@your-server:/opt/legalro/
```

### Configure Environment

```bash
cd /opt/legalro

# Create .env from template
cp .env.example .env

# Edit with your values
nano .env
```


Fill in:
- `DOMAIN` = your actual domain (e.g., `app.legalro.ro`)
- `DB_PASSWORD` = a strong SQL Server password
- `JWT_SECRET_KEY` = generate with `openssl rand -base64 64`
- Azure OpenAI keys (optional)

### Build & Start

```bash
# Build and start all services
docker compose up -d --build

# Watch the logs
docker compose logs -f

# Check health
curl http://localhost:8080/health
```

---

## 3. Verify Deployment

```bash
# Check all containers are running
docker compose ps

# Expected output:
# legalro-db      running (healthy)
# legalro-app     running (healthy)
# legalro-caddy   running

# Check the app health endpoint
curl -k https://your-domain.com/health
# Should return: Healthy

# Check logs if something is wrong
docker compose logs app
docker compose logs db
docker compose logs caddy
```

Visit `https://your-domain.com` in your browser. Caddy automatically provisions a Let's Encrypt SSL certificate.

---

## 4. Common Operations

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f db

# Application file logs
docker compose exec app cat /app/logs/legalro-$(date +%Y%m%d).txt
```

### Update the Application

```bash
cd /opt/legalro

# Pull latest code (if using git)
git pull

# Rebuild and restart (zero-downtime with health checks)
docker compose up -d --build

# Or force full rebuild
docker compose build --no-cache
docker compose up -d
```

### Database Backup

```bash
# Backup
docker compose exec db /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "$DB_PASSWORD" -C \
  -Q "BACKUP DATABASE [LegalRO_CaseManagement] TO DISK = '/var/opt/mssql/backup.bak'"

# Copy backup to host
docker compose cp db:/var/opt/mssql/backup.bak ./backup-$(date +%Y%m%d).bak
```

### Restart Services

```bash
docker compose restart        # Restart all
docker compose restart app    # Restart just the app
```

### Stop Everything

```bash
docker compose down           # Stop containers (keeps data)
docker compose down -v        # Stop and DELETE all data (careful!)
```

---

## 5. SSL Certificate

Caddy handles SSL automatically via Let's Encrypt. Requirements:
- Port 80 and 443 must be open
- DNS A record must point to your server IP
- Domain must be set in `.env`

Certificates auto-renew. No manual action needed.

---

## 6. Architecture Overview

```
Internet
   |
   v
[Caddy :443] ---- auto HTTPS (Let's Encrypt)
   |
   v
[.NET App :8080] ---- serves API (/api/*) + React SPA (/*) 
   |
   v
[SQL Server :1433] ---- persistent volume
```

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| Caddy   | legalro-caddy | 80, 443 | Reverse proxy, auto-SSL |
| App     | legalro-app   | 8080    | .NET 8 API + React SPA |
| DB      | legalro-db    | 1433    | SQL Server 2022 Express |

---

## 7. Monitoring

### Health Check
```bash
curl https://your-domain.com/health
```

### Container Status
```bash
docker compose ps
docker stats
```

### Disk Usage
```bash
docker system df
docker volume ls
```

---

## 8. Security Checklist

- [ ] Changed `DB_PASSWORD` from default
- [ ] Generated strong `JWT_SECRET_KEY` (64+ chars)
- [ ] Firewall configured (only 22, 80, 443)
- [ ] SSH key authentication (disable password auth)
- [ ] Regular backups configured
- [ ] Domain DNS pointing to server
- [ ] Remove port 1433 from docker-compose.yml `db.ports` if external DB access not needed

---

## 9. Caddy Configuration

Caddyfile is generated automatically. To customize:

```bash
# Create or edit Caddyfile
nano Caddyfile
```

Example content:

```
DOMAIN {
    reverse_proxy app:8080

    encode gzip zstd

    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        Referrer-Policy strict-origin-when-cross-origin
        X-XSS-Protection "1; mode=block"
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        -Server
    }

    log {
        output file /data/access.log {
            roll_size 10mb
            roll_keep 5
        }
    }
}
```

Regenerate Caddy config:

```bash
# From PowerShell or CLI with .NET SDK
[System.IO.File]::WriteAllText("Caddyfile", "{`$DOMAIN} {`n    reverse_proxy app:8080`n`n    encode gzip zstd`n`n    header {`n        X-Content-Type-Options nosniff`n        X-Frame-Options DENY`n        Referrer-Policy strict-origin-when-cross-origin`n        X-XSS-Protection `"1; mode=block`"`n        Strict-Transport-Security `"max-age=31536000; includeSubDomains`"`n        -Server`n    }`n`n    log {`n        output file /data/access.log {`n            roll_size 10mb`n            roll_keep 5`n        }`n    }`n}`n", [System.Text.UTF8Encoding]::new($false))

git add Caddyfile
git commit -m "fix: remove leading whitespace from Caddyfile site address"
git push
