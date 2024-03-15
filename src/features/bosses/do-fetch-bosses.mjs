import APIQuery from '../../modules/api-query.mjs';

class BossesQuery extends APIQuery {
    constructor() {
        super('bosses');
    }

    async query(language, prebuild = false) {
        const query = `query TarkovDevBosses {
            bosses(lang: ${language}) {
                name
                normalizedName
                imagePortraitLink
                imagePosterLink
                health {
                    id
                    max
                }
                equipment {
                    item {
                        id
                        containsItems {
                            item {
                                id
                            }
                        }
                    }
                    attributes {
                        name
                        value
                    }
                }
                items {
                    id
                }
            }
        }`;
    
        const bossesData = await this.graphqlRequest(query);
    
        if (bossesData.errors) {
            if (bossesData.data) {
                for (const error of bossesData.errors) {
                    let badItem = false;
                    if (error.path) {
                        badItem = bossesData.data;
                        for (let i = 0; i < 2; i++) {
                            badItem = badItem[error.path[i]];
                        }
                    }
                    console.log(`Error in bosses API query: ${error.message}`);
                    if (badItem) {
                        console.log(badItem)
                    }
                }
            }
            // only throw error if this is for prebuild or data wasn't returned
            if (
                prebuild || !bossesData.data || 
                !bossesData.data.maps || !bossesData.data.maps.length
            ) {
                return Promise.reject(new Error(bossesData.errors[0].message));
            }
        }
    
        return bossesData.data.bosses;
    }
}

const bossesQuery = new BossesQuery();

const doFetchBosses = async (language = 'en', prebuild = false) => {
    return bossesQuery.run(language, prebuild);
};

export default doFetchBosses;
