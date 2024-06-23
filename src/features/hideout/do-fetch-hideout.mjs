import APIQuery from '../../modules/api-query.mjs';

class HideoutQuery extends APIQuery {
    constructor() {
        super('hideout');
    }

    async query(options) {
        const { language, gameMode, prebuild} = options;
        const query = `query TarkovDevHideout {
            hideoutStations(lang: ${language}, gameMode: ${gameMode}) {
                id
                name
                normalizedName
                imageLink
                levels {
                    id
                    level
                    itemRequirements {
                        quantity
                        item {
                            name
                            id
                            iconLink
                        }
                    } 
                    stationLevelRequirements {
                        station {
                            id
                            normalizedName
                        }
                        level
                    }
                    traderRequirements {
                        trader {
                            id
                            normalizedName
                        }
                        level
                    }
                }
                crafts {
                    id
                }
            }
        }`;

        const queryData = await this.graphqlRequest(query);

        if (queryData.errors) {
            if (queryData.data) {
                for (const error of queryData.errors) {
                    let badItem = false;
                    if (error.path) {
                        badItem = queryData.data;
                        for (let i = 0; i < 2; i++) {
                            badItem = badItem[error.path[i]];
                        }
                    }
                    console.log(`Error in hideoutStations API query: ${error.message}`);
                    if (badItem) {
                        console.log(badItem)
                    }
                }
            }
            // only throw error if this is for prebuild or data wasn't returned
            if (
                prebuild || !queryData.data || 
                !queryData.data.hideoutStations || !queryData.data.hideoutStations.length
            ) {
                return Promise.reject(new Error(queryData.errors[0].message));
            }
        }

        return queryData.data.hideoutStations;
    }
}

const hideoutQuery = new HideoutQuery();

const doFetchHideout = async (options) => {
    return hideoutQuery.run(options);
};

export default doFetchHideout;
