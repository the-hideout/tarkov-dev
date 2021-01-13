import {useMemo} from 'react';

import DataTable from '../components/data-table';
import items from '../Items';
import formatPrice from '../modules/format-price';

let displayItems = [];

for(const item of Object.values(items)){
    if(!item.types.includes('glasses')){
        continue;
    }

    displayItems.push(item);
}

const centerCell = ({ value }) => {
    return <div
        className = 'center-content'
    >
        { value }
    </div>
};

function Glasses() {
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
                Header: 'Name',
                accessor: 'name',
            },
            {
                Header: 'Blindness protection',
                accessor: 'blindness',
                Cell: centerCell,
            },
            {
                Header: 'Price',
                accessor: 'price',
                Cell: centerCell,
            },
        ],
        []
    )

    const data = useMemo(() => displayItems.map((item) => {
        console.log(item);
        return {
            name: item.name,
            blindness: item.itemProperties.BlindnessProtection,
            image: item.imgLink,
            price: `${formatPrice(item.price)}`,
        };
    })
    .filter(Boolean)
    .sort((itemA, itemB) => {
        return itemB.blindness - itemA.blindness;
    }), [])

    return <DataTable
        columns={columns}
        data={data}
    />
};

export default Glasses;
