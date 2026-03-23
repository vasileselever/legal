# ? CORRECTED: Deploy to Server - Use This!

## ?? The Problem

The README has a placeholder `your-username` which doesn't work:

```bash
# ? WRONG - This won't work!
wget https://raw.githubusercontent.com/your-username/legal/main/deploy.sh
```

## ? The Solution

**Use your actual GitHub username: `vasileselever`**

```bash
# ? CORRECT - Use this!
wget https://raw.githubusercontent.com/vasileselever/legal/main/deploy.sh
```

---

## ?? Complete Corrected Deployment Command

### Option 1: Clone Repository (RECOMMENDED - Most Reliable)

```bash
# SSH to your server
ssh user@your-server-ip

# Then run this:
mkdir -p /opt/legalro && cd /opt/legalro && git clone https://github.com/vasileselever/legal.git . && bash deploy.sh
```

**This works because:**
- ? Uses your actual GitHub repository
- ? No placeholders
- ? Clones entire repo (all files available)
- ? Scripts definitely executable

### Option 2: Download Script Only

```bash
# If you want to download just the script:
wget https://raw.githubusercontent.com/vasileselever/legal/main/deploy.sh
chmod +x deploy.sh
bash deploy.sh
```

---

## ?? Step-by-Step Deployment

### Step 1: SSH to Your Server
```bash
ssh user@your-server-ip
# Replace with your actual server IP/hostname
```

### Step 2: Create Directory
```bash
mkdir -p /opt/legalro
cd /opt/legalro
```

### Step 3: Clone Repository
```bash
# Use YOUR actual GitHub username (vasileselever)
git clone https://github.com/vasileselever/legal.git .
```

### Step 4: Run Deployment
```bash
bash deploy.sh
```

### Step 5: Configure .env
When prompted, edit `.env` with:
```env
DOMAIN=your-domain.com
DB_PASSWORD=StrongP@ssw0rd!
JWT_SECRET_KEY=<generate: openssl rand -base64 64>
```

### Step 6: Wait for Build
- Docker build: 5-10 minutes
- Services start automatically
- Application ready!

### Step 7: Verify
```bash
docker compose ps
curl -k https://your-domain.com/health
```

---

## ?? Quick Reference

| Command | Purpose |
|---------|---------|
| `git clone https://github.com/vasileselever/legal.git .` | Clone your repo |
| `bash deploy.sh` | Start deployment |
| `docker compose ps` | Check services |
| `docker compose logs -f` | View logs |
| `docker compose restart app` | Restart app |

---

## ? Key Points

? **Your GitHub username is: `vasileselever`**  
? **Use this in all URLs:**
- Repository: `https://github.com/vasileselever/legal`
- Raw files: `https://raw.githubusercontent.com/vasileselever/legal/main/deploy.sh`

? **Clone method is most reliable** - use that!

---

## ?? Deploy Now!

```bash
# SSH to server and run:
mkdir -p /opt/legalro && cd /opt/legalro && git clone https://github.com/vasileselever/legal.git . && bash deploy.sh
```

---

**Your application is ready to deploy!** ??

