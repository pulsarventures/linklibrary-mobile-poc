import { Alert, Linking } from 'react-native';

import { apiClient } from '@/services/api/client';
import { secureStorageService } from '@/services/secureStorage';

export const ApiDebugUtils = {
  
  async checkSharedData(): Promise<void> {
    Alert.alert('Simplified Sharing', 'Now using simple URL scheme approach. Test with: linklibrary://share?url=https://example.com');
  },

  async testAllURLSchemes(): Promise<void> {
    const schemes = [
      'linklibrary://share',
      'linklibrary://',
      'linklib://share',
      'linklib://',
      'com.pulsarventures.linklibraryai://share',
      'com.pulsarventures.linklibraryai://'
    ];
    
    console.log('🔗 Testing all URL schemes...');
    const results: Record<string, boolean> = {};
    
    for (const scheme of schemes) {
      results[scheme] = await this.testURLScheme(scheme);
    }
    
    console.log('🔗 URL Scheme Test Results:', results);
    
    // Show results in alert
    const resultText = Object.entries(results)
      .map(([scheme, success]) => `${success ? '✅' : '❌'} ${scheme}`)
      .join('\n');
      
    Alert.alert(
      'URL Scheme Test Results',
      resultText,
      [{ text: 'OK' }]
    );
  },
  
  async testApiBase(): Promise<void> {
    console.log('🔍 API DEBUG: Testing API base...');
    
    try {
      // Test a simple endpoint that should work
      const response = await fetch('https://api.linklibrary.ai/api/v1/health');
      console.log('🔍 API DEBUG: Health check response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      });
      
      if (response.ok) {
        const data = await response.text();
        console.log('🔍 API DEBUG: Health check data:', data);
      }
    } catch (error) {
      console.error('🔍 API DEBUG: Health check failed:', error);
    }
  },
  
  async testAuthenticatedEndpoints(): Promise<void> {
    console.log('🔍 API DEBUG: Testing authenticated endpoints...');
    
    const endpointsToTest = [
      { description: 'Collections list', endpoint: '/collections/' },
      { description: 'Links list', endpoint: '/links/' },
      { description: 'Tags list', endpoint: '/tags/' }
    ];
    
    for (const { description, endpoint } of endpointsToTest) {
      try {
        console.log(`🔍 API DEBUG: Testing ${description} - GET ${endpoint}`);
        const response = await apiClient.get(endpoint);
        console.log(`✅ API DEBUG: ${description} - SUCCESS:`, {
          hasData: !!response,
          keys: response && typeof response === 'object' ? Object.keys(response) : [],
          type: typeof response
        });
      } catch (error) {
        console.log(`❌ API DEBUG: ${description} - FAILED:`, error instanceof Error ? error.message : error);
      }
    }
  },

  async testShareExtensionFlow(): Promise<void> {
    try {
      console.log('🔍 Testing simplified URL scheme flow...');
      
      // Test the new simple approach
      const testUrl = 'linklibrary://share?url=' + encodeURIComponent('https://youtube.com/watch?v=test123');
      
      const canOpen = await Linking.canOpenURL(testUrl);
      console.log('🔍 Can open test URL:', canOpen);
      
      if (canOpen) {
        await Linking.openURL(testUrl);
        console.log('🔍 URL scheme opened successfully');
      } else {
        console.log('🔍 URL scheme failed');
      }
      
      Alert.alert(
        'URL Scheme Test',
        'Testing simplified URL scheme approach. Check console logs.',
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('🔍 Error in URL scheme test:', error);
      Alert.alert('Error', `Failed to test URL scheme: ${error}`);
    }
  },

  async testShareExtensionSave(): Promise<void> {
    Alert.alert('Simplified Sharing', 'Extension approach removed. Use URL scheme instead: linklibrary://share?url=https://example.com');
  },

  async testTokenDirectly(): Promise<void> {
    console.log('🔍 API DEBUG: Testing token directly with fetch...');
    
    const tokens = await secureStorageService.getTokens();
    if (!tokens?.access_token) {
      console.log('❌ API DEBUG: No access token available');
      return;
    }

    try {
      // Test with direct fetch (like Next.js does)
      const response = await fetch('https://api.linklibrary.ai/api/v1/users/me', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json',
        },
        method: 'GET',
      });

      console.log('🔍 API DEBUG: Direct fetch response:', {
        headers: Object.fromEntries(response.headers.entries()),
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API DEBUG: Direct fetch SUCCESS:', data);
      } else {
        const errorData = await response.text();
        console.log('❌ API DEBUG: Direct fetch ERROR:', errorData);
      }
    } catch (error) {
      console.error('❌ API DEBUG: Direct fetch FAILED:', error);
    }
  },

  async testURLScheme(urlScheme: string): Promise<boolean> {
    try {
      console.log(`🔗 Testing URL scheme: ${urlScheme}`);
      
      // First check if the URL can be handled
      const canOpen = await Linking.canOpenURL(urlScheme);
      console.log(`🔗 Can open ${urlScheme}: ${canOpen}`);
      
      return canOpen;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`🔗 Error testing URL scheme ${urlScheme}:`, errorMessage);
      return false;
    }
  },

  async testUserEndpoints(): Promise<void> {
    console.log('🔍 API DEBUG: Testing user endpoints...');
    
    // First check if we have tokens
    const tokens = await secureStorageService.getTokens();
    console.log('🔍 API DEBUG: Current tokens:', {
      accessTokenLength: tokens?.access_token?.length,
      hasAccessToken: !!tokens?.access_token,
      hasRefreshToken: !!tokens?.refresh_token,
      hasTokens: !!tokens,
      isAccessTokenValid: tokens ? await secureStorageService.isAccessTokenValid() : false,
      isRefreshTokenValid: tokens ? await secureStorageService.isRefreshTokenValid() : false
    });
    
    if (!tokens?.access_token) {
      console.log('❌ API DEBUG: No access token available for testing');
      return;
    }
    
    const endpointsToTest = [
      '/users/me'  // Only valid user endpoint that requires authentication
    ];
    
    for (const endpoint of endpointsToTest) {
      try {
        console.log(`🔍 API DEBUG: Testing GET ${endpoint}`);
        const response = await apiClient.get(endpoint);
        console.log(`✅ API DEBUG: ${endpoint} - SUCCESS:`, response);
        return; // Found working endpoint
      } catch (error) {
        console.log(`❌ API DEBUG: ${endpoint} - FAILED:`, error instanceof Error ? error.message : error);
      }
    }
    
    console.log('🔍 API DEBUG: No working user endpoint found');
  },
};