import { PRIMARY_COLORS } from './colors';
import { SPACING } from './spacing';
import { TYPOGRAPHY } from './typography';

export const COMPONENTS = {
  button: {
    base: {
      alignItems: 'center',
      borderRadius: 12,
      flexDirection: 'row',
      height: 48,
      justifyContent: 'center',
      paddingHorizontal: SPACING.xl,
    },
    variants: {
      primary: {
        backgroundColor: PRIMARY_COLORS.primary,
        backgroundGradient: PRIMARY_COLORS.primaryGradient,
      },
      social: {
        backgroundColor: PRIMARY_COLORS.social.google.background,
        borderColor: PRIMARY_COLORS.social.google.border,
        borderWidth: 1,
      }
    }
  },
  connectionStatus: {
    container: {
      alignItems: 'center',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderRadius: 8,
      flexDirection: 'row',
      marginBottom: SPACING.lg,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs
    },
    icon: {
      marginRight: SPACING.xs
    },
    text: {
      color: PRIMARY_COLORS.success,
      fontSize: TYPOGRAPHY.sizes.sm
    }
  },
  divider: {
    container: {
      alignItems: 'center',
      flexDirection: 'row',
      marginVertical: SPACING.xl
    },
    line: {
      backgroundColor: PRIMARY_COLORS.border,
      flex: 1,
      height: 1
    },
    text: {
      color: PRIMARY_COLORS.text.secondary,
      fontSize: TYPOGRAPHY.sizes.sm,
      marginHorizontal: SPACING.md
    }
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl
  },
  input: {
    container: {
      marginBottom: SPACING.md
    },
    field: {
      backgroundColor: PRIMARY_COLORS.surface,
      borderColor: PRIMARY_COLORS.border,
      borderRadius: 12,
      borderWidth: 1,
      color: PRIMARY_COLORS.text.primary,
      fontSize: TYPOGRAPHY.sizes.md,
      height: 48,
      paddingHorizontal: SPACING.md,
      paddingLeft: 48 // Space for icon
    },
    icon: {
      height: '100%',
      justifyContent: 'center',
      left: SPACING.md,
      position: 'absolute'
    },
    label: {
      color: PRIMARY_COLORS.text.primary,
      fontSize: TYPOGRAPHY.sizes.sm,
      fontWeight: TYPOGRAPHY.weights.medium,
      marginBottom: SPACING.sm
    }
  },
  screen: {
    backgroundColor: PRIMARY_COLORS.background,
    flex: 1,
    padding: SPACING.lg
  },
  socialButtons: {
    button: {
      flex: 1
    },
    container: {
      flexDirection: 'row',
      gap: SPACING.md
    }
  }
} as const;

export type Components = typeof COMPONENTS; 