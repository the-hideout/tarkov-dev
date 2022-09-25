import fs from 'fs/promises';

import doFetchItems from '../src/features/items/do-fetch-items.mjs';

console.time('Caching API data');
try {
    const items = await doFetchItems('en', true);
    console.log(items.length);
    await fs.writeFile('./src/data/items.json', JSON.stringify(items));
} catch (error) {
    console.log(error);
}
console.timeEnd('Caching API data');

(async () => {
    
})();
