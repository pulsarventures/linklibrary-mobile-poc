import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { useTheme } from '@/theme';

import { SafeScreen } from '@/components/templates';

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

  return (
    <SafeScreen>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Settings</Text>
        
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
  logoutButton: {
    backgroundColor: 'transparent',
    borderColor: '#ff4444',
    borderWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});