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

echo -e "${YELLOW}Applying missing DB columns to legalro-db...${NC}"

docker exec legalro-db /opt/mssql-tools18/bin/sqlcmd \
    -S localhost -U sa -P "$DB_PASSWORD" -C -d "LegalRO_CaseManagement" -Q "
-- 1. TimeEntries.RejectionReason
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='TimeEntries' AND COLUMN_NAME='RejectionReason')
BEGIN
    DECLARE @s1 NVARCHAR(50); SELECT @s1=TABLE_SCHEMA FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='TimeEntries';
    EXEC sp_executesql N'ALTER TABLE [' + @s1 + '].[TimeEntries] ADD [RejectionReason] nvarchar(500) NULL';
    PRINT 'Added TimeEntries.RejectionReason';
END

-- 2. InvoiceLineItems.Cod
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='InvoiceLineItems' AND COLUMN_NAME='Cod')
BEGIN
    DECLARE @s2 NVARCHAR(50); SELECT @s2=TABLE_SCHEMA FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='InvoiceLineItems';
    EXEC sp_executesql N'ALTER TABLE [' + @s2 + '].[InvoiceLineItems] ADD [Cod] nvarchar(50) NULL';
    PRINT 'Added InvoiceLineItems.Cod';
END

-- 3. InvoiceLineItems.UM
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='InvoiceLineItems' AND COLUMN_NAME='UM')
BEGIN
    DECLARE @s3 NVARCHAR(50); SELECT @s3=TABLE_SCHEMA FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='InvoiceLineItems';
    EXEC sp_executesql N'ALTER TABLE [' + @s3 + '].[InvoiceLineItems] ADD [UM] nvarchar(20) NULL';
    PRINT 'Added InvoiceLineItems.UM';
END

-- 4. Firms: RegistrationCode, Bank, BankAccount
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Firms' AND COLUMN_NAME='RegistrationCode')
BEGIN
    DECLARE @s4 NVARCHAR(50); SELECT @s4=TABLE_SCHEMA FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='Firms';
    EXEC sp_executesql N'ALTER TABLE [' + @s4 + '].[Firms] ADD [RegistrationCode] nvarchar(50) NULL, [Bank] nvarchar(100) NULL, [BankAccount] nvarchar(50) NULL';
    PRINT 'Added Firms.RegistrationCode/Bank/BankAccount';
END

-- 5. Clients: RegistrationCode, Bank, BankAccount
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Clients' AND COLUMN_NAME='RegistrationCode')
BEGIN
    DECLARE @s5 NVARCHAR(50); SELECT @s5=TABLE_SCHEMA FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='Clients';
    EXEC sp_executesql N'ALTER TABLE [' + @s5 + '].[Clients] ADD [RegistrationCode] nvarchar(50) NULL, [Bank] nvarchar(100) NULL, [BankAccount] nvarchar(50) NULL';
    PRINT 'Added Clients.RegistrationCode/Bank/BankAccount';
END

-- 6. Leads: IsCorporate, Address, City, FiscalCode, RegistrationCode, Bank, BankAccount
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Leads' AND COLUMN_NAME='IsCorporate')
BEGIN
    DECLARE @s6 NVARCHAR(50); SELECT @s6=TABLE_SCHEMA FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='Leads';
    EXEC sp_executesql N'ALTER TABLE [' + @s6 + '].[Leads] ADD [IsCorporate] bit NOT NULL DEFAULT 0, [Address] nvarchar(300) NULL, [City] nvarchar(100) NULL, [FiscalCode] nvarchar(50) NULL, [RegistrationCode] nvarchar(50) NULL, [Bank] nvarchar(100) NULL, [BankAccount] nvarchar(50) NULL';
    PRINT 'Added Leads fiscal/address columns';
END
"

echo -e "${GREEN}? DB hotfix complete.${NC}"
echo ""
echo "Restarting app container to clear any cached errors..."
docker restart legalro-app
echo -e "${GREEN}? App restarted.${NC}"
