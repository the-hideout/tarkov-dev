import fetch  from 'cross-fetch';

export default async function doFetchTraders(language) {
    const bodyQuery = JSON.stringify({
        query: `{
            traders(lang: ${language}) {
                id
                name
                description
                normalizedName
                currency {
                    id
                    name
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

    const tradersData = await response.json();

    if (tradersData.errors?.length > 0) return Promise.reject(new Error(tradersData.errors[0]));

    return tradersData.data.traders;
};
