const fs = require('fs');
const path = require('path');
const got = require('got');

const fetch = require('cross-fetch');

const COMMIT_URL = 'https://api.github.com/repos/the-hideout/tarkov-dev/commits/main';

// Use a GitHub token to increase the rate limit
const token = process.env.GITHUB_TOKEN;
const headers = {};
if (token) {
    headers.authorization = `token ${token}`;
    console.log("Using provided GitHub token to increase rate limit")
} else {
    console.log("No GitHub token provided, rate limit may be reached")
    console.warn("To increase the rate limit, provide a GitHub token via the GITHUB_TOKEN environment variable")
}

const getVersion = async function getVersion() {
    console.time(`Get version url ${COMMIT_URL}`);
    try {
        const response = await fetch(COMMIT_URL, {
            headers,
            signal: AbortSignal.timeout(5000),
        }).then(response => response.json());
        console.timeEnd(`Get version url ${COMMIT_URL}`);

        return response;
    } catch (responseError) {
        console.timeEnd(`Get version url ${COMMIT_URL}`);

        if (responseError instanceof got.HTTPError) {
            console.error(`HTTP Error: ${responseError.response.statusCode} ${responseError.response.statusMessage}`);
        } else {
            console.error(responseError);
        }
    }

    return false;
};

(async () => {
    try {
        let response = false;

        response = await getVersion();

        if (!response) {
            console.log('Error fetching version, using fallback version.json')
            fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'version.json'), JSON.stringify(
                {
                    version: 'unknown'
                }, null, 4
            ));
            return;
        }

        console.log(response.sha);

        const version = {
            version: response.sha || 'unknown',
        }

        console.time('Write new data');
        fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'version.json'), JSON.stringify(version, null, 4));
        console.timeEnd('Write new data');
    } catch (error) {
        console.error(error);
        console.log('Error fetching version, using fallback version.json')
        fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'version.json'), JSON.stringify(
            {
                version: 'unknown'
            }, null, 4
        ));
    }
})()
