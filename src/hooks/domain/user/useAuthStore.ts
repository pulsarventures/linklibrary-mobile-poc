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
      
      // Get tokens and check validity BEFORE making API calls
      const accessToken = await storageService.getAccessToken();
      const refreshToken = await storageService.getRefreshToken();
      const isAccessTokenValid = await storageService.isAccessTokenValid();

      // Fast path: No tokens = not authenticated
      if (!accessToken || !refreshToken) {
        set({ 
          error: null,
          initialized: true,
          isAuthenticated: false,
          isLoading: false,
          user: null
        });
        return;
      }

      // Smart path: If token is still valid, trust it without API call
      if (isAccessTokenValid) {
        // Token is valid, just trust it and mark as authenticated
        // The first real API call will handle token refresh if actually needed
        set({ 
          error: null,
          initialized: true,
          isAuthenticated: true,
          isLoading: false,
          user: null // User data will be fetched when actually needed
        });
        
        // Skip background user preload since we already trust the token
        // User data will be fetched when actually needed
        
        return;
      }

      // Skip slow refresh token attempt during initialization
      // Just clear invalid tokens and require fresh login
      if (refreshToken) {
        console.warn('Token expired, clearing tokens for fresh login');
        await storageService.clearTokens();
      }

      // All paths failed - require fresh login
      set({ 
        error: null,
        initialized: true,
        isAuthenticated: false,
        isLoading: false,
        user: null
      });
    } catch (error) {
      console.warn('Auth initialization error:', error);
      await storageService.clearTokens();
      set({ 
        error: null,
        initialized: true,
        isAuthenticated: false,
        isLoading: false,
        user: null
      });
    } finally {
      // Ensure we're always marked as initialized
      const currentState = get();
      if (!currentState.initialized) {
        set({ 
          error: null,
          initialized: true,
          isAuthenticated: false,
          isLoading: false,
          user: null
        });
      }
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
      // Google sign out completed
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