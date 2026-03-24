# ?? LegalRO Case Management System - Complete User Guide

**Version:** 1.0  
**Last Updated:** December 2024  
**Product:** LegalRO Case Management System for Romanian Law Firms  
**Platform:** .NET 8 + React + TypeScript

---

## ?? Table of Contents

1. [Overview](#overview)
2. [User Types & Roles](#user-types--roles)
3. [Getting Started](#getting-started)
4. [Complete User Workflows](#complete-user-workflows)
5. [Settings & Configuration](#settings--configuration)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)
8. [Support](#support)

---

## ?? Overview

LegalRO is a comprehensive digital case management platform designed specifically for Romanian law firms. It provides an integrated suite of tools for managing the complete legal practice lifecycle.

### Key Features

? **Lead Management** - Client acquisition and qualification with automated scoring  
? **Case Management** - Complete case lifecycle tracking with Romanian NCPC deadline calculator  
? **Document Management** - Secure storage, version control, and OCR search  
? **Deadline Tracking** - NCPC-compliant deadline calculator with Romanian holidays  
? **Consultations** - Scheduling, calendar integration, and video conferencing  
? **Time & Billing** - Time tracking, Romanian-format invoices (TVA 19%), and trust accounts  
? **Legal Research** - AI-powered Romanian law research (ÎCCJ jurisprudence, legislation, doctrine)  
? **Document Automation** - Generate documents from templates with guided interviews  
? **Client Portal** - Secure client access to cases, documents, and billing  
? **Reporting** - Comprehensive analytics and business intelligence  

### Romanian Legal Specialization

- **NCPC Deadline Calculator** - Automated calculation per Romanian Civil Procedure Code
- **Romanian Courts** - Complete hierarchy (ÎCCJ, Cur?i de Apel, Tribunale, Judec?torii)
- **Romanian Templates** - Legal document templates compliant with Romanian law
- **TVA Invoicing** - 19% Romanian VAT with E-FACTURA integration (planned)
- **Romanian Language** - Full UI in Romanian with bilingual document support
- **GDPR Compliant** - Romanian and EU data protection compliance

---

## ?? User Types & Roles

### 1. **Admin** ?

**Full system access:**
- ? User management and permissions
- ? Firm-wide settings and configuration
- ? All cases and financial data
- ? System integrations and exports
- ? Audit logs and compliance reports

### 2. **Lawyer (Avocat)** ??

**Primary user role:**
- ? Manage assigned and firm cases
- ? Create/edit cases and documents
- ? Legal research and document generation
- ? Time tracking and invoicing
- ? Client portal access
- ? Consultation scheduling
- ? Deadline and task management

### 3. **Legal Secretary** ??

**Administrative support:**
- ? View all cases (limited editing)
- ? Document upload and organization
- ? Consultation scheduling
- ? Calendar management
- ? Client communications
- ? No financial data access

### 4. **Client** ??

**Portal-only access:**
- ? View own cases and status
- ? Download shared documents
- ? Upload documents
- ? Message lawyer securely
- ? View invoices and payments
- ? Schedule consultations (if enabled)
- ? No access to other clients or firm data

---

## ?? Getting Started

### Step 1: Access the System

**Login URL:**
```
Development: https://localhost:5173/admin/login
Production:  https://your-domain.com/admin/login
```

**Demo Accounts:**
```
Email:    avocat.test@avocat-test.ro
Password: Test@123456

Email:    maria.ionescu@avocat-test.ro
Password: Test@123456
```

### Step 2: Dashboard Overview

After login, your personalized dashboard displays:

**Statistics Cards:**
- ?? Total Clien?i Poten?iali (Total Leads)
- ? Clien?i Noi (New Leads - this month)
- ? Conversii (Conversions)
- ?? Rat? Conversie (Conversion Rate)

**Activity Widgets:**
- Recent leads with scores (?? HOT / ?? WARM / ? COLD)
- Upcoming consultations (today & this week)
- Approaching deadlines (next 7 days)
- Recent case activities

**Quick Actions:**
- ? Adaug? Client Nou (Add New Lead)
- ?? Programeaz? Consulta?ie (Schedule Consultation)
- ?? Genereaz? Document (Generate Document)
- ?? Cercetare Juridic? (Legal Research)

---

## ?? Complete User Workflows

---

## **WORKFLOW 1: Lead Management**

Lead management captures potential clients, qualifies them, and converts them into paying clients.

### ?? Step 1: Capture New Lead

#### **Option A: Public Contact Form**

**Client submits form at:** `https://your-domain.com/contact`

**Form Fields:**
- **Nume Complet** (Full Name) *required
- **Email** *required
- **Telefon** (Phone) *required
- **Domeniu** (Practice Area) *required - dropdown
- **Descriere** (Description) *required - 2000 chars max
- **Urgen??** (Urgency): Sc?zut?/Medie/Ridicat?/Urgen??
- **Consim??mânt GDPR** checkboxes

**System automatically:**
- Creates lead record
- Calculates **lead score** (0-100)
- Sends confirmation email
- Notifies assigned lawyer
- Initiates conflict check
- Logs activity

**Score Example:**
```
Complete info: +10
Description 250 chars: +15
Urgency High: +10
Practice area Civil: +5
Total: 50 + 40 = 90 ? ?? HOT lead
```

---

#### **Option B: Manual Lead Creation**

1. **Dashboard** ? **Lead-uri** ? **"+ Client Nou"**
2. Fill in form (contact, source, practice area, description, etc.)
3. Click **"Salveaz?"**

**Result:**
- Lead appears with status: **"Nou"**
- Badge color-coded by score (HOT/WARM/COLD)
- Assigned lawyer notified
- Conflict check initiated

---

### ?? Step 2: Review & Qualify Lead

1. **Dashboard** ? **Lead-uri**
2. Find lead (sort, filter, search)
3. Click lead name ? **Lead Details Page**

**Lead Details includes:**
- Contact information (editable)
- Lead score breakdown
- Status timeline
- Conversation history
- Documents
- Consultations
- Conflict check results
- Activity log

---

### ?? Step 3: Contact & Communicate

**Log interactions in Conversations tab:**

1. Click **"+ Adaug? conversa?ie"**
2. Select type: Email, Phone, WhatsApp, SMS, Meeting, Note
3. Enter message/notes
4. Click **"Trimite"** or **"Salveaz?"**

**System updates:**
- Lead status ? "Contactat"
- Lead score +5
- Last contact date

**Example: Log Phone Call**
```
Tip: ?? Apel telefonic
Durat?: 15 minute
Rezultat: ? Contact reu?it

Note:
- Client dore?te divor? prin acord
- Situa?ie: copii minori, propriet??i
- Buget: 6000 RON
- Urgen??: ridicat?
- Dore?te consulta?ie fa?? în fa??
```

---

### ?? Step 4: Schedule Consultation

1. From Lead Details: **"Programeaz? Consulta?ie"** button
2. Fill in form:
   - Lawyer
   - Date & Time
   - Duration (15/30/45/60/90/120 min)
   - Type: Phone / Video / In-person
   - Location (if in-person)
   - Preparation notes
3. Click **"Programeaz?"**

**System actions:**
- Consultation created
- Lead status ? "Consulta?ie Programat?"
- Calendar event created
- Email confirmations sent
- Reminders scheduled (24h, 1h before)

---

### ? Step 5: Conduct Consultation

**Before (prep):**
- Review client info, documents, conversations
- Start timer if billing

**After:**
1. Find consultation ? Click **"Finalizat?"**
2. Add consultation notes:
```
Sumar discu?ie:
- Client wants mutual consent divorce
- Situation: 8 years marriage, 2 minor children
- Properties: apartment (co-owned), car
- Agreements: shared custody, alternating visits

Issues identified:
- Prenup incomplete (needs clarification)
- No written custody agreement (recommend mediation)
- Apartment valuation needed

Recommendations:
- Notarial divorce (faster, cheaper)
- Mediation for custody (avoid court)
- Authorized evaluator for apartment

Next steps:
- Client brings property documents (by Dec 22)
- Schedule mediation session
- Draft custody agreement for approval

Cost estimate:
- Firm fee: 4000 RON (notarial agreement)
- Notary fees: ~500 RON
- Mediation: 300 RON/session (est. 2 sessions)
- Total: ~5000 RON

Conversion probability: 90% (HOT)
Client satisfied, wants to proceed immediately.
```

3. Select outcome:
   - (•) ? Client interested - Likely conversion
   - ( ) ?? Client undecided - Follow-up needed
   - ( ) ? Client not interested
4. Set next action
5. Click **"Salveaz? ?i finalizeaz?"**

**System updates:**
- Consultation status ? "Finalizat?"
- Lead status ? "Consulta?ie Finalizat?"
- Lead score updated (+15 if interested)
- Tasks created
- Client email sent

---

### ?? Step 6: Convert Lead to Client

**When to Convert:**
- ? Client agrees to retain services
- ? Consultation successful
- ? Fee agreement reached
- ? Engagement letter signed/scheduled
- ? Retainer scheduled/received
- ? Conflict check passed

**Process:**

1. Open Lead Details
2. Click **"Converte?te în Client"** (top-right)
3. Conversion dialog appears
4. Choose: Create case now? Yes/No
5. If yes, fill in case form
6. Click **"Confirm? conversie"**

**System creates:**
- New client record (CLI-2024-00042)
- Case record (if selected) (CASE-2024-00089)
- Transfers all data (docs, conversations, etc.)
- Sends portal invitation to client
- Updates analytics

**Conversion Complete! ??**

---

## **WORKFLOW 2: Case Management**

### ?? Step 1: Create Case

**Prerequisites:**
- Client exists in system
- Conflict check completed
- Engagement letter signed

**Process:**

1. **Dashboard** ? **Dosare** (Cases) ? **"+ Dosar Nou"**
2. Fill in case form:

```
???????????????????????????????????????????
INFORMA?II DE BAZ?
???????????????????????????????????????????

Titlu dosar: *
Litigiu comercial - Recuperare crean??
ABC SRL vs. XYZ SRL

Num?r dosar: (auto or custom)
LRO-2024-00090

Client: *
ABC SRL (CUI: RO12345678)

???????????????????????????????????????????
CLASIFICARE
???????????????????????????????????????????

Domeniu practic: *
[Drept Comercial ?]

Tip dosar: *
(•) ?? Litigiu
( ) ?? Consultan??
( ) ?? Tranzac?ional

???????????????????????????????????????????
DETALII LITIGIU
???????????????????????????????????????????

Instan??:
[Tribunalul Bucure?ti ?]

Num?r dosar instan??:
12345/3/2024

Parte advers?:
XYZ SRL (CUI: RO87654321)

Calitate client:
(•) Reclamant
( ) Pârât

???????????????????????????????????????????
VALOARE ?I FACTURARE
???????????????????????????????????????????

Valoare dosar:
50000 RON

Aranjament facturare:
(•) Onorariu orar: 300 RON/or?
( ) Onorariu fix
( ) Succès fee
( ) Retainer

Retainer solicitat:
5000 RON

???????????????????????????????????????????
ECHIP?
???????????????????????????????????????????

Avocat responsabil: *
[Maria Ionescu ?]

Membri echip?:
? Maria Ionescu
? Ion Popescu
? Ana Georgescu

???????????????????????????????????????????

[? Creeaz? dosar]
```

3. Click **"? Creeaz? dosar"**

**System creates:**
- Case record (CASE-2024-00090)
- Unique case number (LRO-2024-00090)
- Folder structure
- Default tasks
- Calendar events
- Team notifications

---

### ?? Step 2: Document Management

**Upload Documents:**

1. Open case ? **Documente** tab
2. **Drag & drop** or **"Încarc? Documente"**
3. Add metadata:
   - Title
   - Date
   - Category (Pleadings, Evidence, Correspondence, etc.)
   - Tags
   - Confidentiality level

**Supported formats:** PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT, MSG, EML  
**Max file size:** 50 MB per file

**Features:**
- ? Version control (upload new version)
- ? Preview (PDF, images)
- ? Full-text search (OCR for scanned PDFs)
- ? Folder organization (2 levels deep)
- ? Secure sharing with expiration
- ? Download/print
- ? E-signature integration (planned)

---

### ?? Step 3: Romanian NCPC Deadline Calculator

**Add Deadline:**

1. Case ? **Termene** tab ? **"+ Termen Nou"**
2. **Option A: NCPC Automated Calculation**

```
Tip: NCPC (Romanian procedural deadline)

Tip termen:
[R?spuns la cita?ie (25 zile) ?]
- R?spuns cita?ie (Response to summons): 25 days
- Apel (Appeal): 30 days
- Recurs (Recourse): 15 days
- Depunere probe (Evidence submission): varies
- [Other NCPC deadlines...]

Data eveniment: [?? 01 decembrie 2024]
(Date served / judgment date)

? System automatically calculates:
? Accounts for weekends
? Accounts for Romanian holidays
? Extends to next working day if needed

Termen calculat: [?? 26 decembrie 2024]
(Auto-adjusted for Christmas holiday)

Remind me:
? 14 days before
? 7 days before
? 3 days before
? 1 day before

Prioritate: [Critic? ?]
Alocat c?tre: [Maria Ionescu ?]
```

3. **Option B: Manual Deadline**
   - Enter title, due date manually
   - Select priority: Low/Medium/High/Critical

4. Click **"Salveaz?"**

**System Actions:**
- Deadline added to case timeline
- Calendar event created
- Email reminders scheduled
- SMS reminders (if enabled)
- Dashboard shows upcoming deadlines
- Overdue deadlines highlighted in RED
- Managing partner notified if deadline missed

**Romanian Courts Integrated:**
- Înalta Curte de Casa?ie ?i Justi?ie (ÎCCJ)
- Cur?i de Apel (15 courts)
- Tribunale (42 courts)
- Judec?torii (188 courts)

**Romanian Holidays Built-in:**
- 2024-2025 calendar
- Auto-updates annually
- Custom firm holidays (optional)

---

### ? Step 4: Task Management

**Create Task:**

1. Case ? **Task-uri** tab ? **"+ Task Nou"**
2. Fill in:

```
Title: Draft complaint
Description: Draft complaint for commercial recovery
             Include all evidence and legal arguments
             Review with senior partner before filing

Assigned to: [Ion Popescu ?]
Due date: [?? 22 decembrie 2024]
Priority: [High ?]
Status: [Not Started ?]
Type: [Drafting ?]

Attachments: (optional)
? Upload relevant documents

[Creaza]
```

**Task Management Features:**
- ? Assign to multiple team members
- ? Create subtasks (break down into steps)
- ? Attach documents
- ? Add comments and @mentions
- ? Time tracking on tasks
- ? Kanban board view (drag-drop between columns)
- ? Email notifications
- ? Due date reminders
- ? Task dependencies

**Task Statuses:**
- Not Started
- In Progress
- Blocked (awaiting input)
- Review
- Completed

---

## **WORKFLOW 3: Legal Research (AI-Powered)**

### ?? Step 1: Search Romanian Law

1. **Dashboard** ? **Cercetare AI** (Legal Research)
2. **Type your legal question** in Romanian:

```
Example queries:

"Care sunt conditiile pentru concedierea 
unui angajat?"

"Cum se calculeaza termenul de prescriptie 
in materie civila?"

"Ce documente sunt necesare pentru divor? 
prin acord mutual?"

"Care sunt obliga?iile vânz?torului în 
cazul viciilor ascunse?"
```

3. (Optional) Select **Practice Area** filter
4. Click **"Cerceteaza"** or press **Ctrl+Enter**

**System searches:**
- Romanian legislation (Coduri, Legi, OUG, HG)
- ÎCCJ jurisprudence (High Court decisions)
- Legal doctrine (textbooks, articles)
- Results in < 10 seconds

---

### ?? Step 2: Review Results

**Answer Section:**
- Structured markdown answer
- Key points highlighted
- Specific articles cited
- Examples included
- Step-by-step procedures (if applicable)

**Confidence Score:**
```
80-100%: ?? Ridicat? (High) - Reliable answer
60-79%:  ?? Medie (Medium) - Good answer, verify
0-59%:   ?? Sc?zut? (Low) - Use with caution
```

**Sources Section:**

Each source displays:
- **Type badge**: Lege / Hotarare / Jurispruden?? / Doctrina
- **Title & Reference**: Full citation
- **Relevance Score**: 0-100% (how relevant to query)
- **Excerpt**: Relevant snippet with highlights
- **Link**: To original source (if available)

**Example Source:**
```
??????????????????????????????????????????????
? [Lege] Codul Muncii                        ?
? Legea nr. 53/2003, Art. 61-65              ?
? Relevance: 95% ?????????????????????       ?
??????????????????????????????????????????????
? "Concedierea pentru motive care nu ?in de  ?
? persoana salariatului poate fi dispus? în  ?
? cazul desfiin??rii locului de munc?..."    ?
??????????????????????????????????????????????
? [?? Sursa original?]                       ?
??????????????????????????????????????????????
```

**Actions Available:**
- ? **Save research** (bookmark for later)
- ?? **Export to PDF**
- ?? **Copy to clipboard**
- ?? **Share with team** (via email or link)
- ?? **Add to case notes** (attach to specific case)
- ?? **Email to client** (formatted summary)

---

### ?? Step 3: Research History

1. Go to **Cercetare AI** ? **Istoric** tab
2. View all past searches:

```
??????????????????????????????????????????????
? 18 decembrie 2024, 10:30                   ?
? "Care sunt conditiile pentru concedierea   ?
?  unui angajat?"                            ?
?                                            ?
? Confidence: 92% | Sources: 5 | ? Saved    ?
? [Vezi din nou] [Export] [?terge]           ?
??????????????????????????????????????????????
? 17 decembrie 2024, 14:15                   ?
? "Termen prescrip?ie materie civil?"       ?
?                                            ?
? Confidence: 88% | Sources: 4               ?
? [Vezi din nou] [Export] [?terge]           ?
??????????????????????????????????????????????
```

**Filter:** **"Doar salvate"** (Only Bookmarked)

**Search history:**
- Searchable by keyword
- Sortable by date
- Filterable by confidence score
- Automatically cleaned after 90 days (configurable)

---

## **WORKFLOW 4: Document Automation**

### ?? Step 1: Choose Template

1. **Dashboard** ? **Documente Auto** (Document Automation)
2. **Browse ?abloane** (Templates) tab
3. **Filter by:**
   - Category (Contract, Court Document, Corporate, etc.)
   - Practice Area
   - Search by name

**Available Templates (examples):**

**?? Contracts:**
- Service Agreement (Contract de prest?ri servicii)
- Sales Contract (Contract vânzare-cump?rare)
- NDA (Acord de confiden?ialitate)
- Lease Agreement (Contract de închiriere)
- Loan Agreement (Contract de împrumut)
- Partnership Agreement (Contract de parteneriat)

**??? Court Documents:**
- Complaint (Cerere de chemare în judecat?)
- Response (Întâmpinare)
- Appeal (Apel)
- Motion/Petition (Cerere)
- Evidence List (List? probe)

**?? Corporate:**
- Articles of Incorporation (Act constitutiv)
- Shareholder Agreement (Acord asocia?i)
- Board Resolution (Hot?râre CA/AGA)
- GDPR Documents (Politici GDPR)

**?? Other:**
- Power of Attorney (Procur?)
- Will (Testament)
- Notice (Soma?ie)
- Settlement Agreement (Acord de tranzac?ie)

4. **Click template** to preview
5. Click **"? Începe Interviul"** (Start Interview)

---

### ?? Step 2: Complete Interview

**Guided Form Interface:**

```
??????????????????????????????????????????????
?  CONTRACT PREST?RI SERVICII                ?
?  Progres: ???????????? 60% (3/5 sec?iuni)  ?
??????????????????????????????????????????????
?  SEC?IUNEA 3: TERMENI ?I CONDI?II          ?
??????????????????????????????????????????????
?                                            ?
?  Durat? contract: *                        ?
?  (•) Determinat?                           ?
?  ( ) Nedeterminat?                         ?
?                                            ?
?  Dac? determinat?, specifica?i perioada:   ?
?  Data început: [?? 01 ianuarie 2025]       ?
?  Data sfâr?it:  [?? 31 decembrie 2025]      ?
?                                            ?
?  Valoare total? servicii: *                ?
?  [50000] RON                               ?
?                                            ?
?  Modalitate de plat?:                      ?
?  [Lunar, în tran?e de 5000 RON ?]         ?
?  - Plat? unic? la semnare                  ?
?  - Lunar, în tran?e egale                  ?
?  - La finalizarea lucr?rilor               ?
?  - Personalizat                            ?
?                                            ?
?  Termen de plat? (zile): [30]              ?
?                                            ?
?  Include clauz? penalit??i întârziere?     ?
?  [Dropdown: Da ?]                          ?
?                                            ?
?  [Se afi?eaz? doar dac? Da selectat]       ?
?  Penalitate (% pe zi): [0.1]               ?
?                                            ?
??????????????????????????????????????????????
?  [? Înapoi]  [?? Salveaz? draft]           ?
?                            [Urm?toarea ?] ?
??????????????????????????????????????????????
```

**Interview Features:**
- ? **Auto-populate** from case data (client names, case number, etc.)
- ? **Real-time validation** (required fields, format checks)
- ? **Conditional logic** (if X selected, show Y fields)
- ? **Save draft** and continue later
- ? **Navigation**: Next, Previous, Jump to section
- ? **Help text** for each field (hover for tooltip)
- ? **Progress bar** shows completion percentage

**Field Types:**
- ?? Text input
- ?? Date picker
- ?? Currency (RON, EUR, USD)
- ?? Checkbox
- ?? Radio buttons
- ?? Dropdown select
- ?? Number input
- ?? Special: CNP (Romanian personal ID), CUI (company tax ID)

---

### ?? Step 3: Generate Document

1. Complete all required sections (progress = 100%)
2. Click **"?? Genereaz? Document"** (Generate Document)
3. **System processes** (5-10 seconds):
   - Inserts answers into template
   - Applies Romanian legal formatting
   - Inserts mandatory clauses
   - Checks for completeness
4. **Preview generated document:**
   - HTML preview
   - Bilingual if template supports (RO + EN)
5. **Quality Check** (optional):

```
??????????????????????????????????????????????
?  VERIFICARE CALITATE                       ?
??????????????????????????????????????????????
?  Status: ? Passed                          ?
?  Readability Score: 85/100                 ?
?                                            ?
?  Verific?ri efectuate:                     ?
?  ? Completeness: All fields filled        ?
?  ? Consistency: No contradictions         ?
?  ? Legal compliance: All clauses valid    ?
?  ??  Readability: Complex sentences (2)    ?
?                                            ?
?  Recomand?ri:                              ?
?  - Simplify sentence in Section 3.2        ?
?  - Add definition for technical term       ?
?                                            ?
?  [?? Vezi detalii] [?? Editeaz? r?spunsuri]?
??????????????????????????????????????????????
```

6. **Actions:**

```
[??? Printeaz? PDF]  [?? Email client]
[?? Salveaz? în dosar]  [?? Editeaz?]
[?? Export DOCX]  [?? Partajeaz? link]
```

**Generated document includes:**
- Professional Romanian legal formatting
- Signature blocks
- Date placeholders
- Page numbers, headers/footers
- Table of contents (if long document)
- Annexes (if applicable)

---

## **WORKFLOW 5: Time Tracking & Billing**

### ?? Time Tracking

**Option A: Manual Entry**

1. **Dashboard** ? **Facturare** (Billing) ? **Pontaj** (Time Tracking)
2. Click **"+ Adauga pontaj"** (Add Time Entry)
3. Fill in:

```
Dosar: [LRO-2024-00090 ?]
       ABC vs. XYZ - Commercial Recovery

Data lucrare: [?? 18 decembrie 2024]
Ore lucrate: [2.5]
Descriere: *
Draft complaint, review evidence, 
legal research on commercial claims

Tip activitate: [Drafting ?]
- Research
- Drafting
- Review
- Court appearance
- Client meeting
- Phone call
- Email
- Travel

Facturabil: ? Da  ? Nu

Tarif orar: [300 RON/or?] (from case settings)
Total: 750 RON (auto-calculated)

[Salveaz?]
```

**Option B: Timer (Real-time)**

1. Start work on case
2. Click **[?? Start Timer]** on case page
3. Timer runs in background
4. **Pause/Resume** as needed
5. Click **[?? Stop Timer]** when done
6. System auto-logs time entry

**Timer shows:**
```
?? Timer Running: 01:23:45
   Case: LRO-2024-00090
   Started: 10:30 AM
   
[?? Pause]  [?? Stop]  [? Add note]
```

**Time Entry Features:**
- ? Round to nearest 6 minutes (0.1 hour)
- ? Minimum billable increment (15 min)
- ? Overtime rates (if applicable)
- ? Non-billable time tracking
- ? Bulk edit multiple entries
- ? Export to Excel
- ? Approval workflow (if required)

---

### ?? Create Invoice

1. **Facturare** ? **Facturi** (Invoices) ? **"+ Creeaza factura"**
2. Fill in invoice details:

```
???????????????????????????????????????????
CLIENT & DOSAR
???????????????????????????????????????????

Client: [ABC SRL ?]
       CUI: RO12345678
       
Dosar: [LRO-2024-00090 ?]
       Litigiu comercial

Perioada facturare:
Data început: [?? 01 decembrie 2024]
Data sfâr?it:  [?? 15 decembrie 2024]

???????????????????????????????????????????
PONTAJ (Time Entries)
???????????????????????????????????????????

? 18 dec - 2.5h - Draft complaint - 750 RON
? 19 dec - 1.0h - Client meeting - 300 RON
? 20 dec - 3.0h - Legal research - 900 RON
? 21 dec - 0.5h - Phone call - 150 RON (non-billable)

Subtotal pontaj: 1,950 RON

???????????????????????????????????????????
CHELTUIELI (Expenses)
???????????????????????????????????????????

? Court filing fee - 100 RON
? Notary certification - 50 RON
? Travel expenses - 75 RON

Subtotal cheltuieli: 150 RON

???????????????????????????????????????????
TOTAL
???????????????????????????????????????????

Subtotal:     2,100.00 RON
TVA (19%):      399.00 RON
?????????????????????????
TOTAL:        2,499.00 RON

Data scaden??: [?? 25 decembrie 2024]
                (10 zile de la emisie)

Note factura: (op?ional)
[Plat? prin transfer bancar. Detalii cont
 în subsol factur?.]

???????????????????????????????????????????

[?? Previzualizare]  [? Genereaz? Factura]
```

3. Click **"?? Previzualizare"** to review

**Romanian Invoice Format:**
```
??????????????????????????????????????????????
?         CABINET AVOCAT TEST SRL            ?
?    Str. Victoriei nr. 25, Bucure?ti        ?
?    CUI: RO12345678 | Reg Com: J40/123     ?
??????????????????????????????????????????????
?                                            ?
?  FACTUR? Nr. 2024-089                      ?
?  Data: 15 decembrie 2024                   ?
?  Scaden??: 25 decembrie 2024               ?
?                                            ?
??????????????????????????????????????????????
?  CLIENT:                                   ?
?  ABC SRL                                   ?
?  CUI: RO12345678                           ?
?  Adresa: ...                               ?
??????????????????????????????????????????????
?  Nr. ? Descriere        ? Ore ? Tarif?Total?
??????????????????????????????????????????????
?  1  ? Servicii juridice? 6.5 ? 300?1,950 ?
?     ? perioada 01-15   ?     ?    ?      ?
?     ? decembrie 2024    ?     ?    ?      ?
?  2  ? Taxe judec?torie ?  -  ?  - ?  100 ?
?  3  ? Taxe notariale   ?  -  ?  - ?   50 ?
??????????????????????????????????????????????
?                        Subtotal?  2,100.00?
?                      TVA (19%) ?    399.00?
?                    ?????????????????????? ?
?                          TOTAL ?  2,499.00?
?                                ?      RON ?
??????????????????????????????????????????????
```

4. Click **"? Genereaz? Factura"**

**System Actions:**
- Invoice created with unique number (2024-089)
- Status: Draft ? Issued
- Email sent to client (PDF attached)
- Client portal updated
- Accounting system notified (if integrated)
- Payment reminder scheduled

5. **Send to Client:**
   - **Email with PDF** attachment
   - **Client portal** notification
   - **Print and mail** (if requested)

---

### ?? Record Payment

**When payment received:**

1. **Facturare** ? **Plati** (Payments) ? **"Inregistreaza plata"**
2. Fill in:

```
Factura: [2024-089 ?]
        ABC SRL - 2,499.00 RON

Data plata: [?? 20 decembrie 2024]
Suma: [2499.00 RON]

Metoda de plata:
(•) Transfer bancar
( ) Numerar
( ) Card
( ) Cec
( ) PayPal
( ) Altul

Referinta tranzactie: (optional)
[TRX123456789]

Cont bancar: [Banca XYZ - RON ?]

Note: (optional)
[Plat? integral?, f?r? reduceri]

[Inregistreaza Plata]
```

**System updates:**
- Invoice status: Issued ? Paid
- Payment date recorded
- Client account balance updated
- Receipt generated (if requested)
- Accounting system updated

**Payment tracking:**
- Partial payments supported
- Payment plans/installments
- Late payment fees (auto-calculated)
- Payment reminders (auto-sent)
- Aging reports (30/60/90 days)

---

## **WORKFLOW 6: Client Portal**

### ?? Client Access

**Initial Setup:**

1. **Admin/Lawyer** converts lead or creates client
2. **System automatically:**
   - Creates client portal account
   - Generates secure invitation link
   - Sends invitation email:

```
Subject: Invita?ie Portal Client - Cabinet Avocat Test

Bun? ziua,

Dosarul dumneavoastr? a fost creat în sistemul 
nostru. Pentru acces 24/7 la informa?ii despre 
dosar, v? rug?m s? v? activa?i contul:

[?? Activeaz? Cont]

Link valabil 7 zile.

Cu stim?,
Cabinet Avocat Test
```

3. **Client clicks link** ? Password setup page
4. **Client sets password** (min 8 chars, complexity required)
5. **Client logs in** at: `https://portal.your-domain.com`

---

### ?? Client Dashboard

**After login, client sees:**

```
??????????????????????????????????????????????
?  Bun venit, Maria Popescu                  ?
??????????????????????????????????????????????
?  ?? DOSARELE MELE (2)                       ?
??????????????????????????????????????????????
?  ?? LRO-2024-00089: Divor? prin acord      ?
?     Status: ?? Activ                        ?
?     Avocat: Maria Ionescu                  ?
?     Next deadline: 22 decembrie             ?
?     [Vezi detalii]                         ?
?                                            ?
?  ?? LRO-2024-00075: Revizuire contract     ?
?     Status: ? Finalizat                    ?
?     Avocat: Ion Popescu                    ?
?     Finalizat: 10 decembrie                ?
?     [Vezi detalii]                         ?
??????????????????????????????????????????????
?  ?? DOCUMENTE (5)                           ?
??????????????????????????????????????????????
?  ?? contract_divort_draft.pdf              ?
?     Ad?ugat: 18 dec | 1.2 MB              ?
?     [?? Descarc?] [??? Previzualizare]      ?
?                                            ?
?  ?? certificat_casatorie.pdf               ?
?     Înc?rcat de dvs: 15 dec | 856 KB      ?
?     [?? Descarc?]                          ?
?                                            ?
?  [?? Încarc? document nou]                 ?
??????????????????????????????????????????????
?  ?? MESAJE (3 noi)                          ?
??????????????????????????????????????????????
?  ?? Maria Ionescu                          ?
?     Azi, 10:30                             ?
?     "Am finalizat draft-ul contractului..."?
?     [Cite?te & R?spunde]                   ?
?                                            ?
?  [?? Mesaj nou c?tre avocat]               ?
??????????????????????????????????????????????
?  ?? FACTURI (1 neplatit?)                   ?
??????????????????????????????????????????????
?  ?? Factura #2024-089                      ?
?     Suma: 2,499.00 RON                     ?
?     Scadent?: 25 decembrie 2024            ?
?     Status: ?? Neplatit?                    ?
?     [??? Vezi factura] [?? Pl?te?te online]  ?
??????????????????????????????????????????????
?  ?? CONSULTA?II PROGRAMATE (1)              ?
??????????????????????????????????????????????
?  ?? 22 decembrie 2024, 10:00               ?
?     Cu: Maria Ionescu                      ?
?     Tip: ?? La cabinet                      ?
?     Loca?ie: Str. Victoriei nr. 25         ?
?     [Reprogrameaz?] [Anuleaz?]             ?
??????????????????????????????????????????????
```

---

### ?? Client Capabilities

**What Clients Can Do:**

1. **View Case Status & Timeline:**
   - Current phase/status
   - Recent activities
   - Next steps
   - Deadlines
   - Case timeline history

2. **Download Documents:**
   - All shared documents
   - Invoices and receipts
   - Signed contracts
   - Court documents (if permitted)

3. **Upload Documents:**
   - Click **"?? Încarc? document"**
   - Drag & drop or browse
   - Add description
   - Lawyer notified automatically

4. **Message Lawyer:**
   - Secure messaging
   - Attach files
   - Read receipts
   - Email notification to lawyer

5. **View & Pay Invoices:**
   - View all invoices
   - Download PDF
   - Pay online (credit card, PayPal - if enabled)
   - View payment history

6. **E-Sign Documents** (planned):
   - Electronic signature
   - Legally binding
   - Timestamped
   - Audit trail

7. **Schedule Consultations** (if enabled):
   - View lawyer availability
   - Book appointment
   - Receive confirmations
   - Reschedule/cancel

---

### ?? Security Features

**Portal Security:**
- ?? **Encrypted connection** (HTTPS/TLS)
- ?? **Strong password** requirements
- ?? **Session timeout** (30 minutes inactivity)
- ?? **Email verification** required
- ?? **IP whitelist** (optional)
- ?? **2FA/MFA** (two-factor authentication - planned)
- ?? **Audit trail** (all actions logged)
- ?? **Failed login alerts**

**Data Access:**
- Clients see **only their own cases**
- No access to firm data
- No access to other clients
- Documents expire after sharing period (optional)
- Download limits (optional)

---

## ?? Settings & Configuration

### **User Management** (Admin Only)

**Invite New User:**

1. **Dashboard** ? **Utilizatori** (Users) ? **"+ Invita Utilizator"**
2. Fill in:

```
First Name: [Ion]
Last Name: [Popescu]
Email: [ion.popescu@firm.ro]
Role: [Avocat ?]
      - Admin
      - Avocat (Lawyer)
      - Secretar (Legal Secretary)

[Trimite Invitatie]
```

3. User receives invitation email
4. User sets password and logs in

**Manage Users:**
- View all users
- Edit roles and permissions
- Deactivate users (preserves data)
- Reset passwords
- View login history

---

### **Firm Settings** (Admin Only)

**Configure Firm Details:**

1. **Dashboard** ? **Settings** ? **Firm Settings**

```
???????????????????????????????????????????
INFORMA?II FIRM?
???????????????????????????????????????????

Nume firm?: [Cabinet Avocat Test SRL]
Logo: [?? Upload Logo] (max 2MB, PNG/JPG)

Adres?:
[Str. Victoriei nr. 25, Bucure?ti, Sector 1]

Telefon: [+40 21 123 4567]
Email: [contact@avocat-test.ro]
Website: [www.avocat-test.ro]

???????????????????????????????????????????
INFORMA?II LEGALE
???????????????????????????????????????????

CUI (Cod Unic Identificare):
[RO12345678]

Num?r Registrul Comer?ului:
[J40/1234/2020]

Baroul:
[Baroul Bucure?ti ?]

Num?r înregistrare avocat:
[1234/2020]

???????????????????????????????????????????
FACTURARE
???????????????????????????????????????????

Tarif orar implicit: [300 RON/or?]

Cont bancar principal:
Banca: [Banca XYZ]
IBAN: [RO49AAAA1B31007593840000]
Beneficiar: [Cabinet Avocat Test SRL]

Termen de plat? implicit: [30 zile]
Penalitate întârziere: [0.1% pe zi]

???????????????????????????????????????????
NOTIFIC?RI
???????????????????????????????????????????

SMTP Settings (email):
Server: [smtp.gmail.com]
Port: [587]
User: [contact@avocat-test.ro]
Password: [••••••••]
? Enable SSL

SMS Provider (optional):
[Twilio ?]
API Key: [••••••••]

???????????????????????????????????????????
INTEGR?RI
???????????????????????????????????????????

Calendar:
? Google Calendar
? Microsoft Outlook
? iCal

Cloud Storage:
? Local (server)
? Dropbox
? Google Drive
? OneDrive

E-Signature:
? CertSIGN
? DocuSign
? Adobe Sign

???????????????????????????????????????????

[?? Salveaz? Set?ri]
```

---

### **Document Templates** (Admin/Lawyer)

**Upload Custom Templates:**

1. **Settings** ? **Document Templates** ? **"+ Template Nou"**
2. Upload DOCX file with variables:
   - `{{client_name}}`
   - `{{case_number}}`
   - `{{court}}`
   - `{{date}}`
   - etc.
3. Define template fields (guided form questions)
4. Test template generation
5. Activate for firm use

---

### **Billing Rates** (Admin)

**Configure Hourly Rates:**

```
???????????????????????????????????????????
TARIFE ORARE
???????????????????????????????????????????

Tarif implicit firm?: [300 RON/or?]

Tarife personalizate per avocat:
???????????????????????????????????????????
? Maria Ionescu    ? 350 RON/or?          ?
? Ion Popescu      ? 300 RON/or?          ?
? Ana Georgescu    ? 200 RON/or? (Junior) ?
???????????????????????????????????????????

Tarife personalizate per client:
???????????????????????????????????????????
? ABC SRL          ? 280 RON/or? (Retainer)?
? XYZ SRL          ? 350 RON/or?          ?
???????????????????????????????????????????

Tarife personalizate per dosar:
???????????????????????????????????????????
? LRO-2024-00090   ? 320 RON/or?          ?
???????????????????????????????????????????

[?? Salveaz?]
```

**Rate Priority (highest to lowest):**
1. Case-specific rate
2. Client-specific rate
3. Lawyer-specific rate
4. Firm default rate

---

## ?? Best Practices

### **For Lawyers:**

1. ? **Log all client communication immediately**
   - Don't wait until end of day
   - Include date, time, duration, summary
   - Tag communications by type (phone, email, meeting)

2. ? **Set deadlines for every case milestone**
   - Use NCPC calculator for procedural deadlines
   - Set internal deadlines (earlier than court deadlines)
   - Assign responsibilities clearly

3. ? **Use templates for common documents**
   - Saves 60%+ time on drafting
   - Ensures consistency
   - Reduces errors

4. ? **Track time daily (not month-end)**
   - Capture time immediately after work
   - Use timer feature for accuracy
   - Add detailed descriptions

5. ? **Update case status regularly**
   - After every significant event
   - Before client meetings
   - At least weekly

6. ? **Prioritize HOT leads (score 70-100)**
   - Contact within 24 hours
   - Schedule consultation ASAP
   - Higher conversion rate

7. ? **Check dashboard daily for:**
   - Overdue deadlines
   - Upcoming consultations
   - New leads
   - Client messages
   - Task assignments

---

### **For Legal Secretaries:**

1. ? **Schedule consultations efficiently**
   - Check lawyer availability first
   - Send confirmations immediately
   - Follow up 24 hours before

2. ? **Upload documents with proper naming**
   - Format: `YYYY-MM-DD_CaseNumber_DocumentType.pdf`
   - Example: `2024-12-18_LRO-00090_Contract.pdf`
   - Add metadata (category, tags)

3. ? **Confirm consultations 24h in advance**
   - Phone or email client
   - Verify location/time
   - Send reminder email

4. ? **Maintain calendar accuracy**
   - Update immediately when changes occur
   - Block time for court appearances
   - Add travel time for in-person meetings

5. ? **Send client reminders**
   - Document deadlines
   - Payment due dates
   - Upcoming consultations

---

### **For Managing Partners:**

1. ? **Review firm dashboard weekly**
   - Lead conversion rates
   - Revenue trends
   - Team utilization
   - Outstanding invoices

2. ? **Monitor team performance**
   - Billable hours per lawyer
   - Case load balance
   - Client satisfaction
   - Deadline compliance

3. ? **Track conversion rates**
   - Lead ? Consultation: Target 60%+
   - Consultation ? Client: Target 70%+
   - Overall: Target 40%+

4. ? **Review financial reports**
   - Monthly revenue vs. target
   - Accounts receivable aging
   - Collection rate (target 95%+)
   - Work-in-progress (WIP)

5. ? **Ensure no overdue deadlines**
   - Daily review of deadline report
   - Escalate critical deadlines
   - Implement backup systems

6. ? **Monitor client satisfaction**
   - Portal usage rates
   - Response times
   - Client feedback
   - Retention rates

---

## ?? Troubleshooting

### **Can't Login?**

**Problem:** Invalid email or password

**Solutions:**
1. Verify email address (check for typos)
2. Check Caps Lock is off
3. Try "Forgot Password" link
4. Check spam folder for password reset email
5. Contact admin for password reset
6. Verify account is active (not deactivated)

---

### **Document Won't Upload?**

**Problem:** Upload fails or hangs

**Solutions:**
1. **Check file size:** Max 50MB per file
2. **Verify format:** PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT, MSG, EML
3. **Check internet connection:** Try speed test
4. **Try different browser:** Chrome, Firefox, Edge
5. **Disable browser extensions:** AdBlock, etc. can interfere
6. **Clear browser cache:** Ctrl+Shift+Del
7. **Try smaller file:** Compress PDF or images
8. **Contact support** if issue persists

---

### **Deadline Not Calculated Correctly?**

**Problem:** NCPC calculator gives wrong date

**Solutions:**
1. **Verify event date entered correctly:** Double-check date format
2. **Check Romanian holiday calendar:** Ensure holidays are up-to-date
3. **Confirm deadline type selected:** Response vs. Appeal vs. Recourse
4. **Manual verification:** Calculate manually to confirm
5. **Report bug** if calculator is incorrect
6. **Update holiday calendar** (Settings ? Holidays)

**Common NCPC Deadlines:**
- Response to summons: 25 days from service
- Appeal: 30 days from judgment
- Recourse: 15 days from appeal judgment
- Evidence submission: Varies by court order

---

### **Invoice Total Wrong?**

**Problem:** Calculated total doesn't match expected

**Solutions:**
1. **Review time entries included:** Check each entry is correct
2. **Check hourly rates:** Verify rate per lawyer/case/client
3. **Verify TVA 19%:** Romanian VAT should be 19% of subtotal
4. **Recalculate manually:**
   - Subtotal = Sum of (hours × rate) + expenses
   - TVA = Subtotal × 0.19
   - Total = Subtotal + TVA
5. **Check for discounts:** Any applied discounts?
6. **Verify currency:** All amounts in same currency (RON)?
7. **Contact support** if still incorrect

**Example Calculation:**
```
Time entries: 6.5 hours × 300 RON = 1,950 RON
Expenses: 150 RON
Subtotal: 2,100 RON
TVA (19%): 2,100 × 0.19 = 399 RON
Total: 2,100 + 399 = 2,499 RON ?
```

---

### **Can't Access Client Portal?**

**Problem:** Client can't login to portal

**Solutions:**
1. **Check invitation email:** Was invitation sent?
2. **Verify activation:** Did client activate account?
3. **Check link expiration:** Invitation links expire after 7 days
4. **Resend invitation:** Admin can resend from Clients page
5. **Check email address:** Verify correct email used
6. **Try password reset:** Use "Forgot Password"
7. **Check browser compatibility:** Modern browser required
8. **Disable VPN:** VPNs can sometimes block access
9. **Contact support** for manual account activation

---

### **Email Notifications Not Sending?**

**Problem:** Users not receiving email notifications

**Solutions:**
1. **Check spam/junk folder:** Emails may be filtered
2. **Verify email address:** Correct in user profile?
3. **Check SMTP settings:** Settings ? Firm Settings ? Notifications
4. **Test SMTP connection:** Send test email
5. **Check email provider limits:** Daily sending limits?
6. **Whitelist sender domain:** Add to safe senders list
7. **Check notification preferences:** User may have disabled
8. **Contact email provider** if still failing
9. **Contact support** for alternative SMTP setup

---

### **Slow Performance?**

**Problem:** System is slow or laggy

**Solutions:**
1. **Check internet speed:** Run speed test (min 10 Mbps)
2. **Close unused tabs:** Too many tabs slow browser
3. **Clear browser cache:** Ctrl+Shift+Del
4. **Disable extensions:** AdBlock, etc. can slow down
5. **Try different browser:** Chrome, Firefox, Edge
6. **Check system resources:** Close unused applications
7. **Update browser:** Use latest version
8. **Report to support:** May be server-side issue

---

### **Lost Data / Accidental Deletion?**

**Problem:** Accidentally deleted lead/case/document

**Solutions:**
1. **Check if soft-deleted:** Some items go to "Trash" (30-day retention)
2. **Contact admin immediately:** Can restore from backup
3. **Check activity log:** See when/who deleted
4. **Daily backups:** System backs up daily (can restore up to 30 days)
5. **Document recovery:** Deleted docs retained 90 days
6. **Prevention:** Enable "Confirm before delete" in Settings

---

## ?? Support

### **Help Resources:**

**Built-in Help:**
- ?? **Help Center** - Comprehensive guides and FAQs (click ? icon)
- ? **Tooltips** - Hover over any field for instant help
- ?? **Context Help** - Right-click any page for contextual help
- ?? **Interactive Tour** - First-time login tutorial

**External Resources:**
- ?? **Video Tutorials** - Step-by-step video guides (YouTube)
- ?? **User Guide** - This document (docs/USER_GUIDE.md)
- ?? **API Documentation** - For developers (Swagger at /swagger)
- ?? **Community Forum** - User community discussions

---

### **Contact Support:**

**Live Chat:**
- ?? **In-app chat** (bottom-right bubble icon)
- **Hours:** 9am-6pm EET, Monday-Friday
- **Response time:** Usually < 5 minutes

**Email Support:**
- ?? **Email:** support@legalro.ro
- **Response time:** < 24 hours (business days)
- **Include:** Your firm name, user email, description, screenshots

**Phone Support (Premium):**
- ?? **Phone:** +40 21 123 4567
- **Hours:** 9am-5pm EET, Monday-Friday
- **For:** Premium/Enterprise customers only

**Emergency Support (Critical Issues):**
- ?? **24/7 Emergency Line:** +40 722 123 456
- **For:** System outages, data loss, security incidents
- **Premium customers only**

---

### **Support Ticket System:**

**Submit Ticket:**
1. Dashboard ? ? Help ? **"Submit Ticket"**
2. Fill in:
   - Category: Bug / Feature Request / Question / Other
   - Priority: Low / Medium / High / Critical
   - Description
   - Screenshots (optional)
3. Submit
4. Receive ticket number via email
5. Track status in Help Center

**Response Times (SLA):**
- Critical: < 1 hour
- High: < 4 hours
- Medium: < 24 hours
- Low: < 48 hours

---

## ?? Complete User Journey Summary

```
COMPLETE WORKFLOW OVERVIEW
???????????????????????????????????????????

1. LEAD ACQUISITION
   ?? Public form submission OR
   ?? Manual lead creation
   
2. LEAD QUALIFICATION
   ?? Review lead details & score
   ?? Contact client (phone/email/WhatsApp)
   ?? Qualify based on fit & urgency
   
3. CONSULTATION
   ?? Schedule consultation
   ?? Conduct consultation
   ?? Document discussion & recommendations
   ?? Assess conversion probability
   
4. LEAD CONVERSION ? CLIENT
   ?? Client agrees to retain services
   ?? Convert lead to client in system
   ?? Create case (optional)
   ?? Send portal invitation
   
5. CASE CREATION & SETUP
   ?? Create case with all details
   ?? Assign team members
   ?? Set up billing arrangement
   ?? Create default tasks
   
6. DOCUMENT MANAGEMENT
   ?? Upload case documents
   ?? Organize in folders
   ?? Share with client (via portal)
   ?? Version control & OCR search
   
7. DEADLINE TRACKING
   ?? Add NCPC procedural deadlines
   ?? Set internal deadlines
   ?? Schedule reminders
   ?? Monitor compliance
   
8. LEGAL RESEARCH (AI-powered)
   ?? Search Romanian law
   ?? Review AI-generated answers
   ?? Check sources & citations
   ?? Save research to case
   
9. DOCUMENT AUTOMATION
   ?? Select template
   ?? Complete guided interview
   ?? Generate document
   ?? Save to case or email client
   
10. TIME TRACKING & BILLING
    ?? Track time (manual or timer)
    ?? Log expenses
    ?? Generate invoice (TVA 19%)
    ?? Send to client
    
11. INVOICE & PAYMENT
    ?? Client receives invoice
    ?? Client pays (bank/card/portal)
    ?? Record payment in system
    ?? Generate receipt
    
12. CLIENT PORTAL ACCESS
    ?? Client views case status
    ?? Downloads/uploads documents
    ?? Messages lawyer
    ?? Views invoices
    
13. REPORTING & ANALYTICS
    ?? Firm dashboard metrics
    ?? Lead conversion reports
    ?? Financial reports
    ?? Team performance analytics

???????????????????????????????????????????
```

---

## ?? Next Steps

### **Start Using LegalRO Today:**

**Day 1: Setup**
1. ? Login at `https://localhost:5173/admin/login`
2. ? Complete your profile (Settings ? Profile)
3. ? Configure firm settings (Admin only)
4. ? Invite team members (Admin)
5. ? Take the interactive tour (? icon)

**Day 2-3: Core Features**
1. ? Create your first lead (manual or test public form)
2. ? Schedule a test consultation
3. ? Upload test documents
4. ? Try legal research (search Romanian law)
5. ? Generate a document from template

**Week 1: Full Integration**
1. ? Convert first lead to client
2. ? Create first case with all details
3. ? Set up NCPC deadlines
4. ? Track first time entry
5. ? Generate first invoice
6. ? Invite first client to portal
7. ? Explore mobile app (if available)

**Ongoing: Optimization**
1. ? Review dashboard weekly
2. ? Monitor conversion rates
3. ? Optimize workflows
4. ? Train team on best practices
5. ? Provide feedback for improvements

---

## ?? System Requirements

**Minimum:**
- **Internet:** 5 Mbps download, 2 Mbps upload
- **Browser:** Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
- **Screen:** 1280x720 resolution
- **OS:** Windows 10+, macOS 10.14+, Linux (modern distro)

**Recommended:**
- **Internet:** 25+ Mbps download, 10+ Mbps upload
- **Browser:** Latest Chrome or Firefox
- **Screen:** 1920x1080 or higher
- **RAM:** 4 GB+ available
- **Storage:** 1 GB+ free space (for browser cache)

**Mobile:**
- **iOS:** 14.0 or later
- **Android:** 10.0 or later
- **Responsive web app** works on all mobile browsers

---

## ?? Security & Compliance

**Data Protection:**
- ? **GDPR Compliant** - Romanian and EU regulations
- ? **ISO 27001** - Information security standard
- ? **SOC 2 Type II** - Security audit (planned)
- ? **Data residency** - Romanian/EU data centers
- ? **Encryption at rest** - AES-256
- ? **Encryption in transit** - TLS 1.3
- ? **Daily backups** - 30-day retention
- ? **Disaster recovery** - 4-hour RTO, 1-hour RPO

**Professional Secrecy (Law 51/1995):**
- ? **Lawyer-client privilege** - Protected communications
- ? **Access control** - Role-based permissions
- ? **Audit trails** - All actions logged
- ? **Data isolation** - Firm data separation

---

## ?? Glossary

**Key Terms:**

- **Lead** - Potential client who has contacted the firm
- **Lead Score** - 0-100 rating of lead quality and conversion probability
- **HOT Lead** - Lead with score 70-100 (high conversion probability)
- **WARM Lead** - Lead with score 40-69 (medium conversion probability)
- **COLD Lead** - Lead with score 0-39 (low conversion probability)
- **Conversion** - Process of converting lead to paying client
- **Case (Dosar)** - Legal matter being handled for a client
- **NCPC** - Romanian Civil Procedure Code (Noul Cod de Procedur? Civil?)
- **TVA** - Romanian VAT (Value Added Tax) - 19%
- **CUI** - Cod Unic de Identificare (Romanian company tax ID)
- **CNP** - Cod Numeric Personal (Romanian personal ID number)
- **ÎCCJ** - Înalta Curte de Casa?ie ?i Justi?ie (Romanian High Court)
- **Retainer** - Advance payment for legal services
- **WIP** - Work In Progress (unbilled time and expenses)
- **Aging** - Time since invoice issued (30/60/90 days)

---

## ?? Feedback & Feature Requests

**We want to hear from you!**

**Submit Feedback:**
- ?? Dashboard ? ? Help ? **"Send Feedback"**
- ?? Email: feedback@legalro.ro
- ?? In-app chat (bottom-right)

**Feature Requests:**
- ?? Dashboard ? ? Help ? **"Request Feature"**
- Include:
  - Feature description
  - Use case / problem it solves
  - Priority (Nice to have / Important / Critical)
  - Willingness to beta test

**Community:**
- ?? Join our user community forum
- ?? Follow us on LinkedIn
- ?? Subscribe to YouTube channel

---

**?? Your legal practice, digitized and optimized!** ??????

---

*LegalRO Case Management System*  
*Version 1.0 | December 2024*  
*Built with .NET 8 + React + TypeScript*  
*Made with ?? for Romanian law firms*

---

**© 2024 LegalRO. All rights reserved.**

---
