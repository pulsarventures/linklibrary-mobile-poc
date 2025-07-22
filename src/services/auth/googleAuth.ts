import { GOOGLE_CLIENT_ID } from '@env';
import { GoogleSignin, statusCodes, type User } from '@react-native-google-signin/google-signin';

import { safeErrorLog } from '@/utils/errorHandler';

// Initialize Google Sign-In
console.log('Configuring Google Sign-In with webClientId:', GOOGLE_CLIENT_ID);
GoogleSignin.configure({
  forceCodeForRefreshToken: true,
  iosClientId: '991185990145-21ebjs10ct5gckdj5pshsd84i3pvpdpc.apps.googleusercontent.com',
  offlineAccess: true,
  scopes: ['profile', 'email'],
  webClientId: GOOGLE_CLIENT_ID,
});

type GoogleSignInResult = {
  email: string;
  name: string;
  token: string;
}

type GoogleUser = {
  email: string;
  familyName: null | string;
  givenName: null | string;
  id: string;
  name: null | string;
  photo: null | string;
}

export async function getCurrentUser(): Promise<null | User> {
  try {
    const currentUser = await GoogleSignin.getCurrentUser();
    return currentUser;
  } catch (error) {
    safeErrorLog('Get current user error', error);
    return null;
  }
}

export async function hasPreviousSignIn(): Promise<boolean> {
  try {
    return GoogleSignin.hasPreviousSignIn();
  } catch (error) {
    safeErrorLog('Check sign in status error', error);
    return false;
  }
}

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  try {
    console.log('Starting Google Sign-In...');
    console.log('Google Client ID configured:', GOOGLE_CLIENT_ID);
    
    // Check if Google Play Services is available
    try {
      await GoogleSignin.hasPlayServices();
      console.log('Google Play Services available');
    } catch {
      console.log('Google Play Services not available (iOS or not installed)');
    }
    
    // Simple sign-in without all the complexity
    const signInResult = await GoogleSignin.signIn();
    console.log('Sign-in result type:', signInResult.type);
    
    if (signInResult.type !== 'success') {
      throw new Error(`Google Sign-In was cancelled or failed. Type: ${signInResult.type}`);
    }

    console.log('Sign-in successful, getting tokens...');
    
    // Get access token
    const tokens = await GoogleSignin.getTokens();
    console.log('Tokens received:', { hasAccessToken: !!tokens.accessToken, hasIdToken: !!tokens.idToken });
    
    if (!tokens.accessToken) {
      throw new Error('Failed to get access token from Google');
    }

    // Get user info
    const { user } = signInResult.data;
    console.log('User data received:', { hasEmail: !!user.email, hasName: !!user.name });
    
    const email = user.email;
    const name = user.name || user.givenName || '';

    if (!email) {
      throw new Error('Failed to get user email from Google');
    }

    console.log('Google Sign-In successful:', { email, name });
    
    return {
      email,
      name,
      token: tokens.accessToken,
    };
    
  } catch (error: unknown) {
    safeErrorLog('Google Sign-In failed', error);
    
    if (error instanceof Error) {
      if ('code' in error) {
        const code = (error as any).code;
        console.error('Error code:', code);
        
        switch (code) {
          case statusCodes.SIGN_IN_CANCELLED: {
            throw new Error('Google Sign-In was cancelled by user');
          }
          case statusCodes.IN_PROGRESS: {
            throw new Error('Google Sign-In already in progress');
          }
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE: {
            throw new Error('Google Play Services not available on this device');
          }
          case statusCodes.SIGN_IN_REQUIRED: {
            throw new Error('User needs to sign in to Google first');
          }
          default: {
            throw new Error(`Google Sign-In failed with code: ${code} - ${error.message}`);
          }
        }
      }
      
      // Re-throw the original error with more context
      throw new Error(`Google Sign-In failed: ${error.message}`);
    }
    
    throw new Error('Google Sign-In failed with unknown error');
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