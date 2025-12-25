import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Lazy load translations for better bundle splitting
const loadTranslations = async (lang: string) => {
    switch (lang) {
        case 'th':
            return (await import('./locales/th.json')).default;
        case 'en':
        default:
            return (await import('./locales/en.json')).default;
    }
};

i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .use({
        type: 'backend',
        read: async (language: string, _namespace: string, callback: (err: Error | null, data?: object) => void) => {
            try {
                const translations = await loadTranslations(language);
                callback(null, translations);
            } catch (error) {
                callback(error as Error);
            }
        },
    })
    .init({
        lng: "th", // Default to Thai as per requirements
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        },
        react: {
            useSuspense: true
        }
    });

export default i18n;
