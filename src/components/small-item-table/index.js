import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@mdi/react';
import { 
    mdiCloseOctagon, 
    mdiHelpRhombus,
    mdiCached,
    mdiClipboardList,
    mdiTimerSand,
} from '@mdi/js';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional

import ValueCell from '../value-cell/index.js';
import TraderPriceCell from '../trader-price-cell/index.js';
import CenterCell from '../center-cell/index.js';
import ItemNameCell from '../item-name-cell/index.js';
import FleaPriceCell from '../flea-price-cell/index.js';
import BarterTooltip from '../barter-tooltip/index.js';
import DataTable from '../data-table/index.js';
import LoadingSmall from '../loading-small/index.js';
import ArrowIcon from '../../components/data-table/Arrow.js';

import formatPrice from '../../modules/format-price.js';
import itemSearch from '../../modules/item-search.js';
import { getCheapestBarter, getCheapestCraft } from '../../modules/format-cost-items.js';
import { formatCaliber } from '../../modules/format-ammo.mjs';
import itemCanContain from '../../modules/item-can-contain.js';

import useBartersData from '../../features/barters/index.js';
import useCraftsData from '../../features/crafts/index.js';
import useItemsData from '../../features/items/index.js';
import useMetaData from '../../features/meta/index.js';
import CanvasGrid from '../../components/canvas-grid/index.js';

import './index.css';

function getItemCountPrice(item) {
    if (item.count < 2) return '';
    return (
        <div key="countprice">
            {formatPrice(item.sellForTradersBest.priceRUB)} x {item.count}
        </div>
    );
}

function TraderSellCell(datum, showSlotValue = false) {
    const { t } = useTranslation();
    
    if (!datum.row.original.sellForTradersBest) {
        return (
            <div className="center-content">
                <Tippy
                    placement="bottom"
                    content={t("This item can't be sold to traders")}
                >
                    <Icon
                        path={mdiCloseOctagon}
                        size={1}
                        className="icon-with-text"
                    />
                </Tippy>
            </div>
        );
    }

    const sellForTradersBest = datum.row.original.sellForTradersBest;

    const count = datum.row.original.count;
    const priceRUB = sellForTradersBest.priceRUB;
    const price = sellForTradersBest.price;
    const slots = datum.row.original.width * datum.row.original.height;
    let slotValue = '';
    if (showSlotValue && slots > 1) {
        slotValue = (
            <Tippy
                content={t('Per slot')}
                placement="bottom"
                key="item-sell-to-trader-slot-value"
            >
                <div className="trader-unlock-wrapper">
                    {formatPrice(Math.round(priceRUB / slots))}
                </div>
            </Tippy>
        );
    }
    return [
        <div className="trader-price-content" key="item-sell-to-trader-value">
            <span>
                <img
                    alt={sellForTradersBest.vendor.name}
                    className="trader-icon"
                    loading="lazy"
                    height="40"
                    src={`${process.env.PUBLIC_URL}/images/traders/${sellForTradersBest.vendor.normalizedName}-icon.jpg`}
                    title={sellForTradersBest.vendor.name}
                    width="40"
                />
            </span>
            <span>
                {sellForTradersBest.currency !== 'RUB' ? (
                    <Tippy
                        content={formatPrice(priceRUB*count)}
                        placement="bottom"
                    >
                        <div>
                            {formatPrice(price*count, sellForTradersBest.currency)}
                        </div>
                    </Tippy>
                ) : (
                    <div>
                        {formatPrice(priceRUB*count)}
                    </div>
                )}
                {getItemCountPrice(datum.row.original)}
                {slotValue}
            </span>
        </div>
    ];
}

function shuffleArray(array, randomSeeds) {
    if (!Array.isArray(randomSeeds)) {
        randomSeeds = [];
    }
    for (let i = randomSeeds.length; i < array.length; i++) {
        randomSeeds.push(Math.random());
    }
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(randomSeeds[i] * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const getArmorZoneString = (armorZones) => {
    return armorZones
        ?.map((zoneName) => {
            if (zoneName === 'THORAX') {
                return 'Thorax';
            }

            if (zoneName === 'STOMACH') {
                return 'Stomach';
            }

            if (zoneName === 'Left Arm') {
                return false;
            }

            if (zoneName === 'Right Arm') {
                return 'Arms';
            }

            return zoneName;
        })
        .filter(Boolean)
        .join(', ');
};

const getGuns = (items, targetItem) => {
    let parentItems = [];
    const currentParentItems = items.filter((item) => itemCanContain(item, targetItem, 'slots'));

    for (const parentItem of currentParentItems) {
        if (parentItem.types.includes('gun')) {
            parentItems.push(parentItem);
            continue;
        }

        parentItems = parentItems.concat(getGuns(items, parentItem));
    }
    return parentItems.reduce((parents, current) => {
        if (!parents.some(item => item.id === current.id)) {
            parents.push(current);
        }
        return parents;
    }, []);
};

const getAttachmentPoints = (items, targetItem) => {
    return items
        .filter((parentItem) => itemCanContain(parentItem, targetItem, 'slots'))
        .map((item) => {
            return {
                ...item,
                fitsTo: getGuns(items, item),
            };
        });
};

const ConditionalWrapper = ({ condition, wrapper, children }) => {
    return condition ? wrapper(children) : children;
};

function SmallItemTable(props) {
    let {
        // common
        maxItems,
        nameFilter,
        defaultRandom,
        typeFilter,
        containedInFilter,
        sortBy,
        sortByDesc,
        // columns
        instaProfit,
        traderPrice,
        traderFilter,
        loyaltyLevelFilter,
        traderValue,
        traderBuybackFilter,
        caliberFilter,
        traderBuyback,
        fleaPrice,
        grid,
        gridSlots,
        innerSize,
        slotRatio,
        pricePerSlot,
        barterPrice,
        fleaValue,
        hideBorders,
        autoScroll = true,
        armorClass,
        armorZones,
        maxDurability,
        effectiveDurability,
        repairability,
        stats,
        typeLimit,
        excludeTypeFilter,
        minPropertyFilter,
        maxPropertyFilter,
        maxPrice,
        bsgCategoryFilter,
        showContainedItems,
        weight,
        showNetPPS,
        showAllSources = false,
        cheapestPrice,
        sumColumns,
        idFilter,
        useClassEffectiveDurability,
        excludeArmor,
        requireArmor,
        minSlots,
        has3Slot,
        has4Slot,
        caliber,
        damage,
        penetrationPower,
        armorDamage,
        fragChance,
        blindnessProtection,
        useAllProjectileDamage,
        hydration,
        energy,
        hydrationCost,
        energyCost,
        totalEnergyCost,
        provisionValue,
        soundSuppression,
        blocksHeadset,
        showAttachments,
        includeBlockingHeadset,
        ergonomics,
        ergoCost,
        recoilModifier,
        showAttachTo,
        attachesToItemFilter,
        showSlotValue,
        showPresets,
        showRestrictedType,
        attachmentMap,
        showGunDefaultPresetImages,
        useBarterIngredients,
        useCraftIngredients,
        minPenetration,
        maxPenetration,
        distance,
    } = props;
    const { t } = useTranslation();
    const settings = useSelector((state) => state.settings);

    const { data: meta } = useMetaData();
    const { materialDestructibilityMap, materialRepairabilityMap } = useMemo(
        () => {
            const destruct = {};
            const repair = {};
            if (!meta?.armor) return {materialDestructibilityMap: destruct, materialRepairabilityMap: repair };
            meta.armor.forEach(armor => {
                destruct[armor.id] = armor.destructibility;
                repair[armor.id] = (100-Math.round((armor.minRepairDegradation + armor.maxRepairDegradation)/2*100));
            });
            return {materialDestructibilityMap: destruct, materialRepairabilityMap: repair };
        },
        [meta]
    );

    // Create a constant of all data returned
    const {data: items, status: itemsStatus} = useItemsData();

    const itemCount = items ? items.length : 0;
    const randomSeeds = useMemo(() => {
        const seeds = [];
        if (!defaultRandom) {
            return seeds;
        }
        for (let i = seeds.length; i < itemCount; i++) {
            seeds.push(Math.random());
        }
        return seeds;
    },[itemCount, defaultRandom]);

    const { data: barters } = useBartersData();

    const { data: crafts } = useCraftsData();

    const containedItems = useMemo(() => {
        if (!containedInFilter) 
            return {};
        const filterItems = {};
        containedInFilter.forEach(ci => {
            if (!ci) {
                return;
            }
            filterItems[ci.item.id] = ci.count;
        });
        return filterItems;
    }, [containedInFilter]);

    const data = useMemo(() => {
        const formatItem = itemData => {
            const formattedItem = {
                id: itemData.id,
                name: itemData.name,
                shortName: itemData.shortName,
                normalizedName: itemData.normalizedName,
                avg24hPrice: itemData.avg24hPrice,
                lastLowPrice: itemData.lastLowPrice,
                // iconLink: `https://assets.tarkov.dev/${itemData.id}-icon.jpg`,
                iconLink: itemData.iconLink || `${process.env.PUBLIC_URL}/images/unknown-item-icon.jpg`,
                instaProfit: 0,
                itemLink: `/item/${itemData.normalizedName}`,
                types: itemData.types,
                buyFor: itemData.buyFor.filter(buyFor => {
                    if (!showAllSources && !settings.hasFlea && buyFor.vendor.normalizedName === 'flea-market') 
                        return false;
                    if (!showAllSources && settings[buyFor.vendor.normalizedName] < buyFor.vendor.minTraderLevel) 
                        return false;
                    if (!showAllSources && settings.useTarkovTracker && buyFor.vendor.taskUnlock && !settings.completedQuests.includes(buyFor.vendor.taskUnlock.id)) 
                        return false;
                    return true;
                }),
                sellFor: itemData.sellFor,
                buyOnFleaPrice: itemData.buyFor.find(
                    (buyPrice) => buyPrice.vendor.normalizedName === 'flea-market' && (showAllSources || settings.hasFlea),
                ),
                barters: barters.filter(
                    (barter) => {
                        if (!barter.rewardItems[0]) {
                            return false;
                        }
                        return barter.rewardItems[0].item.id === itemData.id;
                    },
                ),
                grid: itemData.grid,
                ratio: (itemData.properties.capacity / (itemData.width * itemData.height)).toFixed(2),
                size: itemData.properties.capacity,
                slots: itemData.width * itemData.height,
                armorClass: itemData.properties.class,
                armorZone: getArmorZoneString(itemData.properties.zones || itemData.properties.headZones),
                maxDurability: itemData.properties.durability,
                effectiveDurability: Math.floor(itemData.properties?.durability / materialDestructibilityMap[itemData.properties?.material?.id]),
                repairability: materialRepairabilityMap[itemData.properties?.material?.id],
                stats: `${Math.round((itemData.properties.speedPenalty || 0) *100)}% / ${Math.round((itemData.properties.turnPenalty || 0) *100)}% / ${itemData.properties.ergoPenalty || 0}`,
                weight: itemData.weight,
                properties: itemData.properties,
                categories: itemData.categories,
                categoryIds: itemData.categoryIds,
                width: itemData.width,
                height: itemData.height,
                cached: itemData.cached,
                pricePerSlot: 0,
            };

            formattedItem.sellForTradersBest = itemData.sellFor.reduce((best, sellFor) => {
                if (sellFor.vendor.normalizedName === 'flea-market') {
                    return best;
                }
                if (traderBuybackFilter && traderFilter !== sellFor.vendor.normalizedName) {
                    return best;
                }

                if (!showAllSources && !settings.jaeger && sellFor.vendor.normalizedName === 'jaeger') {
                    return best;
                }

                if (!best || best.priceRUB < sellFor.priceRUB) {
                    return sellFor;
                }

                return best;
            }, undefined);

            if (!showAllSources && !settings.hasFlea) {
                formattedItem.buyOnFleaPrice = 0
            }

            if (formattedItem.buyOnFleaPrice && formattedItem.buyOnFleaPrice.price > 0) {
                formattedItem.instaProfit = formattedItem.sellForTradersBest?.priceRUB - formattedItem.buyOnFleaPrice.price;
            }

            if (formattedItem.barters.length > 0) {
                formattedItem.cheapestBarter = getCheapestBarter(itemData, {barters: formattedItem.barters, settings, allowAllSources: showAllSources, useBarterIngredients, useCraftIngredients});
            }
            formattedItem.cheapestObtainPrice = Number.MAX_SAFE_INTEGER;
            formattedItem.cheapestObtainInfo = null;
            if (formattedItem.cheapestBarter && (settings.hasFlea || showAllSources)) {
                //console.log(formattedItem.cheapestBarter.barter, settings[formattedItem.cheapestBarter.barter.trader.normalizedName]);
                //if (!showAllSources && settings[buyFor.vendor.normalizedName] < buyFor.vendor.minTraderLevel)
                formattedItem.cheapestObtainPrice = formattedItem.cheapestBarter.pricePerUnit;
                formattedItem.cheapestObtainInfo = formattedItem.cheapestBarter;
            }
            for (const buyFor of formattedItem.buyFor) {
                if (buyFor.priceRUB && buyFor.priceRUB < formattedItem.cheapestObtainPrice) {
                    formattedItem.cheapestObtainPrice = buyFor.priceRUB;
                    formattedItem.cheapestObtainInfo = buyFor;
                }
            }
            if (!formattedItem.cheapestObtainInfo && (settings.hasFlea || showAllSources) && !traderBuybackFilter) {
                const cheapestCraft = getCheapestCraft(itemData, {crafts, settings, allowAllSources: showAllSources, useBarterIngredients, useCraftIngredients});
                if (cheapestCraft) {
                    formattedItem.cheapestObtainInfo = cheapestCraft;
                    formattedItem.cheapestObtainPrice = Math.round(cheapestCraft.price / cheapestCraft.count);
                }
            }
            if (formattedItem.cheapestObtainInfo === null) {
                formattedItem.cheapestObtainPrice = 0;
            }

            if (traderBuybackFilter && formattedItem.cheapestObtainPrice) {
                const thisTraderSell = formattedItem.sellFor.find(sellFor => sellFor.vendor.normalizedName === traderFilter);
                if (thisTraderSell) {
                    formattedItem.buyback = thisTraderSell.priceRUB / formattedItem.cheapestObtainPrice;
                }
            }
            
            if (formattedItem.cheapestObtainPrice) {
                formattedItem.pricePerSlot = showNetPPS ? Math.floor(formattedItem.cheapestObtainPrice / (itemData.properties.capacity - (itemData.width * itemData.height)))
                              : formattedItem.cheapestObtainPrice / itemData.properties.capacity
            }

            formattedItem.count = containedItems[itemData.id] || 1;

            return formattedItem;
        };
        let returnData = items
            .filter((item) => {
                return !item.types.includes('disabled');
            })
            .filter((item) => {
                if (!typeFilter) {
                    return true;
                }

                if (typeFilter === 'gun') {
                    if (item.types.includes('gun')) {
                        if (!item.properties?.defaultPreset) {
                            return true;
                        }
                        return false;
                    }
                    if (!item.types.includes('preset')) {
                        return false;
                    }
                    const baseItem = items.find(i => i.id === item.properties.baseItem.id);
                    if (!baseItem?.types.includes('gun')) {
                        return false;
                    }
                    if (baseItem.properties.defaultPreset.id !== item.id) {
                        return false;
                    }
                    return true;
                }

                let typeFilterList = typeFilter;

                if (typeFilter && !Array.isArray(typeFilter)) {
                    typeFilterList = [typeFilterList];
                }

                return item.types.some((itemType) =>
                    typeFilterList.includes(itemType),
                );
            })
            .filter((item) => {
                if (!typeLimit) {
                    return true;
                }

                let typeLimitList = typeLimit;

                if (typeLimit && !Array.isArray(typeLimit)) {
                    typeLimitList = [typeLimitList];
                }

                return typeLimitList.every((itemType) =>
                    item.types.includes(itemType),
                );
            })
            .filter((item) => {
                if (!excludeTypeFilter) {
                    return true;
                }

                let excludeTypeFilterList = excludeTypeFilter;

                if (excludeTypeFilter && !Array.isArray(excludeTypeFilter)) {
                    excludeTypeFilterList = [excludeTypeFilterList];
                }

                return !item.types.some((itemType) =>
                    excludeTypeFilterList.includes(itemType),
                );
            })
            .filter((item) => {
                if (!minPropertyFilter) {
                    return true;
                }

                //console.log(item.properties[minPropertyFilter.property], minPropertyFilter.value);
                if (item.properties[minPropertyFilter.property] < minPropertyFilter.value) {
                    return false;
                }

                return true;
            })
            .filter((item) => {
                if (!maxPropertyFilter) {
                    return true;
                }

                if (item.properties[maxPropertyFilter.property] > maxPropertyFilter.value) {
                    return false;
                }

                return true;
            })
            .filter((item) => {
                if (!bsgCategoryFilter) {
                    return true;
                }
                let categories = bsgCategoryFilter;
                if (!Array.isArray(categories)) {
                    categories = [categories];
                }

                return item.categories.some(category => categories.includes(category.id));
            })
            .filter(item => {
                if (!containedInFilter) {
                    return true;
                }
                return containedItems[item.id];
            })
            .filter(item => {
                if (includeBlockingHeadset) {
                    return true;
                }
                return !item.properties.blocksHeadset;
            })
            .map((itemData) => {
                return formatItem(itemData);
            })
            .filter((item) => {
                if (!maxPrice) {
                    return true;
                }

                if (item.cheapestObtainPrice > maxPrice) {
                    return false;
                }

                return true;
            })
            .filter(item => {
                if (typeof minPenetration === 'undefined' && typeof maxPenetration === 'undefined') {
                    return true;
                }
                const min = minPenetration || 0;
                let max = typeof maxPenetration === 'undefined' ? Number.MAX_SAFE_INTEGER : maxPenetration;
                if (max === 60) {
                    max = Number.MAX_SAFE_INTEGER;
                }
                const pen = item.properties?.penetrationPower;
                if (typeof pen === 'undefined') {
                    return false;
                }
                return pen >= min && pen <= max;
            });

        if (nameFilter) {
            returnData = itemSearch(returnData, nameFilter);
        }

        if (traderFilter) {
            returnData = returnData.filter((item) => {
                item.buyFor = item.buyFor.filter(
                    (buy) => buy.vendor.normalizedName === traderFilter,
                );
                item.sellFor = item.sellFor?.filter(
                    (sell) => sell.vendor.normalizedName === traderFilter,
                );

                if (item.buyOnFleaPrice) {
                    item.instaProfit = item.sellForTradersBest?.priceRUB - item.buyOnFleaPrice.price;
                } else if (traderBuybackFilter && item.cheapestObtainPrice) {
                    item.instaProfit = item.sellForTradersBest?.priceRUB - item.cheapestObtainPrice;
                }

                if (traderBuybackFilter) {
                    return true;
                }

                if (!loyaltyLevelFilter) {
                    return item.buyFor[0];
                }

                if (!item.buyFor[0]) {
                    return false;
                }

                return (
                    item.buyFor[0].requirements[0].value === loyaltyLevelFilter
                );
            });
        }

        if (traderBuybackFilter) {
            returnData = returnData
                .filter((item) => item.instaProfit !== 0)
                .filter((item) => item.cheapestObtainPrice > 0)
                .filter((item) => item.sellForTradersBest && item.sellForTradersBest.priceRUB > 500)
                .sort((a, b) => {
                    return b.buyback - a.buyback;
                });
        }

        if (defaultRandom && !nameFilter) {
            shuffleArray(returnData, randomSeeds);
        }

        if (idFilter) {
            const idArray = Array.isArray(idFilter) ? idFilter : [idFilter];
            returnData = returnData.filter(item => idArray.includes(item.id));
        }

        if (excludeArmor) {
            returnData = returnData.filter(item => !item.properties.class);
        }

        if (requireArmor) {
            returnData = returnData.filter(item => item.properties.class);
        }

        if (minSlots) {
            returnData = returnData.filter(item => item.properties.capacity >= minSlots);
        }

        if (has3Slot) {
            returnData = returnData.filter(item => item.properties?.grids?.some(grid => grid.width >= 3 || grid.height >= 3));
        }

        if (has4Slot) {
            returnData = returnData.filter(item => item.properties?.grids?.some(grid => grid.width * grid.height >= 4));
        }

        if (caliberFilter) {
            let filterArray = [];
            if (!Array.isArray(caliberFilter)) {
                filterArray.push(caliberFilter);
            } else {
                filterArray.push(...caliberFilter);
            }
            returnData = returnData.filter(item => {
                if (caliberFilter.length < 1) 
                    return true;
                let caliber = formatCaliber(item.properties.caliber, item.properties.ammoType);
                if (!caliber) {
                    return false;
                }
                return caliberFilter.includes(caliber);
            }).sort((a, b) => {
                const caliberA = formatCaliber(a.properties.caliber, a.properties.ammoType);
                const caliberB = formatCaliber(b.properties.caliber, b.properties.ammoType);
                if (caliberA === caliberB) {
                    const damageA = a.properties.damage;
                    const damageB = b.properties.damage;
                    if (damageA === damageB)
                        return a.name.localeCompare(b.name);
                    return damageA - damageB;
                }
                return caliberA.localeCompare(caliberB);
            });
        }

        if (showAttachments) {
            returnData.forEach(item => {
                item.subRows = items.filter(linkedItem => {
                    if (!item.properties?.slots) 
                        return false;
                    for (const slot of item.properties.slots) {
                        const included = slot.filters.allowedItems.includes(linkedItem.id) ||
                            linkedItem.categoryIds.some(catId => slot.filters.allowedCategories.includes(catId));
                        const excluded = slot.filters.excludedItems.includes(linkedItem.id) ||
                            linkedItem.categoryIds.some(catId => slot.filters.excludedCategories.includes(catId));
                        if (included && !excluded) 
                            return true;
                    }
                    return false;
                }).map(item => formatItem(item));
            });
        }

        if (showPresets) {
            returnData.forEach(item => {
                item.subRows = items.filter(linkedItem => {
                    if (!linkedItem.types.includes('preset')){ 
                        return false;
                    }
                    return linkedItem.properties.baseItem.id === item.properties?.baseItem?.id && linkedItem.id !== item.id;
                }).sort((a, b) => {
                    return b.name.localeCompare(a.name);
                }).map(item => formatItem(item));
            });
            returnData.sort((a, b) => {
                return a.name.localeCompare(b.name);
            });
        }

        if (attachmentMap) {
            returnData.forEach(item => {
                item.subRows = items.filter(attachmentItem => {
                    return attachmentMap[item.id]?.includes(attachmentItem.id);
                }).map(item => formatItem(item));
            });
        }

        if (showGunDefaultPresetImages) {
            returnData.forEach(item => {
                if (!item.types.includes('gun')) {
                    return;
                }
                const preset = items.find(it => it.id === item.properties?.defaultPreset?.id);
                if (preset) {
                    item.iconLink = preset.iconLink;
                }
            });
        }

        if (showAttachTo || attachesToItemFilter) {
            returnData.forEach(item => {
                item.fitsTo = getGuns(items, item);
            });
        }

        if (attachesToItemFilter) {
            returnData = returnData.filter(item => {
                for (const baseItem of item.fitsTo) {
                    if (baseItem.id === attachesToItemFilter.id) {
                        return true;
                    }
                }

                return false;
            });
        }

        if (showAttachTo) {
            returnData.forEach(formattedItem => {
                formattedItem.subRows = getAttachmentPoints(items, formattedItem).filter((item) => {
                    if (!attachesToItemFilter) {
                        return true;
                    }

                    for (const subRow of item.fitsTo) {
                        if (subRow.id === attachesToItemFilter.id) {
                            return true;
                        }
                    }

                    return false;
                }).map(parentItem => formatItem(parentItem));
            });
        } 

        return returnData;
    }, [
        nameFilter,
        containedInFilter,
        containedItems,
        caliberFilter,
        defaultRandom,
        randomSeeds,
        items,
        typeFilter,
        traderFilter,
        loyaltyLevelFilter,
        traderBuybackFilter,
        barters,
        crafts,
        excludeTypeFilter,
        typeLimit,
        minPropertyFilter,
        maxPropertyFilter,
        maxPrice,
        bsgCategoryFilter,
        showNetPPS,
        materialDestructibilityMap,
        materialRepairabilityMap,
        settings,
        showAllSources,
        idFilter,
        excludeArmor,
        requireArmor,
        minSlots,
        has3Slot,
        has4Slot,
        showAttachments,
        includeBlockingHeadset,
        showAttachTo,
        attachesToItemFilter,
        showPresets,
        attachmentMap,
        showGunDefaultPresetImages,
        useBarterIngredients,
        useCraftIngredients,
        minPenetration,
        maxPenetration
    ]);
    const lowHydrationCost = useMemo(() => {
        if (!totalEnergyCost && !provisionValue) {
            return 0;
        }
        let lowHyd = Number.MAX_SAFE_INTEGER;
        data.forEach(item => {
            if (item.properties.hydration > 0) {
                if (item.cheapestObtainPrice) {
                    const hydrationCost = item.cheapestObtainPrice / item.properties.hydration;
                    if (hydrationCost < lowHyd) {
                        lowHyd = hydrationCost;
                    }
                }
            }
        });
        if (lowHyd === Number.MAX_SAFE_INTEGER) {
            lowHyd = 0;
        }
        return lowHyd;
    }, [
        data,
        totalEnergyCost,
        provisionValue,
    ]);
    const lowEnergyCost = useMemo(() => {
        if (!totalEnergyCost && !provisionValue) {
            return 0;
        }
        let lowEng = Number.MAX_SAFE_INTEGER;
        data.forEach(item => {
            if (item.properties.energy > 0) {
                if (item.cheapestObtainPrice) {
                    let energyCost = item.cheapestObtainPrice / item.properties.energy;
                    if (item.properties.hydration < 0 && totalEnergyCost) {
                        energyCost = energyCost + ((item.properties.hydration * -1) * lowHydrationCost);
                    }
                    if (energyCost > 0 && energyCost < lowEng) {
                        lowEng = energyCost;
                    }
                }
            }
        });
        return lowEng;
    }, [
        data,
        totalEnergyCost,
        lowHydrationCost,
        provisionValue,
    ]);

    const columns = useMemo(() => {
        const useColumns = [];
        if (showAttachments || showAttachTo || showPresets || attachmentMap) {
            useColumns.push({
                id: 'expander',
                Header: ({
                    getToggleAllRowsExpandedProps,
                    isAllRowsExpanded,
                }) =>
                    // <span {...getToggleAllRowsExpandedProps()}>
                    //     {isAllRowsExpanded ? 'v' : '>'}
                    // </span>
                    null,
                Cell: ({ row }) =>
                    // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
                    // to build the toggle for expanding a row
                    row.canExpand ? (
                        <span
                            {...row.getToggleRowExpandedProps({
                                style: {
                                    // We can even use the row.depth property
                                    // and paddingLeft to indicate the depth
                                    // of the row
                                    // paddingLeft: `${row.depth * 2}rem`,
                                },
                            })}
                        >
                            {row.isExpanded ? (
                                <ArrowIcon />
                            ) : (
                                <ArrowIcon className={'arrow-right'} />
                            )}
                        </span>
                    ) : null,
            });
        }
        useColumns.push({
            Header: t('Name'),
            id: 'name',
            accessor: 'name',
            Cell: (props) => {
                return (
                    <ItemNameCell
                        item={props.row.original}
                        showContainedItems={showContainedItems}
                        showRestrictedType={showRestrictedType}
                        items={items}
                    />
                );
            },
        });

        if (fleaValue) {
            useColumns.push({
                Header: t('Sell to Flea'),
                id: 'fleaValue',
                accessor: (d) => Number(d.lastLowPrice),
                sortType: (a, b, columnId, desc) => {
                    const aFlea = a.values.fleaValue || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    const bFlea = b.values.fleaValue || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    return aFlea - bFlea;
                },
                Cell: (allData) => {
                    if (allData.row.original.types.includes('noFlea')) {
                        return (
                            <ValueCell
                                value={allData.value}
                                noValue={
                                    <div className="center-content">
                                        <Tippy
                                            placement="bottom"
                                            content={t("This item can't be sold on the Flea Market")}
                                        >
                                            <Icon
                                                path={mdiCloseOctagon}
                                                size={1}
                                                className="icon-with-text"
                                            />
                                        </Tippy>
                                    </div>
                                }
                            />
                        );
                    }
                    const slots = allData.row.original.width * allData.row.original.height;
                    let noValueTip = t('Not scanned on the Flea Market');
                    let noValueIcon = mdiHelpRhombus;
                    if (allData.row.original.cached) {
                        noValueTip = t('Flea market prices loading');
                        noValueIcon = mdiTimerSand;
                    }
                    return (
                        <ValueCell
                            value={allData.value}
                            noValue={
                                <div className="center-content">
                                    <Tippy
                                        placement="bottom"
                                        content={noValueTip}
                                    >
                                        <Icon
                                            path={noValueIcon}
                                            size={1}
                                            className="icon-with-text"
                                        />
                                    </Tippy>
                                </div>
                            }
                            slots={slots}
                            showSlotValue={showSlotValue}
                        />
                    );
                },
                position: fleaValue,
            });
        }

        if (fleaPrice) {
            useColumns.push({
                Header: t('Buy on Flea'),
                id: 'fleaPrice',
                accessor: (d) => Number(d.buyOnFleaPrice?.price),
                sortType: (a, b, columnId, desc) => {
                    const aFlea = a.values.fleaPrice || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    const bFlea = b.values.fleaPrice || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    
                    return aFlea - bFlea;
                },
                Cell: FleaPriceCell,
                position: fleaPrice,
            });
        }

        if (barterPrice) {
            useColumns.push({
                Header: t('Barter'),
                id: 'barterPrice',
                accessor: (d) => Number(d.cheapestBarter?.price),
                sortType: (a, b, columnId, desc) => {
                    const aBart = a.values.barterPrice || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    const bBart = b.values.barterPrice || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    
                    return aBart - bBart;
                },
                Cell: (props) => {
                    return (
                        <Tippy
                            placement="bottom"
                            interactive={true}
                            content={
                                <BarterTooltip
                                    barter={props.row.original.cheapestBarter?.barter}
                                    allowAllSources={showAllSources}
                                />
                            }
                        >
                            <div className="center-content">
                                {props.value ? formatPrice(props.value) : '-'}
                            </div>
                        </Tippy>
                    );
                },
                position: barterPrice,
            });
        }

        if (traderValue) {
            useColumns.push({
                Header: t('Sell to Trader'),
                id: 'traderValue',
                accessor: (d) => Number(d.sellForTradersBest?.priceRUB || 0),
                Cell: (datum) => TraderSellCell(datum, showSlotValue),
                summable: true,
                position: traderValue,
            });
        }

        if (instaProfit) {
            useColumns.push({
                Header: t('InstaProfit'),
                id: 'instaProfit',
                accessor: 'instaProfit',
                sortDescFirst: true,
                sortType: (a, b, columnId, desc) => {
                    const aInsta = a.values.instaProfit || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    const bInsta = b.values.instaProfit || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    
                    return aInsta - bInsta;
                },
                Cell: ValueCell,
                position: instaProfit,
            });
        }

        if (traderPrice) {
            useColumns.push({
                Header: t('Trader buy'),
                id: 'traderPrice',
                accessor: (d) => Number(d.buyFor[0]?.priceRUB || 0),
                Cell: TraderPriceCell,
                position: traderPrice,
            });
        }

        if (traderBuyback) {
            useColumns.push({
                Header: t('Buyback ratio'),
                id: 'traderBuyback',
                accessor: 'buyback',
                sortDescFirst: true,
                sortType: 'basic',
                Cell: ({ value }) => {
                    return (
                        <Tippy
                            content={t('The percent recovered if you buy this item and sell it to the trader')}
                        >
                            <div className="center-content">
                                {`${Math.floor((Math.round(value * 100) / 100) * 100)}%`}
                            </div>
                        </Tippy>
                    );
                },
                position: traderBuyback,
            });
        }

        if (grid) {
            useColumns.push({
                Header: t('Grid'),
                id: 'grid',
                accessor: 'grid',
                sortType: (a, b, columnId, desc) => {
                    const aSize = a.values.grid.pockets.reduce((totalSize, pocket) => {
                        return totalSize += (pocket.width * pocket.height);
                    }, 0);
                    const bSize = b.values.grid.pockets.reduce((totalSize, pocket) => {
                        return totalSize += (pocket.width * pocket.height);
                    }, 0);
                    return aSize - bSize;
                },
                Cell: ({ value }) => {
                    return (
                        <CanvasGrid
                            width={value.width}
                            height={value.height}
                            grid={value.pockets}
                        />
                    );
                },
                position: grid,
            });
        }

        if (gridSlots) {
            useColumns.push({
                Header: t('Slots occupied'),
                id: 'gridSlots',
                accessor: 'slots',
                Cell: CenterCell,
                position: gridSlots,
            });
        }

        if (innerSize) {
            useColumns.push({
                Header: t('Slots inside'),
                id: 'innerSize',
                accessor: 'size',
                Cell: CenterCell,
                position: innerSize
            });
        }

        if (slotRatio) {
            useColumns.push({
                Header: t('Slots ratio'),
                id: 'slotRatio',
                accessor: 'ratio',
                Cell: CenterCell,
                position: slotRatio,
            });
        }

        if (pricePerSlot) {
            useColumns.push({
                Header: t('Price per slot'),
                id: 'pricePerSlot',
                accessor: 'pricePerSlot',
                sortType: (a, b, columnId, desc) => {
                    const aPPS = a.values.pricePerSlot || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    const bPPS = b.values.pricePerSlot || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    
                    return aPPS - bPPS;
                },
                Cell: ValueCell,
                position: pricePerSlot,
            });
        }

        if (armorClass) {
            useColumns.push({
                Header: t('Armor class'),
                id: 'armorClass',
                accessor: 'armorClass',
                sortType: (a, b) => {
                    const aArmor = a.values.armorClass;
                    const bArmor = b.values.armorClass;
                    if (aArmor===bArmor) {
                        if (effectiveDurability)
                            return a.values.effectiveDurability - b.values.effectiveDurability;
                        else if (blindnessProtection)
                            return a.values.blindnessProtection - b.values.blindnessProtection;
                        else
                            return a.values.maxDurability - b.values.maxDurability;
                    }
                    
                    return aArmor - bArmor;
                },
                Cell: CenterCell,
                position: armorClass,
            });
        }

        if (armorZones) {
            useColumns.push({
                Header: t('Zones'),
                id: 'armorZone',
                accessor: 'armorZone',
                Cell: CenterCell,
                position: armorZones,
            });
        }

        if (maxDurability) {
            useColumns.push({
                Header: t('Max Durability'),
                id: 'maxDurability',
                accessor: 'maxDurability',
                Cell: CenterCell,
                position: maxDurability,
            });
        }

        if (effectiveDurability) {
            useColumns.push({
                Header: t('Effective Durability'),
                id: 'effectiveDurability',
                accessor: (item) => {
                    if (useClassEffectiveDurability) {
                        return item.effectiveDurability * (item.armorClass * item.armorClass);
                    }
                    return item.effectiveDurability;
                },
                Cell: CenterCell,
                position: effectiveDurability,
            });
        }

        if (repairability) {
            useColumns.push({
                Header: t('Repairability'),
                id: 'repairability',
                accessor: 'repairability',
                Cell: CenterCell,
                position: repairability,
            });
        }

        if (weight) {
            useColumns.push({
                Header: t('Weight (kg)'),
                id: 'weight',
                accessor: 'weight',
                sortType: (a, b) => {
                    return a.values.weight - b.values.weight;
                },
                Cell: CenterCell,
                position: weight,
            });
        }

        if (stats) {
            useColumns.push({
                Header: (
                    <div className="center-content">
                        {t('Stats')}
                        <div>{t('Mov/Turn/Ergo')}</div>
                    </div>
                ),
                id: 'stats',
                accessor: 'stats',
                Cell: ({ value }) => {
                    return <CenterCell value={value} nowrap />;
                },
                position: stats,
            });
        }

        if (caliber) {
            useColumns.push({
                Header: t('Caliber'),
                id: 'caliber',
                accessor: (item) => {
                    let caliber = item.properties.caliber;
                    if (!caliber) 
                        return '-';
                    caliber = formatCaliber(caliber, item.properties.ammoType);
                    return caliber;
                },
                Cell: CenterCell,
                position: caliber,
            });
        }

        if (damage) {
            useColumns.push({
                Header: t('Damage'),
                id: 'damage',
                accessor: (ammoData) => useAllProjectileDamage ? ammoData.properties.projectileCount * ammoData.properties.damage : ammoData.properties.damage,
                Cell: CenterCell,
                position: damage,
            });
        }

        if (penetrationPower) {
            useColumns.push({
                Header: t('Penetration'),
                id: 'penetrationPower',
                accessor: (item) => item.properties.penetrationPower,
                Cell: CenterCell,
                position: penetrationPower,
            });
        }

        if (armorDamage) {
            useColumns.push({
                Header: t('Armor damage'),
                id: 'armorDamage',
                accessor: (item) => item.properties.armorDamage,
                Cell: CenterCell,
                position: armorDamage,
            });
        }

        if (fragChance) {
            useColumns.push({
                Header: t('Fragmentation chance'),
                id: 'fragChance',
                accessor: (item) => `${Math.floor(item.properties.fragmentationChance * 100)}%`,
                Cell: CenterCell,
                position: fragChance,
            });
        }

        if (blindnessProtection) {
            useColumns.push({
                Header: t('Blindness protection'),
                id: 'blindnessProtection',
                accessor: (item) => item.properties.blindnessProtection,
                Cell: ({ value }) => {
                    let valueStr;
                    if (!value) {
                        valueStr = '-';
                    } else {
                        valueStr = `${value*100}%`;
                    }
                    return <CenterCell value={valueStr} nowrap />;
                },
                position: blindnessProtection,
            });
        }

        if (hydration) {
            useColumns.push({
                Header: t('Hydration'),
                id: 'hydration',
                accessor: (item) => item.properties.hydration,
                sortType: (a, b) => {
                    return a.values.hydration - b.values.hydration;
                },
                Cell: CenterCell,
                position: hydration,
            });
        }

        if (energy) {
            useColumns.push({
                Header: t('Energy'),
                id: 'energy',
                accessor: (item) => item.properties.energy,
                Cell: CenterCell,
                position: energy,
            });
        }

        if (hydrationCost) {
            useColumns.push({
                Header: t('Hydration Cost'),
                id: 'hydrationCost',
                accessor: (item) => {
                    if (!item.cheapestObtainPrice) {
                        return 0;
                    }
                    if (!item.properties.hydration || item.properties.hydration < 0) {
                        return Number.MAX_SAFE_INTEGER;
                    }
                    return item.cheapestObtainPrice / item.properties.hydration;
                },
                Cell: ({ value }) => {
                    if (!value) {
                        value = '-';
                    } else if (value === Number.MAX_SAFE_INTEGER) {
                        value = '∞'
                    } else {
                        value = formatPrice(value);
                    }
                    return <CenterCell value={value} nowrap />;
                },
                position: hydrationCost,
            });
        }

        if (energyCost) {
            useColumns.push({
                Header: t('Energy Cost'),
                id: 'energyCost',
                accessor: (item) => {
                    if (!item.cheapestObtainPrice) {
                        return 0;
                    }
                    if (!item.properties.energy || item.properties.energy < 0) {
                        return Number.MAX_SAFE_INTEGER;
                    }
                    
                    if (item.properties.hydration && item.properties.hydration < 0 && totalEnergyCost) {
                        return (item.cheapestObtainPrice / item.properties.energy) + (item.properties.hydration * -1) * lowHydrationCost;
                    }
                    return item.cheapestObtainPrice / item.properties.energy;
                },
                Cell: ({ value }) => {
                    if (!value) {
                        value = '-';
                    } else if (value === Number.MAX_SAFE_INTEGER) {
                        value = '∞'
                    } else {
                        value = formatPrice(value);
                    }
                    return <CenterCell value={value} nowrap />;
                },
                position: energyCost,
            });
        }

        if (provisionValue) {
            useColumns.push({
                Header: t('Hydration + Energy Value'),
                id: 'provisionValue',
                accessor: (item) => {
                    let hydValue = 0;
                    let engValue = 0;
                    if (item.properties.hydration > 0) {
                        hydValue = item.properties.hydration * lowHydrationCost;
                    }
                    if (item.properties.energy > 0) {
                        engValue = item.properties.energy * lowEnergyCost;
                    }
                    return hydValue + engValue;
                },
                Cell: ({ value }) => {
                    if (!value) {
                        value = '-';
                    } else if (value === Number.MAX_SAFE_INTEGER) {
                        value = '∞'
                    } else {
                        value = formatPrice(value);
                    }
                    return <CenterCell value={value} nowrap />;
                },
                position: provisionValue,
            });
        }

        if (soundSuppression) {
            useColumns.push({
                Header: t('Sound suppression'),
                id: 'soundSuppression',
                // t('Low')
                // t('None')
                accessor: (item) => t(item.properties.deafening),
                Cell: CenterCell,
                position: soundSuppression,
            });
        }

        if (blocksHeadset) {
            useColumns.push({
                Header: t('Blocks earpiece'),
                id: 'blocksHeadset',
                accessor: (item) => item.properties.blocksHeadset ? t('Yes') : t('No'),
                Cell: CenterCell,
                position: blocksHeadset,
            });
        }

        if (ergonomics) {
            useColumns.push({
                Header: t('Ergonomics'),
                id: 'ergonomics',
                accessor: (item) => item.properties.ergonomics,
                sortType: (a, b, columnId, desc) => {
                    const aErgo = a.values.ergonomics;
                    const bErgo = b.values.ergonomics;
                    if (aErgo===bErgo) {
                        if (desc)
                            return b.values.ergoCost - a.values.ergoCost;
                        else
                            return a.values.ergoCost - b.values.ergoCost;
                    }
                    
                    return aErgo - bErgo;
                },
                Cell: CenterCell,
                position: ergonomics,
            });
        }

        if (ergoCost) {
            useColumns.push({
                Header: t('Cost per ergo'),
                id: 'ergoCost',
                accessor: (item) => {
                    if (item.cheapestObtainPrice) {
                        return item.cheapestObtainPrice / item.properties.ergonomics;
                    }
                    return 0;
                },
                sortType: (a, b, columnId, desc) => {
                    const aErgoCost = a.values.ergoCost || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    const bErgoCost = b.values.ergoCost || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    return aErgoCost - bErgoCost;
                },
                Cell: ({ value }) => {
                    if (!value) {
                        value = '-';
                    } else if (value === Number.MAX_SAFE_INTEGER) {
                        value = '-'
                    } else {
                        value = formatPrice(value);
                    }
                    return <CenterCell value={value} nowrap />;
                },
                position: ergoCost,
            });
        }

        if (recoilModifier) {
            useColumns.push({
                Header: t('Recoil'),
                id: 'recoilModifier',
                accessor: (item) => item.properties.recoilModifier,
                sortType: (a, b) => {
                    return b.values.recoilModifier - a.values.recoilModifier;
                },
                Cell: ({value}) => {
                    if (!value) {
                        value = '-'
                    } else {
                        value = `${Math.round(value * 100)}%`;
                    }
                    return <CenterCell value={value} nowrap />;
                },
                position: recoilModifier,
            });
        }

        if (distance) {
            useColumns.push({
                Header: t('Distance'),
                id: 'distanceModifier',
                accessor: (item) => item.properties.distanceModifier,
                sortType: (a, b) => {
                    return b.values.distanceModifier - a.values.distanceModifier;
                },
                Cell: ({value}) => {
                    if (!value) {
                        value = '-'
                    }
                    return <CenterCell value={value} nowrap />;
                },
                position: distance,
            });
        }

        if (cheapestPrice) {
            useColumns.push({
                Header: t('Cheapest Price'),
                id: 'cheapestPrice',
                accessor: 'cheapestObtainPrice',
                sortType: (a, b, columnId, desc) => {
                    const aCheap = a.values.cheapestPrice || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    const bCheap = b.values.cheapestPrice || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    return aCheap - bCheap;
                },
                Cell: (props) => {
                    let tipContent = '';
                    const priceContent = [];
                    const cheapestObtainInfo = props.row.original.cheapestObtainInfo;
                    if (cheapestObtainInfo) {
                        let priceSource = '';
                        const displayedPrice = [];
                        let taskIcon = '';
                        let barterIcon = '';
                        if (!cheapestObtainInfo.barter && !cheapestObtainInfo.craft) {
                            if (cheapestObtainInfo.vendor.normalizedName === 'flea-market') {
                                priceSource = cheapestObtainInfo.vendor.name;
                            }
                            else {
                                priceSource = `${cheapestObtainInfo.vendor.name} ${t('LL{{level}}', { level: cheapestObtainInfo.vendor.minTraderLevel })}`;
                            }
                            if (cheapestObtainInfo.vendor.taskUnlock) {
                                taskIcon = (
                                    <Icon
                                        key="price-task-tooltip-icon"
                                        path={mdiClipboardList}
                                        size={1}
                                        className="icon-with-text"
                                    />
                                );
                                tipContent = (
                                    <div>
                                        <Link to={`/task/${cheapestObtainInfo.vendor.taskUnlock.normalizedName}`}>
                                            {t('Task: {{taskName}}', {taskName: cheapestObtainInfo.vendor.taskUnlock.name})}
                                        </Link>
                                    </div>
                                );
                            }
                        } else if (cheapestObtainInfo.barter) {
                            priceSource = `${cheapestObtainInfo.barter.trader.name} ${t('LL{{level}}', { level: cheapestObtainInfo.barter.level })}`;
                            barterIcon = (
                                <Icon
                                    key="barter-tooltip-icon"
                                    path={mdiCached}
                                    size={1}
                                    className="icon-with-text"
                                />
                            );
                            let barterTipTitle = '';
                            if (cheapestObtainInfo.barter.taskUnlock) {
                                taskIcon = (
                                    <Icon
                                        key="barter-task-tooltip-icon"
                                        path={mdiClipboardList}
                                        size={1}
                                        className="icon-with-text"
                                    />
                                );
                                barterTipTitle = (
                                    <Link to={`/task/${cheapestObtainInfo.barter.taskUnlock.normalizedName}`}>
                                        {t('Task: {{taskName}}', {taskName: cheapestObtainInfo.barter.taskUnlock.name})}
                                    </Link>
                                );
                            }
                            tipContent = (
                                <BarterTooltip
                                    barter={props.row.original.cheapestBarter.barter}
                                    showTitle={taskIcon !== ''}
                                    title={barterTipTitle}
                                    allowAllSources={showAllSources}
                                    barters={barters}
                                    crafts={crafts}
                                    useBarterIngredients={useBarterIngredients}
                                    useCraftIngredients={useCraftIngredients}
                                />
                            );
                        } else if (cheapestObtainInfo.craft) {
                            const craft = cheapestObtainInfo.craft;
                            priceSource = `${craft.station.name} ${craft.level}`;
                            let barterTipTitle = '';
                            if (craft.taskUnlock) {
                                taskIcon = (
                                    <Icon
                                        key="craft-task-tooltip-icon"
                                        path={mdiClipboardList}
                                        size={1}
                                        className="icon-with-text"
                                    />
                                );
                                barterTipTitle = (
                                    <Link to={`/task/${craft.taskUnlock.normalizedName}`}>
                                        {t('Task: {{taskName}}', {taskName: craft.taskUnlock.name})}
                                    </Link>
                                );
                            }
                            tipContent = (
                                <BarterTooltip
                                    barter={craft}
                                    showTitle={taskIcon !== ''}
                                    title={barterTipTitle}
                                    allowAllSources={showAllSources}
                                    barters={barters}
                                    crafts={crafts}
                                    useBarterIngredients={useBarterIngredients}
                                    useCraftIngredients={useCraftIngredients}
                                />
                            );
                        }
                        displayedPrice.push(priceSource);
                        displayedPrice.push(barterIcon);
                        displayedPrice.push(taskIcon);
                        priceContent.push((<div key="price-info">{formatPrice(props.value*props.row.original.count)}</div>));
                        priceContent.push((<div key="price-source-info" className="trader-unlock-wrapper">{displayedPrice}</div>))
                    } else {
                        tipContent = [];
                        if (props.row.original.types.includes('noFlea')) {
                            priceContent.push((
                                <Icon
                                    path={mdiCloseOctagon}
                                    size={1}
                                    className="icon-with-text"
                                    key="no-flea-icon"
                                />
                            ));
                            tipContent.push((
                                <div key={'no-flea-tooltip'}>
                                    {t('This item can\'t be sold on the Flea Market')}
                                </div>
                            ));
                        } else if (!settings.hasFlea) {
                            priceContent.push((
                                <Icon
                                    path={mdiCloseOctagon}
                                    size={1}
                                    className="icon-with-text"
                                    key="no-prices-icon"
                                />
                            ));
                            tipContent.push((
                                <div key={'no-flea-tooltip'}>
                                    {t('Flea Market not available')}
                                </div>
                            ));
                        } else {
                            let tipText = t('Not scanned on the Flea Market');
                            let icon = mdiHelpRhombus;
                            if (props.row.original.cached) {
                                tipText = t('Flea market prices loading');
                                icon = mdiTimerSand;
                            }
                            priceContent.push((
                                <Icon
                                    path={icon}
                                    size={1}
                                    className="icon-with-text"
                                    key="no-prices-icon"
                                />
                            ));
                            tipContent.push((
                                <div key={'no-flea-tooltip'}>
                                    {tipText}
                                </div>
                            ));
                        }
                        tipContent.push((
                            <div key={'no-trader-sell-tooltip'}>
                                {t('No trader offers available')}
                            </div>
                        ));
                    }
                    return (
                        <ConditionalWrapper
                            condition={tipContent}
                            wrapper={(children) => {
                                return (
                                    <Tippy placement="right" content={tipContent} interactive={true}>
                                        {children}
                                    </Tippy>
                                );
                            }}
                        >
                            <div className="center-content">
                                {priceContent}
                            </div>
                        </ConditionalWrapper>
                    );
                },
                summable: true,
                position: cheapestPrice,
            });
        }

        const claimedPositions = [];
        for (let i = 1; i < useColumns.length; i++) {
            const column = useColumns[i];
            if (Number.isInteger(column.position)) {
                let position = parseInt(column.position);
                if (showAttachments || showAttachTo || showPresets || attachmentMap) {
                    position++;
                }
                if (position < 1) {
                    position = 1;
                }
                if (position >= useColumns.length) {
                    position = useColumns.length-1;
                }
                if (position !== i && !claimedPositions.includes(position)) {
                    //console.log(`Moving ${column.Header} from ${i} to ${position}`);
                    claimedPositions.push(position);
                    useColumns.splice(i, 1);
                    useColumns.splice(position, 0, column);
                    i = 1;
                } else if (position !== i && claimedPositions.includes(position)) {
                    //console.warn(`Warning: ${column.Header} wants position ${position}, but that position has already been claimed by ${useColumns[position].Header}`);
                }
            }
        }

        return useColumns;
    }, [
        t,
        instaProfit,
        traderPrice,
        traderValue,
        traderBuyback,
        fleaPrice,
        grid,
        gridSlots,
        innerSize,
        slotRatio,
        pricePerSlot,
        barterPrice,
        fleaValue,
        armorClass,
        armorZones,
        maxDurability,
        effectiveDurability,
        repairability,
        stats,
        showContainedItems,
        weight,
        caliber,
        damage,
        penetrationPower,
        armorDamage,
        fragChance,
        cheapestPrice,
        blindnessProtection,
        useClassEffectiveDurability,
        useAllProjectileDamage,
        hydration,
        energy,
        hydrationCost,
        energyCost,
        lowHydrationCost,
        lowEnergyCost,
        totalEnergyCost,
        provisionValue,
        soundSuppression,
        blocksHeadset,
        showAttachments,
        showAttachTo,
        ergonomics,
        ergoCost,
        recoilModifier,
        showSlotValue,
        showAllSources,
        showPresets,
        showRestrictedType,
        attachmentMap,
        settings,
        items,
        barters,
        crafts,
        useBarterIngredients,
        useCraftIngredients,
        distance,
    ]);

    let extraRow = false;

    // If there are no items returned by the API, we need to add a row to show
    if (data.length <= 0) {
        // If the API query has not yet completed
        if (itemsStatus.status === 'pending') {
            extraRow = <LoadingSmall />;
            // If the API query has completed, but no items were found
        } else {
            extraRow = t('No items');
        }
    }

    return (
        <DataTable
            className={`small-data-table ${hideBorders ? 'no-borders' : ''}`}
            key="small-item-table"
            columns={columns}
            sumColumns={sumColumns}
            data={data}
            extraRow={extraRow}
            sortBy={sortBy}
            sortByDesc={sortByDesc}
            autoResetSortBy={false}
            maxItems={maxItems}
            nameFilter={nameFilter}
            autoScroll={autoScroll}
        />
    );
}

export default SmallItemTable;
