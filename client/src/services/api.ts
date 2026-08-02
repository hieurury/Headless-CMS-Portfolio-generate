import axios, { type AxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// ─── Keys used in localStorage ───────────────────────────────────────────────
const TOKEN_KEY = 'cms_token';
const REFRESH_TOKEN_KEY = 'cms_refresh_token';
const ZUSTAND_AUTH_KEY = 'cms-auth';

/** Clear all persisted auth data and redirect to login */
const clearAuthAndRedirect = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('cms_user');
  localStorage.removeItem(ZUSTAND_AUTH_KEY);

  if (
    !window.location.pathname.startsWith('/login') &&
    !window.location.pathname.startsWith('/register') &&
    !window.location.pathname.startsWith('/forgot-password') &&
    !window.location.pathname.startsWith('/reset-password') &&
    !window.location.pathname.startsWith('/p/')
  ) {
    window.location.href = '/login';
  }
};

// ─── Request interceptor: attach access token ────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: auto-refresh on 401 ───────────────────────────────
// Extend AxiosRequestConfig to track if this request has already been retried
interface RetryableRequestConfig extends AxiosRequestConfig {
  _retried?: boolean;
}

let isRefreshing = false;
// Queue of callbacks waiting for a new token
let refreshSubscribers: Array<(token: string) => void> = [];

const onTokenRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const axiosError = error as {
      config?: RetryableRequestConfig;
      response?: { status?: number };
    };

    const originalRequest = axiosError.config;
    const status = axiosError.response?.status;

    // Only intercept 401 errors that have not already been retried
    if (status !== 401 || !originalRequest || originalRequest._retried) {
      return Promise.reject(error);
    }

    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!storedRefreshToken) {
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise<string>((resolve) => {
        refreshSubscribers.push(resolve);
      }).then((newToken) => {
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      });
    }

    // Mark the original request as retried to prevent infinite loops
    originalRequest._retried = true;
    isRefreshing = true;

    try {
      // Call refresh endpoint directly (not via `api` to avoid interceptor loop)
      const { data } = await axios.post<{
        accessToken: string;
        refreshToken: string;
      }>(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
        refreshToken: storedRefreshToken,
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data;

      // Persist the new tokens
      localStorage.setItem(TOKEN_KEY, newAccessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

      // Update Zustand persisted state to keep token in sync
      const stored = localStorage.getItem(ZUSTAND_AUTH_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.state) {
            parsed.state.token = newAccessToken;
            localStorage.setItem(ZUSTAND_AUTH_KEY, JSON.stringify(parsed));
          }
        } catch {
          // If parsing fails, Zustand will re-hydrate on next load
        }
      }

      // Notify all queued requests of the new token
      onTokenRefreshed(newAccessToken);

      // Retry the original request with the new token
      if (originalRequest.headers) {
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
      }
      return api(originalRequest);
    } catch {
      clearAuthAndRedirect();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);

export { TOKEN_KEY, REFRESH_TOKEN_KEY };
export default api;
