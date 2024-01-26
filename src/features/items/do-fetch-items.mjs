import fetch  from 'cross-fetch';

import APIQuery from '../../modules/api-query.mjs';
import fleaMarketFee from '../../modules/flea-market-fee.mjs';

class ItemsQuery extends APIQuery {
    constructor() {
        super('items');
    }

    async query(language, prebuild = false) {
        const itemLimit = 2000;
        const QueryBody = offset => {
            return `query TarkovDevItems {
                items(lang: ${language}, limit: ${itemLimit}, offset: ${offset}) {
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
                    baseImageLink
                    image512pxLink
                    image8xLink
                    updated
                    sellFor {
                        ...ItemPriceFragment
                    }
                    buyFor {
                        ...ItemPriceFragment
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
                                ...GridFragment
                            }
                            speedPenalty
                            turnPenalty
                            ergoPenalty
                        }
                        ...on ItemPropertiesBarrel {
                            ergonomics
                            recoilModifier
                            slots {
                                ...SlotFragment
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
                                ...GridFragment
                            }
                        }
                        ...on ItemPropertiesContainer {
                            capacity
                            grids {
                                ...GridFragment
                            }
                        }
                        ...on ItemPropertiesFoodDrink {
                            energy
                            hydration
                            units
                            stimEffects {
                                ...StimEffectFragment
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
                        ...on ItemPropertiesHeadphone {
                            ambientVolume
                            distortion
                            distanceModifier
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
                                ...SlotFragment
                            }
                        }
                        ...on ItemPropertiesKey {
                            uses
                        }
                        ...on ItemPropertiesMagazine {
                            capacity
                            malfunctionChance
                            ergonomics
                            recoilModifier
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
                        ...on ItemPropertiesResource {
                            units
                        }
                        ...on ItemPropertiesScope {
                            ergonomics
                            recoilModifier
                            zoomLevels
                        }
                        ...on ItemPropertiesStim {
                            cures
                            useTime
                            stimEffects {
                                ...StimEffectFragment
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
                            recoilAngle
                            recoilDispersion
                            convergence
                            cameraRecoil
                            slots {
                                ...SlotFragment
                            }
                            defaultPreset {
                                id
                            }
                            presets {
                                id
                            }
                        }
                        ...on ItemPropertiesWeaponMod {
                            ergonomics
                            recoilModifier
                            slots {
                                ...SlotFragment
                            }
                        }
                    }
                }
            }
            fragment GridFragment on ItemStorageGrid {
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
            fragment SlotFragment on ItemSlot {
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
            fragment ItemPriceFragment on ItemPrice {
                vendor {
                    name
                    normalizedName
                    __typename
                    ...on TraderOffer {
                        trader {
                            id
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
            fragment StimEffectFragment on StimEffect {
                type
                chance
                delay
                duration
                value
                percent
                skillName
            }`;
        };
        //console.time('items query');
        const [itemData, miscData, itemGrids] = await Promise.all([
            new Promise(async resolve => {
                let offset = 0;
                const retrievedItems = {
                    data: {
                        items: [],
                    },
                    errors: [],
                };
                while (true) {
                    const itemBatch = await this.graphqlRequest(QueryBody(offset));
                    if (itemBatch.errors) {
                        retrievedItems.errors.concat(itemBatch.errors);
                    }
                    if (itemBatch.data && itemBatch.data.items) {
                        if (itemBatch.data.items.length === 0) {
                            break;
                        }
                        retrievedItems.data.items = retrievedItems.data.items.concat(itemBatch.data.items);
                        if (itemBatch.data.items.length < itemLimit) {
                            break;
                        }
                    }
                    if (!itemBatch.errors) {
                        if (!itemBatch.data || !itemBatch.data.items || !itemBatch.data.items.length) {
                            break;
                        }
                    }
                    offset += itemLimit;
                }
                if (retrievedItems.errors.length < 1) {
                    retrievedItems.errors = undefined;
                }
                resolve(retrievedItems);
            }),
            this.graphqlRequest(`{
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
            }`),
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
                !itemData.data.items || !itemData.data.items.length
            ) {
                return Promise.reject(new Error(itemData.errors[0].message));
            }
        }

        if (miscData.errors) {
            if (miscData.data) {
                for (const error of miscData.errors) {
                    let badItem = false;
                    if (error.path) {
                        let traverseLimit = 2;
                        if (error.path[0] === 'fleaMarket') {
                            traverseLimit = 1;
                        }
                        badItem = miscData.data;
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
                prebuild || !miscData.data || 
                !miscData.data.fleaMarket || 
                !miscData.data.traders || !miscData.data.traders.length || 
                !miscData.data.currencies || !miscData.data.currencies.length
            ) {
                return Promise.reject(new Error(miscData.errors[0].message));
            }
        }

        const flea = miscData.data.fleaMarket;

        const currencies = {};
        for (const currency of miscData.data.currencies) {
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

            rawItem.containsItems = rawItem.containsItems.filter(contained => contained != null);

            return {
                ...rawItem,
                fee: fleaMarketFee(rawItem.basePrice, rawItem.lastLowPrice, 1, flea.sellOfferFeeRate, flea.sellRequirementFeeRate),
                slots: rawItem.width * rawItem.height,
                iconLink: rawItem.iconLink,
                grid: grid,
                properties: {
                    weight: rawItem.weight,
                    ...rawItem.properties
                },
                containsItems: rawItem.types.includes('gun') ? [] : rawItem.containsItems,
            };
        });

        for (const item of allItems) {
            /*if (item.types.includes('gun') && item.containsItems?.length > 0) {
                item.sellFor = item.sellFor.map((sellFor) => {
                    if (sellFor.vendor.normalizedName === 'flea-market') {
                        return {
                            ...sellFor,
                            totalPriceRUB: sellFor.priceRUB,
                            totalPrice: sellFor.price
                        };
                    }
                    const trader = miscData.data.traders.find(t => t.normalizedName === sellFor.vendor.normalizedName);
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
            }*/
            /*if (item.types.includes('gun') && item.properties.defaultPreset) {
                // use default preset images for item
                item.receiverImages = {
                    iconLink: item.iconLInk,
                    gridImageLink: item.gridImageLink,
                    image512pxLink: item.image512pxLink
                };
                item.iconLink = item.properties.defaultPreset.iconLink;
                item.gridImageLink = item.properties.defaultPreset.gridImageLink;
                item.image512pxLink = item.properties.defaultPreset.image512pxLink;
            }*/

            const noneTrader = {
                price: 0,
                priceRUB: 0,
                currency: 'RUB',
                vendor: {
                    name: 'unknown',
                    normalizedName: 'unknown',
                },
            }

            // cheapest first
            item.buyFor = item.buyFor.sort((a, b) => {
                return a.priceRUB - b.priceRUB;
            });

            item.buyForBest = item.buyFor[0];

            const buyForTraders = item.buyFor.filter(buyFor => buyFor.vendor.normalizedName !== 'flea-market');

            item.buyForTradersBest = buyForTraders[0] || noneTrader;

            // most profitable first
            item.sellFor = item.sellFor.sort((a, b) => {
                return b.priceRUB - a.priceRUB;
            });

            item.sellForBest = item.sellFor[0];

            const sellForTraders = item.sellFor.filter(sellFor => sellFor.vendor.normalizedName !== 'flea-market');

            item.sellForTradersBest = sellForTraders[0] || noneTrader;
        }

        return allItems;
    }
}

const itemsQuery = new ItemsQuery();

const doFetchItems = async (language, prebuild = false) => {
    return itemsQuery.run(language, prebuild);
};

export default doFetchItems;
