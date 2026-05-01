import { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AUTH_PATHS = ['/admin/login', '/admin/register'];
function sanitiseFrom(raw: string | undefined): string {
  if (!raw) return '/admin/dashboard';
  if (AUTH_PATHS.some(p => raw.startsWith(p))) return '/admin/dashboard';
  return raw;
}

export function LoginPage() {
  const { login, loading, isAuthenticated, initialising } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from     = sanitiseFrom((location.state as any)?.from?.pathname);

  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [showPass, setShowPass] = useState(false);

  // Show spinner while startup token verify is running
  if (initialising) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
        <div style={{ width: 40, height: 40, border: '4px solid #e8eaf6', borderTop: '4px solid #1a237e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Already authenticated (e.g. navigated back to /login) - use Navigate component
  // instead of calling navigate() during render (which is a side-effect and causes loops)
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Completati toate campurile'); return; }
    try {
      await login(form);
      // Always redirect to dashboard after login regardless of where the user came from.
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Eroare la autentificare');
    }
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '0.75rem', border: '1px solid #ddd',
    borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box',
  };
  const lbl: React.CSSProperties = {
    display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#333',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#e8eaf6,#f5f7fa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', width: '100%', maxWidth: '420px' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>&#x2696;</div>
          <h1 style={{ margin: 0, color: '#1a237e', fontSize: '1.75rem', fontWeight: 800 }}>LegalRO</h1>
          <p style={{ color: '#888', margin: '0.4rem 0 0', fontSize: '0.9rem' }}>Panel administrare</p>
        </div>

        {error && (
          <div style={{
            background: error.includes('portul') ? '#fff8e1' : '#ffebee',
            border: `1px solid ${error.includes('portul') ? '#ffe082' : '#ef9a9a'}`,
            borderRadius: '8px', padding: '0.875rem 1rem', marginBottom: '1.25rem',
            color: error.includes('portul') ? '#795548' : '#c62828',
            fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem',
          }}>
            <strong>{error.includes('portul') ? 'Server offline' : 'Eroare autentificare'}</strong>
            <span>{error}</span>
            {error.includes('portul') && (
              <code style={{ fontSize: '0.78rem', background: '#fff3cd', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#5d4037', fontFamily: 'monospace' }}>
                dotnet run --launch-profile http
              </code>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={lbl}>Email</label>
            <input style={inp} type="email" placeholder="avocat.test@avocat-test.ro"
              autoComplete="username" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={lbl}>Parola</label>
            <div style={{ position: 'relative' }}>
              <input style={{ ...inp, paddingRight: '2.8rem' }}
                type={showPass ? 'text' : 'password'}
                placeholder="Parola dvs."
                autoComplete="current-password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                title={showPass ? 'Ascunde parola' : 'Arata parola'}
                style={{
                  position: 'absolute', right: '0.6rem', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '0.2rem', lineHeight: 1, fontSize: '1.1rem',
                  color: '#888',
                }}
              >
                {showPass ? (
                  // Eye-off icon (password visible ? click to hide)
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  // Eye icon (password hidden ? click to show)
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '0.875rem',
            background: loading ? '#90caf9' : '#1a237e',
            color: 'white', border: 'none', borderRadius: '8px',
            fontSize: '1rem', fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
          }}>
            {loading ? 'Se autentifica...' : 'Autentificare'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: '#f8f9ff', border: '1px solid #e8eaf6', borderRadius: '8px', fontSize: '0.78rem', color: '#555' }}>
          <div style={{ fontWeight: 700, marginBottom: '0.35rem', color: '#1a237e' }}>Conturi demo</div>
          <div>avocat.test@avocat-test.ro</div>
          <div>maria.ionescu@avocat-test.ro</div>
          <div style={{ marginTop: '0.25rem', color: '#888' }}>Parola: <code style={{ background: '#e8eaf6', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>Test@123456</code></div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1rem', color: '#666', fontSize: '0.88rem' }}>
          Nu aveti cont?{' '}
          <Link to="/admin/register" style={{ color: '#1a237e', fontWeight: 700 }}>Inregistrati firma</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <Link to="/" style={{ color: '#aaa', fontSize: '0.82rem' }}>&#8592; Inapoi la site</Link>
        </p>
      </div>
    </div>
  );
}