import {useMemo, useState} from 'react';

import DataTable from '../../components/data-table';
import formatPrice from '../../modules/format-price';

import rawData from '../../data/barters.json';

import './index.css';

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
                <div
                    className = 'barter-cost-item-count-wrapper'
                >
                    {costItem.count}
                </div>
                <div
                    className = 'barter-cost-image-wrapper'
                >
                    <img
                        alt = {costItem.name}
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
                        {formatPrice(costItem.price)}
                    </div>
                </div>
            </div>
        })}
    </div>;
};

function Barters() {
    const [nameFilter, setNameFilter] = useState('');
    const columns = useMemo(
        () => [
            {
                accessor: 'image',
                Cell: ({ value }) => {
                    return <div
                        className = 'center-content'
                    >
                        <img
                            alt = ''
                            className = 'table-image'
                            src = { value }
                        />
                    </div>
                },
            },
            {
                Header: 'Reward',
                accessor: 'reward',
                Cell: ({ value }) => {
                    return <div
                        className = 'center-content'
                    >
                        <a href={value.wikiLink}>
                            {value.name}
                        </a>
                        <div
                            className = 'price-wrapper'
                        >
                            {formatPrice(value.value)}
                        </div>
                    </div>
                },
            },
            {
                Header: 'Trader',
                accessor: 'trader',
            },
            {
                Header: 'Cost',
                accessor: 'costItems',
                Cell: costItemsCell,
            },
            {
                Header: 'Cost',
                accessor: 'cost',
                Cell: priceCell,
            },
            {
                Header: 'Estimated savings',
                accessor: 'savings',
                Cell: priceCell,
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
            trader: barterRow.source,
            image: barterRow.rewardItems[0].item.iconLink,
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
            },
            savings: barterRow.rewardItems[0].item.avg24hPrice - cost,
        };

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

    return [
        <div
            className = 'data-table-filters-wrapper'
        >
            <input
                defaultValue = {nameFilter || ''}
                type = {'text'}
                placeholder = {'filter on item'}
                onChange = {e => setNameFilter(e.target.value)}
            />
        </div>,
        <DataTable
            columns={columns}
            data={data}
        />
    ];
};

export default Barters;
