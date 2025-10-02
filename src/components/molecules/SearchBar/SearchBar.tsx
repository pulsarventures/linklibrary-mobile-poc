import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import { IconByVariant } from '@/components/atoms';

type SearchBarProps = {
  readonly onChangeText: (text: string) => void;
  readonly onSubmit?: () => void;
  readonly placeholder?: string;
  readonly value: string;
}

export function SearchBar({ onChangeText, onSubmit, placeholder = 'Search...', value }: SearchBarProps) {
  const { colors, isDark } = useTheme();

  const styles = StyleSheet.create({
    clearButton: {
      marginLeft: 4,
      padding: 4,
    },
    container: {
      marginHorizontal: 16,
      marginVertical: 16,
    },
    input: {
      color: colors.text.primary,
      flex: 1,
      fontSize: 16,
      paddingLeft: 8,
      paddingVertical: 8,
    },
    searchContainer: {
      alignItems: 'center',
      backgroundColor: isDark ? '#23242a' : colors.background.secondary,
      borderColor: colors.border.primary,
      borderRadius: 12,
      borderWidth: 1,
      flexDirection: 'row',
      height: 44,
      paddingHorizontal: 12,
    },
    searchIcon: {
      opacity: 0.6,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <IconByVariant
          color={colors.text.secondary}
          name="search"
          size={20}
          style={styles.searchIcon}
        />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          returnKeyType="search"
          style={styles.input}
          value={value}
        />
        {value ? (
          <TouchableOpacity
            onPress={() => { onChangeText(''); }}
            style={styles.clearButton}
          >
            <IconByVariant
              color={colors.text.secondary}
              name="trash"
              size={16}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
} 