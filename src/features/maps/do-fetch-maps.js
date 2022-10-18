import fetch  from 'cross-fetch';

const doFetchMaps = async (language, prebuild = false) => {
    const bodyQuery = JSON.stringify({
        query: `{
            maps(lang: ${language}) {
                id
                tarkovDataId
                name
                normalizedName
                wiki
                description
                enemies
                raidDuration
                players
                bosses {
                    name
                    normalizedName
                    spawnChance
                    spawnLocations {
                        name
                        chance
                    }
                    escorts {
                        name
                        normalizedName
                        amount {
                            count
                            chance
                        }
                    }
                    spawnTime
                    spawnTimeRandom
                    spawnTrigger
                }
            }
        }`,
    });

    const response = await fetch('https://api.tarkov.dev/graphql', {
        method: 'POST',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: bodyQuery,
    });

    const mapsData = await response.json();

    if (mapsData.errors) {
        for (const error of mapsData.errors) {
            let badItem = false;
            if (error.path) {
                badItem = mapsData.data;
                for (let i = 0; i < 2; i++) {
                    badItem = badItem[error.path[i]];
                }
            }
            console.log(`Error in maps API query: ${error.message}`);
            if (badItem) {
                console.log(badItem)
            }
        }
        // only throw error if this is for prebuild or data wasn't returned
        if (
            prebuild || !mapsData.data || 
            !mapsData.data.maps || !mapsData.data.maps.length
        ) {
            return Promise.reject(new Error(mapsData.errors[0].message));
        }
    }

    return mapsData.data.maps;
};

export default doFetchMaps;
