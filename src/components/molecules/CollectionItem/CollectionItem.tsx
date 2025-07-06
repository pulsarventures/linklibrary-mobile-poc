import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Collection } from '@/types/collection.types';
import type { RootStackParamList } from '../../../navigation/types';
import { IconByVariant } from '@/components/atoms';
import { useTheme } from '@/theme';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';

interface CollectionItemProps {
  collection: Collection;
  view: 'list';
  onAction: (action: string, id: number) => void;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CollectionItem({ collection, onAction }: CollectionItemProps) {
  const navigation = useNavigation<NavigationProp>();
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
    'worklet';
    runOnJS(onAction)(actionType, collection.id);
  };

  return (
    <AnimatedPressable
      style={[
        styles.container,
        { backgroundColor: colors.background.primary, borderColor: colors.border.primary },
        animatedStyle,
      ]}
      onPress={() => handlePress('VIEW')}
    >
      <View style={styles.content}>
        <IconByVariant
          name="library"
          size={24}
          color={colors.text.secondary}
          style={styles.icon}
        />
        <View style={styles.info}>
          <Text variant="body" weight="medium" style={[styles.title, { color: colors.text.primary }]} numberOfLines={1}>
            {collection.name}
          </Text>
          <Text variant="small" style={[styles.meta, { color: colors.text.secondary }]}>
            {collection.link_count || 0} links
          </Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            onPress={() => handlePress('DELETE')}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: pressed ? colors.background.secondary : 'transparent' },
            ]}
          >
            <IconByVariant name="trash" size={16} color={colors.error} />
          </Pressable>
        </View>
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