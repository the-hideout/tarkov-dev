import fs from "fs";
import path from "path";
import fetch from "cross-fetch";
import url from "url";

import maps from "../src/data/maps.json" assert { type: "json" };
import categoryPages from "../src/data/category-pages.json" assert { type: "json" };

import { caliberArrayWithSplit } from "../src/modules/format-ammo.mjs";

const standardPaths = [
    '',
    '/ammo',
    '/barters',
    '/hideout-profit',
    '/loot-tier',
    '/trader/prapor',
    '/trader/therapist',
    '/trader/skier',
    '/trader/fence',
    '/trader/peacekeeper',
    '/trader/mechanic',
    '/trader/ragman',
    '/trader/jaeger',
    '/trader/lightkeeper',
    '/wipe-length',
    '/bitcoin-farm-calculator',
];

const standardPathsWeekly = [
    '/about',
    '/api',
    '/api-users',
    '/control',
    '/items',
    '/maps',
    '/moobot',
    '/nightbot',
    '/settings',
    '/streamelements',
    '/traders',
    '/bosses',
    '/tasks',
    '/hideout',
];

const addPath = (sitemap, url, change = 'hourly') => {
    return `${sitemap}
    <url>
        <loc>https://tarkov.dev${url}</loc>
        <changefreq>${change}</changefreq>
    </url>`;
};

const graphqlRequest = (queryString) => {
    return fetch('https://api.tarkov.dev/graphql', {
        method: 'POST',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({
            query: queryString
        }),
    }).then(response => response.json());
};

(async () => {
    try {
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        console.time('build-sitemap');

        for (const path of standardPaths) {
            sitemap = addPath(sitemap, path);
        }

        for (const path of standardPathsWeekly) {
            sitemap = addPath(sitemap, path, 'weekly');
        }

        for (const mapsGroup of maps) {
            for (const map of mapsGroup.maps) {
                sitemap = addPath(sitemap, `/map/${map.key}`, 'weekly');
            }
        }

        const itemCategories = await graphqlRequest('{itemCategories{normalizedName}}');
        for (const itemCategory of itemCategories.data.itemCategories) {
            sitemap = addPath(sitemap, `/items/${itemCategory.normalizedName}`);
        }

        for (const categoryPage of categoryPages) {
            sitemap = addPath(sitemap, `/items/${categoryPage.key}`);
        }

        const allItems = await graphqlRequest('{items{normalizedName}}');
        for (const item of allItems.data.items) {
            sitemap = addPath(sitemap, `/item/${item.normalizedName}`);
        }

        const allBosses = await graphqlRequest('{bosses{normalizedName}}');
        for (const boss of allBosses.data.bosses) {
            sitemap = addPath(sitemap, `/boss/${boss.normalizedName}`);
        }

        const allTasks = await graphqlRequest('{tasks{normalizedName}}');
        for (const task of allTasks.data.tasks) {
            sitemap = addPath(sitemap, `/task/${task.normalizedName}`, 'weekly');
        }

        const ammoTypes = caliberArrayWithSplit();
        for (const ammoType of ammoTypes) {
            sitemap = addPath(sitemap, `/ammo/${ammoType.replace(/ /g, '%20')}`);
        }

        sitemap = `${sitemap}
</urlset>`;
        const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
        fs.writeFileSync(path.join(__dirname, '..', 'public', 'sitemap.xml'), sitemap);
        console.timeEnd('build-sitemap');
    }
    catch (error) {
        console.error(error);
        console.log('trying to use pre-built sitemap (offline mode?)');
    }
})();
