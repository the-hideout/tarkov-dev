import APIQuery from '../../modules/api-query.mjs';

class BossesQuery extends APIQuery {
    constructor() {
        super('bosses');
    }

    async query(options) {
        const { language, gameMode, prebuild} = options;
        const query = `query TarkovDevBosses {
            bosses(lang: ${language}, gameMode: ${gameMode}) {
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
            goonReports(gameMode: ${gameMode}) {
                map {
                    id
                }
                timestamp
            }
        }`.replace(/\s{2,}/g, ' ');
    
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
                !bossesData.data.bosses || !bossesData.data.bosses.length
            ) {
                return Promise.reject(new Error(bossesData.errors[0].message));
            }
        }
    
        return bossesData.data.bosses.map(boss => {
            if (boss.normalizedName === 'knight') {
                boss.reports = bossesData.data.goonReports;
            }
            return boss;
        });
    }
}

const bossesQuery = new BossesQuery();

const doFetchBosses = async (options) => {
    return bossesQuery.run(options);
};

export default doFetchBosses;
