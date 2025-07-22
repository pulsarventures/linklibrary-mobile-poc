import { useEffect } from 'react';

import { useAuthStore } from './useAuthStore';

export const useAuthInterceptor = () => {
  const { logout } = useAuthStore();

  useEffect(() => {
    // Auth handling is now done directly in AuthApiService
    // This hook is kept for potential future auth-related side effects
    return () => {
      // Cleanup if needed
    };
  }, [logout]);
}; 