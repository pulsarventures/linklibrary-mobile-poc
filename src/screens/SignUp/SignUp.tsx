import type { User } from '@/hooks/domain/user/schema';
import type { RootStackParamList } from '@/navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { useTheme } from '@/theme';

import { AssetByVariant } from '@/components/atoms';
import { IconByVariant } from '@/components/atoms';
import { SafeScreen } from '@/components/templates';
import { Container, Input, Text } from '@/components/ui';

import { authApiService } from '@/services/auth-api.service';
import { signInWithGoogle } from '@/services/auth/googleAuth';
import { storageService } from '@/services/storage';
import { safeErrorLog } from '@/utils/errorHandler';

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
      console.log('🔵 Starting Google Sign-Up process...');
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
      console.log('🔵 Google Sign-Up process completed successfully');
      
    } catch (error) {
      safeErrorLog('🔴 Google Sign-Up failed at step', error);
      
      Alert.alert('Google Sign-Up Failed', `Please try again. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
            <View style={[styles.logoWrapper, { backgroundColor: colors.accent.primary }]}>
              <AssetByVariant path="tom" resizeMode="contain" style={styles.logo} />
            </View>
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
            <TouchableOpacity
              disabled={isLoading}
              onPress={handleSignUp}
              style={[
                styles.signUpButton,
                { backgroundColor: colors.accent.primary },
                isLoading && { opacity: 0.7 }
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.text.inverse} size="small" />
              ) : (
                <Text style={[styles.signUpButtonText, { color: colors.text.inverse }]}>
                  Create account
                </Text>
              )}
            </TouchableOpacity>

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
                borderColor: colors.border.primary
              }]}
            >
              {isGoogleLoading ? (
                <ActivityIndicator color="#4285F4" size="small" />
              ) : (
                <>
                  <IconByVariant name="google" size={20} />
                  <Text style={[styles.socialButtonText, { color: colors.text.primary }]}>
                    Google
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
    borderRadius: 4,
    borderWidth: 2,
    flexShrink: 0,
    height: 20,
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
    width: 20,
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
    marginBottom: 18,
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
    marginBottom: 20,
  },
  logoWrapper: {
    alignItems: 'center',
    borderRadius: 16,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  signInLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  signInRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  signInText: {
    fontSize: 14,
  },
  signUpButton: {
    alignItems: 'center',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    marginBottom: 18,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  socialButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    height: 48,
    justifyContent: 'center',
    marginBottom: 18,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  termsLink: {
    fontWeight: '600',
  },
  termsRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 18,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
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