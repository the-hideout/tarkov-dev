import calculateFee from '../../modules/flea-market-fee';
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
                    }
                }
                sellFor {
                    source
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
                        pouches {
                            width
                            height
                        }
                    }
                    ...on ItemPropertiesChestRig {
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
                        pouches {
                            width
                            height
                        }
                    }
                    ...on ItemPropertiesContainer {
                        capacity
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
                    }
                    ...on ItemPropertiesWeaponMod {
                        ergonomics
                        recoil
                    }
                }
            }
        }`,
    });

    const [itemData, itemGrids, itemProps] = await Promise.all([
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
        fetch(`${process.env.PUBLIC_URL}/data/item-props.min.json`).then(
            (response) => response.json(),
        ),
    ]);

    const allItems = itemData.data.items.map((rawItem) => {
        let grid = false;

        rawItem.itemProperties = itemProps[rawItem.id]?.itemProperties || {};
        rawItem.linkedItems = itemProps[rawItem.id]?.linkedItems || {};

        if (itemProps[rawItem.id]?.hasGrid) {
            let gridPockets = [
                {
                    row: 0,
                    col: 0,
                    width: rawItem.itemProperties.grid.pockets[0].width,
                    height:
                        rawItem.itemProperties.grid.totalSize /
                        rawItem.itemProperties.grid.pockets[0].width,
                },
            ];

            if (itemGrids[rawItem.id]) {
                gridPockets = itemGrids[rawItem.id];
            }

            grid = {
                height:
                    rawItem.itemProperties.grid.totalSize /
                    rawItem.itemProperties.grid.pockets[0].width,
                width: rawItem.itemProperties.grid.pockets[0].width,
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

        if (!Array.isArray(rawItem.linkedItems)) {
            rawItem.linkedItems = [];
        }

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

        if (rawItem.itemProperties.defAmmo) {
            rawItem.defAmmo = rawItem.itemProperties.defAmmo;

            delete rawItem.itemProperties.defAmmo;
        }

        if (rawItem.itemProperties.InitialSpeed) {
            rawItem.initialSpeed = rawItem.itemProperties.InitialSpeed;

            delete rawItem.itemProperties.InitialSpeed;
        }

        if (rawItem.itemProperties.CenterOfImpact) {
            rawItem.centerOfImpact = rawItem.itemProperties.CenterOfImpact;

            delete rawItem.itemProperties.CenterOfImpact;
        }

        if (rawItem.itemProperties.SightingRange) {
            rawItem.itemProperties.sightingRange =
                rawItem.itemProperties.SightingRange;

            delete rawItem.itemProperties.SightingRange;
        }

        return {
            ...rawItem,
            fee: calculateFee(rawItem.basePrice, rawItem.lastLowPrice),
            fallbackImageLink: `${process.env.PUBLIC_URL}/images/unknown-item-icon.jpg`,
            slots: rawItem.width * rawItem.height,
            // iconLink: `https://assets.tarkov.dev/${rawItem.id}-icon.jpg`,
            iconLink: rawItem.iconLink,
            grid: grid,
            notes: NOTES[rawItem.id],
            traderPrices: rawItem.traderPrices.map((traderPrice) => {
                return {
                    price: traderPrice.price,
                    priceRUB: traderPrice.priceRUB,
                    currency: traderPrice.currency,
                    trader: traderPrice.trader.name,
                };
            }),
            canHoldItems: itemProps[rawItem.id]?.canHoldItems,
            equipmentSlots: itemProps[rawItem.id]?.slots || [],
            allowedAmmoIds: itemProps[rawItem.id]?.allowedAmmoIds,
            properties: {
                weight: rawItem.weight,
                ...rawItem.properties,
            },
        };
    });

    const itemMap = {};

    for (const item of allItems) {
        itemMap[item.id] = item;
    }

    for (const item of allItems) {
        if (item.types.includes('gun') && item.containsItems) {
            item.traderPrices = item.traderPrices.map((localTraderPrice) => {
                if (localTraderPrice.source === 'fleaMarket') {
                    return localTraderPrice;
                }

                localTraderPrice.price = item.containsItems.reduce(
                    (previousValue, currentValue) => {
                        const partPrice = itemMap[
                            currentValue.item.id
                        ].traderPrices.find(
                            (innerTraderPrice) =>
                                innerTraderPrice.name === localTraderPrice.name,
                        );

                        if (!partPrice) {
                            return previousValue;
                        }

                        return partPrice.price + previousValue;
                    },
                    localTraderPrice.price,
                );

                return localTraderPrice;
            });

            item.sellFor = item.sellFor.map((sellFor) => {
                if (sellFor.source === 'fleaMarket') {
                    return sellFor;
                }

                sellFor.price = item.containsItems.reduce(
                    (previousValue, currentValue) => {
                        const partPrice = itemMap[
                            currentValue.item.id
                        ].sellFor.find(
                            (innerSellFor) =>
                                innerSellFor.source === sellFor.source,
                        );

                        if (!partPrice) {
                            return previousValue;
                        }

                        return partPrice.price + previousValue;
                    },
                    sellFor.price,
                );

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
        item.traderName = bestTraderPrice?.trader || '?';
    }

    return allItems;
};

export default doFetchItems;
