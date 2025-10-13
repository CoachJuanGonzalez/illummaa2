import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import translationEN from './locales/en/translation.json';
import translationFR from './locales/fr-CA/translation.json';

// Translation resources
const resources = {
  en: {
    translation: translationEN
  },
  'fr-CA': {
    translation: translationFR
  },
  fr: {
    translation: translationFR // Fallback for generic 'fr' to Quebec French
  }
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'en', // Fallback language if detection fails
    supportedLngs: ['en', 'fr', 'fr-CA'], // Supported languages

    // Language detection options
    detection: {
      // Order of detection methods
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],

      // Keys to lookup language from
      lookupLocalStorage: 'i18nextLng',
      lookupFromPathIndex: 0,

      // Cache user language
      caches: ['localStorage'],

      // Only detect languages in supportedLngs
      checkWhitelist: true
    },

    interpolation: {
      escapeValue: false // React already escapes values
    },

    // Namespace configuration
    defaultNS: 'translation',
    ns: ['translation'],

    // React configuration
    react: {
      useSuspense: true,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p', 'span']
    },

    // Debug mode (set to false in production)
    debug: false,

    // Return empty string for missing keys instead of key name
    returnEmptyString: false,

    // Keyseparator (nested translations)
    keySeparator: '.',

    // Context separator
    contextSeparator: '_'
  });

export default i18n;
