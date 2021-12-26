import {useMemo} from 'react';
// import { useSelector, useDispatch } from 'react-redux';
import {
    Link,
} from "react-router-dom";
import { useTranslation } from 'react-i18next';
import 'tippy.js/dist/tippy.css'; // optional
import Fuse from 'fuse.js';
import ArrowIcon from '../../components/data-table/Arrow.js';

import DataTable from '../data-table';
import ValueCell from '../value-cell';
import TraderPriceCell from '../trader-price-cell';
// import { selectAllItems, fetchItems } from '../../features/items/itemsSlice';

import './index.css';

const getCell = (type) => {
    if(type === 'image'){
        return imageCell;
    }

    if(type === 'price'){
        return ValueCell;
    }

    if(type === 'name'){
        return nameCell;
    }

    return defaultCell;
};

const defaultCell = ({value}) => {
    return <div
        className = 'center-content'
    >
        { value }
    </div>;
};

const nameCell = (props) => {
    return <div>
        <Link
            to = {`/item/${props.row.original.normalizedName}`}
        >
            {props.value}
        </Link>
    </div>;
};

const imageCell = ({value}) => {
    return <div
        className = 'center-content'
    >
        <img
            alt = ''
            className = 'table-image'
            src = { value }
        />
    </div>;
};

function ItemTable(props) {
    const {maxItems, nameFilter, items, columns, traderPrice} = props;
    // const dispatch = useDispatch();
    // const itemStatus = useSelector((state) => {
    //     return state.items.status;
    // });
    const {t} = useTranslation();

    // useEffect(() => {
    //     if (itemStatus === 'idle') {
    //       dispatch(fetchItems());
    //     }
    //   }, [itemStatus, dispatch]);

    const data = useMemo(() => {
        let returnData = items;

        if(nameFilter){
            const options = {
                includeScore: true,
                keys: ['name', 'shortName'],
                distance: 1000,
            };

            const fuse = new Fuse(returnData, options);
            const result = fuse.search(nameFilter);

            returnData = result.sort((a, b) => b.score - a.score).map(resultObject => resultObject.item);
        }

        return returnData;
    },
        [nameFilter, items]
    );

    let displayColumns = useMemo(
        () => {
            const displayColumns = columns.map(({title, key, type}) => {
                return {
                    Header: t(title),
                    accessor: key,
                    Cell: getCell(type),
                };
            });

            if(traderPrice){
                displayColumns.push({
                    Header: t('Trader buy'),
                    accessor: d => Number(d.instaProfit),
                    Cell: TraderPriceCell,
                    id: 'traderBuyCell',
                });
            }

            return displayColumns;
        },
        [t, columns, traderPrice]
    );

    displayColumns = [
        {
            id: 'expander',
            Header: ({ getToggleAllRowsExpandedProps, isAllRowsExpanded }) => (
                // <span {...getToggleAllRowsExpandedProps()}>
                //     {isAllRowsExpanded ? 'v' : '>'}
                // </span>
                null
            ),
            Cell: ({ row }) =>
                // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
                // to build the toggle for expanding a row
                row.canExpand ? (
                    <span
                        {...row.getToggleRowExpandedProps({
                            style: {
                                // We can even use the row.depth property
                                // and paddingLeft to indicate the depth
                                // of the row
                                // paddingLeft: `${row.depth * 2}rem`,
                            },
                        })}
                    >
                        {row.isExpanded ? <ArrowIcon/> : <ArrowIcon className = {'arrow-right'} />}
                    </span>
                ) : null,
        },
        ...displayColumns,
    ];

    return <DataTable
        className = 'data-table'
        columns = {displayColumns}
        key = 'item-table'
        data = {data}
        autoResetSortBy = {false}
        maxItems = {maxItems}
    />;
}

export default ItemTable;