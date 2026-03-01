'use client';

import { useEffect } from 'react';

export function ErrorSuppression() {
  useEffect(() => {
    // Suppress AbortError in development (caused by React Strict Mode double rendering)
    if (process.env.NODE_ENV === 'development') {
      const originalError = console.error;
      console.error = (...args: any[]) => {
        // Check if the error message contains 'aborted' or 'AbortError'
        const errorString = args.join(' ');
        if (
          errorString.includes('AbortError') ||
          errorString.includes('signal is aborted') ||
          errorString.includes('aborted without reason')
        ) {
          // Silently ignore these errors in development
          return;
        }
        // Log all other errors normally
        originalError.apply(console, args);
      };

      return () => {
        console.error = originalError;
      };
    }
  }, []);

  return null;
}
