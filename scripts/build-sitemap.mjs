import { writeFileSync } from "fs";
import path from "path";
import fetch from "cross-fetch";
import { fileURLToPath } from "url";

import { createGzip } from 'zlib';
import { pipeline } from 'stream';
import {
    createReadStream,
    createWriteStream,
    unlink,
} from 'fs';

import maps from "../src/data/maps.json" with { type: "json" };
import categoryPages from "../src/data/category-pages.json" with { type: "json" };

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

const languages = [
    "de",
    "en",
    "fr",
    "it",
    "ja",
    "pl",
    "pt",
    "ru"
]

const addPath = (sitemap, url, change = 'hourly') => {
    for (const lang in languages) {
        sitemap = `${sitemap}
    <url>`;
    
        if (Object.hasOwnProperty.call(languages, lang)) {
            const loclang = languages[lang];

            if (loclang === 'en') {
                sitemap = `${sitemap}
        <loc>https://tarkov.dev${url}</loc>`;
            }
            else {
                sitemap = `${sitemap}
        <loc>https://tarkov.dev${url}?lng=${loclang}</loc>`;
            }

            for (const lang in languages) {
                if (Object.hasOwnProperty.call(languages, lang)) {
                    const hreflang = languages[lang];

                    if (hreflang === 'en') {
                        sitemap = `${sitemap}
            <xhtml:link rel="alternate" hreflang="${hreflang}" href="https://tarkov.dev${url}"/>`;
                    }
                    else {
                        sitemap = `${sitemap}
            <xhtml:link rel="alternate" hreflang="${hreflang}" href="https://tarkov.dev${url}?lng=${hreflang}"/>`;
                    }
                }
            }
        }

        sitemap = `${sitemap}
        <changefreq>${change}</changefreq>
    </url>`;
    }

    return sitemap;
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

async function build_sitemap() {
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

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

    const __dirname = fileURLToPath(new URL(".", import.meta.url));
    writeFileSync(path.join(__dirname, '..', 'public', 'sitemap.xml'), sitemap);
}

async function build_sitemap_items() {
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

    const allItems = await graphqlRequest('{items{normalizedName}}');
    for (const item of allItems.data.items) {
        sitemap = addPath(sitemap, `/item/${item.normalizedName}`);
    }

    sitemap = `${sitemap}
</urlset>`;

    const __dirname = fileURLToPath(new URL(".", import.meta.url));
    writeFileSync(path.join(__dirname, '..', 'public', 'sitemap_items.xml'), sitemap);

    const gzip = createGzip();
    const source = createReadStream(path.join(__dirname, '..', 'public', 'sitemap_items.xml'));
    const destination = createWriteStream(path.join(__dirname, '..', 'public', 'sitemap_items.xml.gz'));

    pipeline(source, gzip, destination, (err) => {
        if (err) {
            console.error('An error occurred:', err);
            process.exitCode = 1;
        }

        unlink(path.join(__dirname, '..', 'public', 'sitemap_items.xml'), (err) => {
            if (err) 
                throw err;
            console.log('successfully deleted sitemap_items.xml');
        });
    });
}

async function build_sitemap_index() {
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
        <loc>https://tarkov.dev/sitemap.xml</loc>
    </sitemap>
    <sitemap>
        <loc>https://tarkov.dev/sitemap_items.xml.gz</loc>
    </sitemap>
</sitemapindex>`;

    const __dirname = fileURLToPath(new URL(".", import.meta.url));
    writeFileSync(path.join(__dirname, '..', 'public', 'sitemap_index.xml'), sitemap);
}

(async () => {
    try {
        console.time('build-sitemap');

        await build_sitemap();

        await build_sitemap_items();

        await build_sitemap_index();
        
        console.timeEnd('build-sitemap');
    }
    catch (error) {
        console.error(error);
        console.log('trying to use pre-built sitemap (offline mode?)');
    }
})();
