import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../core/types/layout.types';
import { authService } from '../services/auth.service';
import { usePortfolioStore } from './portfolioStore';
import { usePageStore } from './pageStore';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  /** userId stored when registration/login requires OTP verification */
  pendingUserId: string | null;

  // ─── Actions ────────────────────────────────────────────────────────────────
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  resendOtp: () => Promise<void>;
  updateProfile: (data: {
    name?: string;
    avatar?: string;
    background?: string;
    age?: number;
    slogan?: string;
    occupation?: string;
    interests?: string[];
  }) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  verifyResetOtp: (email: string, code: string) => Promise<string>; // returns resetToken
  resetPassword: (resetToken: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setPendingUserId: (id: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      pendingUserId: null,

      // ─── Login ──────────────────────────────────────────────────────────────

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const result = await authService.login({ email, password });

          // Unverified account — store userId and let UI redirect to OTP step
          if ('requiresVerification' in result) {
            set({
              pendingUserId: result.userId,
              isLoading: false,
            });
            // Throw a special error so the caller knows to redirect
            throw Object.assign(new Error('REQUIRES_VERIFICATION'), {
              requiresVerification: true,
              userId: result.userId,
            });
          }

          // Normal login
          const { user, accessToken, refreshToken } = result;
          localStorage.setItem('cms_token', accessToken);
          localStorage.setItem('cms_refresh_token', refreshToken);
          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err: unknown) {
          // Re-throw verification redirect errors without setting error state
          if ((err as any)?.requiresVerification) throw err;

          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? 'Login failed';
          set({
            error: Array.isArray(message) ? message[0] : message,
            isLoading: false,
          });
          throw err;
        }
      },

      // ─── Register ───────────────────────────────────────────────────────────

      register: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { userId } = await authService.register({ email, password });
          set({ pendingUserId: userId, isLoading: false });
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? 'Registration failed';
          set({
            error: Array.isArray(message) ? message[0] : message,
            isLoading: false,
          });
          throw err;
        }
      },

      // ─── Verify OTP ─────────────────────────────────────────────────────────

      verifyOtp: async (code) => {
        const userId = get().pendingUserId;
        if (!userId) throw new Error('No pending user to verify');
        set({ isLoading: true, error: null });
        try {
          const { user, accessToken, refreshToken } = await authService.verifyOtp({
            userId,
            code,
          });
          localStorage.setItem('cms_token', accessToken);
          localStorage.setItem('cms_refresh_token', refreshToken);
          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            pendingUserId: null,
            isLoading: false,
          });
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? 'Invalid code';
          set({
            error: Array.isArray(message) ? message[0] : message,
            isLoading: false,
          });
          throw err;
        }
      },

      // ─── Resend OTP ─────────────────────────────────────────────────────────

      resendOtp: async () => {
        const userId = get().pendingUserId;
        if (!userId) return;
        try {
          await authService.resendOtp({ userId });
        } catch {
          // Silently ignore resend errors
        }
      },

      // ─── Update Profile ─────────────────────────────────────────────────────

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = await authService.updateProfile(data);
          set({ user, isLoading: false });
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? 'Update failed';
          set({
            error: Array.isArray(message) ? message[0] : message,
            isLoading: false,
          });
          throw err;
        }
      },

      // ─── Forgot Password ────────────────────────────────────────────────────

      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await authService.forgotPassword({ email });
          set({ isLoading: false });
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? 'Request failed';
          set({
            error: Array.isArray(message) ? message[0] : message,
            isLoading: false,
          });
          throw err;
        }
      },

      // ─── Verify Reset OTP ───────────────────────────────────────────────────

      verifyResetOtp: async (email, code) => {
        set({ isLoading: true, error: null });
        try {
          const { resetToken } = await authService.verifyResetOtp({ email, code });
          set({ isLoading: false });
          return resetToken;
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? 'Invalid code';
          set({
            error: Array.isArray(message) ? message[0] : message,
            isLoading: false,
          });
          throw err;
        }
      },

      // ─── Reset Password ─────────────────────────────────────────────────────

      resetPassword: async (resetToken, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user, accessToken, refreshToken } = await authService.resetPassword({
            resetToken,
            password,
          });
          localStorage.setItem('cms_token', accessToken);
          localStorage.setItem('cms_refresh_token', refreshToken);
          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? 'Reset failed';
          set({
            error: Array.isArray(message) ? message[0] : message,
            isLoading: false,
          });
          throw err;
        }
      },

      // ─── Logout ─────────────────────────────────────────────────────────────

      logout: () => {
        localStorage.removeItem('cms_token');
        localStorage.removeItem('cms_refresh_token');
        localStorage.removeItem('cms_user');
        usePortfolioStore.getState().reset();
        usePageStore.getState().reset();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          pendingUserId: null,
        });
      },

      clearError: () => set({ error: null }),
      setPendingUserId: (id) => set({ pendingUserId: id }),
    }),
    {
      name: 'cms-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        pendingUserId: state.pendingUserId,
      }),
    },
  ),
);
