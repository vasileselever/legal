import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUnreadMessages } from '../../hooks/useUnreadMessages';

const NAV = [
  { path: '/admin/dashboard',      icon: '📊', label: 'Dashboard' },
  { path: '/admin/leads',          icon: '🎯', label: 'Lead-uri' },
  { path: '/admin/cases',          icon: '⚖️',  label: 'Dosare' },
  { path: '/admin/consultations',  icon: '📅', label: 'Consultatii' },
  { path: '/admin/documents',      icon: '📄', label: 'Documente' },
  { path: '/admin/research',       icon: '🔍', label: 'Cercetare AI' },
  { path: '/admin/billing',        icon: '💰', label: 'Facturare' },
  { path: '/admin/users',          icon: '👥', label: 'Utilizatori' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { count: unreadCount } = useUnreadMessages();

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <>
      {/* ── Scoped CSS: ALL mobile rules inside media queries, desktop unchanged ── */}
      <style>{`
        /* Mobile-only: top bar */
        .lro-topbar { display: none; }

        /* Mobile-only: slide-in drawer */
        .lro-drawer {
          position: fixed; top: 0; left: -270px; width: 260px; height: 100%;
          background: #1a237e; color: white; z-index: 500;
          display: flex; flex-direction: column;
          transition: left 0.24s cubic-bezier(.4,0,.2,1);
          overflow-y: auto;
        }
        .lro-drawer.open { left: 0; }
        .lro-backdrop {
          display: none; position: fixed; inset: 0;
          background: rgba(0,0,0,0.45); z-index: 490;
        }

        /* Mobile-only: bottom nav */
        .lro-bottom-nav { display: none; }

        @media (max-width: 768px) {
          /* Hide desktop sidebar on mobile */
          .lro-sidebar { display: none !important; }

          /* Show top bar */
          .lro-topbar {
            display: flex; align-items: center; justify-content: space-between;
            background: #1a237e; color: white;
            padding: 0.7rem 1rem;
            position: sticky; top: 0; z-index: 400;
            flex-shrink: 0;
          }
          .lro-topbar-brand { font-weight: 700; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem; }
          .lro-hamburger {
            background: none; border: none; color: white;
            font-size: 1.5rem; cursor: pointer; padding: 0.2rem 0.4rem; line-height: 1;
          }

          /* Show backdrop when drawer open */
          .lro-backdrop.open { display: block; }

          /* Main needs bottom padding so content isn't under bottom nav */
          .lro-main { padding-bottom: 64px; }

          /* Show bottom nav */
          .lro-bottom-nav {
            display: flex;
            position: fixed; bottom: 0; left: 0; right: 0;
            background: #1a237e; z-index: 400;
            border-top: 1px solid rgba(255,255,255,0.12);
          }
          .lro-bottom-nav a {
            flex: 1; display: flex; flex-direction: column; align-items: center;
            justify-content: center; padding: 0.4rem 0.2rem;
            color: rgba(255,255,255,0.6); text-decoration: none;
            font-size: 0.58rem; gap: 0.1rem; min-width: 0; overflow: hidden;
          }
          .lro-bottom-nav a.active { color: white; }
          .lro-bottom-nav a .bnav-icon { font-size: 1.2rem; line-height: 1; }
          .lro-bottom-nav a .bnav-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }

          /* Tab bar: horizontal scroll instead of wrap */
          .lro-tabbar {
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }
          .lro-tabbar::-webkit-scrollbar { display: none; }
          .lro-tabbar button { flex-shrink: 0 !important; white-space: nowrap !important; }

          /* Page content padding */
          .lro-page-body { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }

          /* Tables: horizontal scroll */
          .lro-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }

          /* Toolbar: wrap buttons vertically */
          .lro-toolbar { flex-direction: column !important; }
          .lro-toolbar > button, .lro-toolbar > a { width: 100% !important; box-sizing: border-box; }

          /* Modals: full screen */
          .lro-modal {
            width: 100% !important; max-width: 100% !important;
            min-height: 100dvh !important; max-height: 100dvh !important;
            border-radius: 0 !important;
          }
          .lro-overlay { align-items: flex-start !important; }
        }
      `}</style>

      {/* ── Mobile top bar (hidden on desktop via CSS) ── */}
      <div className="lro-topbar">
        <div className="lro-topbar-brand"><span>&#9878;&#65039;</span> LegalRO</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {unreadCount > 0 && (
            <Link to="/admin/leads" style={{ position: 'relative', color: 'white', textDecoration: 'none', fontSize: '1.2rem', lineHeight: 1 }}
              title={`${unreadCount} mesaje necitite`}>
              &#128276;
              <span style={{
                position: 'absolute', top: '-6px', right: '-8px',
                background: '#ef5350', color: 'white', borderRadius: '10px',
                fontSize: '0.6rem', fontWeight: 700, padding: '1px 4px', lineHeight: 1.4,
                minWidth: '16px', textAlign: 'center',
              }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
            </Link>
          )}
          <button className="lro-hamburger" onClick={() => setDrawerOpen(true)} aria-label="Meniu">&#9776;</button>
        </div>
      </div>

      {/* ── Backdrop (mobile only) ── */}
      <div className={`lro-backdrop ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />

      {/* ── Slide-in drawer (mobile only) ── */}
      <div className={`lro-drawer ${drawerOpen ? 'open' : ''}`} role="dialog" aria-modal="true">
        <div style={{ padding: '1.1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1.3rem' }}>⚖️</div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>LegalRO</div>
            <div style={{ fontSize: '0.72rem', opacity: 0.6 }}>Panou de administrare</div>
          </div>
          <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>
        <nav style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {NAV.map(n => {
            const active = location.pathname === n.path;
            const badge = n.path === '/admin/leads' && unreadCount > 0 ? unreadCount : 0;
            return (
              <Link key={n.path} to={n.path} onClick={() => setDrawerOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.75rem 0.85rem', borderRadius: '8px', textDecoration: 'none',
                background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: active ? 'white' : 'rgba(255,255,255,0.75)',
                fontWeight: active ? 600 : 400, fontSize: '0.95rem',
              }}>
                <span style={{ fontSize: '1.05rem' }}>{n.icon}</span>
                <span style={{ flex: 1 }}>{n.label}</span>
                {badge > 0 && (
                  <span style={{
                    background: '#ef5350', color: 'white', borderRadius: '10px',
                    fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px',
                    lineHeight: 1.5, minWidth: '18px', textAlign: 'center',
                  }}>{badge > 99 ? '99+' : badge}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.65rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
            }}>
              {(user?.firstName?.[0] ?? '')}{(user?.lastName?.[0] ?? '')}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: '0.68rem', opacity: 0.55, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '5px', cursor: 'pointer', fontSize: '0.85rem' }}>
            Deconectare
          </button>
        </div>
      </div>

      {/* ── Desktop shell (unchanged) ── */}
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui,sans-serif', background: '#f0f2f5' }}>

        {/* Desktop sidebar — hidden on mobile via .lro-sidebar CSS rule */}
        <aside className="lro-sidebar" style={{
          width: '220px', flexShrink: 0, background: '#1a237e',
          display: 'flex', flexDirection: 'column', color: 'white',
        }}>
          <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>⚖️</div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>LegalRO</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.65, marginTop: '0.15rem' }}>Panou de administrare</div>
          </div>
          <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {NAV.map(n => {
              const active = location.pathname === n.path;
              const badge = n.path === '/admin/leads' && unreadCount > 0 ? unreadCount : 0;
              return (
                <Link key={n.path} to={n.path} style={{
                  display: 'flex', alignItems: 'center', gap: '0.65rem',
                  padding: '0.65rem 0.85rem', borderRadius: '8px', textDecoration: 'none',
                  background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: active ? 'white' : 'rgba(255,255,255,0.7)',
                  fontWeight: active ? 600 : 400, fontSize: '0.9rem',
                  transition: 'all 0.15s',
                }}>
                  <span>{n.icon}</span>
                  <span style={{ flex: 1 }}>{n.label}</span>
                  {badge > 0 && (
                    <span style={{
                      background: '#ef5350', color: 'white', borderRadius: '10px',
                      fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px',
                      lineHeight: 1.5, minWidth: '18px', textAlign: 'center',
                    }}>{badge > 99 ? '99+' : badge}</span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Link to="/" style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textDecoration: 'none', marginBottom: '0.75rem' }}>← Site public</Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.65rem' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
              }}>
                {(user?.firstName?.[0] ?? '')}{(user?.lastName?.[0] ?? '')}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={{ fontSize: '0.68rem', opacity: 0.55, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email}
                </div>
              </div>
            </div>
            <button onClick={handleLogout} style={{ width: '100%', padding: '0.4rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem' }}>
              Deconectare
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="lro-main" style={{ flex: 1, overflow: 'auto' }}>{children}</main>
      </div>

      {/* ── Mobile bottom nav (hidden on desktop via CSS) ── */}
      <nav className="lro-bottom-nav" aria-label="Navigare principala">
        {NAV.slice(0, 5).map(n => (
          <Link key={n.path} to={n.path} className={location.pathname === n.path ? 'active' : ''}>
            <span className="bnav-icon">{n.icon}</span>
            <span className="bnav-label">{n.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
