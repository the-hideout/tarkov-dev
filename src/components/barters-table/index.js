import {useMemo} from 'react';

import DataTable from '../../components/data-table';
import formatPrice from '../../modules/format-price';

import rawData from '../../data/barters.json';

function priceCell({ value }) {
    return <div
        className = 'center-content'
    >
        {formatPrice(value)}
    </div>;
};

function costItemsCell({ value }) {
    return <div
        className = 'cost-wrapper'
    >
        {value.map((costItem, itemIndex) => {
            return <div
                key = {`cost-item-${itemIndex}`}
                className = 'barter-cost-item-wrapper'
            >
                {/* <div
                    className = 'barter-cost-item-count-wrapper'
                >
                    {costItem.count}
                </div> */}
                <div
                    className = 'barter-cost-image-wrapper'
                >
                    <img
                        alt = {costItem.name}
                        loading = 'lazy'
                        src = {costItem.iconLink}
                    />
                </div>
                <div
                    className = 'barter-cost-item-text-wrapper'
                >
                    <a
                        href = {costItem.wikiLink}
                    >
                        {costItem.name}
                    </a>
                    <div
                        className = 'price-wrapper'
                    >
                        <span className = 'barter-cost-item-count-wrapper'>{costItem.count}</span> X {formatPrice(costItem.price)} = {formatPrice(costItem.count * costItem.price)}
                        {/* {formatPrice(costItem.price)} */}
                    </div>
                </div>
            </div>
        })}
    </div>;
};

function BartersTable(props) {
    const {nameFilter} = props;
    const columns = useMemo(
        () => [
            {
                Header: 'Reward',
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
                                <a
                                    className = 'barter-reward-item-title'
                                    href={value.wikiLink}

                                >
                                    {value.name}
                                </a>
                            </div>
                            <div
                                className = 'trader-wrapper'
                            >
                                {value.trader}
                            </div>
                            <div
                                className = 'price-wrapper'
                            >
                                {formatPrice(value.value)}
                                {value.barterOnly && <span> (Barter only)</span>}
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
                accessor: 'cost',
                Cell: priceCell,
            },
            {
                Header: 'Estimated savings',
                accessor: d=>Number(d.savings),
                Cell: priceCell,
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
        []
    )

    const data = useMemo(() => rawData.map((barterRow) => {
        let cost = 0;

        if(!barterRow.rewardItems[0]){
            console.log(barterRow);
            return false;
        }

        if(nameFilter.length > 0){
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

        let hasZeroCostItem = false;

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

                    cost = cost + requiredItem.item.avg24hPrice * requiredItem.count;

                    if(cost === 0){
                        hasZeroCostItem = true;
                    }

                    return {
                        count: requiredItem.count,
                        name: requiredItem.item.name,
                        price: requiredItem.item.avg24hPrice,
                        iconLink: requiredItem.item.iconLink,
                        wikiLink: requiredItem.item.wikiLink,
                    };
                })
                .filter(Boolean),
            cost: cost,
            reward: {
                name: barterRow.rewardItems[0].item.name,
                wikiLink: barterRow.rewardItems[0].item.wikiLink,
                value: barterRow.rewardItems[0].item.avg24hPrice,
                trader: barterRow.source,
                iconLink: barterRow.rewardItems[0].item.iconLink,
            },
            savings: barterRow.rewardItems[0].item.avg24hPrice - cost,
        };

        // If the reward has no value, it's not available for purchase
        if(tradeData.reward.value === 0){
            tradeData.reward.value = tradeData.cost;
            tradeData.reward.barterOnly = true;
            tradeData.savings = 0;
        }

        if(hasZeroCostItem){
            return false;
        }

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
    }), [nameFilter])

    return <DataTable
        columns={columns}
        key = 'barters-table'
        data={data}
    />;
};

export default BartersTable;
