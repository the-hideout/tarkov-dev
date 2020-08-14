const fs = require('fs');
const path = require('path');

const got = require('got');

const sleep = require('./modules/sleep');

const FILES = [
    'barter-items.json',
    'keys.json',
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
            const itemData = await got(`https://tarkov-market.com/api/v1/item?uid=${item.uid}`, {
                headers: {
                    'x-api-key': process.env.TARKOV_MARKET_API_KEY,
                },
                responseType: 'json',
            });
            
            allData.data.push({
                ...item,
                img: itemData.body[0].img,
                link: itemData.body[0].link,
                pricePerSlot: Math.floor(itemData.body[0].avg24hPrice / itemData.body[0].slots),
                slots: itemData.body[0].slots,
                wikiLink: itemData.body[0].wikiLink,
            });
            
            await sleep(250);
        }
        
        fs.writeFileSync(path.join(__dirname, '..', 'public', file), JSON.stringify(allData, null, 4));
    }
})();
