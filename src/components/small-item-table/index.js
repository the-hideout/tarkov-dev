import { useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '@mdi/react';
import { 
    mdiCloseOctagon, 
    mdiHelpRhombus,
    mdiAccountSwitch,
    mdiClipboardList,
    mdiTimerSand,
} from '@mdi/js';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional

import ValueCell from '../value-cell';
import TraderPriceCell from '../trader-price-cell';
import CenterCell from '../center-cell';
import ItemNameCell from '../item-name-cell';
import FleaPriceCell from '../flea-price-cell';
import BarterToolTip from '../barter-tooltip';
import DataTable from '../data-table';
import LoadingSmall from '../loading-small';
import ArrowIcon from '../../components/data-table/Arrow.js';

import formatPrice from '../../modules/format-price';
import itemSearch from '../../modules/item-search';
import { getCheapestBarter } from '../../modules/format-cost-items';
import { formatCaliber } from '../../modules/format-ammo';
import itemCanContain from '../../modules/item-can-contain';

import {
    selectAllBarters,
    fetchBarters,
} from '../../features/barters/bartersSlice';
import { useItemsQuery } from '../../features/items/queries';
import { useMetaQuery } from '../../features/meta/queries';
import CanvasGrid from '../../components/canvas-grid';

import './index.css';

function getItemCountPrice(item) {
    if (item.count < 2) return '';
    return (
        <div key="countprice">
            {formatPrice(
                item.bestSell.priceRUB,
            )} x {item.count}
        </div>
    );
}

function traderSellCell(datum, totalTraderPrice = false, showSlotValue = false) {
    if (!datum.row.original.bestSell?.source || datum.row.original.bestSell.source === '?') {
        return null;
    }

    const count = datum.row.original.count;
    const priceRUB = totalTraderPrice ? datum.row.original.bestSell.totalPriceRUB : datum.row.original.bestSell.priceRUB;
    const price = totalTraderPrice ? datum.row.original.bestSell.totalPrice : datum.row.original.bestSell.price;
    const slots = datum.row.original.width * datum.row.original.height;
    let slotValue = '';
    if (showSlotValue && slots > 1) {
        slotValue = (
            <Tippy
                content="Per slot"
                placement="left"
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
                    alt={datum.row.original.bestSell.vendor.name}
                    className="trader-icon"
                    loading="lazy"
                    height="40"
                    src={`${process.env.PUBLIC_URL}/images/${datum.row.original.bestSell.vendor.normalizedName}-icon.jpg`}
                    title={datum.row.original.bestSell.vendor.name}
                    width="40"
                />
            </span>
            <span>
                {datum.row.original.bestSell.currency !== 'RUB' ? (
                    <Tippy
                        content={formatPrice(priceRUB*count)}
                        placement="bottom"
                    >
                        <div>
                            {formatPrice(price*count, datum.row.original.bestSell.currency)}
                        </div>
                    </Tippy>
                ) : (
                    <div>
                        {formatPrice(priceRUB*count)}
                    </div>
                )}
                {getItemCountPrice(datum.row.original)}
            </span>
        </div>,
        slotValue
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
    const currentParentItems = items.filter((innerItem) => 
        itemCanContain(innerItem, targetItem, 'slots'),
    );

    for (const parentItem of currentParentItems) {
        if (parentItem.types.includes('gun')) {
            parentItems.push(parentItem);

            continue;
        }

        parentItems = parentItems.concat(getGuns(items, parentItem));
    }

    let idCache = [];

    parentItems = parentItems
        .map((parentItem) => {
            if (idCache.includes(parentItem.id)) {
                return false;
            }

            idCache.push(parentItem.id);

            return parentItem;
        })
        .filter(Boolean);

    return parentItems;
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
        maxItems,
        nameFilter,
        defaultRandom,
        typeFilter,
        containedInFilter,
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
        showAllSources,
        cheapestPrice,
        sumColumns,
        totalTraderPrice,
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
    } = props;
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const settings = useSelector((state) => state.settings);
    if (typeof showAllSources === 'undefined') showAllSources = true;

    // Use the primary items API query to fetch all items
    const result = useItemsQuery();

    const { data: meta } = useMetaQuery();
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
    const items = result.data;

    const itemCount = items.length;
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

    const barters = useSelector(selectAllBarters);
    const bartersStatus = useSelector((state) => {
        return state.barters.status;
    });

    useEffect(() => {
        if (!barterPrice && !cheapestPrice)
            return;

        let timer = false;
        if (bartersStatus === 'idle') {
            dispatch(fetchBarters());
        }

        if (!timer) {
            timer = setInterval(() => {
                dispatch(fetchBarters());
            }, 600000);
        }

        return () => {
            clearInterval(timer);
        };
    }, [bartersStatus, barterPrice, cheapestPrice, dispatch]);

    const containedItems = useMemo(() => {
        if (!containedInFilter) return {};
        const filterItems = {};
        containedInFilter.forEach(ci => {
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
                traderName: itemData.traderName,
                traderNormalizedName: itemData.traderNormalizedName,
                traderPrice: itemData.traderPrice,
                traderPriceRUB: itemData.traderPriceRUB,
                traderCurrency: itemData.traderCurrency,
                types: itemData.types,
                buyFor: itemData.buyFor.filter(buyFor => {
                    if (buyFor.vendor.normalizedName === 'flea-market' && !showAllSources && !settings.hasFlea) return false;
                    if (!showAllSources && settings[buyFor.vendor.normalizedName] < buyFor.vendor.minTraderLevel) return false;
                    return true;
                }),
                sellFor: itemData.sellFor,
                bestSell: itemData.sellFor.filter(sellFor => {
                    if (sellFor.vendor.normalizedName === 'flea-market') return false;
                    if (!showAllSources && sellFor.vendor.normalizedName === 'jaeger' && !settings.jaeger) return false;
                    return true;
                }),
                buyOnFleaPrice: itemData.buyFor.find(
                    (buyPrice) => buyPrice.vendor.normalizedName === 'flea-market' && (showAllSources || settings.hasFlea),
                ),
                barters: barters.filter(
                    (barter) => barter.rewardItems[0].item.id === itemData.id,
                ),
                grid: itemData.grid,
                pricePerSlot: showNetPPS ? Math.floor(itemData.avg24hPrice / (itemData.properties.capacity - (itemData.width * itemData.height)))
                              : itemData.avg24hPrice / itemData.properties.capacity,
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
            };

            if (formattedItem.bestSell.length > 1) {
                formattedItem.bestSell = formattedItem.bestSell.reduce((prev, current) => {
                    if (prev.priceRUB > current.priceRUB) return prev;
                    return current;
                }, {priceRUB: 0})
            } else if (formattedItem.bestSell.length === 1) {
                formattedItem.bestSell = formattedItem.bestSell[0];
            }

            if (!showAllSources && !settings.hasFlea) {
                formattedItem.buyOnFleaPrice = 0
            }

            if (formattedItem.buyOnFleaPrice && formattedItem.buyOnFleaPrice.price > 0) {
                formattedItem.instaProfit = itemData.traderPriceRUB - formattedItem.buyOnFleaPrice.price;
            }

            if (formattedItem.barters.length > 0) {
                formattedItem.barterPrice = getCheapestBarter(itemData, formattedItem.barters, settings, showAllSources);

                if (formattedItem.barterPrice && (!itemData.avg24hPrice || formattedItem.barterPrice.price < itemData.avg24hPrice)) {
                    formattedItem.pricePerSlot = showNetPPS ? Math.floor(formattedItem.barterPrice.price / (itemData.properties.capacity - itemData.slots))
                                                 : formattedItem.barterPrice.price / itemData.properties.capacity;
                }
            }
            formattedItem.cheapestPrice = Number.MAX_SAFE_INTEGER;
            formattedItem.cheapestPriceInfo = false;
            if (formattedItem.barterPrice) {
                //console.log(formattedItem.barterPrice.barter, settings[formattedItem.barterPrice.barter.trader.normalizedName]);
                //if (!showAllSources && settings[buyFor.vendor.normalizedName] < buyFor.vendor.minTraderLevel)
                formattedItem.cheapestPrice = formattedItem.barterPrice.price;
                formattedItem.cheapestPriceInfo = formattedItem.barterPrice;
            }
            for (const buyFor of formattedItem.buyFor) {
                if (buyFor.priceRUB && buyFor.priceRUB < formattedItem.cheapestPrice) {
                    formattedItem.cheapestPrice = buyFor.priceRUB;
                    formattedItem.cheapestPriceInfo = buyFor;
                }
            }
            if (formattedItem.cheapestPrice === Number.MAX_SAFE_INTEGER) {
                formattedItem.cheapestPrice = 0;
            }

            if (traderBuybackFilter && formattedItem.buyOnFleaPrice) {
                const thisTraderSell = formattedItem.sellFor.find(sellFor => sellFor.vendor.normalizedName === traderFilter);
                if (thisTraderSell) {
                    formattedItem.buyback = thisTraderSell.priceRUB / formattedItem.buyOnFleaPrice.price;
                }
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
                if (
                    item.properties[minPropertyFilter.property] <
                    minPropertyFilter.value
                ) {
                    return false;
                }

                return true;
            })
            .filter((item) => {
                if (!maxPropertyFilter) {
                    return true;
                }

                if (
                    item.properties[maxPropertyFilter.property] >
                    maxPropertyFilter.value
                ) {
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

                if (item.cheapestPrice > maxPrice) {
                    return false;
                }

                return true;
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
                item.bestSell = item.sellFor?.sort((a, b) => {
                    return b.priceRUB - a.priceRUB;
                })[0];

                if (item.buyOnFleaPrice) {
                    item.instaProfit = item.bestSell?.priceRUB - item.buyOnFleaPrice.price;
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
                .filter((item) => item.lastLowPrice && item.lastLowPrice > 0)
                .filter((item) => item.bestSell && item.bestSell.priceRUB > 500)
                .filter(
                    (item) => item.buyOnFleaPrice && item.buyOnFleaPrice.price > 0,
                )
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
                let caliber = formatCaliber(item.properties.caliber);
                if (!caliber) {
                    return false;
                }
                if (caliber === '12 Gauge Shot' && item.properties.ammoType === 'bullet') {
                    caliber = caliber.replace('Shot', 'Slug');
                }
                return caliberFilter.includes(caliber);
            }).sort((a, b) => {
                return formatCaliber(a.properties.caliber).localeCompare(formatCaliber(b.properties.caliber));
            });
        }

        if (showAttachments) {
            returnData.forEach(item => {
                item.subRows = items.filter(linkedItem => {
                    if (!item.properties?.slots) return false;
                    for (const slot of item.properties.slots) {
                        const included = slot.filters.allowedItems.includes(linkedItem.id) ||
                            linkedItem.categoryIds.some(catId => slot.filters.allowedCategories.includes(catId));
                        const excluded = slot.filters.excludedItems.includes(linkedItem.id) ||
                            linkedItem.categoryIds.some(catId => slot.filters.excludedCategories.includes(catId));
                        if (included && !excluded) return true;
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
                    return linkedItem.properties.baseItem.id === item.id;
                }).filter(linkedItem => {
                    return linkedItem.properties.baseItem.properties.defaultPreset.id !== linkedItem.id;
                }).sort((a, b) => {
                    return a.shortName.localeCompare(b.shortName);
                }).map(item => formatItem(item));
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
    ]);
    const lowHydrationCost = useMemo(() => {
        if (!totalEnergyCost && !provisionValue) {
            return 0;
        }
        let lowHyd = Number.MAX_SAFE_INTEGER;
        data.forEach(item => {
            if (item.properties.hydration > 0) {
                if (item.cheapestPrice) {
                    const hydrationCost = item.cheapestPrice / item.properties.hydration;
                    if (hydrationCost < lowHyd) {
                        lowHyd = hydrationCost;
                    }
                }
            }
        });
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
                if (item.cheapestPrice) {
                    let energyCost = item.cheapestPrice / item.properties.energy;
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
        if (showAttachments || showAttachTo || showPresets) {
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
        useColumns.push(
            {
                Header: t('Name'),
                accessor: 'name',
                Cell: (props) => {
                    return (
                        <ItemNameCell
                            item={props.row.original}
                            showContainedItems={showContainedItems}
                            showRestrictedType={showRestrictedType}
                        />
                    );
                },
            },
        );

        if (fleaValue) {
            useColumns.push({
                Header: t('Sell to Flea'),
                accessor: (d) => Number(d.lastLowPrice),
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
                id: 'fleaSellPrice',
                position: fleaValue,
            });
        }

        if (fleaPrice) {
            useColumns.push({
                Header: t('Buy on Flea'),
                accessor: (d) => Number(d.buyOnFleaPrice?.price),
                Cell: FleaPriceCell,
                id: 'fleaBuyPrice',
                sortType: (a, b, columnId, desc) => {
                    if (a.values.fleaBuyPrice === 0 || isNaN(a.values.fleaBuyPrice)) {
                        if (desc) {
                            return -1;
                        }

                        return 1;
                    }

                    if (b.values.fleaBuyPrice === 0 || isNaN(b.values.fleaBuyPrice)) {
                        if (desc) {
                            return 1;
                        }

                        return -1;
                    }

                    if (a.values.fleaBuyPrice > b.values.fleaBuyPrice) {
                        return -1;
                    }

                    if (a.values.fleaBuyPrice < b.values.fleaBuyPrice) {
                        return 1;
                    }

                    return 0;
                },
                position: fleaPrice,
            });
        }

        if (barterPrice) {
            useColumns.push({
                Header: t('Barter'),
                accessor: (d) => Number(d.barterPrice?.price),
                Cell: (props) => {
                    // return <ValueCell
                    //     value = {props.value}
                    // />;
                    /*
                        For some reason this
                        */
                    return (
                        <Tippy
                            placement="bottom"
                            // followCursor = {'horizontal'}
                            // showOnCreate = {true}
                            interactive={true}
                            content={
                                <BarterToolTip
                                    barter={props.row.original.barterPrice?.barter}
                                    showAllSources={showAllSources}
                                />
                            }
                        // plugins={[followCursor]}
                        >
                            <div className="center-content">
                                {props.value ? formatPrice(props.value) : '-'}
                            </div>
                        </Tippy>
                    );
                },
                id: 'barterPrice',
                sortType: (a, b, columnId, desc) => {
                    if (a.values.barterPrice === 0 || isNaN(a.values.barterPrice)) {
                        if (desc) {
                            return -1;
                        }

                        return 1;
                    }

                    if (b.values.barterPrice === 0 || isNaN(b.values.barterPrice)) {
                        if (desc) {
                            return 1;
                        }

                        return -1;
                    }

                    if (a.values.barterPrice > b.values.barterPrice) {
                        return -1;
                    }

                    if (a.values.barterPrice < b.values.barterPrice) {
                        return 1;
                    }

                    return 0;
                },
                position: barterPrice,
            });
        }

        if (traderValue) {
            useColumns.push({
                Header: t('Sell to Trader'),
                accessor: (d) => Number(totalTraderPrice? d.bestSell?.totalPriceRUB : d.bestSell?.priceRUB),
                Cell: (datum) => {return traderSellCell(datum, totalTraderPrice, showSlotValue)},
                id: 'traderPrice',
                summable: true,
                position: traderValue,
            });
        }

        if (instaProfit) {
            useColumns.push({
                Header: t('InstaProfit'),
                accessor: 'instaProfit',
                Cell: ValueCell,
                id: 'instaProfit',
                sortDescFirst: true,
                // sortType: 'basic',
                sortType: (a, b, columnId, desc) => {
                    if (a.values.instaProfit === 0) {
                        if (desc) {
                            return -1;
                        }

                        return 1;
                    }

                    if (b.values.instaProfit === 0) {
                        if (desc) {
                            return 1;
                        }

                        return -1;
                    }

                    if (a.values.instaProfit > b.values.instaProfit) {
                        return 1;
                    }

                    if (a.values.instaProfit < b.values.instaProfit) {
                        return -1;
                    }

                    return 0;
                },
                position: instaProfit,
            });
        }

        if (traderPrice) {
            useColumns.push({
                Header: t('Trader buy'),
                accessor: (d) => Number(d.instaProfit),
                Cell: TraderPriceCell,
                id: 'traderBuyCell',
                position: traderPrice,
            });
        }

        if (traderBuyback) {
            useColumns.push({
                Header: t('Buyback ratio'),
                accessor: 'buyback',
                Cell: ({ value }) => {
                    // allData.row.original.itemLink
                    return (
                        <Tippy
                            content={t('The percent recovered if you buy this item on the flea and sell to the trader')}
                        >
                            <div className="center-content">
                                {`${Math.floor((Math.round(value * 100) / 100) * 100)}%`}
                            </div>
                        </Tippy>
                    );
                },
                id: 'buyback',
                sortDescFirst: true,
                sortType: 'basic',
                position: traderBuyback,
            });
        }

        if (grid) {
            useColumns.push({
                Header: t('Grid'),
                accessor: 'grid',
                Cell: ({ value }) => {
                    return (
                        <CanvasGrid
                            width={value.width}
                            height={value.height}
                            grid={value.pockets}
                        />
                    );
                },
                sortType: (a, b, columnId, desc) => {
                    const aSize = a.values.grid.pockets.reduce((totalSize, pocket) => {
                        return totalSize += (pocket.width * pocket.height);
                    }, 0);
                    const bSize = b.values.grid.pockets.reduce((totalSize, pocket) => {
                        return totalSize += (pocket.width * pocket.height);
                    }, 0);
                    return aSize - bSize;
                },
                position: grid,
            });
        }

        if (gridSlots) {
            useColumns.push({
                Header: t('Grid slots'),
                accessor: 'slots',
                Cell: CenterCell,
                position: gridSlots,
            });
        }

        if (innerSize) {
            useColumns.push({
                Header: t('Inner size'),
                accessor: 'size',
                Cell: CenterCell,
                position: innerSize
            });
        }

        if (slotRatio) {
            useColumns.push({
                Header: t('Slot ratio'),
                accessor: 'ratio',
                Cell: CenterCell,
                position: slotRatio,
            });
        }

        if (pricePerSlot) {
            useColumns.push({
                Header: t('Price per slot'),
                accessor: 'pricePerSlot',
                Cell: ValueCell,
                position: pricePerSlot,
            });
        }

        if (armorClass) {
            useColumns.push({
                Header: t('Armor class'),
                accessor: 'armorClass',
                Cell: CenterCell,
                position: armorClass,
            });
        }

        if (armorZones) {
            useColumns.push({
                Header: t('Zones'),
                accessor: 'armorZone',
                Cell: CenterCell,
                position: armorZones,
            });
        }

        if (maxDurability) {
            useColumns.push({
                Header: t('Max Durability'),
                accessor: 'maxDurability',
                Cell: CenterCell,
                position: maxDurability,
            });
        }

        if (effectiveDurability) {
            useColumns.push({
                Header: t('Effective Durability'),
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
                accessor: 'repairability',
                Cell: CenterCell,
                position: repairability,
            });
        }

        if (weight) {
            useColumns.push({
                Header: t('Weight (kg)'),
                accessor: 'weight',
                sortType: (a, b, columnId, desc) => {
                    return a.original.weight - b.original.weight;
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
                accessor: (item) => {
                    let caliber = item.properties.caliber;
                    if (!caliber) return '-';
                    caliber = formatCaliber(caliber);
                    if (caliber === '12 Gauge Shot' && item.properties.ammoType === 'bullet') {
                        caliber = caliber.replace('Shot', 'Slug');
                    }
                    return caliber;
                },
                Cell: CenterCell,
                position: caliber,
            });
        }

        if (damage) {
            useColumns.push({
                Header: t('Damage'),
                accessor: (ammoData) => useAllProjectileDamage ? ammoData.properties.projectileCount * ammoData.properties.damage : ammoData.properties.damage,
                Cell: CenterCell,
                position: damage,
            });
        }

        if (penetrationPower) {
            useColumns.push({
                Header: t('Penetration'),
                accessor: (item) => item.properties.penetrationPower,
                Cell: CenterCell,
                position: penetrationPower,
            });
        }

        if (armorDamage) {
            useColumns.push({
                Header: t('Armor damage'),
                accessor: (item) => item.properties.armorDamage,
                Cell: CenterCell,
                position: armorDamage,
            });
        }

        if (fragChance) {
            useColumns.push({
                Header: t('Fragmentation chance'),
                accessor: (item) => `${Math.floor(item.properties.fragmentationChance * 100)}%`,
                Cell: CenterCell,
                position: fragChance,
            });
        }

        if (blindnessProtection) {
            useColumns.push({
                Header: t('Blindness protection'),
                accessor: (item) => item.properties.blindnessProtection ? `${item.properties.blindnessProtection*100}%` : '-',
                Cell: CenterCell,
                position: blindnessProtection,
            });
        }

        if (hydration) {
            useColumns.push({
                Header: t('Hydration'),
                accessor: (item) => item.properties.hydration,
                Cell: CenterCell,
                position: hydration,
            });
        }

        if (energy) {
            useColumns.push({
                Header: t('Energy'),
                accessor: (item) => item.properties.energy,
                Cell: CenterCell,
                position: energy,
            });
        }

        if (hydrationCost) {
            useColumns.push({
                Header: t('Hydration Cost'),
                accessor: (item) => {
                    if (!item.cheapestPrice) {
                        return 0;
                    }
                    if (!item.properties.hydration || item.properties.hydration < 0) {
                        return Number.MAX_SAFE_INTEGER;
                    }
                    return item.cheapestPrice / item.properties.hydration;
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
                accessor: (item) => {
                    if (!item.cheapestPrice) {
                        return 0;
                    }
                    if (!item.properties.energy || item.properties.energy < 0) {
                        return Number.MAX_SAFE_INTEGER;
                    }
                    
                    if (item.properties.hydration && item.properties.hydration < 0 && totalEnergyCost) {
                        return (item.cheapestPrice / item.properties.energy) + (item.properties.hydration * -1) * lowHydrationCost;
                    }
                    return item.cheapestPrice / item.properties.energy;
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
                accessor: (item) => item.properties.deafening,
                Cell: CenterCell,
                position: soundSuppression,
            });
        }

        if (blocksHeadset) {
            useColumns.push({
                Header: t('Blocks earpiece'),
                accessor: (item) => item.properties.blocksHeadset ? 'Yes' : 'No',
                Cell: CenterCell,
                position: blocksHeadset,
            });
        }

        if (ergonomics) {
            useColumns.push({
                Header: t('Ergonomics'),
                accessor: (item) => item.properties.ergonomics,
                Cell: CenterCell,
                position: ergonomics,
            });
        }

        if (ergoCost) {
            useColumns.push({
                Header: t('Cost per ergo'),
                accessor: (item) => {
                    if (item.cheapestPrice) {
                        return item.cheapestPrice / item.properties.ergonomics;
                    }
                    return Number.MAX_SAFE_INTEGER;
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
                accessor: (item) => item.properties.recoilModifier,
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

        if (cheapestPrice) {
            useColumns.push({
                Header: t('Cheapest Price'),
                accessor: 'cheapestPrice',
                sortType: (a, b) => {
                    if (b.original.cheapestPrice && !a.original.cheapestPrice) {
                        return b.original.cheapestPrice;
                    }
                    return a.original.cheapestPrice - b.original.cheapestPrice;
                },
                Cell: (props) => {
                    let tipContent = '';
                    const priceContent = [];
                    if (!props.row.original.cheapestPrice) {
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
                    if (props.value) {
                        const priceInfo = props.row.original.cheapestPriceInfo;
                        let priceSource = priceInfo.vendor?.name || priceInfo.barter?.trader.name;
                        const displayedPrice = [];
                        let taskIcon = '';
                        let barterIcon = '';
                        if (priceInfo.vendor?.minTraderLevel) {
                            priceSource += ` LL${priceInfo.vendor.minTraderLevel}`;
                            if (priceInfo.vendor.taskUnlock) {
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
                                        <Link 
                                            to={`/task/${priceInfo.vendor.taskUnlock.normalizedName}`}
                                        >
                                            {t('Task: {{taskName}}', {taskName: priceInfo.vendor.taskUnlock.name})}
                                        </Link>
                                    </div>
                                );
                            }
                        } else if (priceInfo.barter?.level) {
                            priceSource += ` LL${priceInfo.barter.level}`;
                            barterIcon = (
                                <Icon
                                key="barter-tooltip-icon"
                                    path={mdiAccountSwitch}
                                    size={1}
                                    className="icon-with-text"
                                />
                            );
                            let barterTipTitle = '';
                            if (priceInfo.barter.taskUnlock) {
                                taskIcon = (
                                    <Icon
                                        key="barter-task-tooltip-icon"
                                        path={mdiClipboardList}
                                        size={1}
                                        className="icon-with-text"
                                    />
                                );
                                barterTipTitle = (
                                    <Link to={`/task/${priceInfo.barter.taskUnlock.normalizedName}`}>
                                        {t('Task: {{taskName}}', {taskName: priceInfo.barter.taskUnlock.name})}
                                    </Link>
                                );
                            }
                            tipContent = (
                                <BarterToolTip
                                    barter={props.row.original.barterPrice.barter}
                                    showTitle={taskIcon !== ''}
                                    title={barterTipTitle}
                                    showAllSources={showAllSources}
                                />
                            );
                        }
                        displayedPrice.push(priceSource);
                        displayedPrice.push(barterIcon);
                        displayedPrice.push(taskIcon);
                        priceContent.push((<div key="price-info">{formatPrice(props.value*props.row.original.count)}</div>));
                        priceContent.push((<div key="price-source-info" className="trader-unlock-wrapper">{displayedPrice}</div>))
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
                if (showAttachments || showAttachTo || showPresets) {
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
        totalTraderPrice,
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
    ]);

    let extraRow = false;

    // If there are no items returned by the API, we need to add a row to show
    if (data.length <= 0) {
        // If the API query has not yet completed
        if (result.isFetched === false) {
            extraRow = <LoadingSmall />;
            // If the API query has completed, but no items were found
        } else {
            extraRow = t('No items');
        }
    }

    return (
        <DataTable
            className={`small-data-table ${hideBorders ? 'no-borders' : ''}`}
            columns={columns}
            extraRow={extraRow}
            key="small-item-table"
            data={data}
            autoResetSortBy={false}
            maxItems={maxItems}
            nameFilter={nameFilter}
            autoScroll={autoScroll}
            sumColumns={sumColumns}
        />
    );
}

export default SmallItemTable;
