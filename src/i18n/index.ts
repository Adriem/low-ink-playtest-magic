import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';

/**
 * The texts of the app, by language: English only, for now. Imported once,
 * before the app renders, so components can use `useTranslation`, and code
 * outside them `i18n.t`.
 */
void i18n.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: 'en',
  fallbackLng: 'en',
  // React already escapes what it renders
  interpolation: { escapeValue: false },
  // The texts are bundled, so they're ready as soon as it's set up
  initAsync: false,
});

export default i18n;
