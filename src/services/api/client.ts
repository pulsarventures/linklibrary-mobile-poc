import { API_BASE_URL } from '@/config/api';

import { storageService } from '../storage';

class ApiClient {
  private static instance: ApiClient;
  private baseUrl: string;
  private failedQueue: {
    reject: (error?: any) => void;
    requestConfig: { url: string } & RequestInit;
    resolve: (value?: any) => void;
  }[] = [];
  private isRefreshing = false;

  private constructor() {
    this.baseUrl = API_BASE_URL;
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  public async delete(endpoint: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers,
      method: 'DELETE',
    });

    await this.handleResponse(response, false, 'DELETE');
  }

  public async get<T>(endpoint: string, queryParameters: Record<string, any> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    for (const [key, value] of Object.entries(queryParameters)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Handle arrays by adding each value separately
          value.forEach((v) => url.searchParams.append(key, v.toString()));
        } else {
          url.searchParams.append(key, value.toString());
        }
      }
    }

    const headers = await this.getAuthHeaders();
    const response = await fetch(url.toString(), {
      headers,
      method: 'GET',
    });

    return this.handleResponse<T>(response, false, 'GET');
  }

  public async post<T>(endpoint: string, data?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.getAuthHeaders();

    // Only log non-auth requests to reduce noise
    if (!endpoint.includes('/auth/')) {
      console.log('📡 Making API POST request:', {
        data: data ? { ...data, token: data.token ? `${data.token.slice(0, 10)}...` : undefined } : undefined,
        endpoint,
        hasData: !!data,
        headers: Object.fromEntries(headers.entries()),
        method: 'POST',
        url
      });
    }

    try {
      const response = await fetch(url, {
        body: data ? JSON.stringify(data) : undefined,
        headers,
        method: 'POST',
      });

      // Only log non-auth responses to reduce noise
      if (!endpoint.includes('/auth/')) {
        console.log('📥 API response:', {
          headers: Object.fromEntries(response.headers.entries()),
          status: response.status,
          statusText: response.statusText
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

  public async postForm<T>(endpoint: string, formData: string): Promise<T> {
    const headers = new Headers({
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    console.log('📡 Making form API request:', {
      formData,
      headers: Object.fromEntries(headers.entries()),
      method: 'POST',
      url: `${this.baseUrl}${endpoint}`
    });

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        body: formData,
        headers,
        method: 'POST',
      });

      console.log('📥 Form API response:', {
        headers: Object.fromEntries(response.headers.entries()),
        status: response.status,
        statusText: response.statusText
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

  public async put<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      body: JSON.stringify(data),
      headers,
      method: 'PUT',
    });

    return this.handleResponse<T>(response, false, 'PUT', data);
  }

  private async getAuthHeaders(): Promise<Headers> {
    const token = await storageService.getAccessToken();
    const headers = new Headers({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    });

    console.log('🔑 Token from storage:', token ? `${token.slice(0, 20)}...` : 'null');

    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    console.log('📤 Request headers:', Object.fromEntries(headers.entries()));
    return headers;
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
            message: data?.detail || data?.message || 'Unauthorized',
            status: response.status,
            statusText: response.statusText,
            url: response.url,
          });
        }
      } else {
        console.error('API Error:', {
          data,
          status: response.status,
          statusText: response.statusText,
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
            headers,
            method: originalMethod,
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

  private async handleTokenRefresh() {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ 
          reject, 
          requestConfig: { method: 'GET', url: '' }, 
          resolve 
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
        access_token_expires_in: response.access_token_expires_in,
        is_revoked: false,
        refresh_token: response.refresh_token || refreshToken,
        refresh_token_expires_in: response.refresh_token_expires_in,
        token_type: response.token_type,
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
}

export const apiClient = ApiClient.getInstance(); 