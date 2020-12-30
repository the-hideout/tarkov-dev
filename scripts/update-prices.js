const fs = require('fs');
const path = require('path');

const got = require('got');

const sleep = require('./modules/sleep');
const fleaMarketFee = require('./modules/flea-market-fee');
const questData = require('./modules/quests');

const FILES = [
    'barter-items.json',
    'keys.json',
    'mods.json',
];

const CURRENCY_MODIFIER = {
    "₽": 1,
    "$": 125,
    "€": 142,
};

const availableLanguages = [
    'en',
    // 'ru',
    // 'de',
    // 'fr',
    // 'es',
    // 'cn',
];

(async () => {
    let allItemData = {};
    for(const languageCode of availableLanguages){
        try {
            const response = await got(`https://tarkov-market.com/api/v1/items/all?lang=${languageCode}`, {
                headers: {
                    'x-api-key': process.env.TARKOV_MARKET_API_KEY,
                },
                responseType: 'json',
            });

            allItemData[languageCode] = response.body;
        } catch (requestError){
            console.error(requestError);

            // We wan't CI to stop here
            process.exit(1);
        }
        console.log(`Loading all items for ${languageCode}`);
        console.time(`all-${languageCode}`);

        console.timeEnd(`all-${languageCode}`);

        fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', `all-${languageCode}.json`), JSON.stringify(allItemData[languageCode], null, 4));

        const ratScannerData = allItemData[languageCode].map((rawItemData) => {
            return {
                uid: rawItemData.bsgId,
                name: rawItemData.name,
                shortName: rawItemData.shortName,
                slots: rawItemData.slots,
                wikiLink: rawItemData.wikiLink,
                imgLink: rawItemData.img,
                timestamp: Math.floor(new Date(rawItemData.updated).getTime() / 1000),
                price: rawItemData.price,
                avg24hPrice: rawItemData.avg24hPrice,
                avg7dPrice: rawItemData.avg7daysPrice,
                avg24hAgo: Math.floor(rawItemData.avg24hPrice * (rawItemData.diff24h / 100)),
                avg7dAgo: Math.floor(rawItemData.avg7daysPrice * (rawItemData.diff7days / 100)),
                traderName: rawItemData.traderName,
                traderPrice: rawItemData.traderPrice,
                traderCurrency: rawItemData.traderPriceCur,
                quests: questData.getItemUsage(rawItemData.bsgId),
            };
        });

        fs.writeFileSync(path.join(__dirname, '..', 'public', 'data', `all-${languageCode}.json`), JSON.stringify(ratScannerData, null, 4));

        if(availableLanguages > 3){
            await sleep(20000);
        }
    }

    for(const file of FILES){
        const allData = {
            updated: new Date(),
            data: [],
        };

        const DATA_PATH = path.join(__dirname, '..', 'src', 'data', file);

        let itemData = JSON.parse(fs.readFileSync(DATA_PATH));

        for(const item of itemData){
            if(!item.uid){
                continue;
            }

            console.log(`Loading data for ${item.name}`);
            const itemData = allItemData['en'].find(tempItemData => tempItemData.uid === item.uid);

            allData.data.push({
                ...item,
                img: itemData.img,
                link: itemData.link,
                price: itemData.avg24hPrice,
                fee: fleaMarketFee(itemData),
                traderPrice: itemData.traderPrice * CURRENCY_MODIFIER[itemData.traderPriceCur],
                trader: itemData.traderName,
                slots: itemData.slots,
                wikiLink: itemData.wikiLink,
            });
        }

        fs.writeFileSync(path.join(__dirname, '..', 'public', file), JSON.stringify(allData, null, 4));
    }
})();
