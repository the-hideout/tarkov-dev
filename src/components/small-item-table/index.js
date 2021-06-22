import {useMemo, useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Link,
} from "react-router-dom";

import DataTable from '../data-table';
import formatPrice from '../../modules/format-price';
import { selectAllItems, fetchItems } from '../../features/items/itemsSlice';

import './index.css';

function priceCell({ value }) {
    return <div
        className = 'center-content'
    >
        {formatPrice(value)}
    </div>;
};

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function SmallItemTable(props) {
    const {maxItems, nameFilter, defaultRandom} = props;
    const dispatch = useDispatch();
    const items = useSelector(selectAllItems);
    const itemStatus = useSelector((state) => {
        return state.items.status;
    });

    useEffect(() => {
        if (itemStatus === 'idle') {
          dispatch(fetchItems());
        }
      }, [itemStatus, dispatch]);

    const data = useMemo(() => {
        const returnData = items.map((itemData) => {
            return {
                id: itemData.id,
                name: itemData.name,
                shortName: itemData.shortName,
                normalizedName: itemData.normalizedName,
                avg24hPrice: itemData.avg24hPrice,
                lastLowPrice: itemData.lastLowPrice,
                iconLink: `https://assets.tarkov-tools.com/${itemData.id}-icon.jpg`,
                itemLink: `/item/${itemData.normalizedName}`,
            }
        })
        .filter(item => {
            if(!nameFilter){
                return true;
            }
            return item.name.toLowerCase().includes(nameFilter) || item.shortName.toLowerCase().includes(nameFilter);
        });

        if(defaultRandom){
            shuffleArray(returnData);
        }

        return returnData.slice(0, maxItems);
    },
        [nameFilter, maxItems, defaultRandom, items]
    );

    const columns = useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'name',
                Cell: (allData) => {
                    // allData.row.original.itemLink
                    return <div
                        className = 'small-item-table-name-wrapper'
                    >
                        <div
                            className = 'small-item-table-image-wrapper'
                        ><img
                            alt = ''
                            className = 'table-image'
                            loading = 'lazy'
                            src = { allData.row.original.iconLink }
                        /></div>
                        <div>
                            <Link
                                className = 'craft-reward-item-title'
                                to = {allData.row.original.itemLink}
                            >
                                {allData.row.original.name}
                            </Link>
                        </div>
                    </div>
                },
            },
            {
                Header: 'Cost ₽',
                accessor: d => Number(d.lastLowPrice),
                Cell: priceCell,
                id: 'cost',
            },
        ],
        []
    );

    if(data.length <= 0){
        return <div>
            None
        </div>;
    }

    return <DataTable
        className = 'small-data-table'
        columns = {columns}
        key = 'small-item-table'
        data = {data}
        // sortBy = {'profit'}
        // sortByDesc = {true}
        autoResetSortBy = {false}
    />
}

export default SmallItemTable;