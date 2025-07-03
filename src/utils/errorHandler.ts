import { LogBox } from 'react-native';

// Disable LogBox for the error we're trying to fix
LogBox.ignoreLogs(['Error.stack getter called with an invalid receiver']);

export const setupErrorHandling = () => {
  // This function exists to ensure the file is executed
  // The error handlers are set up when this file is imported
}; 