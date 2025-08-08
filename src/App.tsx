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
import ShareReceiver from '@/share/ShareReceiver'; // Android share handling
import { AppState, Linking, NativeModules } from 'react-native';

import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { navigationRef } from '@/navigation/paths';
import { useBackgroundDataLoader } from '@/hooks/useBackgroundDataLoader';

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
export const queryClient = new QueryClient({
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

// Component that uses QueryClient hooks - must be inside QueryClientProvider
function AppContent() {
  // Initialize background data loading for better UX
  useBackgroundDataLoader();

  return (
    <>
      <ApplicationNavigator />
      <Toast />
    </>
  );
}

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

  // Share handling functions - these don't need QueryClient
  const handleSharedUrl = (url: string) => {
    console.log('🔴🔴🔴 handleSharedUrl called with:', url);
    
    // Validate URL first
    if (!url?.startsWith('http')) {
      console.log('🔴🔴🔴 Invalid URL, not http/https');
      return;
    }
    
    // Check if user is authenticated
    const { initialized, isAuthenticated } = useAuthStore.getState();
    console.log('🔴🔴🔴 Auth state:', { initialized, isAuthenticated });
    
    if (!initialized) {
      // Store the URL to process later when auth is initialized
      console.log('🔴🔴🔴 Auth not initialized, storing URL for later');
      pendingSharedUrl.current = url;
      return;
    }
    
    if (!isAuthenticated) {
      // Store the URL to process after user logs in
      console.log('🔴🔴🔴 User not authenticated, storing URL for later');
      pendingSharedUrl.current = url;
      return;
    }
    
    // Navigate to Add screen with shared URL
    console.log('🔴🔴🔴 All checks passed, navigating to Add screen');
    navigateToAddScreen(url);
  };

  // Check for shared content from iOS share extension
  const checkForSharedContent = async () => {
    console.log('🔴🔴🔴 checkForSharedContent called');
    try {
      if (!AppGroupsModule) {
        console.log('🔴🔴🔴 NO AppGroupsModule - iOS share extension not available');
        return;
      }

      console.log('🔴🔴🔴 Calling AppGroupsModule.getSharedContent()');
      const sharedData = await AppGroupsModule.getSharedContent();
      console.log('🔴🔴🔴 Shared data received:', JSON.stringify(sharedData));
      
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
          console.log('🔴🔴🔴 Found URL to share:', url);
          handleSharedUrl(url);
          // Clear the shared data after processing
          AppGroupsModule.clearSharedContent?.().catch((err: any) => 
            console.log('🔴🔴🔴 Error clearing shared content:', err)
          );
        } else {
          console.log('🔴🔴🔴 No URL found in shared data');
        }
      } else {
        console.log('🔴🔴🔴 No shared data available');
      }
    } catch (error) {
      console.error('🔴🔴🔴 Error checking for shared content:', error);
    }
  };

  const navigateToAddScreen = (url: string) => {
    console.log('🔴🔴🔴 navigateToAddScreen called with URL:', url);
    console.log('🔴🔴🔴 Navigation ready?', navigationRef.isReady());
    
    if (navigationRef.isReady()) {
      try {
        console.log('🔴🔴🔴 Executing navigation to Main > Add');
        navigationRef.navigate('Main', {
          screen: 'Add',
          params: { sharedUrl: url }
        });
        console.log('🔴🔴🔴 Navigation command completed');
      } catch (error) {
        console.error('🔴🔴🔴 Error navigating to Add screen:', error);
        // Fallback: try direct navigation to Add
        try {
          (navigationRef as any).navigate('Add', { sharedUrl: url });
        } catch (fallbackError) {
          console.error('🔴🔴🔴 Fallback navigation also failed:', fallbackError);
        }
      }
    } else {
      console.log('🔴🔴🔴 Navigation not ready, setting up listener');
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
          // Fallback
          try {
            (navigationRef as any).navigate('Add', { sharedUrl: url });
          } catch (fallbackError) {
            console.error('📤 Fallback navigation also failed:', fallbackError);
          }
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
      }
    });

    return unsubscribe;
  }, []);

  // Monitor app state changes and check for shared content
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        console.log('🔴🔴🔴 App became active, checking for shared content');
        // Check for shared content when app becomes active
        // Try multiple times in case share extension is still saving
        setTimeout(() => checkForSharedContent(), 100);
        setTimeout(() => checkForSharedContent(), 500);
        setTimeout(() => checkForSharedContent(), 1000);
      }
    };

    // Check for shared content on mount with multiple attempts
    console.log('🔴🔴🔴 App mounted, starting share content checks');
    setTimeout(() => checkForSharedContent(), 500);
    setTimeout(() => checkForSharedContent(), 1000);
    setTimeout(() => checkForSharedContent(), 2000);
    
    // TEST: Save test data and then read it
    setTimeout(async () => {
      console.log('🔴🔴🔴 TEST: Saving test data to App Group');
      try {
        await AppGroupsModule.testSaveSharedContent();
        console.log('🔴🔴🔴 TEST: Test data saved, now reading it');
        setTimeout(() => checkForSharedContent(), 100);
      } catch (error) {
        console.error('🔴🔴🔴 TEST: Failed to save test data:', error);
      }
    }, 3000);

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
          <ShareReceiver onUrl={handleSharedUrl} />
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <AppContent />
            </ThemeProvider>
          </QueryClientProvider>
        </GestureHandlerRootView>
      </ErrorBoundary>
    </I18nextProvider>
  );
}

export default App;
