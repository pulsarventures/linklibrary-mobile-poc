import { storageService } from '@/services/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuthStore } from '@/hooks/domain/user/useAuthStore';

export const clearAllAuthData = async () => {
  try {
    console.log('🧹 Clearing all authentication data...');
    
    // Clear all auth-related AsyncStorage keys
    const keysToRemove = [
      // Individual token keys
      'access_token',
      'refresh_token', 
      'token_type',
      'token_expires_at',
      // JSON object keys
      '@auth_tokens',
      '@access_token_expiry',
      '@refresh_token_expiry',
      // Theme preference
      '@theme',
      // Any other auth-related keys
      'user_data',
      'auth_state'
    ];

    await AsyncStorage.multiRemove(keysToRemove);
    
    // Clear tokens using storage service
    await storageService.clearTokens();
    
    // Reset auth store state
    useAuthStore.getState().logout();
    
    console.log('✅ All authentication data cleared successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to clear authentication data:', error);
    return false;
  }
};

export const logStoredAuthData = async () => {
  try {
    console.log('🔍 Checking stored authentication data...');
    
    const allKeys = await AsyncStorage.getAllKeys();
    const authKeys = allKeys.filter(key => 
      key.includes('token') || 
      key.includes('auth') || 
      key.includes('user') ||
      key.includes('theme')
    );
    
    console.log('📋 Found auth-related keys:', authKeys);
    
    for (const key of authKeys) {
      const value = await AsyncStorage.getItem(key);
      console.log(`📋 ${key}:`, value ? value.slice(0, 50) + '...' : 'null');
    }
    
    // Check storage service
    const accessToken = await storageService.getAccessToken();
    const refreshToken = await storageService.getRefreshToken();
    const isAccessValid = await storageService.isAccessTokenValid();
    const isRefreshValid = await storageService.isRefreshTokenValid();
    
    console.log('🔍 Storage service state:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      isAccessValid,
      isRefreshValid
    });
    
  } catch (error) {
    console.error('❌ Failed to log stored auth data:', error);
  }
}; 

export const clearLogoutFlag = async () => {
  try {
    console.log('🔓 Clearing logout flag...');
    await AsyncStorage.removeItem('@has_logged_out');
    console.log('✅ Logout flag cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear logout flag:', error);
    return false;
  }
};

export const checkLogoutFlag = async () => {
  try {
    const hasLoggedOut = await AsyncStorage.getItem('@has_logged_out');
    console.log('🔍 Logout flag status:', hasLoggedOut);
    return hasLoggedOut === 'true';
  } catch (error) {
    console.error('❌ Failed to check logout flag:', error);
    return false;
  }
};

/**
 * Utility function to clear the logout flag immediately
 * Can be called from React Native debugger console
 */
export const clearLogoutFlagNow = async () => {
  try {
    console.log('🔓 Clearing logout flag immediately...');
    await AsyncStorage.removeItem('@has_logged_out');
    console.log('✅ Logout flag cleared');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear logout flag:', error);
    return false;
  }
};

/**
 * Check the current status of the logout flag
 */
export const checkLogoutFlagNow = async () => {
  try {
    const hasLoggedOut = await AsyncStorage.getItem('@has_logged_out');
    console.log('🔍 Current logout flag status:', hasLoggedOut);
    return hasLoggedOut === 'true';
  } catch (error) {
    console.error('❌ Failed to check logout flag:', error);
    return false;
  }
};

/**
 * AGGRESSIVE FIX: Clear logout flag and force re-authentication
 */
export const forceFixLogoutIssue = async () => {
  try {
    console.log('🔧 FORCE FIXING LOGOUT ISSUE...');
    await AsyncStorage.removeItem('@has_logged_out');
    console.log('✅ Logout flag cleared');
    const authStore = useAuthStore.getState();
    if (authStore.initialized) {
      console.log('🔄 Re-initializing authentication...');
      await authStore.initializeAuth();
    }
    console.log('✅ Force fix completed - try logging in now');
    return true;
  } catch (error) {
    console.error('❌ Force fix failed:', error);
    return false;
  }
};

/**
 * DEBUG: Check current authentication state
 */
export const debugAuthState = async () => {
  try {
    console.log('🔍 DEBUGGING AUTH STATE...');
    
    // Check logout flag
    const hasLoggedOut = await AsyncStorage.getItem('@has_logged_out');
    console.log('🚫 Logout flag:', hasLoggedOut);
    
    // Check tokens
    const accessToken = await storageService.getAccessToken();
    const refreshToken = await storageService.getRefreshToken();
    const isAccessValid = await storageService.isAccessTokenValid();
    const isRefreshValid = await storageService.isRefreshTokenValid();
    
    console.log('🔑 Token state:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      isAccessValid,
      isRefreshValid,
      accessTokenLength: accessToken?.length || 0,
      refreshTokenLength: refreshToken?.length || 0
    });
    
    // Check auth store state
    const authStore = useAuthStore.getState();
    console.log('📱 Auth store state:', {
      isAuthenticated: authStore.isAuthenticated,
      initialized: authStore.initialized,
      isLoading: authStore.isLoading,
      hasUser: !!authStore.user,
      userEmail: authStore.user?.email
    });
    
    return {
      logoutFlag: hasLoggedOut,
      tokens: { accessToken: !!accessToken, refreshToken: !!refreshToken, isAccessValid, isRefreshValid },
      authStore: { isAuthenticated: authStore.isAuthenticated, initialized: authStore.initialized, hasUser: !!authStore.user }
    };
  } catch (error) {
    console.error('❌ Debug auth state failed:', error);
    return null;
  }
};

/**
 * Force clear logout flag and check if tokens are available
 */
export const forceClearLogoutFlag = async () => {
  console.log('🔧 Force clearing logout flag...');
  await AsyncStorage.removeItem('@has_logged_out');
  console.log('✅ Logout flag cleared');
  
  // Check if tokens are available now
  const tokens = await storageService.getTokens();
  console.log('🔑 Tokens after clearing flag:', {
    hasTokens: !!tokens,
    hasAccessToken: !!tokens?.access_token,
    hasRefreshToken: !!tokens?.refresh_token
  });
  
  return tokens;
};

// Make these available globally for debugging
if (typeof global !== 'undefined') {
  (global as any).clearLogoutFlagNow = clearLogoutFlagNow;
  (global as any).checkLogoutFlagNow = checkLogoutFlagNow;
  (global as any).forceFixLogoutIssue = forceFixLogoutIssue;
  (global as any).debugAuthState = debugAuthState;
  (global as any).forceClearLogoutFlag = forceClearLogoutFlag;
} 