import {useMemo, useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Link,
} from "react-router-dom";
import Tippy from '@tippyjs/react';
import {followCursor} from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional

import DataTable from '../data-table';
import formatPrice from '../../modules/format-price';
import fleaMarketFee from '../../modules/flea-market-fee';
import { selectAllCrafts, fetchCrafts } from '../../features/crafts/craftsSlice';
import { selectAllBarters, fetchBarters } from '../../features/barters/bartersSlice';

import './index.css';

const fuelIds = [
    '5d1b371186f774253763a656', // Expeditionary fuel tank
    '5d1b36a186f7742523398433', // Metal fuel tank
];

function priceCell({ value }) {
    return <div
        className = 'center-content'
    >
        {formatPrice(value)}
    </div>;
};

function profitCell({ value }) {
    return <div
        className = {`center-content ${value > 0 ? 'craft-profit' : 'craft-loss'}`}
    >
        {formatPrice(value)}
    </div>;
};

function getItemCost(costItem) {
    if(costItem.alternatePrice > 0){
        return <Tippy
            placement = 'bottom'
            followCursor = {'horizontal'}
            // showOnCreate = {true}
            content={
                <div
                    className = 'barter-cost-with-barter-wrapper'
                >
                    <img
                        alt = 'Icon'
                        src = {`https://assets.tarkov-tools.com/${costItem.alternatePriceSource.requiredItems[0].item.id}-icon.jpg`}
                    />
                    <div
                        className = 'barter-cost-barter-details-wrapper'
                    >
                        <div>
                            {costItem.alternatePriceSource.requiredItems[0].item.name}
                        </div>
                        <div>
                            {formatPrice(costItem.alternatePriceSource.requiredItems[0].item.avg24hPrice)}
                        </div>
                        <div>
                            {costItem.alternatePriceSource.source}
                        </div>
                    </div>
                </div>
            }
            plugins={[followCursor]}
        >
            <div>
                <span className = 'craft-cost-item-count-wrapper'>
                    {costItem.count}
                </span> X <img
                    alt = 'Barter'
                    className = 'barter-icon'
                    src = {`${ process.env.PUBLIC_URL }/images/icon-barter.png`}
                />{formatPrice(costItem.price)} = {formatPrice(costItem.count * (costItem.alternatePrice || costItem.price))}
            </div>
        </Tippy>
    }

    return <div>
        <span className = 'craft-cost-item-count-wrapper'>{costItem.count} </span> X {formatPrice(costItem.price)} = {formatPrice(costItem.count * (costItem.alternatePrice || costItem.price))}
    </div>;
}

function costItemsCell({ value }) {
    return <div
        className = 'cost-wrapper'
    >
        {value.map((costItem, itemIndex) => {
            return <div
                key = {`cost-item-${itemIndex}`}
                className = 'craft-cost-item-wrapper'
            >
                <div
                    className = 'craft-cost-image-wrapper'
                ><img
                        alt = {costItem.name}
                        loading = 'lazy'
                        src = {costItem.iconLink}
                    /></div>
                <div
                    className = 'craft-cost-item-text-wrapper'
                >
                    <Link
                        to = {costItem.itemLink}
                    >
                        {costItem.name}
                    </Link>
                    <div
                        className = 'price-wrapper'
                    >
                        {getItemCost(costItem)}
                    </div>
                </div>
            </div>
        })}
    </div>;
};

function getAlternatePriceSource(item, barters) {
    let alternatePrice = false;

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

        alternatePrice = barter;
    }

    return alternatePrice;
};

function CraftTable(props) {
    const {selectedStation, freeFuel, nameFilter, levelFilter = 3} = props;
    const dispatch = useDispatch();

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

            if(nameFilter.length > 0){
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

            if(level > levelFilter.value){
                return false;
            }

            const tradeData = {
                costItems: craftRow.requiredItems.map(requiredItem => {
                    let calculationPrice = requiredItem.item.avg24hPrice;
                    // if(requiredItem.item.avg24hPrice * requiredItem.count === 0){
                    //     console.log(`Found a zero cost item! ${requiredItem.item.name}`);

                    //     hasZeroCostItem = true;
                    // }

                    const alternatePriceSource = getAlternatePriceSource(requiredItem.item, barters);
                    let alternatePrice = 0;

                    if(alternatePriceSource){
                        alternatePrice = alternatePriceSource.requiredItems[0].item.avg24hPrice;
                        calculationPrice = alternatePrice;
                    }

                    if(freeFuel && fuelIds.includes(requiredItem.item.id)){
                        calculationPrice = 0;
                    }

                    totalCost = totalCost + calculationPrice * requiredItem.count;

                    return {
                        count: requiredItem.count,
                        name: requiredItem.item.name,
                        price: calculationPrice,
                        iconLink: requiredItem.item.iconLink,
                        wikiLink: requiredItem.item.wikiLink,
                        itemLink: `/item/${requiredItem.item.normalizedName}`,
                        alternatePrice: alternatePrice,
                        alternatePriceSource: alternatePriceSource,
                    };
                })
                    .filter(Boolean),
                cost: totalCost,
                reward: {
                    name: craftRow.rewardItems[0].item.name,
                    wikiLink: craftRow.rewardItems[0].item.wikiLink,
                    itemLink: `/item/${craftRow.rewardItems[0].item.normalizedName}`,
                    value: Math.max(craftRow.rewardItems[0].item.avg24hPrice, Math.max(...craftRow.rewardItems[0].item.traderPrices.map(priceObject => priceObject.price))),
                    source: `${station} (level ${level})`,
                    iconLink: craftRow.rewardItems[0].item.iconLink,
                    count: craftRow.rewardItems[0].count,
                },
            };

            tradeData.profit = Math.floor((craftRow.rewardItems[0].item.avg24hPrice * craftRow.rewardItems[0].count) - totalCost -  fleaMarketFee(craftRow.rewardItems[0].item.basePrice, craftRow.rewardItems[0].item.avg24hPrice, craftRow.rewardItems[0].count));
            tradeData.profitPerHour = Math.floor(tradeData.profit / (craftRow.duration / 3600));

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
        [nameFilter, levelFilter, selectedStation, freeFuel, crafts, barters]
    );

    const columns = useMemo(
        () => [
            {
                Header: 'Reward',
                accessor: 'reward',
                Cell: ({ value }) => {
                    return <div
                        className = 'craft-reward-wrapper'
                    >
                        <div
                            className = 'craft-reward-image-wrapper'
                        ><span
                            className = 'craft-reward-count-wrapper'
                        >
                            {value.count}
                        </span><img
                                alt = ''
                                className = 'table-image'
                                loading = 'lazy'
                                src = { value.iconLink }
                            /></div>
                        <div
                            className = 'craft-reward-info-wrapper'
                        >
                            <div>
                                <Link
                                    className = 'craft-reward-item-title'
                                    to = {value.itemLink}

                                >
                                    {value.name}
                                </Link>
                            </div>
                            <div
                                className = 'source-wrapper'
                            >
                                {value.source}
                            </div>
                            <div
                                className = 'price-wrapper'
                            >
                                {formatPrice(value.value)}
                            </div>
                        </div>
                    </div>
                },
            },
            {
                Header: 'Cost',
                accessor: 'costItems',
                Cell: costItemsCell,
            },
            {
                Header: 'Cost ₽',
                accessor: d => Number(d.cost),
                Cell: priceCell,
                id: 'cost',
            },
            {
                Header: 'Estimated profit',
                accessor: 'profit',
                Cell: profitCell,
                sortType: 'basic',
            },
            {
                Header: 'Estimated profit per hour',
                accessor: 'profitPerHour',
                Cell: profitCell,
                sortType: 'basic',
            },
        ],
        []
    );

    if(data.length <= 0){
        return <div
            className = {'no-data-info'}
        >
            No crafts available for selected filters
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