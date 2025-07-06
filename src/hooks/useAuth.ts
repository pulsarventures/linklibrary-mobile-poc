import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api/client';
import type { User, LoginRequest, RegisterRequest, ApiError, SocialAuthRequest } from '@/services/api/types';

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

  // ... existing code ...

  const socialAuth = async (data: SocialAuthRequest): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.socialAuth(data);
      setUser(response.user);
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Social authentication failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

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