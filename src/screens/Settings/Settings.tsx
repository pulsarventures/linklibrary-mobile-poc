import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeScreen } from '@/components/templates';
import { useTheme } from '@/theme';
import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { navigationRef } from '@/navigation/paths';

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
});