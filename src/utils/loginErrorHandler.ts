import Toast from 'react-native-toast-message';

export interface LoginError {
  message: string;
  type: 'validation' | 'network' | 'auth' | 'server' | 'unknown';
  statusCode?: number;
  details?: string;
}

/**
 * Parse error messages from the backend API response
 */
export function parseLoginError(error: any): LoginError {
  // Handle different error formats
  let message = 'An unexpected error occurred';
  let type: LoginError['type'] = 'unknown';
  let statusCode: number | undefined;
  let details: string | undefined;

  if (error?.response?.data) {
    // Axios-style error with response data
    const data = error.response.data;
    statusCode = error.response.status;
    
    if (data.detail) {
      message = data.detail;
    } else if (data.message) {
      message = data.message;
    } else if (data.error) {
      message = data.error;
    } else if (typeof data === 'string') {
      message = data;
    }
  } else if (error?.message) {
    // Standard Error object
    message = error.message;
  } else if (typeof error === 'string') {
    // String error
    message = error;
  }

  // Determine error type based on message content and status code
  if (statusCode) {
    if (statusCode === 401) {
      type = 'auth';
      if (message.toLowerCase().includes('invalid') || message.toLowerCase().includes('incorrect')) {
        message = 'Invalid email or password. Please check your credentials and try again.';
      } else if (message.toLowerCase().includes('disabled') || message.toLowerCase().includes('inactive')) {
        message = 'Your account has been disabled. Please contact support for assistance.';
      } else if (message.toLowerCase().includes('unverified') || message.toLowerCase().includes('verify')) {
        message = 'Please verify your email address before signing in. Check your inbox for a verification link.';
      } else {
        message = 'Invalid email or password. Please check your credentials and try again.';
      }
    } else if (statusCode === 422) {
      type = 'validation';
      if (message.toLowerCase().includes('email')) {
        message = 'Please enter a valid email address.';
      } else if (message.toLowerCase().includes('password')) {
        message = 'Password must be at least 8 characters long.';
      } else {
        message = 'Please check your input and try again.';
      }
    } else if (statusCode === 429) {
      type = 'auth';
      message = 'Too many login attempts. Please wait a few minutes before trying again.';
    } else if (statusCode >= 500) {
      type = 'server';
      message = 'Server error. Please try again in a few moments.';
    } else if (statusCode >= 400) {
      type = 'auth';
      message = 'Invalid email or password. Please check your credentials and try again.';
    }
  } else {
    // Determine type based on message content
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('network') || lowerMessage.includes('timeout') || lowerMessage.includes('connection')) {
      type = 'network';
      message = 'Network connection error. Please check your internet connection and try again.';
    } else if (lowerMessage.includes('invalid') || lowerMessage.includes('incorrect') || lowerMessage.includes('wrong')) {
      type = 'auth';
      message = 'Invalid email or password. Please check your credentials and try again.';
    } else if (lowerMessage.includes('disabled') || lowerMessage.includes('inactive')) {
      type = 'auth';
      message = 'Your account has been disabled. Please contact support for assistance.';
    } else if (lowerMessage.includes('unverified') || lowerMessage.includes('verify')) {
      type = 'auth';
      message = 'Please verify your email address before signing in. Check your inbox for a verification link.';
    } else if (lowerMessage.includes('server') || lowerMessage.includes('internal')) {
      type = 'server';
      message = 'Server error. Please try again in a few moments.';
    } else {
      // Default to auth error for unknown cases
      type = 'auth';
      message = 'Invalid email or password. Please check your credentials and try again.';
    }
  }

  return {
    message,
    type,
    statusCode,
    details: details || message,
  };
}

/**
 * Show a nice-looking error toast based on the error type
 */
export function showLoginErrorToast(error: LoginError) {
  // No toast - clean UI
  console.error('Login error:', error.message);
}

/**
 * Show a success toast for successful login
 */
export function showLoginSuccessToast() {
  // No toast - clean UI
}

/**
 * Show a loading toast for login attempts
 */
export function showLoginLoadingToast() {
  Toast.show({
    type: 'info',
    text1: 'Signing in...',
    text2: 'Please wait while we authenticate you.',
    position: 'top',
    visibilityTime: 2000,
    autoHide: true,
    topOffset: 60,
  });
}

/**
 * Handle login error with proper parsing and toast display
 */
export function handleLoginError(error: any): LoginError {
  const parsedError = parseLoginError(error);
  showLoginErrorToast(parsedError);
  return parsedError;
}

/**
 * Get user-friendly error message for display in UI components
 */
export function getErrorMessage(error: LoginError): string {
  return error.message;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: LoginError): boolean {
  return error.type === 'network' || error.type === 'server';
}

/**
 * Get retry delay in milliseconds
 */
export function getRetryDelay(error: LoginError): number {
  switch (error.type) {
    case 'network':
      return 2000; // 2 seconds
    case 'server':
      return 5000; // 5 seconds
    default:
      return 0; // No retry
  }
}
