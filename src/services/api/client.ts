import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/config/api';
import { storageService } from '../storage';

class ApiClient {
  private static instance: ApiClient;
  private baseUrl: string;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
    requestConfig: RequestInit & { url: string };
  }> = [];

  private constructor() {
    this.baseUrl = API_BASE_URL;
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private async getAuthHeaders(): Promise<Headers> {
    const token = await storageService.getAccessToken();
    const headers = new Headers({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    });

    console.log('🔑 Token from storage:', token ? `${token.substring(0, 20)}...` : 'null');

    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    console.log('📤 Request headers:', Object.fromEntries(headers.entries()));
    return headers;
  }

  private processQueue(error: any = null) {
    this.failedQueue.forEach(async promise => {
      if (error) {
        promise.reject(error);
      } else {
        try {
          const headers = await this.getAuthHeaders();
          const response = await fetch(promise.requestConfig.url, {
            ...promise.requestConfig,
            headers,
          });
          const data = await this.handleResponse(response, true);
          promise.resolve(data);
        } catch (retryError) {
          promise.reject(retryError);
        }
      }
    });
    this.failedQueue = [];
  }

  private async handleTokenRefresh() {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ 
          resolve, 
          reject, 
          requestConfig: { url: '', method: 'GET' } 
        });
      });
    }

    this.isRefreshing = true;

    try {
      const refreshToken = await storageService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('Refresh token is required');
      }

      console.log('🔑 Attempting token refresh...');
      
      // Import authApiService dynamically to avoid circular imports
      const { authApiService } = await import('../auth-api.service');
      const response = await authApiService.refreshToken(refreshToken);
      
      console.log('🔑 Token refresh successful, storing new tokens');
      
      // Store new tokens
      await storageService.storeTokens({
        access_token: response.access_token,
        refresh_token: response.refresh_token || refreshToken,
        token_type: response.token_type,
        access_token_expires_in: response.access_token_expires_in,
        refresh_token_expires_in: response.refresh_token_expires_in,
        is_revoked: false,
      });

      this.processQueue();
      return response;
    } catch (error) {
      console.log('🔑 Token refresh failed:', error);
      this.processQueue(error);
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  private async handleResponse<T>(response: Response, retryAttempt = false): Promise<T> {
    let data: any;
    try {
      data = await response.json();
    } catch (error) {
      console.error('Failed to parse response:', error);
      throw new Error('Invalid response format');
    }

    if (!response.ok) {
      // Only log as error if it's not a 401 (auth errors are expected during app initialization)
      if (response.status === 401) {
        console.log('API Auth Error (expected during initialization):', {
          status: response.status,
          statusText: response.statusText,
          message: data?.detail || data?.message || 'Unauthorized',
          url: response.url,
        });
      } else {
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          data,
          url: response.url,
        });
      }

      if (response.status === 401 && !retryAttempt) {
        // Check if refresh token exists and is valid
        const refreshToken = await storageService.getRefreshToken();
        if (!refreshToken) {
          await storageService.clearTokens();
          throw new Error('Session expired. Please log in again.');
        }

        const isRefreshTokenValid = await storageService.isRefreshTokenValid();
        if (!isRefreshTokenValid) {
          await storageService.clearTokens();
          throw new Error('Session expired. Please log in again.');
        }

        try {
          await this.handleTokenRefresh();
          // Retry the original request with new token
          const headers = await this.getAuthHeaders();
          const requestConfig: RequestInit = {
            method: response.type === 'cors' ? 'GET' : response.type,
            headers,
          };
          const retryResponse = await fetch(response.url, requestConfig);
          return this.handleResponse<T>(retryResponse, true);
        } catch (error) {
          console.log('🔑 Token refresh failed:', error);
          // Only clear tokens if refresh fails
          await storageService.clearTokens();
          throw new Error('Authentication required. Please log in.');
        }
      }

      // Extract error message from response
      const errorMessage = data?.detail || data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return data as T;
  }

  public async get<T>(endpoint: string, queryParams: Record<string, any> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });

    const headers = await this.getAuthHeaders();
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    return this.handleResponse<T>(response);
  }

  public async post<T>(endpoint: string, data?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.getAuthHeaders();

    console.log('📡 Making API request:', {
      method: 'POST',
      url,
      headers: Object.fromEntries(headers.entries()),
      data: data ? { ...data, token: data.token ? `${data.token.substring(0, 10)}...` : undefined } : undefined
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      // If you want to log the response body, do it inside handleResponse, or clone the response
      console.log('📥 API response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('🚨 API request failed:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
        ...(error instanceof Error && error.stack ? { stack: error.stack } : {})
      });
      throw error;
    }
  }

  public async put<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  public async delete(endpoint: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    await this.handleResponse(response);
  }

  public async postForm<T>(endpoint: string, formData: string): Promise<T> {
    const headers = new Headers({
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    console.log('📡 Making form API request:', {
      method: 'POST',
      url: `${this.baseUrl}${endpoint}`,
      headers: Object.fromEntries(headers.entries()),
      formData
    });

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      console.log('📥 Form API response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('🚨 Form API request failed:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
        ...(error instanceof Error && error.stack ? { stack: error.stack } : {})
      });
      throw error;
    }
  }
}

export const apiClient = ApiClient.getInstance(); 