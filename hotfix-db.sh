#!/bin/bash
# ============================================================
# LegalRO DB Hotfix Script
# Applies missing columns directly to the running SQL Server
# container without requiring a full rebuild.
# Usage: bash hotfix-db.sh
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_DIR="/opt/legalro"

# Load DB_PASSWORD from .env
if [ -f "$APP_DIR/.env" ]; then
    export $(grep -v '^#' "$APP_DIR/.env" | grep DB_PASSWORD | xargs)
else
    echo -e "${RED}? .env not found at $APP_DIR/.env${NC}"
    exit 1
fi

if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}? DB_PASSWORD not set in .env${NC}"
    exit 1
fi

echo -e "${YELLOW}Applying missing DB columns to legalro-db...${NC}"

docker exec legalro-db /opt/mssql-tools18/bin/sqlcmd \
    -S localhost -U sa -P "$DB_PASSWORD" -C -Q "
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA='legal'
      AND TABLE_NAME='TimeEntries'
      AND COLUMN_NAME='RejectionReason'
)
BEGIN
    ALTER TABLE [legal].[TimeEntries] ADD [RejectionReason] nvarchar(500) NULL;
    PRINT 'Column RejectionReason added.';
END
ELSE
BEGIN
    PRINT 'Column RejectionReason already exists.';
END
"

echo -e "${GREEN}? DB hotfix complete.${NC}"
echo ""
echo "Restarting app container to clear any cached errors..."
docker restart legalro-app
echo -e "${GREEN}? App restarted.${NC}"
