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
import { navigationRef, Paths } from '@/navigation/paths';

const { AppGroupsModule } = NativeModules;
console.log('📤 🔍 All Native Modules:', Object.keys(NativeModules).sort());
console.log('📤 🔍 AppGroupsModule object:', AppGroupsModule);

// Enable Reanimated layout animations
import { UIManager } from 'react-native';
if (UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Set up error handling
setupErrorHandling();

// Enable screens optimization
enableScreens();

// Create query client with proper config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      placeholderData: (previousData: unknown) => previousData || [],
      select: (data) => data || [],
    },
  },
});

function App() {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);
  const pendingSharedUrl = useRef<null | string>(null);

  useEffect(() => {
    initializeI18n()
      .then(() => { setIsI18nInitialized(true); })
      .catch(error => {
        console.error('Failed to initialize i18n:', error);
        // Still set as initialized to not block the app, but translations might not work
        setIsI18nInitialized(true);
      });
  }, []);

  const handleSharedUrl = (url: string) => {
    console.log('📤 🎯 SHARE HANDLER CALLED! Received shared URL:', url);
    
    // Validate URL first
    if (!url?.startsWith('http')) {
      console.log('📤 Invalid URL received:', url);
      return;
    }
    
    // Check if user is authenticated
    const { initialized, isAuthenticated } = useAuthStore.getState();
    
    console.log('📤 Auth state - initialized:', initialized, 'authenticated:', isAuthenticated);
    
    if (!initialized) {
      // Store the URL to process later when auth is initialized
      pendingSharedUrl.current = url;
      console.log('📤 Auth not initialized, storing URL for later');
      return;
    }
    
    if (!isAuthenticated) {
      // Store the URL to process after user logs in
      pendingSharedUrl.current = url;
      console.log('📤 User not authenticated, storing URL for later');
      return;
    }
    
    // Navigate to Add screen with shared URL
    navigateToAddScreen(url);
  };

  // Check for shared content from iOS share extension
  const checkForSharedContent = async () => {
    console.log('📤 🔍 CHECKING FOR SHARED CONTENT - START');
    try {
      if (!AppGroupsModule) {
        console.log('📤 ❌ AppGroupsModule not available - native module missing!');
        return;
      }

      console.log('📤 ✅ AppGroupsModule available, calling getSharedContent...');
      const sharedData = await AppGroupsModule.getSharedContent();
      console.log('📤 📦 Raw shared data received:', JSON.stringify(sharedData, null, 2));
      
      if (sharedData) {
        console.log('📤 ✅ Found shared data from iOS share extension:', sharedData);
        
        let url = '';
        if (sharedData.type === 'url') {
          url = sharedData.data;
          console.log('📤 🔗 URL type data:', url);
        } else if (sharedData.type === 'text') {
          console.log('📤 📝 Text type data:', sharedData.data);
          // Try to extract URL from text
          const urlMatch = sharedData.data.match(/https?:\/\/\S+/);
          if (urlMatch) {
            url = urlMatch[0];
            console.log('📤 🔗 Extracted URL from text:', url);
          }
        }
        
        if (url) {
          console.log('📤 🎯 Final URL to process:', url);
          handleSharedUrl(url);
        } else {
          console.log('📤 ⚠️ No valid URL found in shared data');
        }
      } else {
        console.log('📤 ℹ️ No shared data found');
      }
    } catch (error) {
      console.error('📤 💥 Error checking for shared content:', error);
      console.error('📤 💥 Error details:', JSON.stringify(error, null, 2));
    }
    console.log('📤 🔍 CHECKING FOR SHARED CONTENT - END');
  };

  const navigateToAddScreen = (url: string) => {
    console.log('📤 🚀 NAVIGATION TO ADD SCREEN - START');
    console.log('📤 🎯 Target URL:', url);
    
    if (navigationRef.isReady()) {
      console.log('📤 ✅ Navigation is ready, navigating immediately...');
      try {
        // Navigate to the Main navigator with Add screen params
        navigationRef.navigate('Main', {
          screen: 'Add',
          params: { sharedUrl: url }
        });
        console.log('📤 ✅ Successfully navigated to Add screen with URL');
      } catch (error) {
        console.error('📤 💥 Error navigating to Add screen:', error);
        console.error('📤 💥 Navigation error details:', JSON.stringify(error, null, 2));
      }
    } else {
      console.log('📤 ⏳ Navigation not ready, setting up listener...');
      // If navigation isn't ready, wait for it
      const unsubscribe = navigationRef.addListener('state', () => {
        console.log('📤 🔄 Navigation state changed, attempting delayed navigation...');
        try {
          navigationRef.navigate('Main', {
            screen: 'Add',
            params: { sharedUrl: url }
          });
          console.log('📤 ✅ Successfully navigated to Add screen with URL (delayed)');
          unsubscribe();
        } catch (error) {
          console.error('📤 💥 Error in delayed navigation:', error);
          console.error('📤 💥 Delayed navigation error details:', JSON.stringify(error, null, 2));
        }
      });
    }
    console.log('📤 🚀 NAVIGATION TO ADD SCREEN - END');
  };

  // Monitor auth state and process pending URL when user becomes authenticated
  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe((state) => {
      if (state.isAuthenticated && state.initialized && pendingSharedUrl.current) {
        console.log('📤 User authenticated, processing pending URL:', pendingSharedUrl.current);
        navigateToAddScreen(pendingSharedUrl.current);
        pendingSharedUrl.current = null;
      }
    });

    return unsubscribe;
  }, []);

  // Monitor app state changes and check for shared content
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      console.log('📤 App state changed to:', nextAppState);
      if (nextAppState === 'active') {
        // Check for shared content when app becomes active
        setTimeout(() => {
          checkForSharedContent();
        }, 300);
      }
    };

    // Check for shared content on app launch
    checkForSharedContent();

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    return () => appStateSubscription?.remove();
  }, []);

  // Handle deep link URL scheme
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log('📤 Received deep link:', url);
      if (url.startsWith('linklibrarymobile://')) {
        // Check for shared content when deep link is received
        setTimeout(() => {
          checkForSharedContent();
        }, 100);
      }
    };

    // Handle initial URL (when app is launched from deep link)
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink(url);
      }
    });

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
