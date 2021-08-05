import {useMemo, useEffect} from 'react';
import {Helmet} from 'react-helmet';
import { useSelector, useDispatch } from 'react-redux';

import CanvasGrid from '../../components/canvas-grid';
import DataTable from '../../components/data-table';
import ID from '../../components/ID.jsx';
import { selectAllItems, fetchItems } from '../../features/items/itemsSlice';
import ValueCell from '../../components/value-cell';

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

function Backpacks(props) {
    const dispatch = useDispatch();
    const items = useSelector(selectAllItems);
    const itemStatus = useSelector((state) => {
        return state.items.status;
    });

    useEffect(() => {
        let timer = false;
        if (itemStatus === 'idle') {
            dispatch(fetchItems());
        }

        if(!timer){
            timer = setInterval(() => {
                dispatch(fetchItems());
            }, 600000);
        }

        return () => {
            clearInterval(timer);
        }
    }, [itemStatus, dispatch]);

    const displayItems = useMemo(
        () => items.filter(item => item.types.includes('backpack')),
        [items]
    );

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
                Cell: ValueCell,
            },
            {
                Header: 'Price per slot',
                accessor: 'pricePerSlot',
                Cell: ValueCell,
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
    .filter(Boolean), [displayItems])

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
        className="display-wrapper"
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
