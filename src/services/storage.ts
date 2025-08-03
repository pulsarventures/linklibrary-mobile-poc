import AsyncStorage from '@react-native-async-storage/async-storage';

export type TokenData = {
  access_token: string;
  access_token_expires_in: number;
  access_token_expires_at?: number; // New epoch timestamp from API
  is_revoked: boolean;
  refresh_token: string;
  refresh_token_expires_in: number;
  refresh_token_expires_at?: number; // New epoch timestamp from API
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
    const bufferTime = 60 * 1000; // 60 seconds buffer for better UX - only refresh when truly needed
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
    
    // Use provided epoch timestamps if available, otherwise calculate from expires_in
    const accessTokenExpiry = tokenData.access_token_expires_at 
      ? tokenData.access_token_expires_at * 1000 // Convert epoch seconds to milliseconds
      : now + tokenData.access_token_expires_in * 1000;
      
    const refreshTokenExpiry = tokenData.refresh_token_expires_at 
      ? tokenData.refresh_token_expires_at * 1000 // Convert epoch seconds to milliseconds  
      : now + tokenData.refresh_token_expires_in * 1000;

    console.log('🔑 Storage: Storing tokens with expiry times:', {
      access_expires_at: new Date(accessTokenExpiry).toISOString(),
      refresh_expires_at: new Date(refreshTokenExpiry).toISOString()
    });

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