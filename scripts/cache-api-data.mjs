import fs from 'fs';

import doFetchItems from '../src/features/items/do-fetch-items.js';
import doFetchBarters from '../src/features/barters/do-fetch-barters.js';
import doFetchCrafts from '../src/features/crafts/do-fetch-crafts.js';
import doFetchTraders from '../src/features/traders/do-fetch-traders.js';
import doFetchMaps from '../src/features/maps/do-fetch-maps.js';

console.time('Caching API data');
try {
    const itemsPromise = doFetchItems('en', true).then(items => {
        for (const item of items) {
            item.lastLowPrice = 0;
            item.avg24hPrice = 0;
            item.buyFor = item.buyFor.filter(buyFor => buyFor.vendor.normalizedName !== 'flea-market');
            item.sellFor = item.sellFor.filter(buyFor => buyFor.vendor.normalizedName !== 'flea-market');
            item.cached = true;
        }
        fs.writeFileSync('./src/data/items.json', JSON.stringify(items));
    });

    const bartersPromise = doFetchBarters('en').then(barters => {
        for (const barter of barters) {
            barter.rewardItems.forEach(containedItem => {
                const item = containedItem.item;
                item.lastLowPrice = 0;
                item.avg24hPrice = 0;
                item.buyFor = item.buyFor.filter(buyFor => buyFor.vendor.normalizedName !== 'flea-market');
                item.sellFor = item.sellFor.filter(buyFor => buyFor.vendor.normalizedName !== 'flea-market');
                item.cached = true;
            });
            barter.requiredItems.forEach(containedItem => {
                const item = containedItem.item;
                item.lastLowPrice = 0;
                item.avg24hPrice = 0;
                item.buyFor = item.buyFor.filter(buyFor => buyFor.vendor.normalizedName !== 'flea-market');
                item.sellFor = item.sellFor.filter(buyFor => buyFor.vendor.normalizedName !== 'flea-market');
                item.cached = true;
            });
            barter.cached = true;
        }
        fs.writeFileSync('./src/data/barters.json', JSON.stringify(barters));
    });

    const craftsPromise = doFetchCrafts('en').then(crafts => {
        for (const craft of crafts) {
            craft.rewardItems.forEach(containedItem => {
                const item = containedItem.item;
                item.lastLowPrice = 0;
                item.avg24hPrice = 0;
                item.buyFor = item.buyFor.filter(buyFor => buyFor.vendor.normalizedName !== 'flea-market');
                item.sellFor = item.sellFor.filter(buyFor => buyFor.vendor.normalizedName !== 'flea-market');
                item.cached = true;
            });
            craft.requiredItems.forEach(containedItem => {
                const item = containedItem.item;
                item.lastLowPrice = 0;
                item.avg24hPrice = 0;
                item.buyFor = item.buyFor.filter(buyFor => buyFor.vendor.normalizedName !== 'flea-market');
                item.sellFor = item.sellFor.filter(buyFor => buyFor.vendor.normalizedName !== 'flea-market');
                item.cached = true;
            });
            craft.cached = true;
        }
        fs.writeFileSync('./src/data/crafts.json', JSON.stringify(crafts));
    });

    const tradersPromise = doFetchTraders('en').then(traders => {
        fs.writeFileSync('./src/data/traders.json', JSON.stringify(traders));
    });

    const mapsPromise = doFetchMaps('en').then(maps => {
        fs.writeFileSync('./src/data/maps_cached.json', JSON.stringify(maps));
    });

    await Promise.all([itemsPromise, bartersPromise, craftsPromise, tradersPromise, mapsPromise]);
} catch (error) {
    console.log(error);
}
console.timeEnd('Caching API data');
