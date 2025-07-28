import 'react-native-gesture-handler';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import i18n from 'i18next';
import React, { useEffect, useRef, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import Toast from 'react-native-toast-message';

import ApplicationNavigator from '@/navigation/Application';
import { ThemeProvider } from '@/theme';
import { initializeI18n } from '@/translations';

import { ErrorBoundary } from '@/components/organisms';

import { setupErrorHandling } from '@/utils/errorHandler';
// import ShareReceiver from '@/share/ShareReceiver'; // Using iOS share extension instead
import { AppState, Linking, NativeModules } from 'react-native';

import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { navigationRef } from '@/navigation/paths';

const { AppGroupsModule } = NativeModules;
// Remove expensive native module logging on every startup

// Enable Reanimated layout animations
import { UIManager } from 'react-native';
if (UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Set up error handling
setupErrorHandling();

// Enable screens optimization
enableScreens();

// Create query client with optimized config for faster startup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Reduce retries for faster failure handling
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes - keep data longer
      placeholderData: (previousData: unknown) => previousData || [],
      select: (data) => data || [],
      // Enable background refetch for better UX
      refetchOnWindowFocus: false,
      refetchOnMount: 'always',
    },
  },
});

function App() {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);
  const pendingSharedUrl = useRef<null | string>(null);

  useEffect(() => {
    // Initialize i18n in background, don't block UI
    setIsI18nInitialized(true); // Show UI immediately
    
    // Initialize i18n asynchronously
    initializeI18n().catch(error => {
      console.error('Failed to initialize i18n:', error);
      // Translations might not work but app will still function
    });
  }, []);

  const handleSharedUrl = (url: string) => {
    // Validate URL first
    if (!url?.startsWith('http')) {
      return;
    }
    
    // Check if user is authenticated
    const { initialized, isAuthenticated } = useAuthStore.getState();
    
    if (!initialized) {
      // Store the URL to process later when auth is initialized
      pendingSharedUrl.current = url;
      return;
    }
    
    if (!isAuthenticated) {
      // Store the URL to process after user logs in
      pendingSharedUrl.current = url;
      return;
    }
    
    // Navigate to Add screen with shared URL
    navigateToAddScreen(url);
  };

  // Check for shared content from iOS share extension
  const checkForSharedContent = async () => {
    try {
      if (!AppGroupsModule) {
        return;
      }

      const sharedData = await AppGroupsModule.getSharedContent();
      
      if (sharedData) {
        let url = '';
        if (sharedData.type === 'url') {
          url = sharedData.data;
        } else if (sharedData.type === 'text') {
          // Try to extract URL from text
          const urlMatch = sharedData.data.match(/https?:\/\/\S+/);
          if (urlMatch) {
            url = urlMatch[0];
          }
        }
        
        if (url) {
          handleSharedUrl(url);
        }
      }
    } catch (error) {
      console.error('📤 Error checking for shared content:', error);
    }
  };

  const navigateToAddScreen = (url: string) => {
    if (navigationRef.isReady()) {
      try {
        navigationRef.navigate('Main', {
          screen: 'Add',
          params: { sharedUrl: url }
        });
      } catch (error) {
        console.error('📤 Error navigating to Add screen:', error);
      }
    } else {
      // If navigation isn't ready, wait for it
      const unsubscribe = navigationRef.addListener('state', () => {
        try {
          navigationRef.navigate('Main', {
            screen: 'Add',
            params: { sharedUrl: url }
          });
          unsubscribe();
        } catch (error) {
          console.error('📤 Error in delayed navigation:', error);
        }
      });
    }
  };

  // Monitor auth state and process pending URL when user becomes authenticated
  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe((state) => {
      if (state.isAuthenticated && state.initialized) {
        // Process pending shared URL
        if (pendingSharedUrl.current) {
          navigateToAddScreen(pendingSharedUrl.current);
          pendingSharedUrl.current = null;
        }
        
        // The links will be prefetched automatically when the Links screen mounts
        // due to the optimized query configuration
      }
    });

    return unsubscribe;
  }, []);

  // Monitor app state changes and check for shared content
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // Check for shared content when app becomes active
        setTimeout(() => {
          checkForSharedContent();
        }, 300);
      }
    };

    // Delay shared content check to not block initial render
    setTimeout(checkForSharedContent, 1000);

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    return () => appStateSubscription?.remove();
  }, []);

  // Handle deep link URL scheme
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      if (url.startsWith('linklibrarymobile://')) {
        // Check for shared content when deep link is received
        setTimeout(() => {
          checkForSharedContent();
        }, 100);
      }
    };

    // Delay initial URL check to not block startup
    setTimeout(() => {
      Linking.getInitialURL().then(url => {
        if (url) {
          handleDeepLink(url);
        }
      });
    }, 500);

    // Handle URLs when app is already running
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => linkingSubscription?.remove();
  }, []);

  if (!isI18nInitialized) {
    return (
      <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
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
              {/* <ShareReceiver onUrl={handleSharedUrl} /> */}
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
