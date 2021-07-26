import {useMemo, useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import duration from 'dayjs/plugin/duration';
import dayjs from 'dayjs';

import DataTable from '../data-table';
import fleaMarketFee from '../../modules/flea-market-fee';
import { selectAllCrafts, fetchCrafts } from '../../features/crafts/craftsSlice';
import { selectAllBarters, fetchBarters } from '../../features/barters/bartersSlice';
import ValueCell from '../value-cell';
import CostItemsCell from '../cost-items-cell';
import formatCostItems from '../../modules/format-cost-items';
import {selectAllStations} from '../../features/settings/settingsSlice';

import './index.css';
import RewardCell from '../reward-cell';

const priceToUse = 'lastLowPrice';

dayjs.extend(duration);

function getDurationDisplay(time) {
    let format = 'mm[m]';

    if(dayjs.duration(time).hours() > 0){
        format = `H[h] ${format}`;
    }

    if(dayjs.duration(time).days() > 0){
        format = `D[d] ${format}`;
    }

    return dayjs.duration(time).format(format);
};

function CraftTable(props) {
    const {selectedStation, freeFuel, nameFilter, itemFilter} = props;
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const includeFlea = useSelector((state) => state.settings.hasFlea);
    const stations = useSelector(selectAllStations);

    const crafts = useSelector(selectAllCrafts);
    const craftsStatus = useSelector((state) => {
        return state.crafts.status;
    });

    const barters = useSelector(selectAllBarters);
    const bartersStatus = useSelector((state) => {
        return state.barters.status;
    });

    useEffect(() => {
        if (craftsStatus === 'idle') {
          dispatch(fetchCrafts());
        }
    }, [craftsStatus, dispatch]);

    useEffect(() => {
        if (bartersStatus === 'idle') {
          dispatch(fetchBarters());
        }
    }, [bartersStatus, dispatch]);

    const data = useMemo(() => {
        let addedStations = [];

        return crafts.map((craftRow) => {
            let totalCost = 0;

            if(!craftRow.rewardItems[0]){
                console.log(craftRow);
                return false;
            }

            if(itemFilter){
                let matchesFilter = false;
                for(const requiredItem of craftRow.requiredItems){
                    if(requiredItem === null){
                        continue;
                    }

                    if(requiredItem.item.id === itemFilter){
                        matchesFilter = true;

                        break;
                    }
                }

                for(const rewardItem of craftRow.rewardItems){
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
                for(const requiredItem of craftRow.requiredItems){
                    if(requiredItem === null){
                        continue;
                    }

                    if(requiredItem.item.name.toLowerCase().replace(/\s/g, '').includes(findString)){
                        matchesFilter = true;

                        break;
                    }
                }

                for(const rewardItem of craftRow.rewardItems){
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
            let [station, level] = craftRow.source.split('level');

            level = parseInt(level);
            station = station.trim();

            if(!nameFilter && selectedStation && selectedStation !== 'top' && selectedStation !== station.toLowerCase().replace(/\s/g, '-')){
                return false;
            }

            if(level > stations[station.toLowerCase().replace(/\s/g, '-')]){
                return false;
            }

            const costItems = formatCostItems(craftRow.requiredItems, barters, freeFuel, includeFlea);

            costItems.map(costItem => totalCost = totalCost + costItem.price * costItem.count);

            const tradeData = {
                costItems: costItems,
                cost: totalCost,
                craftTime: craftRow.duration,
                reward: {
                    sellTo: 'Flea Market',
                    name: craftRow.rewardItems[0].item.name,
                    wikiLink: craftRow.rewardItems[0].item.wikiLink,
                    itemLink: `/item/${craftRow.rewardItems[0].item.normalizedName}`,
                    value: craftRow.rewardItems[0].item[priceToUse],
                    source: `${station} (level ${level})`,
                    iconLink: craftRow.rewardItems[0].item.iconLink,
                    count: craftRow.rewardItems[0].count,
                },
            };

            const bestTraderValue = Math.max(...craftRow.rewardItems[0].item.traderPrices.map(priceObject => priceObject.price));
            const bestTrade = craftRow.rewardItems[0].item.traderPrices.find(traderPrice => traderPrice.price === bestTraderValue);

            if((bestTrade && bestTrade.price > tradeData.reward.value) || (bestTrade && !includeFlea)){
                // console.log(barterRow.rewardItems[0].item.traderPrices);
                tradeData.reward.value = bestTrade.price;
                tradeData.reward.sellTo = bestTrade.trader.name;
            }

            tradeData.profit = (tradeData.reward.value * craftRow.rewardItems[0].count) - totalCost;
            if(tradeData.reward.sellTo === 'Flea Market'){
                tradeData.profit = tradeData.profit - fleaMarketFee(craftRow.rewardItems[0].item.basePrice, craftRow.rewardItems[0].item[priceToUse], craftRow.rewardItems[0].count);
            }

            if(tradeData.profit === Infinity){
                tradeData.profit = 0;
            }

            tradeData.profitPerHour = Math.floor(tradeData.profit / (craftRow.duration / 3600));

            tradeData.fleaThroughput = Math.floor(craftRow.rewardItems[0].item[priceToUse] * craftRow.rewardItems[0].count / (craftRow.duration / 3600));

            // If the reward has no value, it's not available for purchase
            if(tradeData.reward.value === 0){
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
            if(itemB.profit < itemA.profit){
                return -1;
            }

            if(itemB.profit > itemA.profit){
                return 1;
            }

            return 0;
        })
        .filter((craft) => {
            // This is done after profit sorting
            if(selectedStation !== 'top'){
                return true;
            }

            if(addedStations.includes(craft.reward.source)){
                return false;
            }

            addedStations.push(craft.reward.source);

            return true;
        });
    },
        [nameFilter, selectedStation, freeFuel, crafts, barters, includeFlea, itemFilter, stations]
    );

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
                accessor: d => Number(d.cost),
                Cell: ValueCell,
                id: 'cost',
            },
            ...( includeFlea ? [{
                Header: t('Flea throughput/h'),
                accessor: 'fleaThroughput',
                Cell: ValueCell,
                sortType: 'basic',
            }] : []),
            {
                Header: t('Estimated profit'),
                accessor: 'profit',
                Cell: (props) => {
                    return <ValueCell
                        value = {props.value}
                        highlightProfit
                    >
                        <div
                            className = 'duration-wrapper'
                        >
                            {getDurationDisplay(props.row.original.craftTime * 1000)}
                        </div>
                    </ValueCell>;
                },
                sortType: 'basic',
            },
            {
                Header: t('Estimated profit/h'),
                accessor: 'profitPerHour',
                Cell: ({value}) => {
                    return <ValueCell
                        value = {value}
                        highlightProfit
                    />;
                },
                sortType: 'basic',
            },
        ],
        [t, includeFlea]
    );

    if(data.length <= 0){
        return <div
            className = {'no-data-info'}
        >
            {t('No crafts available for selected filters')}
        </div>;
    }

    return <DataTable
        columns = {columns}
        key = 'crafts-table'
        data = {data}
        sortBy = {'profit'}
        sortByDesc = {true}
        autoResetSortBy = {false}
    />
}

export default CraftTable;