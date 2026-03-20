# Quick Start Guide - LegalRO Backend API

## ? 5-Minute Setup

### 1. Install Prerequisites
- Install [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- Ensure SQL Server LocalDB is installed (comes with Visual Studio)

### 2. Setup Database
```bash
cd C:\Users\vasileselever\Desktop\projects\Juridic\legal\legal
dotnet ef database update
```

### 3. Run the API
```bash
dotnet run
```

### 4. Test the API
Open browser: `https://localhost:5001`

You'll see Swagger UI with interactive API documentation.

---

## ?? Test the Cases API

### Using Swagger UI (Easiest)
1. Go to `https://localhost:5001`
2. Expand `GET /api/v1/cases`
3. Click "Try it out"
4. Click "Execute"
5. You'll see an empty result (no data yet)

### Create Test Data

For now, you can:
1. Use SQL Server Management Studio (SSMS) to insert test data
2. Or wait for the Auth API (coming in Phase 2) to register users and create data through the API

---

## ?? Sample SQL to Create Test Data

```sql
USE LegalRO_CaseManagement;
GO

-- Insert a test firm
INSERT INTO legal.Firms (Id, Name, Email, Phone, CreatedAt, IsDeleted)
VALUES (NEWID(), 'Test Law Firm', 'office@testfirm.ro', '+40 21 123 4567', GETUTCDATE(), 0);

-- Get the firm ID (copy this)
SELECT TOP 1 Id FROM legal.Firms;

-- Insert a test client (replace FirmId with the one from above)
INSERT INTO legal.Clients (Id, FirmId, Name, Email, Phone, IsCorporate, CreatedAt, IsDeleted)
VALUES (NEWID(), 'PASTE-FIRM-ID-HERE', 'ABC Company SRL', 'contact@abc.ro', '+40 21 999 8888', 1, GETUTCDATE(), 0);

-- Get the client ID
SELECT TOP 1 Id FROM legal.Clients;

-- Create a user (for ResponsibleLawyer)
-- Note: This is simplified - normally use Identity tables
```

---

## ?? Next Steps

1. **Phase 2**: Implement Authentication API to properly create users and get JWT tokens
2. **Test with Postman**: Import the Swagger JSON and test with proper authentication
3. **Frontend Integration**: Connect Blazor or React frontend

---

## ?? Need Help?

- Check the main [README.md](./README.md) for detailed documentation
- Review the [PRD](../docs/PRD/01-CaseManagement-PRD.md) for feature specifications
- Look at the [Development Roadmap](../docs/DevelopmentRoadmap.md)

---

**Status**: ? Phase 1 MVP Complete - Cases API Functional
**Next**: ?? Phase 2 - Authentication & Additional APIs
