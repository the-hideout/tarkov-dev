const fs = require('fs');
const path = require('path');

const got = require('got');

const redirects = require('../workers-site/redirects.json');

(async () => {
    let liveNames = [];
    try {
        const response = await got.post('https://api.tarkov.dev/graphql', {
            body: JSON.stringify({query: `{
                itemsByType(type: any){
                    normalizedName
                }
            }`
            }),
            responseType: 'json',
        });

        liveNames = response.body.data.itemsByType.map(item => item.normalizedName);
    } catch (loadError){
        console.error(loadError);

        return false;
    }

    const keys = Object.keys(redirects);

    for(const key of keys){
        const itemName = key.replace('/item/', '');
        if(!liveNames.includes(itemName)){
            continue;
        }

        console.log(`${key} `);

        Reflect.deleteProperty(redirects, key);
    }

    fs.writeFileSync(path.join(__dirname, '..', 'workers-site', 'redirects.json'), JSON.stringify(redirects, null, 4));
})();