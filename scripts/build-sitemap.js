const fs = require('fs');
const path = require('path');

const got = require('got');

const maps = require('../src/data/maps.json');
const { caliberMap } = require('../src/modules/format-ammo');

const standardPaths = [
    '',
    '/about',
    '/stats',
    '/ammo',
    '/api',
    '/api-users',
    '/barters',
    '/control',
    '/hideout-profit',
    /// 'history-graphs',
    /// 'item-tracker',
    '/items',
    '/loot-tier',
    '/maps',
    '/moobot',
    '/nightbot',
    '/settings',
    '/streamelements',
    '/traders',
    '/traders/prapor',
    '/traders/therapist',
    '/traders/skier',
    '/traders/peacekeeper',
    '/traders/mechanic',
    '/traders/ragman',
    '/traders/jaeger',
];

const addPath = (sitemap, url) => {
    return `${sitemap}
    <url>
        <loc>https://tarkov.dev${url}</loc>
        <changefreq>hourly</changefreq>
    </url>`;
}

(async () => {
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    console.time('build-sitemap');

    for(const path of standardPaths){
        sitemap = addPath(sitemap, path);
    }

    for(const mapsGroup of maps){
        for(const map of mapsGroup.maps){
            sitemap = addPath(sitemap, `/map/${map.key}`);
        }
    }

    const itemTypes = await got('https://api.tarkov.dev/graphql?query={%20itemCategories{%20normalizedName%20}%20}', {
        responseType: 'json',
    });

    for (const itemType of itemTypes.body.data.itemCategories) {
        sitemap = addPath(sitemap, `/items/${itemType.normalizedName}`);
    }

    const allItems = await got('https://api.tarkov.dev/graphql?query={%20items{%20normalizedName%20}%20}', {
        responseType: 'json',
    });

    for(const item of allItems.body.data.items){
        sitemap = addPath(sitemap, `/item/${item.normalizedName}`);
    }

    let ammoTypes = Object.values(caliberMap).sort();

    for(const ammoType of ammoTypes){
        sitemap = addPath(sitemap, `/ammo/${ammoType.replace(/ /g, '%20')}`);
    }

    sitemap = `${sitemap}
    </urlset>`;

    fs.writeFileSync(path.join(__dirname, '..', 'public', 'sitemap.xml'), sitemap);
    console.timeEnd('build-sitemap');
})();
