// Helper function to convert an i18n language to a two digit language code
import { useEffect, useCallback, useState } from 'react';

import i18n from '../i18n.js';
import languages from '../data/supported-languages.json';

function validateLangCode(lng) {
    // Convert to two character language code
    const langFmt = lng.replace(/-[a-zA-Z]{2}/, "");

    // Check if the language is supported
    if (languages.includes(langFmt)) {
        return langFmt;
    } else {
        // If the language is not supported, fall back to en
        return 'en';
    }
}

export function langCode() {
    if (!i18n.isInitialized) {
        //console.log('i18n still not ready');
        return 'en';
    }

    // Convert to two digit language code
    const langFmt = i18n.language.replace(/-[a-zA-Z]{2}/, "");

    // Check if the language is supported
    if (languages.includes(langFmt)) {
        return langFmt;
    } else {
        // If the language is not supported, fall back to en
        return 'en';
    }
};

export const on = i18n.on;

export const off = i18n.off;

export function useLangCode() {
    const [lang, setLang] = useState(langCode());

    const eventListener = useCallback((lng) => {
        setLang(validateLangCode(lng));
    }, [setLang]);

    useEffect(() => {
        i18n.on('languageChanged', eventListener);
        return () => i18n.off('languageChanged', eventListener);
    }, [eventListener]);

    return lang;
}
