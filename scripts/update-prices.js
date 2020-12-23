const fs = require('fs');
const path = require('path');

const got = require('got');

const sleep = require('./modules/sleep');
const fleaMarketFee = require('./modules/flea-market-fee');

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
    'ru',
    'de',
    'fr',
    'es',
    'cn',
];

(async () => {
    for(const file of FILES){
        const allData = {
            updated: new Date(),
            data: [],
        };

        const DATA_PATH = path.join(__dirname, '..', 'data', file);

        let itemData = JSON.parse(fs.readFileSync(DATA_PATH));

        for(const item of itemData){
            if(!item.uid){
                continue;
            }
            console.log(`Loading data for ${item.name}`);
            let itemData;

            try {
                itemData = await got(`https://tarkov-market.com/api/v1/item?uid=${item.uid}`, {
                    headers: {
                        'x-api-key': process.env.TARKOV_MARKET_API_KEY,
                    },
                    responseType: 'json',
                });
            } catch (requestError){
                console.error(requestError);

                // We wan't CI to stop here
                process.exit(1);
            }

            allData.data.push({
                ...item,
                img: itemData.body[0].img,
                link: itemData.body[0].link,
                price: itemData.body[0].avg24hPrice,
                fee: fleaMarketFee(itemData.body[0]),
                traderPrice: itemData.body[0].traderPrice * CURRENCY_MODIFIER[itemData.body[0].traderPriceCur],
                trader: itemData.body[0].traderName,
                slots: itemData.body[0].slots,
                wikiLink: itemData.body[0].wikiLink,
            });

            await sleep(150);
        }

        fs.writeFileSync(path.join(__dirname, '..', 'public', file), JSON.stringify(allData, null, 4));
    }

    for(const languageCode of availableLanguages){
        console.log(`Loading all items for ${languageCode}`);
        console.time(`all-${languageCode}`);
        let itemData;
        try {
            itemData = await got(`https://tarkov-market.com/api/v1/items/all?lang=${languageCode}`, {
                headers: {
                    'x-api-key': process.env.TARKOV_MARKET_API_KEY,
                },
                responseType: 'json',
            });
        } catch (requestError){
            console.error(requestError);

            // We wan't CI to stop here
            process.exit(1);
        }

        const ratScannerData = itemData.body.map((rawItemData) => {
            return {
                uid: rawItemData.uid, // wut
                name: rawItemData.name,
                shortName: rawItemData.shortName,
                slots: rawItemData.slots,
                wikiLink: rawItemData.wikiLink,
                imgLink: rawItemData.img,
                timestamp: Math.floor(new Date(rawItemData.updated).getTime() / 1000),
                price: rawItemData.price,
                avg24hPrice: rawItemData.avg24hPrice,
                avg7dPrice: rawItemData.avg7daysPrice,
                avg24hAgo: rawItemData.avg24hPrice,  // fix
                avg7dAgo: rawItemData.avg7daysPrice, // fix2
                traderName: rawItemData.traderName,
                traderPrice: rawItemData.traderPrice,
                traderCurrency: rawItemData.traderPriceCur,
            }
        })

        fs.writeFileSync(path.join(__dirname, '..', 'public', `all-${languageCode}.json`), JSON.stringify(ratScannerData, null, 4));
        console.timeEnd(`all-${languageCode}`);
        await sleep(2000);
    }
})();
