const fs = require('fs');
const path = require('path');

const got = require('got');
const barterItems = require('../data/barter-items.json');

(async () => {
    const allData = {
        updated: new Date(),
        data: [],
    };
    
    for(const item of barterItems){
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
        });
    }
    
    fs.writeFileSync(path.join(__dirname, '..', 'src', 'barter-items.json'), JSON.stringify(allData, null, 4));
})();
