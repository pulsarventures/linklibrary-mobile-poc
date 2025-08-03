import type { User } from '@/hooks/domain/user/schema';
import type { ApiError, LoginRequest, RegisterRequest, SocialAuthRequest } from '@/services/api/types';

import { useCallback, useEffect, useState } from 'react';

import { authApiService } from '@/services/auth-api.service';
import { storageService } from '@/services/storage';

import { useAuthStore } from './domain/user/useAuthStore';

type AuthState = {
  error: null | string;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: null | User;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    error: null,
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  const setUser = (user: null | User) => {
    setState(previous => ({
      ...previous,
      isAuthenticated: !!user,
      user,
    }));
  };

  const setLoading = (isLoading: boolean) => {
    setState(previous => ({ ...previous, isLoading }));
  };

  const setError = (error: null | string) => {
    setState(previous => ({ ...previous, error }));
  };

  const clearError = () => { setError(null); };

  const login = async (data: LoginRequest): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApiService.login(data);
      await storageService.storeTokens({
        access_token: response.access_token,
        access_token_expires_in: response.access_token_expires_in,
        access_token_expires_at: response.access_token_expires_at, // New epoch timestamp
        is_revoked: response.is_revoked || false,
        refresh_token: response.refresh_token || '',
        refresh_token_expires_in: response.refresh_token_expires_in,
        refresh_token_expires_at: response.refresh_token_expires_at, // New epoch timestamp
        token_type: response.token_type,
      });
      
      useAuthStore.setState({
        error: null,
        initialized: true,
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
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
        access_token_expires_in: response.access_token_expires_in,
        access_token_expires_at: response.access_token_expires_at, // New epoch timestamp
        is_revoked: response.is_revoked || false,
        refresh_token: response.refresh_token || '',
        refresh_token_expires_in: response.refresh_token_expires_in,
        refresh_token_expires_at: response.refresh_token_expires_at, // New epoch timestamp
        token_type: response.token_type,
      });
      
      useAuthStore.setState({
        error: null,
        initialized: true,
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
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
        access_token_expires_in: response.access_token_expires_in,
        access_token_expires_at: response.access_token_expires_at, // New epoch timestamp
        is_revoked: response.is_revoked || false,
        refresh_token: response.refresh_token || '',
        refresh_token_expires_in: response.refresh_token_expires_in,
        refresh_token_expires_at: response.refresh_token_expires_at, // New epoch timestamp
        token_type: response.token_type,
      });
      
      useAuthStore.setState({
        error: null,
        initialized: true,
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
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
        error: null,
        initialized: true,
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
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
    const { isAuthenticated, isLoading, user } = useAuthStore.getState();
    setUser(user);
    setState(previous => ({ ...previous, isAuthenticated, isLoading }));
    
    // Subscribe to auth store changes
    const unsubscribe = useAuthStore.subscribe((state) => {
      setUser(state.user);
      setState(previous => ({ 
        ...previous, 
        isAuthenticated: state.isAuthenticated, 
        isLoading: state.isLoading 
      }));
    });
    
    return unsubscribe;
  }, []);

  return {
    ...state,
    clearError,
    login,
    logout,
    refetch: checkAuthStatus,
    register,
    socialAuth,
  };
} 