import { useMemo, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import 'tippy.js/dist/tippy.css'; // optional

import DataTable from '../../components/data-table';
// import { selectAllCrafts, fetchCrafts } from '../../features/crafts/craftsSlice';
import {
    selectAllBarters,
    fetchBarters,
} from '../../features/barters/bartersSlice';
import { selectAllTraders } from '../../features/settings/settingsSlice';
import { useItemsQuery } from '../../features/items/queries';
import ValueCell from '../value-cell';
import CostItemsCell from '../cost-items-cell';
import { formatCostItems, getCheapestItemPrice, getCheapestItemPriceWithBarters } from '../../modules/format-cost-items';
import RewardCell from '../reward-cell';
import { isAnyDogtag, isBothDogtags } from '../../modules/dogtags';
import FleaMarketLoadingIcon from '../FleaMarketLoadingIcon';
import { useQuestsQuery } from '../../features/quests/queries';

import './index.css';

function BartersTable({ selectedTrader, nameFilter, itemFilter, showAll }) {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const settings = useSelector((state) => state.settings);
    const { includeFlea, hasJaeger, removeDogtags } = useMemo(() => {
        return {includeFlea: settings.includeFlea, hasJaeger: settings.jaeger !== 0, removeDogtags: settings.hideDogtagBarters};
    }, [settings]);
    const traders = useSelector(selectAllTraders);
    const skippedByLevelRef = useRef(false);

    const barterSelector = useSelector(selectAllBarters);
    const bartersStatus = useSelector((state) => {
        return state.barters.status;
    });

    const {data: items} = useItemsQuery();

    const {data: tasks} = useQuestsQuery();

    const barters = useMemo(() => {
        return barterSelector.map(b => {
            let taskUnlock = b.taskUnlock;
            if (taskUnlock) {
                taskUnlock = tasks.find(t => t.id === taskUnlock.id);
            }
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
                taskUnlock: taskUnlock,
            };
        });
    }, [barterSelector, items]);

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
                Cell: ({ value }) => {
                    return <CostItemsCell costItems={value} />;
                },
            },
            {
                Header: t('Cost ₽'),
                id: 'cost',
                accessor: 'cost',
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
            {
                Header: t('Estimated savings'),
                id: 'savings',
                accessor: (d) => Number(d.savings),
                sortType: (a, b, columnId, desc) => {
                    const aSell = a.values.savings || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    const bSell = b.values.savings || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    
                    return aSell - bSell;
                },
                Cell: (props) => {
                    if (props.row.original.cached) {
                        return (
                            <div className="center-content">
                                <FleaMarketLoadingIcon/>
                            </div>
                        );
                    }
                    return <ValueCell value={props.value} highlightProfit valueDetails={props.row.original.savingsParts} />;
                },
            },
            {
                Header: t('InstaProfit'),
                id: 'instaProfit',
                accessor: 'instaProfit',
                sortType: 'basic',
                Cell: (props) => {
                    if (props.row.original.cached) {
                        return (
                            <div className="center-content">
                                <FleaMarketLoadingIcon/>
                            </div>
                        );
                    }
                    return (
                        <ValueCell value={props.value} highlightProfit valueDetails={props.row.original.instaProfitDetails}>
                            <div className="duration-wrapper">
                                {props.row.original.instaProfitSource.vendor.normalizedName!=='unknown' ? props.row.original.instaProfitSource.vendor.name : ''}
                            </div>
                        </ValueCell>
                    );
                },
            },
        ],
        [t],
    );

    const data = useMemo(() => {
        let addedTraders = [];
        skippedByLevelRef.current = false;

        return barters
            .filter((barter) => {
                if (!barter.rewardItems[0]) {
                    return false;
                }

                return true;
            })
            .filter((barter) => {
                if (!itemFilter) {
                    return true;
                }

                for (const requiredItem of barter.requiredItems) {
                    if (requiredItem === null) {
                        continue;
                    }

                    if (requiredItem.item.id === itemFilter) {
                        return true;
                    }
                    if (isBothDogtags(itemFilter) && isAnyDogtag(requiredItem.item.id)) {
                        return true;
                    }
                    if (isBothDogtags(requiredItem.item.id) && isAnyDogtag(itemFilter)) {
                        return true;
                    }
                }

                for (const rewardItem of barter.rewardItems) {
                    if (rewardItem.item.id === itemFilter) {
                        return true;
                    }
                    if (!rewardItem.item.containsItems) continue;
                    for (const contained of rewardItem.item.containsItems) {
                        if (contained.item.id === itemFilter) {
                            return true;
                        }
                    }
                }

                return false;
            })
            .filter((barter) => {
                let trader = barter.trader.normalizedName;
                let level = barter.level;

                if (
                    !nameFilter &&
                    selectedTrader &&
                    selectedTrader !== 'all' &&
                    selectedTrader !== trader.toLowerCase().replace(/\s/g, '-')
                ) {
                    return false;
                }

                if (showAll) {
                    skippedByLevelRef.current = false;
                }

                if (!showAll && level > traders[trader.toLowerCase()]) {
                    skippedByLevelRef.current = true;
                    return false;
                }

                return true;
            })
            .filter((barter) => {
                if (!nameFilter || nameFilter.length <= 0) {
                    return true;
                }

                const findString = nameFilter.toLowerCase().replace(/\s/g, '');
                for (const requiredItem of barter.requiredItems) {
                    if (requiredItem === null) {
                        continue;
                    }

                    if (
                        requiredItem.item.name
                            .toLowerCase()
                            .replace(/\s/g, '')
                            .includes(findString)
                    ) {
                        return true;
                    }
                }

                for (const rewardItem of barter.rewardItems) {
                    if (
                        rewardItem.item.name
                            .toLowerCase()
                            .replace(/\s/g, '')
                            .includes(findString)
                    ) {
                        return true;
                    }
                }

                return false;
            })
            .map((barterRow) => {
                let cost = 0;

                if (removeDogtags) {
                    for (const requiredItem of barterRow.requiredItems) {
                        if (requiredItem === null) {
                            continue;
                        }

                        if (
                            requiredItem.item.name
                                .toLowerCase()
                                .replace(/\s/g, '')
                                .includes('dogtag')
                        ) {
                            return false;
                        }
                    }
                }

                const costItems = formatCostItems(
                    barterRow.requiredItems,
                    settings,
                    barters,
                    false,
                    showAll,
                );
                costItems.map(
                    (costItem) =>
                        (cost = cost + costItem.price * costItem.count),
                );

                const bestSellTo = barterRow.rewardItems[0].item.sellFor.reduce(
                    (previousSellForObject, sellForObject) => {
                        if (sellForObject.vendor.normalizedName === 'flea-market') {
                            return previousSellForObject;
                        }

                        if (sellForObject.vendor.normalizedName === 'jaeger' && !hasJaeger) {
                            return previousSellForObject;
                        }

                        if (previousSellForObject.priceRUB > sellForObject.priceRUB) {
                            return previousSellForObject;
                        }

                        return sellForObject;
                    },
                    {
                        vendor: {
                            name: 'unkonwn',
                            normalizedName: 'unknown'
                        },
                        priceRUB: 0,
                    },
                );

                let level = barterRow.level;

                const tradeData = {
                    costItems: costItems,
                    cost: cost,
                    instaProfit: bestSellTo.priceRUB - cost,
                    instaProfitSource: bestSellTo,
                    instaProfitDetails: [
                        {
                            name: bestSellTo.vendor.name,
                            value: bestSellTo.priceRUB,
                        },
                        {
                            name: t('Barter cost'),
                            value: cost * -1,
                        }
                    ],
                    reward: {
                        id: barterRow.rewardItems[0].item.id,
                        sellTo: t('N/A'),
                        sellToNormalized: 'none',
                        name: barterRow.rewardItems[0].item.name,
                        sellValue: 0,
                        source: `${barterRow.trader.name} ${t('LL{{level}}', { level: level })}`,
                        iconLink:
                            barterRow.rewardItems[0].item.iconLink ||
                            `${process.env.PUBLIC_URL}/images/unknown-item-icon.jpg`,
                        itemLink: `/item/${barterRow.rewardItems[0].item.normalizedName}`,
                        taskUnlock: barterRow.taskUnlock,
                    },
                    cached: barterRow.cached,
                };

                const bestTrade = barterRow.rewardItems[0].item.sellFor.reduce((prev, current) => {
                    if (current.vendor.normalizedName === 'flea-market') 
                        return prev;
                    if (!hasJaeger && current.vendor.normalizedName === 'jaeger') 
                        return prev;
                    if (!prev) 
                        return current;
                    if (prev.priceRUB < current.priceRUB) 
                        return current;
                    return prev;
                }, false);

                if (
                    (bestTrade && bestTrade.priceRUB > tradeData.reward.value) ||
                    (bestTrade && !includeFlea)
                ) {
                    // console.log(barterRow.rewardItems[0].item.sellTo);
                    tradeData.reward.sellValue = bestTrade.priceRUB;
                    tradeData.reward.sellTo = bestTrade.vendor.name;
                    tradeData.reward.sellToNormalized = bestTrade.vendor.normalizedName;
                }
                if (barterRow.rewardItems[0].priceCustom) {
                    tradeData.reward.sellValue = barterRow.rewardItems[0].priceCustom;
                    tradeData.reward.sellType = 'custom';
                }
                
                //tradeData.reward.sellTo = t(tradeData.reward.sellTo)

                tradeData.savingsParts = [];
                const cheapestPrice = getCheapestItemPrice(barterRow.rewardItems[0].item, settings, showAll);
                const cheapestBarter = getCheapestItemPriceWithBarters(barterRow.rewardItems[0].item, barters, settings, showAll);
                if (cheapestPrice.type === 'cash-sell'){
                    //this item cannot be purchased for cash
                    if (cheapestBarter.priceRUB !== cost) {
                        tradeData.savingsParts.push({
                            name: `${cheapestBarter.vendor.name} ${t('LL{{level}}', { level: cheapestBarter.vendor.minTraderLevel })} ${t('Barter')}`,
                            value: cheapestBarter.priceRUB
                        });
                    }
                    tradeData.savings = cheapestBarter.priceRUB - cost;
                } else {
                    // savings based on cheapest cash price
                    let sellerName = cheapestPrice.vendor.name;
                    if (cheapestPrice.vendor.minTraderLevel) {
                        sellerName += ` ${t('LL{{level}}', { level: cheapestPrice.vendor.minTraderLevel })}`;
                    }
                    tradeData.savingsParts.push({
                        name: sellerName,
                        value: cheapestPrice.priceRUB
                    });
                    tradeData.savings = cheapestPrice.priceRUB - cost;
                }
                if (tradeData.savingsParts.length > 0) {
                    tradeData.savingsParts.push({
                        name: t('Barter cost'),
                        value: cost * -1
                    });
                }

                if (tradeData.reward.sellValue === 0) {
                    tradeData.instaProfitDetails.splice(0, 1);
                }

                return tradeData;
            })
            .filter(Boolean)
            .sort((itemA, itemB) => {
                if (itemB.savings > itemA.savings) {
                    return -1;
                }

                if (itemB.savings < itemA.savings) {
                    return 1;
                }

                return 0;
            })
            .filter((barter) => {
                if (selectedTrader !== 'all') {
                    return true;
                }

                if (selectedTrader === 'all') {
                    return true;
                }

                if (addedTraders.includes(barter.reward.source)) {
                    return false;
                }

                addedTraders.push(barter.reward.source);

                return true;
            });
    }, [
        nameFilter,
        selectedTrader,
        barters,
        includeFlea,
        itemFilter,
        traders,
        hasJaeger,
        t,
        removeDogtags,
        showAll,
        settings,
    ]);

    let extraRow = false;

    if (data.length <= 0) {
        extraRow = t('No barters available for selected filters');
    }

    if (data.length <= 0 && skippedByLevelRef.current) {
        extraRow = (
            <>
                {t('No barters available for selected filters but some were hidden by ')}<Link to="/settings/">{t('your settings')}</Link>
            </>
        );
    }

    if (data.length > 0 && skippedByLevelRef.current) {
        extraRow = (
            <>
                {t('Some barters hidden by ')}<Link to="/settings/">{t('your settings')}</Link>
            </>
        );
    }

    return (
        <DataTable
            key="barters-table"
            columns={columns}
            data={data}
            extraRow={extraRow}
            sortBy={'instaProfit'}
            sortByDesc={true}
        />
    );
}

export default BartersTable;
