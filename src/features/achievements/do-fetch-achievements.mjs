import APIQuery from '../../modules/api-query.mjs';

class AchievementsQuery extends APIQuery {
    constructor() {
        super('achievements');
    }

    async query(language, prebuild = false) {
        const query = `query TarkovDevAchievements {
            achievements(lang: ${language}) {
                id
                name
                description
                hidden
                playersCompletedPercent
            }
        }`;
    
        const achievementsData = await this.graphqlRequest(query);
        
        if (achievementsData.errors) {
            if (achievementsData.data) {
                for (const error of achievementsData.errors) {
                    let badItem = false;
                    if (error.path) {
                        badItem = achievementsData.data;
                        for (let i = 0; i < 2; i++) {
                            badItem = badItem[error.path[i]];
                        }
                    }
                    console.log(`Error in achievements API query: ${error.message}`);
                    if (badItem) {
                        console.log(badItem)
                    }
                }
            }
            // only throw error if this is for prebuild or data wasn't returned
            if (
                prebuild || !achievementsData.data || 
                !achievementsData.data.tasks || !achievementsData.data.tasks.length
            ) {
                return Promise.reject(new Error(achievementsData.errors[0].message));
            }
        }
    
        return achievementsData.data.achievements;
    }
}

const achievementsQuery = new AchievementsQuery();

const doFetchAchievements = async (language, prebuild = false) => {
    return achievementsQuery.run(language, prebuild);
};

export default doFetchAchievements;
