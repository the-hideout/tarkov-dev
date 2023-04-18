const fs = require('fs');
const path = require('path');

const fetch = require('cross-fetch');

const redirects = require('../workers-site/redirects.json');

(async () => {
    let liveNames = [];
    try {
        const response = await fetch('https://api.tarkov.dev/graphql', {
            method: 'POST',
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                query: `{
                    itemsByType(type: any){
                        normalizedName
                    }
                }`
            }),
        }).then(response => response.json());

        liveNames = response.data.itemsByType.map(item => item.normalizedName);
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