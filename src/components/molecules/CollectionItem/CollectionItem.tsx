import type { RootStackParamList } from '../../../navigation/types';
import type { Collection } from '@/types/collection.types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { 
  runOnJS, 
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { useTheme } from '@/theme';

import { IconByVariant } from '@/components/atoms';
import { Text } from '@/components/ui/Text';

type CollectionItemProps = {
  readonly collection: Collection;
  readonly onAction: (action: string, id: number) => void;
  readonly view: 'list';
}

type NavigationProperty = NativeStackNavigationProp<RootStackParamList>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CollectionItem({ collection, onAction }: CollectionItemProps) {
  const navigation = useNavigation<NavigationProperty>();
  const { colors } = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        {
          scale: withSpring(1, {
            damping: 15,
            stiffness: 150,
          }),
        },
      ],
    };
  });

  const handlePress = (actionType: string) => {
    onAction(actionType, collection.id);
  };

  return (
    <AnimatedPressable
      onPress={() => { handlePress('VIEW'); }}
      style={[
        styles.container,
        { backgroundColor: colors.background.primary, borderColor: colors.border.primary },
        animatedStyle,
      ]}
    >
      <View style={styles.content}>
        <IconByVariant
          color={colors.text.secondary}
          name="library"
          size={24}
          style={styles.icon}
        />
        <View style={styles.info}>
          <Text numberOfLines={1} style={[styles.title, { color: colors.text.primary }]} variant="body" weight="medium">
            {collection.name}
          </Text>
          <Text style={[styles.meta, { color: colors.text.secondary }]} variant="small">
            {collection.link_count || 0} links
          </Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            onPress={() => { handlePress('EDIT'); }}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: pressed ? colors.background.secondary : 'transparent' },
            ]}
          >
            <IconByVariant color={colors.text.secondary} name="edit" size={16} />
          </Pressable>
          <Pressable
            onPress={() => { handlePress('DELETE'); }}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: pressed ? colors.background.secondary : 'transparent' },
            ]}
          >
            <IconByVariant color={colors.error} name="trash" size={16} />
          </Pressable>
        </View>
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