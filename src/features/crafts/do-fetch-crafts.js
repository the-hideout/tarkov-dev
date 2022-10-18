import fetch  from 'cross-fetch';

export default async function doFetchCrafts(language, prebuild = false) {
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
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: bodyQuery,
    });

    const craftsData = await response.json();
    
    if (craftsData.errors) {
        for (const error of craftsData.errors) {
            let badItem = false;
            if (error.path) {
                badItem = craftsData.data;
                for (let i = 0; i < 2; i++) {
                    badItem = badItem[error.path[i]];
                }
            }
            console.log(`Error in crafts API query: ${error.message}`);
            if (badItem) {
                console.log(badItem)
            }
        }
        // only throw error if this is for prebuild or data wasn't returned
        if (
            prebuild || !craftsData.data || 
            !craftsData.data.crafts || !craftsData.data.crafts.length
        ) {
            return Promise.reject(new Error(craftsData.errors[0].message));
        }
    }

    return craftsData.data.crafts.filter(
        (craft) => !craft.source.toLowerCase().includes('christmas'),
    ).map(craft => {
        craft.rewardItems.forEach(contained => {
            contained.item.iconLink = contained.item.properties?.defaultPreset?.iconLink || contained.item.iconLink;
        });
        craft.requiredItems.forEach(contained => {
            contained.item.iconLink = contained.item.properties?.defaultPreset?.iconLink || contained.item.iconLink;
        });
        return craft;
    });;
};
