import APIQuery from '../../modules/api-query.mjs';

class TradersQuery extends APIQuery {
    constructor() {
        super('traders');
    }

    async query(options) {
        const { language, gameMode, prebuild} = options;
        const query = `query TarkovDevTraders {
            traders(lang: ${language}, gameMode: ${gameMode}) {
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
                barters {
                    id
                }
            }
        }`;
    
        const tradersData = await this.graphqlRequest(query);
    
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
    }
        
}

const tradersQuery = new TradersQuery();

const doFetchTraders = async (options) => {
    return tradersQuery.run(options);
};

export default doFetchTraders;
