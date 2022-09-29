import cachedBarters from '../data/barters.json';
import cachedCrafts from '../data/crafts.json';

import cachedItems from '../data/items.json';
import cachedItemsLocale from '../data/items_locale.json';

import cachedMaps from '../data/maps_cached.json';

import cachedTraders from '../data/traders.json'
import cachedTradersLocale from '../data/traders_locale.json';

export function placeholderBarters(language = 'en') {
    return cachedBarters;
}

export function placeholderCrafts(language = 'en') {
    return cachedCrafts;
}

export function placeholderItems(language = 'en') {
    if (language !== 'en' && cachedItemsLocale[language]) {
        return cachedItems.map(item => {
            return {
                ...item,
                ...cachedItemsLocale[language][item.id]
            };
        });
    }
    return cachedItems;
}

export function placeholderMaps(language = 'en') {
    return cachedMaps;
}

export function placeholderTraders(language = 'en') {
    if (language !== 'en' && cachedTradersLocale[language]) {
        return cachedTraders.map(trader => {
            return {
                ...trader,
                ...cachedTradersLocale[language][trader.id]
            };
        });
    }
    return cachedTraders;
}