# ?? Step-by-Step Guide: Testing POST /api/leads

## Overview

This guide walks you through testing the **Create Lead** endpoint (`POST /api/leads`) - the most important endpoint in your Client Intake system. This is a **public endpoint** (no authentication required), making it perfect for testing!

---

## ?? What This Endpoint Does

When you call `POST /api/leads`, the system automatically:

1. ? Creates a new lead in the database
2. ? Calculates lead score (0-100) based on:
   - Urgency level (+25 points for emergency)
   - Information completeness (+20 for budget, +10 for source details)
   - Contact information quality (+10 for preferred contact method)
   - Practice area match
3. ? Initiates conflict check against existing clients and cases
4. ? Creates activity log entry
5. ? Records GDPR consent
6. ? Returns the new lead ID

---

## ?? Method 1: Using Swagger UI (Easiest!)

### Step 1: Start Your API

```powershell
# Open PowerShell or Command Prompt
cd C:\Users\vasileselever\Desktop\projects\Juridic\legal\legal

# Start the API
dotnet run --launch-profile https
```

**Wait for:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:5001
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
```

? **API is now running!**

---

### Step 2: Open Swagger UI

1. **Open your browser** (Chrome, Edge, Firefox)
2. **Navigate to:** `https://localhost:5001/swagger`
3. **Accept the SSL certificate warning** (click "Advanced" ? "Proceed to localhost")

You should see the Swagger UI with all your endpoints listed.

---

### Step 3: Find the Leads Endpoint

1. **Scroll down** to find the **"Leads"** section
2. **Look for:** `POST /api/leads` with description "Create a new lead"
3. **Click on it** to expand the endpoint details

---

### Step 4: Prepare Test Data

Click the **"Try it out"** button (top right of the endpoint section).

The JSON editor will become editable.

---

### Step 5: Test Case 1 - High-Quality Lead (Score ~77/100)

**Clear the existing JSON and paste this:**

```json
{
  "name": "Maria Ionescu",
  "email": "maria.ionescu@example.com",
  "phone": "+40721234567",
  "source": 1,
  "sourceDetails": "Website - Contact Form",
  "practiceArea": 4,
  "description": "Nevoie de consultan?? pentru divor?. Avem 2 copii minori ?i propriet??i comune. Situa?ia este urgent? deoarece trebuie s? finaliz?m procedura înainte de var?.",
  "urgency": 3,
  "budgetRange": "5000-10000 RON",
  "preferredContactMethod": "WhatsApp",
  "consentToMarketing": true,
  "consentToDataProcessing": true
}
```

**Click "Execute"**

---

### Step 6: Check the Response

**Expected Response (Status: 201 Created):**

```json
{
  "success": true,
  "data": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "message": "Lead created successfully"
}
```

**Response Details:**
- **Status Code:** `201 Created` ?
- **success:** `true` ?
- **data:** A GUID (unique identifier for the new lead) ?
- **message:** Success confirmation ?

---

### Step 7: Verify in Database

Open SQL Server Management Studio (SSMS) or use sqlcmd:

```sql
-- Connect to: (localdb)\mssqllocaldb
-- Database: LegalRO_CaseManagement

-- Check the lead was created
SELECT TOP 1 
    Id,
    Name,
    Email,
    Phone,
    Source,
    Status,
    Score,
    PracticeArea,
    Urgency,
    CreatedAt
FROM legal.Leads
ORDER BY CreatedAt DESC;
```

**Expected Result:**
```
Name: Maria Ionescu
Email: maria.ionescu@example.com
Score: 77 (approximately)
Status: 1 (New)
Urgency: 3 (High)
```

---

### Step 8: Verify Automatic Actions

**Check Conflict Check was initiated:**
```sql
SELECT 
    cc.Id,
    cc.Status,
    cc.CreatedAt,
    l.Name AS LeadName
FROM legal.ConflictChecks cc
INNER JOIN legal.Leads l ON cc.LeadId = l.Id
WHERE l.Email = 'maria.ionescu@example.com';
```

**Check Activity was logged:**
```sql
SELECT 
    la.ActivityType,
    la.Description,
    la.CreatedAt,
    l.Name AS LeadName
FROM legal.LeadActivities la
INNER JOIN legal.Leads l ON la.LeadId = l.Id
WHERE l.Email = 'maria.ionescu@example.com'
ORDER BY la.CreatedAt DESC;
```

**Expected Activities:**
- ? "LeadCreated" - Lead created from Website
- ? "ConflictCheckInitiated" - Conflict check started

---

## ?? More Test Cases

### Test Case 2 - Emergency Urgent Lead (Score ~92/100)

```json
{
  "name": "Alexandru Popescu",
  "email": "alex.popescu@urgent.com",
  "phone": "+40722987654",
  "source": 5,
  "sourceDetails": "Emergency hotline call",
  "practiceArea": 3,
  "description": "Urgent: Am fost arestat preventiv. Am nevoie de reprezentare juridic? imediat. Proces penal în desf??urare.",
  "urgency": 4,
  "budgetRange": "15000-25000 RON",
  "preferredContactMethod": "Phone",
  "consentToMarketing": false,
  "consentToDataProcessing": true
}
```

**Expected Score:** ~92/100 (High score due to emergency urgency)

---

### Test Case 3 - Basic Lead (Score ~42/100)

```json
{
  "name": "Ion Ionescu",
  "email": "ion.ionescu@example.com",
  "phone": "+40723456789",
  "source": 11,
  "practiceArea": 9,
  "description": "Întrebare general? despre servicii juridice.",
  "urgency": 1,
  "consentToMarketing": true,
  "consentToDataProcessing": true
}
```

**Expected Score:** ~42/100 (Lower score - minimal information, low urgency)

---

### Test Case 4 - Commercial Client (Score ~67/100)

```json
{
  "name": "SRL Modern Solutions",
  "email": "contact@modernsolutions.ro",
  "phone": "+40214567890",
  "source": 6,
  "sourceDetails": "Email inquiry - corporate@legal.ro",
  "practiceArea": 7,
  "description": "Companie IT c?ut?m avocat pentru consultan?? contracte comerciale B2B ?i contracte de munc? pentru 50+ angaja?i.",
  "urgency": 2,
  "budgetRange": "20000+ RON",
  "preferredContactMethod": "Email",
  "consentToMarketing": true,
  "consentToDataProcessing": true
}
```

**Expected Score:** ~67/100 (Good score - business client with clear needs)

---

### Test Case 5 - Facebook Lead (Score ~54/100)

```json
{
  "name": "Elena Dumitrescu",
  "email": "elena.dumitrescu89@gmail.com",
  "phone": "+40765432109",
  "source": 3,
  "sourceDetails": "Facebook Ad - Divor? Rapid Campaign",
  "practiceArea": 4,
  "description": "Doresc informa?ii despre divor?.",
  "urgency": 2,
  "consentToMarketing": true,
  "consentToDataProcessing": true
}
```

**Expected Score:** ~54/100 (Medium score - social media lead)

---

## ?? Method 2: Using PowerShell

### Complete PowerShell Test Script

**Create a file: `test-create-lead.ps1`**

```powershell
# ============================================
# Test Script: POST /api/leads
# ============================================

Write-Host "`n?? Testing Lead Creation API" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Function to create a lead
function Create-Lead {
    param (
        [string]$Name,
        [string]$Email,
        [string]$Phone,
        [int]$Source,
        [int]$PracticeArea,
        [string]$Description,
        [int]$Urgency,
        [string]$TestName
    )

    Write-Host "Test: $TestName" -ForegroundColor Yellow

    $body = @{
        name = $Name
        email = $Email
        phone = $Phone
        source = $Source
        sourceDetails = "Test - $TestName"
        practiceArea = $PracticeArea
        description = $Description
        urgency = $Urgency
        budgetRange = "5000-10000 RON"
        preferredContactMethod = "WhatsApp"
        consentToMarketing = $true
        consentToDataProcessing = $true
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod `
            -Uri "https://localhost:5001/api/leads" `
            -Method POST `
            -Body $body `
            -ContentType "application/json" `
            -SkipCertificateCheck

        Write-Host "? Success!" -ForegroundColor Green
        Write-Host "   Lead ID: $($response.data)" -ForegroundColor Cyan
        Write-Host "   Message: $($response.message)" -ForegroundColor Gray
        
        # Get lead details to see score
        Start-Sleep -Seconds 1
        $leadDetails = Invoke-RestMethod `
            -Uri "https://localhost:5001/api/leads/$($response.data)" `
            -Method GET `
            -SkipCertificateCheck

        Write-Host "   Score: $($leadDetails.data.score)/100" -ForegroundColor Magenta
        Write-Host ""

        return $response.data
    }
    catch {
        Write-Host "? Failed!" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        return $null
    }
}

# Test 1: High-Quality Lead
$lead1 = Create-Lead `
    -Name "Maria Ionescu" `
    -Email "maria.test$(Get-Random)@example.com" `
    -Phone "+40721234567" `
    -Source 1 `
    -PracticeArea 4 `
    -Description "Nevoie de consultan?? pentru divor?. Situa?ie urgent?." `
    -Urgency 3 `
    -TestName "High-Quality Lead"

# Test 2: Emergency Lead
$lead2 = Create-Lead `
    -Name "Alexandru Popescu" `
    -Email "alex.test$(Get-Random)@example.com" `
    -Phone "+40722987654" `
    -Source 5 `
    -PracticeArea 3 `
    -Description "Urgent: Proces penal în desf??urare." `
    -Urgency 4 `
    -TestName "Emergency Lead"

# Test 3: Basic Lead
$lead3 = Create-Lead `
    -Name "Ion Ionescu" `
    -Email "ion.test$(Get-Random)@example.com" `
    -Phone "+40723456789" `
    -Source 11 `
    -PracticeArea 9 `
    -Description "Întrebare general?." `
    -Urgency 1 `
    -TestName "Basic Lead"

# Summary
Write-Host "`n?? Test Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
$successCount = @($lead1, $lead2, $lead3) | Where-Object { $_ -ne $null } | Measure-Object | Select-Object -ExpandProperty Count
Write-Host "Tests Run: 3" -ForegroundColor White
Write-Host "Passed: $successCount" -ForegroundColor Green
Write-Host "Failed: $(3 - $successCount)" -ForegroundColor Red

if ($successCount -eq 3) {
    Write-Host "`n?? All tests passed!" -ForegroundColor Green
} else {
    Write-Host "`n?? Some tests failed!" -ForegroundColor Yellow
}

Write-Host "`n?? Next Steps:" -ForegroundColor Cyan
Write-Host "1. Check Swagger UI: https://localhost:5001/swagger" -ForegroundColor Gray
Write-Host "2. Verify in database using SQL queries" -ForegroundColor Gray
Write-Host "3. Check lead scores and conflict checks" -ForegroundColor Gray
```

**Run the script:**

```powershell
.\test-create-lead.ps1
```

**Expected Output:**

```
?? Testing Lead Creation API
================================

Test: High-Quality Lead
? Success!
   Lead ID: 3fa85f64-5717-4562-b3fc-2c963f66afa6
   Message: Lead created successfully
   Score: 77/100

Test: Emergency Lead
? Success!
   Lead ID: 8bc91f23-6d45-7890-c123-456789abcdef
   Message: Lead created successfully
   Score: 92/100

Test: Basic Lead
? Success!
   Lead ID: 1a2b3c4d-5e6f-7890-a1b2-c3d4e5f67890
   Message: Lead created successfully
   Score: 42/100

?? Test Summary
================================
Tests Run: 3
Passed: 3
Failed: 0

?? All tests passed!

?? Next Steps:
1. Check Swagger UI: https://localhost:5001/swagger
2. Verify in database using SQL queries
3. Check lead scores and conflict checks
```

---

## ?? Method 3: Using cURL

### Windows (PowerShell curl alias)

```powershell
curl.exe -X POST https://localhost:5001/api/leads `
  -H "Content-Type: application/json" `
  -k `
  -d '{\"name\":\"Test Lead\",\"email\":\"test@example.com\",\"phone\":\"+40721234567\",\"source\":1,\"practiceArea\":4,\"description\":\"Test\",\"urgency\":2,\"consentToMarketing\":true,\"consentToDataProcessing\":true}'
```

### Linux/Mac

```bash
curl -X POST https://localhost:5001/api/leads \
  -H "Content-Type: application/json" \
  -k \
  -d '{
    "name": "Test Lead",
    "email": "test@example.com",
    "phone": "+40721234567",
    "source": 1,
    "practiceArea": 4,
    "description": "Test description",
    "urgency": 2,
    "consentToMarketing": true,
    "consentToDataProcessing": true
  }'
```

---

## ?? Understanding the Response

### Success Response (201 Created)

```json
{
  "success": true,
  "data": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "message": "Lead created successfully"
}
```

**Fields:**
- **success**: `true` = Lead created successfully
- **data**: GUID = Unique identifier for the new lead (save this for later queries!)
- **message**: Human-readable confirmation

---

### Error Responses

#### 400 Bad Request - Validation Error

```json
{
  "success": false,
  "errors": {
    "Name": ["The Name field is required."],
    "Email": ["The Email field is not a valid e-mail address."],
    "ConsentToDataProcessing": ["You must consent to data processing (GDPR requirement)."]
  },
  "message": "Validation failed"
}
```

**Common Validation Errors:**
- Missing required fields (name, email, phone)
- Invalid email format
- Invalid phone format
- Missing GDPR consent

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "An error occurred while creating the lead",
  "error": "Database connection failed"
}
```

**Possible Causes:**
- Database is not running
- Connection string is incorrect
- Foreign key constraint violation

---

## ?? Field Reference

### Required Fields ?

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Lead's full name | "Maria Ionescu" |
| `email` | string | Valid email address | "maria@example.com" |
| `phone` | string | Romanian phone number | "+40721234567" |
| `source` | int | Lead source (1-11) | 1 (Website) |
| `practiceArea` | int | Practice area (1-9) | 4 (Family Law) |
| `description` | string | Detailed description | "Nevoie de..." |
| `urgency` | int | Urgency level (1-4) | 3 (High) |
| `consentToDataProcessing` | bool | GDPR consent | true |

### Optional Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `sourceDetails` | string | Additional source info | "Facebook Ad" |
| `budgetRange` | string | Budget estimate | "5000-10000 RON" |
| `preferredContactMethod` | string | Preferred contact | "WhatsApp" |
| `consentToMarketing` | bool | Marketing consent | true |
| `customFieldsJson` | string | Custom JSON data | "{\"notes\":\"VIP\"}" |

---

## ?? Lead Scoring Breakdown

### How Score is Calculated:

```csharp
Base Score: 40 points

+ Urgency Bonus:
  - Emergency (4): +25 points
  - High (3): +15 points
  - Medium (2): +10 points
  - Low (1): +0 points

+ Information Completeness:
  - Budget range provided: +20 points
  - Source details provided: +10 points
  - Preferred contact method: +10 points

+ Practice Area Match:
  - High-demand areas: +5 points

Maximum Score: 100 points
```

### Examples:

**High Score (92/100):**
- Emergency urgency (+25)
- All fields filled (+40)
- Criminal law practice area (+5)
- Base (40)

**Medium Score (67/100):**
- Medium urgency (+10)
- Partial information (+20)
- Commercial law (+5)
- Base (40)

**Low Score (42/100):**
- Low urgency (+0)
- Minimal information (+0)
- Generic practice area (+0)
- Base (40)

---

## ?? GDPR Compliance

### Required Consent:

```json
{
  "consentToDataProcessing": true  // REQUIRED - Cannot create lead without this
}
```

### Optional Marketing Consent:

```json
{
  "consentToMarketing": false  // Optional - Can be false
}
```

### What Gets Logged:

- Consent date/time (automatic)
- IP address (from request)
- User agent (from request)
- Consent type (data processing, marketing)

---

## ?? Complete Test Checklist

### Basic Tests ?

- [ ] Create lead with all required fields
- [ ] Create lead with all optional fields
- [ ] Create lead with minimal fields
- [ ] Verify response contains lead ID
- [ ] Verify response status is 201

### Validation Tests ?

- [ ] Missing name ? 400 error
- [ ] Invalid email ? 400 error
- [ ] Invalid phone ? 400 error
- [ ] Missing consent ? 400 error
- [ ] Invalid source enum ? 400 error

### Functional Tests ?

- [ ] Lead appears in database
- [ ] Lead score is calculated correctly
- [ ] Conflict check is initiated
- [ ] Activity log is created
- [ ] GDPR consent is recorded
- [ ] Timestamps are set correctly

### Score Calculation Tests ?

- [ ] Emergency urgency ? score ~90+
- [ ] High urgency ? score ~75+
- [ ] Medium urgency ? score ~60+
- [ ] Low urgency ? score ~40+

---

## ?? Common Issues & Solutions

### Issue 1: SSL Certificate Error

**Error:** "SSL certificate problem: unable to get local issuer certificate"

**Solution:**
```powershell
# PowerShell
Invoke-RestMethod -SkipCertificateCheck

# cURL
curl -k
```

### Issue 2: API Not Running

**Error:** "Connection refused" or "No connection could be made"

**Solution:**
```powershell
# Start the API first
cd C:\Users\vasileselever\Desktop\projects\Juridic\legal\legal
dotnet run --launch-profile https
```

### Issue 3: Invalid JSON

**Error:** "Unexpected character encountered"

**Solution:**
- Check all quotes are properly escaped
- Validate JSON at https://jsonlint.com/
- Use Swagger UI instead (easier!)

### Issue 4: Database Not Found

**Error:** "Cannot open database 'LegalRO_CaseManagement'"

**Solution:**
```bash
# Run migrations
dotnet ef database update
```

---

## ?? Next Steps

After successfully creating leads:

1. **? Test GET endpoints:**
   - `GET /api/leads` - List all leads
   - `GET /api/leads/{id}` - Get lead details
   - `GET /api/leads/statistics` - Get statistics

2. **? Test UPDATE endpoint:**
   - `PUT /api/leads/{id}` - Update lead

3. **? Test DELETE endpoint:**
   - `DELETE /api/leads/{id}` - Soft delete lead

4. **? Test Consultations:**
   - `POST /api/consultations` - Schedule consultation
   - `GET /api/consultations/availability/{lawyerId}` - Check availability

---

## ?? Summary

### What You Learned:

1. ? How to start the API
2. ? How to use Swagger UI for testing
3. ? How to create leads with different scores
4. ? How to verify data in database
5. ? How to use PowerShell for testing
6. ? How to understand responses
7. ? How lead scoring works
8. ? GDPR compliance requirements

### Ready to Build UI!

Now that you know the API works, you can:
- Build the React frontend
- Create the public intake form
- Build the leads dashboard
- Add consultation scheduling

---

**?? Congratulations! You've successfully tested the POST /api/leads endpoint!**

---

## ?? Quick Reference

### Start API
```powershell
cd C:\Users\vasileselever\Desktop\projects\Juridic\legal\legal
dotnet run --launch-profile https
```

### Swagger UI
```
https://localhost:5001/swagger
```

### Sample JSON
```json
{
  "name": "Test Lead",
  "email": "test@example.com",
  "phone": "+40721234567",
  "source": 1,
  "practiceArea": 4,
  "description": "Test",
  "urgency": 2,
  "consentToMarketing": true,
  "consentToDataProcessing": true
}
```

### Verify in Database
```sql
SELECT * FROM legal.Leads ORDER BY CreatedAt DESC;
```

---

*Step-by-Step Testing Guide for POST /api/leads*  
*Version 1.0*  
*Last Updated: March 16, 2026*
