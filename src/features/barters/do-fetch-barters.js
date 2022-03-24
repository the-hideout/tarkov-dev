const doFetchBarters = async () => {
    const bodyQuery = JSON.stringify({
        query: `{
        barters {
            rewardItems {
                item {
                id
                name
                normalizedName
                iconLink
                imageLink
                wikiLink
                avg24hPrice
                lastLowPrice
                traderPrices {
                    price
                    trader {
                        name
                    }
                }
                buyFor {
                    source
                    price
                    currency
                }
                sellFor {
                    source
                    price
                    currency
                }
                }
                count
            }
            requiredItems {
                item {
                id
                name
                normalizedName
                iconLink
                imageLink
                wikiLink
                avg24hPrice
                lastLowPrice
                traderPrices {
                    price
                }
                buyFor {
                    source
                    price
                    currency
                }
                sellFor {
                    source
                    price
                    currency
                }
                }
                count
            }
            source
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

    const bartersData = await response.json();

    return bartersData.data.barters;
};

export default doFetchBarters;
