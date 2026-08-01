import api from './api';
import type { AuthResponse } from '../core/types/layout.types';

export const authService = {
  register: async (data: {
    email: string;
    password: string;
    name: string;
  }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  me: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const res = await api.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken },
    );
    return res.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const res = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> => {
    const res = await api.post<{ message: string }>('/auth/reset-password', {
      token,
      newPassword,
    });
    return res.data;
  },
};
