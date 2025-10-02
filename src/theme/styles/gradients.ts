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
    colors: ['#FFFFFF', '#F4F4F5'], // Web light gray
    end: { x: 0, y: 1 },
    start: { x: 0, y: 0 }
  },
  
  primary: {
    angle: 90,
    colors: ['#236CE2', '#F25D15'], // Web blue to orange gradient
    end: { x: 1, y: 0 },
    start: { x: 0, y: 0 }
  },
  
  primaryHover: {
    angle: 90,
    colors: ['#1D4ED8', '#E04A0A'], // Web darker blue to darker orange
    end: { x: 1, y: 0 },
    start: { x: 0, y: 0 }
  },
  
  // Web design system gradients
  signIn: {
    angle: 90,
    colors: ['#236CE2', '#F25D15'], // Blue to Orange
    end: { x: 1, y: 0 },
    start: { x: 0, y: 0 }
  },
  
  signUp: {
    angle: 90,
    colors: ['#9333EA', '#236CE2'], // Purple to Blue
    end: { x: 1, y: 0 },
    start: { x: 0, y: 0 }
  },
  
  brand: {
    angle: 90,
    colors: ['#F25D15', '#E25C64', '#236CE2'], // Orange to Pink to Blue
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
  
  // Override gradients for dark theme
  let colors = gradient.colors;
  if (gradientName === 'primary' && isDark) {
    colors = ['#3B82F6', '#FF6B35']; // Web brighter blue to brighter orange for dark
  } else if (gradientName === 'primary' && !isDark) {
    colors = ['#236CE2', '#F25D15']; // Web blue to orange for light
  } else if (gradientName === 'signIn' && isDark) {
    colors = ['#3B82F6', '#FF6B35']; // Web brighter colors for dark
  } else if (gradientName === 'signUp' && isDark) {
    colors = ['#7C3AED', '#3B82F6']; // Web darker purple to brighter blue for dark
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