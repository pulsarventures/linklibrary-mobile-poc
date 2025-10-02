import type { AuthResponse, RegisterCredentials, User } from './schema';

import { authApiService } from '@/services/auth-api.service';
import { signOutFromGoogle } from '@/services/auth/googleAuth';
import { storageService } from '@/services/storage';
import { clearQueryCache } from '@/utils/clearQueryCache';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { useCollectionsStore } from '../collections/useCollectionsStore';
import { useLinksStore } from '../links/useLinksStore';

type AuthState = {
  clearError: () => void;
  deleteAccount: () => Promise<void>;
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
  deleteAccount: async () => {
    set({ error: null, isLoading: true });
    try {
      // Call delete account API
      await authApiService.deleteAccount();
      
      // Clear all auth data without calling logout API (since account is deleted)
      try {
        // Sign out from Google
        await signOutFromGoogle();
      } catch {
        // Ignore Google sign out errors
      }
      
      // Clear all tokens using storageService
      await storageService.clearTokens();
      
      // Also clear any legacy keys
      await AsyncStorage.multiRemove([
        '@auth_tokens',
        '@access_token_expiry',
        '@refresh_token_expiry'
      ]);
      
      // CRITICAL: Reset ALL stores to clear cached data
      // Clearing all user data stores
      useCollectionsStore.getState().resetStore();
      useLinksStore.getState().resetStore();
      // Tags use React Query, cleared via clearQueryCache()
      
      // Clear TanStack Query cache
      clearQueryCache();
      
      // Reset auth state
      set({ 
        initialized: true, 
        isAuthenticated: false, 
        isLoading: false,
        user: null 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete account';
      set({ error: message, isLoading: false });
      throw error;
    }
  },
  error: null,
  googleAuth: async (token: string) => {
    set({ error: null, isLoading: true });
    try {
      // Clear all stores before logging in a new user to prevent data leakage
      // Clearing stores before Google login
      useCollectionsStore.getState().resetStore();
      useLinksStore.getState().resetStore();
      // Tags use React Query, cleared via clearQueryCache()
      clearQueryCache();
      
      const response = await authApiService.googleSignIn(token);
      
      // Store tokens using storageService - CRITICAL for session persistence
      // Calculate expires_at from expires_in if not provided
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      await storageService.storeTokens({
        access_token: response.access_token,
        access_token_expires_at: response.access_token_expires_at || (now + response.access_token_expires_in),
        access_token_expires_in: response.access_token_expires_in,
        is_revoked: response.is_revoked,
        refresh_token: response.refresh_token,
        refresh_token_expires_at: response.refresh_token_expires_at || (now + response.refresh_token_expires_in),
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
    // EMERGENCY TIMEOUT: Prevent app from hanging if storage is corrupted
    let timeoutFired = false;
    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        // Only set state if initialization hasn't completed yet
        const currentState = get();
        if (!currentState.initialized) {
          console.warn('⚠️ Auth initialization timeout - forcing unauthenticated state');
          timeoutFired = true;
          set({
            initialized: true,
            isAuthenticated: false,
            isLoading: false,
            user: null,
            error: null
          });
        }
        resolve();
      }, 3000); // 3 second timeout
    });

    const initPromise = (async () => {
      // Check if user has logged out - MUST be first check
      const hasLoggedOut = await AsyncStorage.getItem('@has_logged_out');
      if (hasLoggedOut === 'true') {
        // Logout flag detected - blocking authentication

        // DO NOT remove the flag here - only remove on successful login
        set({
          initialized: true,
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: null
        });
        return;
      }

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

      // Smart path: If token appears valid locally, just mark as authenticated
      // Don't call /users/me on startup - it causes issues
      if (isAccessTokenValid) {
        // Clear any lingering logout flag since we have valid tokens
        await AsyncStorage.removeItem('@has_logged_out');
        
        // Mark as authenticated without calling /users/me
        // The user data will be fetched when actually needed
        set({ 
          error: null,
          initialized: true,
          isAuthenticated: true,
          isLoading: false,
          user: null // User data will be fetched lazily when needed
        });
        
        // Auth initialized with valid tokens
        return;
      }

      // Access token expired but we have refresh token - try to refresh
      const isRefreshTokenValid = await storageService.isRefreshTokenValid();
      
      if (refreshToken && isRefreshTokenValid) {
        try {
          // Access token expired, refreshing
          const response = await authApiService.refreshToken(refreshToken);
          
          // Store new tokens
          await storageService.storeTokens({
            access_token: response.access_token,
            access_token_expires_at: response.access_token_expires_at,
            access_token_expires_in: response.access_token_expires_in,
            is_revoked: response.is_revoked || false,
            refresh_token: response.refresh_token || refreshToken,
            refresh_token_expires_at: response.refresh_token_expires_at,
            refresh_token_expires_in: response.refresh_token_expires_in,
            token_type: response.token_type,
          });
          
          set({ 
            error: null,
            initialized: true,
            isAuthenticated: true,
            isLoading: false,
            user: null // User data will be fetched when needed
          });
          return;
        } catch (refreshError) {
          console.error('Token refresh failed during initialization:', refreshError instanceof Error ? refreshError.message : 'Unknown error');
          await storageService.clearTokens();
        }
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
      console.warn('Auth initialization error:', error instanceof Error ? error.message : 'Unknown error');
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
    })();

    // Race between timeout and actual initialization
    await Promise.race([initPromise, timeoutPromise]);
  },
  initialized: false,

  isAuthenticated: false,

  isLoading: false,

  login: async (credentials: { password: string; username: string; }) => {
    set({ error: null, isLoading: true });
    try {
      // Clear all stores before logging in a new user to prevent data leakage
      // Clearing stores before new login
      useCollectionsStore.getState().resetStore();
      useLinksStore.getState().resetStore();
      // Tags use React Query, cleared via clearQueryCache()
      
      // Clear TanStack Query cache to prevent showing old user's data
      clearQueryCache();
      
      // Calling login API
      const response = await authApiService.login(credentials);
      // Raw API response received
      
      // Check if account is unverified (backend now returns tokens for unverified users)
      if (response.user && !response.user.is_verified) {
        // Account is unverified but can still use the app
      }
      
      // Store tokens using storageService (backend now provides tokens for unverified users too)
      if (response.access_token && response.access_token !== '') {
        await storageService.storeTokens({
          access_token: response.access_token,
          access_token_expires_at: response.access_token_expires_at, // New epoch timestamp
          access_token_expires_in: response.access_token_expires_in,
          is_revoked: response.is_revoked,
          refresh_token: response.refresh_token,
          refresh_token_expires_at: response.refresh_token_expires_at, // New epoch timestamp
          refresh_token_expires_in: response.refresh_token_expires_in,
          token_type: response.token_type,
        });
      }
      
      if (response.user) {
        // User data received
        console.log('🔐 LOGIN SUCCESS: User data:', {
          id: response.user.id,
          email: response.user.email,
          is_verified: response.user.is_verified
        });

        // Clear logout flag on successful login
        await AsyncStorage.removeItem('@has_logged_out');

        set({
          error: null,
          initialized: true,
          isAuthenticated: true,
          isLoading: false,
          user: response.user
        });

        console.log('🔐 LOGIN SUCCESS: Auth state updated', {
          initialized: true,
          isAuthenticated: true,
          hasUser: true
        });

        // We already have the user data from the login response
        // No need to make an extra /users/me call
      } else {
        console.error('No user data in response');
        throw new Error('Login failed: No user data received');
      }

      return response;
    } catch (error) {
      console.error('Login error:', error instanceof Error ? error.message : 'Unknown error');
      const message = error instanceof Error ? error.message : 'Login failed';
      set({ error: message, isAuthenticated: false, isLoading: false, user: null });
      throw error;
    }
  },

  logout: async () => {
    // Logout initiated - terminating session
    
    // STEP 1: Set logout flag IMMEDIATELY - this blocks all token access
    try {
      await AsyncStorage.setItem('@has_logged_out', 'true');
      // Logout flag set - token access blocked
    } catch (e) {
      console.error('Failed to set logout flag:', e);
    }
    
    // STEP 2: Update state to trigger navigation
    set({ 
      isAuthenticated: false,
      user: null,
      isLoading: false,
      initialized: true,  // Keep initialized true
      error: null
    });
    // UI State updated - should show login screen
    
    // STEP 3: Clear all tokens with multiple attempts
    try {
      await storageService.clearTokens();
      // Tokens cleared from storage service
      
      // Additional token clearing for extra safety
      await AsyncStorage.multiRemove([
        '@has_logged_out', // Remove and re-add to ensure it's set
        'access_token',
        'refresh_token',
        'token_type',
        'token_expires_at',
        'access_token_expires_at',
        'refresh_token_expires_at',
        'access_token_expires_in',
        'refresh_token_expires_in',
        'is_revoked',
        '@auth_tokens',
        '@access_token_expiry',
        '@refresh_token_expiry',
      ]);
      
      // Re-set the logout flag to ensure it stays
      await AsyncStorage.setItem('@has_logged_out', 'true');
      // Additional token clearing completed
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
    
    // STEP 4: Clear all stores and caches
    try {
      useCollectionsStore.getState().resetStore();
      useLinksStore.getState().resetStore();
      clearQueryCache();
      // All stores and caches cleared
    } catch (error) {
      console.error('Failed to clear stores:', error);
    }
    
    // STEP 5: Try backend logout (don't wait)
    authApiService.logout().catch(() => {});
    
    // STEP 6: Try Google signout (don't wait)
    signOutFromGoogle().catch(() => {});
    
    // Logout completed - all data cleared
  },

  register: async (data: RegisterCredentials) => {
    set({ error: null, isLoading: true });
    try {
      const response = await authApiService.register(data);
      
      // Store tokens using storageService
      await storageService.storeTokens({
        access_token: response.access_token,
        access_token_expires_at: response.access_token_expires_at, // New epoch timestamp
        access_token_expires_in: response.access_token_expires_in,
        is_revoked: response.is_revoked,
        refresh_token: response.refresh_token,
        refresh_token_expires_at: response.refresh_token_expires_at, // New epoch timestamp
        refresh_token_expires_in: response.refresh_token_expires_in,
        token_type: response.token_type,
      });
      
      if (response.user) {
        // Clear logout flag on successful registration
        await AsyncStorage.removeItem('@has_logged_out');
        
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
      // Clear all stores before logging in a new user to prevent data leakage
      // Clearing stores before social authentication
      useCollectionsStore.getState().resetStore();
      useLinksStore.getState().resetStore();
      // Tags use React Query, cleared via clearQueryCache()
      clearQueryCache();
      
      let response;
      if (data.provider === 'apple') {
        // Note: For Apple, data.token should be identityToken and we need authorizationCode
        // This method expects proper Apple sign-in data structure
        throw new Error('Apple Sign In should use direct authApiService.appleSignIn() method');
      } else if (data.provider === 'google') {
        response = await authApiService.googleSignIn(data.token);
      } else {
        throw new Error(`Unsupported social provider: ${data.provider}`);
      }
      
      // Store tokens using storageService - CRITICAL for session persistence
      // Calculate expires_at from expires_in if not provided
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      await storageService.storeTokens({
        access_token: response.access_token,
        access_token_expires_at: response.access_token_expires_at || (now + response.access_token_expires_in),
        access_token_expires_in: response.access_token_expires_in,
        is_revoked: response.is_revoked,
        refresh_token: response.refresh_token,
        refresh_token_expires_at: response.refresh_token_expires_at || (now + response.refresh_token_expires_in),
        refresh_token_expires_in: response.refresh_token_expires_in,
        token_type: response.token_type,
      });
      
      if (response.user) {
        // Clear logout flag on successful social authentication
        await AsyncStorage.removeItem('@has_logged_out');
        
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