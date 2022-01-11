import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector'

import translationEN from './translations/en/translation.json';
import translationDE from './translations/de/translation.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: {
        en: {
            translation: translationEN,
        },
        de: {
            translation: translationDE,
        },
    },
    // lng: "en", // if you're using a language detector, do not define the lng option
    fallbackLng: "en",

    interpolation: {
        escapeValue: false
    }
});