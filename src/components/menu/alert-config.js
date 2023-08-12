const alertConfig = {
    // set this bool if the site alert should be enabled or not
    alertEnabled: true,

    // valid alert colors
    alertColors: {
        error: '#D3302F',
        info: '#0088D1',
        success: '#378E3C',
        warning: '#F57D01',
    },

    // set this variable to the severity of the alert banner
    alertLevel: 'info',

    // The text to display in the alert banner
    text: '🌟 Flea market scanners have been leveled and flea market prices are being updated for patch 0.13.5! 🌟 If you enjoy using tarkov.dev, please consider donating to help keep it running. All donations go directly towards server costs and operational expenses. This banner will only be up for a week. Thank you! ❤️',

    linkEnabled: true,
    linkText: 'Donate',
    link: 'https://opencollective.com/tarkov-dev',

    // when a banner with a specific key is hidden, it never shows for that user again
    // (unless they clear their browser cache)
    // use a different key to force new banners to display again
    bannerKey: 'alertBanner-0.13.5'
}

export default alertConfig
