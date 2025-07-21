import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { Container, Input, Text } from '@/components/ui';
import { SafeScreen } from '@/components/templates';
import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { AssetByVariant } from '@/components/atoms';
import { IconByVariant } from '@/components/atoms';
import { safeErrorLog } from '@/utils/errorHandler';
import { signInWithGoogle } from '@/services/auth/googleAuth';
import { authApiService } from '@/services/auth-api.service';
import type { User } from '@/hooks/domain/user/schema';
import { storageService } from '@/services/storage';

type SignUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function SignUp() {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const { colors } = useTheme();
  const { register } = useAuthStore();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
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
              size="large" 
              color={colors.accent.primary}
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
                <IconByVariant name="user" size={20} color={colors.text.tertiary} style={styles.inputIcon} />
                <Input
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.text.tertiary}
                  value={formData.full_name}
                  onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                  autoCapitalize="words"
                  style={[styles.textInput, { 
                    borderColor: colors.border.primary,
                    backgroundColor: colors.background.secondary,
                    color: colors.text.primary
                  }]}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Email</Text>
              <View style={styles.inputContainer}>
                <IconByVariant name="mail" size={20} color={colors.text.tertiary} style={styles.inputIcon} />
                <Input
                  placeholder="Enter your email address"
                  placeholderTextColor={colors.text.tertiary}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
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
                  placeholder="Create a strong password"
                  placeholderTextColor={colors.text.tertiary}
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
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

            {/* Confirm Password */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <IconByVariant name="lock" size={20} color={colors.text.tertiary} style={styles.inputIcon} />
                <Input
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.text.tertiary}
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry={!showConfirmPassword}
                  style={[styles.textInput, { 
                    borderColor: colors.border.primary,
                    backgroundColor: colors.background.secondary,
                    color: colors.text.primary
                  }]}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <IconByVariant name="eye" size={20} color={colors.text.tertiary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms & Conditions */}
            <TouchableOpacity 
              style={styles.termsRow}
              onPress={() => setTermsAccepted(!termsAccepted)}
            >
              <View style={[
                styles.checkbox,
                { borderColor: colors.border.primary },
                termsAccepted && { backgroundColor: colors.accent.primary, borderColor: colors.accent.primary }
              ]}>
                {termsAccepted && <IconByVariant name="check" size={12} color={colors.text.inverse} />}
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
              onPress={handleSignUp}
              disabled={isLoading}
              style={[
                styles.signUpButton,
                { backgroundColor: colors.accent.primary },
                isLoading && { opacity: 0.7 }
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.text.inverse} />
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
              onPress={handleGoogleSignUp}
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
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
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
    marginBottom: 20,
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  termsText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  termsLink: {
    fontWeight: '600',
  },
  signUpButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
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
  socialButton: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  signInText: {
    fontSize: 14,
  },
  signInLink: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 