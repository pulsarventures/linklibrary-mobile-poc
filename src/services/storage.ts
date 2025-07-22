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
    const refreshToken = tokenData?.refresh_token || null;
    console.log('🔑 Storage: getRefreshToken called, found token:', refreshToken ? refreshToken.slice(0, 20) + '...' : 'null');
    return refreshToken;
  }

  async getTokens(): Promise<null | TokenData> {
    const tokenData = await AsyncStorage.getItem(StorageService.TOKEN_KEY);
    return tokenData ? JSON.parse(tokenData) : null;
  }

  async isAccessTokenValid(): Promise<boolean> {
    const expiryString = await AsyncStorage.getItem(StorageService.ACCESS_TOKEN_EXPIRY);
    if (!expiryString) {
      console.log('🔑 Storage: No access token expiry found');
      return false;
    }

    const expiry = Number.parseInt(expiryString, 10);
    const now = Date.now();
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
    const isValid = now + bufferTime < expiry;
    
    console.log('🔑 Storage: Access token valid check:', {
      bufferTime: bufferTime / 1000 / 60, // in minutes
      expiry: new Date(expiry).toISOString(),
      expiryMs: expiry,
      isValid,
      now: new Date(now).toISOString(),
      nowMs: now,
      timeRemaining: (expiry - now) / 1000 / 60 // in minutes
    });
    
    return isValid;
  }

  async isRefreshTokenValid(): Promise<boolean> {
    const expiryString = await AsyncStorage.getItem(StorageService.REFRESH_TOKEN_EXPIRY);
    if (!expiryString) {
      console.log('🔑 Storage: No refresh token expiry found');
      return false;
    }

    const expiry = Number.parseInt(expiryString, 10);
    const now = Date.now();
    const isValid = now < expiry;
    console.log('🔑 Storage: Refresh token valid check:', {
      expiry: new Date(expiry).toISOString(),
      expiryMs: expiry,
      isValid,
      now: new Date(now).toISOString(),
      nowMs: now,
      timeRemaining: (expiry - now) / 1000 / 60 / 60 / 24 // in days
    });
    return isValid;
  }

  async storeTokens(tokenData: TokenData): Promise<void> {
    const now = Date.now();
    const accessTokenExpiry = now + tokenData.access_token_expires_in * 1000; // Convert to milliseconds
    const refreshTokenExpiry = now + tokenData.refresh_token_expires_in * 1000;

    console.log('🔑 Storage: Storing tokens with expiry times:', {
      accessTokenExpiresIn: tokenData.access_token_expires_in, // seconds
      accessTokenExpiry: new Date(accessTokenExpiry).toISOString(),
      accessTokenExpiryMs: accessTokenExpiry,
      now: new Date(now).toISOString(),
      refreshTokenExpiresIn: tokenData.refresh_token_expires_in, // seconds
      refreshTokenExpiry: new Date(refreshTokenExpiry).toISOString(),
      refreshTokenExpiryMs: refreshTokenExpiry,
    });

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
}

export const storageService = new StorageService(); 