import {useMemo, useEffect, useState} from 'react';
import {Helmet} from 'react-helmet';
import { useSelector, useDispatch } from 'react-redux';

import ItemsTable from '../../components/item-table';
import { selectAllItems, fetchItems } from '../../features/items/itemsSlice';
import {
    Filter,
    // ButtonGroupFilter,
    // ButtonGroupFilterButton,
    SelectFilter,
} from '../../components/filter';

const getGuns = (items, targetItem) => {
    let parentItems = []
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

function Suppressors(props) {
    const [selectedGun, setSelectedGun] = useState(false)
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

    const allItems = useMemo(
        () => items
        .filter(item => item.types.includes('suppressor'))
        .map(item => {
            return {
                ...item,
                subRows: getGuns(items, item),
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
                    for(const subRow of displayItem.subRows){
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

                for(const subRow of item.subRows){
                    if(subRow.id === selectedGun.id){
                        return true;
                    }
                }

                return false;
        }),
        [allItems, selectedGun]
    );

    // const parentItems = useMemo(
    //     () => items.filter(item => item.linkedItems.includes(displayItems.map(displayItem => displayItem.id))),
    //     [items, displayItems]
    // );

    // console.log(parentItems);

    // displayItems.map(item => {
    //     console.log(item.subRows);
    // });

    const columns = [
        {
            key: 'iconLink',
            type: 'image',
        },
        {
            title: 'Name',
            key: 'name',
        },
        // {
        //     title: 'Accuracy',
        //     key: 'itemProperties.Accuracy',
        // },
        {
            title: 'Ergonomics',
            key: 'itemProperties.Ergonomics',
        },
        {
            title: 'Recoil',
            key: 'itemProperties.Recoil',
        },
        {
            title: 'Price',
            key: 'avg24hPrice',
            type: 'price',
        },
    ];

    return [<Helmet
        key = {'suppressors-table'}
    >
        <meta
            charSet='utf-8'
        />
        <title>
            Escape from Tarkov Helmet suppressors chart
        </title>
        <meta
            name = 'description'
            content = 'All suppressors in Escape from Tarkov sortable by price, caliber etc'
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
                Escape from Tarkov Suppressors
            </h1>
        </div>
        <Filter
            center
        >
            {/* <ButtonGroupFilter>
                {activeGuns.map((activeGun) => {
                    return <ButtonGroupFilterButton
                        key = {`trader-tooltip-${activeGun.name}`}
                        tooltipContent = {
                            <div>
                                {activeGun.name}
                            </div>
                        }
                        selected = {activeGun.id === selectedGun.id}
                        content = {<img
                            alt = {activeGun.name}
                            title = {activeGun.name}
                            src={activeGun.iconLink}
                        />}
                        onClick = {setSelectedGun.bind(undefined, activeGun)}
                    />
                })}
                <ButtonGroupFilterButton
                    tooltipContent = {
                        <div>
                            Show all suppressors
                        </div>
                    }
                    selected = {selectedGun === false}
                    content = {'All'}
                    onClick = {setSelectedGun.bind(undefined, false)}
                />
            </ButtonGroupFilter> */}
            <SelectFilter
                label = 'Filter by gun'
                options = {activeGuns.map((activeGun) => {
                    return {
                        label: activeGun.name,
                        value: activeGun.id,
                    };
                })}
                onChange = {(event) => {
                    setSelectedGun(activeGuns.find(activeGun => activeGun.id === event.value))
                }}
                wide
            />
        </Filter>
        <ItemsTable
            columns = {columns}
            items = {displayItems}
        />
    </div>
    ];
};

export default Suppressors;
