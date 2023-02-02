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
import doFetchBosses from '../src/features/bosses/do-fetch-bosses.js';

function getLanguageCodes() {
    const QueryBody = JSON.stringify({
        query: `{
            __type(name: "LanguageCode") {
                enumValues {
                    name
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
    }).then((response) => response.json()).then(response => response.data.__type.enumValues.map(lang => {
        return lang.name;
    }));
}

const getItemNames = (langs) => {
    const queries = langs.map(language => {
        return `${language}: items(lang: ${language}) {
            id
            name
            shortName
        }`
    });
    const QueryBody = JSON.stringify({
        query: `{
            ${queries.join('\n')}
        }`,
    });
    return fetch('https://api.tarkov.dev/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: QueryBody,
    }).then((response) => response.json()).then(response => response.data);
};

const getTaskNames = (langs) => {
    const queries = langs.map(language => {
        return `${language}: tasks(lang: ${language}) {
            id
            name
            objectives {
                id
                description
            }
        }`
    });;
    const QueryBody = JSON.stringify({
        query: `{
            ${queries.join('\n')}
        }`,
    });
    return fetch('https://api.tarkov.dev/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: QueryBody,
    }).then((response) => response.json()).then(response => response.data);
};

const getTraderNames = (langs) => {
    const queries = langs.map(language => {
        return `${language}: traders(lang: ${language}) {
            id
            name
        }`;
    });
    const QueryBody = JSON.stringify({
        query: `{
            ${queries.join('\n')}
        }`,
    });
    return fetch('https://api.tarkov.dev/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: QueryBody,
    }).then((response) => response.json()).then(response => response.data);
};

const getMapNames = (langs) => {
    const queries = langs.map(language => {
        return `${language}: maps(lang: ${language}) {
            id
            name
            description
        }`;
    });
    const QueryBody = JSON.stringify({
        query: `{
            ${queries.join('\n')}
        }`,
    });
    return fetch('https://api.tarkov.dev/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: QueryBody,
    }).then((response) => response.json()).then(response => response.data);
};

const getBossNames = (langs) => {
    const queries = langs.map(language => {
        return `${language}: bosses(lang: ${language}) {
            name
            normalizedName
        }`;
    });
    const QueryBody = JSON.stringify({
        query: `{
            ${queries.join('\n')}
        }`,
    });
    return fetch('https://api.tarkov.dev/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: QueryBody,
    }).then((response) => response.json()).then(response => response.data);
};

console.time('Caching API data');
try {
    const allLangs = await getLanguageCodes();
    fs.writeFileSync('./src/data/supported-languages.json', JSON.stringify(allLangs, null, 4));
    const langs = allLangs.filter(lang => lang !== 'en')
    const apiPromises = [];

    apiPromises.push(Promise.all([
        doFetchBarters('en', true).then(barters => {
            fs.writeFileSync('./src/data/barters.json', JSON.stringify(barters));
            return barters;
        }),
        doFetchCrafts('en', true).then(crafts => {
            fs.writeFileSync('./src/data/crafts.json', JSON.stringify(crafts));
            return crafts;
        })
    ]).then((bartersAndCrafts) => {
        return doFetchItems('en', true).then(items => {

            const filteredItems = [];
            for (const bartersCrafts of bartersAndCrafts) {
                bartersCrafts.forEach(bc => {
                    for (const cItem of bc.rewardItems) {
                        if (!filteredItems.some(i => i.id === cItem.item.id)) {
                            filteredItems.push(items.find(i => i.id === cItem.item.id));
                        }
                    }
                    for (const cItem of bc.requiredItems) {
                        if (!filteredItems.some(i => i.id === cItem.item.id)) {
                            filteredItems.push(items.find(i => i.id === cItem.item.id));
                        }
                    }
                });
            }

            /*const groupedItemsDic = items.reduce((acc, item) => {
                if (!acc[item.bsgCategoryId]) {
                    acc[item.bsgCategoryId] = []
                }
                acc[item.bsgCategoryId].push(item);
                return acc;
            }, {});
            const filteredItemsDic = Object.values(groupedItemsDic).map(group => group.slice(0, 7));
            const filteredItems = [].concat(...filteredItemsDic);*/
    console.log(filteredItems.length)
            for (const item of filteredItems) {
                item.lastLowPrice = 0;
                item.avg24hPrice = 0;
                item.buyFor = item.buyFor.filter(buyFor => buyFor.vendor.normalizedName !== 'flea-market');
                item.sellFor = item.sellFor.filter(buyFor => buyFor.vendor.normalizedName !== 'flea-market');
                item.cached = true;
            }
            fs.writeFileSync('./src/data/items.json', JSON.stringify(filteredItems));
    
            return new Promise(async resolve => {
                const itemLangs = {};
                await getItemNames(langs).then(itemResults => {
                    for (const lang in itemResults) {
                        const localization = {};
                        itemResults[lang].forEach(item => {
                            if (filteredItems.find(filteredItem => filteredItem.id == item.id)) {
                                localization[item.id] =  {
                                    name: item.name,
                                    shortName: item.shortName
                                };
                            }
                        });
                        itemLangs[lang] = localization;
                    }
                });
                fs.writeFileSync(`./src/data/items_locale.json`, JSON.stringify(itemLangs));
                resolve();
            });
        });
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
            await getTraderNames(langs).then(traderResults => {
                for (const lang in traderResults) {
                    const localization = {};
                    traderResults[lang].forEach(trader => {
                        localization[trader.id] =  {
                            name: trader.name
                        };
                    });
                    traderLangs[lang] = localization;
                }
            });
            fs.writeFileSync(`./src/data/traders_locale.json`, JSON.stringify(traderLangs));
            resolve();
        })
    }));

    apiPromises.push(doFetchMaps('en', true).then(maps => {
        fs.writeFileSync('./src/data/maps_cached.json', JSON.stringify(maps));

        return getMapNames(langs).then(mapResults => {
            const mapLangs = {};
            for (const lang in mapResults) {
                const localization = {};
                mapResults[lang].forEach(map => {
                    localization[map.id] = {
                        name: map.name,
                        description: map.description,
                    };
                });
                mapLangs[lang] = localization;
            }
            fs.writeFileSync(`./src/data/maps_locale.json`, JSON.stringify(mapLangs));
        });
    }));

    apiPromises.push(doFetchBosses('en', true).then(bosses => {
        fs.writeFileSync('./src/data/bosses.json', JSON.stringify(bosses));

        return getBossNames(langs).then(bossResults => {
            const bossLangs = {};
            for (const lang in bossResults) {
                const localization = {};
                bossResults[lang].forEach(boss => {
                    localization[boss.normalizedName] = {
                        name: boss.name,
                    };
                });
                bossLangs[lang] = localization;
            }
            fs.writeFileSync(`./src/data/bosses_locale.json`, JSON.stringify(bossLangs));
        });
    }));

    apiPromises.push(doFetchMeta('en', true).then(meta => {
        fs.writeFileSync('./src/data/meta.json', JSON.stringify(meta));
    }));

    apiPromises.push(doFetchQuests('en', true).then(quests => {
        const groupedQuestsDic = quests.reduce((acc, item) => {
            if (!acc[item.trader.normalizedName]) {
                acc[item.trader.normalizedName] = []
            }
            if (item.minPlayerLevel < 20)
                acc[item.trader.normalizedName].push(item);
            return acc;
        }, {});
        const filteredQuestsDic = Object.values(groupedQuestsDic).map(group => group.slice(0, 20));
        const filteredQuests = [].concat(...filteredQuestsDic);
        // const filteredQuests = [].concat(...groupedQuestsDic);

        fs.writeFileSync('./src/data/quests.json', JSON.stringify(filteredQuests));

        return new Promise(async resolve => {
            const taskLangs = {};
            await getTaskNames(langs).then(taskResults => {
                for (const lang in taskResults) {
                    const localization = {};
                    taskResults[lang].forEach(task => {
                        if (filteredQuests.find(filteredQuest => filteredQuest.id == task.id)) {
                            localization[task.id] =  {
                                name: task.name,
                                objectives: {}
                            };
                            task.objectives.forEach(objective => {
                                localization[task.id].objectives[objective.id] = objective.description;
                            });
                        }
                    });
                    taskLangs[lang] = localization;
                }
            });
            fs.writeFileSync(`./src/data/quests_locale.json`, JSON.stringify(taskLangs));
            resolve();
        });
    }));

    await Promise.all(apiPromises);
} catch (error) {
    //console.log(error);
    throw error;
} 
console.timeEnd('Caching API data');
