import React, { ReactNode } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  runOnJS,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import { IconByVariant } from '@/components/atoms';
import { useTheme } from '@/theme';

interface SwipeableCardProps {
  children: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  enabled?: boolean;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onEdit,
  onDelete,
  enabled = true,
}) => {
  const { colors } = useTheme();
  const swipeableRef = React.useRef<Swipeable>(null);

  const renderLeftActions = () => {
    if (!onEdit) return null;
    
    return (
      <Animated.View 
        entering={FadeIn}
        exiting={FadeOut}
        style={[styles.leftAction, { backgroundColor: colors.info }]}
      >
        <IconByVariant name="edit" size={24} color="#ffffff" />
        <Text style={styles.actionText}>Edit</Text>
      </Animated.View>
    );
  };

  const renderRightActions = () => {
    if (!onDelete) return null;
    
    return (
      <Animated.View 
        entering={FadeIn}
        exiting={FadeOut}
        style={[styles.rightAction, { backgroundColor: colors.error }]}
      >
        <IconByVariant name="trash" size={24} color="#ffffff" />
        <Text style={styles.actionText}>Delete</Text>
      </Animated.View>
    );
  };

  const handleSwipeLeft = () => {
    if (onDelete) {
      swipeableRef.current?.close();
      onDelete();
    }
  };

  const handleSwipeRight = () => {
    if (onEdit) {
      swipeableRef.current?.close();
      onEdit();
    }
  };

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableLeftOpen={handleSwipeRight}
      onSwipeableRightOpen={handleSwipeLeft}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
      leftThreshold={80}
      rightThreshold={80}
    >
      {children}
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  leftAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 8,
  },
  rightAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 8,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});