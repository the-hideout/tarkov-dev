import { useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Icon from '@mdi/react';
import { mdiClockAlertOutline, mdiCloseOctagon } from '@mdi/js';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional

import ValueCell from '../value-cell';
import TraderPriceCell from '../trader-price-cell';
import CenterCell from '../center-cell';
import ItemNameCell from '../item-name-cell';
import FleaPriceCell from '../flea-price-cell';
import BarterToolTip from '../barter-tooltip';

import DataTable from '../data-table';
import formatPrice from '../../modules/format-price';
import itemSearch from '../../modules/item-search';
import {
    selectAllBarters,
    fetchBarters,
} from '../../features/barters/bartersSlice';
import { getCheapestBarter } from '../../modules/format-cost-items';

import categoryData from '../../data/category-data.json';

import './index.css';
import { useItemsQuery } from '../../features/items/queries';

function traderSellCell(datum) {
    if (!datum.row.original.bestSell?.source || datum.row.original.bestSell.source === '?') {
        return null;
    }

    return (
        <div className="trader-price-content">
            <img
                alt={datum.row.original.bestSell.source}
                className="trader-icon"
                loading="lazy"
                height="40"
                src={`${process.env.PUBLIC_URL}/images/${datum.row.original.bestSell.source?.toLowerCase()}-icon.jpg`}
                title={datum.row.original.bestSell.source}
                width="40"
            />

            {datum.row.original.bestSell.currency !== 'RUB' ? (
                <Tippy
                    content={formatPrice(datum.row.original.bestSell.priceRUB)}
                    placement="bottom"
                >
                    <div>
                        {formatPrice(datum.row.original.bestSell.price, datum.row.original.bestSell.currency)}
                    </div>
                </Tippy>
            ) : (
                formatPrice(datum.row.original.bestSell.priceRUB)
            )}
        </div>
    );
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const getArmorZoneString = (armorZones) => {
    return armorZones
        ?.map((zoneName) => {
            if (zoneName === 'Chest') {
                return 'Thorax';
            }

            if (zoneName === 'LeftArm') {
                return false;
            }

            if (zoneName === 'RightArm') {
                return 'Arms';
            }

            return zoneName;
        })
        .filter(Boolean)
        .join(', ');
};

const materialDestructabilityMap = {
    Aramid: 0.25,
    Combined: 0.5,
    UHMWPE: 0.45,
    Titan: 0.55,
    Aluminium: 0.6,
    ArmoredSteel: 0.7,
    Ceramic: 0.8,
    Glass: 0.8,
};

const materialRepairabilityMap = {
    Aramid: 4,
    Combined: 3,
    UHMWPE: 6,
    Titan: 4,
    Aluminium: 4,
    ArmoredSteel: 5,
    Ceramic: 2,
    Glass: 1,
};

function SmallItemTable(props) {
    const {
        maxItems,
        nameFilter,
        defaultRandom,
        typeFilter,
        instaProfit,
        traderPrice,
        traderFilter,
        loyaltyLevelFilter,
        traderValue,
        traderBuybackFilter,
        traderBuyback,
        fleaPrice,
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
        showNetPPS
    } = props;
    const dispatch = useDispatch();
    const { t } = useTranslation();

    // Use the primary items API query to fetch all items
    const result = useItemsQuery();

    // Create a constant of all data returned
    const items = result.data;

    const barters = useSelector(selectAllBarters);
    const bartersStatus = useSelector((state) => {
        return state.barters.status;
    });

    useEffect(() => {
        if (!barterPrice)
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
    }, [bartersStatus, barterPrice, dispatch]);

    const data = useMemo(() => {
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

                if (
                    item.itemProperties[minPropertyFilter.property] <
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
                    item.itemProperties[maxPropertyFilter.property] >
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

                if (item.bsgCategoryId === bsgCategoryFilter) {
                    return true;
                }

                for (const bsgCategoryId in categoryData) {
                    if (
                        categoryData[bsgCategoryId]._parent !==
                        bsgCategoryFilter
                    ) {
                        continue;
                    }

                    if (item.bsgCategoryId === bsgCategoryId) {
                        return true;
                    }
                }

                return false;
            })
            .map((itemData) => {
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
                    traderPrice: itemData.traderPrice,
                    traderPriceRUB: itemData.traderPriceRUB,
                    traderCurrency: itemData.traderCurrency,
                    types: itemData.types,
                    buyFor: itemData.buyFor,
                    sellFor: itemData.sellFor,
                    bestSell: {
                        source: itemData.traderName,
                        price: itemData.traderPrice,
                        priceRUB: itemData.traderPriceRUB,
                        currency: itemData.traderCurrency
                    },
                    buyOnFleaPrice: itemData.buyFor.find(
                        (buyPrice) => buyPrice.source === 'flea-market',
                    ),
                    barters: barters.filter(
                        (barter) => barter.rewardItems[0].item.id === itemData.id,
                    ),
                    grid: itemData.grid,
                    pricePerSlot: showNetPPS ? Math.floor(itemData.avg24hPrice / (itemData.itemProperties.grid?.totalSize - itemData.slots))
                        : itemData.avg24hPrice / itemData.itemProperties.grid?.totalSize,
                    ratio: (itemData.itemProperties.grid?.totalSize / itemData.slots).toFixed(2),
                    size: itemData.itemProperties.grid?.totalSize,
                    notes: itemData.notes,
                    slots: itemData.slots,
                    armorClass: itemData.itemProperties.armorClass,
                    armorZone: getArmorZoneString(itemData.itemProperties.armorZone),
                    maxDurability: itemData.itemProperties.MaxDurability,
                    effectiveDurability: Math.floor(itemData.itemProperties.MaxDurability / materialDestructabilityMap[itemData.itemProperties.ArmorMaterial]),
                    repairability: materialRepairabilityMap[itemData.itemProperties.ArmorMaterial],
                    stats: `${itemData.itemProperties.speedPenaltyPercent}% / ${itemData.itemProperties.mousePenalty}% / ${itemData.itemProperties.weaponErgonomicPenalty}`,
                    canHoldItems: itemData.canHoldItems,
                    weight: itemData.weight
                };

                if (formattedItem.buyOnFleaPrice && formattedItem.buyOnFleaPrice.price > 0) {
                    formattedItem.instaProfit = itemData.traderPriceRUB - formattedItem.buyOnFleaPrice.price;
                }

                if (formattedItem.barters.length > 0) {
                    formattedItem.barterPrice = getCheapestBarter(itemData, formattedItem.barters);

                    if (!itemData.avg24hPrice || formattedItem.barterPrice.price < itemData.avg24hPrice) {
                        formattedItem.pricePerSlot = showNetPPS ? Math.floor(formattedItem.barterPrice.price / (itemData.itemProperties.grid?.totalSize - itemData.slots))
                            : formattedItem.barterPrice.price / itemData.itemProperties.grid?.totalSize;
                    }
                }

                return formattedItem;
            })
            .filter((item) => {
                if (!maxPrice) {
                    return true;
                }

                if (item.avg24hPrice > maxPrice) {
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
                    (buy) => buy.source === traderFilter,
                );
                item.sellFor = item.sellFor?.filter(
                    (sell) => sell.source === traderFilter,
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
                .map((item) => {
                    return {
                        ...item,
                        buyback: item.bestSell?.priceRUB / item.buyOnFleaPrice.price,
                    };
                })
                .sort((a, b) => {
                    return b.buyback - a.buyback;
                });
        }

        if (defaultRandom && !nameFilter) {
            shuffleArray(returnData);
        }

        return returnData;
    }, [
        nameFilter,
        defaultRandom,
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
        showNetPPS
    ]);

    const columns = useMemo(() => {
        const useColumns = [
            {
                Header: t('Name'),
                accessor: 'name',
                Cell: (props) => {
                    return (
                        <ItemNameCell
                            {...props}
                            showContainedItems={showContainedItems}
                        />
                    );
                },
            },
        ];

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
                    return (
                        <ValueCell
                            value={allData.value}
                            noValue={
                                <div className="center-content">
                                    <Tippy
                                        placement="bottom"
                                        content={t('No flea price seen in the past 24 hours')}
                                    >
                                        <Icon
                                            path={mdiClockAlertOutline}
                                            size={1}
                                            className="icon-with-text"
                                        />
                                    </Tippy>
                                </div>
                            }
                        />
                    );
                },
                id: 'fleaSellPrice',
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
                                    source={
                                        props.row.original.barters[0]?.source
                                    }
                                    requiredItems={
                                        props.row.original.barters[0]?.requiredItems
                                    }
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
            });
        }

        if (traderValue) {
            useColumns.splice(1, 0, {
                Header: t('Sell to Trader'),
                accessor: (d) => Number(d.bestSell?.priceRUB),
                Cell: traderSellCell,
                id: 'traderPrice',
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
            });
        }

        if (traderPrice) {
            useColumns.push({
                Header: t('Trader buy'),
                accessor: (d) => Number(d.instaProfit),
                Cell: TraderPriceCell,
                id: 'traderBuyCell',
            });
        }

        if (traderBuyback) {
            useColumns.push({
                Header: t('Buyback ratio'),
                accessor: 'buyback',
                Cell: ({ value }) => {
                    // allData.row.original.itemLink
                    return (
                        <div className="center-content">
                            {`${Math.floor((Math.round(value * 100) / 100) * 100)}%`}
                        </div>
                    );
                },
                id: 'buyback',
                sortDescFirst: true,
                sortType: 'basic',
            });
        }

        if (gridSlots) {
            useColumns.push({
                Header: t('Grid slots'),
                accessor: 'slots',
                Cell: CenterCell,
            });
        }

        if (innerSize) {
            useColumns.push({
                Header: t('Inner size'),
                accessor: 'size',
                Cell: CenterCell,
            });
        }

        if (slotRatio) {
            useColumns.push({
                Header: t('Slot ratio'),
                accessor: 'ratio',
                Cell: CenterCell,
            });
        }

        if (pricePerSlot) {
            useColumns.push({
                Header: t('Price per slot'),
                accessor: 'pricePerSlot',
                Cell: ValueCell,
            });
        }

        if (armorClass) {
            useColumns.push({
                Header: t('Armor class'),
                accessor: 'armorClass',
                Cell: CenterCell,
            });
        }

        if (armorZones) {
            useColumns.push({
                Header: t('Zones'),
                accessor: 'armorZone',
                Cell: CenterCell,
            });
        }

        if (maxDurability) {
            useColumns.push({
                Header: t('Max Durability'),
                accessor: 'maxDurability',
                Cell: CenterCell,
            });
        }

        if (effectiveDurability) {
            useColumns.push({
                Header: t('Effective Durability'),
                accessor: 'effectiveDurability',
                Cell: CenterCell,
            });
        }

        if (repairability) {
            useColumns.push({
                Header: t('Repairability'),
                accessor: 'repairability',
                Cell: CenterCell,
            });
        }

        if (weight) {
            useColumns.push({
                Header: t('Weight (kg)'),
                accessor: 'weight',
                Cell: CenterCell,
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
            });
        }

        return useColumns;
    }, [
        t,
        instaProfit,
        traderPrice,
        traderValue,
        traderBuyback,
        fleaPrice,
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
        weight
    ]);

    let extraRow = false;

    // If there are no items returned by the API, we need to add a row to show
    if (data.length <= 0) {
        // If the API query has not yet completed
        if (result.isFetched === false) {
            extraRow = t('Loading...');
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
        />
    );
}

export default SmallItemTable;
