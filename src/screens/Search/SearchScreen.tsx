import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import { IconByVariant } from '@/components/atoms';
import { SafeScreen } from '@/components/templates';

export default function SearchScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    searchBar: {
      backgroundColor: colors.background.secondary,
      borderColor: colors.border.primary,
      borderRadius: 12,
      borderWidth: 1,
      color: colors.text.primary,
      fontSize: 16,
      height: 50,
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    searchButton: {
      alignItems: 'center',
      backgroundColor: colors.accent.primary,
      borderRadius: 12,
      height: 50,
      justifyContent: 'center',
      marginBottom: 24,
    },
    searchButtonText: {
      color: colors.text.inverse,
      fontSize: 16,
      fontWeight: '600',
    },
    searchContainer: {
      marginBottom: 24,
    },
    title: {
      color: colors.text.primary,
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 24,
      textAlign: 'center',
    },
  });

  return (
    <SafeScreen>
      <View style={styles.container}>
        <Text style={styles.title}>Search Links</Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            placeholder="Search your links..."
            placeholderTextColor={colors.text.tertiary}
            returnKeyType="search"
            style={styles.searchBar}
            value={searchQuery}
          />
          
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeScreen>
  );
}