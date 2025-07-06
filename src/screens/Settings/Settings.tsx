import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeScreen } from '@/components/templates';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider/ThemeProvider';
import { SPACING } from '@/theme/styles/spacing';
import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { IconByVariant } from '@/components/atoms';

export default function Settings() {
  const { user, logout } = useAuthStore();
  const { colors, theme, setTheme } = useTheme();

  const themeOptions = [
    { id: 'light', label: 'Light', icon: 'sun' },
    { id: 'dark', label: 'Dark', icon: 'moon' },
    { id: 'system', label: 'System', icon: 'device' },
  ] as const;

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout failed:', error);
            }
          }
        },
      ]
    );
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        {/* Profile Section */}
        <View style={[styles.profileSection, { borderBottomColor: colors.border.primary }]}>
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image 
                source={{ uri: user.avatar }} 
                style={styles.avatar} 
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.border.primary }]}>
                <IconByVariant 
                  name="user" 
                  size={40} 
                  color={colors.text.secondary} 
                />
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text 
              variant="title" 
              weight="bold" 
              style={[styles.name, { color: colors.text.primary }]}
            >
              {user?.full_name || 'BalajiRedisariy'}
            </Text>
            <Text 
              variant="body"
              style={[styles.email, { color: colors.text.secondary }]}
            >
              {user?.email || 'balaji@example.com'}
            </Text>
          </View>
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text 
            variant="subtitle" 
            weight="medium"
            style={[styles.sectionTitle, { color: colors.text.primary }]}
          >
            Appearance
          </Text>
          <View style={styles.themeSelector}>
            {themeOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.themeOption,
                  { 
                    backgroundColor: colors.background.secondary,
                    borderColor: theme === option.id ? colors.accent.primary : colors.border.primary 
                  }
                ]}
                onPress={() => setTheme(option.id)}
                activeOpacity={0.7}
              >
                <View style={styles.themeOptionContent}>
                  <IconByVariant
                    name={option.icon}
                    size={24}
                    color={theme === option.id ? colors.accent.primary : colors.text.primary}
                  />
                  <Text
                    style={[
                      styles.themeOptionText,
                      { 
                        color: theme === option.id ? colors.accent.primary : colors.text.primary 
                    }
                    ]}
                  >
                    {option.label}
                  </Text>
                </View>
                {theme === option.id && (
                  <View style={[styles.checkmark, { backgroundColor: colors.accent.primary }]}>
                    <IconByVariant name="check" size={12} color={colors.text.inverse} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text 
            variant="subtitle" 
            weight="medium"
            style={[styles.sectionTitle, { color: colors.text.primary }]}
          >
            Account
          </Text>
          <View style={styles.buttonContainer}>
            <Button
              variant="danger"
              onPress={handleLogout}
              style={styles.signOutButton}
            >
              Sign Out
            </Button>
          </View>
        </View>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    marginBottom: SPACING.xl,
  },
  avatarContainer: {
    marginRight: SPACING.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  email: {
    fontSize: 16,
    opacity: 0.8,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: SPACING.lg,
  },
  themeSelector: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  themeOption: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    position: 'relative',
    aspectRatio: 1,
    padding: SPACING.sm,
  },
  themeOptionContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  signOutButton: {
    width: '80%',
    height: 48,
    borderRadius: 12,
    marginBottom: 0,
  },
});