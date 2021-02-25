const fs = require('fs');
const path = require('path');

const got = require('got');

(async () => {
    console.log('Getting all barters');
    console.time('all-barters');
    const response = await got.post('https://tarkov-tools.com/graphql', {
        json: {
            query: `{
                barters {
                  rewardItems {
                    item {
                      id
                      name
                      iconLink
                      imageLink
                      wikiLink
                      avg24hPrice
                    }
                    count
                  }
                  requiredItems {
                    item {
                      id
                      name
                      iconLink
                      imageLink
                      wikiLink
                      avg24hPrice
                    }
                    count
                  }
                  source
                }
            }`,
        },
        responseType: 'json',
    });

    fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'barters.json'), JSON.stringify(response.body.data.barters, null, 4));
    console.timeEnd('all-barters');
})();
