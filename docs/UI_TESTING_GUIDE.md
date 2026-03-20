# ?? Complete UI Testing Guide

## Overview

This guide covers how to test your Client Intake & Lead Management UI at multiple levels:
1. **API Testing** - Test backend endpoints (do this first!)
2. **React Component Testing** - Unit tests for UI components
3. **Integration Testing** - Test UI + API together
4. **E2E Testing** - Full user flow testing
5. **Manual Testing** - Step-by-step testing guide

---

## ?? Quick Start - Test the API First!

Before building the UI, let's verify your backend API works correctly.

### Step 1: Start Your API

```bash
cd C:\Users\vasileselever\Desktop\projects\Juridic\legal\legal
dotnet run --launch-profile https
```

**Expected Output:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:5001
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
```

### Step 2: Open Swagger UI

Open your browser and navigate to:
```
https://localhost:5001/swagger
```

You should see the Swagger documentation with all your endpoints:
- ? LeadsController (6 endpoints)
- ? ConsultationsController (6 endpoints)

---

## ?? API Testing Methods

### Method 1: Using Swagger UI (Easiest - No Tools Needed!)

#### Test 1: Create a Lead (Public Endpoint - No Authentication)

1. **Open Swagger:** `https://localhost:5001/swagger`
2. **Find:** `POST /api/leads`
3. **Click:** "Try it out"
4. **Paste this JSON:**

```json
{
  "name": "Maria Popescu",
  "email": "maria.popescu@example.com",
  "phone": "+40721234567",
  "source": 1,
  "sourceDetails": "Website - Contact Form",
  "practiceArea": 4,
  "description": "Nevoie de consultan?? pentru divor?. Avem 2 copii minori ?i propriet??i comune. Situa?ia este urgent?.",
  "urgency": 3,
  "budgetRange": "5000-10000 RON",
  "preferredContactMethod": "WhatsApp",
  "consentToMarketing": true,
  "consentToDataProcessing": true
}
```

5. **Click:** "Execute"

**Expected Response (201 Created):**
```json
{
  "success": true,
  "data": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "message": "Lead created successfully"
}
```

**What Happened Automatically:**
- ? Lead created in database
- ? Lead score calculated (should be ~77/100 for this example)
- ? Conflict check initiated
- ? Activity log created
- ? GDPR consent recorded

#### Test 2: Get Lead Statistics (Requires Authentication)

1. **First, you need a JWT token** (for now, we'll skip this)
2. **Alternative:** Test using Postman or curl (see below)

---

### Method 2: Using Postman (Visual Tool)

#### Setup:
1. **Download Postman:** https://www.postman.com/downloads/
2. **Create a new Collection:** "LegalRO API Tests"

#### Test 1: Create Lead

```
POST https://localhost:5001/api/leads
Content-Type: application/json

{
  "name": "Ion Ionescu",
  "email": "ion.ionescu@example.com",
  "phone": "+40722123456",
  "source": 1,
  "practiceArea": 3,
  "description": "Problema legal? urgent?",
  "urgency": 4,
  "consentToMarketing": true,
  "consentToDataProcessing": true
}
```

**Expected Status:** 201 Created

#### Test 2: Get All Leads (With Filters)

```
GET https://localhost:5001/api/leads?page=1&pageSize=10&status=1&minScore=50
Authorization: Bearer {your-jwt-token}
```

**Expected Status:** 200 OK

---

### Method 3: Using cURL (Command Line)

#### Test 1: Create Lead

```bash
curl -X POST https://localhost:5001/api/leads \
  -H "Content-Type: application/json" \
  -k \
  -d "{
    \"name\": \"Test Lead\",
    \"email\": \"test@example.com\",
    \"phone\": \"+40721234567\",
    \"source\": 1,
    \"practiceArea\": 4,
    \"description\": \"Test description\",
    \"urgency\": 2,
    \"consentToMarketing\": true,
    \"consentToDataProcessing\": true
  }"
```

#### Test 2: Get Lead by ID

```bash
curl -X GET https://localhost:5001/api/leads/{lead-id} \
  -H "Authorization: Bearer {your-jwt-token}" \
  -k
```

---

### Method 4: Using PowerShell

```powershell
# Create a new lead
$body = @{
    name = "Alexandru Popa"
    email = "alex.popa@example.com"
    phone = "+40722345678"
    source = 1
    practiceArea = 2
    description = "Consultan?? juridic? pentru contract comercial"
    urgency = 2
    consentToMarketing = $true
    consentToDataProcessing = $true
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://localhost:5001/api/leads" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -SkipCertificateCheck

Write-Host "Lead created with ID: $($response.data)"
```

---

## ?? React UI Testing (After You Create the React App)

### Setup Testing Framework

```bash
cd legal-ui

# Install testing dependencies
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D vitest jsdom @vitest/ui
npm install -D @testing-library/react-hooks
npm install -D msw  # Mock Service Worker for API mocking
```

### Configure Vitest

**Create `legal-ui/vitest.config.ts`:**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

**Create `legal-ui/src/test/setup.ts`:**

```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
```

---

## ?? Example Component Tests

### Test 1: LeadScoreBadge Component

**Create `legal-ui/src/components/leads/LeadScoreBadge.test.tsx`:**

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LeadScoreBadge } from './LeadScoreBadge';

describe('LeadScoreBadge', () => {
  it('renders hot badge for score >= 70', () => {
    render(<LeadScoreBadge score={85} />);
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('HOT')).toBeInTheDocument();
  });

  it('renders warm badge for score 40-69', () => {
    render(<LeadScoreBadge score={55} />);
    expect(screen.getByText('55')).toBeInTheDocument();
    expect(screen.getByText('WARM')).toBeInTheDocument();
  });

  it('renders cold badge for score < 40', () => {
    render(<LeadScoreBadge score={25} />);
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('COLD')).toBeInTheDocument();
  });
});
```

**Run tests:**
```bash
npm run test
```

---

### Test 2: Dashboard Component with API Mocking

**Create `legal-ui/src/pages/Dashboard.test.tsx`:**

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Dashboard } from './Dashboard';
import * as leadService from '../api/leadService';

// Mock the API service
vi.mock('../api/leadService');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('Dashboard', () => {
  it('displays loading state initially', () => {
    vi.spyOn(leadService, 'getStatistics').mockImplementation(
      () => new Promise(() => {})
    );

    render(<Dashboard />, { wrapper });
    expect(screen.getByText('Se încarc?...')).toBeInTheDocument();
  });

  it('displays statistics when data is loaded', async () => {
    const mockStats = {
      totalLeads: 150,
      newLeads: 25,
      convertedLeads: 30,
      conversionRate: 20,
      qualifiedLeads: 50,
      consultationsScheduled: 15,
      lostLeads: 10,
      averageScore: 65,
      leadsBySource: {},
      leadsByPracticeArea: {},
    };

    vi.spyOn(leadService.leadService, 'getStatistics').mockResolvedValue(mockStats);

    render(<Dashboard />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('20.0%')).toBeInTheDocument();
    });
  });
});
```

---

### Test 3: API Service Tests

**Create `legal-ui/src/api/leadService.test.ts`:**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { leadService } from './leadService';
import { apiClient } from './apiClient';

vi.mock('./apiClient');

describe('leadService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createLead', () => {
    it('creates a lead and returns the ID', async () => {
      const mockLeadId = '123e4567-e89b-12d3-a456-426614174000';
      const mockDto = {
        name: 'Test Lead',
        email: 'test@example.com',
        phone: '+40721234567',
        source: 1,
        practiceArea: 4,
        description: 'Test',
        urgency: 2,
        consentToMarketing: true,
        consentToDataProcessing: true,
      };

      vi.spyOn(apiClient, 'post').mockResolvedValue({
        data: { success: true, data: mockLeadId },
      });

      const result = await leadService.createLead(mockDto);

      expect(result).toBe(mockLeadId);
      expect(apiClient.post).toHaveBeenCalledWith('/leads', mockDto);
    });
  });

  describe('getLeads', () => {
    it('fetches leads with filters', async () => {
      const mockResponse = {
        data: [
          { id: '1', name: 'Lead 1', score: 85 },
          { id: '2', name: 'Lead 2', score: 60 },
        ],
        pagination: { page: 1, pageSize: 10, total: 2 },
      };

      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: mockResponse });

      const params = { page: 1, pageSize: 10, minScore: 50 };
      const result = await leadService.getLeads(params);

      expect(result).toEqual(mockResponse);
      expect(apiClient.get).toHaveBeenCalledWith('/leads', { params });
    });
  });
});
```

**Run API tests:**
```bash
npm run test -- leadService.test.ts
```

---

## ?? Integration Testing

### Test UI + API Together

**Create `legal-ui/src/__tests__/integration/CreateLead.integration.test.tsx`:**

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateLead } from '../../pages/leads/CreateLead';

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('CreateLead Integration', () => {
  it('creates a lead successfully', async () => {
    const user = userEvent.setup();

    render(<CreateLead />, { wrapper });

    // Fill out the form
    await user.type(screen.getByLabelText('Name'), 'Test Lead');
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Phone'), '+40721234567');
    await user.selectOptions(screen.getByLabelText('Source'), '1');
    await user.selectOptions(screen.getByLabelText('Practice Area'), '4');
    await user.type(screen.getByLabelText('Description'), 'Test description');
    await user.selectOptions(screen.getByLabelText('Urgency'), '2');
    await user.click(screen.getByLabelText('Consent to Marketing'));
    await user.click(screen.getByLabelText('Consent to Data Processing'));

    // Submit form
    await user.click(screen.getByRole('button', { name: 'Create Lead' }));

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Lead created successfully')).toBeInTheDocument();
    });
  });
});
```

---

## ?? E2E Testing with Playwright

### Setup Playwright

```bash
cd legal-ui
npm install -D @playwright/test
npx playwright install
```

**Create `legal-ui/playwright.config.ts`:**

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
```

### Example E2E Test

**Create `legal-ui/e2e/create-lead.spec.ts`:**

```typescript
import { test, expect } from '@playwright/test';

test('complete lead creation flow', async ({ page }) => {
  // Navigate to create lead page
  await page.goto('/leads/create');

  // Fill out form
  await page.fill('[name="name"]', 'E2E Test Lead');
  await page.fill('[name="email"]', 'e2e@example.com');
  await page.fill('[name="phone"]', '+40721234567');
  await page.selectOption('[name="source"]', '1');
  await page.selectOption('[name="practiceArea"]', '4');
  await page.fill('[name="description"]', 'E2E test description');
  await page.selectOption('[name="urgency"]', '2');
  await page.check('[name="consentToMarketing"]');
  await page.check('[name="consentToDataProcessing"]');

  // Submit form
  await page.click('button[type="submit"]');

  // Verify success
  await expect(page.locator('text=Lead created successfully')).toBeVisible();

  // Verify redirect to leads list
  await expect(page).toHaveURL('/leads');

  // Verify lead appears in list
  await expect(page.locator('text=E2E Test Lead')).toBeVisible();
});

test('lead details page displays correctly', async ({ page }) => {
  // Assuming we have a lead ID
  await page.goto('/leads/123e4567-e89b-12d3-a456-426614174000');

  // Verify lead details are displayed
  await expect(page.locator('h1')).toContainText('Lead Details');
  await expect(page.locator('text=Score')).toBeVisible();
  await expect(page.locator('text=Activity Timeline')).toBeVisible();
});
```

**Run E2E tests:**
```bash
npx playwright test
```

---

## ?? Manual Testing Checklist

### Test 1: Create Lead (Public Form)

1. ? Start API: `dotnet run --launch-profile https`
2. ? Open Swagger: `https://localhost:5001/swagger`
3. ? Test `POST /api/leads` with sample data
4. ? Verify response contains lead ID
5. ? Check database to confirm lead exists
6. ? Verify lead score was calculated
7. ? Check conflict check was initiated

**SQL Verification:**
```sql
-- Check lead was created
SELECT * FROM legal.Leads ORDER BY CreatedAt DESC;

-- Check score
SELECT Id, Name, Score FROM legal.Leads WHERE Email = 'your-test-email@example.com';

-- Check conflict check ran
SELECT * FROM legal.ConflictChecks WHERE LeadId = 'your-lead-id';

-- Check activity was logged
SELECT * FROM legal.LeadActivities WHERE LeadId = 'your-lead-id';
```

### Test 2: Get Leads with Filters

```bash
# Test filtering by status
GET /api/leads?status=1

# Test filtering by source
GET /api/leads?source=1

# Test filtering by score
GET /api/leads?minScore=70

# Test search
GET /api/leads?search=maria

# Test pagination
GET /api/leads?page=1&pageSize=10

# Test combined filters
GET /api/leads?status=1&minScore=50&practiceArea=4&page=1&pageSize=25
```

### Test 3: Lead Details

```bash
# Get lead by ID
GET /api/leads/{lead-id}

# Should return:
# - Lead basic info
# - Recent conversations (3 most recent)
# - Consultations
# - Activity timeline (10 most recent)
```

### Test 4: Update Lead

```bash
PUT /api/leads/{lead-id}

{
  "name": "Updated Name",
  "status": 2,
  "assignedTo": "lawyer-guid"
}
```

### Test 5: Schedule Consultation

```bash
POST /api/consultations

{
  "leadId": "lead-guid",
  "lawyerId": "lawyer-guid",
  "scheduledAt": "2026-03-20T10:00:00Z",
  "durationMinutes": 60,
  "type": 1,
  "location": "Office - Room 101"
}
```

---

## ?? Testing Checklist

### Backend API Testing ?

- [ ] Create lead (public endpoint)
- [ ] Get all leads (with pagination)
- [ ] Get lead by ID
- [ ] Update lead
- [ ] Delete lead (soft delete)
- [ ] Get lead statistics
- [ ] Filter leads by status
- [ ] Filter leads by source
- [ ] Filter leads by practice area
- [ ] Filter leads by score range
- [ ] Search leads by name/email/phone
- [ ] Schedule consultation
- [ ] Get consultation availability
- [ ] Update consultation status
- [ ] Confirm consultation

### Lead Scoring Algorithm ?

- [ ] New lead gets initial score
- [ ] Urgency affects score correctly
- [ ] Complete information increases score
- [ ] Budget range affects score
- [ ] Multiple contacts increase score
- [ ] Score updates on lead changes

### Conflict Checking ?

- [ ] Conflict check runs on lead creation
- [ ] Checks against existing clients
- [ ] Checks against existing cases
- [ ] Flags potential conflicts
- [ ] Allows manual resolution

### Data Validation ?

- [ ] Required fields are enforced
- [ ] Email format validation
- [ ] Phone number format validation
- [ ] GDPR consent required
- [ ] Enum values validated

---

## ?? Quick Test Script

**Create `test-api.ps1`:**

```powershell
# Test Lead Creation
Write-Host "Testing Lead Creation..." -ForegroundColor Green

$leadData = @{
    name = "Automated Test Lead"
    email = "autotest@example.com"
    phone = "+40721999888"
    source = 1
    practiceArea = 4
    description = "Automated test lead creation"
    urgency = 3
    consentToMarketing = $true
    consentToDataProcessing = $true
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://localhost:5001/api/leads" `
    -Method POST `
    -Body $leadData `
    -ContentType "application/json" `
    -SkipCertificateCheck

$leadId = $response.data
Write-Host "? Lead created with ID: $leadId" -ForegroundColor Green

# Test Get Lead by ID
Write-Host "`nTesting Get Lead..." -ForegroundColor Green
$lead = Invoke-RestMethod -Uri "https://localhost:5001/api/leads/$leadId" `
    -Method GET `
    -SkipCertificateCheck

Write-Host "? Lead retrieved: $($lead.data.name)" -ForegroundColor Green
Write-Host "   Score: $($lead.data.score)" -ForegroundColor Cyan
Write-Host "   Status: $($lead.data.status)" -ForegroundColor Cyan

Write-Host "`n? All tests passed!" -ForegroundColor Green
```

**Run:**
```powershell
.\test-api.ps1
```

---

## ?? Performance Testing

### Load Testing with k6

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10, // 10 virtual users
  duration: '30s',
};

export default function () {
  const payload = JSON.stringify({
    name: 'Load Test Lead',
    email: 'loadtest@example.com',
    phone: '+40721000000',
    source: 1,
    practiceArea: 4,
    description: 'Load test',
    urgency: 2,
    consentToMarketing: true,
    consentToDataProcessing: true,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post('https://localhost:5001/api/leads', payload, params);

  check(res, {
    'status is 201': (r) => r.status === 201,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

**Run load test:**
```bash
k6 run load-test.js
```

---

## ?? Summary

### Testing Priority:

1. **? API Testing (Do This First!)**
   - Use Swagger UI
   - Test all endpoints
   - Verify database changes

2. **?? Component Testing (After React Setup)**
   - Test individual components
   - Mock API calls
   - Use Vitest

3. **?? Integration Testing**
   - Test UI + API together
   - Real API calls
   - Verify full workflows

4. **?? E2E Testing**
   - Full user flows
   - Playwright
   - Automated browser testing

---

## ?? Resources

- **Swagger UI:** `https://localhost:5001/swagger`
- **Postman:** https://www.postman.com/
- **Vitest:** https://vitest.dev/
- **Testing Library:** https://testing-library.com/
- **Playwright:** https://playwright.dev/

---

**Start with API testing using Swagger! It's the easiest way to verify everything works.** ??
