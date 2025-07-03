import { API_URL_DEV, API_URL_PROD } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { 
  LoginCredentials, 
  RegisterCredentials, 
  AuthResponse, 
  User,
  PasswordResetRequest,
  PasswordResetConfirm
} from '@/hooks/domain/user/schema';

type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

export class AuthApiService {
  private static getApiBaseUrl(): string {
    const isDevelopment = __DEV__;
    const baseUrl = isDevelopment ? API_URL_DEV : API_URL_PROD;

    if (!baseUrl) {
      throw new Error('API URL is not configured');
    }

    // Remove trailing slash if present
    return baseUrl.replace(/\/$/, '');
  }

  private static async makeRequest<T>(
    endpoint: string, 
    options: RequestOptions = {}, 
    queryParams: string = ''
  ): Promise<T> {
    const API_BASE_URL = this.getApiBaseUrl();
    const url = `${API_BASE_URL}${endpoint}${queryParams}`;

    const { headers: customHeaders = {}, ...restOptions } = options;

    try {
      console.log(`Making request to ${url}`);
      console.log('Request headers:', customHeaders);
      console.log('Request body:', options.body);
      
      const response = await fetch(url, {
        ...restOptions,
        headers: customHeaders,
      }).catch(error => {
        console.error(`Network error for ${url}:`, error);
        throw new Error(`Network error: ${error.message}`);
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.detail || data.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      return data as T;
    } catch (error) {
      const printable = error instanceof Error ? error.message : JSON.stringify(error, null, 2);
      console.error('Auth API Error:', printable);
      throw error;
    }
  }

  static async login(data: LoginCredentials): Promise<AuthResponse> {
    const bodyData = 'grant_type=password' +
      `&username=${encodeURIComponent(data.username)}` +
      `&password=${encodeURIComponent(data.password)}` +
      '&scope=' +
      '&client_id=string' +
      '&client_secret=string';

    try {
      const response = await fetch(`${this.getApiBaseUrl()}/auth/login`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Store tokens
      await Promise.all([
        AsyncStorage.setItem('access_token', data.access_token),
        AsyncStorage.setItem('refresh_token', data.refresh_token),
        AsyncStorage.setItem('token_type', data.token_type)
      ]);

      return data as AuthResponse;
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  }

  static async register(data: RegisterCredentials): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // Only store tokens if user is verified and not revoked
    if (response.user.is_verified && !response.is_revoked) {
      await AsyncStorage.setItem('access_token', response.access_token);
      await AsyncStorage.setItem('refresh_token', response.refresh_token);
      await AsyncStorage.setItem('token_type', response.token_type);
    }

    return response;
  }

  static async forgotPassword(data: PasswordResetRequest): Promise<void> {
    return this.makeRequest('/auth/forgot-password', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  static async resetPassword(data: PasswordResetConfirm): Promise<void> {
    return this.makeRequest('/auth/reset-password', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return this.makeRequest(`/auth/refresh?refresh_token=${encodeURIComponent(refreshToken)}`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  static async logout(): Promise<void> {
    try {
      const [refreshToken, accessToken] = await Promise.all([
        AsyncStorage.getItem('refresh_token'),
        AsyncStorage.getItem('access_token')
      ]);

      if (refreshToken && accessToken) {
        await this.makeRequest('/auth/logout', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          }
        }, `?refresh_token=${encodeURIComponent(refreshToken)}`);
      }
    } finally {
      // Always clear tokens on logout
      await Promise.all([
        AsyncStorage.removeItem('access_token'),
        AsyncStorage.removeItem('refresh_token'),
        AsyncStorage.removeItem('token_type')
      ]);
    }
  }

  static async getUser(): Promise<User> {
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found');
    }

    return this.makeRequest('/users/me', {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  static getConfigurationStatus() {
    try {
      const baseUrl = this.getApiBaseUrl();
      return { isConfigured: true, baseUrl };
    } catch (error) {
      return {
        isConfigured: false,
        error: error instanceof Error ? error.message : 'Unknown configuration error',
      };
    }
  }

  static async testConnection() {
    const { isConfigured, baseUrl } = this.getConfigurationStatus();

    if (!isConfigured || !baseUrl) {
      return false;
    }

    try {
      // Remove trailing slash if present and append /health
      const healthEndpoint = `${baseUrl.replace(/\/$/, '')}/health`;
      const response = await fetch(healthEndpoint, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
} 