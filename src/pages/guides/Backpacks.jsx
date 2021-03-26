import {useMemo} from 'react';
import {Helmet} from 'react-helmet';

import CanvasGrid from '../../components/canvas-grid';
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

const centerNowrapCell = ({ value }) => {
    return <div
        className = 'center-content nowrap-content'
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
                    return <div>
                        <CanvasGrid
                            height = {value.height}
                            grid = {value.pockets}
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
                            href = {fullItemData.itemLink}
                        >
                            {cellData.value}
                        </a>
                        {fullItemData.notes ? <cite>{fullItemData.notes}</cite> : ''}
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
                Header: 'Weight',
                accessor: 'weight',
                Cell: centerNowrapCell,
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
            grid: item.grid,
            id: item.id,
            image: `https://assets.tarkov-tools.com/${item.id}-icon.jpg`,
            name: itemName,
            price: item.avg24hPrice,
            pricePerSlot: Math.floor(item.avg24hPrice / item.slots),
            ratio: (item.itemProperties.grid?.totalSize / item.slots).toFixed(2),
            size: item.itemProperties.grid?.totalSize,
            slots: item.slots,
            weight: `${item.itemProperties.Weight} kg`,
            wikiLink: item.wikiLink,
            itemLink: `/item/${item.normalizedName}`,
            notes: item.notes,
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
