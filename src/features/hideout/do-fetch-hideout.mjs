import graphqlRequest from '../../modules/graphql-request.mjs';

const doFetchHideout = async (language, prebuild = false) => {
    const query = `query TarkovDevHideout {
        hideoutStations(lang: ${language}) {
            id
            name
            normalizedName
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
        }
    }`;

    const queryData = await graphqlRequest(query);

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
};

export default doFetchHideout;
