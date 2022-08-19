import { langCode } from '../../modules/lang-helpers';

const doFetchMeta = async () => {
    const language = await langCode();
    const bodyQuery = JSON.stringify({
        query: `{
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
        }`,
    });

    const response = await fetch('https://api.tarkov.dev/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: bodyQuery,
    });

    const metaData = await response.json();
//console.log(metaData.data.fleaMarket);
    return {flea: metaData.data.fleaMarket, armor: metaData.data.armorMaterials, categories: metaData.data.itemCategories};
};

export default doFetchMeta;
