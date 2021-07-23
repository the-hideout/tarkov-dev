import {useMemo, useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Link,
} from "react-router-dom";
import { useTranslation } from 'react-i18next';

import DataTable from '../../components/data-table';
import formatPrice from '../../modules/format-price';
// import { selectAllCrafts, fetchCrafts } from '../../features/crafts/craftsSlice';
import { selectAllBarters, fetchBarters } from '../../features/barters/bartersSlice';
import ValueCell from '../value-cell';
import CostItemsCell from '../cost-items-cell';

import './index.css';

const priceToUse = 'lastLowPrice';

function getAlternatePriceSource(item, barters) {
    for(const barter of barters){
        if(barter.rewardItems.length > 1){
            continue;
        }

        if(barter.requiredItems.length > 1){
            continue;
        }

        if(barter.rewardItems[0].count !== barter.requiredItems[0].count){
            continue;
        }

        if(barter.rewardItems[0].item.id !== item.id){
            continue;
        }

        return barter;
    }

    return false;
};

function BartersTable(props) {
    const { selectedTrader, nameFilter, levelFilter = 3, includeFlea = true, itemFilter} = props;
    const dispatch = useDispatch();
    const { t } = useTranslation();

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
                Cell: ({ value }) => {
                    return <div
                        className = 'barter-reward-wrapper'
                    >
                        <div
                            className = 'barter-reward-image-wrapper'
                        >
                            <img
                                alt = ''
                                className = 'table-image'
                                loading = 'lazy'
                                src = { value.iconLink }
                            />
                        </div>
                        <div
                            className = 'barter-reward-info-wrapper'
                        >
                            <div>
                                <Link
                                    className = 'barter-reward-item-title'
                                    to = {value.itemLink}

                                >
                                    {value.name}
                                </Link>
                            </div>
                            <div
                                className = 'trader-wrapper'
                            >
                                {value.trader}
                            </div>
                            <div
                                className = 'price-wrapper'
                            >
                                {formatPrice(value.value)} @ {value.sellTo}
                                {value.barterOnly && <span> ({t('Barter only')})</span>}
                            </div>
                        </div>
                    </div>
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

            if(level > levelFilter.value){
                return false;
		    }

            const tradeData = {
                costItems: barterRow.requiredItems.map(requiredItem => {
                        if(requiredItem === null){
                            // console.log(barterRow);

                            return false;
                        }

                        if(!requiredItem.item){
                            // console.log(requiredItem);

                            return false;
                        }
                        
                        let priceSource = 'flea';
                        let requiredItemPrice = requiredItem.item[priceToUse];

                        if(!requiredItemPrice){
                            requiredItemPrice = Math.max(...requiredItem.item.traderPrices.map(priceObject => priceObject.price));
                            priceSource = 'trader';
                        }

                        const alternatePriceSource = getAlternatePriceSource(requiredItem.item, barters);
                        let alternatePrice = 0;

                        if(alternatePriceSource){
                            alternatePrice = alternatePriceSource.requiredItems[0].item[priceToUse];
                        }

                        if(alternatePrice && alternatePrice < requiredItemPrice){
                            requiredItemPrice = alternatePrice;
                            priceSource = 'barter';
                        }

                        cost = cost + requiredItemPrice * requiredItem.count;

                        // if(cost === 0){
                        //     hasZeroCostItem = true;
                        // }

                        return {
                            count: requiredItem.count,
                            name: requiredItem.item.name,
                            price: requiredItemPrice,
                            priceSource: priceSource,
                            iconLink: requiredItem.item.iconLink,
                            wikiLink: requiredItem.item.wikiLink,
                            itemLink: `/item/${requiredItem.item.normalizedName}`,
                            alternatePrice: alternatePrice,
                            alternatePriceSource: alternatePriceSource,
                        };
                    })
                    .filter(Boolean),
                cost: cost,
                reward: {
                    sellTo: 'Flea market',
                    name: barterRow.rewardItems[0].item.name,
                    wikiLink: barterRow.rewardItems[0].item.wikiLink,
                    value: barterRow.rewardItems[0].item[priceToUse],
                    trader: barterRow.source,
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
        [nameFilter, levelFilter, selectedTrader, barters, includeFlea, itemFilter]
    );

    if(data.length <= 0){
        return <div>
            {t('None')}
        </div>;
    }

    return <DataTable
        columns={columns}
        key = 'barters-table'
        data={data}
    />;
};

export default BartersTable;