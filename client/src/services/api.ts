import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — clear all auth state and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const axiosError = error as { response?: { status?: number } };
    if (axiosError.response?.status === 401) {
      // Clear persisted auth from both localStorage keys
      localStorage.removeItem('cms_token');
      localStorage.removeItem('cms_user');
      // Clear Zustand persisted state so isAuthenticated resets properly
      localStorage.removeItem('cms-auth');
      // Only redirect if not already on auth pages to avoid redirect loops
      if (
        !window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/register') &&
        !window.location.pathname.startsWith('/p/')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
