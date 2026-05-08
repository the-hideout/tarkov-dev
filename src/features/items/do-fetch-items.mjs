import jp from "jsonpath";

import APIQuery from "../../modules/api-query.mjs";
import { localStorageWriteJson } from "../settings/settingsSlice.mjs";

class ItemsQuery extends APIQuery {
    constructor() {
        super("items");
    }

    async query(options) {
        const { language, gameMode, prebuild } = options;
        //console.time('items query');
        const [itemData, traders, itemGrids] = await Promise.all([
            this.apiRequest(`${gameMode}/items`, { lang: language }),
            this.apiRequest(`${gameMode}/traders`, { lang: language }),
            new Promise(async (resolve) => {
                if (prebuild) {
                    return resolve({});
                }
                try {
                    // if running in rstest, use the local item-grids.json which in public/data/ folder.
                    if (process.env.RSTEST) {
                        const itemGrids = await import("#public/data/item-grids.min.json");
                        resolve(itemGrids);
                    } else {
                        const response = await fetch(`${process.env.PUBLIC_URL}/data/item-grids.min.json`);
                        const itemGrids = await response.json();
                        resolve(itemGrids);
                    }
                } catch (error) {
                    console.log("Error retrieving item grids", error);
                    return resolve({});
                }
            }),
        ]);

        const flea = itemData.fleaMarket;
        localStorageWriteJson("Ti", flea.sellOfferFeeRate);
        localStorageWriteJson("Tr", flea.sellRequirementFeeRate);
        localStorageWriteJson("fleaEnabled", flea.enabled);

        const allItems = Object.values(itemData.items).map((rawItem) => {
            // add buyFor
            rawItem.buyFor = [];
            const fleaBuyPrice = rawItem.avg24hPrice ?? rawItem.lastLowPrice;
            if (fleaBuyPrice) {
                rawItem.buyFor.push({
                    vendor: {
                        name: flea.name,
                        normalizedName: flea.normalizedName,
                    },
                    price: fleaBuyPrice,
                    currency: "RUB",
                    priceRUB: fleaBuyPrice,
                    requirements: [
                        {
                            type: "playerLevel",
                            value: flea.minPlayerLevel,
                        },
                    ],
                });
            }
            for (const offer of rawItem.buyFromTrader ?? []) {
                rawItem.buyFor.push({
                    vendor: {
                        // offer.trader
                        name: traders[offer.trader].name,
                        normalizedName: traders[offer.trader].normalizedName,
                        trader: {
                            id: offer.trader,
                        },
                        minTraderLevel: offer.minTraderLevel,
                        taskUnlock: offer.taskUnlock ? { id: offer.taskUnlock } : null,
                    },
                    price: offer.price,
                    currency: offer.currency,
                    priceRUB: offer.priceRUB,
                    requirements: [
                        {
                            type: "loyaltyLevel",
                            value: offer.minTraderLevel,
                        },
                        offer.taskUnlock ? { type: "questCompleted", stringValue: offer.taskUnlock } : undefined,
                    ].filter(Boolean),
                });
            }
            delete rawItem.buyFromTrader;

            rawItem.sellFor = [];
            if (rawItem.lastLowPrice) {
                rawItem.sellFor.push({
                    vendor: {
                        name: flea.name,
                        normalizedName: flea.normalizedName,
                    },
                    price: rawItem.lastLowPrice,
                    currency: "RUB",
                    priceRUB: rawItem.lastLowPrice,
                    requirements: [
                        {
                            type: "playerLevel",
                            value: flea.minPlayerLevel,
                        },
                    ],
                });
            }
            for (const offer of rawItem.sellToTrader ?? []) {
                rawItem.sellFor.push({
                    vendor: {
                        // offer.trader
                        name: traders[offer.trader].name,
                        normalizedName: traders[offer.trader].normalizedName,
                        trader: {
                            id: offer.trader,
                        },
                        //minTraderLevel: offer.minTraderLevel,
                        //taskUnlock: offer.taskUnlock,
                    },
                    price: offer.price,
                    currency: offer.currency,
                    priceRUB: offer.priceRUB,
                    requirements: [],
                });
            }
            delete rawItem.sellToTrader;

            rawItem.categoryIds = rawItem.categories;
            rawItem.categories = rawItem.categories.map((id) => {
                const cat = itemData.itemCategories[id];
                return {
                    id: cat.id,
                    name: cat.name,
                    normalizedName: cat.normalizedName,
                };
            });

            rawItem.handbookCategories = rawItem.handbookCategories.map((id) => {
                return { id };
            });

            if (rawItem.properties?.defaultPreset) {
                rawItem.properties.defaultPreset = {
                    id: rawItem.properties.defaultPreset,
                };
            }
            if (rawItem.properties?.presets) {
                rawItem.properties.presets = rawItem.properties.presets.map((id) => {
                    return { id };
                });
            }
            if (rawItem.properties?.baseItem) {
                const baseItem = itemData.items[rawItem.properties.baseItem];
                rawItem.properties.baseItem = {
                    id: baseItem.id,
                    name: baseItem.name,
                    normalizedName: baseItem.normalizedName,
                    properties: {
                        defaultPreset: !baseItem.properties.defaultPreset
                            ? null
                            : {
                                  id: baseItem.properties.defaultPreset,
                              },
                    },
                };
            }

            if (rawItem.properties?.stimEffects) {
                rawItem.properties.stimEffects = rawItem.properties.stimEffects
                    .map((stimEffect) => {
                        if (stimEffect.skill) {
                            const skill = itemData.skills.find((s) => s.id === stimEffect.skill);
                            if (!skill) {
                                return;
                            }
                            stimEffect.skillName = skill.name;
                        }
                        return stimEffect;
                    })
                    .filter(Boolean);
            }

            if (rawItem.properties?.armorSlots) {
                for (const slot of rawItem.properties.armorSlots) {
                    if (!slot.allowedPlates) {
                        continue;
                    }
                    slot.allowedPlates = slot.allowedPlates.map((id) => {
                        return { id };
                    });
                }
            }

            if (rawItem.properties?.material) {
                rawItem.properties.material = { id: rawItem.properties.material };
            }

            for (const grid of rawItem.properties?.grids ?? []) {
                grid.filters.allowedCategories = grid.filters.allowedCategories.map((id) => {
                    return { id };
                });
                grid.filters.allowedItems = grid.filters.allowedItems.map((id) => {
                    return { id };
                });
                grid.filters.excludedCategories = grid.filters.excludedCategories.map((id) => {
                    return { id };
                });
                grid.filters.excludedItems = grid.filters.excludedItems.map((id) => {
                    return { id };
                });
            }

            if (rawItem.containsItems?.length) {
                for (const ci of rawItem.containsItems) {
                    ci.item = { id: ci.item };
                }
            }

            const deleteProperties = [
                "propertiesType",
                "contusionRadius",
                "minExplosionDistance",
                "accuracyModifier",
                "allowedAmmo",
                "centerOfImpact",
                "cameraSnap",
                "deviationCurve",
                "deviationMax",
                "maxDurability",
                "repairCost",
                "defaultAmmo",
                "ballisticCoeficient",
                "bulletDiameterMilimeters",
                "bulletMassGrams",
                "durabilityBurnFactor",
                "failureToFeedChance",
                "heatFactor",
                "heavyBleedModifier",
                "initialSpeed",
                "lightBleedModifier",
                "misfireChance",
                "penetrationChance",
                "penetrationPowerDeviation",
                "ricochetChance",
                "stackMaxSize",
                "staminaBurnPerDamage",
                "tracer",
                "tracerColor",
                "moa",
                "default",
                "compressorAttack",
                "compressorGain",
                "compressorRelease",
                "compressorThreshold",
                "dryVolume",
                "armorType",
                "bluntThroughput",
                "ricochetX",
                "ricochetZ",
                "coolingFactor",
                "heatFactor",
            ];
            for (const propName of deleteProperties) {
                delete rawItem.properties?.[propName];
            }

            // calculate grid
            let grid = null;
            if (rawItem.properties?.grids) {
                grid = {};

                let gridPockets = [];
                if (itemGrids[rawItem.id]) {
                    gridPockets = itemGrids[rawItem.id];
                } else if (rawItem.properties.grids.length === 1) {
                    gridPockets = [
                        {
                            row: 0,
                            col: 0,
                            width: rawItem.properties.grids[0].width,
                            height: rawItem.properties.grids[0].height,
                        },
                    ];
                }

                if (gridPockets.length > 1) {
                    grid.height = Math.max(...gridPockets.map((pocket) => pocket.row + pocket.height));
                    grid.width = Math.max(...gridPockets.map((pocket) => pocket.col + pocket.width));
                } else if (rawItem.properties.grids.length >= 1) {
                    grid.height = rawItem.properties.grids[0].height;
                    grid.width = rawItem.properties.grids[0].width;
                } else {
                    grid.height = rawItem.height;
                    grid.width = rawItem.width;
                }
                grid.pockets = gridPockets;
            }
            rawItem.grid = grid;

            rawItem.properties = {
                ...rawItem.properties,
            };

            const container = rawItem.properties?.slots || rawItem.properties?.grids;
            if (container) {
                for (const slot of container) {
                    slot.filters.allowedCategories = slot.filters.allowedCategories.map((cat) => cat.id);
                    slot.filters.allowedItems = slot.filters.allowedItems.map((it) => it.id);
                    slot.filters.excludedCategories = slot.filters.excludedCategories.map((cat) => cat.id);
                    slot.filters.excludedItems = slot.filters.excludedItems.map((it) => it.id);
                }
            }

            return rawItem;
        });

        return {
            items: allItems,
            handbook: {
                fleaMarket: itemData.fleaMarket,
                armorMaterials: Object.values(itemData.armorMaterials),
                itemCategories: Object.values(itemData.itemCategories),
                handbookCategories: Object.values(itemData.handbookCategories),
                playerLevels: itemData.playerLevels,
                skills: itemData.skills,
                mastering: itemData.mastering,
            },
        };
    }
}

const itemsQuery = new ItemsQuery();

const doFetchItems = async (options) => {
    return itemsQuery.run(options);
};

export default doFetchItems;
