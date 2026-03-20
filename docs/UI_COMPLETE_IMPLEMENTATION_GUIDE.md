# 🎨 Complete UI Implementation Guide

## ✅ What We've Set Up

### 1. **MudBlazor Installed** ✅
- Version 9.1.0 (latest)
- Material Design 3 component library
- Perfect for professional legal applications

### 2. **Static Assets Created** ✅
- `wwwroot/index.html` - Main HTML template
- `wwwroot/css/app.css` - Custom CSS with:
  - Professional color scheme (blue for legal)
  - Lead score badges (hot/warm/cold)
  - Urgency badges (low/medium/high/emergency)
  - Status badges (new/contacted/qualified/converted/lost)
  - Activity timeline styles
  - Statistics cards
  - Responsive grid system
  - Utility classes
- `wwwroot/js/app.js` - JavaScript utilities:
  - File download
  - Clipboard copy
  - Currency formatting (RON)
  - Date formatting (Romanian)
  - Local storage helpers
  - JWT token management

---

## 🚀 Two Options for UI Implementation

### **Option A: Separate React Frontend** (Recommended for Production)

Create a modern React application that consumes your .NET API.

#### Advantages:
- ✅ Modern, fast, component-based
- ✅ Large ecosystem (React ecosystem)
- ✅ Easy deployment (separate from API)
- ✅ Better separation of concerns
- ✅ Can use Tailwind CSS, shadcn/ui
- ✅ TypeScript support

#### Quick Start:

```bash
# Create React app with TypeScript
npx create-react-app legal-ui --template typescript

# Or use Vite (faster)
npm create vite@latest legal-ui -- --template react-ts

cd legal-ui

# Install dependencies
npm install axios react-router-dom @tanstack/react-query
npm install @mui/material @emotion/react @emotion/styled  # Material UI
npm install date-fns recharts  # Date formatting and charts
npm install react-hook-form zod @hookform/resolvers  # Forms

# Start dev server
npm run dev
```

---

### **Option B: Blazor Server/WebAssembly** (Integrated with .NET)

Use Blazor to build the UI directly in C# - no JavaScript needed!

#### Advantages:
- ✅ Same language (C#) for frontend and backend
- ✅ Type-safe communication
- ✅ Share DTOs between API and UI
- ✅ MudBlazor already installed
- ✅ No need for separate deployment

#### Quick Start:

Since MudBlazor is already installed, we can add Blazor support to your existing project.

---

## 📋 Recommended Approach: **React Frontend**

Let me create a complete React implementation for you:

### Project Structure:

```
legal-ui/                          # React Frontend Project
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── api/                       # API Services
│   │   ├── apiClient.ts
│   │   ├── leadService.ts
│   │   ├── consultationService.ts
│   │   └── campaignService.ts
│   ├── components/                # Reusable Components
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   ├── leads/
│   │   │   ├── LeadCard.tsx
│   │   │   ├── LeadTable.tsx
│   │   │   ├── LeadScoreBadge.tsx
│   │   │   ├── UrgencyBadge.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── consultations/
│   │   │   ├── ConsultationCalendar.tsx
│   │   │   └── ConsultationCard.tsx
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Modal.tsx
│   │       └── LoadingSpinner.tsx
│   ├── pages/                     # Page Components
│   │   ├── Dashboard.tsx
│   │   ├── leads/
│   │   │   ├── LeadsList.tsx
│   │   │   ├── LeadDetails.tsx
│   │   │   └── CreateLead.tsx
│   │   ├── consultations/
│   │   │   ├── ConsultationCalendar.tsx
│   │   │   └── ScheduleConsultation.tsx
│   │   ├── campaigns/
│   │   │   ├── CampaignsList.tsx
│   │   │   └── CreateCampaign.tsx
│   │   └── public/
│   │       └── PublicIntakeForm.tsx
│   ├── types/                     # TypeScript Types
│   │   ├── lead.ts
│   │   ├── consultation.ts
│   │   └── campaign.ts
│   ├── hooks/                     # Custom Hooks
│   │   ├── useLeads.ts
│   │   ├── useConsultations.ts
│   │   └── useAuth.ts
│   ├── utils/                     # Utilities
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── package.json
└── tsconfig.json
```

---

## 🎨 Complete React Implementation

### 1. **Setup Script** (Run this first)

```bash
# Create and setup React project
cd C:\Users\vasileselever\Desktop\projects\Juridic\legal
npm create vite@latest legal-ui -- --template react-ts
cd legal-ui
npm install
npm install axios react-router-dom @tanstack/react-query date-fns
npm run dev
```

### 2. **Configure Tailwind CSS**

**tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e3a8a',
          light: '#3b82f6',
          dark: '#1e40af',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
    },
  },
  plugins: [],
}
```

### 3. **API Client** (`src/api/apiClient.ts`)

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:5001/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 4. **Lead Service** (`src/api/leadService.ts`)

```typescript
import { apiClient } from './apiClient';
import { Lead, LeadDetail, CreateLeadDto, LeadStatistics } from '../types/lead';

export const leadService = {
  // Get all leads (paginated)
  getLeads: async (params: {
    page?: number;
    pageSize?: number;
    status?: number;
    source?: number;
    minScore?: number;
    search?: string;
  }) => {
    const { data } = await apiClient.get<{ data: Lead[]; pagination: any }>('/leads', { params });
    return data;
  },

  // Get lead by ID
  getLead: async (id: string) => {
    const { data } = await apiClient.get<{ success: boolean; data: LeadDetail }>(`/leads/${id}`);
    return data.data;
  },

  // Create lead
  createLead: async (dto: CreateLeadDto) => {
    const { data } = await apiClient.post<{ success: boolean; data: string }>('/leads', dto);
    return data.data; // Returns lead ID
  },

  // Update lead
  updateLead: async (id: string, dto: Partial<CreateLeadDto>) => {
    const { data} = await apiClient.put(`/leads/${id}`, dto);
    return data;
  },

  // Delete lead
  deleteLead: async (id: string) => {
    await apiClient.delete(`/leads/${id}`);
  },

  // Get statistics
  getStatistics: async (startDate?: string, endDate?: string) => {
    const { data } = await apiClient.get<{ success: boolean; data: LeadStatistics }>('/leads/statistics', {
      params: { startDate, endDate },
    });
    return data.data;
  },
};
```

### 5. **TypeScript Types** (`src/types/lead.ts`)

```typescript
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: LeadSource;
  sourceDetails?: string;
  status: LeadStatus;
  score: number;
  practiceArea: PracticeArea;
  urgency: LeadUrgency;
  assignedToName?: string;
  createdAt: string;
  nextConsultation?: string;
  unreadMessages: number;
}

export interface LeadDetail extends Lead {
  firmId: string;
  description: string;
  budgetRange?: string;
  preferredContactMethod?: string;
  assignedTo?: string;
  convertedToClientId?: string;
  convertedAt?: string;
  consentToMarketing: boolean;
  consentToDataProcessing: boolean;
  conversationCount: number;
  documentCount: number;
  consultationCount: number;
  updatedAt?: string;
  recentConversations: Conversation[];
  consultations: Consultation[];
  activities: Activity[];
}

export interface CreateLeadDto {
  name: string;
  email: string;
  phone: string;
  source: LeadSource;
  sourceDetails?: string;
  practiceArea: PracticeArea;
  description: string;
  urgency: LeadUrgency;
  budgetRange?: string;
  preferredContactMethod?: string;
  assignedTo?: string;
  consentToMarketing: boolean;
  consentToDataProcessing: boolean;
  customFieldsJson?: string;
}

export enum LeadStatus {
  New = 1,
  Contacted = 2,
  Qualified = 3,
  ConsultationScheduled = 4,
  ConsultationCompleted = 5,
  ProposalSent = 6,
  Converted = 7,
  Lost = 8,
  Disqualified = 9,
}

export enum LeadSource {
  Website = 1,
  WhatsApp = 2,
  Facebook = 3,
  Instagram = 4,
  Phone = 5,
  Email = 6,
  Referral = 7,
  WalkIn = 8,
  GoogleAds = 9,
  LinkedIn = 10,
  Other = 11,
}

export enum PracticeArea {
  Civil = 1,
  Commercial = 2,
  Criminal = 3,
  Family = 4,
  RealEstate = 5,
  Labor = 6,
  Corporate = 7,
  Administrative = 8,
  Other = 9,
}

export enum LeadUrgency {
  Low = 1,
  Medium = 2,
  High = 3,
  Emergency = 4,
}

export interface LeadStatistics {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  consultationsScheduled: number;
  convertedLeads: number;
  lostLeads: number;
  conversionRate: number;
  averageScore: number;
  leadsBySource: Record<number, number>;
  leadsByPracticeArea: Record<number, number>;
}
```

### 6. **Custom Hook** (`src/hooks/useLeads.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadService } from '../api/leadService';
import { CreateLeadDto } from '../types/lead';

export const useLeads = (params?: any) => {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => leadService.getLeads(params || {}),
  });
};

export const useLead = (id: string) => {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadService.getLead(id),
    enabled: !!id,
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (dto: CreateLeadDto) => leadService.createLead(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateLeadDto> }) =>
      leadService.updateLead(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
    },
  });
};

export const useLeadStatistics = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['lead-statistics', startDate, endDate],
    queryFn: () => leadService.getStatistics(startDate, endDate),
  });
};
```

---

## 🎨 Example React Components

### 7. **Lead Score Badge** (`src/components/leads/LeadScoreBadge.tsx`)

```typescript
import React from 'react';

interface LeadScoreBadgeProps {
  score: number;
}

export const LeadScoreBadge: React.FC<LeadScoreBadgeProps> = ({ score }) => {
  const getScoreClass = () => {
    if (score >= 70) return 'bg-green-100 text-green-800 border-green-500';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-500';
    return 'bg-gray-100 text-gray-800 border-gray-500';
  };

  const getScoreLabel = () => {
    if (score >= 70) return 'HOT';
    if (score >= 40) return 'WARM';
    return 'COLD';
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 ${getScoreClass()}`}>
      <span className="font-bold text-lg">{score}</span>
      <span className="text-xs font-semibold">{getScoreLabel()}</span>
    </div>
  );
};
```

### 8. **Leads Dashboard** (`src/pages/Dashboard.tsx`)

```typescript
import React from 'react';
import { useLeadStatistics } from '../hooks/useLeads';

export const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = useLeadStatistics();

  if (isLoading) return <div>Se încarcă...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard Clienți Potențiali</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Statistics Cards */}
        <StatCard
          label="Total Clienți Potențiali"
          value={stats?.totalLeads || 0}
          icon="📊"
        />
        <StatCard
          label="Clienți Noi"
          value={stats?.newLeads || 0}
          icon="✨"
          change="+12%"
        />
        <StatCard
          label="Conversii"
          value={stats?.convertedLeads || 0}
          icon="✅"
        />
        <StatCard
          label="Rată Conversie"
          value={`${stats?.conversionRate.toFixed(1) || 0}%`}
          icon="📈"
        />
      </div>

      {/* Charts, Tables, etc. */}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number | string; icon: string; change?: string }> = ({
  label,
  value,
  icon,
  change,
}) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center justify-between mb-2">
      <span className="text-2xl">{icon}</span>
      {change && <span className="text-sm text-green-600 font-medium">{change}</span>}
    </div>
    <div className="text-3xl font-bold text-primary mb-1">{value}</div>
    <div className="text-sm text-gray-500 uppercase tracking-wide">{label}</div>
  </div>
);
```

---

## 🚀 Next Steps

### Choose Your Path:

**Path 1: React Frontend (Recommended)**
1. Run the setup script above
2. Copy the provided files
3. Configure environment variables
4. Start dev server: `npm run dev`

**Path 2: Blazor UI (Integrated)**
1. I'll create Blazor components
2. Configure routing
3. Add authentication
4. Test with your API

**Which path would you like to take?** Let me know and I'll provide complete implementation! 🎯
