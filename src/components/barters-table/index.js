import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import 'tippy.js/dist/tippy.css'; // optional

import DataTable from '../../components/data-table/index.js';

import useBartersData from '../../features/barters/index.js';
import useCraftsData from '../../features/crafts/index.js';
import useItemsData from '../../features/items/index.js';
import useMetaData from '../../features/meta/index.js';
import { selectAllTraders } from '../../features/settings/settingsSlice.js';

import ValueCell from '../value-cell/index.js';
import CostItemsCell from '../cost-items-cell/index.js';
import RewardCell from '../reward-cell/index.js';

import FleaMarketLoadingIcon from '../FleaMarketLoadingIcon.jsx';

import { formatCostItems, getCheapestCashPrice, getCheapestBarter } from '../../modules/format-cost-items.js';
import { isAnyDogtag, isBothDogtags } from '../../modules/dogtags.js';
import fleaMarketFee from '../../modules/flea-market-fee.mjs';

import './index.css';

function BartersTable({ selectedTrader, nameFilter, itemFilter, showAll, useBarterIngredients, useCraftIngredients }) {
    const { t } = useTranslation();
    const settings = useSelector((state) => state.settings[state.settings.gameMode]);
    const { hasJaeger, removeDogtags, completedQuests } = useMemo(() => {
        return {hasJaeger: settings.jaeger !== 0, removeDogtags: settings.hideDogtagBarters, completedQuests: settings.completedQuests};
    }, [settings]);
    const traders = useSelector(selectAllTraders);
    const [skippedBySettings, setSkippedBySettings] = useState(false);

    const { data: barters } = useBartersData();
    const { data: crafts } = useCraftsData();
    const { data: items } = useItemsData();
    const { data: meta } = useMetaData();

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
                    if (a.values.costItems[0].id === '5d235b4d86f7742e017bc88a' && a.values.costItems[0].id === '5d235b4d86f7742e017bc88a') {
                        const aGPCost = a.values.costItems[0].price || 0;
                        const bGPCost = b.values.costItems[0].price || 0;
                        
                        return aGPCost - bGPCost;
                    }

                    const aCost = a.values.cost || 0;
                    const bCost = b.values.cost || 0;
                    
                    return aCost - bCost;
                },
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
                    const aSave = a.values.savings || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    const bSave = b.values.savings || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    
                    return aSave - bSave;
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
                sortType: (a, b, columnId, desc) => {
                    const aProf = a.values.instaProfit || 0;
                    const bProf = b.values.instaProfit || 0;
                    if (aProf === bProf) {
                        const aSave = a.values.savings || 0;
                        const bSave = b.values.savings || 0;
                        
                        return aSave - bSave;
                    }
                    
                    return aProf - bProf;
                },
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
                return !!barter.rewardItems[0];
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

                        if (requiredItem.item.normalizedName.includes('dogtag')) {
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
                let barterRewardContainedItem;

                if (barterRewardItem.bsgCategoryId === '543be5cb4bdc2deb348b4568') {    // "ammo-container"
                    barterRewardContainedItem = items.find(i => i.id === barterRewardItem.containsItems[0]?.item.id);
                    if (barterRewardContainedItem?.types.includes('noFlea')) {
                        barterRewardContainedItem = null;
                    }
                }

                const whatWeSell = barterRewardContainedItem ? barterRewardContainedItem : barterRewardItem;
                const howManyWeSell = barterRewardContainedItem ? barterRewardItem.containsItems[0].count : barterRow.rewardItems[0].count;
                const bestSellTo = whatWeSell.sellFor.reduce(
                    (previousSellFor, currentSellFor) => {
                        if (currentSellFor.vendor.normalizedName === 'flea-market' && meta.flea.foundInRaidRequired) {
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

                if (cost === 0 && costItems.length === 1 && costItems[0].id === '5d235b4d86f7742e017bc88a') {      // "gp-coin"
                    cost = bestSellTo.priceRUB * howManyWeSell;
                    const GPCoinPrice = cost / costItems[0].count;
                    costItems[0].price = GPCoinPrice;
                    costItems[0].priceRUB = GPCoinPrice;
                    costItems[0].pricePerUnit = GPCoinPrice;
                }

                let fleaFee = 0;
                if (bestSellTo.vendor.normalizedName === 'flea-market') {
                    fleaFee = fleaMarketFee(barterRewardItem.basePrice, bestSellTo.priceRUB, {count: howManyWeSell});
                }

                const tradeData = {
                    costItems: costItems,
                    cost: cost,
                    instaProfit: (bestSellTo.priceRUB * howManyWeSell) - cost - fleaFee,
                    instaProfitSource: bestSellTo,
                    instaProfitDetails: [
                        {
                            name: bestSellTo.vendor.name,
                            value: bestSellTo.priceRUB * howManyWeSell,
                        },
                    ],
                    reward: {
                        item: barterRewardItem,
                        count: barterRow.rewardItems[0].count,
                        source: `${barterRow.trader.name} ${t('LL{{level}}', { level: barterRow.level })}`,
                        sellTo: bestSellTo.vendor.name,
                        sellToNormalized: bestSellTo.vendor.normalizedName,
                        sellValue: bestSellTo.priceRUB * howManyWeSell,
                        taskUnlock: barterRow.taskUnlock,
                        isFIR: false,
                    },
                    cached: barterRow.cached || barterRewardItem.cached,
                };
                if (fleaFee) {
                    tradeData.instaProfitDetails.push({
                        name: t('Flea Fee'),
                        value: fleaFee * -1,
                    });
                }
                tradeData.instaProfitDetails.push({
                    name: t('Barter cost'),
                    value: cost * -1,
                });

                if (barterRewardItem.priceCustom) {
                    tradeData.reward.sellValue = barterRewardItem.priceCustom;
                    tradeData.reward.sellType = 'custom';
                }

                if (barterRewardContainedItem) {    // "ammo-container"
                    tradeData.reward.sellNote = t('Unpacked');
                }

                tradeData.savingsParts = [];
                const cheapestPrice = getCheapestCashPrice(barterRewardItem, settings, showAll);
                const cheapestBarter = getCheapestBarter(barterRewardItem, {barters, crafts: useCraftIngredients ? crafts : false, settings, useBarterIngredients, useCraftIngredients, allowAllSources: showAll});
                if (cheapestPrice.type === 'cash-sell') {
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
                } else if (cheapestPrice.type !== 'none') {
                    // savings based on cheapest cash price
                    let sellerName = cheapestPrice.vendor.name;
                    if (cheapestPrice.vendor.minTraderLevel) {
                        sellerName += ` ${t('LL{{level}}', { level: cheapestPrice.vendor.minTraderLevel })}`;
                    }
                    tradeData.savingsParts.push({
                        name: sellerName,
                        value: cheapestPrice.priceRUB,
                    });
                    tradeData.savings = cheapestPrice.priceRUB - Math.round(cost / howManyWeSell);
                }
                if (tradeData.savingsParts.length > 0) {
                    tradeData.savingsParts.push({
                        name: t('Barter cost'),
                        value: Math.round(cost / howManyWeSell) * -1
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
        items,
        meta,
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
