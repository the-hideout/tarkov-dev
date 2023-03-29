import graphqlRequest from '../../modules/graphql-request.js';

const doFetchBarters = async (language, prebuild = false) => {
    const query = `{
        barters(lang: ${language}) {
            rewardItems {
                item {
                    id
                }
                count
            }
            requiredItems {
                item {
                    id
                }
                count
                attributes {
                    name
                    value
                }
            }
            trader {
                id
                name
                normalizedName
            }
            level
            taskUnlock {
                id
                tarkovDataId
                name
                normalizedName
            }
        }
    }`;

    const bartersData = await graphqlRequest(query);

    if (bartersData.errors) {
        if (bartersData.data) {
            for (const error of bartersData.errors) {
                let badItem = false;
                if (error.path) {
                    badItem = bartersData.data;
                    for (let i = 0; i < 2; i++) {
                        badItem = badItem[error.path[i]];
                    }
                }
                console.log(`Error in barters API query: ${error.message}`);
                if (badItem) {
                    console.log(badItem);
                }
            }
        }
        // only throw error if this is for prebuild or data wasn't returned
        if (
            prebuild ||
            !bartersData.data ||
            !bartersData.data.barters ||
            !bartersData.data.barters.length
        ) {
            return Promise.reject(new Error(bartersData.errors[0].message));
        }
    }

    // validate to make sure barters all have valid requirements and rewards
    return bartersData.data.barters.reduce((barters, barter) => {
        barter.requiredItems = barter.requiredItems.filter(Boolean);
        barter.rewardItems = barter.rewardItems.filter(Boolean);
        if (barter.requiredItems.length > 0 && barter.rewardItems.length > 0) {
            barters.push(barter);
        }
        return barters;
    }, []);
};

export default doFetchBarters;
