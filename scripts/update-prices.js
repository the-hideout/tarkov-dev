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


        // const ratScannerData = allItemData.body.map((rawallItemData) => {
        //     return {
        //         uid: rawallItemData.uid, // wut
        //         name: rawallItemData.name,
        //         shortName: rawallItemData.shortName,
        //         slots: rawallItemData.slots,
        //         wikiLink: rawallItemData.wikiLink,
        //         imgLink: rawallItemData.img,
        //         timestamp: Math.floor(new Date(rawallItemData.updated).getTime() / 1000),
        //         price: rawallItemData.price,
        //         avg24hPrice: rawallItemData.avg24hPrice,
        //         avg7dPrice: rawallItemData.avg7daysPrice,
        //         avg24hAgo: rawallItemData.avg24hPrice,  // fix
        //         avg7dAgo: rawallItemData.avg7daysPrice, // fix2
        //         traderName: rawallItemData.traderName,
        //         traderPrice: rawallItemData.traderPrice,
        //         traderCurrency: rawallItemData.traderPriceCur,
        //     }
        // });

        fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', `all-${languageCode}.json`), JSON.stringify(allItemData[languageCode], null, 4));

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
<<<<<<< HEAD

    // Skip the rest for now
    return true;
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
        await sleep(30000);
    }
=======
>>>>>>> feature/quest-items
})();
