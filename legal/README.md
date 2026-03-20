# LegalRO Case Management System - Backend API

## ?? Overview

This is the backend API for the **LegalRO Case Management System**, a comprehensive digital case management platform designed specifically for Romanian law firms. Built with .NET 8 and SQL Server, it provides RESTful APIs for managing cases, documents, deadlines, tasks, and more.

---

## ??? Architecture

### Clean Architecture Layers

```
legal/
??? Domain/                    # Domain Layer (Entities, Enums)
?   ??? Common/
?   ?   ??? BaseEntity.cs
?   ??? Entities/
?   ?   ??? Firm.cs
?   ?   ??? User.cs
?   ?   ??? Client.cs
?   ?   ??? Case.cs
?   ?   ??? Document.cs
?   ?   ??? Deadline.cs
?   ?   ??? TaskItem.cs
?   ?   ??? Note.cs
?   ?   ??? Activity.cs
?   ?   ??? AuditLog.cs
?   ??? Enums/
?       ??? Enums.cs
??? Application/               # Application Layer (DTOs, Services)
?   ??? DTOs/
?       ??? Cases/
?       ?   ??? CaseDto.cs
?       ??? Common/
?           ??? ApiResponse.cs
??? Infrastructure/            # Infrastructure Layer (Data, External Services)
?   ??? Data/
?       ??? ApplicationDbContext.cs
?       ??? Migrations/
??? API/                      # Presentation Layer (Controllers)
    ??? Controllers/
        ??? CasesController.cs
```

---

## ??? Technology Stack

- **.NET 8** - Latest .NET platform
- **ASP.NET Core Web API** - RESTful API framework
- **Entity Framework Core 8** - ORM for database access
- **SQL Server** - Relational database (LocalDB for development)
- **ASP.NET Core Identity** - Authentication and user management
- **JWT Bearer Tokens** - API authentication
- **Swagger/OpenAPI** - API documentation
- **Serilog** - Structured logging
- **FluentValidation** - Input validation
- **AutoMapper** - Object mapping

---

## ?? Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [SQL Server 2019+](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) or SQL Server LocalDB (included with Visual Studio)
- [Visual Studio 2022](https://visualstudio.microsoft.com/) or [VS Code](https://code.visualstudio.com/)
- [SQL Server Management Studio (SSMS)](https://aka.ms/ssmsfullsetup) - Optional but recommended

### Installation

1. **Clone the repository**
   ```bash
   cd C:\Users\vasileselever\Desktop\projects\Juridic\legal\legal
   ```

2. **Restore NuGet packages**
   ```bash
   dotnet restore
   ```

3. **Update database connection string**
   
   Edit `appsettings.json` and update the connection string if needed:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=LegalRO_CaseManagement;Trusted_Connection=true;MultipleActiveResultSets=true;TrustServerCertificate=true"
     }
   }
   ```

   **For SQL Server Express:**
   ```json
   "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=LegalRO_CaseManagement;Trusted_Connection=true;MultipleActiveResultSets=true;TrustServerCertificate=true"
   ```

   **For SQL Server with credentials:**
   ```json
   "DefaultConnection": "Server=localhost;Database=LegalRO_CaseManagement;User Id=sa;Password=YourPassword;TrustServerCertificate=true"
   ```

4. **Apply database migrations**
   ```bash
   dotnet ef database update
   ```

5. **Run the application**
   ```bash
   dotnet run
   ```

6. **Access the API**
   - API: `https://localhost:5001`
   - Swagger UI: `https://localhost:5001` (automatically redirects)
   - Health Check: `https://localhost:5001/health`

---

## ?? Database Schema

### Core Tables

#### Firms
- Represents law firms
- Contains firm profile, settings, and configuration

#### Users
- Extends ASP.NET Identity for authentication
- Stores user profiles (lawyers, associates, secretaries)
- Role-based access control

#### Clients
- Individual or corporate clients
- Links to firm
- Stores contact information and Romanian fiscal codes (CUI/CNP)

#### Cases
- Legal cases/matters
- Links to client, firm, responsible lawyer
- Practice area, case type, status tracking
- Romanian court information

#### Documents
- Case documents with versioning
- Stored in Azure Blob Storage (file path)
- Confidentiality levels (Public, Internal, Confidential, Privileged)
- OCR and metadata support

#### Deadlines
- Case deadlines with NCPC rule support
- Priority levels and reminders
- Romanian holiday calendar integration
- Recurring deadline support

#### Tasks
- Case tasks with assignments
- Status tracking (Not Started, In Progress, Completed, Blocked)
- Time tracking for billing

#### Notes
- Case notes with pinning support

#### Activities
- Audit trail for all case activities
- Timeline view for case history

#### AuditLogs
- System-wide audit logging for compliance
- Tracks all user actions (GDPR requirement)

---

## ?? Authentication & Authorization

### JWT Bearer Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected endpoints:

1. **Register or login** to get a JWT token (Auth endpoints - to be implemented)
2. **Include token in requests**:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

### User Roles

- **Admin**: Full system access, user management
- **Lawyer**: Full case access for assigned cases
- **Associate**: Limited case access
- **LegalSecretary**: Administrative access
- **Client**: Portal access only (view own cases)

---

## ?? API Endpoints

### Cases API (`/api/v1/cases`)

#### Get All Cases (with filtering & pagination)
```http
GET /api/v1/cases
Query Parameters:
  - status: Active | Pending | Closed | OnHold
  - practiceArea: Civil | Commercial | Criminal | Family | etc.
  - responsibleLawyerId: Guid
  - clientId: Guid
  - search: string (searches title, case number, client name)
  - page: int (default: 1)
  - pageSize: int (default: 25)
  - sortBy: title | caseNumber | client | openingDate | createdAt
  - sortOrder: asc | desc

Response: 200 OK
{
  "data": [ ... array of case list items ... ],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "totalPages": 10,
    "totalCount": 250,
    "hasPrevious": false,
    "hasNext": true
  }
}
```

#### Get Single Case
```http
GET /api/v1/cases/{id}

Response: 200 OK
{
  "id": "guid",
  "caseNumber": "2024-00001",
  "title": "Contract Dispute - ABC vs XYZ",
  "description": "...",
  "status": "Active",
  "practiceArea": "Commercial",
  "caseType": "Litigation",
  "client": { ... },
  "responsibleLawyer": { ... },
  "assignedUsers": [ ... ],
  "documentCount": 15,
  "openTaskCount": 3,
  "nextDeadline": "2024-12-31T00:00:00Z",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

#### Create Case
```http
POST /api/v1/cases
Content-Type: application/json

{
  "title": "Contract Dispute - ABC vs XYZ",
  "description": "Client ABC is suing XYZ for breach of contract...",
  "clientId": "guid",
  "practiceArea": "Commercial",
  "caseType": "Litigation",
  "responsibleLawyerId": "guid",
  "court": "Tribunalul Bucure?ti",
  "opposingParty": "XYZ SRL",
  "caseValue": 100000.00,
  "billingArrangement": "Hourly"
}

Response: 200 OK (returns full case object)
```

#### Update Case
```http
PUT /api/v1/cases/{id}
Content-Type: application/json

{
  "title": "Updated title",
  "description": "...",
  "status": "Active",
  "practiceArea": "Commercial",
  "caseType": "Litigation",
  "responsibleLawyerId": "guid",
  ...
}

Response: 200 OK (returns full case object)
```

#### Delete Case (Soft Delete)
```http
DELETE /api/v1/cases/{id}

Response: 204 No Content
```

---

## ??? Database Migrations

### Create a new migration
```bash
dotnet ef migrations add MigrationName --output-dir Infrastructure/Data/Migrations
```

### Apply migrations
```bash
dotnet ef database update
```

### Rollback to specific migration
```bash
dotnet ef database update PreviousMigrationName
```

### Remove last migration (if not applied)
```bash
dotnet ef migrations remove
```

### Generate SQL script
```bash
dotnet ef migrations script --output migration.sql
```

---

## ?? Testing

### Test with Swagger UI
1. Run the application: `dotnet run`
2. Navigate to `https://localhost:5001`
3. Use Swagger UI to test endpoints interactively

### Test with curl
```bash
# Get cases
curl -X GET "https://localhost:5001/api/v1/cases?page=1&pageSize=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create case
curl -X POST "https://localhost:5001/api/v1/cases" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Case",
    "clientId": "guid",
    "practiceArea": "Civil",
    "caseType": "Litigation",
    "responsibleLawyerId": "guid"
  }'
```

### Test with Postman
1. Import the API from Swagger: `https://localhost:5001/swagger/v1/swagger.json`
2. Set up environment variables for `base_url` and `token`
3. Test endpoints

---

## ?? Logging

Logs are written to:
- **Console**: All log levels (Development)
- **File**: `logs/legalro-YYYYMMDD.txt` (rolling daily)

Log levels:
- **Information**: Normal operations
- **Warning**: Unexpected but handled situations
- **Error**: Errors and exceptions
- **Debug**: Detailed diagnostic information (Development only)

View logs in real-time:
```bash
tail -f logs/legalro-20241215.txt
```

---

## ?? Configuration

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=LegalRO_CaseManagement;..."
  },
  "Jwt": {
    "Key": "YourSecretKeyHere-ChangeInProduction-AtLeast32Characters",
    "Issuer": "LegalRO.CaseManagement",
    "Audience": "LegalRO.CaseManagement.Client",
    "ExpiryMinutes": 60
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:5173"
    ]
  }
}
```

### Environment-specific configuration

- `appsettings.Development.json` - Development environment
- `appsettings.Production.json` - Production environment

---

## ?? Common Issues & Troubleshooting

### Issue: "A connection was successfully established with the server, but then an error occurred during the login process"

**Solution**: Check your connection string. Ensure:
- SQL Server service is running
- Database name is correct
- Authentication method is correct (Trusted_Connection or Username/Password)

```bash
# Check SQL Server service status (PowerShell)
Get-Service -Name 'MSSQL$SQLEXPRESS'

# Start SQL Server service
Start-Service -Name 'MSSQL$SQLEXPRESS'
```

### Issue: "dotnet ef command not found"

**Solution**: Install EF Core tools globally:
```bash
dotnet tool install --global dotnet-ef
```

### Issue: "Cannot create database because it already exists"

**Solution**: Drop and recreate:
```sql
-- In SSMS or sqlcmd
USE master;
GO
DROP DATABASE IF EXISTS LegalRO_CaseManagement;
GO
```

Then run migrations again:
```bash
dotnet ef database update
```

### Issue: AutoMapper vulnerability warning (NU1903)

This is a known issue with AutoMapper 12.0.1. To fix:
```bash
dotnet add package AutoMapper --version 13.0.1
```

### Issue: CORS errors from frontend

**Solution**: Add your frontend URL to `appsettings.json`:
```json
"Cors": {
  "AllowedOrigins": [
    "http://localhost:3000",
    "https://your-frontend-domain.com"
  ]
}
```

---

## ?? Production Deployment

### 1. Update Configuration

Create `appsettings.Production.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=your-prod-server;Database=LegalRO_CaseManagement;User Id=your-user;Password=your-password;Encrypt=true;TrustServerCertificate=false"
  },
  "Jwt": {
    "Key": "GENERATE-A-STRONG-SECRET-KEY-HERE-AT-LEAST-32-CHARACTERS-LONG",
    "ExpiryMinutes": 60
  },
  "Cors": {
    "AllowedOrigins": [
      "https://your-production-domain.com"
    ]
  }
}
```

### 2. Build for Production
```bash
dotnet publish -c Release -o ./publish
```

### 3. Deploy to Azure App Service
```bash
az webapp deployment source config-zip \
  --resource-group YourResourceGroup \
  --name YourAppServiceName \
  --src publish.zip
```

### 4. Apply Database Migrations in Production
```bash
# Generate SQL script
dotnet ef migrations script --output migration.sql

# Apply manually in production database or use
dotnet ef database update --connection "YourProductionConnectionString"
```

---

## ?? Next Steps

### Phase 1 - Completed ?
- [x] Domain entities (Firm, User, Client, Case, Document, Deadline, Task, etc.)
- [x] EF Core DbContext with SQL Server
- [x] JWT authentication setup
- [x] Cases API (CRUD operations)
- [x] Filtering, pagination, sorting
- [x] Database migrations

### Phase 2 - In Progress ??
- [ ] **Authentication API** (Login, Register, Token Refresh)
  - `/api/v1/auth/register`
  - `/api/v1/auth/login`
  - `/api/v1/auth/refresh-token`
- [ ] **Clients API** (CRUD operations)
- [ ] **Documents API** (Upload, Download, Versioning)
- [ ] **Deadlines API** (CRUD, NCPC calculator)
- [ ] **Tasks API** (CRUD, assignments, comments)
- [ ] **Users API** (User management, roles)

### Phase 3 - Planned ??
- [ ] Document storage (Azure Blob Storage integration)
- [ ] Email notifications (SendGrid integration)
- [ ] SMS notifications (Twilio integration)
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Advanced search (Elasticsearch)
- [ ] Reporting & Analytics API
- [ ] Workflow automation
- [ ] Client portal API
- [ ] Mobile API endpoints

---

## ?? Additional Resources

- [.NET 8 Documentation](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-8)
- [Entity Framework Core Documentation](https://learn.microsoft.com/en-us/ef/core/)
- [ASP.NET Core Web API Tutorial](https://learn.microsoft.com/en-us/aspnet/core/tutorials/first-web-api)
- [JWT Authentication in .NET](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/jwt)
- [PRD: Digital Case Management System](../docs/PRD/01-CaseManagement-PRD.md)
- [Development Roadmap](../docs/DevelopmentRoadmap.md)

---

## ?? Team & Support

- **Product Team**: LegalRO Development Team
- **Technical Lead**: [Your Name]
- **Support Email**: support@legalro.ro
- **Documentation**: [GitHub Wiki](your-wiki-url)

---

## ?? License

Copyright © 2024 LegalRO. All rights reserved.

This project is proprietary software developed for Romanian law firms.

---

**Last Updated**: December 15, 2024  
**Version**: 1.0.0 (MVP - Phase 1)
