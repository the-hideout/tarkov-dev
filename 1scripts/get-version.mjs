import fs from "fs";
import path from "path";
import fetch from "cross-fetch";
import url from "url";

const COMMIT_URL = 'https://api.github.com/repos/the-hideout/tarkov-dev/commits/main';

// If a GitHub token is provided, use it to increase the rate limit
const token = process.env.GITHUB_TOKEN;
const headers = {};
if (token) {
    headers.authorization = `token ${token}`;
    console.log("Using provided GitHub token to increase rate limit");
}
else {
    console.log("No GitHub token provided, rate limit may be reached");
    console.warn("To increase the rate limit, provide a GitHub token via the GITHUB_TOKEN environment variable");
}

async function getVersion() {
    console.time(`Get version url ${COMMIT_URL}`);
    let responseJson = {};

    try {
        const response = await fetch(COMMIT_URL, {
            headers,
            signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
            console.error(`Error! status: ${response.status} message: ${response.statusText}`);
        }
        else {
            responseJson = await response.json();
        }
    }
    catch (responseError) {
        console.error(`Error: ${responseError.message}`);
    }

    console.timeEnd(`Get version url ${COMMIT_URL}`);

    return responseJson;
}

(async () => {
    const responseJson = await getVersion();
    let versionDic = {};

    if (!responseJson || !responseJson.sha) {
        console.log('Error fetching version, using fallback version.json (offline mode?)');

        versionDic = { version: 'unknown' };
    }
    else {
        versionDic = { version: responseJson.sha };
    }

    console.log(versionDic);

    console.time('Write new data');

    let stringifyed = JSON.stringify(versionDic, null, 4);
    const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
    fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'version.json'), stringifyed);

    console.timeEnd('Write new data');
})();
