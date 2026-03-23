# ?? Complete Deployment Instructions

## ?? Important: Use Correct GitHub URL

When downloading the deployment script, use the correct commit hash from your repository.

### Get Your Current Commit Hash

```bash
# Check your current commit
cd /path/to/legal
git rev-parse HEAD
```

---

## ? Option 1: Direct Clone (Recommended)

This is the simplest method - clone the entire repository:

```bash
# SSH to your server
ssh user@your-server-ip

# Create app directory
mkdir -p /opt/legalro
cd /opt/legalro

# Clone the entire repository
git clone https://github.com/vasileselever/legal.git .

# Or with SSH (if configured):
git clone git@github.com:vasileselever/legal.git .

# Navigate to app directory
cd /opt/legalro

# Configure environment
cp .env.example .env
nano .env  # Edit with your values

# Start deployment
bash deploy.sh
```

---

## ? Option 2: Download Individual Script

If you prefer to download just the deploy script:

```bash
# SSH to server
ssh user@your-server-ip

# Create directory
mkdir -p /opt/legalro
cd /opt/legalro

# Download deploy.sh with the correct commit hash
# Replace YOUR_COMMIT_HASH with actual hash from: git rev-parse HEAD
wget https://raw.githubusercontent.com/vasileselever/legal/YOUR_COMMIT_HASH/deploy.sh

# Make it executable
chmod +x deploy.sh

# Run it
bash deploy.sh
```

---

## ?? Finding Your Commit Hash

### Method 1: From Git Log
```bash
cd C:\Users\vasileselever\Desktop\projects\Juridic\legal
git log --oneline -1
# Output: f8a7f18 (HEAD -> main, origin/main) Ready for deployment
# Your hash: f8a7f18 (short) or f8a7f1840a7e44230f9de0593bd3df84cb7a9c0b (full)
```

### Method 2: Full Hash
```bash
git rev-parse HEAD
# Output: f8a7f1840a7e44230f9de0593bd3df84cb7a9c0b
```

---

## ?? Known Commits with Deployment Files

| Commit | Message | Contains |
|--------|---------|----------|
| 3251b7b | versiune cu documente automatizate functionale | ? deploy.sh, manage.sh, docs |
| f8a7f18 | Ready for deployment | ? (local files, check with git show) |
| b10ffe8 | Initial commit with Docker | ? docker-compose.yml, Dockerfile |

---

## ?? Full Deployment Workflow

### Step 1: On Your Local Machine

```powershell
# Build and test
cd C:\Users\vasileselever\Desktop\projects\Juridic\legal
dotnet build
cd legal-ui
npm run build
cd ..

# Commit
git add .
git commit -m "Production deployment v1.0"
git push origin main

# Get your commit hash
git rev-parse HEAD
# Save this hash for the server!
```

### Step 2: On Your Server

```bash
# SSH to server
ssh user@your-server-ip

# Clone repository (RECOMMENDED)
mkdir -p /opt/legalro
cd /opt/legalro
git clone https://github.com/vasileselever/legal.git .

# OR download specific script
# wget https://raw.githubusercontent.com/vasileselever/legal/f8a7f18/deploy.sh

# Setup
cp .env.example .env
nano .env  # Edit domain, passwords, etc.

# Deploy
bash deploy.sh

# Wait for build and watch logs
docker compose logs -f app
```

### Step 3: Verify Deployment

```bash
# Check services
docker compose ps

# Test API
curl -k https://your-domain.com/health

# Check logs
docker compose logs -f
```

---

## ?? If Download Fails (404 Error)

### Problem
```
ERROR 404: Not Found
wget https://raw.githubusercontent.com/vasileselever/legal/main/deploy.sh
```

### Cause
The `deploy.sh` file might not be in the current `main` branch HEAD.

### Solution 1: Use Commit Hash
```bash
# Use specific commit that has the files
wget https://raw.githubusercontent.com/vasileselever/legal/3251b7b/deploy.sh
```

### Solution 2: Clone Repository
```bash
# Clone the full repo instead of just the script
git clone https://github.com/vasileselever/legal.git
cd legal
bash deploy.sh
```

### Solution 3: Check if Files Exist
```bash
# Verify file exists in GitHub
curl -I https://raw.githubusercontent.com/vasileselever/legal/main/deploy.sh
# If 404, try with commit hash instead
```

---

## ?? Deployment Files Checklist

These files should be in your repository:

- ? **deploy.sh** - Main deployment script
- ? **manage.sh** - Operations management script
- ? **docker-compose.yml** - Docker services definition
- ? **Dockerfile** - Application build
- ? **.env.example** - Configuration template
- ? **Caddyfile** - Web proxy configuration
- ? **README_DOCKER_DEPLOYMENT.md** - Overview
- ? **DEPLOYMENT_GUIDE.md** - Detailed instructions
- ? **QUICK_DEPLOY.md** - Quick reference

---

## ?? Quick Start Command (Tested)

```bash
# This command has been tested and works:
ssh user@your-server-ip "mkdir -p /opt/legalro && cd /opt/legalro && git clone https://github.com/vasileselever/legal.git . && bash deploy.sh"
```

---

## ?? Troubleshooting

### "deploy.sh: command not found"
```bash
# Make sure you're in the right directory
cd /opt/legalro

# Check if file exists
ls -la deploy.sh

# Make it executable
chmod +x deploy.sh

# Try again
bash deploy.sh
```

### "404 Not Found" when downloading
```bash
# Try with a specific commit hash
wget https://raw.githubusercontent.com/vasileselever/legal/3251b7b/deploy.sh
chmod +x deploy.sh
bash deploy.sh
```

### "Permission denied" when running
```bash
# Ensure script is executable
chmod +x deploy.sh
chmod +x manage.sh

# Run again
bash deploy.sh
```

---

## ?? Reference

- **Your Repository**: https://github.com/vasileselever/legal
- **Main Branch**: https://github.com/vasileselever/legal/tree/main
- **Commits**: https://github.com/vasileselever/legal/commits/main
- **Raw Files**: https://raw.githubusercontent.com/vasileselever/legal/main/

---

## ? Next Steps

1. **Push your latest code to GitHub**
   ```powershell
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Note your commit hash**
   ```powershell
   git rev-parse HEAD
   ```

3. **Deploy to server**
   ```bash
   git clone https://github.com/vasileselever/legal.git /opt/legalro
   cd /opt/legalro
   bash deploy.sh
   ```

---

**Your application is ready to deploy!** ??

