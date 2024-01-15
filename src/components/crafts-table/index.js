import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import 'tippy.js/dist/tippy.css'; // optional

import DataTable from '../data-table/index.js';
import fleaMarketFee from '../../modules/flea-market-fee.mjs';
import useCraftsData from '../../features/crafts/index.js';
import useBartersData from '../../features/barters/index.js';
import ValueCell from '../value-cell/index.js';
import CostItemsCell from '../cost-items-cell/index.js';
import formatCostItems from '../../modules/format-cost-items.js';
import {
    selectAllStations,
    selectAllSkills,
} from '../../features/settings/settingsSlice.js';
import CenterCell from '../center-cell/index.js';

import './index.css';
import RewardCell from '../reward-cell/index.js';
import { getDurationDisplay } from '../../modules/format-duration.js';
import bestPrice from '../../modules/best-price.js';
import useMetaData from '../../features/meta/index.js';

import FleaMarketLoadingIcon from '../FleaMarketLoadingIcon.jsx';

function CraftTable({ selectedStation, freeFuel, nameFilter, itemFilter, showAll, averagePrices, useBarterIngredients, useCraftIngredients }) {
    const { t } = useTranslation();
    const settings = useSelector((state) => state.settings);
    const { includeFlea, hasJaeger, completedQuests } = useMemo(() => {
        return {includeFlea: settings.hasFlea, hasJaeger: settings.jaeger !== 0, completedQuests: settings.completedQuests};
    }, [settings]);
    const stations = useSelector(selectAllStations);
    const skills = useSelector(selectAllSkills);
    const [skippedBySettings, setSkippedBySettings] = useState(false);

    const [sortState, setSortState] = useState([{id: 'profit', desc: true}]);

    const { data: crafts } = useCraftsData();

    const { data: barters } = useBartersData();

    const { data: meta } = useMetaData();


    const data = useMemo(() => {
        let addedStations = {};

        setSkippedBySettings(false);
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

                const station = craftRow.station.name;
                const stationNormalized = craftRow.station.normalizedName;
                const level = craftRow.level;

                if (!nameFilter && selectedStation && selectedStation !== 'top' && selectedStation !== 'banned' && selectedStation !== stationNormalized) {
                    return false;
                }

                if ((selectedStation === 'top' || selectedStation === 'banned') && stationNormalized === 'bitcoin-farm') {
                    return false;
                }

                if (selectedStation === 'banned') {
                    if (!craftRow.rewardItems[0].item.types.includes('noFlea')) {
                        return false;
                    }
                }

                if (!showAll && level > stations[stationNormalized]) {
                    //setSkippedByLevel(true);
                    setSkippedBySettings(true);

                    return false;
                }

                if (!showAll && craftRow.taskUnlock && settings.useTarkovTracker) {
                    if (!completedQuests.some(taskId => taskId === craftRow.taskUnlock.id)) {
                        setSkippedBySettings(true);
                        return false;
                    }
                }

                const costItems = formatCostItems(craftRow.requiredItems, {
                    settings,
                    barters: useBarterIngredients ? barters : false,
                    crafts: useCraftIngredients ? crafts : false,
                    freeFuel,
                    allowAllSources: showAll,
                    useBarterIngredients,
                    useCraftIngredients,
                });

                const craftDuration = Math.floor(
                    craftRow.duration - (craftRow.duration * (skills.crafting * 0.75)) / 100,
                );

                var costItemsWithoutTools = costItems.filter(costItem => costItem.isTool === false);
                costItemsWithoutTools.forEach((costItem) => (totalCost += costItem.pricePerUnit * costItem.count));

                const craftRewardItem = craftRow.rewardItems[0].item;

                const bestSellTo = craftRewardItem.sellFor.reduce(
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
                        item: craftRewardItem,
                        source: `${station} (${t('Level')} ${level})`,
                        count: craftRow.rewardItems[0].count,
                        sellTo: bestSellTo.vendor.name,
                        sellToNormalized: bestSellTo.vendor.normalizedName,
                        sellValue: bestSellTo.priceRUB,
                        taskUnlock: craftRow.taskUnlock,
                        isFIR: true,
                    },
                    cached: craftRow.cached || craftRewardItem.cached,
                    stationId: craftRow.station.id,
                };

                let fleaFeeSingle = 0;
                let fleaFeeTotal = 0;
                let fleaPriceToUse = craftRewardItem[averagePrices === true ? 'avg24hPrice' : 'lastLowPrice'];
                if (fleaPriceToUse === 0) {
                    fleaPriceToUse = craftRewardItem.lastLowPrice;
                }

                if (!tradeData.cached && !craftRewardItem.types.includes('noFlea') && (showAll || includeFlea)) {
                    const bestFleaPrice = bestPrice(craftRewardItem, meta?.flea?.sellOfferFeeRate, meta?.flea?.sellRequirementFeeRate, fleaPriceToUse);
                    if (!craftRow.rewardItems[0].priceCustom && (fleaPriceToUse === 0 || bestFleaPrice.bestPrice < fleaPriceToUse)) {
                        fleaPriceToUse = bestFleaPrice.bestPrice;
                        fleaFeeSingle = bestFleaPrice.bestPriceFee;
                    } else {
                        fleaFeeSingle = fleaMarketFee(
                            craftRewardItem.basePrice,
                            fleaPriceToUse,
                            1,
                            meta?.flea?.sellOfferFeeRate,
                            meta?.flea?.sellRequirementFeeRate,
                        );
                    }
                    fleaFeeTotal = fleaMarketFee(
                        craftRewardItem.basePrice,
                        fleaPriceToUse,
                        craftRow.rewardItems[0].count,
                        meta?.flea?.sellOfferFeeRate,
                        meta?.flea?.sellRequirementFeeRate,
                    );
                    if (fleaPriceToUse - fleaFeeSingle > tradeData.reward.sellValue) {
                        tradeData.reward.sellValue = fleaPriceToUse;
                    
                        tradeData.reward.sellTo = t('Flea Market');
                    } else {
                        fleaFeeSingle = 0;
                        fleaFeeTotal = 0;
                    }
                } else if (craftRewardItem.types.includes('noFlea')) {
                    tradeData.reward.sellNote = t('Flea banned');
                }

                if (craftRewardItem.priceCustom) {
                    tradeData.reward.sellValue = craftRewardItem.priceCustom;
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
        t,
        showAll,
        averagePrices,
        meta,
        settings,
        sortState,
        useCraftIngredients,
        useBarterIngredients,
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
                    let aCostItems = a.original.cost || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    let bCostItems = b.original.cost || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    if (selectedStation === 'banned') {
                        aCostItems = a.original.cost / a.original.reward.count || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                        bCostItems = b.original.cost / b.original.reward.count || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    }
                    
                    return aCostItems - bCostItems;
                },
                Cell: ({ value }) => {
                    return <CostItemsCell 
                        costItems={value} 
                        allowAllSources={showAll} 
                        barters={barters} 
                        crafts={crafts} 
                        useBarterIngredients={useBarterIngredients}
                        useCraftIngredients={useCraftIngredients}
                    />;
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
                sortType: (a, b, columnId, desc) => {
                    let aCostItems = a.original.cost || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    let bCostItems = b.original.cost || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    if (selectedStation === 'banned') {
                        aCostItems = a.original.cost / a.original.reward.count || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                        bCostItems = b.original.cost / b.original.reward.count || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    }
                    return aCostItems - bCostItems;
                },
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
        [t, includeFlea, selectedStation, showAll, crafts, barters, useCraftIngredients, useBarterIngredients],
    );

    let extraRow = false;

    if (data.length <= 0) {
        extraRow = t('No crafts available for selected filters');
    }

    if (data.length <= 0 && skippedBySettings) {
        extraRow = (
            <>
                {t('No crafts available for selected filters but some were hidden by ')}<Link to="/settings/">{t('your settings')}</Link>
            </>
        );
    }

    if (data.length > 0 && skippedBySettings) {
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
