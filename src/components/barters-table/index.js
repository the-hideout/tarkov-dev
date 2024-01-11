import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import 'tippy.js/dist/tippy.css'; // optional

import DataTable from '../../components/data-table/index.js';
import useBartersData from '../../features/barters/index.js';
import useCraftsData from '../../features/crafts/index.js';
import { selectAllTraders } from '../../features/settings/settingsSlice.js';
import ValueCell from '../value-cell/index.js';
import CostItemsCell from '../cost-items-cell/index.js';
import { formatCostItems, getCheapestCashPrice, getCheapestBarter } from '../../modules/format-cost-items.js';
import RewardCell from '../reward-cell/index.js';
import { isAnyDogtag, isBothDogtags } from '../../modules/dogtags.js';
import FleaMarketLoadingIcon from '../FleaMarketLoadingIcon.jsx';

import './index.css';

function BartersTable({ selectedTrader, nameFilter, itemFilter, showAll, useBarterIngredients, useCraftIngredients }) {
    const { t } = useTranslation();
    const settings = useSelector((state) => state.settings);
    const { hasJaeger, removeDogtags, completedQuests } = useMemo(() => {
        return {hasJaeger: settings.jaeger !== 0, removeDogtags: settings.hideDogtagBarters, completedQuests: settings.completedQuests};
    }, [settings]);
    const traders = useSelector(selectAllTraders);
    const [skippedBySettings, setSkippedBySettings] = useState(false);

    const { data: barters } = useBartersData();
    const { data: crafts } = useCraftsData();

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
                    return <CostItemsCell costItems={value} allowAllSources={showAll} barters={useBarterIngredients ? barters : false} crafts={useCraftIngredients ? crafts : false} />;
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
                    return <ValueCell value={props.value} valueCount={props.row.original.reward.count}/>;
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
        [t, showAll, useBarterIngredients, useCraftIngredients, barters, crafts],
    );

    const data = useMemo(() => {
        let addedTraders = [];
        setSkippedBySettings(false);

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
                        if (!contained) {
                            continue;
                        }
                        if (contained.item.id === itemFilter) {
                            return true;
                        }
                    }
                }

                return false;
            })
            .filter((barter) => {
                let traderNormalizedName = barter.trader.normalizedName;
                let level = barter.level;

                if (
                    !nameFilter &&
                    selectedTrader &&
                    selectedTrader !== 'all' &&
                    selectedTrader !== traderNormalizedName
                ) {
                    return false;
                }

                if (!showAll && level > traders[traderNormalizedName]) {
                    setSkippedBySettings(true);
                    return false;
                }

                if (!showAll && barter.taskUnlock && settings.useTarkovTracker) {
                    if (!completedQuests.some(taskId => taskId === barter.taskUnlock.id)) {
                        setSkippedBySettings(true);
                        return false;
                    }
                }

                if (removeDogtags) {
                    for (const requiredItem of barter.requiredItems) {
                        if (requiredItem === null) {
                            continue;
                        }

                        if (
                            requiredItem.item.name
                                .toLowerCase()
                                .replace(/\s/g, '')
                                .includes('dogtag')
                        ) {
                            setSkippedBySettings(true);
                            return false;
                        }
                    }
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
                const costItems = formatCostItems(barterRow.requiredItems, {
                    settings,
                    barters: useBarterIngredients ? barters : false,
                    crafts: useCraftIngredients ? crafts : false,
                    allowAllSources: showAll,
                    useBarterIngredients,
                    useCraftIngredients,
                });
                costItems.forEach((costItem) => (cost += costItem.pricePerUnit * costItem.count));

                const barterRewardItem = barterRow.rewardItems[0].item;

                const bestSellTo = barterRewardItem.sellFor.reduce(
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
                    cost: cost,
                    instaProfit: (bestSellTo.priceRUB * barterRow.rewardItems[0].count) - cost,
                    instaProfitSource: bestSellTo,
                    instaProfitDetails: [
                        {
                            name: bestSellTo.vendor.name,
                            value: bestSellTo.priceRUB * barterRow.rewardItems[0].count,
                        },
                        {
                            name: t('Barter cost'),
                            value: cost * -1,
                        }
                    ],
                    reward: {
                        item: barterRewardItem,
                        source: `${barterRow.trader.name} ${t('LL{{level}}', { level: barterRow.level })}`,
                        sellTo: bestSellTo.vendor.name,
                        sellToNormalized: bestSellTo.vendor.normalizedName,
                        sellValue: bestSellTo.priceRUB,
                        taskUnlock: barterRow.taskUnlock,
                        isFIR: false,
                        count: barterRow.rewardItems[0].count,
                    },
                    cached: barterRow.cached || barterRewardItem.cached,
                };

                if (barterRewardItem.priceCustom) {
                    tradeData.reward.sellValue = barterRewardItem.priceCustom;
                    tradeData.reward.sellType = 'custom';
                }
                
                //tradeData.reward.sellTo = t(tradeData.reward.sellTo)

                tradeData.savingsParts = [];
                const cheapestPrice = getCheapestCashPrice(barterRewardItem, settings, showAll);
                const cheapestBarter = getCheapestBarter(barterRewardItem, {barters, crafts: useCraftIngredients ? crafts : false, settings, allowAllSources: showAll});
                if (cheapestPrice.type === 'cash-sell'){
                    //this item cannot be purchased for cash
                    if (cheapestBarter) {
                        if (cheapestBarter.priceRUB !== cost) {
                            tradeData.savingsParts.push({
                                name: `${cheapestBarter.vendor.name} ${t('LL{{level}}', { level: cheapestBarter.vendor.minTraderLevel })} ${t('Barter')}`,
                                value: cheapestBarter.priceRUB,
                            });
                        }
                        tradeData.savings = cheapestBarter.priceRUB - cost;
                    }
                } else {
                    // savings based on cheapest cash price
                    let sellerName = cheapestPrice.vendor.name;
                    if (cheapestPrice.vendor.minTraderLevel) {
                        sellerName += ` ${t('LL{{level}}', { level: cheapestPrice.vendor.minTraderLevel })}`;
                    }
                    tradeData.savingsParts.push({
                        name: sellerName,
                        value: cheapestPrice.priceRUB,
                    });
                    tradeData.savings = cheapestPrice.priceRUB - Math.round(cost / barterRow.rewardItems[0].count);
                }
                if (tradeData.savingsParts.length > 0) {
                    tradeData.savingsParts.push({
                        name: t('Barter cost'),
                        value: Math.round(cost / barterRow.rewardItems[0].count) * -1
                    });
                }

                if (tradeData.reward.sellValue === 0) {
                    tradeData.instaProfitDetails.splice(0, 1);
                }

                return tradeData;
            })
            .filter(Boolean)
            .sort((itemA, itemB) => {
                return itemB.savings - itemA.savings;
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
        crafts,
        itemFilter,
        traders,
        completedQuests,
        hasJaeger,
        t,
        removeDogtags,
        showAll,
        settings,
        useBarterIngredients,
        useCraftIngredients,
    ]);

    let extraRow = false;

    if (data.length <= 0) {
        extraRow = t('No barters available for selected filters');
    }

    if (data.length <= 0 && skippedBySettings) {
        extraRow = (
            <>
                {t('No barters available for selected filters but some were hidden by ')}<Link to="/settings/">{t('your settings')}</Link>
            </>
        );
    }

    if (data.length > 0 && skippedBySettings) {
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
