/**
 * Safely log error information without causing "Error.stack getter called with an invalid receiver"
 */
export const safeErrorLog = (context: string, error: unknown) => {
  try {
    console.error(`${context}:`, error);
    
    if (error instanceof Error) {
      console.error(`${context} - name:`, error.name);
      console.error(`${context} - message:`, error.message);
      
      // Safely access stack property
      try {
        const stack = error.stack;
        if (stack) {
          console.error(`${context} - stack:`, stack);
        }
      } catch (stackError) {
        console.error(`${context} - stack access failed:`, stackError);
      }
    } else if (typeof error === 'object' && error !== null) {
      // Handle non-Error objects
      console.error(`${context} - object error:`, JSON.stringify(error, null, 2));
    } else {
      console.error(`${context} - primitive error:`, error);
    }
  } catch (logError) {
    // Fallback if even the logging fails
    console.error(`${context} - logging failed:`, logError);
    console.error(`${context} - original error:`, String(error));
  }
};

export const setupErrorHandling = () => {
  // This function exists to ensure the file is executed
  // The error handlers are set up when this file is imported
}; 