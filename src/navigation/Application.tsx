import { NativeModules } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// import { useCreateLink } from '@/hooks/api/useLinks';
import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { useTheme } from '@/theme';

import { Landing, Login, SignUp, Startup } from '@/screens';

import { navigationRef as navigationReference, Paths } from './paths';
import TabNavigator from './TabNavigator';
import { RootStackParamList } from './types';
// import { useCollectionsStore } from '@/hooks/domain/collections/useCollectionsStore';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// import { LinksApiService } from '@/services/links-api.service';
// const { AppGroupsModule } = NativeModules;

const Stack = createNativeStackNavigator<RootStackParamList>();

function Application() {
  const { colors, isDark } = useTheme();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialized = useAuthStore((state) => state.initialized);
  const isLoading = useAuthStore((state) => state.isLoading);
  // const createLinkMutation = useCreateLink();
  // useEffect(() => {
  //   checkForSharedContent();
  // }, []);

  // const checkForSharedContent = async () => {
  //   try {
  //     if (!AppGroupsModule) {
  //       if (__DEV__) {
  //         console.log('NO AppGroupsModule - iOS share extension not available');
  //       }
  //       return;
  //     }

  //     if (__DEV__) {
  //       console.log('Calling AppGroupsModule.getSharedContent()');
  //     }
  //     const sharedData = await AppGroupsModule.getSharedContent();
  //     if (__DEV__) {
  //       console.log('Shared data received:', JSON.stringify(sharedData));
  //     }

  //     if (sharedData) {
  //       let url = '';
  //       if (sharedData.type === 'url') {
  //         url = sharedData.data;
  //       } else if (sharedData.type === 'text') {
  //         // Try to extract URL from text
  //         const urlMatch = sharedData.data.match(/https?:\/\/\S+/);
  //         if (urlMatch) {
  //           url = urlMatch[0];
  //         }
  //       }

  //       if (url) {
  //         if (__DEV__) {
  //           console.log('Found URL to share:', url);
  //         }
  //         if (sharedData.isFromAction == true) {
  //           console.log(
  //             '+++++++++++++++++++++++++++++++++ isfrom action',
  //             sharedData.isFromAction,
  //           );

  //           const metadata = await LinksApiService.extractMetadata(url);
  //           console.log('Extracted metadata from API:', metadata);
  //           const truncatedSummary = metadata.summary
  //             ? metadata.summary.length > 1000
  //               ? metadata.summary.substring(0, 997) + '...'
  //               : metadata.summary
  //             : '';

  //           const value = await AsyncStorage.getItem('default_collection_id');

  //           console.log('default_collection_id++++++++  ', value); // string | null

  //           const value_token = await AsyncStorage.getItem('@auth_tokens');

  //           console.log('value_token++++++++  ', value_token);

  //           // collectionLoad();

  //           // void fetchCollections();
  //           // console.log('collections', collections);

  //           // const defaultCol = collections.find(
  //           //   (c) => c.name.toLowerCase() === 'default',
  //           // );
  //           // console.log('defaultCol', defaultCol);
  //           const testData = {
  //             collection_id: value,
  //             is_favorite: false,
  //             notes: '',
  //             summary: truncatedSummary,
  //             tag_ids: [],
  //             title: metadata.title,
  //             url: url,
  //           };
  //           try {
  //             console.log(
  //               '🧪 Calling createLinkMutation.mutateAsync with:',
  //               testData,
  //             );
  //             const result = await createLinkMutation.mutateAsync(testData);
  //             console.log('🧪 ✅ Create link successful:', result);
  //           } catch (error) {
  //             console.error('🧪 ❌ Create link failed:', error);
  //           }
  //         }
  //         // handleSharedUrl(url);
  //         // Clear the shared data after processing
  //         AppGroupsModule.clearSharedContent?.().catch((error: any) => {
  //           if (__DEV__) {
  //             console.log('🔴🔴🔴 Error clearing shared content:', error);
  //           }
  //         });
  //       } else {
  //         if (__DEV__) {
  //           console.log('🔴🔴🔴 No URL found in shared data');
  //         }
  //       }
  //     } else {
  //       if (__DEV__) {
  //         console.log('🔴🔴🔴 No shared data available');
  //       }
  //     }
  //   } catch (error) {
  //     console.error('🔴🔴🔴 Error checking for shared content:', error);
  //   }
  // };

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background.primary,
      border: colors.border.primary,
      card: colors.background.secondary,
      notification: colors.error,
      primary: colors.accent.primary,
      text: colors.text.primary,
    },
    dark: isDark,
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationReference} theme={navigationTheme}>
        <Stack.Navigator
          screenOptions={{
            animation: 'fade',
            animationDuration: 200,
            headerShown: false,
          }}
        >
          {!initialized || isLoading ? (
            <Stack.Screen
              component={Startup}
              name={Paths.Startup}
              options={{
                animation: 'none',
              }}
            />
          ) : isAuthenticated ? (
            <Stack.Screen
              component={TabNavigator}
              name={Paths.Main}
              options={{
                animation: 'fade',
                animationDuration: 300,
              }}
            />
          ) : (
            <>
              <Stack.Screen
                component={Login}
                name={Paths.Login}
                options={{
                  animation: 'fade',
                }}
              />
              <Stack.Screen
                component={SignUp}
                name={Paths.SignUp}
                options={{
                  animation: 'slide_from_right',
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default Application;
