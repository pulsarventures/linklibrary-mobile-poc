import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { useTheme } from '@/theme';
import { IconByVariant } from '@/components/atoms';
import { ApiDebugUtils } from '@/utils/apiDebug';

import { SafeScreen } from '@/components/templates';

export default function Settings() {
  const { colors, isDark, toggleTheme } = useTheme();
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
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Settings</Text>
        
        {/* Theme Toggle */}
        <View style={[styles.settingItem, { borderBottomColor: colors.border.primary }]}>
          <View style={styles.settingContent}>
            <IconByVariant 
              name={isDark ? "moon" : "sun"} 
              size={24} 
              color={colors.text.primary}
              style={styles.settingIcon}
            />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.text.primary }]}>
                Theme
              </Text>
              <Text style={[styles.settingDescription, { color: colors.text.secondary }]}>
                {isDark ? 'Dark mode' : 'Light mode'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={toggleTheme}
            style={[
              styles.toggleButton,
              { 
                backgroundColor: isDark ? colors.accent.primary : colors.background.secondary,
                borderColor: colors.border.primary 
              }
            ]}
          >
            <View style={[
              styles.toggleIndicator,
              {
                backgroundColor: isDark ? colors.background.primary : colors.accent.primary,
                transform: [{ translateX: isDark ? 20 : 0 }]
              }
            ]} />
          </TouchableOpacity>
        </View>

        {/* Debug Test Button */}
        <TouchableOpacity
          onPress={() => ApiDebugUtils.testSharedUrlStore()}
          style={[styles.button, { backgroundColor: colors.accent.primary }]}
        >
          <Text style={[styles.buttonText, { color: '#ffffff' }]}>
            Test Share Functionality
          </Text>
        </TouchableOpacity>

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
    marginTop: 'auto',
  },
  settingContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  settingDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingItem: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  toggleButton: {
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    position: 'relative',
    width: 52,
  },
  toggleIndicator: {
    borderRadius: 14,
    height: 28,
    position: 'absolute',
    width: 28,
  },
});