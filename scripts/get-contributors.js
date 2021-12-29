const fs = require('fs');
const path = require('path');

const got = require('got');

(async () => {
    console.log('Loading contributors');
    console.time('contributors');
    const data = await got('https://api.github.com/repos/kokarn/tarkov-tools/contributors', {
        responseType: 'json',
    });
    console.timeEnd('contributors');

    fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'contributors.json'), JSON.stringify(data.body, null, 4));
})();