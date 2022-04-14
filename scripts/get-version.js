const fs = require('fs');
const path = require('path');

const got = require('got');

const COMMIT_URL = 'https://api.github.com/repos/the-hideout/tarkov-dev/commits/main';

const getVersion = async function getVersion(){
    console.time(`Get version url ${COMMIT_URL}`);
    try {
        const response = await got(COMMIT_URL, {
            responseType: 'json',
            timeout: 5000,
        }).json();
        console.timeEnd(`Get version url ${COMMIT_URL}`);

        return response;
    } catch (responseError){
        console.timeEnd(`Get version url ${COMMIT_URL}`);
        console.error(responseError);
    }

    return false;
};

(async () => {
    let response = false;

    response = await getVersion();

    console.log(response.sha);

    const version = {
        version: response.sha,
    }

    console.time('Write new data');
    fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'version.json'), JSON.stringify(version, null, 4));
    console.timeEnd('Write new data');
})()
