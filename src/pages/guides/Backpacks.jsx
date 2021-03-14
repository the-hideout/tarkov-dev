import {useMemo} from 'react';
import {Helmet} from 'react-helmet';

import DataTable from '../../components/data-table';
import items from '../../Items';
import formatPrice from '../../modules/format-price';
import ID from '../../components/ID.jsx';

let displayItems = [];

for(const item of Object.values(items)){
    if(!item.types.includes('backpack')){
        continue;
    }

    displayItems.push(item);
}

const centerCell = ({ value }) => {
    return <div
        className = 'center-content'
    >
        { value }
    </div>;
};

function Backpacks(props) {
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
                Cell: (cellData) => {
                    return <div
                        className = 'center-content'
                    >
                        <a
                            href = {cellData.data.find(cellItem => cellItem.name === cellData.value).wikiLink}
                        >
                            {cellData.value}
                        </a>
                    </div>
                },
            },
            {
                Header: 'Slots',
                accessor: 'slots',
                Cell: centerCell,
            },
            {
                Header: 'Speed penalty',
                accessor: 'speedPenalty',
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
            slots: item.slots,
            speedPenalty: `${item.itemProperties.speedPenaltyPercent || 0}%`,
            image: `https://assets.tarkov-tools.com/${item.id}-grid-image.jpg`,
            price: `${formatPrice(item.price)}`,
            wikiLink: item.wikiLink,
        };
    })
    .filter(Boolean), [])

    return [<Helmet
        key = {'backpacks-table'}
    >
        <meta
            charSet='utf-8'
        />
        <title>
            Escape from Tarkov Helmet backpacks chart
        </title>
        <meta
            name = 'description'
            content = 'All backpacks in Escape from Tarkov sortable by price, size etc'
        />
    </Helmet>,
    <div
        className="display-wrapper data-wrapper"
        key = {'display-wrapper'}
    >
        <div
            className = 'data-table-filters-wrapper'
        >
            <h1>
                Escape from Tarkov backpacks chart
            </h1>
        </div>
        <DataTable
            columns={columns}
            data={data}
            sortBy = {'slots'}
            sortByDesc = {true}
            autoResetSortBy = {false}
        />
    </div>,
    <ID
        key = {'session-id'}
        sessionID = {props.sessionID}
    />
    ];
};

export default Backpacks;
