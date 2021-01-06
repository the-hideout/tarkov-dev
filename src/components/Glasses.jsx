import {useMemo} from 'react';

import DataTable from './data-table';
import items from '../Items';

let displayItems = [];

for(const item of Object.values(items)){
    if(!item.types.includes('glasses')){
        continue;
    }

    console.log(item);

    displayItems.push(item);
}

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
                Cell: ({ value }) => {
                    return <div
                        className = 'center-content'
                    >
                        { value }
                    </div>
                },
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
