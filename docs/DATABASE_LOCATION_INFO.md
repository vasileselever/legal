# SQL Server Database Location - LegalRO Case Management

## ?? Where Your Database Was Created

Based on your connection string in `appsettings.json`, your SQL Server database was created here:

---

## Database Details

### **Connection String:**
```
Server=(localdb)\mssqllocaldb;
Database=LegalRO_CaseManagement;
Trusted_Connection=true;
MultipleActiveResultSets=true;
TrustServerCertificate=true
```

### **Database Server:**
- **Type:** SQL Server LocalDB
- **Instance:** `(localdb)\mssqllocaldb`
- **Database Name:** `LegalRO_CaseManagement`
- **Schema:** `legal` (all tables are in this schema)

---

## ??? SQL Server LocalDB Explained

### What is LocalDB?
**SQL Server LocalDB** is a lightweight version of SQL Server Express that:
- ? Runs on-demand (starts when your app connects)
- ? Perfect for development and testing
- ? No separate SQL Server installation needed
- ? Uses minimal system resources
- ? Included with Visual Studio 2022

### Where is the Database File Physically Located?

SQL Server LocalDB stores database files in your user profile:

**Default Location:**
```
C:\Users\vasileselever\AppData\Local\Microsoft\Microsoft SQL Server Local DB\Instances\mssqllocaldb\
```

**Database Files:**
- `LegalRO_CaseManagement.mdf` - Primary data file
- `LegalRO_CaseManagement_log.ldf` - Transaction log file

---

## ?? How to Access Your Database

### Method 1: SQL Server Management Studio (SSMS)

1. **Download SSMS** (if not installed):
   - https://aka.ms/ssmsfullsetup

2. **Connect to LocalDB:**
   - Open SSMS
   - Server name: `(localdb)\mssqllocaldb`
   - Authentication: Windows Authentication
   - Click "Connect"

3. **Navigate to Your Database:**
   - Expand "Databases"
   - Find "LegalRO_CaseManagement"
   - Expand "Tables"
   - You should see the `legal` schema with all tables

### Method 2: Visual Studio 2022

1. **Open SQL Server Object Explorer:**
   - View ? SQL Server Object Explorer (or Ctrl+\, Ctrl+S)

2. **Expand SQL Server:**
   - SQL Server ? (localdb)\mssqllocaldb
   - Databases ? LegalRO_CaseManagement
   - Tables ? legal schema

3. **View Tables:**
   - Right-click any table ? "View Data" to see records

### Method 3: Command Line (sqlcmd)

```cmd
# Connect to LocalDB
sqlcmd -S (localdb)\mssqllocaldb -d LegalRO_CaseManagement

# List all tables in legal schema
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'legal'
ORDER BY TABLE_NAME;
GO

# Exit
EXIT
```

---

## ?? Your Database Schema

### **Schema Name:** `legal`

All tables are created in the `legal` schema for organization:

```
legal.Leads
legal.LeadConversations
legal.LeadDocuments
legal.LeadActivities
legal.Consultations
legal.ConflictChecks
legal.Campaigns
legal.CampaignMessages
legal.CampaignEnrollments
legal.IntakeForms
legal.IntakeFormSubmissions
legal.Cases
legal.Clients
legal.Firms
legal.Users
legal.Documents
legal.Deadlines
legal.Tasks
legal.Notes
legal.Activities
legal.AuditLogs
```

---

## ?? Verification Queries

### Check All Tables in Legal Schema

```sql
-- Connect to database in SSMS or sqlcmd
USE LegalRO_CaseManagement;
GO

-- List all tables
SELECT 
    TABLE_SCHEMA,
    TABLE_NAME,
    TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'legal'
ORDER BY TABLE_NAME;
GO
```

### Check New Lead Management Tables

```sql
-- Check if new tables exist
SELECT name, create_date, modify_date
FROM sys.tables
WHERE schema_id = SCHEMA_ID('legal')
  AND name IN ('Leads', 'LeadConversations', 'Consultations', 
               'ConflictChecks', 'Campaigns', 'LeadActivities',
               'LeadDocuments', 'CampaignMessages', 'CampaignEnrollments',
               'IntakeForms', 'IntakeFormSubmissions')
ORDER BY create_date DESC;
GO
```

### Check Indexes on Leads Table

```sql
-- View all indexes on Leads table
SELECT 
    i.name AS IndexName,
    i.type_desc AS IndexType,
    STRING_AGG(c.name, ', ') WITHIN GROUP (ORDER BY ic.key_ordinal) AS Columns
FROM sys.indexes i
INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE i.object_id = OBJECT_ID('legal.Leads')
  AND i.type > 0  -- Exclude heap
GROUP BY i.name, i.type_desc, i.index_id
ORDER BY i.name;
GO
```

### Check Migration History

```sql
-- See all applied migrations
SELECT 
    MigrationId,
    ProductVersion
FROM __EFMigrationsHistory
ORDER BY MigrationId;
GO
```

**Expected Result:**
```
MigrationId                                  ProductVersion
20260316080724_InitialCreate                 8.0.x
20260316103544_AddClientIntakeLeadManagement 8.0.x
```

### Count Records in New Tables

```sql
-- Count records (should be 0 initially)
SELECT 'Leads' AS TableName, COUNT(*) AS RecordCount FROM legal.Leads
UNION ALL
SELECT 'LeadConversations', COUNT(*) FROM legal.LeadConversations
UNION ALL
SELECT 'LeadDocuments', COUNT(*) FROM legal.LeadDocuments
UNION ALL
SELECT 'Consultations', COUNT(*) FROM legal.Consultations
UNION ALL
SELECT 'ConflictChecks', COUNT(*) FROM legal.ConflictChecks
UNION ALL
SELECT 'LeadActivities', COUNT(*) FROM legal.LeadActivities
UNION ALL
SELECT 'Campaigns', COUNT(*) FROM legal.Campaigns
UNION ALL
SELECT 'CampaignMessages', COUNT(*) FROM legal.CampaignMessages
UNION ALL
SELECT 'CampaignEnrollments', COUNT(*) FROM legal.CampaignEnrollments
UNION ALL
SELECT 'IntakeForms', COUNT(*) FROM legal.IntakeForms
UNION ALL
SELECT 'IntakeFormSubmissions', COUNT(*) FROM legal.IntakeFormSubmissions;
GO
```

---

## ??? Database Size and Location

### Check Database File Location

```sql
-- Get physical file locations
SELECT 
    name AS FileName,
    physical_name AS FileLocation,
    size * 8 / 1024 AS SizeMB,
    max_size * 8 / 1024 AS MaxSizeMB
FROM sys.database_files;
GO
```

**Expected Output:**
```
FileName: LegalRO_CaseManagement
FileLocation: C:\Users\vasileselever\AppData\Local\Microsoft\Microsoft SQL Server Local DB\Instances\mssqllocaldb\LegalRO_CaseManagement.mdf
SizeMB: ~8 MB (initial)

FileName: LegalRO_CaseManagement_log
FileLocation: C:\Users\vasileselever\AppData\Local\Microsoft\Microsoft SQL Server Local DB\Instances\mssqllocaldb\LegalRO_CaseManagement_log.ldf
SizeMB: ~8 MB (initial)
```

### Check Database Size

```sql
-- Get database size
EXEC sp_spaceused;
GO
```

---

## ?? Changing Database Location (Optional)

### If You Want to Use a Different SQL Server

Edit `appsettings.json` and change the connection string:

#### Option 1: SQL Server Express (Local Full Instance)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=LegalRO_CaseManagement;Trusted_Connection=true;TrustServerCertificate=true"
  }
}
```

#### Option 2: SQL Server (Named Instance)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER_NAME\\INSTANCE_NAME;Database=LegalRO_CaseManagement;User Id=sa;Password=YourPassword;TrustServerCertificate=true"
  }
}
```

#### Option 3: Azure SQL Database
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=tcp:yourserver.database.windows.net,1433;Database=LegalRO_CaseManagement;User ID=yourusername;Password=yourpassword;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  }
}
```

**After changing connection string:**
```bash
# Drop and recreate database on new server
dotnet ef database drop --force
dotnet ef database update
```

---

## ?? Backup Your Database

### Using SSMS
1. Right-click `LegalRO_CaseManagement` ? Tasks ? Back Up
2. Choose backup type: Full
3. Select destination: `C:\Backups\LegalRO_CaseManagement_backup.bak`
4. Click OK

### Using T-SQL
```sql
BACKUP DATABASE LegalRO_CaseManagement
TO DISK = 'C:\Backups\LegalRO_CaseManagement_backup.bak'
WITH FORMAT, INIT, NAME = 'Full Backup of LegalRO_CaseManagement';
GO
```

### Using Command Line
```cmd
sqlcmd -S (localdb)\mssqllocaldb -Q "BACKUP DATABASE LegalRO_CaseManagement TO DISK = 'C:\Backups\LegalRO_CaseManagement_backup.bak' WITH FORMAT, INIT"
```

---

## ??? Delete and Recreate Database (If Needed)

### Using EF Core CLI
```bash
# Drop database
dotnet ef database drop --force

# Recreate with all migrations
dotnet ef database update
```

### Using SSMS
1. Right-click `LegalRO_CaseManagement`
2. Delete
3. Confirm deletion
4. Run `dotnet ef database update` to recreate

---

## ?? Troubleshooting

### Issue: Can't Connect to LocalDB

**Solution 1: Start LocalDB Instance**
```cmd
sqllocaldb start mssqllocaldb
sqllocaldb info mssqllocaldb
```

**Solution 2: Create Instance if Missing**
```cmd
sqllocaldb create mssqllocaldb
sqllocaldb start mssqllocaldb
```

### Issue: Database Files Not Found

**Check if LocalDB is Installed:**
```cmd
sqllocaldb versions
```

**Expected Output:**
```
Microsoft SQL Server 2019 LocalDB
mssqllocaldb
```

### Issue: Permission Denied

Run Visual Studio or Command Prompt as **Administrator**

---

## ?? Summary

### Your Database Information:

| Property | Value |
|----------|-------|
| **Server Type** | SQL Server LocalDB |
| **Instance** | `(localdb)\mssqllocaldb` |
| **Database Name** | `LegalRO_CaseManagement` |
| **Schema** | `legal` |
| **Physical Location** | `C:\Users\vasileselever\AppData\Local\Microsoft\Microsoft SQL Server Local DB\Instances\mssqllocaldb\` |
| **Data File** | `LegalRO_CaseManagement.mdf` |
| **Log File** | `LegalRO_CaseManagement_log.ldf` |
| **Total Tables** | 21+ (11 new + existing) |
| **Total Indexes** | 60+ |
| **Authentication** | Windows Authentication (Trusted_Connection=true) |

### Applied Migrations:
1. ? `20260316080724_InitialCreate` - Original case management tables
2. ? `20260316103544_AddClientIntakeLeadManagement` - New lead management tables

---

## ?? Quick Access Commands

```bash
# View migrations
dotnet ef migrations list

# Connect to database
sqlcmd -S (localdb)\mssqllocaldb -d LegalRO_CaseManagement

# Backup database
sqlcmd -S (localdb)\mssqllocaldb -Q "BACKUP DATABASE LegalRO_CaseManagement TO DISK = 'C:\Backup\LegalRO.bak'"

# Check LocalDB status
sqllocaldb info mssqllocaldb
```

---

## ?? Next Steps

1. **Open SSMS** or **Visual Studio SQL Server Object Explorer**
2. **Connect to:** `(localdb)\mssqllocaldb`
3. **Browse:** LegalRO_CaseManagement ? Tables ? legal schema
4. **Verify:** All 11 new tables exist with indexes

---

**Need Help?**
- Can't connect to LocalDB? Run `sqllocaldb start mssqllocaldb`
- Want to use SQL Server Express? Change connection string in `appsettings.json`
- Need to backup? Use SSMS or the T-SQL backup command above

---

*Database Location Document*  
*Last Updated: March 16, 2026*  
*Database: LegalRO_CaseManagement*  
*Server: (localdb)\mssqllocaldb*
