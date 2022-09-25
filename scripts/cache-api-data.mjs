import fs from 'fs';

import doFetchItems from '../src/features/items/do-fetch-items.js';

console.time('Caching API data');
try {
    const items = await doFetchItems('en', true);
    for (const item of items) {
        item.lastLowPrice = 0;
        item.avg24hPrice = 0;
        item.buyFor = item.buyFor.filter(buyFor => buyFor.vendor.normalizedName !== 'flea-market');
        item.sellFor = item.sellFor.filter(buyFor => buyFor.vendor.normalizedName !== 'flea-market');
        item.cached = true;
    }
    fs.writeFileSync('./src/data/items.json', JSON.stringify(items));
} catch (error) {
    console.log(error);
}
console.timeEnd('Caching API data');
