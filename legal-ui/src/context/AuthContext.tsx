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
  /** True while verifying the stored token on app startup - nothing should redirect yet */
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
  const initToken = localStorage.getItem(TOKEN_KEY);
  const initUser  = readStoredUser();

  const [user, setUser]              = useState<UserInfo | null>(initUser);
  const [isAuthenticated, setIsAuth] = useState<boolean>(!!initUser && !!initToken);
  // initialising=true while we verify stored token on startup - blocks all redirects
  const [initialising, setInit]      = useState<boolean>(!!initToken);
  const [loading, setLoading]        = useState(false);
  const [error, setError]            = useState<string | null>(null);
  const navigateFn                   = useRef<((path: string) => void) | null>(null);

  const _setNavigate = useCallback((fn: (path: string) => void) => {
    navigateFn.current = fn;
  }, []);

  // On mount: verify stored token once against /auth/me
  useEffect(() => {
    if (!initToken) { setInit(false); return; }
    apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + initToken;
    authService.getMe()
      .then(u => {
        setUser(u);
        setIsAuth(true);
        localStorage.setItem(USER_KEY, JSON.stringify(u));
      })
      .catch(() => {
        clearSession();
        setUser(null);
        setIsAuth(false);
      })
      .finally(() => setInit(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty - run once on mount

  // Handle 401 events fired by apiClient interceptor
  useEffect(() => {
    const handle = () => {
      clearSession();
      setUser(null);
      setIsAuth(false);
      navigateFn.current?.('/admin/login');
    };
    window.addEventListener('auth:unauthorized', handle);
    return () => window.removeEventListener('auth:unauthorized', handle);
  }, []);

  const saveSession = useCallback((token: string, u: UserInfo) => {
    // Write to localStorage FIRST - ProtectedRoute reads this synchronously
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
      // saveSession has written localStorage - navigate() in LoginPage fires next
    } catch (e: any) {
      const msg = e.message ?? 'Login esuat';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [saveSession]);

  const register = useCallback(async (dto: RegisterDto) => {
    setLoading(true); setError(null);
    try {
      const res = await authService.register(dto);
      saveSession(res.token, res.user);
    } catch (e: any) {
      const msg = e.message ?? 'Inregistrare esuata';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [saveSession]);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setIsAuth(false);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, initialising, loading, error,
      login, register, logout, _setNavigate,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}