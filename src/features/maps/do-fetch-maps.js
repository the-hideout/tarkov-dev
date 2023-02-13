import graphqlRequest from '../../modules/graphql-request.js';

const doFetchMaps = async (language, prebuild = false) => {
    const query = `{
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
    }`;

    const mapsData = await graphqlRequest(query);

    if (mapsData.errors) {
        if (mapsData.data) {
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
