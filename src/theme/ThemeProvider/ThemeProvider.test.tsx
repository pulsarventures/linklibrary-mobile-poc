import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemeProvider, useTheme } from '@/theme';

function TestChildComponent() {
  const { changeTheme, variant } = useTheme();
  return (
    <View>
      <Text testID="theme-variant">{variant}</Text>
      <Button
        onPress={() => {
          changeTheme('dark');
        }}
        testID="change-btn"
        title="button"
      />
    </View>
  );
}

describe('ThemeProvider', () => {
  let storage: any;

  beforeEach(() => {
    storage = {
      set: jest.fn(),
      getString: jest.fn(),
      delete: jest.fn(),
      clearAll: jest.fn(),
    };
  });

  it('initializes with the default theme when no theme is defined in storage', () => {
    render(
      <ThemeProvider storage={storage}>
        <TestChildComponent />
      </ThemeProvider>,
    );
    // Assert that the theme context is initialized with 'default'
    expect(screen.getByText('default')).toBeTruthy();
  });

  it('loads the theme from storage if defined', async () => {
    storage.getString.mockResolvedValue('dark');

    render(
      <ThemeProvider storage={storage}>
        <TestChildComponent />
      </ThemeProvider>,
    );

    // Assert that the theme context is initialized with 'dark'
    expect(screen.getByText('dark')).toBeTruthy();
  });

  it('changes the theme when calling changeTheme', () => {
    render(
      <ThemeProvider storage={storage}>
        <TestChildComponent />
      </ThemeProvider>,
    );

    // Assert that the theme context is initialized with 'default'
    expect(screen.getByText('default')).toBeTruthy();
    fireEvent.press(screen.getByTestId('change-btn'));

    // Assert that the theme has changed to 'light'
    expect(screen.getByText('dark')).toBeTruthy();
  });
});
