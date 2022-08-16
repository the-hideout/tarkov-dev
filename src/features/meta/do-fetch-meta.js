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
                sellREquirementFeeRate
            }
            armorMaterials(lang: ${language}) {
                id
                name
                destructability
                minRepairDegredation
                maxRepairDegredation
                minRepairKitDegredation
                maxRepairKitDegredation
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

    return {flea: metaData.data.traders, armor: metaData.data.armorMaterials};
};

export default doFetchMeta;
