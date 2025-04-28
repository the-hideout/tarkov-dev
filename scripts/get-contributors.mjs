import fs from "fs";
import path from "path";
import fetch from "cross-fetch";
import url from "url";

const repositories = [
    'the-hideout/tarkov-dev',
    'the-hideout/stash',
    'the-hideout/tarkov-api',
    'the-hideout/cloudflare',
    'the-hideout/tarkov-data-manager',
    'the-hideout/cache',
    'the-hideout/status',
    'the-hideout/tarkov-dev-image-generator',
    'TarkovTracker/tarkovdata',
];

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

async function getContributors(repository) {
    console.time(`get contributors to ${repository}`);
    let responseJson = [];
    let contributors = [];

    try {
        const response = await fetch(`https://api.github.com/repos/${repository}/contributors`, {
            headers,
            signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
            console.error(`Error! status: ${response.status} message: ${response.statusText}`);
        }
        else {
            responseJson = await response.json();
        }

        for (const contributor of responseJson) {
            if (contributor.type !== "User") {
                continue;
            }
            
            contributors.push({
                login: contributor.login,
                html_url: contributor.html_url,
                avatar_url: contributor.avatar_url,
                contributions: contributor.contributions,
            });
        }
    }
    catch (responseError) {
        console.error(`Error: ${responseError.message}`);
    }

    console.timeEnd(`get contributors to ${repository}`);

    return contributors;
}

(async () => {
    console.log('Loading contributors');
    let allContributors = [];

    try {
        let allRepContributors = [];
        for (const repository of repositories) {
            const contributosArr = await getContributors(repository);

            if (!contributosArr) {
                console.log(`Error fetching contributors of ${repository}`);
                
                continue;
            }

            allRepContributors.push(...contributosArr);
        }

        // Calculate total contributions by user
        const totalRepContributors = allRepContributors.reduce((acc, { login, contributions }) => {
            if (!acc[login]) {
                acc[login] = 0;
            }
            acc[login] += contributions;
            return acc;
        }, {});

        // Add total contributions field to each object
        allContributors = Object.entries(totalRepContributors).map(([login, totalContributions]) => {
            const { html_url, avatar_url } = allRepContributors.find(contributor => contributor.login === login);
            return {
                login,
                html_url,
                avatar_url,
                totalContributions,
            };
        })
        .sort((a, b) => {
            let compare = b.totalContributions - a.totalContributions;

            if (compare !== 0) {
                return compare;
            }

            return a.login.localeCompare(b.login);
        });
    }
    catch (error) {
        // If we're running in CI and a failure occurs, use fallback data for contributors
        if (process.env.CI === 'true') {
            console.log(`error in CI: ${error}`);
        }
        else {
            console.log(`error fetching contributors: ${error}`);
        }
    }

    if (allContributors.length === 0) {
        console.log('using fallback contributors.json (offline mode?)');
        allContributors = [
            {
                login: "hideout-bot",
                html_url: "https://github.com/hideout-bot",
                avatar_url: "https://avatars.githubusercontent.com/u/121582168?v=4",
                totalContributions: 9000,
            }
        ];
    }
    else {
        console.log(`Total contributors: ${allContributors.length}`);
    }

    console.time('Write new data');

    let stringifyed = JSON.stringify(allContributors, null, 4);
    const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
    fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'contributors.json'), stringifyed);

    console.timeEnd('Write new data');
})();
