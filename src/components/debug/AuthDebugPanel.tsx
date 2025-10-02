import { secureStorageService } from '@/services/secureStorage';
import { ApiDebugUtils } from '@/utils/apiDebug';
import { AuthDebugUtils } from '@/utils/authDebug';
import { clearLogoutFlag, checkLogoutFlag } from '@/utils/clearAuthData';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function AuthDebugPanel() {
  const [debugInfo, setDebugInfo] = React.useState<string>('Ready to debug...');

  const handleClearAuthData = async () => {
    try {
      setDebugInfo('Clearing auth data...');
      await AuthDebugUtils.clearAllAuthData();
      setDebugInfo('Auth data cleared successfully!');
    } catch (error) {
      setDebugInfo(`Error clearing auth data: ${error}`);
    }
  };

  const handleDebugTokenStorage = async () => {
    try {
      setDebugInfo('Debugging token storage...');
      await AuthDebugUtils.debugTokenStorage();
      setDebugInfo('Check console for debug info');
    } catch (error) {
      setDebugInfo(`Error debugging tokens: ${error}`);
    }
  };

  const handleTestTokenStorage = async () => {
    try {
      setDebugInfo('Testing token storage...');
      await AuthDebugUtils.testTokenStorage();
      setDebugInfo('Token storage test completed - check console');
    } catch (error) {
      setDebugInfo(`Error testing tokens: ${error}`);
    }
  };

  const handleCheckTokens = async () => {
    try {
      setDebugInfo('Checking current tokens...');
      const tokens = await secureStorageService.getTokens();
      setDebugInfo(`Tokens: ${tokens ? 'Found' : 'Not found'} - check console for details`);
      console.log('🔍 Current tokens:', tokens);
    } catch (error) {
      setDebugInfo(`Error checking tokens: ${error}`);
    }
  };

  const handleTestUserEndpoints = async () => {
    try {
      setDebugInfo('Testing user endpoints...');
      await ApiDebugUtils.testUserEndpoints();
      setDebugInfo('User endpoint test completed - check console');
    } catch (error) {
      setDebugInfo(`Error testing endpoints: ${error}`);
    }
  };

  const handleTestApiBase = async () => {
    try {
      setDebugInfo('Testing API base...');
      await ApiDebugUtils.testApiBase();
      setDebugInfo('API base test completed - check console');
    } catch (error) {
      setDebugInfo(`Error testing API: ${error}`);
    }
  };

  const handleTestAuthEndpoints = async () => {
    try {
      setDebugInfo('Testing authenticated endpoints...');
      await ApiDebugUtils.testAuthenticatedEndpoints();
      setDebugInfo('Auth endpoints test completed - check console');
    } catch (error) {
      setDebugInfo(`Error testing auth endpoints: ${error}`);
    }
  };

  const handleCheckLogoutFlag = async () => {
    try {
      setDebugInfo('Checking logout flag...');
      const hasLoggedOut = await checkLogoutFlag();
      setDebugInfo(`Logout flag: ${hasLoggedOut ? 'SET' : 'NOT SET'}`);
    } catch (error) {
      setDebugInfo(`Error checking logout flag: ${error}`);
    }
  };

  const handleClearLogoutFlag = async () => {
    try {
      setDebugInfo('Clearing logout flag...');
      await clearLogoutFlag();
      setDebugInfo('Logout flag cleared successfully!');
    } catch (error) {
      setDebugInfo(`Error clearing logout flag: ${error}`);
    }
  };

  if (!__DEV__) {
    return null; // Only show in development
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Auth Debug Panel</Text>
      <Text style={styles.info}>{debugInfo}</Text>
      
      <TouchableOpacity onPress={handleClearAuthData} style={styles.button}>
        <Text style={styles.buttonText}>Clear All Auth Data</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleCheckTokens} style={styles.button}>
        <Text style={styles.buttonText}>Check Current Tokens</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleDebugTokenStorage} style={styles.button}>
        <Text style={styles.buttonText}>Debug Token Storage</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleTestTokenStorage} style={styles.button}>
        <Text style={styles.buttonText}>Test Token Storage</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleTestUserEndpoints} style={styles.button}>
        <Text style={styles.buttonText}>Test User Endpoints</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleTestApiBase} style={styles.button}>
        <Text style={styles.buttonText}>Test API Base</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleTestAuthEndpoints} style={styles.button}>
        <Text style={styles.buttonText}>Test Auth Endpoints</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleCheckLogoutFlag} style={styles.button}>
        <Text style={styles.buttonText}>Check Logout Flag</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleClearLogoutFlag} style={styles.button}>
        <Text style={styles.buttonText}>Clear Logout Flag</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    marginBottom: 5,
    padding: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  container: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 8,
    minWidth: 200,
    padding: 10,
    position: 'absolute',
    right: 10,
    top: 100,
    zIndex: 1000,
  },
  info: {
    color: 'yellow',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
});