import {useMemo, useEffect, useRef} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    Link,
} from "react-router-dom";

import DataTable from '../../components/data-table';
// import { selectAllCrafts, fetchCrafts } from '../../features/crafts/craftsSlice';
import { selectAllBarters, fetchBarters } from '../../features/barters/bartersSlice';
import {selectAllTraders} from '../../features/settings/settingsSlice';
import ValueCell from '../value-cell';
import CostItemsCell from '../cost-items-cell';
import formatCostItems from '../../modules/format-cost-items';
import RewardCell from '../reward-cell';
import capitalizeFirst from '../../modules/capitalize-first';

import './index.css';

const priceToUse = 'lastLowPrice';

function BartersTable(props) {
    const { selectedTrader, nameFilter, itemFilter} = props;
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const includeFlea = useSelector((state) => state.settings.hasFlea);
    const traders = useSelector(selectAllTraders);
    const skippedByLevelRef = useRef();

    const barters = useSelector(selectAllBarters);
    const bartersStatus = useSelector((state) => {
        return state.barters.status;
    });

    useEffect(() => {
        if (bartersStatus === 'idle') {
          dispatch(fetchBarters());
        }
    }, [bartersStatus, dispatch]);

    const columns = useMemo(
        () => [
            {
                Header: t('Reward'),
                accessor: 'reward',
                Cell: ({value}) => {
                    return <RewardCell
                        {...value}
                    />;
                },
            },
            {
                Header: t('Cost'),
                accessor: 'costItems',
                Cell: ({value}) => {
                    return <CostItemsCell
                        costItems = {value}
                    />;
                },
            },
            {
                Header: t('Cost ₽'),
                accessor: 'cost',
                Cell: ValueCell,
            },
            {
                Header: t('Estimated savings'),
                accessor: d=>Number(d.savings),
                Cell: ({value}) => {
                    return <ValueCell
                        value = {value}
                        highlightProfit
                    />;
                },
                sortType: (a, b) => {
                    if(a.value > b.value){
                        return 1;
                    }

                    if(a.value < b.value){
                        return -1;
                    }

                    return 0;
                },
            },
            {
                Header: t('instaProfit'),
                accessor: 'instaProfit',
                Cell: (props) => {
                    return <ValueCell
                        value = {props.value}
                        highlightProfit
                    >
                        <div
                            className = 'duration-wrapper'
                        >
                            {capitalizeFirst(props.row.original.instaProfitSource.source)}
                        </div>
                    </ValueCell>;
                },
                sortType: 'basic',
            },
        ],
        [t]
    );

    const data = useMemo(() => {
        let addedTraders = [];

        return barters.map((barterRow) => {
            let cost = 0;

            if(!barterRow.rewardItems[0]){
                console.log(barterRow);
                return false;
            }

            if(itemFilter){
                let matchesFilter = false;
                for(const requiredItem of barterRow.requiredItems){
                    if(requiredItem === null){
                        continue;
                    }

                    if(requiredItem.item.id === itemFilter){
                        matchesFilter = true;

                        break;
                    }
                }

                for(const rewardItem of barterRow.rewardItems){
                    if(rewardItem.item.id === itemFilter){
                        matchesFilter = true;

                        break;
                    }
                }

                if(!matchesFilter){
                    return false;
                }
            }

            if(nameFilter?.length > 0){
                let matchesFilter = false;
                const findString = nameFilter.toLowerCase().replace(/\s/g, '');
                for(const requiredItem of barterRow.requiredItems){
                    if(requiredItem === null){
                        continue;
                    }

                    if(requiredItem.item.name.toLowerCase().replace(/\s/g, '').includes(findString)){
                        matchesFilter = true;

                        break;
                    }
                }

                for(const rewardItem of barterRow.rewardItems){
                    if(rewardItem.item.name.toLowerCase().replace(/\s/g, '').includes(findString)){
                        matchesFilter = true;

                        break;
                    }
                }

                if(!matchesFilter){
                    return false;
                }
            }

            // let hasZeroCostItem = false;
            let [trader, level] = barterRow.source.split('LL');

            level = parseInt(level);
            trader = trader.trim();

            if(!nameFilter && selectedTrader && selectedTrader !== 'all' && selectedTrader !== trader.toLowerCase().replace(/\s/g, '-')){
                return false;
            }

            if(level > traders[trader.toLowerCase()]){
                skippedByLevelRef.current = true;
                return false;
		    }

            const costItems = formatCostItems(barterRow.requiredItems, barters, false, includeFlea);
            costItems.map(costItem => cost = cost + costItem.price * costItem.count);

            const bestSellTo = barterRow.rewardItems[0].item.sellFor.reduce((previousSellForObject, sellForObject) => {
                if(sellForObject.source === 'fleaMarket'){
                    return previousSellForObject;
                }

                if(previousSellForObject.price > sellForObject.price){
                    return previousSellForObject;
                }

                return sellForObject;
            }, {
                source: 'unknown',
                price: 0,
            });

            const tradeData = {
                costItems: costItems,
                cost: cost,
                instaProfit: bestSellTo.price - cost,
                instaProfitSource: bestSellTo,
                reward: {
                    sellTo: 'Flea market',
                    name: barterRow.rewardItems[0].item.name,
                    value: barterRow.rewardItems[0].item[priceToUse],
                    source: barterRow.source,
                    iconLink: barterRow.rewardItems[0].item.iconLink,
                    itemLink: `/item/${barterRow.rewardItems[0].item.normalizedName}`,
                },
            };

            const bestTraderValue = Math.max(...barterRow.rewardItems[0].item.traderPrices.map(priceObject => priceObject.price));
            const bestTrade = barterRow.rewardItems[0].item.traderPrices.find(traderPrice => traderPrice.price === bestTraderValue);

            if((bestTrade && bestTrade.price > tradeData.reward.value) || (bestTrade && !includeFlea)){
                // console.log(barterRow.rewardItems[0].item.traderPrices);
                tradeData.reward.value = bestTrade.price;
                tradeData.reward.sellTo = bestTrade.trader.name;
            }

            tradeData.savings = tradeData.reward.value - cost;

            // If the reward has no value, it's not available for purchase
            if(tradeData.reward.value === 0){
                tradeData.reward.value = tradeData.cost;
                tradeData.reward.barterOnly = true;
                tradeData.savings = 0;
            }

            // if(hasZeroCostItem){
            //     return false;
            // }

            return tradeData;
        })
        .filter(Boolean)
        .sort((itemA, itemB) => {
            if(itemB.savings > itemA.savings){
                return -1;
            };

            if(itemB.savings < itemA.savings){
                return 1;
            }

            return 0;
        })
        .filter((barter) => {

            if(selectedTrader !== 'all'){
                return true;
		    }

            if(selectedTrader === 'all'){
                return true;
			}

            if(addedTraders.includes(barter.reward.source)){
                return false;
		    }

            addedTraders.push(barter.reward.source);

            return true;
	    });
    },
        [nameFilter, selectedTrader, barters, includeFlea, itemFilter, traders]
    );

    let extraRow = false;

    if(data.length <= 0){
        extraRow = t('No barters available for selected filters');
    }

    if(data.length <= 0 && skippedByLevelRef.current){
        extraRow = <div>
            {t('No barters available for selected filters but some were hidden by ')}
            <Link
                to = '/settings/'
            >
                {t('your settings')}
            </Link>
        </div>;
    }

    if(data.length > 0 && skippedByLevelRef.current){
        extraRow = <div>
            {t('Some barters hidden by ')}
            <Link
                to = '/settings/'
            >
                {t('your settings')}
            </Link>
        </div>;
    }

    return <DataTable
        columns={columns}
        extraRow = {extraRow}
        key = 'barters-table'
        data={data}
    />;
};

export default BartersTable;