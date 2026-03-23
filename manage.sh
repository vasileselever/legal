#!/bin/bash
# ============================================================
# LegalRO Docker Management Script
# ============================================================
# Convenient commands for managing the deployed application
# Usage: bash manage.sh <command>
# ============================================================

APP_DIR="/opt/legalro"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Functions
show_usage() {
    echo -e "${BLUE}LegalRO Management Commands:${NC}"
    echo ""
    echo "Deployment:"
    echo "  $0 deploy        - Update and restart application"
    echo "  $0 rebuild       - Rebuild Docker image"
    echo ""
    echo "Status:"
    echo "  $0 status        - Show container status"
    echo "  $0 logs          - Show all logs (live)"
    echo "  $0 logs-app      - Show app logs only"
    echo "  $0 logs-db       - Show database logs only"
    echo "  $0 logs-caddy    - Show Caddy logs only"
    echo ""
    echo "Control:"
    echo "  $0 start         - Start all services"
    echo "  $0 stop          - Stop all services"
    echo "  $0 restart       - Restart all services"
    echo "  $0 restart-app   - Restart app only"
    echo ""
    echo "Database:"
    echo "  $0 backup        - Backup database"
    echo "  $0 shell         - Access database shell"
    echo ""
    echo "Maintenance:"
    echo "  $0 clean         - Clean up Docker images/containers"
    echo "  $0 test          - Test app health"
    echo ""
}

deploy() {
    echo -e "${YELLOW}Deploying application...${NC}"
    cd "$APP_DIR"
    
    echo -e "${YELLOW}[1/3] Pulling latest code...${NC}"
    git pull origin main || { echo -e "${RED}Git pull failed${NC}"; exit 1; }
    
    echo -e "${YELLOW}[2/3] Building Docker image...${NC}"
    docker compose build --no-cache || { echo -e "${RED}Build failed${NC}"; exit 1; }
    
    echo -e "${YELLOW}[3/3] Starting services...${NC}"
    docker compose up -d || { echo -e "${RED}Start failed${NC}"; exit 1; }
    
    sleep 10
    docker compose ps
    echo -e "${GREEN}? Deployment complete!${NC}"
}

rebuild() {
    echo -e "${YELLOW}Rebuilding Docker image (this may take a few minutes)...${NC}"
    cd "$APP_DIR"
    docker compose build --no-cache || { echo -e "${RED}Build failed${NC}"; exit 1; }
    docker compose up -d
    echo -e "${GREEN}? Rebuild complete!${NC}"
}

status() {
    echo -e "${BLUE}Container Status:${NC}"
    cd "$APP_DIR"
    docker compose ps
    echo ""
    echo -e "${BLUE}Disk Usage:${NC}"
    df -h | grep -E "Filesystem|/$"
    echo ""
    echo -e "${BLUE}Docker System Usage:${NC}"
    docker system df | head -5
}

logs_all() {
    cd "$APP_DIR"
    docker compose logs -f
}

logs_app() {
    cd "$APP_DIR"
    docker compose logs -f app
}

logs_db() {
    cd "$APP_DIR"
    docker compose logs -f db
}

logs_caddy() {
    cd "$APP_DIR"
    docker compose logs -f caddy
}

start_services() {
    echo -e "${YELLOW}Starting services...${NC}"
    cd "$APP_DIR"
    docker compose start
    sleep 5
    docker compose ps
    echo -e "${GREEN}? Services started${NC}"
}

stop_services() {
    echo -e "${YELLOW}Stopping services...${NC}"
    cd "$APP_DIR"
    docker compose stop
    sleep 2
    docker compose ps
    echo -e "${GREEN}? Services stopped${NC}"
}

restart_services() {
    echo -e "${YELLOW}Restarting all services...${NC}"
    cd "$APP_DIR"
    docker compose restart
    sleep 10
    docker compose ps
    echo -e "${GREEN}? Services restarted${NC}"
}

restart_app_only() {
    echo -e "${YELLOW}Restarting app service...${NC}"
    cd "$APP_DIR"
    docker compose restart app
    sleep 5
    docker compose ps
    echo -e "${GREEN}? App restarted${NC}"
}

backup_db() {
    echo -e "${YELLOW}Backing up database...${NC}"
    cd "$APP_DIR"
    
    # Load password from .env
    DB_PASSWORD=$(grep "^DB_PASSWORD=" .env | cut -d'=' -f2)
    
    docker compose exec -T db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" -C \
        -Q "BACKUP DATABASE [LegalRO_CaseManagement] TO DISK = '/var/opt/mssql/backup.bak'"
    
    BACKUP_FILE="backup-$(date +%Y%m%d-%H%M%S).bak"
    docker compose cp db:/var/opt/mssql/backup.bak "$BACKUP_FILE"
    
    echo -e "${GREEN}? Database backed up to: $BACKUP_FILE${NC}"
    ls -lh "$BACKUP_FILE"
}

db_shell() {
    echo -e "${YELLOW}Connecting to database shell...${NC}"
    cd "$APP_DIR"
    
    DB_PASSWORD=$(grep "^DB_PASSWORD=" .env | cut -d'=' -f2)
    
    echo "Available commands:"
    echo "  GO                          - Execute query"
    echo "  SELECT @@VERSION;           - Check SQL Server version"
    echo "  SELECT * FROM INFORMATION_SCHEMA.TABLES;  - List tables"
    echo "  EXIT                        - Exit shell"
    echo ""
    
    docker compose exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" -C
}

cleanup() {
    echo -e "${YELLOW}Cleaning up Docker images and containers...${NC}"
    docker system prune -a --volumes -f
    echo -e "${GREEN}? Cleanup complete${NC}"
    docker system df
}

test_health() {
    echo -e "${YELLOW}Testing application health...${NC}"
    
    DOMAIN=$(grep "^DOMAIN=" "$APP_DIR/.env" | cut -d'=' -f2)
    
    if [ -z "$DOMAIN" ]; then
        echo -e "${RED}Could not find DOMAIN in .env${NC}"
        exit 1
    fi
    
    echo -e "Testing: https://$DOMAIN/health"
    RESPONSE=$(curl -s -k "https://$DOMAIN/health" 2>&1)
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -k "https://$DOMAIN/health")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}? Health check passed (HTTP $HTTP_CODE)${NC}"
        echo "Response: $RESPONSE"
    else
        echo -e "${RED}? Health check failed (HTTP $HTTP_CODE)${NC}"
        echo "Response: $RESPONSE"
    fi
}

# Main
if [ $# -eq 0 ]; then
    show_usage
    exit 0
fi

COMMAND=$1

case $COMMAND in
    deploy)
        deploy
        ;;
    rebuild)
        rebuild
        ;;
    status)
        status
        ;;
    logs)
        logs_all
        ;;
    logs-app)
        logs_app
        ;;
    logs-db)
        logs_db
        ;;
    logs-caddy)
        logs_caddy
        ;;
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    restart-app)
        restart_app_only
        ;;
    backup)
        backup_db
        ;;
    shell)
        db_shell
        ;;
    clean)
        cleanup
        ;;
    test)
        test_health
        ;;
    *)
        echo -e "${RED}Unknown command: $COMMAND${NC}"
        show_usage
        exit 1
        ;;
esac

