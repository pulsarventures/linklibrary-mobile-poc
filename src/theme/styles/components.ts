import { PRIMARY_COLORS } from './colors';
import { SPACING } from './spacing';
import { TYPOGRAPHY } from './typography';

export const COMPONENTS = {
  button: {
    base: {
      height: 48,
      borderRadius: 12,
      paddingHorizontal: SPACING.xl,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    variants: {
      primary: {
        backgroundColor: PRIMARY_COLORS.primary,
        backgroundGradient: PRIMARY_COLORS.primaryGradient,
      },
      social: {
        backgroundColor: PRIMARY_COLORS.social.google.background,
        borderWidth: 1,
        borderColor: PRIMARY_COLORS.social.google.border,
      }
    }
  },
  input: {
    container: {
      marginBottom: SPACING.md
    },
    label: {
      fontSize: TYPOGRAPHY.sizes.sm,
      fontWeight: TYPOGRAPHY.weights.medium,
      color: PRIMARY_COLORS.text.primary,
      marginBottom: SPACING.sm
    },
    field: {
      backgroundColor: PRIMARY_COLORS.surface,
      borderColor: PRIMARY_COLORS.border,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: SPACING.md,
      paddingLeft: 48, // Space for icon
      height: 48,
      color: PRIMARY_COLORS.text.primary,
      fontSize: TYPOGRAPHY.sizes.md
    },
    icon: {
      position: 'absolute',
      left: SPACING.md,
      height: '100%',
      justifyContent: 'center'
    }
  },
  screen: {
    backgroundColor: PRIMARY_COLORS.background,
    flex: 1,
    padding: SPACING.lg
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl
  },
  divider: {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: SPACING.xl
    },
    line: {
      flex: 1,
      height: 1,
      backgroundColor: PRIMARY_COLORS.border
    },
    text: {
      marginHorizontal: SPACING.md,
      color: PRIMARY_COLORS.text.secondary,
      fontSize: TYPOGRAPHY.sizes.sm
    }
  },
  socialButtons: {
    container: {
      flexDirection: 'row',
      gap: SPACING.md
    },
    button: {
      flex: 1
    }
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl
  },
  connectionStatus: {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.md,
      borderRadius: 8,
      marginBottom: SPACING.lg
    },
    icon: {
      marginRight: SPACING.xs
    },
    text: {
      fontSize: TYPOGRAPHY.sizes.sm,
      color: PRIMARY_COLORS.success
    }
  }
} as const;

export type Components = typeof COMPONENTS; 