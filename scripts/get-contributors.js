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

(async () => {
    console.log('Loading contributors');
    let allContributors = [];

    for (const repository of repositories) {
        console.time(`contributors-${repository}`);

        // If a GitHub token is provided, use it to increase the rate limit
        const token = process.env.GITHUB_TOKEN;
        const headers = {};
        if (token) {
            headers.authorization = `token ${token}`;
        }

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

    fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'contributors.json'), JSON.stringify(allContributors, null, 4));
})();
