import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { Button, Container, Input, Text, StatusIndicator } from '@/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { IconByVariant } from '@/components/atoms';
import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { signInWithGoogle } from '@/services/auth/googleAuth';
import { useTheme } from '@/theme/ThemeProvider/ThemeProvider';
import { SPACING } from '@/theme/styles/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

function Login({ navigation }: Props) {
  const { colors } = useTheme();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, socialAuth } = useAuthStore();

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

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      
      const googleUser = await signInWithGoogle();
      await socialAuth({
        provider: 'google',
        token: googleUser.token,
        email: googleUser.email,
        name: googleUser.name,
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'Sign in cancelled') {
        // User cancelled the sign-in, don't show error
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
      Alert.alert('Sign In Failed', 'Could not sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <View style={styles.header}>
        <Text variant="title" weight="bold" style={{ color: colors.text.primary }}>Welcome Back</Text>
        <Text variant="subtitle" style={{ color: colors.text.secondary }}>Sign in to continue</Text>
      </View>

      {error && (
        <StatusIndicator type="error" message={error} style={styles.error} />
      )}

      <Input
        label="Email"
        value={credentials.username}
        onChangeText={(text) => setCredentials({ ...credentials, username: text })}
        icon={<IconByVariant name="mail" color={colors.text.tertiary} />}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <Input
          label="Password"
          value={credentials.password}
          onChangeText={(text) => setCredentials({ ...credentials, password: text })}
          icon={<IconByVariant name="lock" color={colors.text.tertiary} />}
          placeholder="Enter your password"
          secureTextEntry={!showPassword}
        />
        <Pressable 
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <IconByVariant name="eye" color={colors.text.tertiary} />
        </Pressable>
      </View>

      <Button
        onPress={handleLogin}
        loading={loading}
        disabled={!credentials.username || !credentials.password}
        style={styles.signInButton}
      >
        Sign In
      </Button>

      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border.primary }]} />
        <Text variant="caption" style={[styles.dividerText, { color: colors.text.secondary }]}>
          or continue with
        </Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.border.primary }]} />
      </View>

      <View style={styles.socialButtons}>
        <Button
          variant="social"
          onPress={handleGoogleSignIn}
          style={[styles.googleButton, { borderColor: colors.border.primary }]}
          icon={<IconByVariant name="google" size={20} />}
          disabled={loading}
        >
          Google
        </Button>
        <Button
          variant="social"
          onPress={() => {}}
          style={styles.appleButton}
          icon={<IconByVariant name="apple" size={20} />}
          disabled={loading}
        >
          Apple
        </Button>
      </View>

      <View style={styles.footer}>
        <Text variant="body" style={{ color: colors.text.primary }}>Don't have an account?</Text>
        <Pressable onPress={() => navigation.navigate('SignUp')}>
          <Text variant="body" style={{ color: colors.accent.primary }}>Sign Up</Text>
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
    marginBottom: SPACING.xl,
  },
  signInButton: {
    marginTop: SPACING.md,
  },
  eyeIcon: {
    position: 'absolute',
    right: SPACING.md,
    top: 38,
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
  },
  dividerText: {
    marginHorizontal: SPACING.md,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  googleButton: {
    flex: 1,
    justifyContent: 'center',
    borderWidth: 1,
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