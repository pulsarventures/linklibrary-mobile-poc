import { create } from 'zustand';
import type { User, AuthResponse, RegisterCredentials } from './schema';
import { AuthApiService } from '@/services/auth-api.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCollectionsStore } from '../collections/useCollectionsStore';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  login: (credentials: { username: string; password: string }) => Promise<AuthResponse>;
  register: (data: RegisterCredentials) => Promise<AuthResponse>;
  socialAuth: (data: { provider: string; token: string; email?: string; name?: string }) => Promise<AuthResponse>;
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

      // If no tokens found, mark as initialized and return
      if (!accessToken || !refreshToken) {
        set({ 
          user: null,
          isAuthenticated: false,
          isLoading: false,
          initialized: true,
          error: null
        });
        return;
      }

      // Check if token is expired
      const isExpired = expiresAt && parseInt(expiresAt, 10) < Date.now();

      // If token is expired, try to refresh
      if (isExpired && refreshToken) {
        try {
          const response = await AuthApiService.refreshToken(refreshToken);
          if (response.user) {
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
          console.error('Token refresh failed:', error);
          // Clear tokens and continue to login
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

      // Try to get user data with current token
      try {
        const user = await AuthApiService.getUser();
        set({ 
          user,
          isAuthenticated: true,
          isLoading: false,
          initialized: true,
          error: null
        });
      } catch (error) {
        console.error('Failed to get user data:', error);
        // Clear tokens on error
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
    } catch (error) {
      console.error('Auth initialization failed:', error);
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
      const response = await AuthApiService.login(credentials);
      
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
      const response = await AuthApiService.register(data);
      
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
      await AuthApiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Reset collections store
      useCollectionsStore.getState().resetStore();
      // Reset auth state
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
      const response = await AuthApiService.socialAuth(data);
      
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
})); 