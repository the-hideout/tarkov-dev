import { useMemo, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

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
import { fetchTarkovTrackerProgress } from '../../features/settings/settingsSlice';

import './index.css';
import RewardCell from '../reward-cell';
import { getDurationDisplay } from '../../modules/format-duration';

function CraftTable(props) {
    const { selectedStation, freeFuel, nameFilter, itemFilter, showAll } =
        props;
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const includeFlea = useSelector((state) => state.settings.hasFlea);
    const stations = useSelector(selectAllStations);
    const skills = useSelector(selectAllSkills);
    // const [skippedByLevel, setSkippedByLevel] = useState(false);
    const skippedByLevelRef = useRef();
    const feeReduction = stations['intelligence-center'] === 3 ? 0.7 : 1;

    const crafts = useSelector(selectAllCrafts);
    const craftsStatus = useSelector((state) => {
        return state.crafts.status;
    });

    const barters = useSelector(selectAllBarters);
    const bartersStatus = useSelector((state) => {
        return state.barters.status;
    });

    const tarkovTrackerAPIKey = useSelector(
        (state) => state.settings.tarkovTrackerAPIKey,
    );
    const useTarkovTracker = useSelector(
        (state) => state.settings.useTarkovTracker,
    );
    const progressStatus = useSelector((state) => {
        return state.settings.progressStatus;
    });

    useEffect(() => {
        let tarkovTrackerProgressInterval = false;
        if (progressStatus === 'idle' && useTarkovTracker) {
            dispatch(fetchTarkovTrackerProgress(tarkovTrackerAPIKey));
        }

        if (!tarkovTrackerProgressInterval && useTarkovTracker) {
            tarkovTrackerProgressInterval = setInterval(() => {
                dispatch(fetchTarkovTrackerProgress(tarkovTrackerAPIKey));
            }, 30000);
        }

        return () => {
            clearInterval(tarkovTrackerProgressInterval);
        };
    }, [progressStatus, dispatch, tarkovTrackerAPIKey, useTarkovTracker]);

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

                // let hasZeroCostItem = false;
                let [station, level] = craftRow.source.split('level');

                level = parseInt(level);
                station = station.trim();

                if (
                    !nameFilter &&
                    selectedStation &&
                    selectedStation !== 'top' &&
                    selectedStation !==
                        station.toLowerCase().replace(/\s/g, '-')
                ) {
                    return false;
                }

                if (showAll) {
                    skippedByLevelRef.current = false;
                }

                if (
                    !showAll &&
                    level > stations[station.toLowerCase().replace(/\s/g, '-')]
                ) {
                    //setSkippedByLevel(true);
                    skippedByLevelRef.current = true;

                    return false;
                }

                const costItems = formatCostItems(
                    craftRow.requiredItems,
                    skills['hideout-managment'],
                    barters,
                    freeFuel,
                    includeFlea,
                );

                // const craftDuration = Math.floor(craftRow.duration - (skills.crafting * 0.75))
                const craftDuration = Math.floor(
                    craftRow.duration -
                        (craftRow.duration * (skills.crafting * 0.75)) / 100,
                );

                costItems.map(
                    (costItem) =>
                        (totalCost =
                            totalCost + costItem.price * costItem.count),
                );

                const tradeData = {
                    costItems: costItems,
                    cost: totalCost,
                    craftTime: craftDuration,
                    reward: {
                        name: craftRow.rewardItems[0].item.name,
                        wikiLink: craftRow.rewardItems[0].item.wikiLink,
                        itemLink: `/item/${craftRow.rewardItems[0].item.normalizedName}`,
                        source: `${station} (level ${level})`,
                        iconLink:
                            craftRow.rewardItems[0].item.iconLink ||
                            'https://tarkov.dev/images/unknown-item-icon.jpg',
                        count: craftRow.rewardItems[0].count,
                        value: 0,
                    },
                };

                const bestTraderValue = Math.max(
                    ...craftRow.rewardItems[0].item.traderPrices.map(
                        (priceObject) => priceObject.price,
                    ),
                );
                const bestTrade =
                    craftRow.rewardItems[0].item.traderPrices.find(
                        (traderPrice) => traderPrice.price === bestTraderValue,
                    );

                if (
                    (bestTrade && bestTrade.price > tradeData.reward.value) ||
                    (bestTrade && !includeFlea)
                ) {
                    // console.log(barterRow.rewardItems[0].item.traderPrices);
                    tradeData.reward.value = bestTrade.price;
                    tradeData.reward.sellTo = bestTrade.trader.name;
                }

                if (!craftRow.rewardItems[0].item.types.includes('noFlea')) {
                    tradeData.reward.value =
                        craftRow.rewardItems[0].item.avg24hPrice;
                    tradeData.reward.sellTo = t('Flea Market');
                    tradeData.fleaThroughput = Math.floor(
                        (craftRow.rewardItems[0].item.avg24hPrice *
                            craftRow.rewardItems[0].count) /
                            (craftDuration / 3600),
                    );
                }

                tradeData.profit =
                    tradeData.reward.value * craftRow.rewardItems[0].count -
                    totalCost;
                if (tradeData.reward.sellTo === t('Flea Market')) {
                    tradeData.profit =
                        tradeData.profit -
                        fleaMarketFee(
                            craftRow.rewardItems[0].item.basePrice,
                            craftRow.rewardItems[0].item.avg24hPrice,
                            craftRow.rewardItems[0].count,
                        ) *
                            feeReduction;
                }

                if (tradeData.profit === Infinity) {
                    tradeData.profit = 0;
                }

                tradeData.profitPerHour = Math.floor(
                    tradeData.profit / (craftDuration / 3600),
                );

                // If the reward has no value, it's not available for purchase
                if (tradeData.reward.value === 0) {
                    tradeData.reward.value = tradeData.cost;
                    tradeData.reward.barterOnly = true;
                    tradeData.profit = 0;
                }

                // if(hasZeroCostItem){
                //     // console.log('Found a zero cost item!');
                //     // console.log(craftRow);

                //     return false;
                // }

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
    ]);

    const columns = useMemo(
        () => [
            {
                Header: t('Reward'),
                accessor: 'reward',
                Cell: ({ value }) => {
                    return <RewardCell {...value} />;
                },
            },
            {
                Header: t('Cost'),
                accessor: 'costItems',
                Cell: ({ value }) => {
                    return <CostItemsCell costItems={value} />;
                },
            },
            {
                Header: t('Duration'),
                accessor: 'craftTime',
                Cell: ({ value }) => {
                    return (
                        <CenterCell nowrap>
                            <div className="duration-wrapper">
                                {getDurationDisplay(value * 1000)}
                            </div>
                        </CenterCell>
                    );
                },
                sortType: 'basic',
            },
            {
                Header: t('Cost ₽'),
                accessor: (d) => Number(d.cost),
                Cell: ValueCell,
                id: 'cost',
            },
            ...(includeFlea
                ? [
                      {
                          Header: t('Flea throughput/h'),
                          accessor: 'fleaThroughput',
                          Cell: ValueCell,
                          sortType: 'basic',
                      },
                  ]
                : []),
            {
                Header: t('Estimated profit'),
                accessor: 'profit',
                Cell: (props) => {
                    return <ValueCell value={props.value} highlightProfit />;
                },
                sortType: 'basic',
            },
            {
                Header: t('Estimated profit/h'),
                accessor: 'profitPerHour',
                Cell: ({ value }) => {
                    return <ValueCell value={value} highlightProfit />;
                },
                sortType: 'basic',
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
            <div>
                {t(
                    'No crafts available for selected filters but some were hidden by ',
                )}
                <Link to="/settings/">{t('your settings')}</Link>
            </div>
        );
    }

    if (data.length > 0 && skippedByLevelRef.current) {
        extraRow = (
            <div>
                {t('Some crafts hidden by ')}
                <Link to="/settings/">{t('your settings')}</Link>
            </div>
        );
    }

    return (
        <DataTable
            columns={columns}
            key="crafts-table"
            data={data}
            extraRow={extraRow}
            sortBy={'profit'}
            sortByDesc={true}
            autoResetSortBy={false}
        />
    );
}

export default CraftTable;
