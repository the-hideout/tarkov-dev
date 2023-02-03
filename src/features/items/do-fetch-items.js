import fetch  from 'cross-fetch';

import fleaMarketFee from '../../modules/flea-market-fee.js';
import camelcaseToDashes from '../../modules/camelcase-to-dashes.js';

const doFetchItems = async (language, prebuild = false) => {
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
                backgroundColor
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
                image512pxLink
                updated
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
                    currency
                    priceRUB
                    requirements {
                        type
                        value
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
                                normalizedName
                            }
                        }
                    }
                    price
                    currency
                    priceRUB
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
                        projectileCount
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
                        stimEffects {
                            type
                            chance
                            delay
                            duration
                            value
                            percent
                            skillName
                        }
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
                            id
                            name
                            normalizedName
                            properties {
                                ...on ItemPropertiesWeapon {
                                    defaultPreset {
                                        id
                                    }
                                }
                            }
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
                        stimEffects {
                            type
                            chance
                            delay
                            duration
                            value
                            percent
                            skillName
                        }
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
                        defaultPreset {
                            gridImageLink
                            iconLink
                            image512pxLink
                            width
                            height
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
            traders {
                normalizedName
                levels {
                    payRate
                }
            }
            currencies: items(categoryNames: [Money]) {
                shortName
                basePrice
            }
        }`,
    });
    //console.time('items query');
    const [itemData, itemGrids] = await Promise.all([
        fetch('https://api.tarkov.dev/graphql', {
            method: 'POST',
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: QueryBody,
        }).then((response) => response.json()),
        new Promise(resolve => {
            if (prebuild) {
                return resolve({});
            }
            return resolve(fetch(`${process.env.PUBLIC_URL}/data/item-grids.min.json`).then(
                (response) => response.json(),
            )).catch(error => {
                console.log('Error retrieving item grids', error);
                return {};
            });
        })
    ]);
    //console.timeEnd('items query');
    if (itemData.errors) {
        if (itemData.data) {
            for (const error of itemData.errors) {
                let badItem = false;
                if (error.path) {
                    let traverseLimit = 2;
                    if (error.path[0] === 'fleaMarket') {
                        traverseLimit = 1;
                    }
                    badItem = itemData.data;
                    for (let i = 0; i < traverseLimit; i++) {
                        badItem = badItem[error.path[i]];
                    }
                }
                console.log(`Error in items API query: ${error.message}`, error.path);
                if (badItem) {
                    console.log(badItem)
                }
            }
        }
        // only throw error if this is for prebuild or data wasn't returned
        if (
            prebuild || !itemData.data || 
            !itemData.data.items || !itemData.data.items.length || 
            !itemData.data.fleaMarket || 
            !itemData.data.traders || !itemData.data.traders.length || 
            !itemData.data.currencies || !itemData.data.currencies.length
        ) {
            return Promise.reject(new Error(itemData.errors[0].message));
        }
    }

    const flea = itemData.data.fleaMarket;

    const currencies = {};
    for (const currency of itemData.data.currencies) {
        currencies[currency.shortName] = currency.basePrice;
    }

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
            properties: {
                weight: rawItem.weight,
                ...rawItem.properties
            }
        };
    });

    for (const item of allItems) {
        if (item.types.includes('gun') && item.containsItems?.length > 0) {
            item.sellFor = item.sellFor.map((sellFor) => {
                if (sellFor.vendor.normalizedName === 'flea-market') {
                    return {
                        ...sellFor,
                        totalPriceRUB: sellFor.priceRUB,
                        totalPrice: sellFor.price
                    };
                }
                const trader = itemData.data.traders.find(t => t.normalizedName === sellFor.vendor.normalizedName);
                const totalPrices = item.containsItems.reduce(
                    (previousValue, currentValue) => {
                        const part = allItems.find(innerItem => innerItem.id === currentValue.item.id);
                        const partFromSellFor = part.sellFor.find(innerSellFor => innerSellFor.vendor.normalizedName === sellFor.vendor.normalizedName);

                        if (!partFromSellFor) {
                            const thisPartPriceRUB = Math.floor(part.basePrice * trader.levels[0].payRate);
                            previousValue.priceRUB += thisPartPriceRUB;
                            previousValue.price += Math.round(thisPartPriceRUB / currencies[sellFor.currency]);
                            return previousValue;
                        }

                        previousValue.price += partFromSellFor.price;
                        previousValue.priceRUB += partFromSellFor.priceRUB;

                        return previousValue;
                    },
                    {price: sellFor.price, priceRUB: sellFor.priceRUB}
                );
                
                //sellFor.price = totalPrices.price;

                return {
                    ...sellFor,
                    totalPrice: totalPrices.price,
                    totalPriceRUB: totalPrices.priceRUB
                };
            });
        } else {
            item.sellFor = item.sellFor.map((sellFor) => {
                return {
                    ...sellFor,
                    totalPrice: sellFor.price,
                    totalPriceRUB: sellFor.priceRUB
                };
            });
        }
        if (item.types.includes('gun') && item.properties.defaultPreset) {
            // use default preset images for item
            item.receiverImages = {
                iconLink: item.iconLInk,
                gridImageLink: item.gridImageLink,
                image512pxLink: item.image512pxLink
            };
            item.iconLink = item.properties.defaultPreset.iconLink;
            item.gridImageLink = item.properties.defaultPreset.gridImageLink;
            item.image512pxLink = item.properties.defaultPreset.image512pxLink;
        }

        const traderOnlySellFor = item.sellFor.filter(sellFor => sellFor.vendor.normalizedName !== 'flea-market');

        item.traderPrices = traderOnlySellFor.map(sellFor => {
            return {
                price: sellFor.price,
                totalPrice: sellFor.totalPrice,
                currency: sellFor.currency,
                priceRUB: sellFor.priceRUB,
                totalPriceRUB: sellFor.totalPriceRUB,
                trader: {
                    name: sellFor.vendor.name,
                    normalizedName: sellFor.vendor.normalizedName
                }
            }
        }).sort((a, b) => {
            return b.totalPriceRUB - a.totalPriceRUB;
        });

        const bestTraderPrice = item.traderPrices.shift();

        item.traderPrice = bestTraderPrice?.price || 0;
        item.traderTotalPrice = bestTraderPrice?.totalPrice || 0;
        item.traderPriceRUB = bestTraderPrice?.priceRUB || 0;
        item.traderTotalPriceRUB = bestTraderPrice?.totalPriceRUB || 0;
        item.traderCurrency = bestTraderPrice?.currency || 'RUB';
        item.traderName = bestTraderPrice?.trader.name || '?';
        item.traderNormalizedName = bestTraderPrice?.trader.normalizedName || '?';
    }

    return allItems;
};

export default doFetchItems;
