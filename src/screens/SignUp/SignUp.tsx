import type { User } from '@/hooks/domain/user/schema';
import type { RootStackParamList } from '@/navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { authApiService } from '@/services/auth-api.service';
import { signInWithGoogle } from '@/services/auth/googleAuth';
import { signInWithApple } from '@/services/auth/appleAuth';
import { storageService } from '@/services/storage';
import { safeErrorLog } from '@/utils/errorHandler';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Image } from 'react-native';

import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { useTheme } from '@/theme';

import { IconByVariant } from '@/components/atoms';
import { SafeScreen } from '@/components/templates';
import { Button, Container, Input, Text } from '@/components/ui';

type SignUpScreenNavigationProperty = NativeStackNavigationProp<RootStackParamList>;

export function SignUp() {
  const navigation = useNavigation<SignUpScreenNavigationProperty>();
  const { colors } = useTheme();
  const { register } = useAuthStore();
  
  const [formData, setFormData] = useState({
    confirmPassword: '',
    email: '',
    full_name: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authTransition, setAuthTransition] = useState(false);

  const handleSignUp = async () => {
    if (!formData.full_name || !formData.email || !formData.password || !formData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Password validation
    if (formData.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      Alert.alert('Error', 'Password must contain at least one uppercase letter');
      return;
    }

    if (!/[a-z]/.test(formData.password)) {
      Alert.alert('Error', 'Password must contain at least one lowercase letter');
      return;
    }

    if (!/[0-9]/.test(formData.password)) {
      Alert.alert('Error', 'Password must contain at least one number');
      return;
    }

    if (!termsAccepted) {
      Alert.alert('Error', 'Please accept the Terms of Service and Privacy Policy');
      return;
    }

    try {
      setIsLoading(true);
      await register(formData);
    } catch (error) {
      safeErrorLog('Sign up failed', error);
      Alert.alert('Sign Up Failed', 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      // Starting Google Sign-Up process
      setIsGoogleLoading(true);
      setAuthTransition(true);
      
      // Add a small delay to ensure the loading state is visible
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Calling signInWithGoogle
      const googleResult = await signInWithGoogle();
      // Google Sign-In successful
      
      // Calling backend Google Sign-In API
      const authResult = await authApiService.googleSignIn(googleResult.token);
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
      // Tokens stored successfully

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
      // Auth store updated successfully

      // Keep the loading state for a smooth transition
      await new Promise(resolve => setTimeout(resolve, 500));
      // Google Sign-Up process completed successfully
      
    } catch (error) {
      safeErrorLog('🔴 Google Sign-Up failed at step', error);
      
      Alert.alert('Google Sign-Up Failed', `Please try again. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setAuthTransition(false);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignUp = async () => {
    try {
      // Starting Apple Sign-Up process
      setIsAppleLoading(true);
      setAuthTransition(true);
      
      // Add a small delay to ensure the loading state is visible
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Calling signInWithApple
      const appleResult = await signInWithApple();
      // Apple Sign-In successful
      
      // Calling backend Apple Sign-In API
      
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
      // Tokens stored successfully

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
      // Auth store updated successfully

      // Keep the loading state for a smooth transition
      await new Promise(resolve => setTimeout(resolve, 500));
      // Apple Sign-Up process completed successfully
      
    } catch (error) {
      safeErrorLog('🔴 Apple Sign-Up failed at step', error);
      
      Alert.alert('Apple Sign-Up Failed', `Please try again. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
              Creating your account...
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
            Create your account
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Join LinkLibrary today
          </Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Full Name</Text>
              <View style={styles.inputContainer}>
                <IconByVariant color={colors.text.tertiary} name="user" size={20} style={styles.inputIcon} />
                <Input
                  autoCapitalize="words"
                  onChangeText={(text) => { setFormData({ ...formData, full_name: text }); }}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.text.tertiary}
                  style={[styles.textInput, { 
                    backgroundColor: colors.background.secondary,
                    borderColor: colors.border.primary,
                    color: colors.text.primary
                  }]}
                  value={formData.full_name}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Email</Text>
              <View style={styles.inputContainer}>
                <IconByVariant color={colors.text.tertiary} name="mail" size={20} style={styles.inputIcon} />
                <Input
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={(text) => { setFormData({ ...formData, email: text }); }}
                  placeholder="Enter your email address"
                  placeholderTextColor={colors.text.tertiary}
                  style={[styles.textInput, { 
                    backgroundColor: colors.background.secondary,
                    borderColor: colors.border.primary,
                    color: colors.text.primary
                  }]}
                  value={formData.email}
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
                  onChangeText={(text) => { setFormData({ ...formData, password: text }); }}
                  placeholder="Create a strong password"
                  placeholderTextColor={colors.text.tertiary}
                  secureTextEntry={!showPassword}
                  style={[styles.textInput, { 
                    backgroundColor: colors.background.secondary,
                    borderColor: colors.border.primary,
                    color: colors.text.primary
                  }]}
                  value={formData.password}
                />
                <TouchableOpacity 
                  onPress={() => { setShowPassword(!showPassword); }}
                  style={styles.eyeIcon}
                >
                  <IconByVariant color={colors.text.tertiary} name="eye" size={20} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <IconByVariant color={colors.text.tertiary} name="lock" size={20} style={styles.inputIcon} />
                <Input
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={(text) => { setFormData({ ...formData, confirmPassword: text }); }}
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.text.tertiary}
                  secureTextEntry={!showConfirmPassword}
                  style={[styles.textInput, { 
                    backgroundColor: colors.background.secondary,
                    borderColor: colors.border.primary,
                    color: colors.text.primary
                  }]}
                  value={formData.confirmPassword}
                />
                <TouchableOpacity 
                  onPress={() => { setShowConfirmPassword(!showConfirmPassword); }}
                  style={styles.eyeIcon}
                >
                  <IconByVariant color={colors.text.tertiary} name="eye" size={20} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms & Conditions */}
            <TouchableOpacity 
              onPress={() => { setTermsAccepted(!termsAccepted); }}
              style={styles.termsRow}
            >
              <View style={[
                styles.checkbox,
                { borderColor: colors.border.primary },
                termsAccepted && { backgroundColor: colors.accent.primary, borderColor: colors.accent.primary }
              ]}>
                {termsAccepted ? <IconByVariant color={colors.text.inverse} name="check" size={12} /> : null}
              </View>
              <Text style={[styles.termsText, { color: colors.text.secondary }]}>
                I agree to the{' '}
                <Text style={[styles.termsLink, { color: colors.accent.primary }]}>
                  Terms of Service
                </Text>
                {' '}and{' '}
                <Text style={[styles.termsLink, { color: colors.accent.primary }]}>
                  Privacy Policy
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Create Account Button */}
            <Button
              disabled={isLoading}
              onPress={handleSignUp}
              variant="primary"
              loading={isLoading}
              style={styles.signUpButton}
            >
              Create account
            </Button>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border.primary }]} />
              <Text style={[styles.dividerText, { color: colors.text.secondary }]}>Or sign up with</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border.primary }]} />
            </View>

            {/* Social Buttons */}
            <TouchableOpacity
              disabled={isGoogleLoading}
              onPress={handleGoogleSignUp}
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
                    Sign up with Google
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              disabled={isAppleLoading}
              onPress={handleAppleSignUp}
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
                    Sign up with Apple
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={styles.signInRow}>
              <Text style={[styles.signInText, { color: colors.text.secondary }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => { navigation.navigate('Login'); }}>
                <Text style={[styles.signInLink, { color: colors.accent.primary }]}>
                  Sign in
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
    borderRadius: 3,
    borderWidth: 2,
    flexShrink: 0,
    height: 16,
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
    width: 16,
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
    marginBottom: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 12,
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
    top: 11,
    zIndex: 1,
  },
  fieldContainer: {
    marginBottom: 4,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    position: 'relative',
  },
  inputIcon: {
    left: 14,
    position: 'absolute',
    top: 11,
    zIndex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
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
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  logo: {
    height: 60,
    width: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logoWrapper: {
    alignItems: 'center',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  signInLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  signInRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 12,
  },
  signInText: {
    fontSize: 13,
  },
  signUpButton: {
    alignItems: 'center',
    borderRadius: 10,
    height: 42,
    justifyContent: 'center',
    marginBottom: 6,
  },
  signUpButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  socialButton: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    height: 42,
    justifyContent: 'center',
    marginBottom: 4,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  termsLink: {
    fontWeight: '600',
  },
  termsRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 6,
  },
  termsText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 14,
  },
  textInput: {
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 14,
    height: 42,
    paddingLeft: 42,
    paddingRight: 42,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 1,
    textAlign: 'center',
  },
}); 