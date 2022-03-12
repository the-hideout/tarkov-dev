const fs = require('fs');
const path = require('path');

const got = require('got');

const maps = require('../src/data/maps.json');
const itemTypes = require('../src/data/category-pages.json');
const ammoData = require('../src/data/ammo.json');

const standardPaths = [
    '',
    // 'about',
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
        <loc>https://tarkov-tools.com${url}</loc>
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

    for(const map of maps){
        sitemap = addPath(sitemap, `/map/${map.key}`);
    }

    for(const itemType of itemTypes){
        sitemap = addPath(sitemap, `/items/${itemType.key}`);
    }

    const allItems = await got('https://api.thehideout.io/graphql?query={%20itemsByType(type:%20any){%20normalizedName%20}%20}', {
        responseType: 'json',
    });

    for(const item of allItems.body.data.itemsByType){
        sitemap = addPath(sitemap, `/item/${item.normalizedName}`);
    }

    let ammoTypes = [];
    for(const ammo of ammoData.data){
        ammoTypes.push(ammo.type);
    }

    ammoTypes = [...new Set(ammoTypes)];

    for(const ammoType of ammoTypes){
        sitemap = addPath(sitemap, `/ammo/${ammoType.replace(/ /g, '%20')}`);
    }

    sitemap = `${sitemap}
    </urlset>`;

    fs.writeFileSync(path.join(__dirname, '..', 'public', 'sitemap.xml'), sitemap);
    console.timeEnd('build-sitemap');
})();
