import contributors from './data/contributors.json';
import patreons from './data/patreons.json';

// Helper module that shows the list of supportors for the tarkov.dev project
// Supports include contributors to the-hideout/tarkov-dev repo and patreons

const supporters = {};

for (const patreon of patreons) {
    supporters[patreon.name.toLowerCase()] = {
        ...patreon,
        patreon: true,
    };
}

for (const contributor of contributors) {
    if (supporters[contributor.login.toLowerCase()]) {
        supporters[contributor.login.toLowerCase()] = {
            ...supporters[contributor.login.toLowerCase()],
            github: true,
        };

        if (supporters[contributor.login.toLowerCase()].link) {
            continue;
        }

        supporters[contributor.login.toLowerCase()].link = contributor.html_url;

        continue;
    }

    supporters[contributor.login.toLowerCase()] = {
        name: contributor.login,
        link: contributor.html_url,
        github: true,
    };
}

export default Object.values(supporters);
