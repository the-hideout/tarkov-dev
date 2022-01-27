import contributors from './data/contributors.json';
import patreons from './data/patreons.json';

const supporters = {};

for(const patreon of patreons){
    supporters[patreon.name.toLowerCase()] = {
        ...patreon,
        patreon: true,
    };
}

for(const contributor of contributors){
    if(supporters[contributor.login.toLowerCase()]){
        supporters[contributor.login.toLowerCase()] = {
            ...supporters[contributor.login.toLowerCase()],
            github: true,
        }

        if(supporters[contributor.login.toLowerCase()].link) {
            continue;
        }

        supporters[contributor.login.toLowerCase()].link = contributor.html_url;

        continue;
    }

    supporters[contributor.login.toLowerCase()] = {
        name: contributor.login,
        link: contributor.html_url,
        github: true,
    }
}


export default Object.values(supporters);