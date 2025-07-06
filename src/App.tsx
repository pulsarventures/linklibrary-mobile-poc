import 'react-native-gesture-handler';

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import Toast from 'react-native-toast-message';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';

import { ErrorBoundary } from '@/components/organisms';
import ApplicationNavigator from '@/navigation/Application';
import { ThemeProvider } from '@/theme';
import { setupErrorHandling } from '@/utils/errorHandler';
import { initializeI18n } from '@/translations';

// Enable Reanimated layout animations
import { UIManager } from 'react-native';
if (UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Set up error handling
setupErrorHandling();

// Enable native screens for better performance
enableScreens();

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: false,
    },
    queries: {
      retry: false,
    },
  },
});

function App() {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    initializeI18n()
      .then(() => setIsI18nInitialized(true))
      .catch(error => {
        console.error('Failed to initialize i18n:', error);
        // Still set as initialized to not block the app, but translations might not work
        setIsI18nInitialized(true);
      });
  }, []);

  if (!isI18nInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <ErrorBoundary>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <ApplicationNavigator />
              <Toast />
            </ThemeProvider>
          </QueryClientProvider>
        </GestureHandlerRootView>
      </ErrorBoundary>
    </I18nextProvider>
  );
}

export default App;
