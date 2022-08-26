import fleaMarketFee from '../../modules/flea-market-fee';
import camelcaseToDashes from '../../modules/camelcase-to-dashes';
import { langCode } from '../../modules/lang-helpers';

const NOTES = {
    '60a2828e8689911a226117f9': `Can't store Pillbox, Day Pack, LK 3F or MBSS inside`,
};

const doFetchItems = async () => {

    // Get the user selected language
    const language = await langCode();

    // Format the query for item fetching
    const QueryBody = JSON.stringify({
        query: `{
            items(lang: ${language}) {
                id
                bsgCategoryId
                categories {
                    id
                    name
                    normalizedName
                }
                name
                shortName
                basePrice
                normalizedName
                types
                width
                height
                weight
                avg24hPrice
                wikiLink
                changeLast48h
                changeLast48hPercent
                low24hPrice
                high24hPrice
                lastLowPrice
                gridImageLink
                iconLink
                updated
                traderPrices {
                    price
                    currency
                    priceRUB
                    trader {
                        name
                        normalizedName
                    }
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
                                name
                            }
                        }
                    }
                    price
                    priceRUB
                    requirements {
                        type
                        value
                    }
                    currency
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
                                name
                            }
                        }
                    }
                    price
                    priceRUB
                    currency
                    requirements {
                        type
                        value
                    }
                }
                containsItems {
                    count
                    item {
                        id
                    }
                }
                properties {
                    __typename
                    ...on ItemPropertiesAmmo {
                        caliber
                        damage
                        penetrationPower
                        armorDamage
                        fragmentationChance
                        ammoType
                    }
                    ...on ItemPropertiesArmor {
                        class
                        material {
                            id
                            name
                        }
                        zones
                        durability
                        ergoPenalty
                        speedPenalty
                        turnPenalty
                    }
                    ...on ItemPropertiesArmorAttachment {
                        class
                        material {
                            id
                            name
                        }
                        headZones
                        durability
                        ergoPenalty
                        speedPenalty
                        turnPenalty
                    }
                    ...on ItemPropertiesBackpack {
                        capacity
                        grids {
                            width
                            height
                            filters {
                                allowedCategories {
                                    id
                                }
                                allowedItems {
                                    id
                                }
                                excludedCategories {
                                    id
                                }
                                excludedItems {
                                    id
                                }
                            }
                        }
                    }
                    ...on ItemPropertiesChestRig {
                        capacity
                        class
                        material {
                            id
                            name
                        }
                        zones
                        durability
                        ergoPenalty
                        speedPenalty
                        turnPenalty
                        grids {
                            width
                            height
                            filters {
                                allowedCategories {
                                    id
                                }
                                allowedItems {
                                    id
                                }
                                excludedCategories {
                                    id
                                }
                                excludedItems {
                                    id
                                }
                            }
                        }
                    }
                    ...on ItemPropertiesContainer {
                        capacity
                        grids {
                            width
                            height
                            filters {
                                allowedCategories {
                                    id
                                }
                                allowedItems {
                                    id
                                }
                                excludedCategories {
                                    id
                                }
                                excludedItems {
                                    id
                                }
                            }
                        }
                    }
                    ...on ItemPropertiesFoodDrink {
                        energy
                        hydration
                        units
                    }
                    ...on ItemPropertiesGlasses {
                        class
                        durability
                        blindnessProtection
                        material {
                            id
                            name
                        }
                    }
                    ...on ItemPropertiesGrenade {
                        type
                        fuse
                        maxExplosionDistance
                        fragments
                    }
                    ...on ItemPropertiesHelmet {
                        class
                        material {
                            id
                            name
                        }
                        headZones
                        durability
                        ergoPenalty
                        speedPenalty
                        turnPenalty
                        deafening
                        blocksHeadset
                        ricochetY
                        slots {
                            filters {
                                allowedCategories {
                                    id
                                }
                                allowedItems {
                                    id
                                }
                                excludedCategories {
                                    id
                                }
                                excludedItems {
                                    id
                                }
                            }
                        }
                    }
                    ...on ItemPropertiesKey {
                        uses
                    }
                    ...on ItemPropertiesMagazine {
                        capacity
                        malfunctionChance
                        ergonomics
                        recoil
                        capacity
                        loadModifier
                        ammoCheckModifier
                    }
                    ...on ItemPropertiesMedicalItem {
                        uses
                        useTime
                        cures
                    }
                    ...on ItemPropertiesMedKit {
                        hitpoints
                        useTime
                        maxHealPerUse
                        cures
                        hpCostLightBleeding
                        hpCostHeavyBleeding
                    }
                    ...on ItemPropertiesPainkiller {
                        uses
                        useTime
                        cures
                        painkillerDuration
                        energyImpact
                        hydrationImpact
                    }
                    ...on ItemPropertiesPreset {
                        baseItem {
                            name
                            normalizedName
                        }
                        ergonomics
                        recoilVertical
                        recoilHorizontal
                    }
                    ...on ItemPropertiesScope {
                        ergonomics
                        recoil
                        zoomLevels
                    }
                    ...on ItemPropertiesStim {
                        cures
                        useTime
                    }
                    ...on ItemPropertiesSurgicalKit {
                        uses
                        useTime
                        cures
                        minLimbHealth
                        maxLimbHealth
                    }
                    ...on ItemPropertiesWeapon {
                        caliber
                        effectiveDistance
                        ergonomics
                        fireModes
                        fireRate
                        recoilVertical
                        recoilHorizontal
                        sightingRange
                        defaultWidth
                        defaultHeight
                        defaultErgonomics
                        defaultRecoilVertical
                        defaultRecoilHorizontal
                        defaultWeight
                        slots {
                            filters {
                                allowedCategories {
                                    id
                                }
                                allowedItems {
                                    id
                                }
                                excludedCategories {
                                    id
                                }
                                excludedItems {
                                    id
                                }
                            }
                        }
                    }
                    ...on ItemPropertiesWeaponMod {
                        ergonomics
                        recoilModifier
                        recoil
                        slots {
                            filters {
                                allowedCategories {
                                    id
                                }
                                allowedItems {
                                    id
                                }
                                excludedCategories {
                                    id
                                }
                                excludedItems {
                                    id
                                }
                            }
                        }
                    }
                }
            }
            fleaMarket {
                sellOfferFeeRate
                sellRequirementFeeRate
            }
        }`,
    });
    //console.time('items query');
    const [itemData, itemGrids] = await Promise.all([
        fetch('https://api.tarkov.dev/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: QueryBody,
        }).then((response) => response.json()),
        fetch(`${process.env.PUBLIC_URL}/data/item-grids.min.json`).then(
            (response) => response.json(),
        ),
    ]);
    //console.timeEnd('items query');
    if (itemData.errors) return Promise.reject(new Error(itemData.errors[0]));

    const flea = itemData.data.fleaMarket;

    const allItems = itemData.data.items.map((rawItem) => {
        let grid = false;

        if (rawItem.properties?.grids) {
            let gridPockets = [];
            for (const grid of rawItem.properties.grids) {
                gridPockets.push({
                    row: gridPockets.length,
                    col: 0,
                    width: grid.width,
                    height: grid.height,
                });
            }
            /*let gridPockets = [
                {
                    row: 0,
                    col: 0,
                    width: rawItem.properties.grids[0].width,
                    height: rawItem.properties.grids[0].height,
                },
            ];*/

            if (itemGrids[rawItem.id]) {
                gridPockets = itemGrids[rawItem.id];
            }

            grid = {
                height: rawItem.properties.grids[0].height,
                width: rawItem.properties.grids[0].width,
                pockets: gridPockets,
            };

            if (gridPockets.length > 1) {
                grid.height = Math.max(
                    ...gridPockets.map((pocket) => pocket.row + pocket.height),
                );
                grid.width = Math.max(
                    ...gridPockets.map((pocket) => pocket.col + pocket.width),
                );
            }

            // Rigs we haven't configured shouldn't break
            if (!itemGrids[rawItem.id] && !rawItem.types.includes('backpack')) {
                grid = false;
            }
        }

        rawItem.buyFor = rawItem.buyFor.sort((a, b) => {
            return a.priceRUB - b.priceRUB;
        });

        rawItem.sellFor = rawItem.sellFor.map((sellPrice) => {
            return {
                ...sellPrice,
                source: camelcaseToDashes(sellPrice.source),
            };
        });

        rawItem.buyFor = rawItem.buyFor.map((buyPrice) => {
            return {
                ...buyPrice,
                source: camelcaseToDashes(buyPrice.source),
            };
        });

        const container = rawItem.properties?.slots || rawItem.properties?.grids;
        if (container) {
            for (const slot of container) {
                slot.filters.allowedCategories = slot.filters.allowedCategories.map(cat => cat.id);
                slot.filters.allowedItems = slot.filters.allowedItems.map(it => it.id);
                slot.filters.excludedCategories = slot.filters.excludedCategories.map(cat => cat.id);
                slot.filters.excludedItems = slot.filters.excludedItems.map(it => it.id);
            }
        }
        rawItem.categoryIds = rawItem.categories.map(cat => cat.id);

        return {
            ...rawItem,
            fee: fleaMarketFee(rawItem.basePrice, rawItem.lastLowPrice, 1, flea.sellOfferFeeRate, flea.sellRequirementFeeRate),
            fallbackImageLink: `${process.env.PUBLIC_URL}/images/unknown-item-icon.jpg`,
            slots: rawItem.width * rawItem.height,
            // iconLink: `https://assets.tarkov.dev/${rawItem.id}-icon.jpg`,
            iconLink: rawItem.iconLink,
            grid: grid,
            notes: NOTES[rawItem.id],
            properties: {
                weight: rawItem.weight,
                ...rawItem.properties
            }
        };
    });

    for (const item of allItems) {
        if (item.types.includes('gun') && item.containsItems) {
            item.traderPrices = item.traderPrices.map((localTraderPrice) => {
                if (localTraderPrice.trader.normalizedName === 'flea-market') {
                    return localTraderPrice;
                }

                localTraderPrice.price = item.containsItems.reduce(
                    (previousValue, currentValue) => {
                        const part = allItems.find(innerItem => innerItem.id === currentValue.item.id);
                        const partFromSameTrader = part.traderPrices.find(innerTraderPrice => innerTraderPrice.trader.normalizedName === localTraderPrice.trader.normalizedName);

                        if (!partFromSameTrader) {
                            return previousValue;
                        }

                        return partFromSameTrader.price + previousValue;
                    },
                    localTraderPrice.price,
                );
                
                if (localTraderPrice.currency === "USD") {
                    localTraderPrice.priceRUB = localTraderPrice.price * 99.77;
                }
                else {
                    localTraderPrice.priceRUB = localTraderPrice.price;
                }

                return localTraderPrice;
            });

            item.sellFor = item.sellFor.map((sellFor) => {
                if (sellFor.vendor.normalizedName === 'flea-market') {
                    return sellFor;
                }

                sellFor.price = item.containsItems.reduce(
                    (previousValue, currentValue) => {
                        const part = allItems.find(innerItem => innerItem.id === currentValue.item.id);
                        const partFromSellFor = part.sellFor.find(innerSellFor => innerSellFor.vendor.normalizedName === sellFor.vendor.normalizedName);

                        if (!partFromSellFor) {
                            return previousValue;
                        }

                        return partFromSellFor.price + previousValue;
                    },
                    sellFor.price,
                );
                
                if (sellFor.currency === "USD") {
                    sellFor.priceRUB = sellFor.price * 99.77;
                }
                else {
                    sellFor.priceRUB = sellFor.price;
                }

                return sellFor;
            });
        }

        const bestTraderPrice = item.traderPrices
            .sort((a, b) => {
                return b.priceRUB - a.priceRUB;
            })
            .shift();

        item.traderPrice = bestTraderPrice?.price || 0;
        item.traderPriceRUB = bestTraderPrice?.priceRUB || 0;
        item.traderCurrency = bestTraderPrice?.currency || 'RUB';
        item.traderName = bestTraderPrice?.trader.name || '?';
        item.traderNormalizedName = bestTraderPrice?.trader.normalizedName || '?';
    }

    return allItems;
};

export default doFetchItems;
