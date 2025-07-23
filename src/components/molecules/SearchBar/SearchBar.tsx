import React from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme';
import { IconByVariant } from '@/components/atoms';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, onSubmit, placeholder = 'Search...' }: SearchBarProps) {
  const { colors, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: 16,
      marginVertical: 16,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#23242a' : colors.background.secondary,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border.primary,
      paddingHorizontal: 12,
      height: 44,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.text.primary,
      paddingVertical: 8,
      paddingLeft: 8,
    },
    searchIcon: {
      opacity: 0.6,
    },
    clearButton: {
      padding: 4,
      marginLeft: 4,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <IconByVariant
          name="search"
          size={20}
          color={colors.text.secondary}
          style={styles.searchIcon}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          style={styles.input}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value ? (
          <TouchableOpacity
            onPress={() => onChangeText('')}
            style={styles.clearButton}
          >
            <IconByVariant
              name="trash"
              size={16}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
} 