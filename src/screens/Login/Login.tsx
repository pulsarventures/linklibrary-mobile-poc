import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Button, Container, Input, Text, StatusIndicator } from '@/components/ui';
import type { RootScreenProps } from '@/navigation/types';
import { Paths } from '@/navigation/paths';
import { IconByVariant } from '@/components/atoms';
import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { PRIMARY_COLORS } from '@/theme/styles/colors';
import { SPACING } from '@/theme/styles/spacing';

function Login({ navigation }: RootScreenProps<Paths.Login>) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await login(credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <View style={styles.header}>
        <Text variant="title" weight="bold">Welcome Back</Text>
        <Text variant="subtitle">Sign in to continue</Text>
      </View>

      {error && (
        <StatusIndicator type="error" message={error} style={styles.error} />
      )}

      <Input
        label="Email"
        value={credentials.username}
        onChangeText={(text) => setCredentials({ ...credentials, username: text })}
        icon={<IconByVariant name="mail" color={PRIMARY_COLORS.text.muted} />}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <Input
          label="Password"
          value={credentials.password}
          onChangeText={(text) => setCredentials({ ...credentials, password: text })}
          icon={<IconByVariant name="lock" color={PRIMARY_COLORS.text.muted} />}
          placeholder="Enter your password"
          secureTextEntry={!showPassword}
        />
        <Pressable 
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <IconByVariant name="eye" color={PRIMARY_COLORS.text.muted} />
        </Pressable>
      </View>

      <Button
        onPress={handleLogin}
        loading={loading}
        disabled={!credentials.username || !credentials.password}
      >
        Sign In
      </Button>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text variant="caption" style={styles.dividerText}>or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialButtons}>
        <Button
          variant="social"
          onPress={() => {}}
          style={styles.googleButton}
          icon={<IconByVariant name="google" size={20} />}
        >
          Google
        </Button>
        <Button
          variant="apple"
          onPress={() => {}}
          style={styles.appleButton}
          icon={<IconByVariant name="apple" size={20} color="#FFFFFF" />}
        >
          Apple
        </Button>
      </View>

      <View style={styles.footer}>
        <Text variant="body">Don't have an account?</Text>
        <Pressable onPress={() => navigation.navigate(Paths.SignUp)}>
          <Text variant="body" color={PRIMARY_COLORS.primary}>Sign Up</Text>
        </Pressable>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  error: {
    marginBottom: SPACING.md,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: SPACING.md,
    top: 38, // Adjust based on your layout
    zIndex: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: PRIMARY_COLORS.border,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    color: PRIMARY_COLORS.text.secondary,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  googleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  appleButton: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xl,
  },
});

export default Login;