import { api } from './api';
import type { User } from '../types/user.types';

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export const authService = {
  async login(email: string, password: string, rememberMe: boolean): Promise<AuthResponse> {
    const response = await api.post('/auth/login', { email, password, remember_me: rememberMe });
    
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
    }
    
    return response.data;
  },

  async register(email: string, password: string, firstName: string, lastName: string): Promise<AuthResponse> {
    const response = await api.post('/auth/register', {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    });
    
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
    }
    
    return response.data;
  },

  async refreshToken(): Promise<{ access_token: string }> {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await api.post('/auth/refresh', {
      refresh_token: refreshToken,
    });
    
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post(`/auth/verify-email/${token}`);
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, new_password: newPassword });
  },
};