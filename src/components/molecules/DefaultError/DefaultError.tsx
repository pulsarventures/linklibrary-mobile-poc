import { useErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import { IconByVariant } from '@/components/atoms';

type Properties = {
  readonly onReset?: () => void;
};

function DefaultErrorScreen({ onReset = undefined }: Properties) {
  const { colors, layout } = useTheme();
  const { t } = useTranslation();
  const { resetBoundary } = useErrorBoundary();

  // Fallback texts in case translations are not available
  const fallbackTexts = {
    cta: 'Reload the screen',
    description: 'We are sorry for the inconvenience. Please try again later.',
    title: 'Oops! Something went wrong.',
  };

  // Try to get translations, fall back to default text if not available
  const title = t('error_boundary.title', { defaultValue: fallbackTexts.title });
  const description = t('error_boundary.description', { defaultValue: fallbackTexts.description });
  const ctaText = t('error_boundary.cta', { defaultValue: fallbackTexts.cta });

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      flex: 1,
      gap: 16,
      justifyContent: 'center',
      padding: 16,
    },
    cta: {
      color: colors.text.primary,
      fontSize: 16,
    },
    description: {
      color: colors.text.primary,
      fontSize: 12,
      textAlign: 'center',
    },
    title: {
      color: colors.text.primary,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.container}>
      <IconByVariant
        color={colors.error}
        name="fire"
        size={42}
      />
      <Text style={styles.title}>
        {title}
      </Text>
      <Text style={styles.description}>
        {description}
      </Text>

      {onReset ? (
        <TouchableOpacity
          onPress={() => {
            resetBoundary();
            onReset();
          }}
        >
          <Text style={styles.cta}>
            {ctaText}
          </Text>
        </TouchableOpacity>
      ) : undefined}
    </View>
  );
}

export default DefaultErrorScreen;
