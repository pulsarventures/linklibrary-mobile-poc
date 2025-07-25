import { GOOGLE_CLIENT_ID, IOS_CLIENT_ID } from '@env';
import { GoogleSignin, statusCodes, type User } from '@react-native-google-signin/google-signin';

import { safeErrorLog } from '@/utils/errorHandler';

// Initialize Google Sign-In
if (!GOOGLE_CLIENT_ID || !IOS_CLIENT_ID) {
  throw new Error('Google Sign-In client IDs are not configured in environment variables');
}

GoogleSignin.configure({
  webClientId: GOOGLE_CLIENT_ID,
  iosClientId: IOS_CLIENT_ID,
  offlineAccess: true,
  scopes: ['profile', 'email'],
  forceCodeForRefreshToken: true,
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
    return GoogleSignin.isSignedIn();
  } catch (error) {
    safeErrorLog('Check sign in status error', error);
    return false;
  }
}

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  try {
    // Check if Google Play Services is available
    await GoogleSignin.hasPlayServices();
    
    // Sign in and get user data
    const userInfo = await GoogleSignin.signIn();
    
    // Get access token
    const tokens = await GoogleSignin.getTokens();
    
    if (!tokens.accessToken) {
      throw new Error('Failed to get access token from Google');
    }

    const email = userInfo.user.email;
    const name = userInfo.user.name || userInfo.user.givenName || '';

    if (!email) {
      throw new Error('Failed to get user email from Google');
    }
    
    return {
      email,
      name,
      token: tokens.accessToken,
    };
    
  } catch (error: unknown) {
    safeErrorLog('Google Sign-In failed', error);
    
    if (error instanceof Error && 'code' in error) {
      const code = (error as any).code;
      
      switch (code) {
        case statusCodes.SIGN_IN_CANCELLED:
          throw new Error('Google Sign-In was cancelled by user');
        case statusCodes.IN_PROGRESS:
          throw new Error('Google Sign-In already in progress');
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          throw new Error('Google Play Services not available on this device');
        case statusCodes.SIGN_IN_REQUIRED:
          throw new Error('User needs to sign in to Google first');
        default:
          throw new Error(`Google Sign-In failed with code: ${code} - ${error.message}`);
      }
    }
    
    throw new Error(error instanceof Error ? error.message : 'Google Sign-In failed with unknown error');
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