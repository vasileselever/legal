#!/bin/bash
# ============================================================
# LegalRO Docker Deployment Script
# ============================================================
# Quick automated deployment for Ubuntu 22.04+
# Usage: bash deploy.sh
# ============================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  LegalRO Docker Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Step 1: Check prerequisites
echo -e "${YELLOW}[1/6] Checking prerequisites...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}? Docker not found. Installing...${NC}"
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo -e "${GREEN}? Docker installed${NC}"
else
    echo -e "${GREEN}? Docker found: $(docker --version)${NC}"
fi

if ! command -v git &> /dev/null; then
    echo -e "${RED}? Git not found. Installing...${NC}"
    sudo apt install -y git
    echo -e "${GREEN}? Git installed${NC}"
else
    echo -e "${GREEN}? Git found: $(git --version)${NC}"
fi

echo ""

# Step 2: Setup directory
echo -e "${YELLOW}[2/6] Setting up application directory...${NC}"
APP_DIR="/opt/legalro"
if [ -d "$APP_DIR" ]; then
    echo "Directory $APP_DIR already exists. Do you want to:"
    echo "1) Update existing deployment (git pull)"
    echo "2) Fresh deployment (backup old, clone new)"
    read -p "Choose (1 or 2): " choice
    
    if [ "$choice" = "2" ]; then
        sudo mv "$APP_DIR" "$APP_DIR.backup.$(date +%Y%m%d)"
        echo -e "${GREEN}? Old deployment backed up to $APP_DIR.backup.$(date +%Y%m%d)${NC}"
    fi
else
    sudo mkdir -p "$APP_DIR"
fi

if [ ! -f "$APP_DIR/.git/config" ]; then
    sudo chown $USER:$USER "$APP_DIR"
    echo "Enter your Git repository URL:"
    echo "  - HTTPS with PAT: https://USERNAME:TOKEN@github.com/vasileselever/legal.git"
    echo "  - HTTPS without auth: https://github.com/vasileselever/legal.git (if public)"
    echo "  - SSH: git@github.com:vasileselever/legal.git (if SSH key configured)"
    echo ""
    read -p "URL: " GIT_URL
    cd "$APP_DIR"
    
    # Try to clone with better error handling
    if ! git clone "$GIT_URL" .; then
        echo -e "${RED}? Clone failed. Authentication issue?${NC}"
        echo ""
        echo "Solutions:"
        echo "1. Generate GitHub Personal Access Token:"
        echo "   - Go to: https://github.com/settings/tokens"
        echo "   - Create token with 'repo' scope"
        echo "   - Use: https://vasileselever:TOKEN@github.com/vasileselever/legal.git"
        echo ""
        echo "2. Use SSH (if configured):"
        echo "   - Use: git@github.com:vasileselever/legal.git"
        echo ""
        echo "3. If repo is public, try without auth:"
        echo "   - Use: https://github.com/vasileselever/legal.git"
        echo ""
        exit 1
    fi
    echo -e "${GREEN}? Repository cloned${NC}"
else
    cd "$APP_DIR"
    echo -e "${GREEN}? Using existing repository${NC}"
fi

echo ""

# Step 3: Environment setup
echo -e "${YELLOW}[3/6] Setting up environment...${NC}"
cd "$APP_DIR"

if [ ! -f ".env" ]; then
    sudo cp .env.example .env
    echo -e "${YELLOW}??  Created .env from template. You must edit it!${NC}"
    echo "Edit with: nano $APP_DIR/.env"
    echo ""
    echo "Required values to change:"
    echo "  - DOMAIN: your-domain.com"
    echo "  - DB_PASSWORD: Strong password (8+ chars, mixed case, number, special)"
    echo "  - JWT_SECRET_KEY: Run: openssl rand -base64 64"
    echo ""
    read -p "Press Enter after editing .env file: "
else
    echo -e "${GREEN}? .env file already exists${NC}"
fi

sudo chown $USER:$USER .env

echo ""

# Step 4: Setup firewall
echo -e "${YELLOW}[4/6] Configuring firewall...${NC}"
sudo ufw --force enable 2>/dev/null || true
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo -e "${GREEN}? Firewall configured (SSH, HTTP, HTTPS)${NC}"

echo ""

# Step 5: Build Docker image
echo -e "${YELLOW}[5/6] Building Docker image...${NC}"
echo "This may take 5-10 minutes on first build..."
cd "$APP_DIR"
docker compose build --no-cache

if [ $? -eq 0 ]; then
    echo -e "${GREEN}? Docker image built successfully${NC}"
else
    echo -e "${RED}? Docker build failed. Check output above.${NC}"
    exit 1
fi

echo ""

# Step 6: Start services
echo -e "${YELLOW}[6/6] Starting services...${NC}"
docker compose down 2>/dev/null || true
docker compose up -d

echo ""
echo "Waiting for services to start (30-60 seconds)..."
sleep 10

# Check health
if docker compose ps | grep -q "healthy"; then
    echo -e "${GREEN}? Services started successfully!${NC}"
else
    echo -e "${YELLOW}??  Services starting, please wait...${NC}"
    sleep 30
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Get domain from .env
DOMAIN=$(grep "^DOMAIN=" .env | cut -d'=' -f2)

echo "Next steps:"
echo "1. Access your app: https://$DOMAIN"
echo "2. Check status: docker compose ps"
echo "3. View logs: docker compose logs -f"
echo ""
echo "Useful commands:"
echo "  docker compose logs app -f          # View app logs"
echo "  docker compose logs db -f           # View database logs"
echo "  docker compose ps                   # Check service status"
echo "  curl -k https://$DOMAIN/health      # Test API health"
echo ""

