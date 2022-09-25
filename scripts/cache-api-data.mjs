import fs from 'fs/promises';
import path from 'path';

import doFetchItems from '../src/features/items/do-fetch-items.mjs';

(async () => {
    console.time('Caching API data');
    
    const items = await doFetchItems(true);

    await fs.writeFile('./public/data/item.json', JSON.stringify(items));
    console.timeEnd('Caching API data');
})();
