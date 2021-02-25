const fs = require('fs');
const path = require('path');

const got = require('got');

(async () => {
    const response = await got.post('https://tarkov-tools.com/graphql', {
        json: {
            query: `{
                crafts {
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
                  time
                }
            }`,
        },
        responseType: 'json',
    });

    fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'crafts.json'), JSON.stringify(response.body.data.crafts, null, 4));
})();
