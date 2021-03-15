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

const priceCell = ({ value }) => {
    return <div
        className = 'center-content'
    >
        { formatPrice(value) }
    </div>;
};

const NOTES = {
    '5e4abc6786f77406812bd572': 'Can only keep medical items',
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
                    const fullItemData = cellData.data.find(cellItem => cellItem.name === cellData.value);
                    return <div
                        className = 'center-content'
                    >
                        <a
                            href = {fullItemData.wikiLink}
                        >
                            {cellData.value}
                        </a>
                        {NOTES[fullItemData.id] ? <cite>{NOTES[fullItemData.id]}</cite> : ''}
                    </div>
                },
            },
            {
                Header: 'Grid slots',
                accessor: 'slots',
                Cell: centerCell,
            },
            {
                Header: 'Inner size',
                accessor: 'size',
                Cell: centerCell,
            },
            {
                Header: 'Speed penalty',
                accessor: 'speedPenalty',
                Cell: centerCell,
            },
            {
                Header: 'Slot ratio',
                accessor: 'ratio',
                Cell: centerCell,
            },
            {
                Header: 'Price',
                accessor: 'price',
                Cell: priceCell,
            },
            {
                Header: 'Price per slot',
                accessor: 'pricePerSlot',
                Cell: priceCell,
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
            id: item.id,
            name: itemName,
            size: item.itemProperties.grid?.totalSize,
            slots: item.slots,
            speedPenalty: `${item.itemProperties.speedPenaltyPercent || 0}%`,
            image: `https://assets.tarkov-tools.com/${item.id}-icon.jpg`,
            price: item.price,
            wikiLink: item.wikiLink,
            ratio: (item.itemProperties.grid?.totalSize / item.slots).toFixed(2),
            pricePerSlot: Math.floor(item.price / item.slots),
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
