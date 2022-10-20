import fs from 'fs';
import fetch  from 'cross-fetch';

import doFetchItems from '../src/features/items/do-fetch-items.js';
import doFetchBarters from '../src/features/barters/do-fetch-barters.js';
import doFetchCrafts from '../src/features/crafts/do-fetch-crafts.js';
import doFetchTraders from '../src/features/traders/do-fetch-traders.js';
import doFetchMaps from '../src/features/maps/do-fetch-maps.js';
import doFetchMeta from '../src/features/meta/do-fetch-meta.js';
import doFetchHideout from '../src/features/hideout/do-fetch-hideout.js';
import doFetchQuests from '../src/features/quests/do-fetch-quests.js';

const langs = [
    'es',
    'de',
    'fr',
    'cz',
    'hu',
    'it',
    'jp',
    'pl',
    'pt',
    'ru',
    'sk',
    'tr',
    'zh',
];

const getItemNames = (language) => {
    const QueryBody = JSON.stringify({
        query: `{
            items(lang: ${language}) {
                id
                name
                shortName
            }
        }`,
    });
    return fetch('https://api.tarkov.dev/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: QueryBody,
    }).then((response) => response.json()).then(response => response.data.items);
};

const getTaskNames = (language) => {
    const QueryBody = JSON.stringify({
        query: `{
            tasks(lang: ${language}) {
                id
                name
                objectives {
                    id
                    description
                }
            }
        }`,
    });
    return fetch('https://api.tarkov.dev/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: QueryBody,
    }).then((response) => response.json()).then(response => response.data.tasks);
};

const getTraderNames = (language) => {
    const QueryBody = JSON.stringify({
        query: `{
            traders(lang: ${language}) {
                id
                name
            }
        }`,
    });
    return fetch('https://api.tarkov.dev/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: QueryBody,
    }).then((response) => response.json()).then(response => response.data.traders);
};

console.time('Caching API data');
try {
    const apiPromises = [];
    apiPromises.push(doFetchItems('en', true).then(items => {
        for (const item of items) {
            item.lastLowPrice = 0;
            item.avg24hPrice = 0;
            item.buyFor = item.buyFor.filter(buyFor => buyFor.vendor.normalizedName !== 'flea-market');
            item.sellFor = item.sellFor.filter(buyFor => buyFor.vendor.normalizedName !== 'flea-market');
            item.cached = true;
        }
        fs.writeFileSync('./src/data/items.json', JSON.stringify(items));
    }));
    apiPromises.push(new Promise(async resolve => {
        const itemLangs = {};
        for (const lang of langs) {
            await getItemNames(lang).then(items => {
                const localization = {};
                items.forEach(item => {
                    localization[item.id] =  {
                        name: item.name,
                        shortName: item.shortName
                    };
                });
                itemLangs[lang] = localization;
            });
        }
        fs.writeFileSync(`./src/data/items_locale.json`, JSON.stringify(itemLangs));
        resolve();
    }));

    apiPromises.push(doFetchBarters('en', true).then(barters => {
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
    }));

    apiPromises.push(doFetchCrafts('en', true).then(crafts => {
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
    }));

    apiPromises.push(doFetchHideout('en', true).then(hideout => {
        fs.writeFileSync('./src/data/hideout.json', JSON.stringify(hideout));
    }));

    apiPromises.push(doFetchTraders('en', true).then(traders => {
        for (const trader of traders) {
            delete trader.resetTime;
        }
        fs.writeFileSync('./src/data/traders.json', JSON.stringify(traders));
        return new Promise(async resolve => {
            const traderLangs = {};
            for (const lang of langs) {
                await getTraderNames(lang).then(traders => {
                    const localization = {};
                    traders.forEach(trader => {
                        localization[trader.id] =  {
                            name: trader.name
                        };
                    });
                    traderLangs[lang] = localization;
                });
            }
            fs.writeFileSync(`./src/data/traders_locale.json`, JSON.stringify(traderLangs));
            resolve();
        })
    }));

    apiPromises.push(doFetchMaps('en', true).then(maps => {
        fs.writeFileSync('./src/data/maps_cached.json', JSON.stringify(maps));
    }));

    apiPromises.push(doFetchMeta('en', true).then(meta => {
        fs.writeFileSync('./src/data/meta.json', JSON.stringify(meta));
    }));

    apiPromises.push(doFetchQuests('en', true).then(quests => {
        fs.writeFileSync('./src/data/quests.json', JSON.stringify(quests));
        return new Promise(async resolve => {
            const taskLangs = {};
            for (const lang of langs) {
                await getTaskNames(lang).then(tasks => {
                    const localization = {};
                    tasks.forEach(task => {
                        localization[task.id] =  {
                            name: task.name,
                            objectives: {}
                        };
                        task.objectives.forEach(objective => {
                            localization[task.id].objectives[objective.id] = objective.description;
                        });
                    });
                    taskLangs[lang] = localization;
                });
            }
            fs.writeFileSync(`./src/data/quests_locale.json`, JSON.stringify(taskLangs));
            resolve();
        });
    }));

    await Promise.all(apiPromises);
} catch (error) {
    console.log(error);
}
console.timeEnd('Caching API data');
