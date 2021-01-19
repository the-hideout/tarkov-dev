import {useMemo} from 'react';
import {Helmet} from 'react-helmet';

import Menu from '../../components/menu';
import DataTable from '../../components/data-table';
import items from '../../Items';
import formatPrice from '../../modules/format-price';

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
                Header: 'Armor Class',
                accessor: 'armorClass',
                Cell: centerCell,
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
        const match = item.name.match(/(.*)\s\(.+?$/);
        let itemName = item.name;

        if(match){
            itemName = match[1].trim();
        }

        return {
            name: itemName,
            armorClass: `${item.itemProperties.armorClass}/6`,
            blindness: `${(item.itemProperties.BlindnessProtection || 0) * 100}%`,
            image: item.imgLink,
            price: `${formatPrice(item.price)}`,
        };
    })
    .filter(Boolean)
    .sort((itemA, itemB) => {
        return itemB.blindness - itemA.blindness;
    }), [])

    return [<Helmet
        key = {'glasses-table'}
    >
        <meta
            charSet='utf-8'
        />
        <title>
            Escape from Tarkov Helmet chart
        </title>
        <meta
            name = 'description'
            content = 'All glasses in Escape from Tarkov sortable by price, armor class etc'
        />
    </Helmet>,
    <Menu
        key = {'main-navigation'}
    />,
    <div
        className="display-wrapper data-wrapper"
        key = {'display-wrapper'}
    >
        <DataTable
            columns={columns}
            data={data}
        />
    </div>];
};

export default Glasses;
