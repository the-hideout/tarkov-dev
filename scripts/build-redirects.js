const fs = require('fs');
const path = require('path');

const got = require('got');

(async () => {
    let redirects;

    try {
        const response = await got('https://tarkov-data-manager.herokuapp.com/data/redirects.json', {
            responseType: 'json',
        });

        redirects = response.body;
    } catch (redirectsError){
        console.error(redirectsError);

        process.exit(1);
    }

    let indexTemplate = fs.readFileSync(path.join(__dirname, '..', 'workers-site', 'index-template.js'), 'utf8');
    indexTemplate = indexTemplate.replace('REDIRECTS_DATA', JSON.stringify(redirects, null, 4));

    console.time('Write new data');
    fs.writeFileSync(path.join(__dirname, '..', 'workers-site', 'index.js'), indexTemplate);
    console.timeEnd('Write new data');
})()
