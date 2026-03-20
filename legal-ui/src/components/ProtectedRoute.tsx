import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { initialising, isAuthenticated } = useAuth();
  const location = useLocation();

  // Block any redirect while startup token verification is in progress
  if (initialising) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#f0f2f5', flexDirection: 'column', gap: '1rem',
      }}>
        <div style={{
          width: 40, height: 40, border: '4px solid #e8eaf6',
          borderTop: '4px solid #1a237e', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ color: '#999', fontSize: '0.85rem' }}>Se verifica sesiunea...</span>
      </div>
    );
  }

  // Check both React state AND localStorage.
  // localStorage is the synchronous source of truth right after saveSession(),
  // isAuthenticated catches the case where React state is already updated.
  const hasToken = !!localStorage.getItem('jwt_token');
  const hasUser  = (() => {
    try {
      const u = localStorage.getItem('jwt_user');
      return !!u && u !== 'null';
    } catch { return false; }
  })();

  if (!isAuthenticated && !(hasToken && hasUser)) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}