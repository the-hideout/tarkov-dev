import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
// import Backend from 'i18next-http-backend';

import translationEN from './translations/en/translation.json';
import translationDE from './translations/de/translation.json';
import translationRU from './translations/ru/translation.json';
// import translationIT from './translations/it/translation.json';
// import translationES from './translations/es/translation.json';
import translationFR from './translations/fr/translation.json';
// import translationJA from './translations/ja/translation.json';
import translationPL from './translations/pl/translation.json';
import translationPT from './translations/pt/translation.json';

import propertiesEN from './translations/en/properties.json';
import propertiesRU from './translations/ru/properties.json';
import propertiesPL from './translations/pl/properties.json';

import bossesEN from './translations/en/bosses.json';
import bossesRU from './translations/ru/bosses.json';
import bossesPL from './translations/pl/bosses.json';

import mapsEN from './translations/en/maps.json';
import mapsRU from './translations/ru/maps.json';

i18n
    // loads translations from your server
    // https://github.com/i18next/i18next-http-backend
    // .use(Backend)
    // detect user language
    // https://github.com/i18next/i18next-browser-languageDetector
    .use(LanguageDetector)
    // pass the i18n instance to react-i18next
    .use(initReactI18next)
    // init i18next with options
    // https://www.i18next.com/overview/configuration-options
    .init({
        // backend: {
        //     // for all available options read the backend's repository readme file
        //     loadPath: '/translations/{{lng}}/{{ns}}.json',
        //     addPath: '/translations/add/{{lng}}/{{ns}}.json'
        // },

        //debug: true,

        // the translations
        // (tip move them in a JSON file and import them,
        // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
        resources: {
            en: {
                translation: translationEN,
                properties: propertiesEN,
                bosses: bossesEN,
                maps: mapsEN,
            },
            de: {
                translation: translationDE,
            },
            ru: {
                translation: translationRU,
                properties: propertiesRU,
                bosses: bossesRU,
                maps: mapsRU,
            },
            // it: {
            //     translation: translationIT,
            // },
            // es: {
            //     translation: translationES,
            // },
            fr: {
                translation: translationFR,
            },
            // ja: {
            //     translation: translationJA,
            // },
            pl: {
                translation: translationPL,
                properties: propertiesPL,
                bosses: bossesPL,
            },
            pt: {
                translation: translationPT,
            },
        },

        // lng: "en", // if you're using a language detector, do not define the lng option
        fallbackLng: 'en',
        load: 'languageOnly',

        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
    });

export default i18n;
