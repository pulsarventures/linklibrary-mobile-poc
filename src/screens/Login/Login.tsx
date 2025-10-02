import type { User } from '@/hooks/domain/user/schema';
import type { RootStackParamList } from '@/navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApiService } from '@/services/auth-api.service';
import { signInWithGoogle } from '@/services/auth/googleAuth';
import { signInWithApple } from '@/services/auth/appleAuth';
import { storageService } from '@/services/storage';
import { safeErrorLog } from '@/utils/errorHandler';
import { handleLoginError, type LoginError } from '@/utils/loginErrorHandler';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Image } from 'react-native';

import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/theme';

import { IconByVariant } from '@/components/atoms';
import { SafeScreen } from '@/components/templates';
import { Button, Container, Input, Text } from '@/components/ui';

type LoginScreenNavigationProperty = NativeStackNavigationProp<RootStackParamList>;

export function Login() {
  const { t } = useTranslation();
  const navigation = useNavigation<LoginScreenNavigationProperty>();
  const { login } = useAuth();
  const { socialAuth } = useAuthStore();
  const { colors, layout } = useTheme();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [isAppleLoading, setIsAppleLoading] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [authTransition, setAuthTransition] = React.useState(false);
  const [loginError, setLoginError] = React.useState<LoginError | null>(null);
  const [googleError, setGoogleError] = React.useState<LoginError | null>(null);
  const [appleError, setAppleError] = React.useState<LoginError | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      const validationError: LoginError = {
        message: 'Please fill in all fields',
        type: 'validation',
      };
      setLoginError(validationError);
      return;
    }

    // Clear any previous errors when user tries again
    setLoginError(null);
    setGoogleError(null);
    setAppleError(null);

    try {
      setIsLoading(true);
      
      // CRITICAL: Clear logout flag BEFORE login to ensure tokens can be stored
      await AsyncStorage.removeItem('@has_logged_out');
      // Cleared logout flag before login attempt
      
      // Attempting login
      await login({ password, username: email });
      // Login successful - no toast needed
    } catch (error: any) {
      safeErrorLog('Login failed', error);
      console.error('Login error:', error instanceof Error ? error.message : 'Unknown error');
      const parsedError = handleLoginError(error);
      setLoginError(parsedError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Starting Google Sign-In process
      setIsGoogleLoading(true);
      setGoogleError(null);
      setAuthTransition(true);
      
      // CRITICAL: Clear logout flag BEFORE Google sign-in
      await AsyncStorage.removeItem('@has_logged_out');
      // Cleared logout flag before Google sign-in
      
      // Add a small delay to ensure the loading state is visible
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Calling signInWithGoogle
      const googleResult = await signInWithGoogle();
      // Google Sign-In successful
      
      // Calling auth store socialAuth
      await socialAuth({
        email: googleResult.email,
        name: googleResult.name,
        provider: 'google',
        token: googleResult.token,
      });
      // Auth store socialAuth completed successfully

      // Keep the loading state for a smooth transition
      await new Promise(resolve => setTimeout(resolve, 500));
      // Google Sign-In process completed successfully

    } catch (error) {
      console.error('Google Sign-In failed:', error instanceof Error ? error.message : 'Unknown error');
      
      const parsedError = handleLoginError(error);
      setGoogleError(parsedError);
      setAuthTransition(false);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      // Starting Apple Sign-In process
      setIsAppleLoading(true);
      setAppleError(null);
      setAuthTransition(true);
      
      // CRITICAL: Clear logout flag BEFORE Apple sign-in
      await AsyncStorage.removeItem('@has_logged_out');
      // Cleared logout flag before Apple sign-in
      
      // Add a small delay to ensure the loading state is visible
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Calling signInWithApple
      const appleResult = await signInWithApple();
      // Apple Sign-In successful
      
      // Calling backend Apple Sign-In API directly
      
      // Parse the full name into firstName and lastName
      let nameObject = null;
      if (appleResult.fullName) {
        const nameParts = appleResult.fullName.trim().split(' ');
        nameObject = {
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
        };
      }
      
      const authResult = await authApiService.appleSignIn(
        appleResult.identityToken,
        appleResult.authorizationCode,
        appleResult.email,
        nameObject
      );
      // Backend API successful, storing tokens

      // Calculate expires_at from expires_in if not provided  
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      await storageService.storeTokens({
        access_token: authResult.access_token,
        access_token_expires_at: authResult.access_token_expires_at || (now + authResult.access_token_expires_in),
        access_token_expires_in: authResult.access_token_expires_in,
        is_revoked: authResult.is_revoked,
        refresh_token: authResult.refresh_token,
        refresh_token_expires_at: authResult.refresh_token_expires_at || (now + authResult.refresh_token_expires_in),
        refresh_token_expires_in: authResult.refresh_token_expires_in,
        token_type: authResult.token_type,
      });
      
      if (authResult.user) {
        const user: User = {
          avatar: authResult.user.avatar || null,
          created_at: authResult.user.created_at,
          email: authResult.user.email,
          full_name: authResult.user.full_name,
          id: Number.parseInt(authResult.user.id.toString()),
          is_active: authResult.user.is_active,
          is_verified: authResult.user.is_verified,
        };

        // Update auth store directly
        useAuthStore.setState({
          error: null,
          initialized: true,
          isAuthenticated: true,
          isLoading: false,
          user,
        });
      } else {
        throw new Error('Apple authentication failed: No user data received');
      }
      // Auth store socialAuth completed successfully

      // Keep the loading state for a smooth transition
      await new Promise(resolve => setTimeout(resolve, 500));
      // Apple Sign-In process completed successfully

    } catch (error) {
      console.error('Apple Sign-In failed:', error instanceof Error ? error.message : 'Unknown error');
      
      const parsedError = handleLoginError(error);
      setAppleError(parsedError);
      setAuthTransition(false);
    } finally {
      setIsAppleLoading(false);
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
                          <Image 
                resizeMode="cover" 
                source={require('@/theme/assets/images/app.png')} 
                style={[styles.logo, { borderRadius: 8, overflow: 'hidden' }]} 
              />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Welcome back!
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Sign in to continue
          </Text>

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
                  onChangeText={(text) => {
                    setEmail(text);
                    // Clear error when user starts typing
                    if (loginError?.type === 'validation') {
                      setLoginError(null);
                    }
                  }}
                  placeholder="Enter your e-mail"
                  placeholderTextColor={colors.text.tertiary}
                  style={[styles.textInput, { 
                    backgroundColor: colors.background.secondary,
                    borderColor: loginError?.type === 'validation' && !email ? colors.error : colors.border.primary,
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
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={(text) => {
                    setPassword(text);
                    // Clear error when user starts typing
                    if (loginError?.type === 'validation') {
                      setLoginError(null);
                    }
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.text.tertiary}
                  secureTextEntry={!showPassword}
                  style={[styles.textInput, {
                    backgroundColor: colors.background.secondary,
                    borderColor: loginError?.type === 'validation' && !password ? colors.error : colors.border.primary,
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

            {/* Login Error Message - Subtle feedback */}
            {loginError && (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {loginError.message}
                </Text>
                <TouchableOpacity 
                  onPress={() => setLoginError(null)}
                  style={styles.dismissButton}
                >
                  <Text style={[styles.dismissText, { color: colors.text.secondary }]}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Sign In Button */}
            <Button
              disabled={isLoading}
              onPress={handleLogin}
              variant="primary"
              loading={isLoading}
              style={styles.signInButton}
            >
              Sign in
            </Button>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border.primary }]} />
              <Text style={[styles.dividerText, { color: colors.text.secondary }]}>Or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border.primary }]} />
            </View>

            {/* Social Buttons */}
            <TouchableOpacity
              disabled={isGoogleLoading}
              onPress={handleGoogleSignIn}
              style={[styles.socialButton, { 
                backgroundColor: colors.background.secondary,
                borderColor: colors.border.primary,
                marginBottom: 12
              }]}
            >
              {isGoogleLoading ? (
                <ActivityIndicator color="#4285F4" size="small" />
              ) : (
                <>
                  <IconByVariant name="google" size={20} />
                  <Text style={[styles.socialButtonText, { color: colors.text.primary }]}>
                    Sign in with Google
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Google Error Message - Removed for clean UI */}

            <TouchableOpacity
              disabled={isAppleLoading}
              onPress={handleAppleSignIn}
              style={[styles.socialButton, { 
                backgroundColor: '#000000',
                borderColor: colors.border.primary
              }]}
            >
              {isAppleLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <IconByVariant name="apple" size={20} color="#FFFFFF" />
                  <Text style={[styles.socialButtonText, { color: '#FFFFFF' }]}>
                    Sign in with Apple
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Apple Error Message - Removed for clean UI */}

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
    marginBottom: 10,
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
    marginBottom: 6,
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
    height: 80,
    width: 80,
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
    marginBottom: 10,
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
    marginBottom: 10,
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
    flexDirection: 'row',
    gap: 8,
    height: 48,
    justifyContent: 'center',
    marginBottom: 10,
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
    fontSize: 13,
    marginBottom: 12,
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    marginTop: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  dismissButton: {
    marginLeft: 8,
    padding: 4,
  },
  dismissText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorMessage: {
    marginBottom: 12,
    marginTop: 8,
  },
  socialErrorMessage: {
    marginBottom: 8,
    marginTop: 4,
  },
});