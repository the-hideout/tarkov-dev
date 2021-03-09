import {useMemo} from 'react';
import {Helmet} from 'react-helmet';

import DataTable from '../../components/data-table';
import items from '../../Items';
import formatPrice from '../../modules/format-price';
import ID from '../../components/ID.jsx';

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

function Glasses(props) {
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
                Header: ({ value }) => {
                    return <div
                        className = 'center-content'
                    >
                        Stats
                        <div>
                            Turn/Ergo
                        </div>
                    </div>
                },
                accessor: 'stats',
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
        const match = item.name.match(/(.*)\s\(\d.+?$/);
        let itemName = item.name;

        if(match){
            itemName = match[1].trim();
        }

        return {
            name: itemName,
            armorClass: `${item.itemProperties.armorClass}/6`,
            blindness: `${(item.itemProperties.BlindnessProtection || 0) * 100}%`,
            stats: `${item.itemProperties.mousePenalty || 0}% / ${item.itemProperties.weaponErgonomicPenalty || 0}`,
            image: `https://assets.tarkov-tools.com/${item.id}-grid-image.jpg`,
            price: `${formatPrice(item.price)}`,
        };
    })
    .filter(Boolean), [])

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
    <div
        className="display-wrapper data-wrapper"
        key = {'display-wrapper'}
    >
        <DataTable
            columns={columns}
            data={data}
        />
    </div>,
    <ID
        key = {'session-id'}
        sessionID = {props.sessionID}
    />
    ];
};

export default Glasses;
