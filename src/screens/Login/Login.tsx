import type { User } from '@/hooks/domain/user/schema';
import type { RootStackParamList } from '@/navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/theme';

import { AssetByVariant } from '@/components/atoms';
import { IconByVariant } from '@/components/atoms';
import { SafeScreen } from '@/components/templates';
import { Button, Container, Input, Text } from '@/components/ui';

import { authApiService } from '@/services/auth-api.service';
import { signInWithGoogle } from '@/services/auth/googleAuth';
import { storageService } from '@/services/storage';
import { safeErrorLog } from '@/utils/errorHandler';

type LoginScreenNavigationProperty = NativeStackNavigationProp<RootStackParamList>;

export function Login() {
  const { t } = useTranslation();
  const navigation = useNavigation<LoginScreenNavigationProperty>();
  const { login } = useAuth();
  const { colors, layout } = useTheme();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [authTransition, setAuthTransition] = React.useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      await login({ password, username: email });
    } catch (error) {
      safeErrorLog('Login failed', error);
      Alert.alert('Login Failed', 'Please check your credentials and try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      console.log('🔵 Starting Google Sign-In process...');
      setIsGoogleLoading(true);
      setAuthTransition(true);
      
      // Add a small delay to ensure the loading state is visible
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('🔵 Calling signInWithGoogle...');
      const googleResult = await signInWithGoogle();
      console.log('🔵 Google Sign-In successful, result:', { 
        email: googleResult.email, 
        hasToken: !!googleResult.token 
      });
      
      console.log('🔵 Calling backend Google Sign-In API...');
      const authResult = await authApiService.googleSignIn(googleResult.token);
      console.log('🔵 Backend API successful, storing tokens...');

      await storageService.storeTokens({
        access_token: authResult.access_token,
        access_token_expires_in: authResult.access_token_expires_in,
        is_revoked: authResult.is_revoked,
        refresh_token: authResult.refresh_token,
        refresh_token_expires_in: authResult.refresh_token_expires_in,
        token_type: authResult.token_type,
      });
      console.log('🔵 Tokens stored successfully');

      const user: User = {
        avatar: authResult.user.avatar || null,
        created_at: authResult.user.created_at,
        email: authResult.user.email,
        full_name: authResult.user.full_name,
        id: Number.parseInt(authResult.user.id.toString()),
        is_active: authResult.user.is_active,
        is_verified: authResult.user.is_verified,
      };

      // Update auth store
      useAuthStore.setState({
        error: null,
        initialized: true,
        isAuthenticated: true,
        isLoading: false,
        user,
      });
      console.log('🔵 Auth store updated successfully');

      // Keep the loading state for a smooth transition
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('🔵 Google Sign-In process completed successfully');
      
    } catch (error) {
      safeErrorLog('🔴 Google Sign-In failed at step', error);
      
      Alert.alert('Google Sign-In Failed', `Please try again. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setAuthTransition(false);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Render loading overlay during auth transition
  if (authTransition) {
    return (
      <SafeScreen>
        <View style={[styles.loadingOverlay, { backgroundColor: colors.background.primary }]}>
          <View style={styles.loadingContent}>
            <ActivityIndicator 
              color={colors.accent.primary} 
              size="large"
              style={styles.loadingSpinner}
            />
            <Text style={[styles.loadingText, { color: colors.text.primary }]}>
              Signing you in...
            </Text>
          </View>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={[styles.container, { backgroundColor: colors.background.primary }]}
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={[styles.logoWrapper, { backgroundColor: colors.accent.primary }]}>
              <AssetByVariant path="tom" resizeMode="contain" style={styles.logo} />
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Welcome back!
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Sign in to continue
          </Text>

          {/* Connection Status */}
          <View style={[styles.statusBar, { backgroundColor: colors.success + '15' }]}>
            <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.statusText, { color: colors.success }]}>
              Connected to https://api.linklibrary.ai/api/v1
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Email</Text>
              <View style={styles.inputContainer}>
                <IconByVariant color={colors.text.tertiary} name="mail" size={20} style={styles.inputIcon} />
                <Input
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="Enter your e-mail"
                  placeholderTextColor={colors.text.tertiary}
                  style={[styles.textInput, { 
                    backgroundColor: colors.background.secondary,
                    borderColor: colors.border.primary,
                    color: colors.text.primary
                  }]}
                  value={email}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Password</Text>
              <View style={styles.inputContainer}>
                <IconByVariant color={colors.text.tertiary} name="lock" size={20} style={styles.inputIcon} />
                <Input
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.text.tertiary}
                  secureTextEntry={!showPassword}
                  style={[styles.textInput, { 
                    backgroundColor: colors.background.secondary,
                    borderColor: colors.border.primary,
                    color: colors.text.primary
                  }]}
                  value={password}
                />
                <TouchableOpacity 
                  onPress={() => { setShowPassword(!showPassword); }}
                  style={styles.eyeIcon}
                >
                  <IconByVariant color={colors.text.tertiary} name="eye" size={20} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={styles.optionsRow}>
              <TouchableOpacity 
                onPress={() => { setRememberMe(!rememberMe); }}
                style={styles.checkboxRow}
              >
                <View style={[
                  styles.checkbox,
                  { borderColor: colors.border.primary },
                  rememberMe && { backgroundColor: colors.accent.primary, borderColor: colors.accent.primary }
                ]}>
                  {rememberMe ? <IconByVariant color={colors.text.inverse} name="check" size={12} /> : null}
                </View>
                <Text style={[styles.checkboxLabel, { color: colors.text.primary }]}>
                  Remember me
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity>
                <Text style={[styles.forgotLink, { color: colors.accent.primary }]}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              disabled={isLoading}
              onPress={handleLogin}
              style={[
                styles.signInButton,
                { backgroundColor: colors.accent.primary },
                isLoading && { opacity: 0.7 }
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.text.inverse} size="small" />
              ) : (
                <Text style={[styles.signInButtonText, { color: colors.text.inverse }]}>
                  Sign in
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border.primary }]} />
              <Text style={[styles.dividerText, { color: colors.text.secondary }]}>Or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border.primary }]} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialButtons}>
              <TouchableOpacity
                disabled={isGoogleLoading}
                onPress={handleGoogleSignIn}
                style={[styles.socialButton, { 
                  backgroundColor: colors.background.secondary,
                  borderColor: colors.border.primary
                }]}
              >
                {isGoogleLoading ? (
                  <ActivityIndicator color="#4285F4" size="small" />
                ) : (
                  <>
                    <IconByVariant name="google" size={20} />
                    <Text style={[styles.socialButtonText, { color: colors.text.primary }]}>
                      Sign in
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialButton, { 
                  backgroundColor: colors.background.secondary,
                  borderColor: colors.border.primary
                }]}
              >
                <IconByVariant color={colors.text.primary} name="apple" size={20} />
                <Text style={[styles.socialButtonText, { color: colors.text.primary }]}>
                  Sign in
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View style={styles.signUpRow}>
              <Text style={[styles.signUpText, { color: colors.text.secondary }]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => { navigation.navigate('SignUp'); }}>
                <Text style={[styles.signUpLink, { color: colors.accent.primary }]}>
                  Sign up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    marginRight: 8,
    width: 20,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkboxRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  container: {
    flex: 1,
  },
  content: {
    alignSelf: 'center',
    maxWidth: 400,
    width: '100%',
  },
  divider: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
    zIndex: 1,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  forgotLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    position: 'relative',
  },
  inputIcon: {
    left: 16,
    position: 'absolute',
    top: 14,
    zIndex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingOverlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  logo: {
    height: 32,
    width: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrapper: {
    alignItems: 'center',
    borderRadius: 16,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  optionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  signInButton: {
    alignItems: 'center',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    marginBottom: 20,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  signUpRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  signUpText: {
    fontSize: 14,
  },
  socialButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    height: 48,
    justifyContent: 'center',
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusBar: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statusDot: {
    borderRadius: 4,
    height: 8,
    marginRight: 8,
    width: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    height: 48,
    paddingLeft: 48,
    paddingRight: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
});