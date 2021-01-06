import {useMemo} from 'react';

import BarterTable from './barter-table';
import items from '../../Items';

import rawData from '../../data/barters.json';

const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumSignificantDigits: 6,
    }).format(price);
};

function priceCell({ value }) {
    return <span>{formatPrice(value)}</span>;
};

function createMarkup(htmlString) {
    return {
        __html: htmlString,
    };
};

function costCell({ value }) {
    return <span
        className = 'cost-wrapper'
        dangerouslySetInnerHTML={createMarkup(value)}
    />;
};

function Barters() {
    const columns = useMemo(
        () => [
            {
                Header: 'Trader',
                accessor: 'trader',
            },
            {
                Header: 'Cost',
                accessor: 'cost',
                Cell: costCell,
            },
            {
                Header: 'Reward',
                accessor: 'reward',
            },
            {
                Header: 'Estimated savings',
                accessor: 'savings',
                Cell: priceCell,
            },
        ],
        []
    )

    const data = useMemo(() => rawData.data.map((barterRow) => {
        let cost = 0;
        const rewardItem = items[barterRow.rewardItems[0].id];

        if(!rewardItem){
            console.log(`Found no item "${rewardItem.name}"`);

            return false;
        }

        const tradeData = {
            trader: barterRow.trader,
            cost: barterRow.requiredItems.map(item => {
                    cost = cost + items[item.id].price * item.count;

                    return `<div>${item.count} ${item.name} ${formatPrice(items[item.id].price * item.count)}</div>`;
                })
                .filter(Boolean)
                .join('\n'),
            reward: `${rewardItem.name} ${formatPrice(Math.min(items[rewardItem.id].price, items[rewardItem.id].traderPrice))}`,
            savings: Math.min(items[rewardItem.id].price, items[rewardItem.id].traderPrice) - cost,
        };

        return tradeData;
    }).filter(Boolean).sort((itemA, itemB) => {
        return itemB.savings - itemA.savings;
    }), [])

    return <BarterTable
        columns={columns}
        data={data}
    />
};

export default Barters;
