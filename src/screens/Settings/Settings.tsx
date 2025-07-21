import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeScreen } from '@/components/templates';
import { useTheme } from '@/theme';
import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { navigationRef } from '@/navigation/paths';
import { clearAllAuthData, logStoredAuthData } from '@/utils/clearAuthData';
import { resetApp, forceLogout } from '@/utils/resetApp';

export default function Settings() {
  const { colors } = useTheme();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
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
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive', 
          onPress: async () => {
            const success = await clearAllAuthData();
            if (success) {
              Alert.alert('Success', 'All authentication data cleared. Please restart the app.');
            } else {
              Alert.alert('Error', 'Failed to clear authentication data.');
            }
          }
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
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Force Logout', 
          style: 'destructive', 
          onPress: async () => {
            const success = await forceLogout();
            if (success) {
              Alert.alert('Success', 'Force logout complete. Please restart the app.');
            } else {
              Alert.alert('Error', 'Failed to force logout.');
            }
          }
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
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset Everything', 
          style: 'destructive', 
          onPress: async () => {
            const success = await resetApp();
            if (success) {
              Alert.alert('Success', 'App reset complete. Please restart the app completely.');
            } else {
              Alert.alert('Error', 'Failed to reset app.');
            }
          }
        },
      ]
    );
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Settings</Text>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent.primary }]}
          onPress={testShareFunction}
        >
          <Text style={[styles.buttonText, { color: colors.background.primary }]}>
            Test Share Function
          </Text>
        </TouchableOpacity>

        {/* Debug Section */}
        <View style={styles.debugSection}>
          <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>Debug Tools</Text>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#f59e0b' }]}
            onPress={handleLogAuthData}
          >
            <Text style={[styles.buttonText, { color: '#ffffff' }]}>
              Log Auth Data
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#ef4444' }]}
            onPress={handleClearAuthData}
          >
            <Text style={[styles.buttonText, { color: '#ffffff' }]}>
              Clear All Auth Data
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#dc2626' }]}
            onPress={handleForceLogout}
          >
            <Text style={[styles.buttonText, { color: '#ffffff' }]}>
              Force Logout
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#991b1b' }]}
            onPress={handleResetApp}
          >
            <Text style={[styles.buttonText, { color: '#ffffff' }]}>
              Reset App (Nuclear)
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
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
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  debugSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});