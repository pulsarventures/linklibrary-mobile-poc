import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider/ThemeProvider';
import type { Tag } from '@/types/tag.types';
import { SPACING } from '@/theme/styles/spacing';
import { IconByVariant } from '@/components/atoms';
import Animated from 'react-native-reanimated';

interface TagItemProps {
  tag: Tag;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(TouchableOpacity);

export function TagItem({ tag, onPress, onEdit, onDelete }: TagItemProps) {
  const { colors } = useTheme();

  return (
    <AnimatedPressable
      style={[
        styles.container,
        { backgroundColor: colors.background.primary, borderColor: colors.border.primary },
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <IconByVariant
          name="hash"
          size={24}
          color={colors.text.secondary}
          style={styles.icon}
        />
        <View style={styles.info}>
          <Text variant="body" weight="medium" style={[styles.title, { color: colors.text.primary }]}>
            {tag.name}
          </Text>
          <Text variant="small" style={[styles.meta, { color: colors.text.secondary }]}>
            {tag.link_count} links
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: 'transparent' }]}
            onPress={onEdit}
          >
            <IconByVariant name="edit" size={16} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: 'transparent' }]}
            onPress={onDelete}
          >
            <IconByVariant name="trash" size={16} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
    width: 24,
    height: 24,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
}); 