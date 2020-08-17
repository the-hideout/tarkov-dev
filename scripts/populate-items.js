const fs = require('fs');
const path = require('path');

const got = require('got');

const sleep = require('./modules/sleep');

const API_KEY = 'iNXByLFqboRSsH2N';

const FILES = [
    'barter-items.json',
    'keys.json',
];


(async () => {
    for(const file of FILES){
        const DATA_PATH = path.join(__dirname, '..', 'data', file);

        let itemData = JSON.parse(fs.readFileSync(DATA_PATH));
        let missinguid = 0;
        for(const item of itemData){
            if(!item.uid){
                missinguid = missinguid + 1;
            }
        }
        let i = 1;
        
        for(const item of itemData){
            if(item.uid){
                continue;
            }
            const addItems = [];
            console.log(`Searching for ${item.name}`);
            const apiData = await got(`https://tarkov-market.com/api/v1/item?q=${item.name}`, {
                headers: {
                    'x-api-key': API_KEY,
                },
                responseType: 'json',
            });
            
            if(apiData.body.length > 1){
                for(const newItem of apiData.body){
                    addItems.push({
                        name: newItem.name,
                        uid: newItem.uid,
                    });
                }
                
                Reflect.deleteProperty(itemData, item);
                
                itemData = itemData.concat(addItems);
            } else {
                if(!apiData.body[0]){
                    console.log(`Found nothing for ${item.name}`);
                    console.log(apiData.body);
                    
                    continue;
                }
                
                for(const tempItem of itemData){
                    if(tempItem.uid === apiData.body[0].uid){
                        console.log(`${item.name} already exists as ${tempItem.name}`);
                        
                        continue;
                    }
                }
                
                item.uid = apiData.body[0].uid;
            }
            
            fs.writeFileSync(DATA_PATH, JSON.stringify(itemData, null, 4));
            console.log(`${apiData.body[0].name} added`);
            
            await sleep(500);
            console.log(`done with ${i}/${missinguid}`);
            i = i + 1;
        }
        
        itemData = JSON.parse(fs.readFileSync(DATA_PATH));
        const uniqueUids = [];
        const uniqueItems = [];
        
        for(const item of itemData){
            if(uniqueUids.includes(item.uid) && item.uid){
                console.log(`Found a duplicate for ${item.uid}`);
                
                continue;
            }
            
            uniqueUids.push(item.uid);
            uniqueItems.push(item);
        }
        
        fs.writeFileSync(DATA_PATH, JSON.stringify(uniqueItems, null, 4));
    }
})();
