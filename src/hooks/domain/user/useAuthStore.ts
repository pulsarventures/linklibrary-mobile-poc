import { create } from 'zustand';
import type { User, AuthResponse, RegisterCredentials } from './schema';
import { authApiService } from '@/services/auth-api.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCollectionsStore } from '../collections/useCollectionsStore';
import { signOutFromGoogle } from '@/services/auth/googleAuth';
import { storageService } from '@/services/storage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  login: (credentials: { username: string; password: string }) => Promise<AuthResponse>;
  register: (data: RegisterCredentials) => Promise<AuthResponse>;
  socialAuth: (data: { provider: string; token: string; email?: string; name?: string }) => Promise<AuthResponse>;
  googleAuth: (token: string) => Promise<AuthResponse>;
  logout: () => void;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  initialized: false,

  initializeAuth: async () => {
    // Skip if already initialized
    if (get().initialized) {
      return;
    }

    try {
      set({ isLoading: true });
      
      // Get all auth tokens
      const [accessToken, refreshToken, tokenType, expiresAt] = await Promise.all([
        AsyncStorage.getItem('access_token'),
        AsyncStorage.getItem('refresh_token'),
        AsyncStorage.getItem('token_type'),
        AsyncStorage.getItem('token_expires_at'),
      ]);

      console.log('🔍 INIT AUTH - Tokens found:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        tokenType,
        expiresAt: expiresAt ? new Date(parseInt(expiresAt)).toISOString() : null
      });

      // If no tokens found, mark as initialized and return
      if (!accessToken || !refreshToken) {
        console.log('🔍 INIT AUTH - No tokens found, user not authenticated');
        set({ 
          user: null,
          isAuthenticated: false,
          isLoading: false,
          initialized: true,
          error: null
        });
        return;
      }

      // Check if access token is expired
      const isExpired = expiresAt && parseInt(expiresAt, 10) < Date.now();
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
            refresh_token: response.refresh_token || refreshToken,
            token_type: response.token_type,
            access_token_expires_in: response.access_token_expires_in,
            refresh_token_expires_in: response.refresh_token_expires_in,
            is_revoked: false,
          });

          if (response.user) {
            console.log('🔍 INIT AUTH - User authenticated via refresh');
            set({ 
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
              initialized: true,
              error: null
            });
            return;
          }
        } catch (error) {
          console.error('🔍 INIT AUTH - Token refresh failed:', error);
          // Clear tokens and continue to try with current token
          await AsyncStorage.multiRemove([
            'access_token',
            'refresh_token',
            'token_type',
            'token_expires_at'
          ]);
          set({ 
            user: null,
            isAuthenticated: false,
            isLoading: false,
            initialized: true,
            error: null
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
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            initialized: true,
            error: null
          });
          return;
        } catch (error) {
          console.error('🔍 INIT AUTH - Failed to get user data:', error);
          // If we can't get user data, try to refresh token as last resort
          if (refreshToken) {
            try {
              console.log('🔍 INIT AUTH - Last resort: attempting token refresh');
              const response = await authApiService.refreshToken(refreshToken);
              
              // Store new tokens
              await storageService.storeTokens({
                access_token: response.access_token,
                refresh_token: response.refresh_token || refreshToken,
                token_type: response.token_type,
                access_token_expires_in: response.access_token_expires_in,
                refresh_token_expires_in: response.refresh_token_expires_in,
                is_revoked: false,
              });

              if (response.user) {
                console.log('🔍 INIT AUTH - User authenticated via last resort refresh');
                set({ 
                  user: response.user,
                  isAuthenticated: true,
                  isLoading: false,
                  initialized: true,
                  error: null
                });
                return;
              }
            } catch (refreshError) {
              console.error('🔍 INIT AUTH - Last resort refresh failed:', refreshError);
            }
          }
          
          // Clear tokens on final failure
          await AsyncStorage.multiRemove([
            'access_token',
            'refresh_token',
            'token_type',
            'token_expires_at'
          ]);
          set({ 
            user: null,
            isAuthenticated: false,
            isLoading: false,
            initialized: true,
            error: null
          });
        }
      }
    } catch (error) {
      console.error('🔍 INIT AUTH - Initialization failed:', error);
      // Clear any stored tokens if initialization fails
      await AsyncStorage.multiRemove([
        'access_token',
        'refresh_token',
        'token_type',
        'token_expires_at'
      ]);
      
      set({ 
        user: null,
        isAuthenticated: false,
        isLoading: false,
        initialized: true,
        error: null
      });
    }
  },

  login: async (credentials: { username: string; password: string }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApiService.login(credentials);
      
      // Store tokens using storageService
      await storageService.storeTokens({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        token_type: response.token_type,
        access_token_expires_in: response.access_token_expires_in,
        refresh_token_expires_in: response.refresh_token_expires_in,
        is_revoked: response.is_revoked,
      });
      
      if (response.user) {
        set({ 
          user: response.user, 
          isAuthenticated: true,
          isLoading: false,
          error: null,
          initialized: true
        });
      } else {
        throw new Error('Login failed: No user data received');
      }
      
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      set({ error: message, isLoading: false, isAuthenticated: false, user: null });
      throw error;
    }
  },

  register: async (data: RegisterCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApiService.register(data);
      
      // Store tokens using storageService
      await storageService.storeTokens({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        token_type: response.token_type,
        access_token_expires_in: response.access_token_expires_in,
        refresh_token_expires_in: response.refresh_token_expires_in,
        is_revoked: response.is_revoked,
      });
      
      if (response.user) {
        set({ 
          user: response.user, 
          isAuthenticated: true,
          isLoading: false,
          error: null,
          initialized: true
        });
      } else {
        throw new Error('Registration failed: No user data received');
      }
      
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      set({ error: message, isLoading: false, isAuthenticated: false, user: null });
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
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        initialized: true 
      });
    } catch (error) {
      console.error('Storage cleanup error:', error);
      // Still reset auth state even if storage cleanup fails
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        initialized: true 
      });
    }
  },

  clearError: () => set({ error: null }),

  socialAuth: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApiService.googleSignIn(data.token);
      
      if (response.user) {
        set({ 
          user: response.user, 
          isAuthenticated: true,
          isLoading: false,
          error: null,
          initialized: true
        });
      } else {
        throw new Error('Social authentication failed: No user data received');
      }
      
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Social authentication failed';
      set({ error: message, isLoading: false, isAuthenticated: false, user: null });
      throw error;
    }
  },

  googleAuth: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApiService.googleSignIn(token);
      
      if (response.user) {
        set({ 
          user: response.user, 
          isAuthenticated: true,
          isLoading: false,
          error: null,
          initialized: true
        });
      } else {
        throw new Error('Google authentication failed: No user data received');
      }
      
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google authentication failed';
      set({ error: message, isLoading: false, isAuthenticated: false, user: null });
      throw error;
    }
  },
})); 