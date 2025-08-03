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
    
    // Reduced logging for performance

    const headers = await this.getAuthHeaders();
    
    // Add timeout for all requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    try {
      const response = await fetch(url.toString(), {
        headers,
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return this.handleResponse<T>(response, false, 'GET');
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection.');
      }
      throw error;
    }
  }

  public async post<T>(endpoint: string, data?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.getAuthHeaders();

    // Request logging removed for performance

    // Add timeout for all requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    try {
      const response = await fetch(url, {
        body: data ? JSON.stringify(data) : undefined,
        headers,
        method: 'POST',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Response logging removed for performance

      return this.handleResponse<T>(response, false, 'POST', data);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection.');
      }
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

    // Form request logging removed for performance

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        body: formData,
        headers,
        method: 'POST',
      });

      // Form response logging removed for performance

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

    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
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
          // No valid refresh token available
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
          // Token refresh failed
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

      // Attempting token refresh
      
      // Import authApiService dynamically to avoid circular imports
      const { authApiService } = await import('../auth-api.service');
      const response = await authApiService.refreshToken(refreshToken);
      
      // Token refresh successful
      
      // Store new tokens with epoch timestamps if provided
      await storageService.storeTokens({
        access_token: response.access_token,
        access_token_expires_in: response.access_token_expires_in,
        access_token_expires_at: response.access_token_expires_at, // New epoch timestamp
        is_revoked: response.is_revoked || false,
        refresh_token: response.refresh_token || refreshToken,
        refresh_token_expires_in: response.refresh_token_expires_in,
        refresh_token_expires_at: response.refresh_token_expires_at, // New epoch timestamp
        token_type: response.token_type,
      });

      this.processQueue();
      return response;
    } catch (error) {
      // Token refresh failed
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
    
    return shouldAttempt;
  }
}

export const apiClient = ApiClient.getInstance(); 