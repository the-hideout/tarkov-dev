import {useMemo, useEffect, useState} from 'react';
import {Helmet} from 'react-helmet';
import { useSelector, useDispatch } from 'react-redux';

import CanvasGrid from '../../components/canvas-grid';
import DataTable from '../../components/data-table';
import ID from '../../components/ID.jsx';
import { selectAllItems, fetchItems } from '../../features/items/itemsSlice';
import ValueCell from '../../components/value-cell';
import {Filter, ToggleFilter, SliderFilter} from '../../components/filter';
import CenterCell from '../../components/center-cell';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage';

const marks = {
    0: 25,
    5: 20,
    10: 15,
    15: 10,
    20: 5,
    25: 0,
};

function Backpacks(props) {
    const dispatch = useDispatch();
    const items = useSelector(selectAllItems);
    const itemStatus = useSelector((state) => {
        return state.items.status;
    });
    const [includeArmoredRigs, setIncludeArmoredRigs] = useStateWithLocalStorage('includeArmoredRigs', true);
    const [minSlots, setMinSlots] = useStateWithLocalStorage('minSlots', 1);
    const [has3Slot, setHas3Slot] = useState(false);
    const [has4Slot, setHas4Slot] = useState(false);

    useEffect(() => {
        if (itemStatus === 'idle') {
          dispatch(fetchItems());
        }
    }, [itemStatus, dispatch]);


    const displayItems = useMemo(
        () => items.filter(item => item.types.includes('rig')),
        [items]
    );

    let maxSlots = Math.max(...displayItems.map(displayItem => displayItem.itemProperties.grid?.totalSize || 0));
    if(maxSlots === Infinity){
        maxSlots = 1;
    }

    const handleMinSlotsChange = (newValueLabel) => {
        setMinSlots(maxSlots - newValueLabel);
    };

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
                Cell: CenterCell,
            },
            {
                Header: 'Inner size',
                accessor: 'size',
                Cell: CenterCell,
            },
            {
                Header: 'Weight',
                accessor: 'weight',
                Cell: ({value}) => {
                    return <CenterCell
                        value = {value}
                        nowrap
                    />;
                },
            },
            {
                Header: 'Slot ratio',
                accessor: 'ratio',
                Cell: CenterCell,
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

        if(!includeArmoredRigs && item.types.includes('armor')){
            return false;
        }

        if(item.itemProperties.grid?.totalSize < minSlots){
            return false;
        }

        if(has3Slot){
            const isValid = item.grid?.pockets?.find((pocket) => {
                return pocket.width === 1 && pocket.height === 3;
            });

            if(!isValid){
                return false;
            }
        }

        if(has4Slot){
            const isValid = item.grid?.pockets?.find((pocket) => {
                return pocket.width === 2 && pocket.height === 2;
            });

            if(!isValid){
                return false;
            }
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
    .filter(Boolean), [displayItems, includeArmoredRigs, minSlots, has3Slot, has4Slot])

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
                Escape from Tarkov rigs table
            </h1>
        </div>
        <Filter
            center
        >
            <ToggleFilter
                label = 'Armored rigs?'
                onChange = {e => setIncludeArmoredRigs(!includeArmoredRigs)}
                checked = {includeArmoredRigs}
            />
            <SliderFilter
                defaultValue = {25 - minSlots}
                label = 'Min. slots'
                min = {0}
                max = {25}
                marks = {marks}
                reverse
                onChange = {handleMinSlotsChange}
            />
            <ToggleFilter
                label = '3-slot'
                onChange = {e => setHas3Slot(!has3Slot)}
                checked = {has3Slot}
            />
            <ToggleFilter
                label = '4-slot'
                onChange = {e => setHas4Slot(!has4Slot)}
                checked = {has4Slot}
            />
        </Filter>
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
