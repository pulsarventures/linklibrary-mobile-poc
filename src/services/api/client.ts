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

  private async shouldAttemptRefresh(): Promise<boolean> {
    const refreshToken = await storageService.getRefreshToken();
    const isRefreshTokenValid = await storageService.isRefreshTokenValid();
    
    // Only attempt refresh if we have a refresh token AND it's valid
    const shouldAttempt = !!refreshToken && isRefreshTokenValid;
    
    // Only log when we're actually going to attempt refresh
    if (shouldAttempt) {
      console.log('🔑 Will attempt token refresh - token exists and is valid');
    } else {
      console.log('🔑 Skipping token refresh - no valid refresh token available');
    }
    
    return shouldAttempt;
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

  private async handleResponse<T>(response: Response, retryAttempt = false, originalMethod = 'GET', originalBody?: any): Promise<T> {
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
        // Only log 401 errors if we're not in the middle of a refresh attempt
        if (!this.isRefreshing) {
          console.log('API Auth Error (expected during initialization):', {
            status: response.status,
            statusText: response.statusText,
            message: data?.detail || data?.message || 'Unauthorized',
            url: response.url,
          });
        }
      } else {
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          data,
          url: response.url,
        });
      }

      if (response.status === 401 && !retryAttempt) {
        // Check if we should attempt token refresh
        const shouldRefresh = await this.shouldAttemptRefresh();
        
        if (!shouldRefresh) {
          console.log('🔑 No valid refresh token available, requiring login');
          // Don't clear tokens here - let the auth store handle it
          throw new Error('Authentication required. Please log in.');
        }

        try {
          await this.handleTokenRefresh();
          // Retry the original request with new token using the correct method
          const headers = await this.getAuthHeaders();
          const requestConfig: RequestInit = {
            method: originalMethod,
            headers,
            ...(originalBody && { body: JSON.stringify(originalBody) })
          };
          const retryResponse = await fetch(response.url, requestConfig);
          return this.handleResponse<T>(retryResponse, true, originalMethod, originalBody);
        } catch (error) {
          console.log('🔑 Token refresh failed:', error);
          // Only clear tokens if refresh fails and we had tokens to begin with
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

    return this.handleResponse<T>(response, false, 'GET');
  }

  public async post<T>(endpoint: string, data?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.getAuthHeaders();

    // Only log non-auth requests to reduce noise
    if (!endpoint.includes('/auth/')) {
      console.log('📡 Making API POST request:', {
        method: 'POST',
        url,
        endpoint,
        headers: Object.fromEntries(headers.entries()),
        hasData: !!data,
        data: data ? { ...data, token: data.token ? `${data.token.substring(0, 10)}...` : undefined } : undefined
      });
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      // Only log non-auth responses to reduce noise
      if (!endpoint.includes('/auth/')) {
        console.log('📥 API response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
      }

      return this.handleResponse<T>(response, false, 'POST', data);
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

    return this.handleResponse<T>(response, false, 'PUT', data);
  }

  public async delete(endpoint: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    await this.handleResponse(response, false, 'DELETE');
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