import { ViewStyle } from 'react-native';

export type GradientConfig = {
  angle: number;
  colors: string[];
  end: { x: number; y: number };
  start: { x: number; y: number };
}

export const GRADIENTS = {
  apple: {
    angle: 180,
    colors: ['#000000', '#1F2937'],
    end: { x: 0, y: 1 },
    start: { x: 0, y: 0 }
  },
  
  disabled: {
    angle: 90,
    colors: ['#64748B', '#475569'],
    end: { x: 1, y: 0 },
    start: { x: 0, y: 0 }
  },
  
  google: {
    angle: 180,
    colors: ['#FFFFFF', '#F9FAFB'],
    end: { x: 0, y: 1 },
    start: { x: 0, y: 0 }
  },
  
  primary: {
    angle: 90,
    colors: ['#000000', '#374151'],
    end: { x: 1, y: 0 },
    start: { x: 0, y: 0 }
  },
  
  primaryHover: {
    angle: 90,
    colors: ['#1a1a1a', '#4B5563'],
    end: { x: 1, y: 0 },
    start: { x: 0, y: 0 }
  }
};

export const createGradientStyle = (gradientName: keyof typeof GRADIENTS, isDark?: boolean): {
  colors: string[];
  end: { x: number; y: number };
  start: { x: number; y: number };
  style: ViewStyle;
} => {
  const gradient = GRADIENTS[gradientName];
  
  // Override primary gradient for dark theme
  let colors = gradient.colors;
  if (gradientName === 'primary' && isDark) {
    colors = ['#6b7280', '#4b5563']; // Gray gradient for dark mode
  } else if (gradientName === 'primary' && !isDark) {
    colors = ['#000000', '#374151']; // Keep black gradient for light mode
  }
  
  return {
    colors,
    end: gradient.end,
    start: gradient.start,
    style: {
      borderRadius: 12,
      flex: 1,
    }
  };
}; 