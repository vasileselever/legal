import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const NAV = [
  { path: '/admin/dashboard',      icon: '📊', label: 'Dashboard' },
  { path: '/admin/leads',          icon: '🎯', label: 'Lead-uri' },
  { path: '/admin/consultations',  icon: '📅', label: 'Consultatii' },
  { path: '/admin/billing',        icon: '💰', label: 'Facturare' },
  { path: '/admin/research',       icon: '🔍', label: 'Cercetare AI' },
  { path: '/admin/documents',      icon: '📄', label: 'Documente Auto' },
  { path: '/admin/users',          icon: '👥', label: 'Utilizatori' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui,sans-serif', background: '#f0f2f5' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px', flexShrink: 0, background: '#1a237e',
        display: 'flex', flexDirection: 'column', color: 'white',
      }}>
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>⚖️</div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>LegalRO</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.65, marginTop: '0.15rem' }}>Panel Administrare</div>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {NAV.map(n => {
            const active = location.pathname === n.path;
            return (
              <Link key={n.path} to={n.path} style={{
                display: 'flex', alignItems: 'center', gap: '0.65rem',
                padding: '0.65rem 0.85rem', borderRadius: '8px', textDecoration: 'none',
                background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: active ? 'white' : 'rgba(255,255,255,0.7)',
                fontWeight: active ? 600 : 400, fontSize: '0.9rem',
                transition: 'all 0.15s',
              }}>
                <span>{n.icon}</span><span>{n.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Link to="/" style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem',
            textDecoration: 'none', marginBottom: '0.75rem' }}>← Site public
          </Link>
          <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem' }}>
            {user?.firstName} {user?.lastName}
          </div>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '0.4rem', background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)', color: 'white',
            borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem',
          }}>
            Deconectare
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
    </div>
  );
}
