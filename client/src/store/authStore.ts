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
  /** accountId stored when registration/login requires OTP verification */
  pendingAccountId: string | null;

  // ─── Actions ────────────────────────────────────────────────────────────────
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  resendOtp: () => Promise<void>;
  updateProfile: (data: {
    username?: string;
    fullName?: string;
    avatar?: string;
    background?: string;
    age?: number;
    slogan?: string;
    occupation?: string;
    interests?: string[];
  }) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  verifyResetOtp: (email: string, code: string) => Promise<string>;
  resetPassword: (resetToken: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setPendingAccountId: (id: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      pendingAccountId: null,

      // ─── Login ──────────────────────────────────────────────────────────────

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const result = await authService.login({ email, password });

          // Unverified account — store accountId and let UI redirect to OTP step
          if ('requiresVerification' in result) {
            set({
              pendingAccountId: result.accountId,
              isLoading: false,
            });
            throw Object.assign(new Error('REQUIRES_VERIFICATION'), {
              requiresVerification: true,
              accountId: result.accountId,
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

      register: async (email, password, username) => {
        set({ isLoading: true, error: null });
        try {
          const { accountId } = await authService.register({ email, password, username });
          set({ pendingAccountId: accountId, isLoading: false });
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
        const accountId = get().pendingAccountId;
        if (!accountId) throw new Error('No pending account to verify');
        set({ isLoading: true, error: null });
        try {
          const { user, accessToken, refreshToken } = await authService.verifyOtp({
            userId: accountId, // backend VerifyOtpDto still uses userId field name
            code,
          });
          localStorage.setItem('cms_token', accessToken);
          localStorage.setItem('cms_refresh_token', refreshToken);
          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            pendingAccountId: null,
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
        const accountId = get().pendingAccountId;
        if (!accountId) return;
        try {
          await authService.resendOtp({ userId: accountId });
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
          pendingAccountId: null,
        });
      },

      clearError: () => set({ error: null }),
      setPendingAccountId: (id) => set({ pendingAccountId: id }),
    }),
    {
      name: 'cms-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        pendingAccountId: state.pendingAccountId,
      }),
    },
  ),
);
