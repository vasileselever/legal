# API Testing Examples - Client Intake & Lead Management

Complete collection of API requests for testing the Client Intake & Lead Management Platform.

---

## Base URL
```
Development: https://localhost:5001
Production: https://api.legalro.ro
```

---

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Public endpoints (no auth required):
- `POST /api/leads` - Intake form submission
- `GET /api/consultations/availability/{lawyerId}` - Check availability

---

## 1. Lead Management

### 1.1 Create Lead (Public Intake Form)

**Endpoint:** `POST /api/leads`  
**Auth:** None (AllowAnonymous)

```json
POST https://localhost:5001/api/leads
Content-Type: application/json

{
  "name": "Maria Ionescu",
  "email": "maria.ionescu@example.com",
  "phone": "+40721234567",
  "source": 1,
  "sourceDetails": "Website Homepage - Contact Form",
  "practiceArea": 4,
  "description": "Nevoie de ajutor cu divor?. Suntem c?s?tori?i de 10 ani, avem 2 copii minori (8 ?i 5 ani). Propriet??i comune: apartament în Bucure?ti ?i o ma?in?. So?ul meu dore?te divor?ul, dar eu nu sunt de acord cu condi?iile propuse pentru custodia copiilor.",
  "urgency": 3,
  "budgetRange": "5000-10000 RON",
  "preferredContactMethod": "WhatsApp",
  "consentToMarketing": true,
  "consentToDataProcessing": true,
  "customFieldsJson": "{\"hasChildren\":true,\"childrenAges\":[8,5],\"hasProperty\":true}"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "message": "Lead created successfully"
}
```

**Lead Scoring:** Automatically calculated
- Urgency (High): 30 points
- Budget provided: 20 points
- Complete information: 20 points
- Source (Website): 7 points
- **Total Score: 77/100** ? "Hot Lead"

---

### 1.2 Get All Leads (Paginated & Filtered)

**Endpoint:** `GET /api/leads`  
**Auth:** Required

```http
GET https://localhost:5001/api/leads?page=1&pageSize=25&status=1&minScore=70&practiceArea=4
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `pageSize` (int): Items per page (default: 25)
- `status` (LeadStatus): Filter by status
  - 1 = New, 2 = Contacted, 3 = Qualified, 4 = ConsultationScheduled, 7 = Converted
- `source` (LeadSource): Filter by source (1=Website, 2=WhatsApp, 9=GoogleAds)
- `practiceArea` (PracticeArea): Filter by area (4=Family, 3=Criminal)
- `assignedTo` (Guid): Filter by assigned lawyer
- `minScore` (int): Minimum lead score (0-100)
- `search` (string): Search in name, email, phone, description

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Maria Ionescu",
      "email": "maria.ionescu@example.com",
      "phone": "+40721234567",
      "source": 1,
      "sourceDetails": "Website Homepage",
      "status": 1,
      "score": 77,
      "practiceArea": 4,
      "urgency": 3,
      "assignedToName": "Andrei Popescu",
      "createdAt": "2024-12-16T10:30:00Z",
      "nextConsultation": "2024-12-18T14:00:00Z",
      "unreadMessages": 3
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "totalPages": 1,
    "totalCount": 15,
    "hasPrevious": false,
    "hasNext": false
  }
}
```

---

### 1.3 Get Lead Details

**Endpoint:** `GET /api/leads/{id}`  
**Auth:** Required

```http
GET https://localhost:5001/api/leads/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "firmId": "firm-guid",
    "name": "Maria Ionescu",
    "email": "maria.ionescu@example.com",
    "phone": "+40721234567",
    "source": 1,
    "sourceDetails": "Website Homepage",
    "status": 4,
    "score": 77,
    "practiceArea": 4,
    "description": "Nevoie de ajutor cu divor?...",
    "urgency": 3,
    "budgetRange": "5000-10000 RON",
    "preferredContactMethod": "WhatsApp",
    "assignedTo": "lawyer-guid",
    "assignedToName": "Av. Andrei Popescu",
    "convertedToClientId": null,
    "convertedAt": null,
    "consentToMarketing": true,
    "consentToDataProcessing": true,
    "conversationCount": 5,
    "documentCount": 2,
    "consultationCount": 1,
    "createdAt": "2024-12-16T10:30:00Z",
    "updatedAt": "2024-12-16T15:45:00Z",
    "recentConversations": [
      {
        "id": "conv-guid",
        "channel": 2,
        "message": "Bun? ziua, când putem programa o consulta?ie?",
        "sender": "Maria",
        "isFromLead": true,
        "messageTimestamp": "2024-12-16T12:00:00Z",
        "attachmentUrl": null,
        "isRead": true
      }
    ],
    "consultations": [
      {
        "id": "consultation-guid",
        "leadId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "lawyerId": "lawyer-guid",
        "lawyerName": "Av. Andrei Popescu",
        "scheduledAt": "2024-12-18T14:00:00Z",
        "durationMinutes": 30,
        "type": 3,
        "status": 1,
        "videoMeetingLink": "https://meet.legalro.ro/abc123",
        "location": null,
        "isConfirmed": true,
        "consultationNotes": null
      }
    ],
    "activities": [
      {
        "id": "activity-guid",
        "activityType": "ConsultationScheduled",
        "description": "Consultation scheduled for 2024-12-18 14:00 with Av. Andrei Popescu",
        "userName": "Av. Andrei Popescu",
        "createdAt": "2024-12-16T15:45:00Z"
      },
      {
        "id": "activity-guid-2",
        "activityType": "LeadCreated",
        "description": "Lead created from Website",
        "userName": null,
        "createdAt": "2024-12-16T10:30:00Z"
      }
    ]
  },
  "message": "Lead retrieved successfully"
}
```

---

### 1.4 Update Lead

**Endpoint:** `PUT /api/leads/{id}`  
**Auth:** Required

```json
PUT https://localhost:5001/api/leads/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": 3,
  "assignedTo": "lawyer-guid",
  "score": 85,
  "urgency": 4
}
```

**Note:** All fields are optional. Only provided fields will be updated.

**Response (200 OK):**
```json
{
  "success": true,
  "data": true,
  "message": "Lead updated successfully"
}
```

---

### 1.5 Delete Lead (Soft Delete)

**Endpoint:** `DELETE /api/leads/{id}`  
**Auth:** Required

```http
DELETE https://localhost:5001/api/leads/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": true,
  "message": "Lead deleted successfully"
}
```

---

### 1.6 Get Lead Statistics

**Endpoint:** `GET /api/leads/statistics`  
**Auth:** Required

```http
GET https://localhost:5001/api/leads/statistics?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalLeads": 150,
    "newLeads": 45,
    "qualifiedLeads": 30,
    "consultationsScheduled": 25,
    "convertedLeads": 20,
    "lostLeads": 15,
    "conversionRate": 13.33,
    "averageScore": 65.5,
    "leadsBySource": {
      "1": 60,
      "2": 30,
      "9": 40,
      "7": 20
    },
    "leadsByPracticeArea": {
      "4": 50,
      "3": 40,
      "1": 30,
      "2": 30
    }
  },
  "message": "Statistics retrieved successfully"
}
```

---

## 2. Consultation Management

### 2.1 Get Lawyer Availability (Public)

**Endpoint:** `GET /api/consultations/availability/{lawyerId}`  
**Auth:** None (AllowAnonymous)

```http
GET https://localhost:5001/api/consultations/availability/lawyer-guid?startDate=2024-12-20&endDate=2024-12-27&durationMinutes=30
```

**Query Parameters:**
- `startDate` (DateTime): Start of date range
- `endDate` (DateTime): End of date range
- `durationMinutes` (int): Consultation duration (default: 30)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    "2024-12-20T09:00:00Z",
    "2024-12-20T09:30:00Z",
    "2024-12-20T10:00:00Z",
    "2024-12-20T10:30:00Z",
    "2024-12-20T14:00:00Z",
    "2024-12-20T14:30:00Z",
    "2024-12-23T09:00:00Z"
  ],
  "message": "Found 42 available time slots"
}
```

**Note:** Automatically excludes weekends and existing consultations. Business hours: 9am-5pm.

---

### 2.2 Schedule Consultation

**Endpoint:** `POST /api/consultations`  
**Auth:** Required

```json
POST https://localhost:5001/api/consultations
Authorization: Bearer {token}
Content-Type: application/json

{
  "leadId": "lead-guid",
  "lawyerId": "lawyer-guid",
  "scheduledAt": "2024-12-20T14:00:00Z",
  "durationMinutes": 30,
  "type": 3,
  "location": null,
  "preparationNotes": "Client has 2 children, shared property. Review divorce process in Romanian law."
}
```

**Consultation Types:**
- 1 = InPerson
- 2 = Phone
- 3 = Video

**Response (201 Created):**
```json
{
  "success": true,
  "data": "consultation-guid",
  "message": "Consultation scheduled successfully"
}
```

**Side Effects:**
- Lead status automatically updated to "ConsultationScheduled"
- Activity created in lead timeline
- Video meeting link generated (if type = 3)
- TODO: Send confirmation email and calendar invite

---

### 2.3 Get All Consultations (Filtered)

**Endpoint:** `GET /api/consultations`  
**Auth:** Required

```http
GET https://localhost:5001/api/consultations?lawyerId=lawyer-guid&status=1&startDate=2024-12-20&endDate=2024-12-27
Authorization: Bearer {token}
```

**Query Parameters:**
- `lawyerId` (Guid): Filter by lawyer
- `status` (ConsultationStatus): 1=Scheduled, 2=Confirmed, 3=Completed, 4=NoShow, 5=Cancelled
- `startDate` (DateTime): Start date filter
- `endDate` (DateTime): End date filter

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "consultation-guid",
      "leadId": "lead-guid",
      "lawyerId": "lawyer-guid",
      "lawyerName": "Av. Andrei Popescu",
      "scheduledAt": "2024-12-20T14:00:00Z",
      "durationMinutes": 30,
      "type": 3,
      "status": 2,
      "videoMeetingLink": "https://meet.legalro.ro/abc123",
      "location": null,
      "isConfirmed": true,
      "consultationNotes": null
    }
  ],
  "message": "Retrieved 1 consultations"
}
```

---

### 2.4 Confirm Consultation

**Endpoint:** `POST /api/consultations/{id}/confirm`  
**Auth:** Required

```http
POST https://localhost:5001/api/consultations/consultation-guid/confirm
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": true,
  "message": "Consultation confirmed successfully"
}
```

**Side Effects:**
- `isConfirmed` set to true
- `confirmedAt` timestamp recorded
- Status updated to "Confirmed"

---

### 2.5 Update Consultation Status

**Endpoint:** `PATCH /api/consultations/{id}/status`  
**Auth:** Required

```json
PATCH https://localhost:5001/api/consultations/consultation-guid/status
Authorization: Bearer {token}
Content-Type: application/json

3
```

**Status Values:**
- 1 = Scheduled
- 2 = Confirmed
- 3 = Completed
- 4 = NoShow
- 5 = Cancelled

**Response (200 OK):**
```json
{
  "success": true,
  "data": true,
  "message": "Consultation status updated successfully"
}
```

**Side Effects:**
- If status = Completed: Lead status ? "ConsultationCompleted", completedAt timestamp set
- If status = NoShow: Activity created in lead timeline

---

## 3. Lead Sources Reference

```
1  = Website
2  = WhatsApp
3  = Facebook
4  = Instagram
5  = Phone
6  = Email
7  = Referral
8  = WalkIn
9  = GoogleAds
10 = LinkedIn
11 = Other
```

---

## 4. Practice Areas Reference

```
1 = Civil
2 = Commercial
3 = Criminal
4 = Family
5 = RealEstate
6 = Labor
7 = Corporate
8 = Administrative
9 = Other
```

---

## 5. Lead Status Reference

```
1 = New                    # Just submitted
2 = Contacted              # Initial contact made
3 = Qualified              # Passed qualification
4 = ConsultationScheduled  # Consultation booked
5 = ConsultationCompleted  # Consultation done
6 = ProposalSent          # Engagement letter sent
7 = Converted             # Became client
8 = Lost                  # Did not convert
9 = Disqualified          # Not a good fit
```

---

## 6. Lead Urgency Reference

```
1 = Low       # Not urgent
2 = Medium    # Within a week
3 = High      # Within days
4 = Emergency # Immediate (arrested, hearing tomorrow)
```

---

## 7. Testing Workflow Example

### Full Lead-to-Client Journey

**Step 1: Prospect Fills Intake Form**
```bash
curl -X POST https://localhost:5001/api/leads \
  -H "Content-Type: application/json" \
  -k \
  -d '{"name":"Ion Popescu","email":"ion@example.com","phone":"+40721111111","source":1,"practiceArea":3,"description":"Acuzat de infrac?iune rutier?","urgency":4,"consentToDataProcessing":true}'
```

**Step 2: System Assigns Lead Score**
- Automatic: Score calculated (e.g., 82/100 for emergency + complete info)

**Step 3: Lawyer Reviews Lead**
```bash
curl -X GET https://localhost:5001/api/leads/lead-guid \
  -H "Authorization: Bearer token" \
  -k
```

**Step 4: Schedule Consultation**
```bash
curl -X POST https://localhost:5001/api/consultations \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -k \
  -d '{"leadId":"lead-guid","lawyerId":"lawyer-guid","scheduledAt":"2024-12-21T10:00:00Z","durationMinutes":30,"type":3}'
```

**Step 5: Consultation Completed**
```bash
curl -X PATCH https://localhost:5001/api/consultations/consultation-guid/status \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -k \
  -d '3'
```

**Step 6: Convert to Client**
```bash
curl -X PUT https://localhost:5001/api/leads/lead-guid \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -k \
  -d '{"status":7}'
```

---

## 8. Postman Collection

Import this collection into Postman for easy testing:

```json
{
  "info": {
    "name": "LegalRO - Client Intake API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Leads",
      "item": [
        {
          "name": "Create Lead",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Test Lead\",\n  \"email\": \"test@example.com\",\n  \"phone\": \"+40721234567\",\n  \"source\": 1,\n  \"practiceArea\": 4,\n  \"description\": \"Test inquiry\",\n  \"urgency\": 2,\n  \"consentToDataProcessing\": true\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/leads",
              "host": ["{{baseUrl}}"],
              "path": ["api", "leads"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://localhost:5001"
    }
  ]
}
```

---

## Success! ??

You now have complete API documentation and testing examples for the Client Intake & Lead Management Platform.

**Next Steps:**
1. Stop the running API
2. Build and apply the database migration
3. Start the API
4. Test these endpoints using curl, Postman, or Swagger UI
5. Build the frontend to consume these APIs

Happy testing! ??
