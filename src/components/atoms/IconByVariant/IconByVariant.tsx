import type { ColorValue } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import React from 'react';

import { IconName, icons } from '@/theme/assets/icons';

type Properties = {
  readonly color?: ColorValue;
  readonly name: IconName;
  readonly size?: number;
} & Omit<SvgProps, 'color' | 'height' | 'width'>;

const IconByVariant: React.FC<Properties> = ({ color, name, size = 24, ...props }) => {
  const Icon = icons[name];

  if (!Icon) {
    console.error(`Icon not found: ${name}`);
    return null;
  }

  return <Icon color={color} height={size} width={size} {...props} />;
};

export default IconByVariant;
