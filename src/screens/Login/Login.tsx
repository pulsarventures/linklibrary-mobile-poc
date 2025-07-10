import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { Button, Container, Input, Text } from '@/components/ui';
import { SafeScreen } from '@/components/templates';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { signInWithGoogle } from '@/services/auth/googleAuth';
import { authApiService } from '@/services/auth-api.service';
import type { User } from '@/hooks/domain/user/schema';
import { storageService } from '@/services/storage';
import { AssetByVariant } from '@/components/atoms';
import { IconByVariant } from '@/components/atoms';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function Login() {
  const { t } = useTranslation();
  const navigation = useNavigation<LoginScreenNavigationProp>();
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
      await login({ username: email, password });
    } catch (error) {
      console.error('Login failed:', error);
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
        hasToken: !!googleResult.token, 
        email: googleResult.email 
      });
      
      console.log('🔵 Calling backend Google Sign-In API...');
      const authResult = await authApiService.googleSignIn(googleResult.token);
      console.log('🔵 Backend API successful, storing tokens...');

      await storageService.storeTokens({
        access_token: authResult.access_token,
        refresh_token: authResult.refresh_token,
        token_type: authResult.token_type,
        access_token_expires_in: authResult.access_token_expires_in,
        refresh_token_expires_in: authResult.refresh_token_expires_in,
        is_revoked: authResult.is_revoked,
      });
      console.log('🔵 Tokens stored successfully');

      const user: User = {
        id: parseInt(authResult.user.id.toString()),
        email: authResult.user.email,
        full_name: authResult.user.full_name,
        avatar: authResult.user.avatar || null,
        is_active: authResult.user.is_active,
        is_verified: authResult.user.is_verified,
        created_at: authResult.user.created_at,
      };

      // Update auth store
      useAuthStore.setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      });
      console.log('🔵 Auth store updated successfully');

      // Keep the loading state for a smooth transition
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('🔵 Google Sign-In process completed successfully');
      
    } catch (error) {
      console.error('🔴 Google Sign-In failed at step:', error);
      
      // Log more details about the error
      if (error instanceof Error) {
        console.error('🔴 Error name:', error.name);
        console.error('🔴 Error message:', error.message);
        console.error('🔴 Error stack:', error.stack);
      }
      
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
            <View style={[styles.logoWrapper, { backgroundColor: colors.accent.primary }]}>
              <AssetByVariant path="tom" style={styles.logo} resizeMode="contain" />
            </View>
            <ActivityIndicator 
              size="large" 
              color={colors.accent.primary}
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
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={[styles.logoWrapper, { backgroundColor: colors.accent.primary }]}>
              <AssetByVariant path="tom" style={styles.logo} resizeMode="contain" />
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
                <IconByVariant name="mail" size={20} color={colors.text.tertiary} style={styles.inputIcon} />
                <Input
                  placeholder="Enter your e-mail"
                  placeholderTextColor={colors.text.tertiary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={[styles.textInput, { 
                    borderColor: colors.border.primary,
                    backgroundColor: colors.background.secondary,
                    color: colors.text.primary
                  }]}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Password</Text>
              <View style={styles.inputContainer}>
                <IconByVariant name="lock" size={20} color={colors.text.tertiary} style={styles.inputIcon} />
                <Input
                  placeholder="Enter your password"
                  placeholderTextColor={colors.text.tertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={[styles.textInput, { 
                    borderColor: colors.border.primary,
                    backgroundColor: colors.background.secondary,
                    color: colors.text.primary
                  }]}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <IconByVariant name="eye" size={20} color={colors.text.tertiary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={styles.optionsRow}>
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[
                  styles.checkbox,
                  { borderColor: colors.border.primary },
                  rememberMe && { backgroundColor: colors.accent.primary, borderColor: colors.accent.primary }
                ]}>
                  {rememberMe && <IconByVariant name="check" size={12} color={colors.text.inverse} />}
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
              onPress={handleLogin}
              disabled={isLoading}
              style={[
                styles.signInButton,
                { backgroundColor: colors.accent.primary },
                isLoading && { opacity: 0.7 }
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.text.inverse} />
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
                onPress={handleGoogleSignIn}
                disabled={isGoogleLoading}
                style={[styles.socialButton, { 
                  borderColor: colors.border.primary,
                  backgroundColor: colors.background.secondary
                }]}
              >
                {isGoogleLoading ? (
                  <ActivityIndicator size="small" color="#4285F4" />
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
                  borderColor: colors.border.primary,
                  backgroundColor: colors.background.secondary
                }]}
              >
                <IconByVariant name="apple" size={20} color={colors.text.primary} />
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
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
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
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  content: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingContent: {
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
  },
  loadingSpinner: {
    marginTop: 24,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 14,
    zIndex: 1,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 48,
    paddingRight: 48,
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
    zIndex: 1,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  forgotLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  signInButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  socialButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  signUpText: {
    fontSize: 14,
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});