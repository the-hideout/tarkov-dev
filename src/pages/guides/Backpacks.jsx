import {useMemo} from 'react';
import {Helmet} from 'react-helmet';

import CanvasGrid from '../../components/canvas-grid';
import DataTable from '../../components/data-table';
import items from '../../Items';
import formatPrice from '../../modules/format-price';
import ID from '../../components/ID.jsx';

let displayItems = [];

const NOTES = {
    '5e4abc6786f77406812bd572': 'Can only keep medical items',
};

const GRID_MAP = {
    '5c0e805e86f774683f3dd637': [ // Paratus
        {
            row: 0,
            col: 0,
            width: 5,
            height: 5,
        },
        {
            row: 5,
            col: 0,
            width: 1,
            height: 2,
        },
        {
            row: 5,
            col: 1,
            width: 3,
            height: 2,
        },
        {
            row: 5,
            col: 4,
            width: 1,
            height: 2,
        },
    ],
    '5f5e46b96bdad616ad46d613': [ // Eberlestock
        {
            row: 0,
            col: 0,
            width: 5,
            height: 4,
        },
        {
            row: 4,
            col: 0,
            width: 5,
            height: 2,
        },
        {
            row: 6,
            col: 0,
            width: 5,
            height: 2,
        },
    ],
    '5d5d940f86f7742797262046': [ // Mechanism
        {
            row: 0,
            col: 0,
            width: 4,
            height: 4,
        },
        {
            row: 4,
            col: 0,
            width: 2,
            height: 2,
        },
        {
            row: 4,
            col: 2,
            width: 2,
            height: 2,
        },
        {
            row: 6,
            col: 0,
            width: 2,
            height: 2,
        },
        {
            row: 6,
            col: 2,
            width: 2,
            height: 2,
        },
    ],
};

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
                Header: 'Grid',
                accessor: 'grid',
                Cell: ({value}) => {
                    let grid = [{
                        row: 0,
                        col: 0,
                        width: value.width,
                        height: value.height,
                    }];

                    if(GRID_MAP[value.id]){
                        grid = GRID_MAP[value.id];
                    }

                    return <div>
                        <CanvasGrid
                            height = {value.height}
                            grid = {grid}
                            width = {value.width}
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
                        {/* {JSON.stringify(fullItemData.grid.pockets, null, 4)} */}
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
            grid: {
                id: item.id,
                height: item.itemProperties.grid.totalSize / item.itemProperties.grid.pockets[0].width,
                width: item.itemProperties.grid.pockets[0].width,
                pockets: item.itemProperties.grid.pockets,
            },
            id: item.id,
            image: `https://assets.tarkov-tools.com/${item.id}-icon.jpg`,
            name: itemName,
            price: item.price,
            pricePerSlot: Math.floor(item.price / item.slots),
            ratio: (item.itemProperties.grid?.totalSize / item.slots).toFixed(2),
            size: item.itemProperties.grid?.totalSize,
            slots: item.slots,
            speedPenalty: `${item.itemProperties.speedPenaltyPercent || 0}%`,
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
