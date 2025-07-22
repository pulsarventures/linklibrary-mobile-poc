import type { Tag } from '@/types/tag.types';

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { SPACING } from '@/theme/styles/spacing';
import { useTheme } from '@/theme/ThemeProvider/ThemeProvider';

import { IconByVariant } from '@/components/atoms';
import { Text } from '@/components/ui/Text';

type TagItemProps = {
  readonly onDelete?: () => void;
  readonly onEdit?: () => void;
  readonly onPress?: () => void;
  readonly tag: Tag;
}

const AnimatedPressable = Animated.createAnimatedComponent(TouchableOpacity);

export function TagItem({ onDelete, onEdit, onPress, tag }: TagItemProps) {
  const { colors } = useTheme();

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: colors.background.primary, borderColor: colors.border.primary },
      ]}
    >
      <View style={styles.content}>
        <IconByVariant
          color={colors.text.secondary}
          name="hash"
          size={24}
          style={styles.icon}
        />
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text.primary }]} variant="body" weight="medium">
            {tag.name}
          </Text>
          <Text style={[styles.meta, { color: colors.text.secondary }]} variant="small">
            {tag.link_count} links
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {onEdit ? <TouchableOpacity
            onPress={onEdit}
            style={[styles.actionButton, { backgroundColor: 'transparent' }]}
          >
            <IconByVariant color={colors.text.secondary} name="edit" size={16} />
          </TouchableOpacity> : null}
        {onDelete ? <TouchableOpacity
            onPress={onDelete}
            style={[styles.actionButton, { backgroundColor: 'transparent' }]}
          >
            <IconByVariant color={colors.error} name="trash" size={16} />
          </TouchableOpacity> : null}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    borderRadius: 8,
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  container: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 16,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  icon: {
    height: 24,
    marginRight: 12,
    width: 24,
  },
  info: {
    flex: 1,
  },
  meta: {
    fontSize: 13,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 