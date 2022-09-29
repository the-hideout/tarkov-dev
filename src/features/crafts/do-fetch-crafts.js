import fetch  from 'cross-fetch';

export default async function doFetchCrafts(language) {
    language = await new Promise(resolve => {
        if (!language) {
            return resolve('en');
        }
        return resolve(language);
    });

    const bodyQuery = JSON.stringify({
        query: `{
            crafts(lang: ${language}) {
                station {
                    id
                    name
                    normalizedName
                }
                level
                duration
                rewardItems {
                    item {
                        id
                        basePrice
                        name
                        normalizedName
                        iconLink
                        wikiLink
                        properties {
                            ...on ItemPropertiesWeapon {
                                defaultPreset {
                                    iconLink
                                }
                            }
                        }
                        avg24hPrice
                        lastLowPrice
                        traderPrices {
                            price
                            currency
                            priceRUB
                            trader {
                                name
                                normalizedName
                            }
                        }
                        buyFor {
                            source
                            vendor {
                                name
                                normalizedName
                                __typename
                                ...on TraderOffer {
                                    trader {
                                        id
                                        name
                                        normalizedName
                                    }
                                    minTraderLevel
                                    taskUnlock {
                                        id
                                        tarkovDataId
                                        name
                                    }
                                }
                            }
                            price
                            priceRUB
                            currency
                        }
                        sellFor {
                            source
                            vendor {
                                name
                                normalizedName
                                __typename
                                ...on TraderOffer {
                                    trader {
                                        id
                                        name
                                        normalizedName
                                    }
                                    minTraderLevel
                                    taskUnlock {
                                        id
                                        tarkovDataId
                                        name
                                    }
                                }
                            }
                            price
                            priceRUB
                            currency
                        }
                        types
                    }
                    count
                }
                requiredItems {
                    item {
                        id
                        basePrice
                        name
                        normalizedName
                        iconLink
                        wikiLink
                        properties {
                            ...on ItemPropertiesWeapon {
                                defaultPreset {
                                    iconLink
                                }
                            }
                        }
                        avg24hPrice
                        lastLowPrice
                        traderPrices {
                            price
                            currency
                            priceRUB
                            trader {
                                name
                                normalizedName
                            }
                        }
                        buyFor {
                            source
                            vendor {
                                name
                                normalizedName
                                __typename
                                ...on TraderOffer {
                                    trader {
                                        id
                                        name
                                        normalizedName
                                    }
                                    minTraderLevel
                                    taskUnlock {
                                        id
                                        tarkovDataId
                                        name
                                    }
                                }
                            }
                            price
                            priceRUB
                            currency
                        }
                        sellFor {
                            source
                            vendor {
                                name
                                normalizedName
                                __typename
                                ...on TraderOffer {
                                    trader {
                                        id
                                        name
                                        normalizedName
                                    }
                                    minTraderLevel
                                    taskUnlock {
                                        id
                                        tarkovDataId
                                        name
                                    }
                                }
                            }
                            price
                            priceRUB
                            currency
                        }
                    }
                    count
                    attributes {
                        type
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

    const craftsData = await response.json();

    return craftsData.data.crafts.filter(
        (craft) => !craft.source.toLowerCase().includes('christmas'),
    ).map(craft => {
        craft.rewardItems.forEach(contained => {
            contained.item.iconLink = contained.item.defaultPreset?.iconLink || contained.item.iconLink;
        });
        craft.requiredItems.forEach(contained => {
            contained.item.iconLink = contained.item.defaultPreset?.iconLink || contained.item.iconLink;
        });
        return craft;
    });;
};
