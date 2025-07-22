import 'intl-pluralrules';

import type { Language } from '@/hooks/language/schema';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en-EN.json';
import fr from './fr-FR.json';

export const defaultNS = 'linklibrary_mobile';

export const resources = {
  'en-EN': en,
  'fr-FR': fr,
} as const satisfies Record<Language, unknown>;

// Initialize i18n as a promise to ensure it's ready
export const initializeI18n = async () => {
  await i18n
    .use(initReactI18next)
    .init({
      defaultNS,
      fallbackLng: 'fr-FR',
      interpolation: {
        escapeValue: false,
      },
      lng: 'fr-FR',
      missingKeyHandler: (lng, ns, key) => {
        if (__DEV__) {
          console.warn(`Missing translation: ${key} (${lng}/${ns})`);
        }
      },
      resources,
      returnEmptyString: false, // Return key instead of empty string
      returnNull: false, // Return key instead of null when translation is missing
      saveMissing: true, // Log missing translations in development
    });

  // add capitalization formatter
  i18n.services.formatter?.add(
    'capitalize',
    (value: string) =>
      value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
  );

  return i18n;
};

export { default } from 'i18next';
