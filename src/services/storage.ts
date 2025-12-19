import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

export type TokenData = {
  access_token: string;
  access_token_expires_at: number; // epoch timestamp in seconds - REQUIRED
  access_token_expires_in: number;
  is_revoked: boolean;
  refresh_token: string;
  refresh_token_expires_at: number; // epoch timestamp in seconds - REQUIRED
  refresh_token_expires_in: number;
  token_type: string;
};

class StorageService {
  private static readonly ACCESS_TOKEN_EXPIRY = '@access_token_expiry';
  private static readonly REFRESH_TOKEN_EXPIRY = '@refresh_token_expiry';
  private static readonly TOKEN_KEY = '@auth_tokens';
  // Use Generic Password keychain with a dedicated service name
  private static readonly KEYCHAIN_SERVICE = 'com.linklibrary.auth';
  private static readonly KEYCHAIN_SERVER = 'com.linklibrary.auth'; // For internet credentials

  async clearTokens(): Promise<void> {
    console.log('🔐 NUCLEAR TOKEN WIPE INITIATED...');

    // NUCLEAR OPTION 1: Clear ALL possible Keychain services
    const services = [
      StorageService.KEYCHAIN_SERVICE,
      'com.linklibrary.auth',
      'com.pulsarventures.linklibrary.ai',
      'linklibrary_mobile',
      undefined, // default service
    ];

    for (const service of services) {
      try {
        if (service) {
          await Keychain.resetGenericPassword({ service });
          console.log(`🔐 Cleared generic password for service: ${service}`);
        } else {
          await Keychain.resetGenericPassword();
          console.log('🔐 Cleared default generic password');
        }
      } catch (error) {
        // Ignore errors, try all
      }
    }

    // NUCLEAR OPTION 2: Clear Internet Credentials with all possible servers
    const servers = [
      StorageService.KEYCHAIN_SERVER,
      'com.linklibrary.auth',
      'api.linklibrary.ai',
      'https://api.linklibrary.ai',
    ];

    for (const server of servers) {
      try {
        await Keychain.resetInternetCredentials({ server });
        console.log(`🔐 Cleared internet credentials for server: ${server}`);
      } catch (error) {
        // Ignore errors, try all
      }
    }

    // Clear from AsyncStorage - all possible keys
    const keysToRemove = [
      // Individual keys
      'access_token',
      'refresh_token',
      'token_type',
      'token_expires_at',
      'access_token_expires_at',
      'refresh_token_expires_at',
      'access_token_expires_in',
      'refresh_token_expires_in',
      'is_revoked',
      // JSON object keys
      StorageService.TOKEN_KEY,
      StorageService.ACCESS_TOKEN_EXPIRY,
      StorageService.REFRESH_TOKEN_EXPIRY,
      // Legacy keys
      '@auth_tokens',
      '@access_token_expiry',
      '@refresh_token_expiry',
    ];

    await AsyncStorage.multiRemove(keysToRemove);
    console.log('🔐 AsyncStorage: Cleared all token keys');

    // Verify everything is cleared (check without migration)
    let remainingTokens = null;
    try {
      // Only check generic password, don't trigger migration
      const credentials = await Keychain.getGenericPassword({
        service: StorageService.KEYCHAIN_SERVICE,
      });
      if (credentials && credentials.password) {
        remainingTokens = JSON.parse(credentials.password);
      }
    } catch {}

    if (remainingTokens) {
      console.error(
        '⚠️ WARNING: Tokens still exist in Keychain after clearing!',
        remainingTokens,
      );
    } else {
      console.log('✅ All tokens successfully cleared from Keychain');
    }
  }

  async getAccessToken(): Promise<null | string> {
    console.log('🔍 getAccessToken called');
    const tokenData = await this.getTokens();
    const hasToken = !!tokenData?.access_token;
    console.log('🔍 getAccessToken result:', {
      tokenData,
      tokenLength: tokenData?.access_token?.length || 0,
    });
    try {
      await AsyncStorage.setItem(
        StorageService.TOKEN_KEY,
        JSON.stringify(tokenData),
      );
      // await Keychain.setGenericPassword(
      //   'token_data',
      //   JSON.stringify(tokenData),
      //   {
      //     accessGroup: 'group.com.pulsarventures.linklibrary.ai',
      //     accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      //     service: StorageService.KEYCHAIN_SERVICE,
      //   },
      // );
      console.log('✅ Tokens stored in Keychain (generic) successfully');
    } catch (error) {
      console.error('❌ Failed to store tokens in Keychain (generic):', error);
      // Fall back to AsyncStorage if Keychain fails
      await AsyncStorage.setItem(
        StorageService.TOKEN_KEY,
        JSON.stringify(tokenData),
      );
    }
    return tokenData?.access_token || null;
  }

  async getRefreshToken(): Promise<null | string> {
    const tokenData = await this.getTokens();
    return tokenData?.refresh_token || null;
  }

  async getTokens(): Promise<null | TokenData> {
    // CHECK LOGOUT FLAG FIRST - prevent returning tokens if user logged out
    const hasLoggedOut = await AsyncStorage.getItem('@has_logged_out');
    console.log('🔍 getTokens - Logout flag check:', hasLoggedOut);

    if (hasLoggedOut === 'true') {
      console.log('🚫 Logout flag set, checking for valid tokens...');

      // FIX: If we have valid tokens but logout flag is set, clear the flag
      try {
        const credentials = await this.withTimeout(
          Keychain.getGenericPassword({
            service: StorageService.KEYCHAIN_SERVICE,
          }),
          2000,
          'getGenericPassword during logout check',
        );
        console.log('🔍 Keychain credentials found:', !!credentials);

        if (credentials && credentials.password) {
          const parsed = JSON.parse(credentials.password);
          console.log('🔍 Found tokens in Keychain:', {
            hasAccessToken: !!parsed?.access_token,
            hasRefreshToken: !!parsed?.refresh_token,
            accessTokenLength: parsed?.access_token?.length || 0,
            refreshTokenLength: parsed?.refresh_token?.length || 0,
          });

          if (parsed?.access_token && parsed?.refresh_token) {
            console.log(
              '🔧 FIXING: Valid tokens found but logout flag is set - clearing flag',
            );
            await AsyncStorage.removeItem('@has_logged_out');
            console.log('✅ Logout flag cleared, returning tokens');
            return parsed as TokenData;
          } else {
            console.log(
              '⚠️ Tokens found but invalid - not clearing logout flag',
            );
          }
        } else {
          console.log('⚠️ No credentials found in Keychain');
        }
      } catch (error) {
        console.log(
          'Failed to check for valid tokens during logout flag fix:',
          error,
        );
      }

      console.log('🚫 Returning null tokens due to logout flag');
      return null;
    }

    try {
      // Try to get from Keychain (Generic Password) first with timeout
      const credentials = await this.withTimeout(
        Keychain.getGenericPassword({
          service: StorageService.KEYCHAIN_SERVICE,
        }),
        2000,
        'getGenericPassword',
      );
      if (credentials && credentials.password) {
        const parsed = JSON.parse(credentials.password);
        // Sanity check shape
        if (parsed?.access_token && parsed?.refresh_token) {
          console.log('🔐 Keychain: Loaded tokens from generic password');
          return parsed as TokenData;
        }
      }
    } catch (error) {
      console.log('Failed to get tokens from Keychain (generic):', error);
    }

    // DO NOT MIGRATE OLD TOKENS - they are likely expired/invalid
    // Just clear them if found
    try {
      const legacy = await this.withTimeout(
        Keychain.getInternetCredentials(StorageService.KEYCHAIN_SERVER),
        2000,
        'getInternetCredentials',
      );
      if (legacy && legacy.password) {
        console.log('🔐 Keychain: Found OLD legacy tokens, clearing them...');
        try {
          await Keychain.resetInternetCredentials({
            server: StorageService.KEYCHAIN_SERVER,
          });
          console.log('🔐 Keychain: Cleared old legacy tokens');
        } catch {}
        // Return null - don't use old tokens
        return null;
      }
    } catch (legacyError) {
      // ignore
    }

    // Fallback to AsyncStorage for backward compatibility
    const tokenData = await AsyncStorage.getItem(StorageService.TOKEN_KEY);
    if (tokenData) {
      const parsed = JSON.parse(tokenData);
      // Migrate to Keychain if found in AsyncStorage
      await this.storeTokens(parsed as TokenData);
      return parsed as TokenData;
    }

    return null;
  }

  // Helper method to add timeout to Keychain operations
  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    operation: string,
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(`Keychain ${operation} timeout after ${timeoutMs}ms`),
            ),
          timeoutMs,
        ),
      ),
    ]);
  }

  async isAccessTokenValid(): Promise<boolean> {
    // Prefer computing from tokens in Keychain to avoid relying on AsyncStorage mirrors
    const tokens = await this.getTokens();
    if (!tokens?.access_token || !tokens?.access_token_expires_at) {
      console.log('⚠️ No access token or expiry found');
      return false;
    }

    const expiryMs = tokens.access_token_expires_at * 1000;
    const now = Date.now();
    const isValid = now < expiryMs;

    if (!isValid) {
      console.log('⏰ Access token expired:', {
        expiry: new Date(expiryMs).toISOString(),
        now: new Date(now).toISOString(),
      });
    }

    return isValid;
  }

  async shouldRefreshTokenProactively(): Promise<boolean> {
    // Check if token should be refreshed proactively (e.g., 5 minutes before expiry)
    const tokens = await this.getTokens();
    if (!tokens?.access_token || !tokens?.access_token_expires_at) {
      return false;
    }

    const expiryMs = tokens.access_token_expires_at * 1000;
    const now = Date.now();
    const timeUntilExpiry = expiryMs - now;

    // Refresh if token expires in less than 5 minutes (300,000 ms)
    const shouldRefresh = timeUntilExpiry < 300000 && timeUntilExpiry > 0;

    if (shouldRefresh) {
      console.log('🔄 Proactive refresh recommended:', {
        timeUntilExpiry: Math.round(timeUntilExpiry / 1000 / 60) + ' minutes',
        expiry: new Date(expiryMs).toISOString(),
        now: new Date(now).toISOString(),
      });
    }

    return shouldRefresh;
  }

  async isRefreshTokenValid(): Promise<boolean> {
    const tokens = await this.getTokens();
    if (!tokens?.refresh_token || !tokens?.refresh_token_expires_at) {
      return false;
    }

    const expiryMs = tokens.refresh_token_expires_at * 1000;
    const now = Date.now();
    return now < expiryMs;
  }

  async storeTokens(tokenData: TokenData): Promise<void> {
    const now = Date.now();

    // The API ALWAYS returns expires_at as epoch timestamps in seconds for both login methods
    // Convert to milliseconds for JavaScript Date
    const accessTokenExpiry = tokenData.access_token_expires_at * 1000;
    const refreshTokenExpiry = tokenData.refresh_token_expires_at * 1000;

    console.log('🔑 Storing tokens with expiry:', {
      access_expires: new Date(accessTokenExpiry).toISOString(),
      access_valid_for_hours: Math.round(
        (accessTokenExpiry - now) / (1000 * 60 * 60),
      ),
      now: new Date(now).toISOString(),
      refresh_expires: new Date(refreshTokenExpiry).toISOString(),
      refresh_valid_for_days: Math.round(
        (refreshTokenExpiry - now) / (1000 * 60 * 60 * 24),
      ),
    });

    // Store tokens in Keychain (Generic Password) for secure persistent storage
    try {
      await Keychain.setGenericPassword(
        'token_data',
        JSON.stringify(tokenData.access_token),
        {
          accessGroup: 'group.com.pulsarventures.linklibrary.ai',
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
          service: StorageService.KEYCHAIN_SERVICE,
        },
      );
      console.log('✅ Tokens stored in Keychain (generic) successfully');
    } catch (error) {
      console.error('❌ Failed to store tokens in Keychain (generic):', error);
      // Fall back to AsyncStorage if Keychain fails
      await AsyncStorage.setItem(
        StorageService.TOKEN_KEY,
        JSON.stringify(tokenData.access_token),
      );
    }

    // Also mirror expiry times in AsyncStorage (best-effort)
    try {
      await Promise.all([
        AsyncStorage.setItem(
          StorageService.ACCESS_TOKEN_EXPIRY,
          accessTokenExpiry.toString(),
        ),
        AsyncStorage.setItem(
          StorageService.REFRESH_TOKEN_EXPIRY,
          refreshTokenExpiry.toString(),
        ),
      ]);
    } catch {}
  }
}

export const storageService = new StorageService();
