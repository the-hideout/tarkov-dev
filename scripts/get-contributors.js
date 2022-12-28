const fs = require('fs');
const path = require('path');

const got = require('got');

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
    console.log("Using provided GitHub token to increase rate limit")
} else {
    console.log("No GitHub token provided, rate limit may be reached")
}

(async () => {
    console.log('Loading contributors');
    let allContributors = [];

    try {
        for (const repository of repositories) {
            console.time(`contributors-${repository}`);

            const response = await got(`https://api.github.com/repos/${repository}/contributors`, {
                responseType: 'json',
                headers,
            });
            console.timeEnd(`contributors-${repository}`);

            for (const contributor of response.body) {
                allContributors.push({
                    login: contributor.login,
                    html_url: contributor.html_url,
                    avatar_url: `${contributor.avatar_url}`,
                });
            }
        }

        allContributors = allContributors.filter((value, index, self) => {
            return index === self.findIndex((t) => (
                t.place === value.place && t.login === value.login
            ));
        });
    } catch (error) {
        // If we're running in CI and a failure occurs, use fallback data for contributors
        if (process.env.CI === 'true') {
            console.log(`error: ${error} - using fallback contributors.json`);
            allContributors = [
                {
                    "login": "hideout-bot",
                    "html_url": "https://github.com/hideout-bot",
                    "avatar_url": "https://avatars.githubusercontent.com/u/121582168?v=4"
                }
            ];
        } else {
            console.log(`error fetching contributors: ${error}`);
            process.exit(1);
        }
    }

    fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'contributors.json'), JSON.stringify(allContributors, null, 4));
})();
