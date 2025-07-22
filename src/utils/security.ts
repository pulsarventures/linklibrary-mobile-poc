import { Platform } from 'react-native';
import { MMKV } from 'react-native-mmkv';

/**
 * Generate a secure encryption key for MMKV
 * In production, you should generate this once and store it securely
 */
export function generateEncryptionKey(): string {
  // Generate a 32-character random string for AES-256
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let index = 0; index < 32; index++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Get the encryption key for MMKV storage
 * In production, this should be stored securely (e.g., in Keychain)
 */
export function getEncryptionKey(): string {
  // For development, use a fixed key
  // In production, retrieve from secure storage like Keychain
  if (__DEV__) {
    return 'linklibrary-dev-key-2024-32chars';
  }
  
  // In production, you should implement secure key retrieval
  // For now, using a fixed production key (should be stored in Keychain)
  return 'linklibrary-prod-key-2024-32chars';
}

/**
 * Create a secure MMKV instance for credentials
 */
export function createSecureStorage(): MMKV {
  return new MMKV({
    encryptionKey: getEncryptionKey(),
    id: 'secure-credentials',
  });
}

/**
 * Check if the device supports encryption
 */
export function isEncryptionSupported(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
} 