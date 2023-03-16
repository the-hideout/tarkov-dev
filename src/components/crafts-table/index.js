import { useMemo, useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import 'tippy.js/dist/tippy.css'; // optional

import DataTable from '../data-table';
import fleaMarketFee from '../../modules/flea-market-fee';
import {
    selectAllCrafts,
    fetchCrafts,
} from '../../features/crafts/craftsSlice';
import {
    selectAllBarters,
    fetchBarters,
} from '../../features/barters/bartersSlice';
import { selectAllItems, fetchItems } from '../../features/items/itemsSlice';
import ValueCell from '../value-cell';
import CostItemsCell from '../cost-items-cell';
import formatCostItems from '../../modules/format-cost-items';
import {
    selectAllStations,
    selectAllSkills,
} from '../../features/settings/settingsSlice';
import CenterCell from '../center-cell';

import './index.css';
import RewardCell from '../reward-cell';
import { getDurationDisplay } from '../../modules/format-duration';
import bestPrice from '../../modules/best-price';
import { useMetaQuery } from '../../features/meta/queries';
import { useQuestsQuery } from '../../features/quests/queries';

import FleaMarketLoadingIcon from '../FleaMarketLoadingIcon';

function CraftTable({ selectedStation, freeFuel, nameFilter, itemFilter, showAll, averagePrices, excludeBarterIngredients }) {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const settings = useSelector((state) => state.settings);
    const { includeFlea, hasJaeger, completedQuests } = useMemo(() => {
        return {includeFlea: settings.hasFlea, hasJaeger: settings.jaeger !== 0, completedQuests: settings.completedQuests};
    }, [settings]);
    const stations = useSelector(selectAllStations);
    const skills = useSelector(selectAllSkills);
    // const [skippedByLevel, setSkippedByLevel] = useState(false);
    const skippedByLevelRef = useRef();
    const feeReduction = stations['intelligence-center'] === 3 ? 0.7 - (0.003 * skills['hideout-management']) : 1;

    const [sortState, setSortState] = useState([{id: 'profit', desc: true}]);

    const items = useSelector(selectAllItems);
    const itemsStatus = useSelector((state) => {
        return state.items.status;
    });

    useEffect(() => {
        let timer = false;
        if (itemsStatus === 'idle') {
            dispatch(fetchItems());
        }

        if (!timer) {
            timer = setInterval(() => {
                dispatch(fetchItems());
            }, 600000);
        }

        return () => {
            clearInterval(timer);
        };
    }, [itemsStatus, dispatch]);

    const craftSelector = useSelector(selectAllCrafts);
    const craftsStatus = useSelector((state) => {
        return state.crafts.status;
    });

    const barterSelector = useSelector(selectAllBarters);
    const bartersStatus = useSelector((state) => {
        return state.barters.status;
    });

    const {data: tasks} = useQuestsQuery();

    const barters = useMemo(() => {
        return barterSelector.map(b => {
            return {
                ...b,
                requiredItems: b.requiredItems.map(req => {
                    const matchedItem = items.find(it => it.id === req.item.id);
                    if (!matchedItem) {
                        return false;
                    }
                    return {
                        ...req,
                        item: matchedItem,
                    };
                }).filter(Boolean),
                rewardItems: b.rewardItems.map(req => {
                    const matchedItem = items.find(it => it.id === req.item.id);
                    if (!matchedItem) {
                        return false;
                    }
                    return {
                        ...req,
                        item: matchedItem,
                    };
                }).filter(Boolean),
            };
        }).filter(() => !excludeBarterIngredients)
        .filter(barter => barter.rewardItems.length > 0 && barter.requiredItems.length > 0);
    }, [barterSelector, items, excludeBarterIngredients]);

    const crafts = useMemo(() => {
        return craftSelector.map(c => {
            let taskUnlock = c.taskUnlock;
            if (taskUnlock) {
                taskUnlock = tasks.find(t => t.id === taskUnlock.id);
            }
            return {
                ...c,
                requiredItems: c.requiredItems.map(req => {
                    let matchedItem = items.find(it => it.id === req.item.id);
                    if (matchedItem && matchedItem.types.includes('gun')) {
                        if (req.attributes?.some(element => element.type === 'functional' && Boolean(element.value))) {
                            matchedItem = items.find(it => it.id === matchedItem.properties?.defaultPreset?.id);
                        }
                    }
                    if (!matchedItem) {
                        return false;
                    }
                    return {
                        ...req,
                        item: matchedItem,
                    };
                }).filter(Boolean),
                rewardItems: c.rewardItems.map(req => {
                    const matchedItem = items.find(it => it.id === req.item.id);
                    if (!matchedItem) {
                        return false;
                    }
                    return {
                        ...req,
                        item: matchedItem,
                    };
                }).filter(Boolean),
                taskUnlock: taskUnlock,
            };
        }).filter(craft => craft.rewardItems.length > 0 && craft.rewardItems.length > 0);
    }, [craftSelector, items, tasks]);

    const { data: meta } = useMetaQuery();

    useEffect(() => {
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
    }, [bartersStatus, dispatch]);

    useEffect(() => {
        let timer = false;
        if (craftsStatus === 'idle') {
            dispatch(fetchCrafts());
        }

        if (!timer) {
            timer = setInterval(() => {
                dispatch(fetchCrafts());
            }, 600000);
        }

        return () => {
            clearInterval(timer);
        };
    }, [craftsStatus, dispatch]);

    const data = useMemo(() => {
        let addedStations = {};

        skippedByLevelRef.current = false;
        return crafts
            .map((craftRow) => {
                let totalCost = 0;

                if (!craftRow.rewardItems[0]) {
                    console.log(craftRow);
                    return false;
                }

                if (itemFilter) {
                    let matchesFilter = false;
                    for (const requiredItem of craftRow.requiredItems) {
                        if (requiredItem === null) {
                            continue;
                        }

                        if (requiredItem.item.id === itemFilter) {
                            matchesFilter = true;

                            break;
                        }
                    }

                    for (const rewardItem of craftRow.rewardItems) {
                        if (rewardItem.item.id === itemFilter) {
                            matchesFilter = true;

                            break;
                        }
                    }

                    if (!matchesFilter) {
                        return false;
                    }
                }

                if (nameFilter?.length > 0) {
                    let matchesFilter = false;
                    const findString = nameFilter
                        .toLowerCase()
                        .replace(/\s/g, '');
                    for (const requiredItem of craftRow.requiredItems) {
                        if (requiredItem === null) {
                            continue;
                        }

                        if (
                            requiredItem.item.name
                                .toLowerCase()
                                .replace(/\s/g, '')
                                .includes(findString)
                        ) {
                            matchesFilter = true;

                            break;
                        }
                    }

                    for (const rewardItem of craftRow.rewardItems) {
                        if (
                            rewardItem.item.name
                                .toLowerCase()
                                .replace(/\s/g, '')
                                .includes(findString)
                        ) {
                            matchesFilter = true;

                            break;
                        }
                    }

                    if (!matchesFilter) {
                        return false;
                    }
                }

                if (!showAll && craftRow.taskUnlock && completedQuests?.length > 0) {
                    if (!completedQuests.some(taskId => taskId === craftRow.taskUnlock.id)) {
                        return false;
                    }
                }

                const station = craftRow.station.name;
                const stationNormalized = craftRow.station.normalizedName;
                const level = craftRow.level;

                if (!nameFilter && selectedStation && selectedStation !== 'top' && selectedStation !== stationNormalized) {
                    return false;
                }

                if (selectedStation === 'top' && stationNormalized === 'bitcoin-farm') {
                    return false;
                }

                if (showAll) {
                    skippedByLevelRef.current = false;
                }

                if (!showAll && level > stations[stationNormalized]) {
                    //setSkippedByLevel(true);
                    skippedByLevelRef.current = true;

                    return false;
                }

                const costItems = formatCostItems(
                    craftRow.requiredItems,
                    settings,
                    barters,
                    freeFuel,
                    showAll
                );

                const craftDuration = Math.floor(
                    craftRow.duration - (craftRow.duration * (skills.crafting * 0.75)) / 100,
                );

                var costItemsWithoutTools = costItems.filter(costItem => costItem.isTool === false)
                costItemsWithoutTools.map(
                    (costItem) => (totalCost = totalCost + costItem.price * costItem.count),
                );

                const bestSellTo = craftRow.rewardItems[0].item.sellFor.reduce(
                    (previousSellFor, currentSellFor) => {
                        if (currentSellFor.vendor.normalizedName === 'flea-market') {
                            return previousSellFor;
                        }
                        if (currentSellFor.vendor.normalizedName === 'jaeger' && !hasJaeger) {
                            return previousSellFor;
                        }
                        if (previousSellFor.priceRUB > currentSellFor.priceRUB) {
                            return previousSellFor;
                        }
                        return currentSellFor;
                    },
                    {
                        vendor: {
                            name: t('N/A'),
                            normalizedName: 'unknown'
                        },
                        priceRUB: 0,
                    },
                );

                const tradeData = {
                    costItems: costItems,
                    cost: totalCost,
                    craftTime: craftDuration,
                    reward: {
                        item: craftRow.rewardItems[0].item,
                        source: `${station} (${t('Level')} ${level})`,
                        count: craftRow.rewardItems[0].count,
                        sellTo: bestSellTo.vendor.name,
                        sellToNormalized: bestSellTo.vendor.normalizedName,
                        sellValue: bestSellTo.priceRUB,
                        taskUnlock: craftRow.taskUnlock,
                        isFIR: true,
                    },
                    cached: craftRow.cached || craftRow.rewardItems[0].item.cached,
                    stationId: craftRow.station.id,
                };

                let fleaFeeSingle = 0;
                let fleaFeeTotal = 0;
                let fleaPriceToUse = craftRow.rewardItems[0].item[averagePrices === true ? 'avg24hPrice' : 'lastLowPrice'];
                if (fleaPriceToUse === 0) {
                    fleaPriceToUse = craftRow.rewardItems[0].item.lastLowPrice;
                }

                if (!tradeData.cached && !craftRow.rewardItems[0].item.types.includes('noFlea') && (showAll || includeFlea)) {
                    const bestFleaPrice = bestPrice(craftRow.rewardItems[0].item, meta?.flea?.sellOfferFeeRate, meta?.flea?.sellRequirementFeeRate, fleaPriceToUse);
                    if (!craftRow.rewardItems[0].priceCustom && (fleaPriceToUse === 0 || bestFleaPrice.bestPrice < fleaPriceToUse)) {
                        fleaPriceToUse = bestFleaPrice.bestPrice;
                        fleaFeeSingle = bestFleaPrice.bestPriceFee;
                    } else {
                        fleaFeeSingle = fleaMarketFee(
                            craftRow.rewardItems[0].item.basePrice,
                            fleaPriceToUse,
                            1,
                            meta?.flea?.sellOfferFeeRate,
                            meta?.flea?.sellRequirementFeeRate,
                        ) * feeReduction;
                    }
                    fleaFeeTotal = fleaMarketFee(
                        craftRow.rewardItems[0].item.basePrice,
                        fleaPriceToUse,
                        craftRow.rewardItems[0].count,
                        meta?.flea?.sellOfferFeeRate,
                        meta?.flea?.sellRequirementFeeRate,
                    ) * feeReduction;
                    if (fleaPriceToUse - fleaFeeSingle > tradeData.reward.sellValue) {
                        tradeData.reward.sellValue = fleaPriceToUse;
                    
                        tradeData.reward.sellTo = t('Flea Market');
                    } else {
                        fleaFeeSingle = 0;
                        fleaFeeTotal = 0;
                    }
                } else if (craftRow.rewardItems[0].item.types.includes('noFlea')) {
                    tradeData.reward.sellNote = t('Flea banned');
                }

                if (craftRow.rewardItems[0].item.priceCustom) {
                    tradeData.reward.sellValue = craftRow.rewardItems[0].item.priceCustom;
                    tradeData.reward.sellType = 'custom';
                }

                tradeData.profitParts = [
                    {
                        name: t('Sell price'),
                        value: tradeData.reward.sellValue * craftRow.rewardItems[0].count,
                    },
                ];
                if (totalCost) {
                    tradeData.profitParts.push({
                        name: t('Cost'),
                        value: totalCost * -1,
                    });
                }
                if (fleaFeeTotal) {
                    tradeData.profitParts.push({
                        name: t('Flea Market fee'),
                        value: fleaFeeTotal * -1,
                    });
                }

                tradeData.fleaThroughput = Math.floor(
                    (tradeData.reward.sellValue * craftRow.rewardItems[0].count) / (craftDuration / 3600),
                );

                tradeData.profit = tradeData.reward.sellValue * craftRow.rewardItems[0].count - totalCost - fleaFeeTotal;

                if (tradeData.profit === Infinity) {
                    tradeData.profit = 0;
                }

                tradeData.profitPerHour = Math.floor(
                    tradeData.profit / (craftDuration / 3600),
                );

                return tradeData;
            })
            .filter(Boolean)
            .sort((itemA, itemB) => {
                let sortField = 'profit';
                let desc = true;
                const columnSwap = {
                    costItems: 'cost',
                    reward: 'profit',
                };
                if (sortState.length > 0) {
                    sortField = sortState[0].id;
                    //desc = sortState[0].desc;
                }
                if (columnSwap[sortField]) {
                    sortField = columnSwap[sortField];
                }
                if (sortField === 'craftTime' || sortField === 'cost') {
                    desc = false;
                }
                if (!desc) {
                    return itemA[sortField] - itemB[sortField];
                }
                return itemB[sortField] - itemA[sortField];
            })
            .filter((craft) => {
                // This is done after profit sorting
                if (selectedStation !== 'top') {
                    return true;
                }
                if (!craft.cost && !craft.profit && !craft.profitPerHour) {
                    return false;
                }
                if (!addedStations[craft.stationId]) {
                    addedStations[craft.stationId] = 0;
                }
                if (addedStations[craft.stationId] >= 2) {
                    return false;
                }

                addedStations[craft.stationId]++;

                return true;
            });
    }, [
        nameFilter,
        selectedStation,
        freeFuel,
        crafts,
        barters,
        completedQuests,
        includeFlea,
        hasJaeger,
        itemFilter,
        stations,
        skills,
        feeReduction,
        t,
        showAll,
        averagePrices,
        meta,
        settings,
        sortState,
    ]);

    const columns = useMemo(
        () => [
            {
                Header: t('Reward'),
                id: 'reward',
                accessor: 'reward',
                sortType: (a, b, columnId, desc) => {
                    const aName = a.values.reward.item.name;
                    const bName = b.values.reward.item.name;
                    
                    return aName.localeCompare(bName);
                },
                Cell: ({ value }) => {
                    return <RewardCell {...value} />;
                },
            },
            {
                Header: t('Cost'),
                id: 'costItems',
                accessor: 'costItems',
                sortType: (a, b, columnId, desc) => {
                    const aCostItems = a.original.cost || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    const bCostItems = b.original.cost || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    
                    return aCostItems - bCostItems;
                },
                Cell: ({ value }) => {
                    return <CostItemsCell costItems={value} />;
                },
            },
            {
                Header: t('Duration') + '\n' + t('Finishes'),
                id: 'craftTime',
                accessor: 'craftTime',
                sortType: 'basic',
                Cell: ({ value }) => {
                    return (
                        <CenterCell nowrap>
                            <div className="duration-wrapper">
                                {getDurationDisplay(value * 1000)}
                            </div>
                            <div className="finish-wrapper" title={t('Start now')} onClick={((e) => {
                                e.target.innerText = getLocalFinishes(value, t);
                            })}>
                                {getLocalFinishes(value, t)}
                            </div>
                        </CenterCell>
                    );
                },
            },
            {
                Header: t('Cost ₽'),
                id: 'cost',
                accessor: (d) => Number(d.cost),
                Cell: (props) => {
                    if (props.row.original.cached) {
                        return (
                            <div className="center-content">
                                <FleaMarketLoadingIcon/>
                            </div>
                        );
                    }
                    return <ValueCell value={props.value} valueCount={props.row.original.reward.count}/>;
                },
            },
            ...(includeFlea
                ? [
                    {
                        Header: t('Flea throughput/h'),
                        id: 'fleaThroughput',
                        accessor: 'fleaThroughput',
                        sortType: 'basic',
                        Cell: (props) => {
                            if (props.row.original.cached) {
                                return (
                                    <div className="center-content">
                                        <FleaMarketLoadingIcon/>
                                    </div>
                                );
                            }
                            return <ValueCell value={props.value}/>;
                        },
                    },
                  ]
                : []),
            {
                Header: t('Estimated profit'),
                id: 'profit',
                accessor: 'profit',
                sortType: 'basic',
                Cell: (props) => {
                    if (props.row.original.cached) {
                        return (
                            <div className="center-content">
                                <FleaMarketLoadingIcon/>
                            </div>
                        );
                    }
                    return <ValueCell value={props.value} valueDetails={props.row.original.profitParts} highlightProfit />;
                },
            },
            {
                Header: t('Estimated profit/h'),
                id: 'profitPerHour',
                accessor: 'profitPerHour',
                sortType: 'basic',
                Cell: (props) => {
                    if (props.row.original.cached) {
                        return (
                            <div className="center-content">
                                <FleaMarketLoadingIcon/>
                            </div>
                        );
                    }
                    return <ValueCell value={props.value} highlightProfit />;
                },
            },
        ],
        [t, includeFlea],
    );

    let extraRow = false;

    if (data.length <= 0) {
        extraRow = t('No crafts available for selected filters');
    }

    if (data.length <= 0 && skippedByLevelRef.current) {
        extraRow = (
            <>
                {t('No crafts available for selected filters but some were hidden by ')}<Link to="/settings/">{t('your settings')}</Link>
            </>
        );
    }

    if (data.length > 0 && skippedByLevelRef.current) {
        extraRow = (
            <>
                {t('Some crafts hidden by ')}<Link to="/settings/">{t('your settings')}</Link>
            </>
        );
    }

    return (
        <DataTable
            key="crafts-table"
            columns={columns}
            data={data}
            extraRow={extraRow}
            sortBy={'profit'}
            sortByDesc={true}
            autoResetSortBy={false}
            onSort={newSortState => {
                setSortState(newSortState);
            }}
        />
    );
}

function getLocalFinishes(time, t) {
    const finishes = t('{{val, datetime}}', { val: Date.now() + time*1000,
        formatParams: {
            val: { weekday: 'short', hour: 'numeric', minute: 'numeric', second: 'numeric' },
        },
    })

    return finishes;
}

export default CraftTable;
