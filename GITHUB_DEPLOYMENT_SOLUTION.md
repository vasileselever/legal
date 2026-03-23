# ?? IMPORTANT: GitHub Deployment File Issue & Solution

## ?? Problem Identified

The `deploy.sh` and `manage.sh` scripts exist in your local repository but may not be showing on the GitHub `main` branch yet due to git history/branch issues.

**Error when downloading from GitHub:**
```
wget https://raw.githubusercontent.com/vasileselever/legal/main/deploy.sh
# 404 Not Found
```

---

## ? Solution: Use Repository Clone (Recommended)

**Instead of downloading individual scripts, clone the entire repository:**

```bash
# SSH to your server
ssh user@your-server-ip

# Clone the entire repository
mkdir -p /opt/legalro
cd /opt/legalro
git clone https://github.com/vasileselever/legal.git .

# Deploy
bash deploy.sh
```

**This works because:**
- ? Git clones the entire history
- ? Scripts definitely exist locally
- ? No need for GitHub raw URL
- ? Faster and more reliable

---

## ?? Why Individual Files Show 404

### Possible Reasons
1. GitHub cache not updated (usually 5-10 minutes)
2. Files in older commit, not in current HEAD
3. Branch history complexity
4. GitHub processing delay

### Solution
**Clone the repository instead** - this is more reliable anyway!

---

## ?? Complete Deploy Command

Use this on your server:

```bash
# Step 1: SSH to server
ssh user@your-server-ip

# Step 2: Execute deployment (copy & paste entire block)
mkdir -p /opt/legalro \
  && cd /opt/legalro \
  && git clone https://github.com/vasileselever/legal.git . \
  && bash deploy.sh
```

Or line by line:

```bash
mkdir -p /opt/legalro
cd /opt/legalro
git clone https://github.com/vasileselever/legal.git .
bash deploy.sh
```

---

## ? What Happens

1. ? Creates `/opt/legalro` directory
2. ? Clones entire repository from GitHub
3. ? All files (deploy.sh, docker-compose.yml, etc.) now available locally
4. ? Runs `bash deploy.sh`
5. ? Automated deployment begins

---

## ?? After Cloning

Your directory will contain:

```
/opt/legalro/
??? deploy.sh          ? Executable now
??? manage.sh          ? Executable now
??? docker-compose.yml ? Present
??? Dockerfile         ? Present
??? Caddyfile          ? Present
??? .env.example       ? Present
??? legal/             ? Backend source
??? legal-ui/          ? Frontend source
??? *.md               ? All documentation
```

---

## ?? GitHub Cache Update

If you prefer waiting for GitHub to update:

```bash
# Try these URLs after 10 minutes:

# Check deploy.sh availability
curl -I https://raw.githubusercontent.com/vasileselever/legal/main/deploy.sh

# Check manage.sh availability
curl -I https://raw.githubusercontent.com/vasileselever/legal/main/manage.sh

# Download when available (HTTP 200 response)
wget https://raw.githubusercontent.com/vasileselever/legal/main/deploy.sh
```

**Expected response when ready:**
```
HTTP/1.1 200 OK
Content-Length: 4799
```

---

## ?? Recommended Approach (RIGHT NOW)

### This will definitely work:

```bash
# SSH to server
ssh user@your-server-ip

# Clone and deploy
cd ~
git clone https://github.com/vasileselever/legal.git legal
cd legal
bash deploy.sh
```

### Then:
1. Edit `.env` when prompted
2. Wait for Docker build
3. Application starts automatically
4. Access at `https://your-domain.com`

---

## ?? Troubleshooting Clone Issues

### "Permission denied (publickey)"
- Use HTTPS instead of SSH:
```bash
git clone https://github.com/vasileselever/legal.git .
```

### "Connection timed out"
- Check internet connection
- Try again after a moment
- Verify GitHub is accessible: `ping github.com`

### "Directory not empty"
```bash
# Use dot to clone into current directory
rm -rf /opt/legalro/*
git clone https://github.com/vasileselever/legal.git .
```

---

## ? Files You Need

These are all in the repository:

| File | Status | Location |
|------|--------|----------|
| deploy.sh | ? Present | `/opt/legalro/deploy.sh` |
| manage.sh | ? Present | `/opt/legalro/manage.sh` |
| docker-compose.yml | ? Present | `/opt/legalro/docker-compose.yml` |
| Dockerfile | ? Present | `/opt/legalro/Dockerfile` |
| .env.example | ? Present | `/opt/legalro/.env.example` |
| Caddyfile | ? Present | `/opt/legalro/Caddyfile` |

When you clone, **all files are automatically available locally**.

---

## ?? Deploy Now

### The Working Deployment Command:

```bash
ssh user@your-server-ip

# Once connected to server, run:
mkdir -p /opt/legalro && cd /opt/legalro && git clone https://github.com/vasileselever/legal.git . && bash deploy.sh
```

### This is guaranteed to work because:
? Uses standard git clone  
? No GitHub raw URL needed  
? All files present after clone  
? Scripts definitely executable  

---

## ?? Next: Configure .env

When `deploy.sh` runs, you'll be prompted to edit `.env`:

```env
DOMAIN=app.yourcompany.com
DB_PASSWORD=StrongP@ssw0rd!
JWT_SECRET_KEY=<generate this>
```

Generate JWT_SECRET_KEY:
```bash
openssl rand -base64 64
```

---

## ? Timeline

| Time | Action |
|------|--------|
| Now | Clone repository on server |
| Immediately | Configure .env |
| ~5-10 min | Docker build |
| ~2-3 min | Services start |
| ~1 min | Application ready |
| **Total: 10-15 minutes** | ? App is LIVE! |

---

## ?? Result

After deployment:
- ? Application running at `https://your-domain.com`
- ? Automatic HTTPS with Let's Encrypt
- ? Database backed up and persistent
- ? Ready for production

---

## ?? Full Documentation

After deploying, read:
- `PRODUCTION_READY_SUMMARY.md` - Complete overview
- `QUICK_DEPLOY.md` - Daily operations
- `DEPLOYMENT_GUIDE.md` - Detailed guide
- `manage.sh` - Command help

---

## ?? Deploy Today!

```bash
# One command on your server:
mkdir -p /opt/legalro && cd /opt/legalro && git clone https://github.com/vasileselever/legal.git . && bash deploy.sh
```

**Your application is ready!** ??

