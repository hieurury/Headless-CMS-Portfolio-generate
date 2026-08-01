import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../core/types/layout.types';
import { authService } from '../services/auth.service';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '../services/api';
import { usePortfolioStore } from './portfolioStore';
import { usePageStore } from './pageStore';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      successMessage: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user, accessToken, refreshToken } = await authService.login({ email, password });
          localStorage.setItem(TOKEN_KEY, accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
          set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })
              ?.response?.data?.message ?? 'Login failed';
          set({ error: Array.isArray(message) ? message[0] : message, isLoading: false });
          throw err;
        }
      },

      register: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
          const { user, accessToken, refreshToken } = await authService.register({ email, password, name });
          localStorage.setItem(TOKEN_KEY, accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
          set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })
              ?.response?.data?.message ?? 'Registration failed';
          set({ error: Array.isArray(message) ? message[0] : message, isLoading: false });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem('cms_user');
        // Reset all user-scoped data stores
        usePortfolioStore.getState().reset();
        usePageStore.getState().reset();
        set({ user: null, token: null, isAuthenticated: false });
      },

      forgotPassword: async (email) => {
        set({ isLoading: true, error: null, successMessage: null });
        try {
          const { message } = await authService.forgotPassword(email);
          set({ successMessage: message, isLoading: false });
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })
              ?.response?.data?.message ?? 'Failed to send reset email';
          set({ error: Array.isArray(message) ? message[0] : message, isLoading: false });
          throw err;
        }
      },

      resetPassword: async (token, newPassword) => {
        set({ isLoading: true, error: null, successMessage: null });
        try {
          const { message } = await authService.resetPassword(token, newPassword);
          set({ successMessage: message, isLoading: false });
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })
              ?.response?.data?.message ?? 'Failed to reset password';
          set({ error: Array.isArray(message) ? message[0] : message, isLoading: false });
          throw err;
        }
      },

      clearError: () => set({ error: null }),
      clearSuccess: () => set({ successMessage: null }),
    }),
    {
      name: 'cms-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
