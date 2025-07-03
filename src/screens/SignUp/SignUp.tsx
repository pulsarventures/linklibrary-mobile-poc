import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Button, Container, Input, Text, StatusIndicator } from '@/components/ui';
import type { RootScreenProps } from '@/navigation/types';
import { Paths } from '@/navigation/paths';
import { IconByVariant } from '@/components/atoms';
import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { PRIMARY_COLORS } from '@/theme/styles/colors';
import { SPACING } from '@/theme/styles/spacing';

function SignUp({ navigation }: RootScreenProps<Paths.SignUp>) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { register } = useAuthStore();

  const handleSignUp = async () => {
    try {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (!termsAccepted) {
        setError('Please accept the Terms of Service and Privacy Policy');
        return;
      }
      setLoading(true);
      setError('');
      await register(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container variant="screen" keyboardAvoiding scrollable>
    
      <View style={styles.header}>
        <Text variant="title" weight="bold">
          Create your account
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={formData.full_name}
          onChangeText={(text) => setFormData({ ...formData, full_name: text })}
          icon={<IconByVariant name="user" size={18} color={PRIMARY_COLORS.text.secondary} />}
          autoCapitalize="words"
          autoComplete="name"
        />

        <Input
          label="Email Address"
          placeholder="Enter your email address"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          icon={<IconByVariant name="mail" size={18} color={PRIMARY_COLORS.text.secondary} />}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          containerStyle={styles.input}
        />

        <Input
          label="Password"
          placeholder="Create a strong password"
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          icon={<IconByVariant name="lock" size={18} color={PRIMARY_COLORS.text.secondary} />}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password-new"
          containerStyle={styles.input}
        />

        <Input
          label="Confirm Password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
          icon={<IconByVariant name="lock" size={18} color={PRIMARY_COLORS.text.secondary} />}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password-new"
          containerStyle={styles.input}
        />

        <View style={styles.termsContainer}>
          <Pressable 
            style={styles.checkbox}
            onPress={() => setTermsAccepted(!termsAccepted)}
          >
            {termsAccepted && (
              <View style={styles.checkboxInner} />
            )}
          </Pressable>
          <Text variant="caption" color={PRIMARY_COLORS.text.secondary}>
            I agree to the{' '}
            <Text variant="caption" weight="semibold" color={PRIMARY_COLORS.primary}>
              Terms of Service
            </Text>
            {' '}and{' '}
            <Text variant="caption" weight="semibold" color={PRIMARY_COLORS.primary}>
              Privacy Policy
            </Text>
          </Text>
        </View>

        {error && (
          <StatusIndicator
            type="error"
            message={error}
            style={styles.error}
          />
        )}

        <Button
          onPress={handleSignUp}
          loading={loading}
          disabled={!formData.full_name || !formData.email || !formData.password || !formData.confirmPassword}
        >
          Create account
        </Button>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text variant="caption" color={PRIMARY_COLORS.text.secondary} style={styles.dividerText}>
            Or sign up with
          </Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialButtons}>
          <Button
            variant="social"
            onPress={() => {}}
            icon={<IconByVariant name="google" size={20} />}
          >
            Google
          </Button>
          <Button
            variant="social"
            onPress={() => {}}
            icon={<IconByVariant name="apple" size={20} />}
          >
            Apple
          </Button>
        </View>

        <View style={styles.footer}>
          <Text variant="body" color={PRIMARY_COLORS.text.secondary}>
            Already have an account?{' '}
          </Text>
          <Pressable onPress={() => navigation.navigate(Paths.Login)}>
            <Text variant="body" weight="semibold" color={PRIMARY_COLORS.primary}>
              Sign in
            </Text>
          </Pressable>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  status: {
    marginBottom: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  form: {
    width: '100%',
  },
  input: {
    marginTop: SPACING.md,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: PRIMARY_COLORS.border,
    marginRight: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: PRIMARY_COLORS.primary,
  },
  error: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
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
  },
  socialButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  socialButton: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
});

export default SignUp; 