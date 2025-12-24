
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import th from './locales/th.json';

const resources = {
    en: {
        translation: en
    },
    th: {
        translation: th
    }
};

i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
        resources,
        lng: "th", // Default to Thai as per requirements
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
