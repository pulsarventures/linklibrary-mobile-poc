import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme, ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT_COLORS, DARK_COLORS } from '../styles/colors';
import type { ThemeColors } from '../types/theme';
import { storageService } from '@/services/storage';
import layout from '../layout';

export type ColorTheme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  theme: ColorTheme;
  toggleTheme: () => void;
  setTheme: (theme: ColorTheme) => void;
  layout: typeof layout;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: LIGHT_COLORS,
  isDark: false,
  theme: 'system',
  toggleTheme: () => {},
  setTheme: () => {},
  layout,
});

const THEME_STORAGE_KEY = '@theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setThemeState] = useState<ColorTheme>('light');

  useEffect(() => {
    const initTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme) {
          setThemeState(savedTheme as ColorTheme);
        }
      } catch (error: unknown) {
        console.warn('Failed to load theme from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initTheme();
  }, []);

  // Determine if dark mode should be active based on theme setting and system preference
  const isDark = theme === 'dark';

  useEffect(() => {
    // Save theme changes to storage
    AsyncStorage.setItem(THEME_STORAGE_KEY, theme).catch((error: unknown) => {
      console.warn('Failed to save theme to storage:', error);
    });
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setThemeState(newTheme);
  };

  const setTheme = (newTheme: ColorTheme) => {
    setThemeState(newTheme);
  };

  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        colors,
        isDark,
        theme,
        toggleTheme,
        setTheme,
        layout,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
