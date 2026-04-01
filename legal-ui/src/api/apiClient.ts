import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT token to every request; for public (unauthenticated) calls send X-Firm-Id instead
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    const firmId = import.meta.env.VITE_FIRM_ID;
    if (firmId) config.headers['X-Firm-Id'] = firmId;
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    if (status === 401) {
      // Don't fire unauthorized event for auth-related calls.
      // - /auth/me: AuthContext handles this 401 in its own .catch() block
      // - /auth/login: login failures are handled by LoginPage
      // Firing the event here would clear a valid session during startup
      // and cause a login -> dashboard -> login redirect loop.
      const isAuthCall = requestUrl.includes('/auth/');
      if (!isAuthCall) {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('jwt_user');
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
      return Promise.reject(error);
    }

    let friendlyMessage: string;
    if (!error.response) {
      friendlyMessage = 'Serverul API nu este accesibil. Verificati ca aplicatia backend ruleaza pe portul 5000.';
    } else if (status === 502 || status === 503 || status === 504) {
      friendlyMessage = 'Serverul API nu raspunde (eroare ' + status + '). Porniti aplicatia .NET si reincercati.';
    } else if (status === 403) {
      friendlyMessage = 'Nu aveti permisiuni pentru aceasta actiune.';
    } else if (status === 404) {
      friendlyMessage = 'Resursa solicitata nu a fost gasita.';
    } else if (status >= 500) {
      friendlyMessage = 'Eroare interna server (' + status + '). Verificati log-urile aplicatiei.';
    } else if (error.code === 'ECONNABORTED') {
      friendlyMessage = 'Cererea a expirat (timeout). Verificati conexiunea si starea serverului.';
    } else {
      friendlyMessage = error.response?.data?.message || error.message || 'Eroare necunoscuta.';
    }

    error.message = friendlyMessage;
    return Promise.reject(error);
  }
);