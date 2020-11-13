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
})();
