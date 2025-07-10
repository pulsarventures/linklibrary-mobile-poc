import { useState, useEffect, useCallback } from 'react';
import { authApiService } from '@/services/auth-api.service';
import type { User } from '@/hooks/domain/user/schema';
import type { LoginRequest, RegisterRequest, ApiError, SocialAuthRequest } from '@/services/api/types';
import { useAuthStore } from './domain/user/useAuthStore';
import { storageService } from '@/services/storage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const setUser = (user: User | null) => {
    setState(prev => ({
      ...prev,
      user,
      isAuthenticated: !!user,
    }));
  };

  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const clearError = () => setError(null);

  const login = async (data: LoginRequest): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApiService.login(data);
      await storageService.storeTokens({
        access_token: response.access_token,
        refresh_token: response.refresh_token || '',
        token_type: response.token_type,
        access_token_expires_in: response.access_token_expires_in,
        refresh_token_expires_in: response.refresh_token_expires_in,
        is_revoked: false,
      });
      
      useAuthStore.setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      });
      setUser(response.user);
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApiService.register(data);
      await storageService.storeTokens({
        access_token: response.access_token,
        refresh_token: response.refresh_token || '',
        token_type: response.token_type,
        access_token_expires_in: response.access_token_expires_in,
        refresh_token_expires_in: response.refresh_token_expires_in,
        is_revoked: false,
      });
      
      useAuthStore.setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      });
      setUser(response.user);
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the auth store logout which handles everything
      await useAuthStore.getState().logout();
      setUser(null);
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Logout failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const socialAuth = async (data: SocialAuthRequest): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApiService.googleSignIn(data.token);
      await storageService.storeTokens({
        access_token: response.access_token,
        refresh_token: response.refresh_token || '',
        token_type: response.token_type,
        access_token_expires_in: response.access_token_expires_in,
        refresh_token_expires_in: response.refresh_token_expires_in,
        is_revoked: false,
      });
      
      useAuthStore.setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      });
      setUser(response.user);
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Social authentication failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApiService.me();
      useAuthStore.setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      });
      setUser(response.user);
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Failed to check auth status');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync with auth store instead of making API calls
  useEffect(() => {
    const { user, isAuthenticated, isLoading } = useAuthStore.getState();
    setUser(user);
    setState(prev => ({ ...prev, isAuthenticated, isLoading }));
    
    // Subscribe to auth store changes
    const unsubscribe = useAuthStore.subscribe((state) => {
      setUser(state.user);
      setState(prev => ({ 
        ...prev, 
        isAuthenticated: state.isAuthenticated, 
        isLoading: state.isLoading 
      }));
    });
    
    return unsubscribe;
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    socialAuth,
    clearError,
    refetch: checkAuthStatus,
  };
} 