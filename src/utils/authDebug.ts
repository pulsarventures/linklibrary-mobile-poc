import { secureStorageService } from '@/services/secureStorage';
import { storageService } from '@/services/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthDebugUtils = {
  
  async clearAllAuthData(): Promise<void> {
    console.log('🧹 AUTH DEBUG: Clearing all auth data...');
    
    try {
      // Clear secure storage
      await secureStorageService.clearTokens();
      
      // Clear any old AsyncStorage keys that might exist
      const allKeys = await AsyncStorage.getAllKeys();
      const authKeys = allKeys.filter(key => 
        key.includes('token') || 
        key.includes('auth') || 
        key.includes('user') ||
        key === 'secure_tokens'
      );
      
      if (authKeys.length > 0) {
        await AsyncStorage.multiRemove(authKeys);
        console.log('🧹 AUTH DEBUG: Cleared AsyncStorage keys:', authKeys);
      }
      
      console.log('🧹 AUTH DEBUG: All auth data cleared successfully');
    } catch (error) {
      console.error('🧹 AUTH DEBUG: Failed to clear auth data:', error);
    }
  },
  
  async debugTokenStorage(): Promise<void> {
    console.log('🔍 AUTH DEBUG: Checking token storage...');
    
    try {
      // Check current storage service
      const tokens = await storageService.getTokens();
      console.log('🔍 AUTH DEBUG: Current storage service tokens:', {
        accessTokenExpiry: tokens?.access_token_expires_in,
        accessTokenLength: tokens?.access_token.length,
        hasAccessToken: !!tokens?.access_token,
        hasRefreshToken: !!tokens?.refresh_token,
        hasTokens: !!tokens,
        isRevoked: tokens?.is_revoked,
        refreshTokenExpiry: tokens?.refresh_token_expires_in,
        refreshTokenLength: tokens?.refresh_token.length
      });
      
      // Check secure storage
      const secureTokens = await secureStorageService.getTokens();
      console.log('🔍 AUTH DEBUG: Secure storage tokens:', {
        accessTokenExpiry: secureTokens?.access_token_expires_in,
        accessTokenLength: secureTokens?.access_token.length,
        hasAccessToken: !!secureTokens?.access_token,
        hasRefreshToken: !!secureTokens?.refresh_token,
        hasTokens: !!secureTokens,
        isRevoked: secureTokens?.is_revoked,
        refreshTokenExpiry: secureTokens?.refresh_token_expires_in,
        refreshTokenLength: secureTokens?.refresh_token.length
      });
      
      // Check AsyncStorage directly
      const asyncStorageTokens = await AsyncStorage.getItem('secure_tokens');
      console.log('🔍 AUTH DEBUG: AsyncStorage tokens:', {
        dataLength: asyncStorageTokens?.length,
        hasData: !!asyncStorageTokens
      });
      
      if (asyncStorageTokens) {
        try {
          const parsed = JSON.parse(asyncStorageTokens);
          console.log('🔍 AUTH DEBUG: Parsed AsyncStorage tokens:', {
            hasAccessToken: !!parsed.access_token,
            hasRefreshToken: !!parsed.refresh_token,
            keys: Object.keys(parsed)
          });
        } catch (parseError) {
          console.error('🔍 AUTH DEBUG: Failed to parse AsyncStorage tokens:', parseError);
        }
      }
      
      // Check all AsyncStorage keys
      const allKeys = await AsyncStorage.getAllKeys();
      const authRelatedKeys = allKeys.filter(key => 
        key.includes('token') || 
        key.includes('auth') || 
        key.includes('user')
      );
      console.log('🔍 AUTH DEBUG: Auth-related AsyncStorage keys:', authRelatedKeys);
      
    } catch (error) {
      console.error('🔍 AUTH DEBUG: Failed to debug token storage:', error);
    }
  },
  
  async testTokenStorage(): Promise<void> {
    console.log('🧪 AUTH DEBUG: Testing token storage...');
    
    const testTokenData = {
      access_token: 'test_access_token_12345',
      access_token_expires_in: 7200, // 2 hours
      is_revoked: false,
      refresh_token: 'test_refresh_token_67890',
      refresh_token_expires_in: 604_800, // 7 days
      token_type: 'Bearer'
    };
    
    try {
      // Store test tokens
      await secureStorageService.storeTokens(testTokenData);
      console.log('🧪 AUTH DEBUG: Test tokens stored');
      
      // Retrieve test tokens
      const retrievedTokens = await secureStorageService.getTokens();
      console.log('🧪 AUTH DEBUG: Test tokens retrieved:', {
        hasAccessToken: !!retrievedTokens?.access_token,
        hasRefreshToken: !!retrievedTokens?.refresh_token,
        match: retrievedTokens?.access_token === testTokenData.access_token &&
               retrievedTokens.refresh_token === testTokenData.refresh_token
      });
      
      // Clean up test tokens
      await secureStorageService.clearTokens();
      console.log('🧪 AUTH DEBUG: Test tokens cleared');
      
    } catch (error) {
      console.error('🧪 AUTH DEBUG: Token storage test failed:', error);
    }
  },
};