import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/hooks/domain/user/useAuthStore';

/**
 * Utility function to clear the logout flag immediately
 * Can be called from React Native debugger console
 */
export const clearLogoutFlagNow = async () => {
  try {
    console.log('🔓 Clearing logout flag immediately...');
    await AsyncStorage.removeItem('@has_logged_out');
    console.log('✅ Logout flag cleared successfully!');
    
    // Also check if it was actually cleared
    const hasLoggedOut = await AsyncStorage.getItem('@has_logged_out');
    console.log('🔍 Logout flag status after clearing:', hasLoggedOut);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to clear logout flag:', error);
    return false;
  }
};

/**
 * AGGRESSIVE FIX: Clear logout flag and force re-authentication
 */
export const forceFixLogoutIssue = async () => {
  try {
    console.log('🔧 FORCE FIXING LOGOUT ISSUE...');
    
    // Step 1: Clear logout flag
    await AsyncStorage.removeItem('@has_logged_out');
    console.log('✅ Logout flag cleared');
    
    // Step 2: Force re-initialization of auth
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

// Make these available globally for debugging
if (typeof global !== 'undefined') {
  (global as any).clearLogoutFlagNow = clearLogoutFlagNow;
  (global as any).checkLogoutFlagNow = checkLogoutFlagNow;
  (global as any).forceFixLogoutIssue = forceFixLogoutIssue;
}
