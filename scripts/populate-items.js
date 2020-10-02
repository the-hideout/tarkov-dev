const fs = require('fs');
const path = require('path');

const got = require('got');

const sleep = require('./modules/sleep');
const shouldRotate = require('./modules/should-rotate.js');

const FILES = [
    'barter-items.json',
    'keys.json',
];

const formatName = (rawName) => {
    const ascii = /^[ -~]+$/;
    let encodedName = encodeURIComponent(rawName.trim().toLowerCase());
    encodedName = encodedName.replace('%D0%B0', 'a');

    if ( !ascii.test( encodedName ) ) {
        console.log(`"${encodedName} contains non-ascii characters`);
        process.exit();
    }
    
    return encodedName;
}

(async () => {
    for(const file of FILES){
        const INPUT_PATH = path.join(__dirname, '..', 'data', file);
        const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'mods.json');

        let itemData = JSON.parse(fs.readFileSync(INPUT_PATH));
        let missinguid = 0;
        for(const item of itemData){
            if(!item.uid){
                missinguid = missinguid + 1;
            }
        }
        let i = 1;
        
        for(let itemIndex = itemData.length - 1; itemIndex >= 0; itemIndex = itemIndex - 1){
            const item = itemData[itemIndex];
            if(item.uid){
                continue;
            }
            const addItems = [];
            console.log(`Searching for ${item.name}`);
            const apiData = await got(`https://tarkov-market.com/api/v1/item?q=${formatName(item.name)}`, {
                headers: {
                    'x-api-key': process.env.TARKOV_MARKET_API_KEY,
                },
                responseType: 'json',
            });
            
            if(apiData.body.length > 1){
                for(const newItem of apiData.body){
                    const itemShouldRotate = await shouldRotate(newItem.img);
                    const newItemData = {
                        name: newItem.name,
                        uid: newItem.uid,
                        shortName: newItem.shortName,
                    };
                    
                    if(itemShouldRotate){
                        newItemData.rotate = -90;
                    }
                    
                    addItems.push(newItemData);
                }
                
                itemData.splice(itemIndex, 1);
                
                itemData = itemData.concat(addItems);
            } else {
                if(!apiData.body[0]){
                    console.log(`Found nothing for ${item.name}`);
                    
                    continue;
                }
                
                for(const tempItem of itemData){
                    if(tempItem.uid === apiData.body[0].uid){
                        console.log(`${item.name} already exists as ${tempItem.name}`);
                        
                        continue;
                    }
                }
                
                item.uid = apiData.body[0].uid;
                item.shortName = apiData.body[0].shortName;
                
                const itemShouldRotate = await shouldRotate(apiData.body[0].img);
                if(itemShouldRotate){
                    item.rotate = -90;
                }
            }
            
            fs.writeFileSync(OUTPUT_PATH, JSON.stringify(itemData, null, 4));
            console.log(`${apiData.body[0].name} added`);
            
            await sleep(200);
            console.log(`done with ${i}/${missinguid}`);
            i = i + 1;
        }
        
        console.log('Done with all items!');
        
        itemData = JSON.parse(fs.readFileSync(OUTPUT_PATH));
        const uniqueUids = [];
        const uniqueNames = [];
        const uniqueItems = [];
        
        for(const item of itemData){
            if(uniqueUids.includes(item.uid) && item.uid){
                console.log(`Found a duplicate for ${item.uid}`);
                
                continue;
            }
            
            if(uniqueNames.includes(item.name) && item.name){
                console.log(`Found a duplicate for ${item.name}`);
                
                continue;
            }
            
            uniqueNames.push(item.name);
            uniqueUids.push(item.uid);
            uniqueItems.push(item);
        }
        
        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(uniqueItems, null, 4));
    }
})();
