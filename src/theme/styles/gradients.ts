import { ViewStyle } from 'react-native';

export interface GradientConfig {
  colors: string[];
  start: { x: number; y: number };
  end: { x: number; y: number };
  angle: number;
}

export const GRADIENTS = {
  primary: {
    colors: ['#000000', '#374151'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
    angle: 90
  },
  
  primaryHover: {
    colors: ['#1a1a1a', '#4B5563'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
    angle: 90
  },
  
  google: {
    colors: ['#FFFFFF', '#F9FAFB'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
    angle: 180
  },
  
  apple: {
    colors: ['#000000', '#1F2937'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
    angle: 180
  },
  
  disabled: {
    colors: ['#64748B', '#475569'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
    angle: 90
  }
};

export const createGradientStyle = (gradientName: keyof typeof GRADIENTS): {
  colors: string[];
  start: { x: number; y: number };
  end: { x: number; y: number };
  style: ViewStyle;
} => {
  const gradient = GRADIENTS[gradientName];
  return {
    colors: gradient.colors,
    start: gradient.start,
    end: gradient.end,
    style: {
      flex: 1,
      borderRadius: 12,
    }
  };
}; 