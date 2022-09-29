import cachedBarters from '../data/barters.json';
import cachedCrafts from '../data/crafts.json';

import cachedItems from '../data/items.json';
import cachedItemsFr from '../data/items_fr.json';
import cachedItemsRu from '../data/items_ru.json';

import cachedMaps from '../data/maps_cached.json';

import cachedTraders from '../data/traders.json'
import cachedTradersFr from '../data/traders_fr.json';
import cachedTradersRu from '../data/traders_ru.json';

const itemLangs = {
    fr: cachedItemsFr,
    ru: cachedItemsRu,
};

const traderLangs = {
    fr: cachedTradersFr,
    ru: cachedTradersRu,
};

export function placeholderBarters(language = 'en') {
    return cachedBarters;
}

export function placeholderCrafts(language = 'en') {
    return cachedCrafts;
}

export function placeholderItems(language = 'en') {
    if (language !== 'en' && itemLangs[language]) {
        return cachedItems.map(item => {
            return {
                ...item,
                ...itemLangs[language][item.id]
            };
        });
    }
    return cachedItems;
}

export function placeholderMaps(language = 'en') {
    return cachedMaps;
}

export function placeholderTraders(language = 'en') {
    if (language !== 'en' && traderLangs[language]) {
        return cachedTraders.map(trader => {
            return {
                ...trader,
                ...traderLangs[language][trader.id]
            };
        });
    }
    return cachedTraders;
}