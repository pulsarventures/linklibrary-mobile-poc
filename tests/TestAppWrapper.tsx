import { queryClient } from '@/App';
import { QueryClientProvider } from '@tanstack/react-query';
import { type PropsWithChildren, useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';

import { ThemeProvider } from '@/theme';
import { initializeI18n } from '@/translations';

function TestAppWrapper({ children }: PropsWithChildren) {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    initializeI18n()
      .then(() => setIsI18nInitialized(true))
      .catch(error => {
        console.error('Failed to initialize i18n:', error);
        // Still set as initialized to not block the tests, but translations might not work
        setIsI18nInitialized(true);
      });
  }, []);

  if (!isI18nInitialized) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <I18nextProvider i18n={i18n}>
            {children}
          </I18nextProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default TestAppWrapper;
