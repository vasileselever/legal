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
    DB_PASSWORD=$(grep -v '^#' "$APP_DIR/.env" | grep '^DB_PASSWORD=' | cut -d'=' -f2- | tr -d '"' | tr -d "'")
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
    -S localhost -U sa -P "${DB_PASSWORD}" -C -d "LegalRO_CaseManagement" -Q "
-- 1. TimeEntries.RejectionReason
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='legal' AND TABLE_NAME='TimeEntries' AND COLUMN_NAME='RejectionReason')
BEGIN
    ALTER TABLE [legal].[TimeEntries] ADD [RejectionReason] nvarchar(500) NULL;
    PRINT 'Added TimeEntries.RejectionReason';
END

-- 2. InvoiceLineItems.Cod
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='legal' AND TABLE_NAME='InvoiceLineItems' AND COLUMN_NAME='Cod')
BEGIN
    ALTER TABLE [legal].[InvoiceLineItems] ADD [Cod] nvarchar(50) NULL;
    PRINT 'Added InvoiceLineItems.Cod';
END

-- 3. InvoiceLineItems.UM
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='legal' AND TABLE_NAME='InvoiceLineItems' AND COLUMN_NAME='UM')
BEGIN
    ALTER TABLE [legal].[InvoiceLineItems] ADD [UM] nvarchar(20) NULL;
    PRINT 'Added InvoiceLineItems.UM';
END

-- 4. Firms: RegistrationCode, Bank, BankAccount
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='legal' AND TABLE_NAME='Firms' AND COLUMN_NAME='RegistrationCode')
BEGIN
    ALTER TABLE [legal].[Firms] ADD [RegistrationCode] nvarchar(50) NULL;
    PRINT 'Added Firms.RegistrationCode';
END
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='legal' AND TABLE_NAME='Firms' AND COLUMN_NAME='Bank')
BEGIN
    ALTER TABLE [legal].[Firms] ADD [Bank] nvarchar(100) NULL;
    PRINT 'Added Firms.Bank';
END
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='legal' AND TABLE_NAME='Firms' AND COLUMN_NAME='BankAccount')
BEGIN
    ALTER TABLE [legal].[Firms] ADD [BankAccount] nvarchar(50) NULL;
    PRINT 'Added Firms.BankAccount';
END

-- 5. Clients: RegistrationCode, Bank, BankAccount
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='legal' AND TABLE_NAME='Clients' AND COLUMN_NAME='RegistrationCode')
BEGIN
    ALTER TABLE [legal].[Clients] ADD [RegistrationCode] nvarchar(50) NULL;
    PRINT 'Added Clients.RegistrationCode';
END
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='legal' AND TABLE_NAME='Clients' AND COLUMN_NAME='Bank')
BEGIN
    ALTER TABLE [legal].[Clients] ADD [Bank] nvarchar(100) NULL;
    PRINT 'Added Clients.Bank';
END
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='legal' AND TABLE_NAME='Clients' AND COLUMN_NAME='BankAccount')
BEGIN
    ALTER TABLE [legal].[Clients] ADD [BankAccount] nvarchar(50) NULL;
    PRINT 'Added Clients.BankAccount';
END

-- 6. Leads: IsCorporate, Address, City, FiscalCode, RegistrationCode, Bank, BankAccount
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='legal' AND TABLE_NAME='Leads' AND COLUMN_NAME='IsCorporate')
BEGIN
    ALTER TABLE [legal].[Leads] ADD [IsCorporate] bit NOT NULL DEFAULT 0;
    PRINT 'Added Leads.IsCorporate';
END
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='legal' AND TABLE_NAME='Leads' AND COLUMN_NAME='Address')
BEGIN
    ALTER TABLE [legal].[Leads] ADD [Address] nvarchar(300) NULL;
    PRINT 'Added Leads.Address';
END
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='legal' AND TABLE_NAME='Leads' AND COLUMN_NAME='City')
BEGIN
    ALTER TABLE [legal].[Leads] ADD [City] nvarchar(100) NULL;
    PRINT 'Added Leads.City';
END
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='legal' AND TABLE_NAME='Leads' AND COLUMN_NAME='FiscalCode')
BEGIN
    ALTER TABLE [legal].[Leads] ADD [FiscalCode] nvarchar(50) NULL;
    PRINT 'Added Leads.FiscalCode';
END
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='legal' AND TABLE_NAME='Leads' AND COLUMN_NAME='RegistrationCode')
BEGIN
    ALTER TABLE [legal].[Leads] ADD [RegistrationCode] nvarchar(50) NULL;
    PRINT 'Added Leads.RegistrationCode';
END
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='legal' AND TABLE_NAME='Leads' AND COLUMN_NAME='Bank')
BEGIN
    ALTER TABLE [legal].[Leads] ADD [Bank] nvarchar(100) NULL;
    PRINT 'Added Leads.Bank';
END
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='legal' AND TABLE_NAME='Leads' AND COLUMN_NAME='BankAccount')
BEGIN
    ALTER TABLE [legal].[Leads] ADD [BankAccount] nvarchar(50) NULL;
    PRINT 'Added Leads.BankAccount';
END

-- 7. Register migrations in __EFMigrationsHistory so EF does not re-run them
IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20260408073212_AddFirmClientBankRegistration')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20260408073212_AddFirmClientBankRegistration', '8.0.0');

IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20260408081554_AddLeadFiscalFields')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20260408081554_AddLeadFiscalFields', '8.0.0');

-- 8. LeadDocuments.GeneratedDocumentId (for attaching generated docs to leads)
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='legal' AND TABLE_NAME='LeadDocuments' AND COLUMN_NAME='GeneratedDocumentId')
BEGIN
    ALTER TABLE [legal].[LeadDocuments] ADD [GeneratedDocumentId] uniqueidentifier NULL;
    PRINT 'Added LeadDocuments.GeneratedDocumentId';
END
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_LeadDocuments_GeneratedDocumentId' AND object_id = OBJECT_ID('legal.LeadDocuments'))
BEGIN
    CREATE INDEX [IX_LeadDocuments_GeneratedDocumentId] ON [legal].[LeadDocuments] ([GeneratedDocumentId]);
    PRINT 'Created IX_LeadDocuments_GeneratedDocumentId';
END
IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20260404104103_AddGeneratedDocumentIdToLeadDocument')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20260404104103_AddGeneratedDocumentIdToLeadDocument', '8.0.0');

-- 9. Documents.GeneratedDocumentId (for attaching generated docs to cases/dosare)
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='legal' AND TABLE_NAME='Documents' AND COLUMN_NAME='GeneratedDocumentId')
BEGIN
    ALTER TABLE [legal].[Documents] ADD [GeneratedDocumentId] uniqueidentifier NULL;
    PRINT 'Added Documents.GeneratedDocumentId';
END
IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20260421134404_AddGeneratedDocumentIdToDocument')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20260421134404_AddGeneratedDocumentIdToDocument', '8.0.0');
"

echo -e "${GREEN}? DB hotfix complete.${NC}"
echo ""
echo "Restarting app container to clear any cached errors..."
docker restart legalro-app
echo -e "${GREEN}? App restarted.${NC}"
