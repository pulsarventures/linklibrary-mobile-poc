import AsyncStorage from '@react-native-async-storage/async-storage';
import { storageService } from '@/services/storage';
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
      console.log(`📋 ${key}:`, value ? value.substring(0, 50) + '...' : 'null');
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