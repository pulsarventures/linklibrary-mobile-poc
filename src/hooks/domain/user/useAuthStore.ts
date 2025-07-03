import { create } from 'zustand';
import type { User, AuthResponse, RegisterCredentials } from './schema';
import { AuthApiService } from '@/services/auth-api.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { username: string; password: string }) => Promise<AuthResponse>;
  register: (data: RegisterCredentials) => Promise<AuthResponse>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: { username: string; password: string }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthApiService.login(credentials);
      
      if (response.user) {
        set({ 
          user: response.user, 
          isAuthenticated: true,
          isLoading: false,
          error: null
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
          error: null
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
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
})); 