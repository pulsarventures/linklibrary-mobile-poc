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
        // Just call initializeAuth - it handles the logout flag internally
        // Navigation happens automatically based on isAuthenticated state
        await initializeAuth();
      } catch (error) {
        console.error('Initialization error:', error);
        // Don't navigate manually - let the state drive navigation
      }
    };

    // Start initialization immediately
    initialize();
  }, []); // Only run on mount

  // Handle navigation after initialization
  useEffect(() => {
    if (initialized && !isLoading) {
      if (isAuthenticated) {
        navigation.replace(Paths.Main, { params: {}, screen: Paths.Links });
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
