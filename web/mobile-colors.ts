// LinkLibrary Mobile App Color Constants
// Copy this to your React Native app

export const Colors = {
  // === PRIMARY BRAND COLORS ===
  accentOrange: '#F25D15',        // Main brand orange
  accentCerulean: '#236CE2',      // Brand blue  
  logoPink: '#E25C64',            // Brand pink
  
  // === LIGHT THEME ===
  light: {
    background: '#FFFFFF',         // Pure white
    foreground: '#0A0A0A',         // Near black
    card: '#FFFFFF',               // Card background
    cardForeground: '#0A0A0A',     // Card text
    primary: '#F25D15',            // Brand orange
    primaryForeground: '#FAFAFA',  // White text on orange
    secondary: '#F4F4F5',          // Light gray
    secondaryForeground: '#1A1A1A', // Dark text on light gray
    muted: '#F4F4F5',              // Muted background
    mutedForeground: '#71717A',    // Muted text
    accent: '#236CE2',             // Accent blue
    accentForeground: '#FAFAFA',   // White text on blue
    destructive: '#EF4444',        // Red for errors
    destructiveForeground: '#FAFAFA', // White text on red
    border: '#E4E4E7',             // Light border
    input: '#E4E4E7',              // Input border
    ring: '#F25D15',               // Focus ring (orange)
  },
  
  // === DARK THEME ===
  dark: {
    background: '#0C0A0F',         // Very dark blue
    foreground: '#F8FAFC',         // Near white
    card: '#0C0A0F',               // Dark card background
    cardForeground: '#F8FAFC',     // Light text on dark
    primary: '#FF6B35',            // Brighter orange for dark
    primaryForeground: '#1A1D29',  // Dark text on orange
    secondary: '#2D3748',          // Dark gray
    secondaryForeground: '#F8FAFC', // Light text
    muted: '#2D3748',              // Muted dark background
    mutedForeground: '#94A3B8',    // Muted light text
    accent: '#3B82F6',             // Brighter blue for dark
    accentForeground: '#1A1D29',   // Dark text on blue
    destructive: '#B91C1C',        // Darker red
    destructiveForeground: '#F8FAFC', // Light text
    border: '#2D3748',             // Dark border
    input: '#2D3748',              // Dark input border
    ring: '#FF6B35',               // Focus ring (brighter orange)
  },
  
  // === BUTTON SPECIFIC COLORS ===
  buttons: {
    primary: '#F25D15',            // Primary button (orange)
    primaryForeground: '#FFFFFF',  // White text
    primaryHover: '#E04A0A',       // Darker orange on hover
    primaryDark: '#FF6B35',        // Brighter orange for dark
    primaryForegroundDark: '#1A1D29', // Dark text
    
    // Sign In Button (Gradient: Blue to Orange)
    signInGradient: {
      start: '#236CE2',            // Blue start
      end: '#F25D15',              // Orange end
      hoverStart: '#1D4ED8',       // Darker blue
      hoverEnd: '#E04A0A',         // Darker orange
    },
    
    // Sign Up Button (Gradient: Purple to Blue)
    signUpGradient: {
      start: '#9333EA',            // Purple start
      end: '#236CE2',              // Blue end
      hoverStart: '#7C3AED',       // Darker purple
      hoverEnd: '#1D4ED8',         // Darker blue
    },
    
    // Add Link Button (Primary Orange)
    addLink: '#F25D15',            // Same as primary
    addLinkForeground: '#FFFFFF',  // White text
    addLinkHover: '#E04A0A',       // Darker orange
  },
  
  // === SEMANTIC COLORS ===
  semantic: {
    success: '#16A34A',            // Green
    successForeground: '#FAFAFA',  // White text
    warning: '#F59E0B',            // Yellow
    warningForeground: '#1A1A1A',  // Dark text
    info: '#0EA5E9',               // Light blue
    infoForeground: '#FAFAFA',     // White text
    error: '#EF4444',              // Red
    errorForeground: '#FAFAFA',    // White text
  },
  
  // === GRADIENTS ===
  gradients: {
    signIn: ['#236CE2', '#F25D15'],           // Blue to Orange
    signUp: ['#9333EA', '#236CE2'],           // Purple to Blue
    brand: ['#F25D15', '#E25C64', '#236CE2'], // Orange to Pink to Blue
  },
};

// === TYPOGRAPHY ===
export const Typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// === SPACING ===
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// === BORDER RADIUS ===
export const BorderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// === SHADOWS ===
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
};
