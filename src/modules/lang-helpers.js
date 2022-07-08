// Helper function to convert an i18n language to a two digit language code
import i18n from '../i18n';

export async function langCode() {
    // Convert to two digit language code
    return i18n.language.replace(/-[a-zA-Z]{2}/, "");
};
