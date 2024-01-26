import APIQuery from '../../modules/api-query.mjs';

class MapsQuery extends APIQuery {
    constructor() {
        super('maps');
    }

    async query(language, prebuild = false) {
        const query = `query TarkovDevMaps {
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
                        spawnKey
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
                    switch {
                        id
                    }
                }
                spawns {
                    zoneName
                    position {
                        x
                        y
                        z
                    }
                    sides
                    categories
                }
                extracts {
                    id
                    name
                    faction
                    position {
                        x
                        y
                        z
                    }
                    outline {
                        x
                        y
                        z
                    }
                    top
                    bottom
                    switches {
                        id
                        name
                    }
                }
                locks {
                    lockType
                    key {
                        id
                    }
                    needsPower
                    position {
                        x
                        y
                        z
                    }
                    outline {
                        x
                        y
                        z
                    }
                    top
                    bottom
                }
                hazards {
                    hazardType
                    name
                    position {
                        x
                        y
                        z
                    }
                    outline {
                        x
                        y
                        z
                    }
                    top
                    bottom
                }
                lootContainers {
                    lootContainer {
                        id
                        name
                        normalizedName
                    }
                    position {
                        x
                        y
                        z
                    }
                }
                switches {
                    id
                    name
                    switchType
                    activatedBy {
                        id
                        name
                    }
                    activates {
                        operation
                        target {
                            __typename
                            ...on MapSwitch {
                                id
                                name
                            }
                            ...on MapExtract {
                                id
                                name
                                faction
                            }
                        }
                    }
                    position {
                        x
                        y
                        z
                    }
                }
                stationaryWeapons {
                    stationaryWeapon {
                        name
                        shortName
                    }
                    position {
                        x
                        y
                        z
                    }
                }
            }
        }`;
    
        const mapsData = await this.graphqlRequest(query);
    
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
    }
}

const mapsQuery = new MapsQuery();

const doFetchMaps = async (language, prebuild = false) => {
    return mapsQuery.run(language, prebuild);
};

export default doFetchMaps;
