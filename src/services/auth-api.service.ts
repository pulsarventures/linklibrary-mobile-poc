import { apiClient } from './api/client';
import { API_ENDPOINTS } from '@/config/api';
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  SocialAuthRequest, 
  SocialAuthResponse 
} from './api/types';

class AuthApiService {
  private static instance: AuthApiService;

  private constructor() {}

  public static getInstance(): AuthApiService {
    if (!AuthApiService.instance) {
      AuthApiService.instance = new AuthApiService();
    }
    return AuthApiService.instance;
  }

  public async login(data: LoginRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, data);
  }

  public async register(data: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.auth.register, data);
  }

  public async logout(): Promise<void> {
    try {
      const refreshToken = await import('../services/storage').then(m => m.storageService.getRefreshToken());
      console.log('🔐 Logout with refresh token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'null');
      
      if (!refreshToken) {
        console.warn('No refresh token found, skipping backend logout');
        return;
      }
      
      // Send refresh_token as query parameter
      return apiClient.post(`${API_ENDPOINTS.auth.logout}?refresh_token=${encodeURIComponent(refreshToken)}`);
    } catch (error) {
      console.error('Logout API call failed:', error);
      throw error;
    }
  }

  public async me(): Promise<AuthResponse> {
    return apiClient.get<AuthResponse>(API_ENDPOINTS.user.me);
  }

  public async googleSignIn(token: string): Promise<SocialAuthResponse> {
    const data: SocialAuthRequest = {
      provider: 'google',
      token,
    };
    return apiClient.post<SocialAuthResponse>(API_ENDPOINTS.auth.googleAuth, data);
  }

  public async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.auth.refreshToken, { refresh_token: refreshToken });
  }
}

export const authApiService = AuthApiService.getInstance(); 