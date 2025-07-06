import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// Initialize Google Sign-In
GoogleSignin.configure({
  // Get this from your Google Cloud Console
  webClientId: 'YOUR_WEB_CLIENT_ID',
  offlineAccess: true,
});

export async function signInWithGoogle() {
  try {
    await GoogleSignin.hasPlayServices();
    const { user } = await GoogleSignin.signIn();
    const tokens = await GoogleSignin.getTokens();
    
    return {
      token: tokens.accessToken,
      email: user.email,
      name: user.name || user.givenName,
    };
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new Error('Sign in cancelled');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      throw new Error('Sign in already in progress');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error('Play services not available');
    } else {
      throw new Error('Unknown error occurred during sign in');
    }
  }
}

export async function signOutFromGoogle() {
  try {
    await GoogleSignin.signOut();
    await GoogleSignin.revokeAccess();
  } catch (error) {
    console.error('Google sign out error:', error);
  }
}

export async function getCurrentUser() {
  try {
    const currentUser = await GoogleSignin.getCurrentUser();
    return currentUser;
  } catch (error) {
    return null;
  }
}

export async function isGoogleSignedIn() {
  return await GoogleSignin.isSignedIn();
} 