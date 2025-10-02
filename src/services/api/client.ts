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
    // Ensure no trailing slash in base URL and endpoint
    const cleanBaseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const cleanEndpointNoTrailing = cleanEndpoint.endsWith('/') ? cleanEndpoint.slice(0, -1) : cleanEndpoint;
    
    // Build URL without trailing slash
    let urlString = `${cleanBaseUrl}${cleanEndpointNoTrailing}`;
    
    // Add query parameters if any
    if (Object.keys(queryParameters).length > 0) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(queryParameters)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            // Handle arrays by adding each value separately
            for (const v of value) params.append(key, v.toString());
          } else {
            params.append(key, value.toString());
          }
        }
      }
      const queryString = params.toString();
      if (queryString) {
        urlString += `?${queryString}`;
      }
    }
    
    // Debug logging removed for production
    
    // Reduced logging for performance

    const headers = await this.getAuthHeaders();
    
    // Add timeout for all requests - reduced for better UX
    const controller = new AbortController();
    const timeoutId = setTimeout(() => { controller.abort(); }, 10_000); // 10 second timeout
    
    try {
      const response = await fetch(urlString, {
        headers,
        method: 'GET',
        signal: controller.signal,
        redirect: 'manual', // Handle redirects manually to preserve headers
      });
      
      // Handle redirects manually to preserve Authorization header
      if (response.status === 301 || response.status === 302 || response.status === 307 || response.status === 308) {
        const redirectUrl = response.headers.get('Location');
        if (redirectUrl) {
          // Redirect logging removed
          
          // Headers logging removed
          
          const redirectResponse = await fetch(redirectUrl, {
            headers,
            method: 'GET',
            signal: controller.signal,
          });
          
          // Redirect response logging removed
          
          clearTimeout(timeoutId);
          return this.handleResponse<T>(redirectResponse, false, 'GET');
        }
      }
      
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

  public async postAuth<T>(endpoint: string, data?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });

    // Debug logging for auth endpoints
    if (endpoint.includes('/auth/')) {
      // Auth request logging removed
    }

    // Add timeout for all requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => { controller.abort(); }, 15_000); // 15 second timeout

    try {
      const response = await fetch(url, {
        body: data !== undefined && data !== null ? JSON.stringify(data) : undefined,
        headers,
        method: 'POST',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response, false, 'POST', data);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection.');
      }
      console.error('🚨 Auth API request failed:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
        ...(error instanceof Error && error.stack ? { stack: error.stack } : {})
      });
      throw error;
    }
  }

  public async post<T>(endpoint: string, data?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.getAuthHeaders();

    // Debug logging for tag creation
    if (endpoint.includes('/tags')) {
      console.log('🏷️ Creating tag:');
      console.log('  URL:', url);
      console.log('  Data:', JSON.stringify(data));
      const token = headers.get('Authorization');
      console.log('  Token:', token ? token.slice(0, 30) + '...' : 'NO TOKEN');
    }

    // Debug logging for registration
    if (endpoint.includes('/auth/register')) {
      // Registration request logging removed
    }

    // Debug logging for login
    if (endpoint.includes('/auth/login')) {
      // Login request logging removed
    }

    // Add timeout for all requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => { controller.abort(); }, 15_000); // 15 second timeout
    
    try {
      const response = await fetch(url, {
        body: data !== undefined && data !== null ? JSON.stringify(data) : undefined,
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
      console.error('API request failed:', error instanceof Error ? error.message : 'Unknown error');
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
      console.error('Form API request failed:', error instanceof Error ? error.message : 'Unknown error');
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
    // If a refresh is already in progress, wait for it to complete to avoid sending a stale token
    if (this.isRefreshing) {
      await new Promise<void>((resolve) => {
        const check = () => {
          if (!this.isRefreshing) { resolve(); return; }
          setTimeout(check, 50);
        };
        check();
      });
    }

    // Skip proactive refresh - let 401 handling take care of it
    // This avoids unnecessary refresh attempts with old tokens
    // The server is the source of truth - if it accepts the token, it's valid

    const token = await storageService.getAccessToken();
    const headers = new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });

    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    } else {
      console.warn('⚠️ No access token available for request');
    }
    return headers;
  }

  private async handleResponse<T>(response: Response, retryAttempt = false, originalMethod = 'GET', originalBody?: any): Promise<T> {
    let data: any;
    const responseText = await response.text();
    
    // Log response details for debugging
    const isLogoutEndpoint = response.url.includes('/auth/logout');
    const isExpectedLogoutError = isLogoutEndpoint && response.status === 400;
    
    if (!response.ok && 
        response.status !== 401 && // Suppress generic error logs for 401s
        !isExpectedLogoutError) { // Suppress expected logout errors (invalid/revoked tokens)
        console.error(`API Response Error - Status: ${response.status} ${response.statusText}`);
      }
    
    try {
      // Try to parse as JSON
      data = responseText ? JSON.parse(responseText) : {};
    } catch (error) {
      console.error('Failed to parse response as JSON:', error);
      
      // Check if response is HTML (common error page)
      if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
        // Specific handling for 504 Gateway Timeout
        if (response.status === 504) {
          throw new Error('Server timeout: The request took too long to process. Please try again.');
        }
        // Handle other server errors
        if (response.status >= 500) {
          throw new Error(`Server error (${response.status}): Please try again in a moment.`);
        }
        throw new Error('Server error: Invalid response format (HTML received)');
      }

      // Special handling for "Internal Server Error" text response
      if (responseText === 'Internal Server Error' || response.status === 500) {
        throw new Error('Server error (500): The server encountered an error processing your request');
      }

      // Handle 504 specifically
      if (response.status === 504) {
        throw new Error('Server timeout: The request took too long to process. Please try again.');
      }

      throw new Error(`Invalid response format (Status: ${response.status})`);
    }

    if (!response.ok) {
      // Handle 401 errors specially - they're expected during token refresh
      if (response.status === 401) {
        // Only log 401 errors if we're not in the middle of a refresh attempt
        if (!this.isRefreshing) {
          console.log('🔐 API Auth Error (expected during token refresh):', {
            message: data?.detail || data?.message || 'Unauthorized',
            status: response.status,
            url: response.url,
          });
        }
      } else if (!isExpectedLogoutError) {
        // Only log non-logout errors or unexpected logout errors
        console.error('❌ API Error:', {
          data,
          status: response.status,
          statusText: response.statusText,
          url: response.url,
        });
      }

      if (response.status === 401 && !retryAttempt) {
        console.log('🔄 401 error detected, attempting token refresh...');
        
        // Always attempt refresh if we have a refresh token, regardless of local validation
        // The server is the source of truth - if it says 401, our token is invalid
        const refreshToken = await storageService.getRefreshToken();
        const isRefreshTokenValid = await storageService.isRefreshTokenValid();
        
        if (!refreshToken || !isRefreshTokenValid) {
          // No valid refresh token available
          console.log('🔄 No valid refresh token, cannot refresh');
          throw new Error('Authentication required. Please log in.');
        }

        try {
          console.log('🔄 Attempting token refresh...');
          await this.handleTokenRefresh();
          console.log('🔄 Token refresh successful, retrying original request...');
          
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
          console.error('Token refresh failed:', error instanceof Error ? error.message : 'Unknown error');
          
          // Only clear tokens for certain types of errors, not timeouts
          const shouldClearTokens = !error.message.includes('timeout') && 
                                   !error.message.includes('network') &&
                                   !error.message.includes('connection');
          
          if (shouldClearTokens) {
            // Clear tokens and force re-authentication for auth errors
            // Clearing tokens due to auth failure
            await storageService.clearTokens();
            
            // Update auth store state WITHOUT calling logout (which sets the logout flag)
            const { useAuthStore } = await import('@/hooks/domain/user/useAuthStore');
            useAuthStore.setState({
              isAuthenticated: false,
              user: null,
              isLoading: false,
              initialized: true,
              error: null
            });
          } else {
            // For timeouts/network issues, just fail the request without clearing tokens
            // Token refresh failed due to timeout/network - keeping tokens for retry
          }
          
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
      console.log('🔄 Token refresh already in progress, queuing request...');
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ 
          reject, 
          requestConfig: { method: 'GET', url: '' }, 
          resolve 
        });
      });
    }

    this.isRefreshing = true;
    // Starting token refresh (debounced)

    try {
      const refreshToken = await storageService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('Refresh token is required');
      }

      // Attempting token refresh
      // Starting token refresh
      
      // Import authApiService dynamically to avoid circular imports
      const { authApiService } = await import('../auth-api.service');
      const response = await authApiService.refreshToken(refreshToken);
      
      // Token refresh successful
      // Token refresh successful
      
      // Store new tokens with epoch timestamps if provided
      // Storing refreshed tokens
      
      // Calculate expires_at from expires_in if not provided
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      await storageService.storeTokens({
        access_token: response.access_token,
        access_token_expires_at: response.access_token_expires_at || (now + response.access_token_expires_in),
        access_token_expires_in: response.access_token_expires_in,
        is_revoked: response.is_revoked || false,
        refresh_token: response.refresh_token || refreshToken,
        refresh_token_expires_at: response.refresh_token_expires_at || (now + response.refresh_token_expires_in),
        refresh_token_expires_in: response.refresh_token_expires_in,
        token_type: response.token_type,
      });
      
      // Verify token was stored
      const storedToken = await storageService.getAccessToken();
      // Verified stored token

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
    const isAccessTokenValid = await storageService.isAccessTokenValid();
    const shouldRefreshProactively = await storageService.shouldRefreshTokenProactively();
    
    // Attempt refresh if:
    // 1. We have a valid refresh token AND
    // 2. Either access token is invalid OR should be refreshed proactively
    const shouldAttempt = !!refreshToken && isRefreshTokenValid && (!isAccessTokenValid || shouldRefreshProactively);
    
    // Token validation check completed
    
    return shouldAttempt;
  }
}

export const apiClient = ApiClient.getInstance(); 