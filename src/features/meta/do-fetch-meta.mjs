import APIQuery from '../../modules/api-query.mjs';
import { localStorageWriteJson } from '../settings/settingsSlice.mjs';

class MetaQuery extends APIQuery {
    constructor() {
        super('meta');
    }

    async query(options) {
        const { language, prebuild, gameMode } = options;
        const query = `query TarkovDevMeta {
            fleaMarket(lang: ${language}, gameMode: ${gameMode}) {
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
            handbookCategories(lang: ${language}) {
                id
                name
                normalizedName
                parent {
                    id
                }
                imageLink
            }
            playerLevels {
                level
                exp
                levelBadgeImageLink
            }
            skills(lang: ${language}) {
                id
                name
                imageLink
            }
            mastering {
                id
                weapons {
                    id
                }
                level2
                level3
            }
        }`;
    
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
                !metaData.data.handbookCategories || !metaData.data.handbookCategories.length ||
                !metaData.data.playerLevels 
            ) {
                return Promise.reject(new Error(metaData.errors[0].message));
            }
        }

        localStorageWriteJson('Ti', metaData.data.fleaMarket.sellOfferFeeRate);
        localStorageWriteJson('Tr', metaData.data.fleaMarket.sellRequirementFeeRate);
        localStorageWriteJson('fleaEnabled', metaData.data.fleaMarket.enabled);
        return {
            flea: metaData.data.fleaMarket,
            armor: metaData.data.armorMaterials,
            categories: metaData.data.itemCategories,
            handbookCategories: metaData.data.handbookCategories,
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
