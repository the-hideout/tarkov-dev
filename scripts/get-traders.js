const fs = require('fs');
const path = require('path');
const got = require('got');

(async () => {
    const data = await got('https://raw.githack.com/TarkovTracker/tarkovdata/master/traders.json', {
        responseType: 'json',
    });

    fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'traders.json'), JSON.stringify(data.body, null, 4));
})();
