import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
// import Backend from 'i18next-http-backend';

import translationEN from './translations/en/translation.json' assert { type: "json" };
import translationDE from './translations/de/translation.json' assert { type: "json" };
import translationRU from './translations/ru/translation.json' assert { type: "json" };
import translationIT from './translations/it/translation.json' assert { type: "json" };
// import translationES from './translations/es/translation.json' assert { type: "json" };
import translationFR from './translations/fr/translation.json' assert { type: "json" };
import translationJA from './translations/ja/translation.json' assert { type: "json" };
import translationPL from './translations/pl/translation.json' assert { type: "json" };
import translationPT from './translations/pt/translation.json' assert { type: "json" };

import propertiesEN from './translations/en/properties.json' assert { type: "json" };
import propertiesDE from './translations/de/properties.json' assert { type: "json" };
import propertiesRU from './translations/ru/properties.json' assert { type: "json" };
import propertiesIT from './translations/it/properties.json' assert { type: "json" };
import propertiesJA from './translations/ja/properties.json' assert { type: "json" };
import propertiesPL from './translations/pl/properties.json' assert { type: "json" };
import propertiesPT from './translations/pt/properties.json' assert { type: "json" };

import bossesEN from './translations/en/bosses.json' assert { type: "json" };
import bossesDE from './translations/de/bosses.json' assert { type: "json" };
import bossesRU from './translations/ru/bosses.json' assert { type: "json" };
import bossesIT from './translations/it/bosses.json' assert { type: "json" };
import bossesJA from './translations/ja/bosses.json' assert { type: "json" };
import bossesPL from './translations/pl/bosses.json' assert { type: "json" };
import bossesPT from './translations/pt/bosses.json' assert { type: "json" };

import mapsEN from './translations/en/maps.json' assert { type: "json" };
import mapsDE from './translations/de/maps.json' assert { type: "json" };
import mapsRU from './translations/ru/maps.json' assert { type: "json" };
import mapsIT from './translations/it/maps.json' assert { type: "json" };
import mapsJA from './translations/ja/maps.json' assert { type: "json" };
import mapsPL from './translations/pl/maps.json' assert { type: "json" };
import mapsPT from './translations/pt/maps.json' assert { type: "json" };

// const myParseMissingKeyHandler = (key, defaultValue) => {
//     console.log(`Missing translation "${key}": "${key}"`)
// }

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

        // debug: true,
        // saveMissing: true,
        // parseMissingKeyHandler: myParseMissingKeyHandler,
        
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
                properties: propertiesDE,
                bosses: bossesDE,
                maps: mapsDE,
            },
            ru: {
                translation: translationRU,
                properties: propertiesRU,
                bosses: bossesRU,
                maps: mapsRU,
            },
            it: {
                translation: translationIT,
                properties: propertiesIT,
                bosses: bossesIT,
                maps: mapsIT,
            },
            // es: {
            //     translation: translationES,
            // },
            fr: {
                translation: translationFR,
            },
            ja: {
                translation: translationJA,
                properties: propertiesJA,
                bosses: bossesJA,
                maps: mapsJA,
            },
            pl: {
                translation: translationPL,
                properties: propertiesPL,
                bosses: bossesPL,
                maps: mapsPL,
            },
            pt: {
                translation: translationPT,
                properties: propertiesPT,
                bosses: bossesPT,
                maps: mapsPT,
            }

        },

        // lng: "en", // if you're using a language detector, do not define the lng option
        fallbackLng: 'en',
        load: 'languageOnly',

        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
    });

export default i18n;
