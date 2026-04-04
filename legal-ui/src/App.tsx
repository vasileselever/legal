import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PublicIntakeForm } from './components/PublicIntakeForm';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/admin/LoginPage';
import { RegisterPage } from './pages/admin/RegisterPage';
import { Overview } from './pages/admin/Overview';
import { LeadsPage } from './pages/admin/LeadsPage';
import { ConsultationsPage } from './pages/admin/ConsultationsPage';
import { UsersPage } from './pages/admin/UsersPage';
import { CasesPage } from './pages/admin/CasesPage';
import { LegalResearchPage } from './pages/admin/LegalResearchPage';
import DocumentAutomationPage from './pages/admin/DocumentAutomationPage';
import BillingPage from './pages/admin/BillingPage';
import { DreptCivil } from './pages/DreptCivil';
import { DreptComercial } from './pages/DreptComercial';
import { DreptPenal } from './pages/DreptPenal';
import { DreptulFamiliei } from './pages/DreptulFamiliei';
import { DreptImobiliar } from './pages/DreptImobiliar';
import { DreptulMuncii } from './pages/DreptulMuncii';
import { DreptCorporativ } from './pages/DreptCorporativ';
import { DreptAdministrativ } from './pages/DreptAdministrativ';
import { AlteServicii } from './pages/AlteServicii';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useEffect } from 'react';
import { PRACTICE_AREAS } from './api/leadService';

const queryClient = new QueryClient();

// Derive homepage cards from PRACTICE_AREAS — the single source of truth
// Only areas that have a dedicated page (link != null) appear as cards
const services = PRACTICE_AREAS.filter(p => p.link !== null);

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
            <Link to="/servicii/drept-corporativ" className="nav-link">Corporativ</Link>
            <Link to="/servicii/drept-administrativ" className="nav-link">Administrativ</Link>
            <Link to="/servicii/alte-servicii" className="nav-link">Altele</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
            <Link to="/admin/login" className="nav-link" style={{ fontWeight:700, color:'#1976d2' }}>🔒 Admin</Link>
          </div>
        </div>
      </nav>
      <main className="main-content">{children}</main>
      <footer className="footer"><p>&copy; 2026 LegalRO - Cabinet de Avocatura</p></footer>
    </div>
  );
}

function PR({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

/** Wires React Router's navigate() into AuthContext so the 401 handler can
 *  redirect without a full-page reload. Must be rendered inside BrowserRouter. */
function NavigateWirer() {
  const navigate = useNavigate();
  const { _setNavigate } = useAuth();
  useEffect(() => {
    _setNavigate(navigate);
  }, [navigate, _setNavigate]);
  return null;
}


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <BrowserRouter>
        <NavigateWirer />
        <Routes>
          {/* Auth pages */}
          <Route path="/admin/login"    element={<LoginPage />} />
          <Route path="/admin/register" element={<RegisterPage />} />

          {/* Protected admin pages (each has its own AdminLayout/sidebar) */}
          <Route path="/admin/dashboard"     element={<PR><Overview /></PR>} />
          <Route path="/admin/leads"         element={<PR><LeadsPage /></PR>} />
          <Route path="/admin/cases"         element={<PR><CasesPage /></PR>} />
          <Route path="/admin/consultations" element={<PR><ConsultationsPage /></PR>} />
          <Route path="/admin/billing"       element={<PR><BillingPage /></PR>} />
          <Route path="/admin/research"      element={<PR><LegalResearchPage /></PR>} />
          <Route path="/admin/documents"     element={<PR><DocumentAutomationPage /></PR>} />
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
                <Route path="/servicii/drept-corporativ"    element={<DreptCorporativ />} />
                <Route path="/servicii/drept-administrativ" element={<DreptAdministrativ />} />
                <Route path="/servicii/alte-servicii"       element={<AlteServicii />} />
              </Routes>
            </PublicLayout>
          } />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
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
          {services.map(s => (
            <Link key={s.value} to={s.link!} className="feature-card-link">
              <div className="feature-card">
                <div className="feature-badge" style={{ background: s.color + '22', color: s.color }}>{s.badge}</div>
                <h3 style={{ color: s.color }}>{s.label}</h3>
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
