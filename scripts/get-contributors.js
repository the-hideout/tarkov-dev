const fs = require('fs');
const path = require('path');

const got = require('got');

const repositories = [
    'kokarn/tarkov-tools',
    'kokarn/tarkov-tools-discord-bot',
    'kokarn/tarkov-data-api',
    'TarkovTracker/tarkovdata',
];

(async () => {
    console.log('Loading contributors');
    let allContributors = [];

    for(const repository of repositories){
        console.time(`contributors-${repository}`);
        const response = await got(`https://api.github.com/repos/${repository}/contributors`, {
            responseType: 'json',
        });
        console.timeEnd(`contributors-${repository}`);

        for(const contributor of response.body){
            allContributors.push({
                login: contributor.login,
                html_url: contributor.html_url,
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