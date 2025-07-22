import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { navigationRef } from '@/navigation/paths';
import { useTheme } from '@/theme';

import { SafeScreen } from '@/components/templates';

import { clearAllAuthData, logStoredAuthData } from '@/utils/clearAuthData';
import { forceLogout, resetApp } from '@/utils/resetApp';

export default function Settings() {
  const { colors } = useTheme();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { style: 'cancel', text: 'Cancel' },
        { onPress: logout, style: 'destructive', text: 'Logout' },
      ]
    );
  };

  // Debug function to test share functionality
  const testShareFunction = () => {
    console.log('📤 Testing share functionality...');
    
    // Simulate receiving a YouTube URL
    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    
    if (navigationRef.isReady()) {
      navigationRef.navigate('Add' as any, { sharedUrl: testUrl });
      console.log('📤 Navigated to Add screen with test URL');
    } else {
      console.log('📤 Navigation not ready for test');
    }
  };

  // Debug function to clear all auth data
  const handleClearAuthData = async () => {
    Alert.alert(
      'Clear Auth Data',
      'This will clear all stored authentication data and reset the app. Are you sure?',
      [
        { style: 'cancel', text: 'Cancel' },
        { 
          onPress: async () => {
            const success = await clearAllAuthData();
            if (success) {
              Alert.alert('Success', 'All authentication data cleared. Please restart the app.');
            } else {
              Alert.alert('Error', 'Failed to clear authentication data.');
            }
          }, 
          style: 'destructive', 
          text: 'Clear All'
        },
      ]
    );
  };

  // Debug function to log stored auth data
  const handleLogAuthData = async () => {
    await logStoredAuthData();
    Alert.alert('Debug Info', 'Check the console for stored authentication data.');
  };

  // Force logout function
  const handleForceLogout = async () => {
    Alert.alert(
      'Force Logout',
      'This will clear all authentication data and force you to log in again. Are you sure?',
      [
        { style: 'cancel', text: 'Cancel' },
        { 
          onPress: async () => {
            const success = await forceLogout();
            if (success) {
              Alert.alert('Success', 'Force logout complete. Please restart the app.');
            } else {
              Alert.alert('Error', 'Failed to force logout.');
            }
          }, 
          style: 'destructive', 
          text: 'Force Logout'
        },
      ]
    );
  };

  // Reset app function
  const handleResetApp = async () => {
    Alert.alert(
      'Reset App',
      'This will clear ALL app data and reset everything. Are you absolutely sure?',
      [
        { style: 'cancel', text: 'Cancel' },
        { 
          onPress: async () => {
            const success = await resetApp();
            if (success) {
              Alert.alert('Success', 'App reset complete. Please restart the app completely.');
            } else {
              Alert.alert('Error', 'Failed to reset app.');
            }
          }, 
          style: 'destructive', 
          text: 'Reset Everything'
        },
      ]
    );
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Settings</Text>
        
        <TouchableOpacity
          onPress={testShareFunction}
          style={[styles.button, { backgroundColor: colors.accent.primary }]}
        >
          <Text style={[styles.buttonText, { color: colors.background.primary }]}>
            Test Share Function
          </Text>
        </TouchableOpacity>

        {/* Debug Section */}
        <View style={styles.debugSection}>
          <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>Debug Tools</Text>
          
          <TouchableOpacity
            onPress={handleLogAuthData}
            style={[styles.button, { backgroundColor: '#f59e0b' }]}
          >
            <Text style={[styles.buttonText, { color: '#ffffff' }]}>
              Log Auth Data
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleClearAuthData}
            style={[styles.button, { backgroundColor: '#ef4444' }]}
          >
            <Text style={[styles.buttonText, { color: '#ffffff' }]}>
              Clear All Auth Data
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleForceLogout}
            style={[styles.button, { backgroundColor: '#dc2626' }]}
          >
            <Text style={[styles.buttonText, { color: '#ffffff' }]}>
              Force Logout
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleResetApp}
            style={[styles.button, { backgroundColor: '#991b1b' }]}
          >
            <Text style={[styles.buttonText, { color: '#ffffff' }]}>
              Reset App (Nuclear)
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.button, styles.logoutButton]}
        >
          <Text style={[styles.buttonText, { color: '#ff4444' }]}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    padding: 15,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    gap: 20,
    padding: 20,
  },
  debugSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    gap: 10,
    marginTop: 20,
    padding: 15,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderColor: '#ff4444',
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});