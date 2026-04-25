import axios from 'axios';

export const API_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
});

// Automatically attach JWT token to every request, unless the caller
// supplied an explicit Authorization header (e.g. a freshly-minted token
// during the login flow that must not be clobbered by a stale one).
api.interceptors.request.use((config) => {
  if (config.headers?.Authorization) return config;
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config.url.includes('/api/auth/login');
      const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/admin-login' || window.location.pathname === '/signup';
      
      if (!isLoginRequest && !isAuthPage) {
        localStorage.removeItem('token');
        const lastRole = localStorage.getItem('lastRole');
        if (lastRole && lastRole !== 'USER') {
          window.location.href = '/admin-login';
        } else {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;