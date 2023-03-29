import graphqlRequest from '../../modules/graphql-request.js';

const doFetchMeta = async (language, prebuild = false) => {
    const query = `{
        fleaMarket(lang: ${language}) {
            name
            normalizedName
            enabled
            minPlayerLevel
            sellOfferFeeRate
            sellRequirementFeeRate
        }
        armorMaterials(lang: ${language}) {
            id
            name
            destructibility
            minRepairDegradation
            maxRepairDegradation
            minRepairKitDegradation
            maxRepairKitDegradation
        }
        itemCategories(lang: ${language}) {
            id
            name
            normalizedName
            parent {
                id
            }
        }
    }`;

    const metaData = await graphqlRequest(query);

    if (metaData.errors) {
        if (metaData.data) {
            for (const error of metaData.errors) {
                let badItem = false;
                if (error.path) {
                    let traverseLimit = 2;
                    if (error.path[0] === 'fleaMarket') {
                        traverseLimit = 1;
                    }
                    badItem = metaData.data;
                    for (let i = 0; i < traverseLimit; i++) {
                        badItem = badItem[error.path[i]];
                    }
                }
                console.log(`Error in meta API query: ${error.message}`, error.path);
                if (badItem) {
                    console.log(badItem);
                }
            }
        }
        // only throw error if this is for prebuild or data wasn't returned
        if (
            prebuild ||
            !metaData.data ||
            !metaData.data.fleaMarket ||
            !metaData.data.armorMaterials ||
            !metaData.data.armorMaterials.length ||
            !metaData.data.itemCategories ||
            !metaData.data.itemCategories.length
        ) {
            return Promise.reject(new Error(metaData.errors[0].message));
        }
    }

    return {
        flea: metaData.data.fleaMarket,
        armor: metaData.data.armorMaterials,
        categories: metaData.data.itemCategories,
    };
};

export default doFetchMeta;
