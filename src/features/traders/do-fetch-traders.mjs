import graphqlRequest from '../../modules/graphql-request.mjs';

export default async function doFetchTraders(language, prebuild = false) {
    const query = `query TarkovDevTraders {
        traders(lang: ${language}) {
            id
            name
            description
            normalizedName
            imageLink
            currency {
                id
                name
                normalizedName
            }
            resetTime
            discount
            levels {
                id
                level
                requiredPlayerLevel
                requiredReputation
                requiredCommerce
                payRate
                insuranceRate
                repairCostMultiplier
            }
        }
    }`;

    const tradersData = await graphqlRequest(query);

    if (tradersData.errors) {
        if (tradersData.data) {
            for (const error of tradersData.errors) {
                let badItem = false;
                if (error.path) {
                    badItem = tradersData.data;
                    for (let i = 0; i < 2; i++) {
                        badItem = badItem[error.path[i]];
                    }
                }
                console.log(`Error in traders API query: ${error.message}`);
                if (badItem) {
                    console.log(badItem)
                }
            }
        }
        // only throw error if this is for prebuild or data wasn't returned
        if (
            prebuild || !tradersData.data || 
            !tradersData.data.traders || !tradersData.data.traders.length
        ) {
            return Promise.reject(new Error(tradersData.errors[0].message));
        }
    }

    return tradersData.data.traders;
};
