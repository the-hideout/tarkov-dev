import {useMemo, useEffect} from 'react';
import {Helmet} from 'react-helmet';
import { useSelector, useDispatch } from 'react-redux';

import DataTable from '../../../components/data-table';
import formatPrice from '../../../modules/format-price';
import ID from '../../../components/ID.jsx';
import { selectAllItems, fetchItems } from '../../../features/items/itemsSlice';

const centerCell = ({ value }) => {
    return <div
        className = 'center-content'
    >
        { value }
    </div>
};

function Glasses(props) {
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
        () => items.filter(item => item.types.includes('glasses')),
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
                            height = '64'
                            width = '64'
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
            stats: `${item.itemProperties.mousePenalty || 0}% / ${item.itemProperties.weaponErgonomicPenalty || 0}`,
            image: item.iconLink || 'https://tarkov-tools.com/images/unknown-item-icon.jpg',
            price: `${formatPrice(item.avg24hPrice)}`,
        };
    })
    .filter(Boolean), [displayItems])

    return [<Helmet
        key = {'glasses-table'}
    >
        <meta
            charSet='utf-8'
        />
        <title>
            Escape from Tarkov Helmet glasses chart
        </title>
        <meta
            name = 'description'
            content = 'All glasses in Escape from Tarkov sortable by price, armor class etc'
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
                Escape from Tarkov glasses chart
            </h1>
        </div>
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
