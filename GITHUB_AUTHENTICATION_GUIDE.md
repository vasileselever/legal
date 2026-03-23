# ?? GitHub Authentication Guide - Deploy Your App

## ?? The Problem

GitHub no longer accepts plain passwords for Git operations. You need one of these:

1. **Personal Access Token (PAT)** - Easiest for quick deployment
2. **SSH Keys** - Most secure, permanent
3. **Public Repository** - If your repo is public, no auth needed

---

## ? Solution 1: Personal Access Token (Recommended for Quick Deploy)

### Step 1: Create Personal Access Token

1. Go to: **https://github.com/settings/tokens**
2. Click **"Generate new token"** ? **"Generate new token (classic)"**
3. Fill in:
   - **Token name**: `deployment-token`
   - **Expiration**: 90 days (or longer)
   - **Scopes**: Check ? `repo` (full control)
4. Click **"Generate token"**
5. **Copy the token** (save it somewhere safe!)

**Token format**: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Use Token for Deployment

Run this on your server:

```bash
cd /opt
rm -rf legalro
mkdir legalro
cd legalro

# Replace TOKEN with your actual token
git clone https://vasileselever:TOKEN@github.com/vasileselever/legal.git .

# Now run deployment
bash deploy.sh
```

**Example:**
```bash
git clone https://vasileselever:ghp_1234567890abcdefghijklmnop@github.com/vasileselever/legal.git .
```

---

## ? Solution 2: SSH Keys (Most Secure)

### Step 1: Setup SSH Key on Server

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "deployment@server"
# Press Enter twice (no passphrase)

# Show public key
cat ~/.ssh/id_ed25519.pub
```

### Step 2: Add SSH Key to GitHub

1. Go to: **https://github.com/settings/keys**
2. Click **"New SSH key"**
3. Paste the public key
4. Click **"Add SSH key"**

### Step 3: Deploy with SSH

```bash
cd /opt
rm -rf legalro
mkdir legalro
cd legalro

# Clone with SSH (no password needed)
git clone git@github.com:vasileselever/legal.git .

# Run deployment
bash deploy.sh
```

---

## ? Solution 3: Public Repository (Easiest - No Auth)

If your repository is **public**, you can clone without authentication:

```bash
cd /opt
rm -rf legalro
mkdir legalro
cd legalro

# Clone without authentication
git clone https://github.com/vasileselever/legal.git .

# Run deployment
bash deploy.sh
```

---

## ?? Complete Deployment Commands

### With Personal Access Token

```bash
cd /opt
rm -rf legalro
mkdir legalro
cd legalro
git clone https://vasileselever:YOUR_TOKEN@github.com/vasileselever/legal.git .
bash deploy.sh
```

### With SSH Keys

```bash
cd /opt
rm -rf legalro
mkdir legalro
cd legalro
git clone git@github.com:vasileselever/legal.git .
bash deploy.sh
```

### Public Repo (No Auth)

```bash
cd /opt
rm -rf legalro
mkdir legalro
cd legalro
git clone https://github.com/vasileselever/legal.git .
bash deploy.sh
```

---

## ?? Quick Comparison

| Method | Setup Time | Security | Best For |
|--------|-----------|----------|----------|
| **PAT** | 5 min | Medium | Quick deployment |
| **SSH** | 10 min | High | Production |
| **Public** | 0 min | Low | Public repos only |

---

## ?? Which to Use?

- **Quick test deployment?** ? Use **PAT**
- **Production server?** ? Use **SSH Keys**
- **Public repository?** ? No auth needed

---

## ?? Troubleshooting

### "Invalid username or token"

**Solution**: Token is wrong or expired
- Check token at: https://github.com/settings/tokens
- Generate new token if expired
- Make sure you copied entire token correctly

### "Permission denied (publickey)"

**Solution**: SSH key not added to GitHub
- Go to: https://github.com/settings/keys
- Add your public key
- Make sure you're using SSH URL: `git@github.com:...`

### "fatal: could not read Username"

**Solution**: Missing token in URL
- Use: `https://vasileselever:TOKEN@github.com/vasileselever/legal.git`
- Not: `https://github.com/vasileselever/legal.git`

---

## ?? Step-by-Step: Quick Deploy with PAT

### 1. Create Token (1 minute)
- Go to: https://github.com/settings/tokens/new
- Name: `deployment-token`
- Scope: ? `repo`
- Generate & copy

### 2. Deploy (5 minutes)
```bash
# On server, run:
cd /opt
rm -rf legalro
mkdir legalro
cd legalro
git clone https://vasileselever:PASTE_TOKEN_HERE@github.com/vasileselever/legal.git .
bash deploy.sh
```

### 3. Configure
- Edit `.env` when prompted
- Wait for Docker build
- Done! ?

---

## ?? Deploy Now!

Choose your method:

**Option 1 - Personal Access Token:**
```bash
cd /opt && rm -rf legalro && mkdir legalro && cd legalro && git clone https://vasileselever:YOUR_TOKEN@github.com/vasileselever/legal.git . && bash deploy.sh
```

**Option 2 - SSH Keys:**
```bash
cd /opt && rm -rf legalro && mkdir legalro && cd legalro && git clone git@github.com:vasileselever/legal.git . && bash deploy.sh
```

**Option 3 - Public Repo:**
```bash
cd /opt && rm -rf legalro && mkdir legalro && cd legalro && git clone https://github.com/vasileselever/legal.git . && bash deploy.sh
```

---

**Questions?** See GitHub's authentication docs: https://docs.github.com/en/authentication

