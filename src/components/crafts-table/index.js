import { useMemo, useEffect, useRef } from 'react';
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
import {
    getDurationDisplay,
    getFinishDisplay,
} from '../../modules/format-duration';
import bestPrice from '../../modules/best-price';
import { useMetaQuery } from '../../features/meta/queries';

import FleaMarketLoadingIcon from '../FleaMarketLoadingIcon';

function CraftTable({ selectedStation, freeFuel, nameFilter, itemFilter, showAll, averagePrices }) {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const includeFlea = useSelector((state) => state.settings.hasFlea);
    const settings = useSelector((state) => state.settings);
    const stations = useSelector(selectAllStations);
    const skills = useSelector(selectAllSkills);
    // const [skippedByLevel, setSkippedByLevel] = useState(false);
    const skippedByLevelRef = useRef();
    const feeReduction = stations['intelligence-center'] === 3 ? 0.7 - (0.003 * skills['hideout-management']) : 1;

    const crafts = useSelector(selectAllCrafts);
    const craftsStatus = useSelector((state) => {
        return state.crafts.status;
    });

    const barters = useSelector(selectAllBarters);
    const bartersStatus = useSelector((state) => {
        return state.barters.status;
    });

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
        let addedStations = [];

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

                const tradeData = {
                    costItems: costItems,
                    cost: totalCost,
                    craftTime: craftDuration,
                    reward: {
                        id: craftRow.rewardItems[0].item.id,
                        name: craftRow.rewardItems[0].item.name,
                        wikiLink: craftRow.rewardItems[0].item.wikiLink,
                        itemLink: `/item/${craftRow.rewardItems[0].item.normalizedName}`,
                        source: `${station} (${t('Level')} ${level})`,
                        iconLink: craftRow.rewardItems[0].item.iconLink || `${process.env.PUBLIC_URL}/images/unknown-item-icon.jpg`,
                        count: craftRow.rewardItems[0].count,
                        sellValue: 0, 
                    },
                    cached: craftRow.cached,
                };

                const bestTrade = craftRow.rewardItems[0].item.sellFor.reduce((prev, current) => {
                    if (current.vendor.normalizedName === 'flea-market') 
                        return prev;
                    if (!settings.jaeger && current.vendor.normalizedName === 'jaeger') 
                        return prev;
                    if (!prev) 
                        return current;
                    if (prev.priceRUB < current.priceRUB) 
                        return current;
                    return prev;
                }, false);

                if ((bestTrade && bestTrade.priceRUB > tradeData.reward.sellValue) || (bestTrade && !includeFlea)) {
                    tradeData.reward.sellValue = bestTrade.priceRUB;
                    tradeData.reward.sellTo = bestTrade.vendor.name;
                }

                let fleaFeeSingle = 0;
                let fleaFeeTotal = 0;
                let fleaPriceToUse = craftRow.rewardItems[0].item[averagePrices === true ? 'avg24hPrice' : 'lastLowPrice'];
                if (fleaPriceToUse === 0) {
                    fleaPriceToUse = craftRow.rewardItems[0].item.lastLowPrice;
                }
                if (craftRow.rewardItems[0].priceCustom) {
                    fleaPriceToUse = craftRow.rewardItems[0].priceCustom;
                    tradeData.reward.sellType = 'custom';
                }

                if (!craftRow.rewardItems[0].item.types.includes('noFlea') && (showAll || includeFlea)) {
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
                if (itemB.profit < itemA.profit) {
                    return -1;
                }

                if (itemB.profit > itemA.profit) {
                    return 1;
                }

                return 0;
            })
            .filter((craft) => {
                // This is done after profit sorting
                if (selectedStation !== 'top') {
                    return true;
                }

                if (addedStations.includes(craft.reward.source)) {
                    return false;
                }

                addedStations.push(craft.reward.source);

                return true;
            });
    }, [
        nameFilter,
        selectedStation,
        freeFuel,
        crafts,
        barters,
        includeFlea,
        itemFilter,
        stations,
        skills,
        feeReduction,
        t,
        showAll,
        averagePrices,
        meta,
        settings
    ]);

    const columns = useMemo(
        () => [
            {
                Header: t('Reward'),
                id: 'reward',
                accessor: 'reward',
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
                                e.target.innerText = getFinishDisplay(value * 1000);
                            })}>
                                {getFinishDisplay(value * 1000)}
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
        />
    );
}

export default CraftTable;
