import type { RootScreenProps } from '@/navigation/types';

import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { Paths } from '@/navigation/paths';
import { useTheme } from '@/theme';

import { AssetByVariant } from '@/components/atoms';
import { SafeScreen } from '@/components/templates';

function Startup({ navigation }: RootScreenProps<'Startup'>) {
  const { colors, layout } = useTheme();
  const { initializeAuth, initialized, isAuthenticated, isLoading } = useAuthStore();

  // Run initialization only once on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeAuth();
      } catch (error) {
        console.error('Initialization error:', error);
        // Even if initialization fails, we should mark it as initialized
        // to move past the splash screen
        navigation.replace(Paths.Login);
      }
    };

    initialize();
  }, []); // Only run on mount

  // Handle navigation after initialization
  useEffect(() => {
    if (initialized && !isLoading) {
      if (isAuthenticated) {
        navigation.replace(Paths.Main, { screen: Paths.Links, params: {} });
      } else {
        navigation.replace(Paths.Login);
      }
    }
  }, [initialized, isAuthenticated, isLoading, navigation]);

  return (
    <SafeScreen>
      <View
        style={[
          layout.flex_1,
          layout.col,
          layout.itemsCenter,
          layout.justifyCenter,
        ]}
      >
        <AssetByVariant
          path="tom"
          resizeMode="contain"
          style={{ height: 300, width: 300 }}
        />
        <ActivityIndicator 
          color={colors.accent.primary} 
          size="large" 
          style={{ marginTop: 24 }}
        />
      </View>
    </SafeScreen>
  );
}

export { Startup };
export default Startup;
