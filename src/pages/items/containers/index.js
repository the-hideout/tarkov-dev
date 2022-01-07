import {useMemo} from 'react';
import {Helmet} from 'react-helmet';

import ID from '../../../components/ID.jsx';
import ValueCell from '../../../components/value-cell';
import SmallItemTable from '../../../components/small-item-table';

const centerCell = ({ value }) => {
    return <div
        className = 'center-content'
    >
        { value }
    </div>;
};

function Containers(props) {
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
                            height = '64'
                            loading='lazy'
                            src = { value }
                            width = '64'
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

    return [<Helmet
        key = {'containers-table'}
    >
        <meta
            charSet='utf-8'
        />
        <title>
            Escape from Tarkov containers
        </title>
        <meta
            name = 'description'
            content = 'All containers in Escape from Tarkov sortable by price, slot-ratio, size etc'
        />
    </Helmet>,
    <div
        className="display-wrapper"
        key = {'display-wrapper'}
    >
        <div
            className='page-headline-wrapper'
        >
            <h1>
                Escape from Tarkov containers
            </h1>
        </div>
        <SmallItemTable
            typeFilter = 'container'
            fleaPrice
            gridSlots
            innerSize
            slotRatio
            pricePerSlot
            barterPrice
        />
    </div>,
    <ID
        key = {'session-id'}
        sessionID = {props.sessionID}
    />
    ];
};

export default Containers;
