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
    title: 'Oops! Something went wrong.',
    description: 'We are sorry for the inconvenience. Please try again later.',
    cta: 'Reload the screen',
  };

  // Try to get translations, fall back to default text if not available
  const title = t('error_boundary.title', { defaultValue: fallbackTexts.title });
  const description = t('error_boundary.description', { defaultValue: fallbackTexts.description });
  const ctaText = t('error_boundary.cta', { defaultValue: fallbackTexts.cta });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      gap: 16,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text.primary,
    },
    description: {
      fontSize: 12,
      textAlign: 'center',
      color: colors.text.primary,
    },
    cta: {
      fontSize: 16,
      color: colors.text.primary,
    },
  });

  return (
    <View style={styles.container}>
      <IconByVariant
        size={42}
        name="fire"
        color={colors.error}
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
