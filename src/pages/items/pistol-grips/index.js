import {useMemo, useEffect, useState, useRef} from 'react';
import {Helmet} from 'react-helmet';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import ItemsTable from '../../../components/item-table';
import { selectAllItems, fetchItems } from '../../../features/items/itemsSlice';
import {
    Filter,
    SelectFilter,
} from '../../../components/filter';

const getGuns = (items, targetItem) => {
    let parentItems = [];
    const currentParentItems = items.filter(innerItem => innerItem.linkedItems.includes(targetItem.id));

    for(const parentItem of currentParentItems){
        if(parentItem.types.includes('gun')){
            parentItems.push(parentItem);

            continue;
        }

        parentItems = parentItems.concat(getGuns(items, parentItem));
    }

    let idCache = [];

    parentItems = parentItems
        .map(parentItem => {
            if(idCache.includes(parentItem.id)){
                return false;
            }

            idCache.push(parentItem.id);

            return parentItem;
        })
        .filter(Boolean);

    return parentItems;
};

// const getChain = (items, targetItem) => {
//     const chain = items.filter(innerItem => innerItem.linkedItems.includes(targetItem.id));

//     for(const key in chain){
//         chain[key] = {
//             ...chain[key],
//             fitChain: getChain(items, chain[key]),
//         };
//     }

//     return chain;
// };

const getAttachmentPoints = (items, targetItem) => {
    return items
        .filter(innerItem => innerItem.linkedItems.includes(targetItem.id))
        .map(item => {
            return {
                ...item,
                fitsTo: getGuns(items, item),
            };
        });
};

function PistolGrips(props) {
    const [selectedGun, setSelectedGun] = useState(false)
    const dispatch = useDispatch();
    const items = useSelector(selectAllItems);
    const itemStatus = useSelector((state) => {
        return state.items.status;
    });
    const selectInputRef = useRef(null);
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

    const allItems = useMemo(
        () => items
        .filter(item => item.types.includes('pistolGrip'))
        .map(item => {
            return {
                ...item,
                fitsTo: getGuns(items, item),
                subRows: getAttachmentPoints(items, item),
            };
        }),

        [items]
    );

    const activeGuns = useMemo(
        () => {
            let activeGuns = [];
            let idCache = [];

            allItems
                .map(displayItem => {
                    for(const subRow of displayItem.fitsTo){
                        if(idCache.includes(subRow.id)){
                            continue;
                        }

                        idCache.push(subRow.id);

                        activeGuns.push(subRow);
                    }

                    return true;
                });

            activeGuns.sort((a, b) => a.name.localeCompare(b.name));

            return activeGuns;
        },
        [allItems]
    );

    const displayItems = useMemo(
        () => allItems
            .filter(item => {
                if(!selectedGun){
                    return true;
                }

                for(const subRow of item.fitsTo){
                    if(subRow.id === selectedGun.id){
                        return true;
                    }
                }

                return false;
            })
            .map((subItem) => {
                subItem.subRows = subItem.subRows
                    .filter(item => {
                        if(!selectedGun){
                            return true;
                        }

                        for(const subRow of item.fitsTo){
                            if(subRow.id === selectedGun.id){
                                return true;
                            }
                        }

                        return false;
                    });

                subItem.costPerErgo = subItem.avg24hPrice / subItem.itemProperties.Ergonomics;

                return subItem;
            })
        ,
        [allItems, selectedGun]
    );

    const columns = [
        {
            key: 'iconLink',
            type: 'image',
        },
        {
            title: t('Name'),
            key: 'name',
            type: 'name',
        },
        {
            title: t('Ergonomics'),
            key: 'itemProperties.Ergonomics',
        },
        {
            title: t('Flea Price'),
            key: 'avg24hPrice',
            type: 'price',
        },
        {
            title: t('Cost per ergo'),
            key: 'costPerErgo',
            type: 'price',
        },
    ];

    return [<Helmet
        key = {'pistol-grips-table'}
    >
        <meta
            charSet='utf-8'
        />
        <title>
            {t('Escape from Tarkov Pistol Grips')}
        </title>
        <meta
            name = 'description'
            content = 'All Pistol grips in Escape from Tarkov sortable by price, caliber etc'
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
                {t('Escape from Tarkov Pistol Grips')}
            </h1>
            <Filter
                center
            >
                <SelectFilter
                    label = {t('Filter by gun')}
                    options = {activeGuns.map((activeGun) => {
                        return {
                            label: activeGun.name,
                            value: activeGun.id,
                        };
                    })}
                    onChange = {(event) => {
                        if(!event){
                            return true;
                        }

                        setSelectedGun(activeGuns.find(activeGun => activeGun.id === event.value))
                    }}
                    parentRef = {selectInputRef}
                    wide
                />
                {selectedGun && <img
                    alt = {`${selectedGun.name}-icon`}
                    onClick = {() => {
                        selectInputRef.current?.clearValue();
                        setSelectedGun(false);
                    }}
                    loading='lazy'
                    src = {selectedGun.iconLink}
                />}
            </Filter>
        </div>
        <ItemsTable
            columns = {columns}
            items = {displayItems}
            traderPrice
            maxItems = {50}
            autoScroll
        />
    </div>
    ];
};

export default PistolGrips;
