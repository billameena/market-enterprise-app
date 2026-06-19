import { api } from '../utils/api';
import type { AuthUser, AuthTokens, LoginCredentials, RegisterCredentials, ForgotPasswordInput, ResetPasswordInput } from '../types/auth.types';

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/register', credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const response = await api.post<AuthTokens>('/auth/refresh', { refreshToken });
    return response.data;
  },

  async forgotPassword(input: ForgotPasswordInput): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/forgot-password', input);
    return response.data;
  },

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    await api.post('/auth/reset-password', input);
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token });
  },

  async resendVerification(email: string): Promise<void> {
    await api.post('/auth/resend-verification', { email });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/auth/change-password', { currentPassword, newPassword });
  },
};
