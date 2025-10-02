import { getCategories, getIconsByCategory, IconOption } from '@/utils/icon-options';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';
import { SPACING } from '@/theme/styles/spacing';

import { IconByVariant } from '@/components/atoms';

type IconPickerProps = {
  readonly onIconSelect?: (icon: IconOption) => void;
  readonly selectedIcon?: string;
  readonly showCategories?: boolean;
}

export function IconPicker({ 
  onIconSelect, 
  selectedIcon, 
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
      {showCategories ? <View style={styles.categoryContainer}>
          <ScrollView 
            contentContainerStyle={styles.categoryScroll} 
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => { handleCategoryPress(category); }}
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
        </View> : null}

      {/* Icon Grid */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.iconScroll}
      >
        <View style={styles.iconGrid}>
          {iconsInCategory.map((icon) => (
            <TouchableOpacity
              key={icon.label}
              onPress={() => { handleIconPress(icon); }}
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
                color={selectedIcon === icon.label ? colors.text.inverse : icon.color || colors.text.primary}
                name={icon.icon}
                size={24}
              />
              <Text
                numberOfLines={1}
                style={[
                  styles.iconLabel,
                  { 
                    color: selectedIcon === icon.label 
                      ? colors.text.inverse 
                      : colors.text.secondary 
                  }
                ]}
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
  categoryButton: {
    borderRadius: 8,
    borderWidth: 1,
    marginRight: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  categoryContainer: {
    marginBottom: SPACING.md,
  },
  categoryScroll: {
    paddingHorizontal: SPACING.md,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  container: {
    flex: 1,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 80,
    justifyContent: 'center',
    padding: SPACING.sm,
    width: 80,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  iconLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  iconScroll: {
    flex: 1,
  },
}); 