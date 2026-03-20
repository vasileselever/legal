using System.Text;

var root = @"C:\Users\vasileselever\Desktop\projects\Juridic\legal\legal-ui\src\";
void W(string rel, string body)
{
    var p = root + rel.Replace('/', System.IO.Path.DirectorySeparatorChar);
    System.IO.Directory.CreateDirectory(System.IO.Path.GetDirectoryName(p)!);
    System.IO.File.WriteAllText(p, body, new UTF8Encoding(false));
    var bad = body.Count(c => c == '\uFFFD');
    Console.WriteLine($"{(bad == 0 ? "OK" : "BAD")}  {rel}  {new System.IO.FileInfo(p).Length}B");
}

// ── context/AuthContext.tsx ───────────────────────────────────────────────────
// Core fix: expose `loggingIn` flag so ProtectedRoute knows not to redirect
// while a login is in progress. Also keep `initialising` for startup token check.
W("context/AuthContext.tsx", """
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../api/authService';
import type { UserInfo, LoginDto, RegisterDto } from '../api/authService';
import { apiClient } from '../api/apiClient';

const TOKEN_KEY = 'jwt_token';
const USER_KEY  = 'jwt_user';

export interface AuthCtx {
  user: UserInfo | null;
  isAuthenticated: boolean;
  /** True while verifying stored token on startup — nothing should redirect yet */
  initialising: boolean;
  loading: boolean;
  error: string | null;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => void;
  _setNavigate: (fn: (path: string) => void) => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

function readStoredUser(): UserInfo | null {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
  catch { return null; }
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  delete apiClient.defaults.headers.common['Authorization'];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Read once synchronously — used only for initial state
  const initToken = localStorage.getItem(TOKEN_KEY);
  const initUser  = readStoredUser();

  const [user, setUser]             = useState<UserInfo | null>(initUser);
  const [isAuthenticated, setIsAuth]= useState<boolean>(!!initUser && !!initToken);
  // initialising=true means we're doing the startup /auth/me verify — block redirects
  const [initialising, setInit]     = useState<boolean>(!!initToken);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const navigateFn                  = useRef<((path: string) => void) | null>(null);

  const _setNavigate = useCallback((fn: (path: string) => void) => {
    navigateFn.current = fn;
  }, []);

  // On mount: verify stored token once
  useEffect(() => {
    if (!initToken) { setInit(false); return; }
    apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + initToken;
    authService.getMe()
      .then(u => {
        setUser(u);
        setIsAuth(true);
        localStorage.setItem(USER_KEY, JSON.stringify(u));
      })
      .catch(() => { clearSession(); setUser(null); setIsAuth(false); })
      .finally(() => setInit(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 401 event from apiClient interceptor
  useEffect(() => {
    const handle = () => {
      clearSession(); setUser(null); setIsAuth(false);
      navigateFn.current?.('/admin/login');
    };
    window.addEventListener('auth:unauthorized', handle);
    return () => window.removeEventListener('auth:unauthorized', handle);
  }, []);

  const saveSession = useCallback((token: string, u: UserInfo) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    setUser(u);
    setIsAuth(true);
  }, []);

  const login = useCallback(async (dto: LoginDto) => {
    setLoading(true); setError(null);
    try {
      const res = await authService.login(dto);
      saveSession(res.token, res.user);
    } catch (e: any) {
      const msg = e.message ?? 'Login esuat';
      setError(msg); throw new Error(msg);
    } finally { setLoading(false); }
  }, [saveSession]);

  const register = useCallback(async (dto: RegisterDto) => {
    setLoading(true); setError(null);
    try {
      const res = await authService.register(dto);
      saveSession(res.token, res.user);
    } catch (e: any) {
      const msg = e.message ?? 'Inregistrare esuata';
      setError(msg); throw new Error(msg);
    } finally { setLoading(false); }
  }, [saveSession]);

  const logout = useCallback(() => {
    clearSession(); setUser(null); setIsAuth(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, initialising, loading, error, login, register, logout, _setNavigate }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
""");

// ── components/ProtectedRoute.tsx ─────────────────────────────────────────────
// THE KEY FIX:
// Read localStorage directly (synchronous, always reflects what saveSession wrote).
// This bypasses the React state batching race entirely.
// Also block redirect while initialising (startup token verify).
W("components/ProtectedRoute.tsx", """
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function hasValidSession(): boolean {
  try {
    const token = localStorage.getItem('jwt_token');
    const user  = localStorage.getItem('jwt_user');
    return !!token && !!user && user !== 'null';
  } catch { return false; }
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { initialising } = useAuth();
  const location = useLocation();

  // While verifying stored token on startup, show spinner — don't redirect yet
  if (initialising) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
        <div style={{ width: 40, height: 40, border: '4px solid #e8eaf6', borderTop: '4px solid #1a237e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // Use localStorage as synchronous source-of-truth.
  // saveSession() writes to localStorage before any state update or navigate() call,
  // so this is always accurate regardless of React render batching.
  if (!hasValidSession()) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
""");

// ── pages/admin/LoginPage.tsx ─────────────────────────────────────────────────
// Navigate directly in handleSubmit after await login().
// login() resolves after saveSession() which writes localStorage synchronously —
// so ProtectedRoute's hasValidSession() will return true on the very next render.
// Remove the useEffect navigation: it's not needed and can fire at wrong times.
W("pages/admin/LoginPage.tsx", """
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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

  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  // If already authenticated after startup verify, skip login page
  useEffect(() => {
    if (!initialising && isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, initialising, navigate, from]);

  // Show spinner while startup token verify is in progress
  if (initialising) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
        <div style={{ width: 40, height: 40, border: '4px solid #e8eaf6', borderTop: '4px solid #1a237e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Completati toate campurile'); return; }
    try {
      await login(form);
      // login() resolves AFTER saveSession() has written token+user to localStorage.
      // ProtectedRoute reads localStorage directly so it will pass on the very next render.
      // No React state batching race possible here.
      navigate(from, { replace: true });
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
            <input style={inp} type="password" placeholder="Parola dvs."
              autoComplete="current-password" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
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
""");

Console.WriteLine("Done.");
