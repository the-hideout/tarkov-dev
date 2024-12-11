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
    //text: '🌟 Flea market scanners are currently being leveled, and data for the {{patchVersion}} patch should be appearing soon! 🌟 If you enjoy using tarkov.dev, please consider donating to help keep it running. All donations go directly towards server costs and operational expenses. This banner will only be up for a week. Thank you! ❤️',
    //text: '🌟 Flea market scanners have been leveled, and flea market prices are being updated for patch {{patchVersion}}! 🌟 If you enjoy using tarkov.dev, please consider donating to help keep it running. All donations go directly towards server costs and operational expenses. This banner will only be up for a week. Thank you! ❤️',
    text: 'We want to keep Tarkov.dev and its API free for all and without ads, but we\'ve been struggling with increased expenses. If you enjoy using tarkov.dev, please consider donating to help keep it running. All donations go directly towards server costs and operational expenses. Thank you! ❤️',
    textVariables: {patchVersion: '0.15.0'},
    linkEnabled: true,
    linkText: 'Donate',
    link: 'https://opencollective.com/tarkov-dev',

    // when a banner with a specific key is hidden, it never shows for that user again
    // (unless they clear their browser cache)
    // use a different key to force new banners to display again
    bannerKey: 'alertBanner-0.15.0-funding'
}

export default alertConfig
