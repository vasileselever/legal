# ?? Docker Deployment - Complete Documentation Index

## ?? Start Here

**New to this deployment system?** Start with one of these:

### For Visual Studio Developers
?? **Read first:** [README_DOCKER_DEPLOYMENT.md](README_DOCKER_DEPLOYMENT.md) (5 min overview)  
?? **Then read:** [QUICK_DEPLOY.md](QUICK_DEPLOY.md) (checklist format)

### For System Administrators/DevOps
?? **Read first:** [DOCKER_DEPLOYMENT_OVERVIEW.md](DOCKER_DEPLOYMENT_OVERVIEW.md) (technical overview)  
?? **Then read:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) (detailed instructions)

---

## ?? Documentation Files

### Overview & Getting Started
| File | Audience | Time | Purpose |
|------|----------|------|---------|
| [README_DOCKER_DEPLOYMENT.md](README_DOCKER_DEPLOYMENT.md) | Everyone | 5 min | High-level overview, next steps |
| [DOCKER_DEPLOYMENT_OVERVIEW.md](DOCKER_DEPLOYMENT_OVERVIEW.md) | Technical | 10 min | Architecture, tech stack, file structure |
| [DOCKER_DEPLOYMENT_DIAGRAMS.md](DOCKER_DEPLOYMENT_DIAGRAMS.md) | Visual learners | 10 min | Flow diagrams, network architecture |

### Practical Guides
| File | Audience | Time | Purpose |
|------|----------|------|---------|
| [QUICK_DEPLOY.md](QUICK_DEPLOY.md) | VS Developers | 15 min | Checklist-based quick reference |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Detailed | 30 min | Step-by-step with troubleshooting |

### Automation Scripts
| File | Audience | Purpose |
|------|----------|---------|
| [deploy.sh](deploy.sh) | Server setup | Automated deployment (first time setup) |
| [manage.sh](manage.sh) | Daily ops | Convenient management commands |

---

## ?? Common Workflows

### ?? First-Time Setup (30 minutes)

1. **Read:** README_DOCKER_DEPLOYMENT.md (5 min)
2. **Prepare locally:**
   ```powershell
   git add . && git commit -m "Ready for deployment" && git push
   ```
3. **Setup server:**
   ```bash
   bash deploy.sh
   ```
4. **Verify:** `curl -k https://your-domain/health`

### ?? Deploy Updates (5 minutes)

1. **Make changes in VS** and test locally
2. **Commit and push:**
   ```powershell
   git add . && git commit -m "Feature X" && git push origin main
   ```
3. **On server:**
   ```bash
   cd /opt/legalro
   git pull && docker compose build --no-cache && docker compose up -d
   ```

### ?? Check Status (1 minute)

```bash
docker compose ps
docker compose logs -f
```

### ?? Restart Services (1 minute)

```bash
docker compose restart
docker compose logs -f
```

### ?? Backup Database (2 minutes)

```bash
docker compose exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" -C \
  -Q "BACKUP DATABASE [LegalRO_CaseManagement] TO DISK = '/var/opt/mssql/backup.bak'"
docker compose cp db:/var/opt/mssql/backup.bak ./backup-$(date +%Y%m%d).bak
```

---

## ?? Find Information By Topic

### ??? Architecture & Design
- **Overall architecture:** DOCKER_DEPLOYMENT_OVERVIEW.md ? "Useful Information"
- **Network flow:** DOCKER_DEPLOYMENT_DIAGRAMS.md ? "Network Flow Diagram"
- **Service definitions:** docker-compose.yml
- **Build process:** Dockerfile

### ?? Deployment
- **First deployment:** DEPLOYMENT_GUIDE.md ? "Deploy to Server"
- **Quick deployment:** QUICK_DEPLOY.md ? "Perform Deployment"
- **Automated setup:** deploy.sh (run on server)
- **Update deployments:** QUICK_DEPLOY.md ? "Subsequent Deployments"

### ?? Operations
- **Check status:** QUICK_DEPLOY.md ? "Status" or run `docker compose ps`
- **View logs:** QUICK_DEPLOY.md ? "Common Operations" 
- **Management commands:** manage.sh or QUICK_DEPLOY.md ? "Quick Command Reference"
- **Database:** DEPLOYMENT_GUIDE.md ? "Database Backups"

### ?? Troubleshooting
- **Connection issues:** QUICK_DEPLOY.md ? "Troubleshooting"
- **Database problems:** DEPLOYMENT_GUIDE.md ? "Troubleshooting"
- **Build failures:** DEPLOYMENT_GUIDE.md ? "Server Setup"
- **Detailed troubleshooting:** DEPLOYMENT_GUIDE.md ? "Troubleshooting" section

### ?? Security
- **Checklist:** README_DOCKER_DEPLOYMENT.md ? "Security Checklist"
- **Best practices:** DEPLOYMENT_GUIDE.md ? "Security Checklist"
- **Configuration:** .env file (template: .env.example)

---

## ?? Quick Reference Commands

### Essential
```bash
# Check status
docker compose ps

# View logs
docker compose logs -f

# Deploy update
cd /opt/legalro && git pull && docker compose build --no-cache && docker compose up -d

# Restart
docker compose restart
```

### Management (using manage.sh)
```bash
bash manage.sh status          # Check status
bash manage.sh logs            # View logs
bash manage.sh deploy          # Pull and redeploy
bash manage.sh restart         # Restart services
bash manage.sh backup          # Backup database
bash manage.sh test            # Health check
```

### Database
```bash
# Backup
docker compose exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" -C \
  -Q "BACKUP DATABASE [LegalRO_CaseManagement] TO DISK = '/var/opt/mssql/backup.bak'"

# Access shell
docker compose exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" -C
```

### Control
```bash
docker compose stop            # Stop all
docker compose start           # Start all
docker compose down            # Stop and remove (keeps data)
docker compose down -v         # Stop and remove (includes data!)
```

---

## ?? Document Decision Tree

```
Do you have 5 minutes?
?? YES ? Read: README_DOCKER_DEPLOYMENT.md
?? NO ? Later!

Are you a VS developer or sysadmin?
?? VS Developer
?  ?? Want quick checklist? ? QUICK_DEPLOY.md
?  ?? Want detailed steps? ? DEPLOYMENT_GUIDE.md
?? Sysadmin/DevOps
   ?? Want tech overview? ? DOCKER_DEPLOYMENT_OVERVIEW.md
   ?? Want detailed steps? ? DEPLOYMENT_GUIDE.md

Do you like diagrams?
?? YES ? DOCKER_DEPLOYMENT_DIAGRAMS.md
?? Prefer text ? DEPLOYMENT_GUIDE.md

Having a problem?
?? Connection issues? ? DEPLOYMENT_GUIDE.md ? Troubleshooting
?? Database issues? ? DEPLOYMENT_GUIDE.md ? Troubleshooting
?? Need commands? ? QUICK_DEPLOY.md ? "Quick Command Reference"
?? Need advanced help? ? DEPLOYMENT_GUIDE.md ? "Troubleshooting"
```

---

## ? Pre-Deployment Checklist

Before you deploy:

### Local Machine
- [ ] Read README_DOCKER_DEPLOYMENT.md
- [ ] Build solution in Visual Studio (Build ? Build Solution)
- [ ] Test: `npm run build` in legal-ui folder
- [ ] All changes committed: `git status` is clean
- [ ] Pushed to main: `git push origin main`

### Server Preparation
- [ ] Ubuntu 22.04+ installed
- [ ] 2GB+ RAM available
- [ ] 20GB+ free disk space
- [ ] SSH access working
- [ ] Static IP or DNS domain configured
- [ ] Firewall accessible for ports 22, 80, 443

### Pre-Deployment Configuration
- [ ] Know your domain name (app.company.com)
- [ ] Generated strong DB password (8+ chars, mixed case, number, special)
- [ ] Generated JWT_SECRET_KEY: `openssl rand -base64 64`
- [ ] .env file ready to edit

---

## ?? Support & Troubleshooting

### Getting Help
1. **Check the logs first:** `docker compose logs -f`
2. **Check status:** `docker compose ps`
3. **Find your issue in:** DEPLOYMENT_GUIDE.md ? Troubleshooting
4. **Or search:** QUICK_DEPLOY.md ? Troubleshooting

### Most Common Issues
| Issue | Solution |
|-------|----------|
| Can't connect to domain | Check DNS, firewall, Caddy logs |
| Database won't start | Wrong password format, check logs |
| App crashes | Check if database is healthy first |
| Out of disk | Run: `docker system prune -a --volumes` |

### Where to Find Solutions
- **"Connection refused"** ? See: DEPLOYMENT_GUIDE.md or QUICK_DEPLOY.md
- **"Database errors"** ? See: DEPLOYMENT_GUIDE.md ? Troubleshooting
- **"Build failed"** ? See: DEPLOYMENT_GUIDE.md ? Server Setup
- **"Command not found"** ? See: README_DOCKER_DEPLOYMENT.md ? Quick Reference

---

## ?? Learning Path

### Beginner (No Docker experience)
1. README_DOCKER_DEPLOYMENT.md (overview)
2. DOCKER_DEPLOYMENT_DIAGRAMS.md (visual understanding)
3. QUICK_DEPLOY.md (practical checklist)
4. Run deploy.sh (automated setup)

### Intermediate (Some Docker knowledge)
1. DOCKER_DEPLOYMENT_OVERVIEW.md (architecture)
2. DEPLOYMENT_GUIDE.md (detailed steps)
3. docker-compose.yml and Dockerfile (configuration)
4. manage.sh (operations)

### Advanced (DevOps/SRE)
1. Source code review
2. Dockerfile optimization
3. docker-compose.yml scaling
4. CI/CD pipeline integration

---

## ?? Files Included

### Documentation
```
README_DOCKER_DEPLOYMENT.md    ? START HERE
DOCKER_DEPLOYMENT_OVERVIEW.md
DOCKER_DEPLOYMENT_DIAGRAMS.md
DEPLOYMENT_GUIDE.md
QUICK_DEPLOY.md
```

### Scripts
```
deploy.sh                      ? Run on server first time
manage.sh                      ? Daily management
```

### Configuration
```
docker-compose.yml             ? Services definition
Dockerfile                     ? Build instructions
Caddyfile                      ? Web proxy config
.env.example                   ? Configuration template
```

---

## ?? Next Steps

### Right Now (Choose One)

**Option A: Quick Start (5 minutes)**
```bash
1. Open: README_DOCKER_DEPLOYMENT.md
2. Quick read
3. Done!
```

**Option B: Detailed Walkthrough (30 minutes)**
```bash
1. Open: DEPLOYMENT_GUIDE.md
2. Follow along step-by-step
3. Deploy!
```

**Option C: Visual Learning (15 minutes)**
```bash
1. Open: DOCKER_DEPLOYMENT_DIAGRAMS.md
2. Understand architecture
3. Read: QUICK_DEPLOY.md
```

### Then: Deploy!
```bash
# Server setup (one time)
bash deploy.sh

# Or manual setup
# Follow: DEPLOYMENT_GUIDE.md ? "Server Setup"
```

### Finally: Verify
```bash
docker compose ps
docker compose logs -f
curl -k https://your-domain/health
```

---

## ?? Quick Links

- **Overview:** README_DOCKER_DEPLOYMENT.md
- **Quick Reference:** QUICK_DEPLOY.md
- **Full Guide:** DEPLOYMENT_GUIDE.md
- **Technical Details:** DOCKER_DEPLOYMENT_OVERVIEW.md
- **Visual Guides:** DOCKER_DEPLOYMENT_DIAGRAMS.md
- **Automated Setup:** deploy.sh
- **Daily Commands:** manage.sh
- **Docker Config:** docker-compose.yml
- **Build Instructions:** Dockerfile
- **Web Config:** Caddyfile

---

**Ready? Start with README_DOCKER_DEPLOYMENT.md! ??**

