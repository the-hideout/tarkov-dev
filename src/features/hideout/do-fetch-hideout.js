import fetch  from 'cross-fetch';

const doFetchHideout = async (language, prebuild = false) => {
    const bodyQuery = JSON.stringify({
        query: `{
            hideoutStations(lang: ${language}) {
                id
                name
                normalizedName
                levels {
                    level
                        itemRequirements {
                            quantity
                            item {
                                name
                                id
                                iconLink
                            }
                        } 
                    }
                }
            }`,
    });

    const response = await fetch('https://api.tarkov.dev/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: bodyQuery,
    });

    const queryData = await response.json();

    if (queryData.errors) {
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
