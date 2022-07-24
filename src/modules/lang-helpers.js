// Helper function to convert an i18n language to a two digit language code
import i18n from '../i18n';
import languages from '../data/supported-languages.json';

export async function langCode() {
    // Convert to two digit language code
    const langFmt = i18n.language.replace(/-[a-zA-Z]{2}/, '');

    // Check if the language is supported
    if (languages.includes(langFmt)) {
        return langFmt;
    } else {
        // If the language is not supported, fall back to en
        return 'en';
    }
}
