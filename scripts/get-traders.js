const fs = require('fs');
const path = require('path');
const got = require('got');

(async () => {
    console.log('Loading traders');
    console.time('traders');
    const data = await got('https://raw.githubusercontent.com/TarkovTracker/tarkovdata/master/traders.json', {
        responseType: 'json',
    });
    console.timeEnd('traders');

    fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'traders.json'), JSON.stringify(data.body, null, 4));
})();
