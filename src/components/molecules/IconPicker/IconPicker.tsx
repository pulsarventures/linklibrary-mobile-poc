import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@/theme';
import { SPACING } from '@/theme/styles/spacing';
import { IconByVariant } from '@/components/atoms';
import { IconOption, getCategories, getIconsByCategory } from '@/utils/icon-options';

interface IconPickerProps {
  selectedIcon?: string;
  onIconSelect?: (icon: IconOption) => void;
  showCategories?: boolean;
}

export function IconPicker({ 
  selectedIcon, 
  onIconSelect, 
  showCategories = true 
}: IconPickerProps) {
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('Content & Media');
  
  const categories = getCategories();
  const iconsInCategory = getIconsByCategory(selectedCategory);

  const handleIconPress = (icon: IconOption) => {
    onIconSelect?.(icon);
  };

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <View style={styles.container}>
      {/* Category Selector */}
      {showCategories && (
        <View style={styles.categoryContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => handleCategoryPress(category)}
                style={[
                  styles.categoryButton,
                  { 
                    backgroundColor: selectedCategory === category 
                      ? colors.accent.primary 
                      : colors.background.subtle,
                    borderColor: colors.border.primary,
                  }
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    { 
                      color: selectedCategory === category 
                        ? colors.text.inverse 
                        : colors.text.secondary 
                    }
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Icon Grid */}
      <ScrollView 
        style={styles.iconScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconGrid}>
          {iconsInCategory.map((icon) => (
            <TouchableOpacity
              key={icon.label}
              onPress={() => handleIconPress(icon)}
              style={[
                styles.iconButton,
                { 
                  backgroundColor: selectedIcon === icon.label 
                    ? colors.accent.primary 
                    : colors.background.subtle,
                  borderColor: colors.border.primary,
                }
              ]}
            >
              <IconByVariant
                name={icon.icon}
                size={24}
                color={selectedIcon === icon.label ? colors.text.inverse : icon.color || colors.text.primary}
              />
              <Text
                style={[
                  styles.iconLabel,
                  { 
                    color: selectedIcon === icon.label 
                      ? colors.text.inverse 
                      : colors.text.secondary 
                  }
                ]}
                numberOfLines={1}
              >
                {icon.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoryContainer: {
    marginBottom: SPACING.md,
  },
  categoryScroll: {
    paddingHorizontal: SPACING.md,
  },
  categoryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: SPACING.sm,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  iconScroll: {
    flex: 1,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  iconButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.sm,
  },
  iconLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
}); 