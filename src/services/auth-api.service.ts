import type { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  SocialAuthRequest, 
  SocialAuthResponse,
  User 
} from './api/types';

import { API_ENDPOINTS } from '@/config/api';

import { apiClient } from './api/client';
import { storageService } from './storage';

class AuthApiService {
  private static instance: AuthApiService;

  private constructor() {}

  public static getInstance(): AuthApiService {
    if (!AuthApiService.instance) {
      AuthApiService.instance = new AuthApiService();
    }
    return AuthApiService.instance;
  }

  public async googleSignIn(token: string): Promise<SocialAuthResponse> {
    // Use the mobile endpoint format
    const data = {
      token,
    };
    return apiClient.postAuth<SocialAuthResponse>(API_ENDPOINTS.auth.googleMobile, data);
  }

  public async appleSignIn(identityToken: string, authorizationCode: string, email?: string | null, name?: { firstName?: string; lastName?: string } | null): Promise<SocialAuthResponse> {
    // Format the data according to the backend Pydantic schema:
    // POST /api/v1/auth/apple/mobile
    // {
    //   "id_token": "token_from_apple",  // Backend expects id_token, not identity_token
    //   "code": "optional_code"          // Backend expects code, not authorization_code
    // }
    const data = {
      id_token: identityToken,
      code: authorizationCode,
    };

    return apiClient.postAuth<SocialAuthResponse>(API_ENDPOINTS.auth.appleMobile, data);
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

  public async logout(): Promise<void> {
    try {
      const refreshToken = await import('../services/storage').then(m => m.storageService.getRefreshToken());
      // Logout with refresh token
      
      if (!refreshToken) {
        // No refresh token found, skipping backend logout
        return;
      }
      
      // Send refresh_token as query parameter
      await apiClient.post(`${API_ENDPOINTS.auth.logout}?refresh_token=${encodeURIComponent(refreshToken)}`);
    } catch (error) {
      // Don't throw error for expected scenarios like invalid/revoked tokens
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('invalid') || errorMessage.includes('revoked') || errorMessage.includes('401')) {
          // Token already invalid/revoked, proceeding with local logout
          return;
        }
      }
      // For other errors, still log but don't throw
      console.error('Logout API call failed:', error instanceof Error ? error.message : 'Unknown error');
      // Don't throw - let the logout proceed
    }
  }

  public async me(): Promise<User> {
    // The /users/me endpoint returns the user object directly, not wrapped in AuthResponse
    // Making /users/me request
    
    // Debug: Check if we have a valid token before making the request
    try {
      const accessToken = await storageService.getAccessToken();
      // Access token available
      if (accessToken) {
        // Token preview available
      }
    } catch (tokenError) {
      console.error('Failed to get access token:', tokenError instanceof Error ? tokenError.message : 'Unknown error');
    }
    
    try {
      // Use direct string like other services to avoid any endpoint constant issues
      const result = await apiClient.get<User>('/users/me');
      // /users/me request successful
      return result;
    } catch (error) {
      console.error('/users/me request failed:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  public async refreshToken(refreshToken: string): Promise<AuthResponse> {
    // Send refresh_token as query parameter according to API docs
    // Use ApiClient to ensure proper URL construction and error handling
    const endpoint = `${API_ENDPOINTS.auth.refreshToken}?refresh_token=${encodeURIComponent(refreshToken)}`;
    
    // Making refresh token request

    try {
      // Just make the request without artificial timeout
      // The server will respond when ready
      const result = await apiClient.post<AuthResponse>(endpoint);
      
      // Refresh token request completed successfully
      return result;
    } catch (error) {
      console.error('Refresh token request failed:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  public async register(data: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.auth.register, data);
  }

  public async deleteAccount(): Promise<void> {
    return apiClient.delete('/users/me');
  }
}

export const authApiService = AuthApiService.getInstance(); 