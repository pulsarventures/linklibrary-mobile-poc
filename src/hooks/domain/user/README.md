# Authentication Store

This directory contains the authentication store implementation using Zustand with persistence for React Native.

## Files

- `useAuthStore.ts` - Main Zustand store for authentication state management
- `useAuthInterceptor.ts` - Hook for automatic token refresh
- `schema.ts` - TypeScript schemas and types for authentication
- `README.md` - This documentation

## Features

### Auth Store (`useAuthStore.ts`)

The auth store provides:

- **Persistent State**: Uses Zustand's persist middleware with AsyncStorage
- **Token Management**: Automatic token storage and retrieval
- **User Authentication**: Login, register, logout, and social auth
- **Token Refresh**: Automatic token refresh before expiration
- **Error Handling**: Centralized error state management

### Auth Interceptor (`useAuthInterceptor.ts`)

The auth interceptor provides:

- **Automatic Token Refresh**: Refreshes tokens 5 minutes before expiration
- **Background Refresh**: Handles token refresh in the background
- **Error Recovery**: Automatically logs out user if refresh fails

## Usage

### Basic Usage

```typescript
import { useAuth } from '@/hooks/useAuth';
import { useAuthInterceptor } from '@/hooks/domain/user/useAuthInterceptor';

function LoginScreen() {
  const { login, isLoading, error, user, isAuthenticated } = useAuth();
  
  // Set up automatic token refresh
  useAuthInterceptor();

  const handleLogin = async () => {
    try {
      const result = await login({ username: 'user@example.com', password: 'password' });
      
      if (result.message) {
        // Handle verification message
        console.log(result.message);
      }
    } catch (error) {
      // Error is already set in the store
      console.error('Login failed:', error);
    }
  };

  return (
    // Your login UI
  );
}
```

### Available Methods

#### Authentication Actions

- `login(data: LoginRequest)` - Login with email/password
- `register(data: RegisterRequest)` - Register new user
- `logout()` - Logout and clear all data
- `socialAuth(data: SocialAuthRequest)` - Social authentication (Google, etc.)
- `refreshAuth()` - Manually refresh tokens
- `getUser()` - Get current user data

#### Utility Methods

- `clearError()` - Clear error state
- `resetAuth()` - Reset auth state to initial values
- `initializeAuth()` - Initialize auth state from stored tokens

#### State Properties

- `user` - Current user data
- `isAuthenticated` - Authentication status
- `isLoading` - Loading state
- `error` - Error message
- `accessToken` - Current access token
- `refreshToken` - Current refresh token
- `initialized` - Whether auth has been initialized

### Token Management

The store automatically handles:

1. **Token Storage**: Tokens are stored in AsyncStorage with expiration times
2. **Token Validation**: Checks if tokens are expired before using them
3. **Token Refresh**: Automatically refreshes tokens when needed
4. **Token Cleanup**: Clears all tokens on logout

### Error Handling

Errors are automatically stored in the `error` state and can be cleared with `clearError()`:

```typescript
const { error, clearError } = useAuth();

// Clear error when user starts typing
const handleInputChange = () => {
  if (error) clearError();
};
```

### Social Authentication

For Google Sign-In:

```typescript
const { socialAuth } = useAuth();

const handleGoogleSignIn = async () => {
  try {
    const googleResult = await signInWithGoogle();
    await socialAuth({
      provider: 'google',
      token: googleResult.token,
      email: googleResult.email,
      name: googleResult.name,
    });
  } catch (error) {
    console.error('Google sign-in failed:', error);
  }
};
```

## Migration from Old Auth System

The new auth store is backward compatible with the existing API structure. Key changes:

1. **Simplified State Management**: No more local state in components
2. **Automatic Persistence**: State is automatically persisted
3. **Better Error Handling**: Centralized error management
4. **Automatic Token Refresh**: No manual token refresh needed

### Migration Steps

1. Replace `useAuth()` hook usage (already done)
2. Add `useAuthInterceptor()` to your main app component
3. Remove manual token management code
4. Update error handling to use store's error state

## Configuration

The auth store uses the following configuration:

- **Storage**: AsyncStorage with JSON serialization
- **Storage Key**: `auth-storage`
- **Token Refresh Buffer**: 5 minutes before expiration
- **Error Handling**: Automatic error state management

## Dependencies

- `zustand` - State management
- `@react-native-async-storage/async-storage` - Persistent storage
- `zod` - Schema validation

## Testing

The auth store can be tested by:

1. **Unit Tests**: Test individual methods
2. **Integration Tests**: Test with actual API calls
3. **E2E Tests**: Test complete authentication flow

Example test:

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useAuthStore } from './useAuthStore';

test('login should update auth state', async () => {
  const { result } = renderHook(() => useAuthStore());
  
  await act(async () => {
    await result.current.login({ username: 'test', password: 'test' });
  });
  
  expect(result.current.isAuthenticated).toBe(true);
  expect(result.current.user).toBeDefined();
});
``` 