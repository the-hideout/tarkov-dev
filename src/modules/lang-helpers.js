// Helper function to convert an i18n language to a two digit language code
import i18n from '../i18n';

export async function langCode() {
    // Get the user selected language
    var language = i18n.language;

    // Convert to two digit language code
    if (language === 'en-US') {
        language = 'en';
    }

    return language;
};
