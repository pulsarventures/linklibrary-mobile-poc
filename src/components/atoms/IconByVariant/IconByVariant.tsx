import React from 'react';
import type { SvgProps } from 'react-native-svg';
import type { ColorValue } from 'react-native';
import { icons, IconName } from '@/theme/assets/icons';

type Properties = {
  readonly name: IconName;
  readonly size?: number;
  readonly color?: ColorValue;
} & Omit<SvgProps, 'color' | 'width' | 'height'>;

const IconByVariant: React.FC<Properties> = ({ name, size = 24, color, ...props }) => {
  const Icon = icons[name];

  if (!Icon) {
    console.error(`Icon not found: ${name}`);
    return null;
  }

  return <Icon width={size} height={size} color={color} {...props} />;
};

export default IconByVariant;
