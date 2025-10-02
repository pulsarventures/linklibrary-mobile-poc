import { appleAuth } from '@invertase/react-native-apple-authentication';
import { Platform } from 'react-native';

export interface AppleAuthResponse {
  email: string | null;
  fullName: string | null;
  token: string;
  identityToken: string;
  authorizationCode: string;
}

export const signInWithApple = async (): Promise<AppleAuthResponse> => {
  console.log('🍎 Starting Apple Sign-In process...');
  
  if (Platform.OS !== 'ios') {
    throw new Error('Apple Sign-In is only available on iOS');
  }

  try {
    // Check if Apple Sign-In is supported on this device
    if (!appleAuth.isSupported) {
      throw new Error('Apple Sign-In is not supported on this device');
    }

    console.log('🍎 Requesting Apple authentication...');
    
    // Perform the sign-in request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    console.log('🍎 Apple authentication response received:', {
      user: appleAuthRequestResponse.user,
      state: appleAuthRequestResponse.state,
      hasIdentityToken: !!appleAuthRequestResponse.identityToken,
      hasAuthorizationCode: !!appleAuthRequestResponse.authorizationCode,
      email: appleAuthRequestResponse.email,
      fullName: appleAuthRequestResponse.fullName,
    });

    // Check that we have the required credentials
    if (!appleAuthRequestResponse.identityToken) {
      throw new Error('Apple Sign-In failed - no identity token received');
    }

    if (!appleAuthRequestResponse.authorizationCode) {
      throw new Error('Apple Sign-In failed - no authorization code received');
    }

    // Extract full name
    let fullName: string | null = null;
    if (appleAuthRequestResponse.fullName) {
      const { givenName, familyName } = appleAuthRequestResponse.fullName;
      if (givenName || familyName) {
        fullName = [givenName, familyName].filter(Boolean).join(' ');
      }
    }

    console.log('🍎 Apple Sign-In successful, returning response');

    return {
      email: appleAuthRequestResponse.email,
      fullName,
      token: appleAuthRequestResponse.identityToken,
      identityToken: appleAuthRequestResponse.identityToken,
      authorizationCode: appleAuthRequestResponse.authorizationCode,
    };

  } catch (error) {
    console.error('🍎 Apple Sign-In failed:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      const appleError = error as any;
      
      switch (appleError.code) {
        case appleAuth.Error.CANCELED:
          throw new Error('Apple Sign-In was cancelled by user');
        case appleAuth.Error.FAILED:
          throw new Error('Apple Sign-In failed');
        case appleAuth.Error.INVALID_RESPONSE:
          throw new Error('Apple Sign-In received invalid response');
        case appleAuth.Error.NOT_HANDLED:
          throw new Error('Apple Sign-In request was not handled');
        case appleAuth.Error.UNKNOWN:
          throw new Error('Apple Sign-In failed with unknown error');
        default:
          throw new Error(`Apple Sign-In failed: ${appleError.message || 'Unknown error'}`);
      }
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Apple Sign-In failed with unknown error');
  }
};

export const getAppleAuthCredentialState = async (user: string): Promise<number> => {
  if (Platform.OS !== 'ios' || !appleAuth.isSupported) {
    return appleAuth.State.REVOKED;
  }

  try {
    const credentialState = await appleAuth.getCredentialStateForUser(user);
    return credentialState;
  } catch (error) {
    console.error('🍎 Failed to get Apple credential state:', error);
    return appleAuth.State.REVOKED;
  }
};