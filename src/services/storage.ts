import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TokenData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  access_token_expires_in: number;
  refresh_token_expires_in: number;
  is_revoked: boolean;
}

class StorageService {
  private static readonly TOKEN_KEY = '@auth_tokens';
  private static readonly ACCESS_TOKEN_EXPIRY = '@access_token_expiry';
  private static readonly REFRESH_TOKEN_EXPIRY = '@refresh_token_expiry';

  async storeTokens(tokenData: TokenData): Promise<void> {
    const now = Date.now();
    const accessTokenExpiry = now + tokenData.access_token_expires_in * 1000; // Convert to milliseconds
    const refreshTokenExpiry = now + tokenData.refresh_token_expires_in * 1000;

    // Store both individual keys (for initializeAuth compatibility) and JSON object
    await Promise.all([
      // Individual keys for backward compatibility
      AsyncStorage.setItem('access_token', tokenData.access_token),
      AsyncStorage.setItem('refresh_token', tokenData.refresh_token),
      AsyncStorage.setItem('token_type', tokenData.token_type),
      AsyncStorage.setItem('token_expires_at', accessTokenExpiry.toString()),
      // JSON object for modern access
      AsyncStorage.setItem(StorageService.TOKEN_KEY, JSON.stringify(tokenData)),
      AsyncStorage.setItem(StorageService.ACCESS_TOKEN_EXPIRY, accessTokenExpiry.toString()),
      AsyncStorage.setItem(StorageService.REFRESH_TOKEN_EXPIRY, refreshTokenExpiry.toString()),
    ]);
  }

  async getTokens(): Promise<TokenData | null> {
    const tokenData = await AsyncStorage.getItem(StorageService.TOKEN_KEY);
    return tokenData ? JSON.parse(tokenData) : null;
  }

  async getAccessToken(): Promise<string | null> {
    const tokenData = await this.getTokens();
    return tokenData?.access_token || null;
  }

  async getRefreshToken(): Promise<string | null> {
    const tokenData = await this.getTokens();
    return tokenData?.refresh_token || null;
  }

  async isAccessTokenValid(): Promise<boolean> {
    const expiryStr = await AsyncStorage.getItem(StorageService.ACCESS_TOKEN_EXPIRY);
    if (!expiryStr) return false;

    const expiry = parseInt(expiryStr, 10);
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
    return Date.now() + bufferTime < expiry;
  }

  async isRefreshTokenValid(): Promise<boolean> {
    const expiryStr = await AsyncStorage.getItem(StorageService.REFRESH_TOKEN_EXPIRY);
    if (!expiryStr) return false;

    const expiry = parseInt(expiryStr, 10);
    return Date.now() < expiry;
  }

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
}

export const storageService = new StorageService(); 