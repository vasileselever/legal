$base = "C:\Users\vasileselever\Desktop\projects\Juridic\legal\legal-ui\src"

# Create directories
New-Item -ItemType Directory -Force "$base\components" | Out-Null
New-Item -ItemType Directory -Force "$base\api" | Out-Null

# --- App.tsx ---
Set-Content -Encoding UTF8 "$base\App.tsx" @'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PublicIntakeForm } from './components/PublicIntakeForm';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="app">
          <nav className="navbar">
            <div className="nav-container">
              <Link to="/" className="nav-brand">LegalRO</Link>
              <div className="nav-links">
                <Link to="/" className="nav-link">Acasa</Link>
                <Link to="/contact" className="nav-link">Contact</Link>
              </div>
            </div>
          </nav>
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/contact" element={<PublicIntakeForm />} />
            </Routes>
          </main>
          <footer className="footer"><p>2026 LegalRO - Cabinet de Avocatura</p></footer>
        </div>
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
        <div className="cta-section">
          <Link to="/contact" className="cta-button">Solicitati o Consultatie Gratuita</Link>
        </div>
      </div>
      <div className="features-section">
        <h2>Serviciile Noastre</h2>
        <div className="features-grid">
          <div className="feature-card"><h3>Drept Civil</h3><p>Asistenta juridica in litigii civile</p></div>
          <div className="feature-card"><h3>Drept Comercial</h3><p>Consultanta pentru companii</p></div>
          <div className="feature-card"><h3>Drept Penal</h3><p>Aparare in procese penale</p></div>
          <div className="feature-card"><h3>Dreptul Familiei</h3><p>Divort, partaj, custodie</p></div>
          <div className="feature-card"><h3>Drept Imobiliar</h3><p>Tranzactii imobiliare</p></div>
          <div className="feature-card"><h3>Dreptul Muncii</h3><p>Contracte de munca</p></div>
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
'@

# --- App.css ---
Set-Content -Encoding UTF8 "$base\App.css" @'
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; }
.app { min-height: 100vh; display: flex; flex-direction: column; }
.navbar { background: #1976d2; padding: 1rem 0; }
.nav-container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; display: flex; justify-content: space-between; align-items: center; }
.nav-brand { font-size: 1.5rem; font-weight: bold; color: white; text-decoration: none; }
.nav-links { display: flex; gap: 2rem; }
.nav-link { color: white; text-decoration: none; font-weight: 500; }
.nav-link:hover { opacity: 0.8; }
.main-content { flex: 1; padding: 2rem 0; }
.home-page { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
.hero-section { text-align: center; padding: 4rem 2rem; background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%); color: white; border-radius: 8px; margin-bottom: 3rem; }
.hero-section h1 { font-size: 2.5rem; margin-bottom: 1rem; }
.hero-section .subtitle { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; }
.cta-button { display: inline-block; padding: 1rem 2rem; background: white; color: #1976d2; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 1.1rem; }
.cta-button:hover { opacity: 0.9; }
.features-section { margin-bottom: 4rem; }
.features-section h2, .stats-section h2 { text-align: center; font-size: 2rem; color: #333; margin-bottom: 2rem; }
.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
.feature-card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.feature-card h3 { color: #1976d2; margin-bottom: 0.5rem; }
.feature-card p { color: #666; }
.stats-section { background: white; padding: 3rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 2rem; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; }
.stat-card { text-align: center; }
.stat-number { font-size: 3rem; font-weight: bold; color: #1976d2; }
.stat-label { color: #666; }
.footer { background: #333; color: white; text-align: center; padding: 2rem; }
@media (max-width: 768px) { .hero-section h1 { font-size: 2rem; } .features-grid, .stats-grid { grid-template-columns: 1fr; } }
'@

# --- index.css ---
Set-Content -Encoding UTF8 "$base\index.css" @'
body { margin: 0; font-family: -apple-system, sans-serif; }
#root { min-height: 100vh; }
'@

# --- api/apiClient.ts ---
Set-Content -Encoding UTF8 "$base\api\apiClient.ts" @'
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:5001/api';
export const apiClient = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } });
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
'@

# --- api/leadService.ts ---
Set-Content -Encoding UTF8 "$base\api\leadService.ts" @'
import { apiClient } from './apiClient';
export interface CreateLeadDto {
  name: string; email: string; phone: string;
  source: number; practiceArea: number; description: string;
  urgency: number; budgetRange?: string; preferredContactMethod?: string;
  consentToMarketing: boolean; consentToDataProcessing: boolean;
}
export const leadService = {
  createLead: async (dto: CreateLeadDto) => {
    const { data } = await apiClient.post('/leads', dto);
    return data.data;
  },
};
'@

# --- components/PublicIntakeForm.tsx ---
Set-Content -Encoding UTF8 "$base\components\PublicIntakeForm.tsx" @'
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { leadService, CreateLeadDto } from '../api/leadService';

export function PublicIntakeForm() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateLeadDto>();

  const onSubmit = async (data: CreateLeadDto) => {
    setSubmitting(true); setError(null);
    try {
      await leadService.createLead(data);
      setSuccess(true); reset();
      setTimeout(() => setSuccess(false), 5000);
    } catch (e: any) {
      setError(e.response?.data?.message || 'A aparut o eroare. Incercati din nou.');
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem', background: 'white', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h1 style={{ color: '#1976d2', textAlign: 'center', marginBottom: '0.5rem' }}>Formular de Contact</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>Completati formularul pentru o consultatie gratuita</p>

      {success && <div style={{ padding: '1rem', background: '#d4edda', color: '#155724', borderRadius: 4, marginBottom: '1rem' }}>Multumim! Va vom contacta in cel mai scurt timp.</div>}
      {error && <div style={{ padding: '1rem', background: '#f8d7da', color: '#721c24', borderRadius: 4, marginBottom: '1rem' }}>{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Nume Complet *</label>
          <input style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: 4, fontSize: '1rem' }}
            {...register('name', { required: 'Numele este obligatoriu' })} placeholder="Maria Popescu" />
          {errors.name && <span style={{ color: '#d32f2f', fontSize: '0.875rem' }}>{errors.name.message}</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Email *</label>
          <input style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: 4, fontSize: '1rem' }}
            type="email" {...register('email', { required: 'Email-ul este obligatoriu' })} placeholder="maria@example.com" />
          {errors.email && <span style={{ color: '#d32f2f', fontSize: '0.875rem' }}>{errors.email.message}</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Telefon *</label>
          <input style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: 4, fontSize: '1rem' }}
            type="tel" {...register('phone', { required: 'Telefonul este obligatoriu' })} placeholder="+40721234567" />
          {errors.phone && <span style={{ color: '#d32f2f', fontSize: '0.875rem' }}>{errors.phone.message}</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Domeniu *</label>
          <select style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: 4, fontSize: '1rem' }}
            {...register('practiceArea', { required: true, valueAsNumber: true })}>
            <option value="">Selectati domeniul...</option>
            <option value="1">Civil</option><option value="2">Comercial</option>
            <option value="3">Penal</option><option value="4">Familie</option>
            <option value="5">Imobiliar</option><option value="6">Munca</option>
          </select>
          {errors.practiceArea && <span style={{ color: '#d32f2f', fontSize: '0.875rem' }}>Domeniul este obligatoriu</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Descriere *</label>
          <textarea style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: 4, fontSize: '1rem' }}
            rows={4} {...register('description', { required: 'Descrierea este obligatorie' })} placeholder="Descrieti situatia dumneavoastra..." />
          {errors.description && <span style={{ color: '#d32f2f', fontSize: '0.875rem' }}>{errors.description.message}</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Urgenta *</label>
          <select style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: 4, fontSize: '1rem' }}
            {...register('urgency', { required: true, valueAsNumber: true })}>
            <option value="1">Scazuta</option><option value="2">Medie</option>
            <option value="3">Ridicata</option><option value="4">Urgenta</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <input type="checkbox" {...register('consentToDataProcessing', { required: true })} style={{ marginTop: 3 }} />
            <span>Sunt de acord cu prelucrarea datelor personale *</span>
          </label>
          {errors.consentToDataProcessing && <span style={{ color: '#d32f2f', fontSize: '0.875rem' }}>Consimtamantul este obligatoriu</span>}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <input type="checkbox" {...register('consentToMarketing')} style={{ marginTop: 3 }} />
            <span>Doresc sa primesc informatii despre servicii (optional)</span>
          </label>
        </div>

        <input type="hidden" {...register('source', { valueAsNumber: true })} value="1" />

        <button type="submit" disabled={submitting}
          style={{ width: '100%', padding: '1rem', background: submitting ? '#90caf9' : '#1976d2', color: 'white', border: 'none', borderRadius: 4, fontSize: '1.1rem', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer' }}>
          {submitting ? 'Se trimite...' : 'Trimite Solicitare'}
        </button>
      </form>
    </div>
  );
}
'@

# --- .env ---
Set-Content -Encoding UTF8 "C:\Users\vasileselever\Desktop\projects\Juridic\legal\legal-ui\.env" "VITE_API_URL=https://localhost:5001/api"

Write-Host "All files written successfully!"
Write-Host "App.tsx first line:" (Get-Content "$base\App.tsx" | Select-Object -First 1)
