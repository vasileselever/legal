# UI Implementation Plan - Client Intake & Lead Management Platform

## ?? UI Architecture Overview

We'll build a modern, responsive UI using **Blazor WebAssembly** with the following structure:

```
legal/
??? UI/                           # Frontend Components
?   ??? Pages/                    # Blazor Pages (Routes)
?   ?   ??? Leads/
?   ?   ?   ??? LeadsList.razor
?   ?   ?   ??? LeadDetails.razor
?   ?   ?   ??? CreateLead.razor
?   ?   ?   ??? LeadsDashboard.razor
?   ?   ??? Consultations/
?   ?   ?   ??? ConsultationCalendar.razor
?   ?   ?   ??? ScheduleConsultation.razor
?   ?   ?   ??? ConsultationDetails.razor
?   ?   ??? Campaigns/
?   ?   ?   ??? CampaignsList.razor
?   ?   ?   ??? CreateCampaign.razor
?   ?   ?   ??? CampaignBuilder.razor
?   ?   ??? IntakeForms/
?   ?       ??? PublicIntakeForm.razor
?   ?       ??? FormBuilder.razor
?   ??? Components/               # Reusable Components
?   ?   ??? LeadCard.razor
?   ?   ??? LeadScoreBadge.razor
?   ?   ??? ActivityTimeline.razor
?   ?   ??? ConflictCheckAlert.razor
?   ?   ??? StatisticsCard.razor
?   ?   ??? ConversationThread.razor
?   ??? Services/                 # API Service Layer
?   ?   ??? LeadService.cs
?   ?   ??? ConsultationService.cs
?   ?   ??? CampaignService.cs
?   ?   ??? HttpService.cs
?   ??? Models/                   # Client-side Models (DTOs)
?   ?   ??? (Shared DTOs with API)
?   ??? wwwroot/                  # Static Assets
?       ??? css/
?       ?   ??? app.css
?       ??? js/
?           ??? app.js
```

---

## ?? UI Features to Build

### Phase 1: Core Lead Management UI (Priority: P0)

#### 1. **Lead Dashboard** ??
- Overview statistics (total leads, conversion rate, average score)
- Lead source breakdown (pie chart)
- Practice area distribution
- Recent leads list
- Quick filters (status, urgency, assigned to)

#### 2. **Leads List** ??
- Paginated table with filtering
- Sort by: score, created date, status, urgency
- Filter by: status, source, practice area, assigned lawyer, score range
- Search by name, email, phone
- Bulk actions (assign, change status)
- Lead score badges (color-coded)
- Quick actions (view, edit, delete, schedule consultation)

#### 3. **Lead Details Page** ??
- Contact information (editable)
- Lead score with breakdown
- Status timeline (activity feed)
- Conversation thread (WhatsApp, Email, SMS)
- Documents attached
- Consultations scheduled
- Conflict check results
- Quick actions (schedule consultation, convert to client, mark as lost)

#### 4. **Create/Edit Lead** ?
- Form with all lead fields
- Practice area selection
- Urgency level
- Budget range
- Preferred contact method
- GDPR consent checkboxes
- Real-time lead score preview
- Auto-save draft

#### 5. **Public Intake Form** ??
- Clean, simple form for prospects
- Progressive disclosure (multi-step)
- Mobile-optimized
- File upload support
- Thank you page with confirmation
- Embeddable widget option

---

### Phase 2: Consultation Management (Priority: P1)

#### 6. **Consultation Calendar** ??
- Full calendar view (week/month)
- Lawyer availability
- Color-coded by status (scheduled, confirmed, completed, no-show)
- Drag-and-drop rescheduling
- Quick consultation details on hover
- Filter by lawyer, status, type

#### 7. **Schedule Consultation** ?
- Lawyer selection
- Date/time picker with availability checking
- Duration selection (15, 30, 60 minutes)
- Type selection (in-person, phone, video)
- Video meeting link generation
- Email/SMS confirmation preview

#### 8. **Consultation Details** ??
- Lead information
- Scheduled date/time/type
- Video meeting link (if applicable)
- Preparation notes
- Consultation notes (post-meeting)
- Status update (completed, no-show, cancelled)
- Follow-up actions

---

### Phase 3: Campaign Management (Priority: P2)

#### 9. **Campaigns List** ??
- Active campaigns
- Performance metrics (sent, opened, clicked, converted)
- Status (draft, active, paused)
- Quick actions (activate, pause, duplicate, delete)

#### 10. **Campaign Builder** ???
- Visual campaign builder
- Drag-and-drop message sequence
- Email/SMS template editor
- Delay settings between messages
- Practice area filter
- Trigger event selection

#### 11. **Campaign Analytics** ??
- Open rates
- Click-through rates
- Conversion rates
- Unsubscribe rates
- Revenue generated

---

## ?? UI Design System

### Color Scheme (Legal Professional Theme)

```css
/* Primary Colors */
--primary: #1e3a8a;        /* Deep Blue (trust, professionalism) */
--primary-light: #3b82f6;  /* Lighter Blue */
--primary-dark: #1e40af;   /* Darker Blue */

/* Secondary Colors */
--secondary: #059669;      /* Green (success, growth) */
--secondary-light: #10b981;
--secondary-dark: #047857;

/* Status Colors */
--success: #10b981;        /* Green */
--warning: #f59e0b;        /* Amber */
--danger: #ef4444;         /* Red */
--info: #3b82f6;           /* Blue */

/* Urgency Colors */
--urgency-low: #94a3b8;    /* Gray */
--urgency-medium: #f59e0b; /* Amber */
--urgency-high: #f97316;   /* Orange */
--urgency-emergency: #dc2626; /* Red */

/* Lead Score Colors */
--score-hot: #10b981;      /* Green (70-100) */
--score-warm: #f59e0b;     /* Amber (40-69) */
--score-cold: #94a3b8;     /* Gray (0-39) */

/* Neutral Colors */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-500: #6b7280;
--gray-700: #374151;
--gray-900: #111827;
```

### Typography

```css
/* Font Family */
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'Fira Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### Spacing

```css
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-3: 0.75rem;  /* 12px */
--spacing-4: 1rem;     /* 16px */
--spacing-6: 1.5rem;   /* 24px */
--spacing-8: 2rem;     /* 32px */
```

---

## ?? UI Component Library

We'll use **MudBlazor** - a Material Design component library for Blazor:

### Why MudBlazor?
- ? Material Design 3
- ? Rich component set (tables, dialogs, forms, charts)
- ? Responsive and mobile-friendly
- ? Dark mode support
- ? Excellent documentation
- ? Active development
- ? Romanian language support

### Installation

```xml
<PackageReference Include="MudBlazor" Version="6.11.2" />
```

### Key Components We'll Use

| Component | Use Case |
|-----------|----------|
| `MudTable` | Leads list, consultations list |
| `MudDataGrid` | Advanced data grids with sorting/filtering |
| `MudCard` | Lead cards, statistics cards |
| `MudDialog` | Create/edit modals |
| `MudForm` | Form validation |
| `MudTextField` | Input fields |
| `MudSelect` | Dropdowns (status, practice area) |
| `MudDatePicker` | Date selection |
| `MudTimePicker` | Time selection |
| `MudChip` | Status badges, tags |
| `MudProgressLinear` | Lead score visualization |
| `MudBadge` | Notification counts |
| `MudAppBar` | Top navigation |
| `MudDrawer` | Sidebar navigation |
| `MudPagination` | Table pagination |
| `MudChart` | Statistics charts |
| `MudTimeline` | Activity timeline |

---

## ?? Implementation Steps

### Step 1: Setup Blazor UI Project

**Option A: Add Blazor to Existing Project** (Recommended for now)
```bash
# No additional project needed - add Blazor pages to existing API project
```

**Option B: Separate Blazor WebAssembly Project** (For production)
```bash
dotnet new blazorwasm -o legal.UI
cd legal.UI
dotnet add package MudBlazor
```

### Step 2: Install MudBlazor

```bash
cd legal
dotnet add package MudBlazor
```

### Step 3: Configure MudBlazor in Program.cs

```csharp
// Add MudBlazor services
builder.Services.AddMudServices();
```

### Step 4: Create UI Folder Structure

```
legal/
??? UI/
?   ??? Pages/
?   ??? Components/
?   ??? Services/
?   ??? Shared/
```

### Step 5: Build Components

We'll create components in this order:
1. ? **LeadsDashboard** - Overview page
2. ? **LeadsList** - Main leads table
3. ? **LeadDetails** - Detailed view
4. ? **CreateLead** - Create/edit form
5. ? **PublicIntakeForm** - Public form
6. ? **ConsultationCalendar** - Calendar view
7. ? **ScheduleConsultation** - Booking interface
8. ? **CampaignsList** - Campaign management
9. ? **CampaignBuilder** - Visual builder

---

## ?? Responsive Design Strategy

### Breakpoints

```css
/* Mobile First */
--mobile: 0px;      /* Default */
--tablet: 768px;    /* md */
--desktop: 1024px;  /* lg */
--wide: 1280px;     /* xl */
```

### Mobile Optimizations

1. **Leads List:**
   - Switch from table to card layout on mobile
   - Swipeable cards for quick actions
   - Bottom navigation

2. **Lead Details:**
   - Stack sections vertically
   - Collapsible sections
   - Floating action button for quick actions

3. **Public Intake Form:**
   - Single-column layout
   - Large touch targets
   - Step-by-step wizard

4. **Consultation Calendar:**
   - List view instead of calendar on mobile
   - Swipe between days
   - Quick booking modal

---

## ?? Security & Authentication

### JWT Token Management

```csharp
public class AuthService
{
    public async Task<string> GetTokenAsync();
    public async Task<bool> IsAuthenticatedAsync();
    public async Task<UserInfo> GetCurrentUserAsync();
    public async Task LoginAsync(LoginDto dto);
    public async Task LogoutAsync();
}
```

### Protected Routes

```razor
@attribute [Authorize]
@attribute [Authorize(Roles = "Admin, Lawyer")]
```

### API Service Base

```csharp
public class HttpService
{
    private async Task<HttpRequestMessage> CreateRequestAsync(HttpMethod method, string url)
    {
        var request = new HttpRequestMessage(method, url);
        var token = await _authService.GetTokenAsync();
        if (!string.IsNullOrEmpty(token))
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }
        return request;
    }
}
```

---

## ?? Testing Strategy

### Component Testing

```csharp
[Test]
public void LeadCard_DisplaysScore_Correctly()
{
    var lead = new LeadListDto { Score = 85, Name = "Test Lead" };
    var cut = RenderComponent<LeadCard>(parameters => parameters.Add(p => p.Lead, lead));
    
    cut.Find(".lead-score").TextContent.Should().Be("85");
}
```

### E2E Testing

- Use Playwright or Selenium
- Test critical workflows:
  - Create lead ? View details ? Schedule consultation
  - Public intake form submission
  - Lead status transitions

---

## ?? Performance Optimization

### Virtualization for Large Lists

```razor
<MudVirtualize Items="@leads" Context="lead">
    <LeadCard Lead="@lead" />
</MudVirtualize>
```

### Lazy Loading

```razor
@code {
    private async Task LoadLeadsAsync()
    {
        _isLoading = true;
        _leads = await _leadService.GetLeadsAsync(page, pageSize);
        _isLoading = false;
        StateHasChanged();
    }
}
```

### Caching

```csharp
public class LeadService
{
    private readonly IMemoryCache _cache;
    
    public async Task<LeadDetailDto> GetLeadAsync(Guid id)
    {
        return await _cache.GetOrCreateAsync($"lead-{id}", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
            return await _httpService.GetAsync<LeadDetailDto>($"/api/leads/{id}");
        });
    }
}
```

---

## ?? Internationalization (i18n)

### Romanian Language Support

```json
// wwwroot/localization/ro-RO.json
{
  "Leads": "Clien?i Poten?iali",
  "NewLead": "Client Nou",
  "Status": "Status",
  "Score": "Scor",
  "Urgency": "Urgen??",
  "PracticeArea": "Domeniu",
  "CreatedAt": "Creat la",
  "Actions": "Ac?iuni"
}
```

---

## ?? Next Steps

### Immediate Actions:

1. ? Install MudBlazor package
2. ? Configure MudBlazor in Program.cs
3. ? Create UI folder structure
4. ? Build LeadsDashboard (first component)
5. ? Build LeadsList (main interface)
6. ? Build LeadDetails page
7. ? Build PublicIntakeForm
8. ? Test API integration

### Future Enhancements:

- ?? Progressive Web App (PWA) support
- ?? Dark mode
- ?? Advanced analytics dashboards
- ?? Real-time notifications (SignalR)
- ?? Mobile app (MAUI)
- ?? Custom themes per firm
- ?? Multi-language support

---

## ?? Mockup Screenshots

I'll create visual mockups for each key screen in the next steps.

---

**Ready to start building?** Let me know which component you'd like to build first, or I can proceed with creating the core components in order! ??

---

*UI Implementation Plan*  
*Version 1.0*  
*Last Updated: March 16, 2026*  
*Framework: Blazor + MudBlazor + .NET 8*
