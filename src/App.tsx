import 'react-native-gesture-handler';

import * as Keychain from 'react-native-keychain';

import ShareReceiver from '@/share/ShareReceiver'; // Android share handling
import { setupErrorHandling } from '@/utils/errorHandler';
import './utils/clearLogoutFlagNow'; // Import for global debugging utilities
import i18n from 'i18next';
import React, { useEffect, useRef, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';
import { AppState, Linking, NativeModules } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import Toast from 'react-native-toast-message';
import {
  getToastConfig,
  getText1Style,
  getText2Style,
} from '@/utils/toastConfig';

import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { useBackgroundDataLoader } from '@/hooks/useBackgroundDataLoader';
import ApplicationNavigator from '@/navigation/Application';
import { navigationRef } from '@/navigation/paths';
import { storageService } from '@/services/storage';
import { ThemeProvider } from '@/theme';
import { initializeI18n } from '@/translations';

import { useCollectionsStore } from './hooks/domain/collections/useCollectionsStore';

import { ErrorBoundary } from '@/components/organisms';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { LinksApiService } from '@/services/links-api.service';
import { useCreateLink } from '@/hooks/api/useLinks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
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
      gcTime: 30 * 60 * 1000, // 30 minutes - keep data longer
      placeholderData: (previousData: unknown) => previousData || [],
      retry: 1, // Reduce retries for faster failure handling
      select: (data) => data || [],
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Enable background refetch for better UX
      refetchOnMount: 'always',
      refetchOnWindowFocus: false,
    },
  },
});

// Component that uses QueryClient hooks - must be inside QueryClientProvider
function App() {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);
  const pendingSharedUrl = useRef<null | string>(null);
  const { isAuthenticated } = useAuthStore();
  const createLinkMutation = useCreateLink();
  const {
    collections,
    createCollection,
    deleteCollection,
    error,
    fetchCollections,
    loading,
    updateCollection,
  } = useCollectionsStore();

  useEffect(() => {
    if (isAuthenticated) {
      console.log('isAuthenticated: Fetching collections...');
      fetchCollections();
    }
  });
  console.log('collectionLoad------->>>>', collections);
  useEffect(() => {
    const saveDefaultCollection = async () => {
      if (!collections || collections.length === 0) return;

      const defaultCol = collections.find(
        (c) => c.name?.toLowerCase() === 'default',
      );

      console.log('defaultCol', defaultCol);

      const value_token = await AsyncStorage.getItem('@auth_tokens');

      console.log('value_token++++++++  ', value_token);
      let accessToken: string | null = null;

      if (value_token) {
        const tokenObj = JSON.parse(value_token);
        accessToken = tokenObj.access_token;
      }

      console.log('accessToken:', accessToken);
      if (defaultCol?.id) {
        await AsyncStorage.setItem(
          'default_collection_id',
          String(defaultCol.id),
        );
      }
    };

    saveDefaultCollection();
  }, [collections]);
  useEffect(() => {
    // Initialize i18n in background, don't block UI
    setIsI18nInitialized(true); // Show UI immediately

    // Initialize i18n asynchronously
    initializeI18n().catch((error) => {
      console.error('Failed to initialize i18n:', error);
      // Translations might not work but app will still function
    });
  }, []);

  // FIX: Clear stuck logout flag on app startup ONLY if valid tokens exist
  useEffect(() => {
    const clearStuckLogoutFlag = async () => {
      try {
        // Add timeout to prevent app freeze if storage is slow
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Logout flag check timeout')),
            3000,
          ),
        );

        const checkPromise = (async () => {
          const hasLoggedOut = await AsyncStorage.getItem('@has_logged_out');
          if (hasLoggedOut === 'true') {
            // Check if there are valid tokens before clearing the logout flag
            const accessToken = await storageService.getAccessToken();
            const refreshToken = await storageService.getRefreshToken();
            const isAccessTokenValid =
              await storageService.isAccessTokenValid();

            if (accessToken && refreshToken && isAccessTokenValid) {
              console.log(
                '🔧 FIXING STUCK LOGOUT FLAG - Valid tokens found, clearing logout flag',
              );
              await AsyncStorage.removeItem('@has_logged_out');
              console.log('✅ Stuck logout flag cleared successfully');
            } else {
              console.log(
                '🔒 LOGOUT FLAG PRESERVED - No valid tokens found, keeping user logged out',
              );

              // If we're supposed to be logged out but Google thinks we're signed in, clear Google state
              try {
                const { hasPreviousSignIn } = await import(
                  '@/services/auth/googleAuth'
                );
                const isGoogleSignedIn = await hasPreviousSignIn();
                if (isGoogleSignedIn) {
                  console.log(
                    '🔐 Clearing Google sign-in state due to logout flag',
                  );
                  const { signOutFromGoogle } = await import(
                    '@/services/auth/googleAuth'
                  );
                  await signOutFromGoogle();
                }
              } catch (googleError) {
                console.log('⚠️ Could not clear Google state:', googleError);
              }
            }
          }
        })();

        await Promise.race([checkPromise, timeoutPromise]);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === 'Logout flag check timeout'
        ) {
          console.warn(
            '⚠️ Logout flag check timed out - continuing app startup',
          );
        } else {
          console.error('Failed to clear stuck logout flag:', error);
        }
      }
    };

    clearStuckLogoutFlag();
  }, []);

  // Share handling functions - these don't need QueryClient
  const handleSharedUrl = (url: string) => {
    if (__DEV__) {
      console.log('🔴🔴🔴 handleSharedUrl called with:', url);
    }

    // Validate URL first
    if (!url.startsWith('http')) {
      if (__DEV__) {
        console.log('🔴🔴🔴 Invalid URL, not http/https');
      }
      return;
    }

    // Check if user is authenticated
    const { initialized, isAuthenticated } = useAuthStore.getState();
    if (__DEV__) {
      console.log('🔴🔴🔴 Auth state:', { initialized, isAuthenticated });
    }

    if (!initialized) {
      // Store the URL to process later when auth is initialized
      if (__DEV__) {
        console.log('🔴🔴🔴 Auth not initialized, storing URL for later');
      }
      pendingSharedUrl.current = url;
      return;
    }

    if (!isAuthenticated) {
      // Store the URL to process after user logs in
      if (__DEV__) {
        console.log('🔴🔴🔴 User not authenticated, storing URL for later');
      }
      pendingSharedUrl.current = url;
      return;
    }

    // Navigate to Add screen with shared URL
    if (__DEV__) {
      console.log('🔴🔴🔴 All checks passed, navigating to Add screen');
    }
    navigateToAddScreen(url);
  };

  const collectionLoad = () => {
    console.log('collectionLoad------->>>>', collections);
  };

  // Check for shared content from iOS share extension
  const checkForSharedContent = async () => {
    if (__DEV__) {
      console.log('🔴🔴🔴 checkForSharedContent called');
    }
    try {
      if (!AppGroupsModule) {
        if (__DEV__) {
          console.log(
            '🔴🔴🔴 NO AppGroupsModule - iOS share extension not available',
          );
        }
        return;
      }

      if (__DEV__) {
        console.log('🔴🔴🔴 Calling AppGroupsModule.getSharedContent()');
      }
      const sharedData = await AppGroupsModule.getSharedContent();
      if (__DEV__) {
        console.log('🔴🔴🔴 Shared data received:', JSON.stringify(sharedData));
      }

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
          if (__DEV__) {
            console.log('🔴🔴🔴 Found URL to share:', url);
          }
          if (sharedData.isFromAction == true) {
            console.log(
              '+++++++++++++++++++++++++++++++++ isfrom action',
              sharedData.isFromAction,
            );
            const metadata = await LinksApiService.extractMetadata(url);
            console.log('Extracted metadata from API:', metadata);
            const truncatedSummary = metadata.summary
              ? metadata.summary.length > 1000
                ? metadata.summary.substring(0, 997) + '...'
                : metadata.summary
              : '';
            const value = await AsyncStorage.getItem('default_collection_id');
            console.log('default_collection_id++++++++  ', value); // string | null
            const value_token = await AsyncStorage.getItem('@auth_tokens');
            console.log('value_token++++++++  ', value_token);
            const testData = {
              collection_id: value,
              is_favorite: false,
              notes: metadata.notes,
              summary: truncatedSummary,
              tag_ids: [],
              title: metadata.title,
              url: url,
            };
            try {
              console.log(
                '🧪 Calling createLinkMutation.mutateAsync with:',
                testData,
              );
              const result = await createLinkMutation.mutateAsync(testData);
              console.log('🧪 ✅ Create link successful:', result);
            } catch (error) {
              console.error('🧪 ❌ Create link failed:', error);
            }
          } else {
            handleSharedUrl(url);
          }
          // handleSharedUrl(url);
          // Clear the shared data after processing
          AppGroupsModule.clearSharedContent?.().catch((error: any) => {
            if (__DEV__) {
              console.log('🔴🔴🔴 Error clearing shared content:', error);
            }
          });
        } else {
          if (__DEV__) {
            console.log('🔴🔴🔴 No URL found in shared data');
          }
        }
      } else {
        if (__DEV__) {
          console.log('🔴🔴🔴 No shared data available');
        }
      }
    } catch (error) {
      console.error('🔴🔴🔴 Error checking for shared content:', error);
    }
  };

  const navigateToAddScreen = (url: string) => {
    if (__DEV__) {
      console.log('🔴🔴🔴 navigateToAddScreen called with URL:', url);
      console.log('🔴🔴🔴 Navigation ready?', navigationRef.isReady());
    }

    // Check if user is authenticated
    const { initialized, isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated || !initialized) {
      if (__DEV__) {
        console.log('🔴🔴🔴 User not authenticated, saving URL for later');
      }
      pendingSharedUrl.current = url;
      return;
    }

    if (navigationRef.isReady()) {
      try {
        if (__DEV__) {
          console.log('🔴🔴🔴 Executing navigation to Main > Add');
        }
        navigationRef.navigate('Main', {
          params: { sharedUrl: url },
          screen: 'Add',
        });
        if (__DEV__) {
          console.log('🔴🔴🔴 Navigation command completed');
        }
      } catch (error) {
        console.error('🔴🔴🔴 Error navigating to Add screen:', error);
        // Fallback: try direct navigation to Add
        try {
          (navigationRef as any).navigate('Add', { sharedUrl: url });
        } catch (fallbackError) {
          console.error(
            '🔴🔴🔴 Fallback navigation also failed:',
            fallbackError,
          );
        }
      }
    } else {
      if (__DEV__) {
        console.log('🔴🔴🔴 Navigation not ready, setting up listener');
      }
      // If navigation isn't ready, wait for it
      const unsubscribe = navigationRef.addListener('state', () => {
        // Re-check authentication before navigating
        const { isAuthenticated: isAuth } = useAuthStore.getState();
        if (!isAuth) {
          if (__DEV__) {
            console.log(
              '🔴🔴🔴 User not authenticated in listener, saving URL',
            );
          }
          pendingSharedUrl.current = url;
          unsubscribe();
          return;
        }

        try {
          navigationRef.navigate('Main', {
            params: { sharedUrl: url },
            screen: 'Add',
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
      if (
        state.isAuthenticated &&
        state.initialized && // Process pending shared URL
        pendingSharedUrl.current
      ) {
        navigateToAddScreen(pendingSharedUrl.current);
        pendingSharedUrl.current = null;
      }
    });

    return unsubscribe;
  }, []);

  // Monitor app state changes and check for shared content
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        if (__DEV__) {
          console.log('🔴🔴🔴 App became active, checking for shared content');
        }
        // Check for shared content when app becomes active
        // Only check once to avoid performance issues
        setTimeout(() => checkForSharedContent(), 500);
      }
    };

    // Check for shared content on mount with single attempt
    if (__DEV__) {
      console.log('🔴🔴🔴 App mounted, starting share content checks');
      console.log('helloooooooooooooooo testing');

      // const loadCollection = async () => {
      //   try {
      //     console.log('loadCollection. called');

      //     const collections = await fetchCollections()
      //       .then((res) => {
      //         console.log('res', res);
      //       })
      //       .catch((error) => {
      //         console.log('fetchCollections Error ->', error);
      //       });
      //     console.log('collections', collections);
      //   } catch (error) {
      //     console.log('collections error', error);
      //   }
      // };
      // loadCollection();
    }
    setTimeout(() => checkForSharedContent(), 1000);

    // TEST: Save test data and then read it (DISABLED - only for testing)
    // setTimeout(async () => {
    //   console.log('🔴🔴🔴 TEST: Saving test data to App Group');
    //   try {
    //     await AppGroupsModule.testSaveSharedContent();
    //     console.log('🔴🔴🔴 TEST: Test data saved, now reading it');
    //     setTimeout(() => checkForSharedContent(), 100);
    //   } catch (error) {
    //     console.error('🔴🔴🔴 TEST: Failed to save test data:', error);
    //   }
    // }, 3000);

    const appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => {
      appStateSubscription.remove();
    };
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
      Linking.getInitialURL().then((url) => {
        if (url) {
          handleDeepLink(url);
        }
      });
    }, 500);

    // Handle URLs when app is already running
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      linkingSubscription.remove();
    };
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

function AppContent() {
  // Initialize background data loading for better UX
  useBackgroundDataLoader();

  return (
    <>
      <ApplicationNavigator />
      <Toast
        config={{
          success: (props) => (
            <View style={getToastConfig().success(props)}>
              <Text style={getText1Style()}>{props.text1}</Text>
              <Text style={getText2Style()}>{props.text2}</Text>
            </View>
          ),
          error: (props) => (
            <View style={getToastConfig().error(props)}>
              <Text style={getText1Style()}>{props.text1}</Text>
              <Text style={getText2Style()}>{props.text2}</Text>
            </View>
          ),
          info: (props) => (
            <View style={getToastConfig().info(props)}>
              <Text style={getText1Style()}>{props.text1}</Text>
              <Text style={getText2Style()}>{props.text2}</Text>
            </View>
          ),
          warning: (props) => (
            <View style={getToastConfig().warning(props)}>
              <Text style={getText1Style()}>{props.text1}</Text>
              <Text style={getText2Style()}>{props.text2}</Text>
            </View>
          ),
        }}
      />
    </>
  );
}

export default App;
