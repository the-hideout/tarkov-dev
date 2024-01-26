import APIQuery from '../../modules/api-query.mjs';

class CraftsQuery extends APIQuery {
    constructor() {
        super('crafts');
    }

    async query(language, prebuild = false) {
        const query = `query TarkovDevCrafts {
            crafts(lang: ${language}) {
                station {
                    id
                    name
                    normalizedName
                }
                level
                duration
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
                        type
                        name
                        value
                    }
                }
                taskUnlock {
                    id
                }
            }
        }`;
    
        const craftsData = await this.graphqlRequest(query);
        
        if (craftsData.errors) {
            if (craftsData.data) {
                for (const error of craftsData.errors) {
                    let badItem = false;
                    if (error.path) {
                        badItem = craftsData.data;
                        for (let i = 0; i < 2; i++) {
                            badItem = badItem[error.path[i]];
                        }
                    }
                    console.log(`Error in crafts API query: ${error.message}`);
                    if (badItem) {
                        console.log(badItem)
                    }
                }
            }
            // only throw error if this is for prebuild or data wasn't returned
            if (
                prebuild || !craftsData.data || 
                !craftsData.data.crafts || !craftsData.data.crafts.length
            ) {
                return Promise.reject(new Error(craftsData.errors[0].message));
            }
        }
    
        // validate to make sure crafts all have valid requirements and rewards
        return craftsData.data.crafts.reduce((crafts, craft) => {
            craft.requiredItems = craft.requiredItems.filter(Boolean);
            craft.rewardItems = craft.rewardItems.filter(Boolean);
            if (craft.requiredItems.length > 0 && craft.rewardItems.length > 0) {
                crafts.push(craft);
            }
            return crafts;
        }, []);
    }
}

const craftsQuery = new CraftsQuery();

export default async function doFetchCrafts(language, prebuild = false) {
    return craftsQuery.run(language, prebuild);
};
