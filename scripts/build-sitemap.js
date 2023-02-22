const fs = require('fs');
const path = require('path');

const got = require('got');

const maps = require('../src/data/maps.json');
const categoryPages = require('../src/data/category-pages.json');
const { caliberArrayWithSplit } = require('../src/modules/format-ammo');

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
}

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

        const itemCategories = await got('https://api.tarkov.dev/graphql?query={itemCategories{normalizedName}}', {
            responseType: 'json',
        });
        for (const itemCategorie of itemCategories.body.data.itemCategories) {
            sitemap = addPath(sitemap, `/items/${itemCategorie.normalizedName}`);
        }

        for (const categoryPage of categoryPages) {
            sitemap = addPath(sitemap, `/items/${categoryPage.key}`);
        };

        const allItems = await got('https://api.tarkov.dev/graphql?query={items{normalizedName}}', {
            responseType: 'json',
        });
        for (const item of allItems.body.data.items) {
            sitemap = addPath(sitemap, `/item/${item.normalizedName}`);
        }

        const allBosses = await got('https://api.tarkov.dev/graphql?query={bosses{normalizedName}}', {
            responseType: 'json',
        });
        for (const boss of allBosses.body.data.bosses) {
            sitemap = addPath(sitemap, `/boss/${boss.normalizedName}`);
        }

        const allTasks = await got('https://api.tarkov.dev/graphql?query={tasks{normalizedName}}', {
            responseType: 'json',
        });
        for (const task of allTasks.body.data.tasks) {
            sitemap = addPath(sitemap, `/task/${task.normalizedName}`, 'weekly');
        }

        const ammoTypes = caliberArrayWithSplit();
        for (const ammoType of ammoTypes) {
            sitemap = addPath(sitemap, `/ammo/${ammoType.replace(/ /g, '%20')}`);
        }

        sitemap = `${sitemap}
</urlset>`;

        fs.writeFileSync(path.join(__dirname, '..', 'public', 'sitemap.xml'), sitemap);
        console.timeEnd('build-sitemap');
    } catch (error) {
        console.error(error)
        console.log('trying to use pre-built sitemap (offline mode?)')
    }
})();
