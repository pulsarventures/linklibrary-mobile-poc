import AsyncStorage from '@react-native-async-storage/async-storage';

export type TokenData = {
  access_token: string;
  access_token_expires_in: number;
  is_revoked: boolean;
  refresh_token: string;
  refresh_token_expires_in: number;
  token_type: string;
}

class StorageService {
  private static readonly ACCESS_TOKEN_EXPIRY = '@access_token_expiry';
  private static readonly REFRESH_TOKEN_EXPIRY = '@refresh_token_expiry';
  private static readonly TOKEN_KEY = '@auth_tokens';

  async clearTokens(): Promise<void> {
    await AsyncStorage.multiRemove([
      // Individual keys
      'access_token',
      'refresh_token',
      'token_type',
      'token_expires_at',
      // JSON object keys
      StorageService.TOKEN_KEY,
      StorageService.ACCESS_TOKEN_EXPIRY,
      StorageService.REFRESH_TOKEN_EXPIRY,
    ]);
  }

  async getAccessToken(): Promise<null | string> {
    const tokenData = await this.getTokens();
    return tokenData?.access_token || null;
  }

  async getRefreshToken(): Promise<null | string> {
    const tokenData = await this.getTokens();
    return tokenData?.refresh_token || null;
  }

  async getTokens(): Promise<null | TokenData> {
    const tokenData = await AsyncStorage.getItem(StorageService.TOKEN_KEY);
    return tokenData ? JSON.parse(tokenData) : null;
  }

  async isAccessTokenValid(): Promise<boolean> {
    const expiryString = await AsyncStorage.getItem(StorageService.ACCESS_TOKEN_EXPIRY);
    if (!expiryString) {
      return false;
    }

    const expiry = Number.parseInt(expiryString, 10);
    const now = Date.now();
    const bufferTime = 30 * 1000; // 30 seconds buffer - much more reasonable
    return now + bufferTime < expiry;
  }

  async isRefreshTokenValid(): Promise<boolean> {
    const expiryString = await AsyncStorage.getItem(StorageService.REFRESH_TOKEN_EXPIRY);
    if (!expiryString) {
      return false;
    }

    const expiry = Number.parseInt(expiryString, 10);
    const now = Date.now();
    return now < expiry;
  }

  async storeTokens(tokenData: TokenData): Promise<void> {
    const now = Date.now();
    const accessTokenExpiry = now + tokenData.access_token_expires_in * 1000; // Convert to milliseconds
    const refreshTokenExpiry = now + tokenData.refresh_token_expires_in * 1000;

    console.log('🔑 Storage: Storing tokens');

    // Store only essential data to reduce storage operations
    await Promise.all([
      // Only store JSON object - remove backward compatibility keys to speed up
      AsyncStorage.setItem(StorageService.TOKEN_KEY, JSON.stringify(tokenData)),
      AsyncStorage.setItem(StorageService.ACCESS_TOKEN_EXPIRY, accessTokenExpiry.toString()),
      AsyncStorage.setItem(StorageService.REFRESH_TOKEN_EXPIRY, refreshTokenExpiry.toString()),
    ]);
  }
}

export const storageService = new StorageService(); 