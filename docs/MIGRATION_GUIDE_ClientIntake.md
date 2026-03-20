# Database Migration Guide - Client Intake & Lead Management

## Overview
This guide walks you through creating and applying the database migration for the new Client Intake & Lead Management features.

---

## Prerequisites

? .NET 8 SDK installed  
? EF Core CLI tools installed  
? Database connection string configured in `appsettings.json`

---

## Step-by-Step Migration

### Step 1: Stop the Running API

The build failed because the API is currently running. You need to stop it first:

**Option A: Using Task Manager**
1. Press `Ctrl + Shift + Esc` to open Task Manager
2. Find `legal.exe` in the Processes tab
3. Right-click ? End Task

**Option B: Using Command Prompt (as Administrator)**
```cmd
taskkill /F /IM legal.exe
```

**Option C: In the terminal where API is running**
- Press `Ctrl + C`

---

### Step 2: Verify EF Core Tools

```bash
dotnet ef --version
```

If not installed:
```bash
dotnet tool install --global dotnet-ef
```

---

### Step 3: Navigate to Project Directory

```bash
cd C:\Users\vasileselever\Desktop\projects\Juridic\legal\legal
```

---

### Step 4: Build the Project

```bash
dotnet build
```

**Expected Output:**
```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

---

### Step 5: Create the Migration

```bash
dotnet ef migrations add AddClientIntakeLeadManagement
```

**What this does:**
- Analyzes the new entities in `Domain/Entities/`
- Compares with `ApplicationDbContext`
- Generates migration files in `Infrastructure/Data/Migrations/`
- Creates:
  - `YYYYMMDDHHMMSS_AddClientIntakeLeadManagement.cs` - Migration code
  - `YYYYMMDDHHMMSS_AddClientIntakeLeadManagement.Designer.cs` - Metadata
  - Updates `ApplicationDbContextModelSnapshot.cs`

**Expected Output:**
```
Build started...
Build succeeded.
An operation was scaffolded that may result in the loss of data.
Please review the migration for accuracy.
Done. To undo this action, use 'ef migrations remove'
```

---

### Step 6: Review the Migration (Optional but Recommended)

Open the generated migration file in `Infrastructure/Data/Migrations/` and verify:

**Expected Tables to be Created:**
- ? Leads (with indexes)
- ? LeadConversations
- ? LeadDocuments
- ? Consultations
- ? ConflictChecks
- ? LeadActivities
- ? Campaigns
- ? CampaignMessages
- ? CampaignEnrollments
- ? IntakeForms
- ? IntakeFormSubmissions

**Indexes to be Created:**
- Leads: status, source, score, email, phone, etc.
- Consultations: lawyerId, scheduledAt, status
- Others: appropriate indexes for performance

---

### Step 7: Apply the Migration to Database

```bash
dotnet ef database update
```

**What this does:**
- Connects to your database (PostgreSQL or SQL Server)
- Executes the migration SQL
- Creates all new tables, columns, indexes, foreign keys
- Updates `__EFMigrationsHistory` table

**Expected Output:**
```
Build started...
Build succeeded.
Applying migration 'YYYYMMDDHHMMSS_AddClientIntakeLeadManagement'.
Done.
```

---

### Step 8: Verify the Migration

**Option A: Using Database Tools**
- Open pgAdmin (PostgreSQL) or SQL Server Management Studio
- Connect to your database
- Verify new tables exist in the `legal` schema

**Option B: Using EF Core**
```bash
dotnet ef migrations list
```

You should see your new migration listed with `(Applied)` status.

---

### Step 9: Start the API

```bash
dotnet run --launch-profile https
```

**Expected Output:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:5001
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
```

---

### Step 10: Test the New Endpoints

#### Test 1: Check Swagger UI
Open browser: `https://localhost:5001/swagger`

**You should see new endpoints:**
- `/api/leads` (GET, POST, PUT, DELETE)
- `/api/leads/{id}` (GET)
- `/api/leads/statistics` (GET)
- `/api/consultations` (GET, POST)
- `/api/consultations/{id}` (GET, PATCH, POST)
- `/api/consultations/availability/{lawyerId}` (GET)

#### Test 2: Create a Test Lead
```bash
curl -X POST https://localhost:5001/api/leads \
  -H "Content-Type: application/json" \
  -k \
  -d '{
    "name": "Maria Ionescu",
    "email": "maria.ionescu@example.com",
    "phone": "+40721234567",
    "source": 1,
    "sourceDetails": "Website Homepage",
    "practiceArea": 4,
    "description": "Nevoie de ajutor cu divor?. Avem 2 copii minori ?i propriet??i comune.",
    "urgency": 3,
    "budgetRange": "5000-10000 RON",
    "preferredContactMethod": "WhatsApp",
    "consentToMarketing": true,
    "consentToDataProcessing": true
  }'
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "data": "guid-of-new-lead",
  "message": "Lead created successfully"
}
```

#### Test 3: Get Leads List
```bash
# You'll need a valid JWT token for this
GET https://localhost:5001/api/leads
Authorization: Bearer {your-jwt-token}
```

---

## Troubleshooting

### Issue: Migration Already Exists
```
The migration 'YYYYMMDDHHMMSS_AddClientIntakeLeadManagement' has already been applied to the database.
```

**Solution:** The migration is already applied. No action needed.

---

### Issue: Build Errors
```
error CS0117: 'ApiResponse' does not contain a definition for 'Metadata'
```

**Solution:** Already fixed! The GetLeads method now uses `PagedResponse<T>` instead.

---

### Issue: Database Connection Error
```
A network-related or instance-specific error occurred while establishing a connection to the database.
```

**Solution:** 
1. Check database is running (PostgreSQL service or SQL Server)
2. Verify connection string in `appsettings.json`
3. Ensure firewall allows connection

---

### Issue: Foreign Key Constraint Errors
```
The INSERT statement conflicted with the FOREIGN KEY constraint...
```

**Solution:**
- Ensure referenced entities exist (Firm, User, Client)
- The placeholder FirmId in controllers needs to be replaced with real authenticated user's FirmId

---

### Issue: Column Already Exists
```
Column 'ColumnName' already exists in table 'TableName'
```

**Solution:**
- Remove the migration: `dotnet ef migrations remove`
- Delete the migration files manually
- Recreate: `dotnet ef migrations add AddClientIntakeLeadManagement`

---

## Migration Rollback (If Needed)

### Rollback to Previous Migration
```bash
# List all migrations
dotnet ef migrations list

# Rollback to previous migration
dotnet ef database update PreviousMigrationName
```

### Remove Last Migration (If Not Applied)
```bash
dotnet ef migrations remove
```

---

## Database Schema Verification Queries

### PostgreSQL
```sql
-- Check new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'legal' 
  AND table_name LIKE 'Lead%' OR table_name LIKE 'Consultation%' OR table_name LIKE 'Campaign%';

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'legal' 
  AND tablename IN ('Leads', 'Consultations', 'Campaigns');

-- Count records (should be 0 initially)
SELECT COUNT(*) FROM legal."Leads";
```

### SQL Server
```sql
-- Check new tables exist
SELECT name 
FROM sys.tables 
WHERE schema_id = SCHEMA_ID('legal') 
  AND name LIKE 'Lead%' OR name LIKE 'Consultation%' OR name LIKE 'Campaign%';

-- Check indexes
SELECT i.name AS IndexName, t.name AS TableName
FROM sys.indexes i
INNER JOIN sys.tables t ON i.object_id = t.object_id
WHERE SCHEMA_NAME(t.schema_id) = 'legal'
  AND t.name IN ('Leads', 'Consultations', 'Campaigns');

-- Count records (should be 0 initially)
SELECT COUNT(*) FROM legal.Leads;
```

---

## Post-Migration Checklist

- [ ] All 11 new tables created successfully
- [ ] Indexes created on key columns
- [ ] Foreign keys established correctly
- [ ] API builds without errors
- [ ] Swagger UI shows new endpoints
- [ ] Can create a test lead via API
- [ ] Can retrieve leads via API
- [ ] Automatic lead scoring works (check lead.Score value)
- [ ] Automatic conflict check runs (check ConflictChecks table)

---

## Next Steps After Migration

1. **Replace Placeholder FirmId**
   - Update controllers to get FirmId from authenticated user claims
   - Search for: `Guid.Parse("00000000-0000-0000-0000-000000000001")`
   - Replace with: `User.FindFirst("FirmId")?.Value` or similar

2. **Add Seed Data (Optional)**
   - Create sample leads for testing
   - Create sample consultations
   - Test the full workflow

3. **Configure Integrations**
   - Add configuration for WhatsApp, Email, SMS providers
   - Set up API keys in `appsettings.json` or Azure Key Vault

4. **Implement Background Jobs**
   - Campaign message sending
   - Consultation reminders
   - Lead scoring updates

5. **Add Frontend**
   - Build Blazor or React components
   - Consume the new API endpoints
   - Create lead dashboard, consultation calendar, etc.

---

## Success! ??

If you've completed all steps successfully:

? Database migration applied  
? 11 new tables created  
? API compiles and runs  
? Swagger UI shows new endpoints  
? Can create and retrieve leads  

**You're ready to start building the frontend and integrating external services!**

---

## Quick Reference Commands

```bash
# Stop API
Ctrl+C (in terminal) or Task Manager ? End legal.exe

# Build
dotnet build

# Create migration
dotnet ef migrations add AddClientIntakeLeadManagement

# Apply migration
dotnet ef database update

# List migrations
dotnet ef migrations list

# Rollback
dotnet ef database update PreviousMigrationName

# Remove last migration (if not applied)
dotnet ef migrations remove

# Run API
dotnet run --launch-profile https
```

---

**Need Help?** 
- Check `docs/IMPLEMENTATION_SUMMARY_ClientIntake.md` for detailed documentation
- Check `docs/QUICK_START_ClientIntake.md` for quick start guide
- Review Swagger UI at `https://localhost:5001/swagger`
