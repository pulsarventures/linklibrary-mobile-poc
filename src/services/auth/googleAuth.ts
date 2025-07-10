import { GoogleSignin, statusCodes, type User } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import { GOOGLE_CLIENT_ID } from '@env';

// Initialize Google Sign-In
console.log('Configuring Google Sign-In with webClientId:', GOOGLE_CLIENT_ID);
GoogleSignin.configure({
  webClientId: GOOGLE_CLIENT_ID,
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

interface GoogleSignInResult {
  token: string;
  email: string;
  name: string;
}

interface GoogleUser {
  email: string;
  familyName: string | null;
  givenName: string | null;
  id: string;
  name: string | null;
  photo: string | null;
}

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  try {
    console.log('Starting Google Sign-In...');
    
    // Simple sign-in without all the complexity
    const signInResult = await GoogleSignin.signIn();
    if (signInResult.type !== 'success') {
      throw new Error('Google Sign-In was cancelled');
    }

    // Get access token
    const tokens = await GoogleSignin.getTokens();
    if (!tokens.accessToken) {
      throw new Error('Failed to get access token');
    }

    // Get user info
    const { user } = signInResult.data;
    const email = user.email;
    const name = user.name || user.givenName || '';

    if (!email) {
      throw new Error('Failed to get user email');
    }

    console.log('Google Sign-In successful:', { email, name });
    
    return {
      token: tokens.accessToken,
      email,
      name,
    };
    
  } catch (error: unknown) {
    console.error('Google Sign-In failed:', error);
    
    if (error instanceof Error && 'code' in error) {
      const code = (error as any).code;
      switch (code) {
        case statusCodes.SIGN_IN_CANCELLED:
          throw new Error('Sign in cancelled');
        case statusCodes.IN_PROGRESS:
          throw new Error('Sign in already in progress');
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          throw new Error('Play services not available');
        default:
          throw new Error('Google Sign-In failed');
      }
    }
    
    throw new Error('Google Sign-In failed');
  }
}

export async function signOutFromGoogle(): Promise<void> {
  try {
    // Check if user is currently signed in by trying to get current user
    const currentUser = await GoogleSignin.getCurrentUser();
    
    if (!currentUser) {
      console.log('User not signed in to Google, skipping Google sign out');
      return;
    }
    
    await GoogleSignin.signOut();
    await GoogleSignin.revokeAccess();
    console.log('Google Sign-Out successful');
  } catch (error) {
    // Handle specific Google sign-out errors
    if (error instanceof Error && 'code' in error) {
      const code = (error as any).code;
      if (code === statusCodes.SIGN_IN_REQUIRED) {
        console.log('ℹ️ User was not signed in to Google, skipping Google sign out');
        return;
      }
    }
    
    // For other errors, just log them but don't fail the logout process
    console.warn('⚠️ Google sign out failed, but continuing with logout:', error);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const currentUser = await GoogleSignin.getCurrentUser();
    return currentUser;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

export async function hasPreviousSignIn(): Promise<boolean> {
  try {
    return await GoogleSignin.hasPreviousSignIn();
  } catch (error) {
    console.error('Check sign in status error:', error);
    return false;
  }
} 