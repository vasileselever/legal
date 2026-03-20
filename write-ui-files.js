const fs = require('fs');
const base = 'C:/Users/vasileselever/Desktop/projects/Juridic/legal/legal-ui/src';

// ?? leadService.ts (full rewrite with all types) ??????????????????????????????
fs.writeFileSync(base + '/api/leadService.ts', `
import { apiClient } from './apiClient';

export interface LeadStats {
  totalLeads: number; newLeads: number; qualifiedLeads: number;
  consultationsScheduled: number; convertedLeads: number; lostLeads: number;
  conversionRate: number; averageScore: number;
  leadsBySource: Record<string, number>;
  leadsByPracticeArea: Record<string, number>;
}

export interface LeadItem {
  id: string; name: string; email: string; phone: string;
  source: number; status: number; score: number; practiceArea: number;
  urgency: number; assignedToName?: string; assignedTo?: string;
  createdAt: string; unreadMessages: number; nextConsultation?: string;
}

export interface LeadDetailItem extends LeadItem {
  description: string; budgetRange?: string; lastActivityAt?: string;
  consultations?: any[]; activities?: any[];
  consentToMarketing: boolean; consentToDataProcessing: boolean;
}

export interface ConversationItem {
  id: string; leadId: string; channel: number; message: string;
  sender?: string; isFromLead: boolean; messageTimestamp: string;
  attachmentUrl?: string; isRead: boolean;
}

export interface CreateLeadDto {
  name: string; email: string; phone: string; source: number;
  practiceArea: number; description: string; urgency: number;
  budgetRange?: string; preferredContactMethod?: string;
  assignedTo?: string;
  consentToMarketing: boolean; consentToDataProcessing: boolean;
}

export const PRACTICE_AREAS = [
  { value: 1, label: 'Drept Civil' },       { value: 2, label: 'Drept Comercial' },
  { value: 3, label: 'Drept Penal' },        { value: 4, label: 'Dreptul Familiei' },
  { value: 5, label: 'Drept Imobiliar' },    { value: 6, label: 'Dreptul Muncii' },
  { value: 7, label: 'Drept Corporativ' },   { value: 8, label: 'Drept Administrativ' },
  { value: 9, label: 'Altul' },
];

export const LEAD_SOURCES = [
  { value: 1, label: 'Website' },   { value: 2, label: 'WhatsApp' },
  { value: 3, label: 'Facebook' },  { value: 5, label: 'Telefon' },
  { value: 6, label: 'Email' },     { value: 7, label: 'Recomandare' },
  { value: 9, label: 'Google Ads' },{ value: 11, label: 'Altul' },
];

export const LEAD_STATUS_LABELS: Record<number, string> = {
  1: 'Nou', 2: 'Contactat', 3: 'Calificat',
  4: 'Consultatie Programata', 5: 'Consultatie Finalizata',
  6: 'Propunere Trimisa', 7: 'Convertit', 8: 'Pierdut', 9: 'Descalificat',
};

export const LEAD_STATUS_COLORS: Record<number, string> = {
  1: '#1976d2', 2: '#7b1fa2', 3: '#2e7d32', 4: '#f57c00',
  5: '#00838f', 6: '#5d4037', 7: '#388e3c', 8: '#c62828', 9: '#757575',
};

export const URGENCY_LABELS: Record<number, string> = {
  1: 'Scazuta', 2: 'Medie', 3: 'Ridicata', 4: 'Urgenta',
};

export const leadService = {
  getStats: async (): Promise<LeadStats> => {
    const { data } = await apiClient.get('/leads/statistics');
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  getLeads: async (params?: {
    status?: number; source?: number; practiceArea?: number;
    assignedTo?: string; minScore?: number; search?: string;
    page?: number; pageSize?: number;
  }) => {
    const { data } = await apiClient.get('/leads', { params });
    return {
      data: data.data as LeadItem[],
      pagination: data.pagination as { totalCount: number; totalPages: number; page: number },
    };
  },

  getLead: async (id: string): Promise<LeadDetailItem> => {
    const { data } = await apiClient.get('/leads/' + id);
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  createLead: async (dto: CreateLeadDto): Promise<string> => {
    const { data } = await apiClient.post('/leads', dto);
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  updateLead: async (id: string, patch: {
    status?: number; name?: string; email?: string; phone?: string;
    practiceArea?: number; urgency?: number; assignedTo?: string;
    description?: string; budgetRange?: string; score?: number;
  }): Promise<void> => {
    const { data } = await apiClient.put('/leads/' + id, patch);
    if (!data.success) throw new Error(data.message);
  },

  deleteLead: async (id: string): Promise<void> => {
    const { data } = await apiClient.delete('/leads/' + id);
    if (!data.success) throw new Error(data.message);
  },

  getConversations: async (id: string): Promise<ConversationItem[]> => {
    const { data } = await apiClient.get('/leads/' + id + '/conversations');
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  sendMessage: async (id: string, message: string, channel = 1): Promise<string> => {
    const { data } = await apiClient.post('/leads/' + id + '/conversations', {
      leadId: id, channel, message,
    });
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  convertToClient: async (id: string, clientName: string, notes?: string): Promise<string> => {
    const { data } = await apiClient.post('/leads/' + id + '/convert', { clientName, notes });
    if (!data.success) throw new Error(data.message);
    return data.data;
  },
};
`.trimStart(), 'utf8');

// ?? App.tsx: add new admin routes ?????????????????????????????????????????????
fs.writeFileSync(base + '/App.tsx', `
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PublicIntakeForm } from './components/PublicIntakeForm';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/admin/LoginPage';
import { RegisterPage } from './pages/admin/RegisterPage';
import { Overview } from './pages/admin/Overview';
import { LeadsPage } from './pages/admin/LeadsPage';
import { ConsultationsPage } from './pages/admin/ConsultationsPage';
import { UsersPage } from './pages/admin/UsersPage';
import { DreptCivil } from './pages/DreptCivil';
import { DreptComercial } from './pages/DreptComercial';
import { DreptPenal } from './pages/DreptPenal';
import { DreptulFamiliei } from './pages/DreptulFamiliei';
import { DreptImobiliar } from './pages/DreptImobiliar';
import { DreptulMuncii } from './pages/DreptulMuncii';
import './App.css';

const queryClient = new QueryClient();

const services = [
  { badge:'CV', title:'Drept Civil',      desc:'Asistenta juridica in litigii civile',    link:'/servicii/drept-civil',      color:'#1976d2' },
  { badge:'CO', title:'Drept Comercial',  desc:'Consultanta pentru companii',              link:'/servicii/drept-comercial',  color:'#1565c0' },
  { badge:'PN', title:'Drept Penal',      desc:'Aparare in procese penale',                link:'/servicii/drept-penal',      color:'#c62828' },
  { badge:'FA', title:'Dreptul Familiei', desc:'Divort, partaj, custodie',                 link:'/servicii/dreptul-familiei', color:'#6a1b9a' },
  { badge:'IM', title:'Drept Imobiliar',  desc:'Tranzactii imobiliare sigure',             link:'/servicii/drept-imobiliar',  color:'#2e7d32' },
  { badge:'MU', title:'Dreptul Muncii',   desc:'Contestatie concediere, salarii',          link:'/servicii/dreptul-muncii',   color:'#e65100' },
];

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-brand">LegalRO</Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">Acasa</Link>
            <Link to="/servicii/drept-civil" className="nav-link">Civil</Link>
            <Link to="/servicii/drept-comercial" className="nav-link">Comercial</Link>
            <Link to="/servicii/drept-penal" className="nav-link">Penal</Link>
            <Link to="/servicii/dreptul-familiei" className="nav-link">Familie</Link>
            <Link to="/servicii/drept-imobiliar" className="nav-link">Imobiliar</Link>
            <Link to="/servicii/dreptul-muncii" className="nav-link">Munca</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
            <Link to="/admin/login" className="nav-link" style={{ fontWeight:700, color:'#1976d2' }}>?? Admin</Link>
          </div>
        </div>
      </nav>
      <main className="main-content">{children}</main>
      <footer className="footer"><p>© 2026 LegalRO - Cabinet de Avocatura</p></footer>
    </div>
  );
}

function PR({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Auth pages */}
          <Route path="/admin/login"    element={<LoginPage />} />
          <Route path="/admin/register" element={<RegisterPage />} />

          {/* Protected admin pages (each has its own AdminLayout/sidebar) */}
          <Route path="/admin/dashboard"     element={<PR><Overview /></PR>} />
          <Route path="/admin/leads"         element={<PR><LeadsPage /></PR>} />
          <Route path="/admin/consultations" element={<PR><ConsultationsPage /></PR>} />
          <Route path="/admin/users"         element={<PR><UsersPage /></PR>} />

          {/* Public site */}
          <Route path="/*" element={
            <PublicLayout>
              <Routes>
                <Route path="/"                          element={<HomePage />} />
                <Route path="/contact"                   element={<PublicIntakeForm />} />
                <Route path="/servicii/drept-civil"      element={<DreptCivil />} />
                <Route path="/servicii/drept-comercial"  element={<DreptComercial />} />
                <Route path="/servicii/drept-penal"      element={<DreptPenal />} />
                <Route path="/servicii/dreptul-familiei" element={<DreptulFamiliei />} />
                <Route path="/servicii/drept-imobiliar"  element={<DreptImobiliar />} />
                <Route path="/servicii/dreptul-muncii"   element={<DreptulMuncii />} />
              </Routes>
            </PublicLayout>
          } />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function HomePage() {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Cabinet de Avocatura LegalRO</h1>
        <p className="subtitle">Consultanta juridica de incredere pentru toate nevoile dumneavoastra</p>
        <Link to="/contact" className="cta-button">Solicitati o Consultatie Gratuita</Link>
      </div>
      <div className="features-section">
        <h2>Serviciile Noastre</h2>
        <div className="features-grid">
          {services.map((s, i) => (
            <Link key={i} to={s.link} className="feature-card-link">
              <div className="feature-card">
                <div className="feature-badge" style={{ background: s.color+'22', color: s.color }}>{s.badge}</div>
                <h3 style={{ color: s.color }}>{s.title}</h3>
                <p>{s.desc}</p>
                <span className="feature-more" style={{ color: s.color }}>Afla mai mult</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="stats-section">
        <h2>De Ce Sa Ne Alegeti?</h2>
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-number">15+</div><div className="stat-label">Ani Experienta</div></div>
          <div className="stat-card"><div className="stat-number">500+</div><div className="stat-label">Clienti</div></div>
          <div className="stat-card"><div className="stat-number">95%</div><div className="stat-label">Rata Succes</div></div>
          <div className="stat-card"><div className="stat-number">24/7</div><div className="stat-label">Disponibilitate</div></div>
        </div>
      </div>
    </div>
  );
}

export default App;
`.trimStart(), 'utf8');

console.log('leadService + App.tsx updated');
