import {useMemo} from 'react';

import DataTable from '../data-table';
import formatPrice from '../../modules/format-price';

import Items from '../../Items';

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
    const data = useMemo(() => {
        const returnData = Object.values(Items).map((itemData) => {
            return {
                id: itemData.id,
                name: itemData.name,
                shortName: itemData.shortName,
                normalizedName: itemData.normalizedName,
                avg24hPrice: itemData.avg24hPrice,
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
        [nameFilter, maxItems, defaultRandom]
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
                            <a
                                className = 'craft-reward-item-title'
                                href={allData.row.original.itemLink}

                            >
                                {allData.row.original.name}
                            </a>
                        </div>
                    </div>
                },
            },
            {
                Header: 'Cost ₽',
                accessor: d => Number(d.avg24hPrice),
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