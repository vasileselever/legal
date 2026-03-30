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
import { LegalResearchPage } from './pages/admin/LegalResearchPage';
import DocumentAutomationPage from './pages/admin/DocumentAutomationPage';
import BillingPage from './pages/admin/BillingPage';
import { DreptCivil } from './pages/DreptCivil';
import { DreptComercial } from './pages/DreptComercial';
import { DreptPenal } from './pages/DreptPenal';
import { DreptulFamiliei } from './pages/DreptulFamiliei';
import { DreptImobiliar } from './pages/DreptImobiliar';
import { DreptulMuncii } from './pages/DreptulMuncii';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useEffect } from 'react';
import { NotificationTestPage } from './pages/admin/NotificationTestPage';

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
          <Route path="/admin/consultations" element={<PR><ConsultationsPage /></PR>} />
          <Route path="/admin/billing"       element={<PR><BillingPage /></PR>} />
          <Route path="/admin/research"      element={<PR><LegalResearchPage /></PR>} />
          <Route path="/admin/documents"     element={<PR><DocumentAutomationPage /></PR>} />
          <Route path="/admin/users"         element={<PR><UsersPage /></PR>} />
          <Route path="/admin/notifications" element={<PR><NotificationTestPage /></PR>} />

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
