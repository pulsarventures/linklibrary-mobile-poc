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
    // Create form data for OAuth2 login endpoint
    const formData = new URLSearchParams();
    formData.append('username', data.username);
    formData.append('password', data.password);
    formData.append('grant_type', 'password');
    formData.append('client_id', 'string');
    formData.append('client_secret', 'string');

    return apiClient.postForm<AuthResponse>(API_ENDPOINTS.auth.login, formData.toString());
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
    // Send refresh_token as query parameter according to API docs
    // Use ApiClient to ensure proper URL construction and error handling
    const endpoint = `${API_ENDPOINTS.auth.refreshToken}?refresh_token=${encodeURIComponent(refreshToken)}`;
    
    console.log('🔑 Making refresh token request to:', endpoint);

    // Use ApiClient's post method but with no body
    return apiClient.post<AuthResponse>(endpoint);
  }
}

export const authApiService = AuthApiService.getInstance(); 