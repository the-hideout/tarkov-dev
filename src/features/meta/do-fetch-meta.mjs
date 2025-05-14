import APIQuery from '../../modules/api-query.mjs';
import { localStorageWriteJson } from '../settings/settingsSlice.mjs';

class MetaQuery extends APIQuery {
    constructor() {
        super('meta');
    }

    async query(options) {
        const { language, prebuild } = options;
        const query = `query TarkovDevMeta {
            fleaMarket(lang: ${language}) {
                name
                normalizedName
                enabled
                minPlayerLevel
                sellOfferFeeRate
                sellRequirementFeeRate
                foundInRaidRequired
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
            playerLevels {
                level
                exp
                levelBadgeImageLink
            }
            skills(lang: ${language}) {
                id
                name
            }
            mastering {
                id
                weapons {
                    id
                }
                level2
                level3
            }
        }`.replace(/\s{2,}/g, ' ');
    
        const metaData = await this.graphqlRequest(query);
    
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
                        console.log(badItem)
                    }
                }
            }
            // only throw error if this is for prebuild or data wasn't returned
            if (
                prebuild || !metaData.data || 
                !metaData.data.fleaMarket || 
                !metaData.data.armorMaterials || !metaData.data.armorMaterials.length || 
                !metaData.data.itemCategories || !metaData.data.itemCategories.length ||
                !metaData.data.playerLevels 
            ) {
                return Promise.reject(new Error(metaData.errors[0].message));
            }
        }

        localStorageWriteJson('Ti', metaData.data.fleaMarket.sellOfferFeeRate);
        localStorageWriteJson('Tr', metaData.data.fleaMarket.sellRequirementFeeRate);
        return {
            flea: metaData.data.fleaMarket,
            armor: metaData.data.armorMaterials,
            categories: metaData.data.itemCategories,
            playerLevels: metaData.data.playerLevels,
            skills: metaData.data.skills,
            mastering: metaData.data.mastering,
        };
    }
}

const metaQuery = new MetaQuery();

const doFetchMeta = async (language, prebuild = false) => {
    return metaQuery.run(language, prebuild);
};

export default doFetchMeta;
