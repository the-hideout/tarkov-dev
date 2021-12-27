import {useMemo, useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Link,
} from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Icon from '@mdi/react'
import {
    mdiClockAlertOutline,
    mdiCloseOctagon,
} from '@mdi/js';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import Fuse from 'fuse.js'

import DataTable from '../data-table';
import formatPrice from '../../modules/format-price';
import { selectAllItems, fetchItems } from '../../features/items/itemsSlice';
import ValueCell from '../value-cell';
import TraderPriceCell from '../trader-price-cell';

import './index.css';

function traderSellCell(datum) {
    if(datum.row.original.traderName === '?'){
        return null;
    }

    return <div
        className = 'trader-price-content'
    >
        <img
            alt = {datum.row.original.traderName}
            className = 'trader-icon'
            height = '40'
            src={`${process.env.PUBLIC_URL}/images/${datum.row.original.traderName?.toLowerCase()}-icon.jpg`}
            title = {datum.row.original.traderName}
            width = '40'
        />
        {formatPrice(datum.row.values.traderPrice)}
    </div>;
};

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function SmallItemTable(props) {
    const {maxItems, nameFilter, defaultRandom, typeFilter, instaProfit, traderPrice} = props;
    const dispatch = useDispatch();
    const items = useSelector(selectAllItems);
    const itemStatus = useSelector((state) => {
        return state.items.status;
    });
    const {t} = useTranslation();

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

    const data = useMemo(() => {
        let returnData = items.map((itemData) => {
            const formattedItem = {
                id: itemData.id,
                name: itemData.name,
                shortName: itemData.shortName,
                normalizedName: itemData.normalizedName,
                avg24hPrice: itemData.avg24hPrice,
                lastLowPrice: itemData.lastLowPrice,
                // iconLink: `https://assets.tarkov-tools.com/${itemData.id}-icon.jpg`,
                iconLink: itemData.iconLink || `${process.env.PUBLIC_URL}/images/unknown-item-icon.jpg`,
                instaProfit: 0,
                itemLink: `/item/${itemData.normalizedName}`,
                traderName: itemData.traderName,
                traderPrice: itemData.traderPrice,
                types: itemData.types,
                buyFor: itemData.buyFor,
            };

            const buyOnFleaPrice = itemData.buyFor.find(buyPrice => buyPrice.source === 'flea-market');

            if(buyOnFleaPrice){
                formattedItem.instaProfit = itemData.traderPrice - buyOnFleaPrice.price;
            }

            return formattedItem;
        })
        .filter(item => {
            return !item.types.includes('disabled');
        });

        if(nameFilter){
            const options = {
                includeScore: true,
                keys: ['name'],
                distance: 1000,
            };

            const fuse = new Fuse(returnData, options);
            const result = fuse.search(nameFilter);

            returnData = result.map(resultObject => resultObject.item);
        }

        if(typeFilter){
            returnData = returnData.filter(item => item.types.includes(typeFilter));
        }

        if(defaultRandom && !nameFilter){
            shuffleArray(returnData);
        }

        return returnData;
    },
        [nameFilter, defaultRandom, items, typeFilter]
    );

    const columns = useMemo(
        () => {
            const useColumns = [
                {
                    Header: t('Name'),
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
                                height = '64'
                                loading = 'lazy'
                                src = { allData.row.original.iconLink }
                                width = '64'
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
                    Header: t('Trader sell'),
                    accessor: d => Number(d.traderPrice),
                    Cell: traderSellCell,
                    id: 'traderPrice',
                },
                {
                    Header: t('Flea'),
                    accessor: d => Number(d.lastLowPrice),
                    Cell: (allData) => {
                        if(allData.row.original.types.includes('noFlea')){
                            return <ValueCell
                                value = {allData.value}
                                noValue = {
                                    <div
                                        className = 'center-content'
                                    >
                                        <Tippy
                                            placement = 'bottom'
                                            content={'This item can\'t be sold on the Flea Market'}
                                        >
                                            <Icon
                                                path={mdiCloseOctagon}
                                                size={1}
                                                className = 'icon-with-text'
                                            />
                                        </Tippy>
                                    </div>
                                }
                            />;
                        }
                        return <ValueCell
                            value = {allData.value}
                            noValue = {
                                <div
                                    className = 'center-content'
                                >
                                    <Tippy
                                        placement = 'bottom'
                                        content={'No flea price seen in the past 24 hours'}
                                    >
                                        <Icon
                                            path={mdiClockAlertOutline}
                                            size={1}
                                            className = 'icon-with-text'
                                        />
                                    </Tippy>
                                </div>
                            }
                        />;
                    },
                    id: 'fleaPrice',
                },
            ];

            if(instaProfit){
                useColumns.push({
                    Header: t('InstaProfit'),
                    accessor: d => Number(d.instaProfit),
                    Cell: ValueCell,
                    id: 'instaProfit',
                    sortDescFirst: true,
                    sortType: (a, b) => {
                        if(a.values.instaProfit === 0){
                            return -1;
                        }

                        if(b.values.instaProfit === 0){
                            return 1;
                        }

                        if(a.values.instaProfit > b.values.instaProfit){
                            return 1;
                        }

                        if(a.values.instaProfit < b.values.instaProfit){
                            return -1;
                        }

                        return 0;
                    },
                });
            }

            if(traderPrice){
                useColumns.push({
                    Header: t('Trader buy'),
                    accessor: d => Number(d.instaProfit),
                    Cell: TraderPriceCell,
                    id: 'traderBuyCell',
                });
            }

            return useColumns;
        },
        [t, instaProfit, traderPrice]
    );

    if(data.length <= 0){
        return <div>
            {t('None')}
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
        maxItems = {maxItems}
        nameFilter = {nameFilter}
    />
}

export default SmallItemTable;