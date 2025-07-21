import AsyncStorage from '@react-native-async-storage/async-storage';
import { storageService } from '@/services/storage';
import { useAuthStore } from '@/hooks/domain/user/useAuthStore';

export const resetApp = async () => {
  try {
    console.log('🔄 Resetting app completely...');
    
    // Clear all AsyncStorage data
    await AsyncStorage.clear();
    console.log('✅ AsyncStorage cleared');
    
    // Clear tokens using storage service
    await storageService.clearTokens();
    console.log('✅ Tokens cleared');
    
    // Reset auth store state
    useAuthStore.getState().logout();
    console.log('✅ Auth store reset');
    
    // Force app to restart by clearing any cached data
    console.log('🔄 App reset complete. Please restart the app.');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to reset app:', error);
    return false;
  }
};

export const forceLogout = async () => {
  try {
    console.log('🚪 Force logging out...');
    
    // Clear all auth-related data
    const keysToRemove = [
      'access_token',
      'refresh_token', 
      'token_type',
      'token_expires_at',
      '@auth_tokens',
      '@access_token_expiry',
      '@refresh_token_expiry',
      '@theme',
      'user_data',
      'auth_state'
    ];

    await AsyncStorage.multiRemove(keysToRemove);
    await storageService.clearTokens();
    useAuthStore.getState().logout();
    
    console.log('✅ Force logout complete');
    return true;
  } catch (error) {
    console.error('❌ Force logout failed:', error);
    return false;
  }
}; 