import type { AuthResponse, RegisterCredentials, User } from './schema';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { authApiService } from '@/services/auth-api.service';
import { signOutFromGoogle } from '@/services/auth/googleAuth';
import { storageService } from '@/services/storage';

import { useCollectionsStore } from '../collections/useCollectionsStore';

type AuthState = {
  clearError: () => void;
  error: null | string;
  googleAuth: (token: string) => Promise<AuthResponse>;
  initializeAuth: () => Promise<void>;
  initialized: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { password: string; username: string; }) => Promise<AuthResponse>;
  logout: () => void;
  register: (data: RegisterCredentials) => Promise<AuthResponse>;
  socialAuth: (data: { email?: string; name?: string; provider: string; token: string; }) => Promise<AuthResponse>;
  user: null | User;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  clearError: () => { set({ error: null }); },
  error: null,
  googleAuth: async (token: string) => {
    set({ error: null, isLoading: true });
    try {
      const response = await authApiService.googleSignIn(token);
      
      if (response.user) {
        set({ 
          error: null, 
          initialized: true,
          isAuthenticated: true,
          isLoading: false,
          user: response.user
        });
      } else {
        throw new Error('Google authentication failed: No user data received');
      }
      
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google authentication failed';
      set({ error: message, isAuthenticated: false, isLoading: false, user: null });
      throw error;
    }
  },
  initializeAuth: async () => {
    // Skip if already initialized
    if (get().initialized) {
      return;
    }

    try {
      set({ isLoading: true });
      
      // Use storageService to get tokens and check validity
      const accessToken = await storageService.getAccessToken();
      const refreshToken = await storageService.getRefreshToken();
      const isAccessTokenValid = await storageService.isAccessTokenValid();
      const isRefreshTokenValid = await storageService.isRefreshTokenValid();

      console.log('🔍 INIT AUTH - Tokens found:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        isAccessTokenValid,
        isRefreshTokenValid
      });

      // If no tokens found, mark as initialized and return
      if (!accessToken || !refreshToken) {
        console.log('🔍 INIT AUTH - No tokens found, user not authenticated');
        set({ 
          error: null,
          initialized: true,
          isAuthenticated: false,
          isLoading: false,
          user: null
        });
        return;
      }

      // Check if access token is expired
      const isExpired = !isAccessTokenValid;
      console.log('🔍 INIT AUTH - Token expired?', isExpired);

      // If access token is expired, try to refresh
      if (isExpired && refreshToken) {
        console.log('🔍 INIT AUTH - Attempting token refresh');
        try {
          const response = await authApiService.refreshToken(refreshToken);
          console.log('🔍 INIT AUTH - Token refresh successful');
          
          // Store new tokens
          await storageService.storeTokens({
            access_token: response.access_token,
            access_token_expires_in: response.access_token_expires_in,
            is_revoked: false,
            refresh_token: response.refresh_token || refreshToken,
            refresh_token_expires_in: response.refresh_token_expires_in,
            token_type: response.token_type,
          });

          if (response.user) {
            console.log('🔍 INIT AUTH - User authenticated via refresh');
            set({ 
              error: null,
              initialized: true,
              isAuthenticated: true,
              isLoading: false,
              user: response.user
            });
            return;
          }
        } catch (error) {
          console.log('🔍 INIT AUTH - Token refresh failed (normal for expired tokens):', error instanceof Error ? error.message : 'Unknown error');
          // Clear tokens and continue to try with current token
          await storageService.clearTokens();
          set({ 
            error: null,
            initialized: true,
            isAuthenticated: false,
            isLoading: false,
            user: null
          });
          return;
        }
      }

      // Try to get user data with current token (if not expired or refresh failed)
      if (!isExpired || !refreshToken) {
        console.log('🔍 INIT AUTH - Attempting to get user data with current token');
        try {
          const response = await authApiService.me();
          console.log('🔍 INIT AUTH - User data retrieved successfully');
          set({ 
            error: null,
            initialized: true,
            isAuthenticated: true,
            isLoading: false,
            user: response.user
          });
          return;
        } catch (error) {
          console.log('🔍 INIT AUTH - Failed to get user data (normal for fresh install):', error instanceof Error ? error.message : 'Unknown error');
          // If we can't get user data, try to refresh token as last resort
          if (refreshToken) {
            try {
              console.log('🔍 INIT AUTH - Last resort: attempting token refresh with token:', refreshToken.slice(0, 20) + '...');
              const response = await authApiService.refreshToken(refreshToken);
              
              console.log('🔍 INIT AUTH - Token refresh successful, storing new tokens');
              
              // Store new tokens
              await storageService.storeTokens({
                access_token: response.access_token,
                access_token_expires_in: response.access_token_expires_in,
                is_revoked: false,
                refresh_token: response.refresh_token || refreshToken,
                refresh_token_expires_in: response.refresh_token_expires_in,
                token_type: response.token_type,
              });

              if (response.user) {
                console.log('🔍 INIT AUTH - User authenticated via last resort refresh');
                set({ 
                  error: null,
                  initialized: true,
                  isAuthenticated: true,
                  isLoading: false,
                  user: response.user
                });
                return;
              }
            } catch (refreshError) {
              console.log('🔍 INIT AUTH - Last resort refresh failed (normal for fresh install):', refreshError instanceof Error ? refreshError.message : 'Unknown error');
            }
          }
          
          // Clear tokens on final failure
          await storageService.clearTokens();
          set({ 
            error: null,
            initialized: true,
            isAuthenticated: false,
            isLoading: false,
            user: null
          });
        }
      }
    } catch (error) {
      console.log('🔍 INIT AUTH - Initialization failed (normal for fresh install):', error instanceof Error ? error.message : 'Unknown error');
      // Clear any stored tokens if initialization fails
      await storageService.clearTokens();
      
      set({ 
        error: null,
        initialized: true,
        isAuthenticated: false,
        isLoading: false,
        user: null
      });
    }
  },
  initialized: false,

  isAuthenticated: false,

  isLoading: false,

  login: async (credentials: { password: string; username: string; }) => {
    set({ error: null, isLoading: true });
    try {
      const response = await authApiService.login(credentials);
      
      // Store tokens using storageService
      await storageService.storeTokens({
        access_token: response.access_token,
        access_token_expires_in: response.access_token_expires_in,
        is_revoked: response.is_revoked,
        refresh_token: response.refresh_token,
        refresh_token_expires_in: response.refresh_token_expires_in,
        token_type: response.token_type,
      });
      
      if (response.user) {
        set({ 
          error: null, 
          initialized: true,
          isAuthenticated: true,
          isLoading: false,
          user: response.user
        });
      } else {
        throw new Error('Login failed: No user data received');
      }
      
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      set({ error: message, isAuthenticated: false, isLoading: false, user: null });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      // Call backend logout
      await authApiService.logout();
    } catch (error) {
      console.error('Backend logout error:', error);
      // Don't let backend logout errors block the logout process
      // The important thing is clearing local tokens
    }
    
    try {
      // Sign out from Google
      await signOutFromGoogle();
    } catch (error) {
      console.log('ℹ️ Google sign out completed with info:', error);
      // Don't let Google sign out errors block the logout process
    }
    
    try {
      // Clear all tokens using storageService
      await storageService.clearTokens();
      
      // Also clear any legacy keys
      await AsyncStorage.multiRemove([
        '@auth_tokens',
        '@access_token_expiry',
        '@refresh_token_expiry'
      ]);
      
      // Reset collections store
      useCollectionsStore.getState().resetStore();
      
      // Reset auth state
      set({ 
        initialized: true, 
        isAuthenticated: false, 
        isLoading: false,
        user: null 
      });
    } catch (error) {
      console.error('Storage cleanup error:', error);
      // Still reset auth state even if storage cleanup fails
      set({ 
        initialized: true, 
        isAuthenticated: false, 
        isLoading: false,
        user: null 
      });
    }
  },

  register: async (data: RegisterCredentials) => {
    set({ error: null, isLoading: true });
    try {
      const response = await authApiService.register(data);
      
      // Store tokens using storageService
      await storageService.storeTokens({
        access_token: response.access_token,
        access_token_expires_in: response.access_token_expires_in,
        is_revoked: response.is_revoked,
        refresh_token: response.refresh_token,
        refresh_token_expires_in: response.refresh_token_expires_in,
        token_type: response.token_type,
      });
      
      if (response.user) {
        set({ 
          error: null, 
          initialized: true,
          isAuthenticated: true,
          isLoading: false,
          user: response.user
        });
      } else {
        throw new Error('Registration failed: No user data received');
      }
      
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      set({ error: message, isAuthenticated: false, isLoading: false, user: null });
      throw error;
    }
  },

  socialAuth: async (data) => {
    set({ error: null, isLoading: true });
    try {
      const response = await authApiService.googleSignIn(data.token);
      
      if (response.user) {
        set({ 
          error: null, 
          initialized: true,
          isAuthenticated: true,
          isLoading: false,
          user: response.user
        });
      } else {
        throw new Error('Social authentication failed: No user data received');
      }
      
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Social authentication failed';
      set({ error: message, isAuthenticated: false, isLoading: false, user: null });
      throw error;
    }
  },

  user: null,
})); 