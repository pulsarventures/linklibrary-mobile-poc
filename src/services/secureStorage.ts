import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

export type TokenData = {
  access_token: string;
  access_token_expires_in: number;
  is_revoked: boolean;
  refresh_token: string;
  refresh_token_expires_in: number;
  token_type: string;
}

class SecureStorageService {
  private static readonly SERVICE_NAME = 'com.pulsarventures.linklibraryai.auth';
  
  private keychainAvailable = false; // Temporarily disable Keychain to avoid issues
  private lastValidityCheck = 0;
  private lastValidityResult = false;
  private readonly VALIDITY_CHECK_CACHE_MS = 30 * 1000; // Cache validity check for 30 seconds

  constructor() {
    // Check if Keychain is available
    this.checkKeychainAvailability();
  }

  async clearTokens(): Promise<void> {
    try {
      console.log('🔐 SECURE STORAGE: Clearing tokens...');
      
      // Clear from both Keychain and AsyncStorage to be safe
      if (this.keychainAvailable) {
        try {
          await this.removeSecureItem('all_tokens');
          console.log('🔐 SECURE STORAGE: Tokens cleared from Keychain');
        } catch (keychainError) {
          console.warn('🔐 SECURE STORAGE: Keychain clear failed:', keychainError);
        }
      }
      
      // Always clear AsyncStorage as well (in case we fell back to it)
      try {
        await AsyncStorage.removeItem('secure_tokens');
        console.log('🔐 SECURE STORAGE: Tokens cleared from AsyncStorage');
      } catch (asyncStorageError) {
        console.warn('🔐 SECURE STORAGE: AsyncStorage clear failed:', asyncStorageError);
      }
      
    } catch (error) {
      console.error('🔐 SECURE STORAGE: Failed to clear tokens:', error);
      throw error;
    }
  }

  async getAccessToken(): Promise<null | string> {
    try {
      const tokens = await this.getTokens();
      return tokens?.access_token || null;
    } catch (error) {
      console.error('🔐 SECURE STORAGE: Failed to get access token:', error);
      return null;
    }
  }

  async getAccessTokenExpiry(): Promise<null | string> {
    try {
      const tokens = await this.getTokens();
      return tokens ? tokens.access_token_expires_in.toString() : null;
    } catch (error) {
      console.error('🔐 SECURE STORAGE: Failed to get access token expiry:', error);
      return null;
    }
  }

  async getRefreshToken(): Promise<null | string> {
    try {
      const tokens = await this.getTokens();
      return tokens?.refresh_token || null;
    } catch (error) {
      console.error('🔐 SECURE STORAGE: Failed to get refresh token:', error);
      return null;
    }
  }

  async getRefreshTokenExpiry(): Promise<null | string> {
    try {
      const tokens = await this.getTokens();
      return tokens ? tokens.refresh_token_expires_in.toString() : null;
    } catch (error) {
      console.error('🔐 SECURE STORAGE: Failed to get refresh token expiry:', error);
      return null;
    }
  }

  async getTokens(): Promise<null | TokenData> {
    try {
      let tokenDataString: null | string = null;
      
      if (this.keychainAvailable) {
        try {
          // Get all token data as a single JSON string from Keychain
          tokenDataString = await this.getSecureItem('all_tokens');
          if (tokenDataString) {
            console.log('🔐 SECURE STORAGE: Retrieved tokens from Keychain');
          } else {
            console.log('🔐 SECURE STORAGE: No tokens found in Keychain, falling back to AsyncStorage');
            this.keychainAvailable = false;
          }
        } catch (keychainError) {
          console.warn('🔐 SECURE STORAGE: Keychain failed, falling back to AsyncStorage:', keychainError);
          this.keychainAvailable = false;
        }
      }
      
      if (!this.keychainAvailable && !tokenDataString) {
        // Fallback to AsyncStorage
        tokenDataString = await AsyncStorage.getItem('secure_tokens');
        if (tokenDataString) {
          console.log('🔐 SECURE STORAGE: Retrieved tokens from AsyncStorage');
        }
      }
      
      if (!tokenDataString) {
        console.log('🔐 SECURE STORAGE: No tokens found in any storage');
        return null;
      }
      
      const tokenData = JSON.parse(tokenDataString);
      
      const result = {
        access_token: tokenData.access_token,
        access_token_expires_in: tokenData.access_token_expires_at || tokenData.access_token_expires_in || 0,
        is_revoked: tokenData.is_revoked || false,
        refresh_token: tokenData.refresh_token,
        refresh_token_expires_in: tokenData.refresh_token_expires_at || tokenData.refresh_token_expires_in || 0,
        token_type: tokenData.token_type || 'Bearer',
      };
      
      console.log('🔐 SECURE STORAGE: Returning tokens:', {
        accessTokenExpiresAt: result.access_token_expires_in,
        accessTokenLength: result.access_token?.length,
        hasAccessToken: !!result.access_token,
        hasRefreshToken: !!result.refresh_token,
        refreshTokenExpiresAt: result.refresh_token_expires_in,
        refreshTokenLength: result.refresh_token?.length
      });
      
      return result;
      
    } catch (error) {
      console.error('🔐 SECURE STORAGE: Failed to get tokens:', error);
      return null;
    }
  }

  async isAccessTokenValid(): Promise<boolean> {
    try {
      // Use cached result if recent enough to avoid excessive checks
      const now = Date.now();
      if (now - this.lastValidityCheck < this.VALIDITY_CHECK_CACHE_MS) {
        console.log('🔐 SECURE STORAGE: Using cached validity result:', this.lastValidityResult);
        return this.lastValidityResult;
      }

      const tokens = await this.getTokens();
      if (!tokens?.access_token) {
        console.log('🔐 SECURE STORAGE: No access token found');
        this.lastValidityCheck = now;
        this.lastValidityResult = false;
        return false;
      }

      const bufferTime = 1 * 60 * 1000; // 1 minute buffer (reduced from 5 minutes)
      const expiry = tokens.access_token_expires_in;
      const isValid = now + bufferTime < expiry;
      
      console.log('🔐 SECURE STORAGE: Access token validity check:', {
        expiry,
        expiryDate: new Date(expiry).toISOString(),
        isValid,
        now,
        nowDate: new Date(now).toISOString(),
        timeUntilExpiry: expiry - now,
        timeUntilExpiryHours: Math.floor((expiry - now) / (60 * 60 * 1000)),
        timeUntilExpiryMinutes: Math.floor((expiry - now) / (60 * 1000))
      });
      
      // Cache the result
      this.lastValidityCheck = now;
      this.lastValidityResult = isValid;
      
      return isValid;
    } catch (error) {
      console.error('🔐 SECURE STORAGE: Failed to check access token validity:', error);
      return false;
    }
  }

  async isRefreshTokenValid(): Promise<boolean> {
    try {
      const tokens = await this.getTokens();
      if (!tokens?.refresh_token) {
        console.log('🔐 SECURE STORAGE: No refresh token found');
        return false;
      }

      const now = Date.now();
      const expiry = tokens.refresh_token_expires_in;
      const isValid = now < expiry;
      
      console.log('🔐 SECURE STORAGE: Refresh token validity check:', {
        expiry,
        expiryDate: new Date(expiry).toISOString(),
        isValid,
        now,
        nowDate: new Date(now).toISOString(),
        timeUntilExpiry: expiry - now,
        timeUntilExpiryDays: Math.floor((expiry - now) / (24 * 60 * 60 * 1000))
      });
      
      return isValid;
    } catch (error) {
      console.error('🔐 SECURE STORAGE: Failed to check refresh token validity:', error);
      return false;
    }
  }

  async storeTokens(tokenData: TokenData): Promise<void> {
    try {
      console.log('🔐 SECURE STORAGE: Storing tokens...', {
        access_token_expires_in: tokenData.access_token_expires_in,
        has_access_token: !!tokenData.access_token,
        has_refresh_token: !!tokenData.refresh_token,
        refresh_token_expires_in: tokenData.refresh_token_expires_in
      });
      
      const now = Date.now();
      const accessTokenExpiry = now + (tokenData.access_token_expires_in * 1000); // Convert seconds to milliseconds
      const refreshTokenExpiry = now + (tokenData.refresh_token_expires_in * 1000); // Convert seconds to milliseconds
      
      console.log('🔐 SECURE STORAGE: Calculated expiry times:', {
        accessTokenExpiry,
        accessTokenExpiryDate: new Date(accessTokenExpiry).toISOString(),
        now,
        refreshTokenExpiry,
        refreshTokenExpiryDate: new Date(refreshTokenExpiry).toISOString()
      });

      // Create the complete token object
      const completeTokenData = {
        access_token: tokenData.access_token,
        access_token_expires_at: accessTokenExpiry,
        is_revoked: tokenData.is_revoked,
        refresh_token: tokenData.refresh_token,
        refresh_token_expires_at: refreshTokenExpiry,
        token_type: tokenData.token_type,
      };

      if (this.keychainAvailable) {
        try {
          // Store all token data as a single JSON string in Keychain
          const tokenDataString = JSON.stringify(completeTokenData);
          await this.setSecureItem('all_tokens', tokenDataString);
          console.log('🔐 SECURE STORAGE: Tokens stored successfully in Keychain');
        } catch (keychainError) {
          console.warn('🔐 SECURE STORAGE: Keychain failed, falling back to AsyncStorage:', keychainError);
          this.keychainAvailable = false;
          // Fall through to AsyncStorage
        }
      }
      
      if (!this.keychainAvailable) {
        // Fallback to AsyncStorage
        const tokenDataString = JSON.stringify(completeTokenData);
        await AsyncStorage.setItem('secure_tokens', tokenDataString);
        console.log('🔐 SECURE STORAGE: Tokens stored in AsyncStorage (fallback)');
      }
      
      // Verify the tokens were stored correctly
      const storedTokens = await this.getTokens();
      console.log('🔐 SECURE STORAGE: Verification - stored tokens:', {
        accessTokenLength: storedTokens?.access_token?.length,
        hasAccessToken: !!storedTokens?.access_token,
        hasRefreshToken: !!storedTokens?.refresh_token,
        hasTokens: !!storedTokens,
        refreshTokenLength: storedTokens?.refresh_token?.length
      });
      
    } catch (error) {
      console.error('🔐 SECURE STORAGE: Failed to store tokens:', error);
      throw error;
    }
  }

  private async checkKeychainAvailability() {
    try {
      // Check if Keychain module is properly loaded
      if (!Keychain || typeof Keychain.setGenericPassword !== 'function') {
        console.warn('🔐 SECURE STORAGE: Keychain module not properly loaded, falling back to AsyncStorage');
        this.keychainAvailable = false;
        return;
      }

      // Try a simple operation to test if Keychain is working
      try {
        await Keychain.getSupportedBiometryType();
        this.keychainAvailable = true;
        console.log('🔐 SECURE STORAGE: Keychain is available');
      } catch {
        // Biometry might not be available, but Keychain could still work
        console.log('🔐 SECURE STORAGE: Biometry not available, but Keychain module is loaded');
        this.keychainAvailable = true;
      }
    } catch (error) {
      console.warn('🔐 SECURE STORAGE: Keychain not available, falling back to AsyncStorage:', error);
      this.keychainAvailable = false;
    }
  }

  private async getSecureItem(key: string): Promise<null | string> {
    try {
      if (!Keychain || typeof Keychain.getGenericPassword !== 'function') {
        throw new Error('Keychain module not available');
      }
      const credentials = await Keychain.getGenericPassword({
        service: `${SecureStorageService.SERVICE_NAME}.${key}`,
      });
      if (credentials && credentials.username === key) {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.error(`🔐 SECURE STORAGE: Failed to get ${key}:`, error);
      // If Keychain fails, mark it as unavailable
      this.keychainAvailable = false;
      return null;
    }
  }

  private async removeSecureItem(key: string): Promise<void> {
    try {
      if (!Keychain || typeof Keychain.resetGenericPassword !== 'function') {
        throw new Error('Keychain module not available');
      }
      await Keychain.resetGenericPassword({
        service: `${SecureStorageService.SERVICE_NAME}.${key}`,
      });
    } catch (error) {
      console.error(`🔐 SECURE STORAGE: Failed to remove ${key}:`, error);
      // Don't throw error for removal failures
    }
  }

  private async setSecureItem(key: string, value: string): Promise<void> {
    try {
      if (!Keychain || typeof Keychain.setGenericPassword !== 'function') {
        throw new Error('Keychain module not available');
      }
      await Keychain.setGenericPassword(key, value, {
        service: `${SecureStorageService.SERVICE_NAME}.${key}`,
      });
    } catch (error) {
      console.error(`🔐 SECURE STORAGE: Failed to set ${key}:`, error);
      // If Keychain fails, mark it as unavailable and throw error
      this.keychainAvailable = false;
      throw error;
    }
  }
}

export const secureStorageService = new SecureStorageService(); 