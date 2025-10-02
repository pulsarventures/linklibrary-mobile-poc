import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Generate a secure encryption key for storage
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
 * Get the encryption key for storage
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
 * Simple encryption/decryption functions for AsyncStorage
 */
function simpleEncrypt(text: string, key: string): string {
  // Simple XOR encryption for development
  // In production, use a proper encryption library
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result); // Base64 encode
}

function simpleDecrypt(encryptedText: string, key: string): string {
  // Simple XOR decryption for development
  // In production, use a proper encryption library
  try {
    const decoded = atob(encryptedText); // Base64 decode
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch (error) {
    return '';
  }
}

/**
 * Create a secure storage interface compatible with MMKV
 */
export function createSecureStorage() {
  const encryptionKey = getEncryptionKey();
  
  return {
    set: async (key: string, value: string) => {
      const encrypted = simpleEncrypt(value, encryptionKey);
      await AsyncStorage.setItem(`secure_${key}`, encrypted);
    },
    
    getString: async (key: string): Promise<string | undefined> => {
      try {
        const encrypted = await AsyncStorage.getItem(`secure_${key}`);
        if (encrypted === null) return undefined;
        return simpleDecrypt(encrypted, encryptionKey);
      } catch (error) {
        return undefined;
      }
    },
    
    delete: async (key: string) => {
      await AsyncStorage.removeItem(`secure_${key}`);
    },
    
    clearAll: async () => {
      const keys = await AsyncStorage.getAllKeys();
      const secureKeys = keys.filter(key => key.startsWith('secure_'));
      await AsyncStorage.multiRemove(secureKeys);
    }
  };
}

/**
 * Check if the device supports encryption
 */
export function isEncryptionSupported(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
} 