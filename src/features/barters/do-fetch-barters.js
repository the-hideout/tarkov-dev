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
                        priceRUB
                        price
                        currency
                        trader {
                            name
                        }
                    }
                    buyFor {
                        source
                        priceRUB
                        price
                        currency
                    }
                    sellFor {
                        source
                        priceRUB
                        price
                        currency
                    }
                    containsItems {
                        item {
                            id
                        }
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
                        priceRUB
                        price
                        currency
                        trader {
                            name
                        }
                    }
                    buyFor {
                        source
                        priceRUB
                        price
                        currency
                    }
                    sellFor {
                        source
                        priceRUB
                        price
                        currency
                    }
                }
                count
                attributes {
                    name
                    value
                }
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
