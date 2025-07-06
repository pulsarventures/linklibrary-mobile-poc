import type { 
  LoginCredentials, 
  RegisterCredentials, 
  AuthResponse,
  User,
  PasswordResetRequest,
  PasswordResetConfirm
} from '@/hooks/domain/user/schema';
import { apiClient } from './api/client';
import { storageService } from './storage';
import { API_ENDPOINTS } from '@/config/api';

export class AuthApiService {
  static async login(data: LoginCredentials): Promise<AuthResponse> {
    const bodyData = 'grant_type=password' +
      `&username=${encodeURIComponent(data.username)}` +
      `&password=${encodeURIComponent(data.password)}` +
      '&scope=' +
      '&client_id=string' +
      '&client_secret=string';

    try {
      const response = await apiClient.postForm<AuthResponse>(API_ENDPOINTS.auth.login, bodyData);
      await storageService.storeTokens(response);
      return response;
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  }

  static async register(data: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.register, data);

    if (response.user.is_verified && !response.is_revoked) {
      await storageService.storeTokens(response);
    }

    return response;
  }

  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    console.log('🔄 Attempting token refresh...');
    const bodyData = 'grant_type=refresh_token' +
      `&refresh_token=${encodeURIComponent(refreshToken)}` +
      '&scope=' +
      '&client_id=string' +
      '&client_secret=string';

    try {
      const response = await apiClient.postForm<AuthResponse>(API_ENDPOINTS.auth.refreshToken, bodyData);
      console.log('✅ Token refresh successful');
      await storageService.storeTokens(response);
      return response;
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      const refreshToken = await storageService.getRefreshToken();
      if (refreshToken) {
        await apiClient.post(API_ENDPOINTS.auth.logout, { refresh_token: refreshToken });
      }
    } finally {
      await storageService.clearTokens();
    }
  }

  static async getUser(): Promise<User> {
    return apiClient.get(API_ENDPOINTS.user.me);
  }

  static async socialAuth(data: { provider: string; token: string; email?: string; name?: string }): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.social, data);
    await storageService.storeTokens(response);
    return response;
  }

  static async forgotPassword(data: PasswordResetRequest): Promise<void> {
    return apiClient.post(API_ENDPOINTS.auth.forgotPassword, data);
  }

  static async resetPassword(data: PasswordResetConfirm): Promise<void> {
    return apiClient.post(API_ENDPOINTS.auth.resetPassword, data);
  }
} 