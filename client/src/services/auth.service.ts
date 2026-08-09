import api from './api';
import type {
  AuthResponse,
  RegisterResponse,
  UnverifiedLoginResponse,
  User,
} from '../core/types/layout.types';

export const authService = {
  // ─── Registration flow ──────────────────────────────────────────────────────

  /** Step 1: Create account with email, password, and username → returns { accountId } */
  register: async (data: {
    email: string;
    password: string;
    username: string;
  }): Promise<RegisterResponse> => {
    const res = await api.post<RegisterResponse>('/auth/register', data);
    return res.data;
  },

  /** Step 2: Verify OTP → returns full auth tokens */
  verifyOtp: async (data: {
    userId: string; // accountId sent as userId for backward compat with VerifyOtpDto
    code: string;
  }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/verify-otp', data);
    return res.data;
  },

  /** Resend OTP to a user */
  resendOtp: async (data: { userId: string }): Promise<{ message: string }> => {
    const res = await api.post<{ message: string }>('/auth/resend-otp', data);
    return res.data;
  },

  // ─── Username availability ──────────────────────────────────────────────────

  /** Check if a username is available (debounced on frontend) */
  checkUsername: async (
    username: string,
  ): Promise<{ available: boolean; reason?: string }> => {
    const res = await api.get<{ available: boolean; reason?: string }>(
      `/auth/check-username?username=${encodeURIComponent(username)}`,
    );
    return res.data;
  },

  // ─── Login ──────────────────────────────────────────────────────────────────

  login: async (data: {
    email: string;
    password: string;
  }): Promise<AuthResponse | UnverifiedLoginResponse> => {
    const res = await api.post<AuthResponse | UnverifiedLoginResponse>(
      '/auth/login',
      data,
    );
    return res.data;
  },

  // ─── Current user ───────────────────────────────────────────────────────────

  me: async (): Promise<{ user: User }> => {
    const res = await api.get<{ user: User }>('/auth/me');
    return res.data;
  },

  // ─── Profile update (step 3) ────────────────────────────────────────────────

  updateProfile: async (data: {
    username?: string;
    fullName?: string;
    avatar?: string;
    background?: string;
    age?: number;
    slogan?: string;
    occupation?: string;
    interests?: string[];
  }): Promise<{ user: User }> => {
    const res = await api.patch<{ user: User }>('/auth/profile', data);
    return res.data;
  },

  // ─── Categories ────────────────────────────────────────────────────────────

  getCategories: async (): Promise<string[]> => {
    const res = await api.get<string[]>('/auth/categories');
    return res.data;
  },

  // ─── Forgot password flow ───────────────────────────────────────────────────

  forgotPassword: async (data: { email: string }): Promise<{ message: string }> => {
    const res = await api.post<{ message: string }>('/auth/forgot-password', data);
    return res.data;
  },

  verifyResetOtp: async (data: {
    email: string;
    code: string;
  }): Promise<{ resetToken: string }> => {
    const res = await api.post<{ resetToken: string }>(
      '/auth/verify-reset-otp',
      data,
    );
    return res.data;
  },

  resetPassword: async (data: {
    resetToken: string;
    password: string;
  }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/reset-password', data);
    return res.data;
  },
};
