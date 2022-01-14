import { useState, useCallback, useMemo, useEffect } from 'react';
import {Helmet} from 'react-helmet';
import debounce from 'lodash.debounce';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import QueueBrowserTask from '../../modules/queue-browser-task';
import ItemGrid from '../../components/item-grid';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage';
import { selectAllItems, fetchItems } from '../../features/items/itemsSlice';
import { Filter, ToggleFilter, SelectFilter, InputFilter } from '../../components/filter';
import capitalizeFirst from '../../modules/capitalize-first';

const defaultGroupNames = [
    'S',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
];

const filterOptions = [
    {
        value: 'barter',
        label: 'Barter',
        default: true,
    },
    {
        value: 'keys',
        label: 'Keys',
        default: true,
    },
    // {
    //     value: 'marked',
    //     label: 'Marked',
    //     default: false,
    // },
    {
        value: 'mods',
        label: 'Mods',
        default: true,
    },
    {
        value: 'provisions',
        label: 'Provisions',
        default: true,
    },
    {
        value: 'wearable',
        label: 'Wearable',
        default: true,
    },
];

const DEFAULT_MAX_ITEMS = 244;

const arrayChunk = (inputArray, chunkLength) => {
    return inputArray.reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index / chunkLength);

        if(!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = []; // start a new chunk
        }

        resultArray[chunkIndex].push(item);

        return resultArray;
    }, []);
};

function LootTier(props) {
    const [numberFilter, setNumberFilter] = useState(DEFAULT_MAX_ITEMS);
    const [minPrice, setMinPrice] = useStateWithLocalStorage('minPrice', 0);
    const hasFlea = useSelector((state) => state.settings.hasFlea);
    const [includeMarked, setIncludeMarked] = useStateWithLocalStorage('includeMarked', false);
    const [groupByType, setGroupByType] = useStateWithLocalStorage('groupByType', false);
    const [filters, setFilters] = useStateWithLocalStorage('filters', {
        name: '',
        types: filterOptions
            .map(filter => {
                if(filter.default){
                    return filter.value;
                }

                return false;
            })
            .filter(Boolean),
    });

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

    const handleFilterChange = (selectedFilters) => {
        QueueBrowserTask.task(() => {
            setFilters({
                ...filters,
                types: selectedFilters?.map((selectedValue) => {
                    return selectedValue.value;
                }) || filterOptions.map(filter => {
                    if(filter.default){
                        return filter.value;
                    }

                    return false;
                })
                .filter(Boolean),
            });
        });
    };

    const itemData = useMemo(() => {
        return items
            .map((item) => {
                if(!hasFlea){
                    return {
                        ...item,
                        sellTo: item.traderName,
                        pricePerSlot: Math.floor(item.traderPrice / item.slots),
                    };
                }

                let sellTo = 'Flea Market';
                const fleaPrice = item.avg24hPrice - item.fee;

                if(fleaPrice <= item.traderPrice){
                    sellTo = item.traderName;
                }

                return {
                    ...item,
                    sellTo: sellTo,
                    pricePerSlot: Math.floor(Math.max(fleaPrice, item.traderPrice) / item.slots),
                };
            })
            .filter((item) => {
                if(item.types.includes('unLootable')){
                    return false;
                }

                return true;
            });
    }, [hasFlea, items]);

    const typeFilteredItems = useMemo(() => {
        const innerTypeFilteredItems = itemData
            .filter((item) => {
                if (!includeMarked && item.types.includes('markedOnly')) {
                    return false;
                }

                const intersection = item.types.filter((type) =>
                    filters.types?.includes(type),
                );

                // No categories matching
                if(intersection.length === 0){
                    return false;
                }

                if(minPrice && item.pricePerSlot < minPrice){
                    return false;
                }

                return true;
            })


        return innerTypeFilteredItems;
    }, [filters.types, includeMarked, itemData, minPrice]);

    const filteredItems = useMemo(() => {
        const items = typeFilteredItems.filter((item) => {
            if (
                filters.name.length > 0 &&
                item.name.toLowerCase().indexOf(filters.name) === -1 &&
                item.shortName?.toLowerCase().indexOf(filters.name) === -1
            ) {
                return false;
            }

            return true;
        });

        items.sort((itemA, itemB) => {
            if (itemA.pricePerSlot > itemB.pricePerSlot) {
                return -1;
            }

            if (itemA.pricePerSlot < itemB.pricePerSlot) {
                return 1;
            }

            return 0;
        });

        return items;
    }, [filters.name, typeFilteredItems]);

    const minPriceHandler = debounce((event) => {
        console.log('debouncer called');
        const newValue = Number(event.target.value);
        setMinPrice(newValue);

        if(newValue > 0){
            setNumberFilter(99999);
        } else {
            setNumberFilter(DEFAULT_MAX_ITEMS);
        }
    }, 400);

    const selectedItems = useMemo(() => {
        return filteredItems.slice(
            0,
            Math.min(filteredItems.length, numberFilter),
        );
    }, [filteredItems, numberFilter]);

    const {
        groupNames,
        itemChunks,
    } = useMemo(() => {
        let innerGroupNames;
        let innerItemChunks;

        if (groupByType) {
            const activeFiltersSet = new Set();

            for (const item of selectedItems) {
                for (const activeFilter of filters.types) {
                    if (!item.types.includes(activeFilter)) {
                        continue;
                    }

                    activeFiltersSet.add(activeFilter);
                }
            }
            innerGroupNames = Array.from(activeFiltersSet);

            const chunkMap = {};

            for (const item of selectedItems) {
                for (const activeFilter of filters.types) {
                    if (!item.types.includes(activeFilter)) {
                        continue;
                    }

                    if (!chunkMap[activeFilter]) {
                        chunkMap[activeFilter] = [];
                    }

                    chunkMap[activeFilter].push(item);
                }
            }

            innerItemChunks = Object.values(chunkMap);
        } else {
            innerGroupNames = defaultGroupNames

            innerItemChunks = arrayChunk(
                selectedItems,
                Math.ceil(selectedItems.length / innerGroupNames.length),
            );
        }

        for (let i = 0; i < innerItemChunks.length; i = i + 1) {
            innerItemChunks[i] = innerItemChunks[i]?.sort((itemA, itemB) => {
                if (itemA.slots > itemB.slots) {
                    return -1;
                }

                if (itemA.slots < itemB.slots) {
                    return 1;
                }

                return 0;
            });
        }

        return {
            groupNames: innerGroupNames,
            itemChunks: innerItemChunks,
        };
    }, [filters.types, groupByType, selectedItems]);

    const handleFilterNameChange = useCallback((e) => {
        if (typeof window !== 'undefined') {
            const name = e.target.value.toLowerCase();

            // schedule this for the next loop so that the UI
            // has time to update but we do the filtering as soon as possible
            QueueBrowserTask.task(() => {
                setFilters({
                    ...filters,
                    name,
                });
            });
        }
    }, [filters, setFilters]);

    return [
        <Helmet
            key = {'loot-tier-helmet'}
        >
            <meta charSet="utf-8" />
            <title>
                {t('Escape from Tarkov loot tiers')}
            </title>
            <meta
                name="description"
                content="Visualization of all different valuable loot"
            />
        </Helmet>,
        <div
            className="display-wrapper"
            style = {{
                height: 'auto',
            }}
            key = {'display-wrapper'}
        >
            <Filter>
                <ToggleFilter
                    label = {t('Include Marked')}
                    onChange = {e => setIncludeMarked(!includeMarked)}
                    checked = {includeMarked}
                />
                <ToggleFilter
                    label = {t('Group by type')}
                    onChange = {e => setGroupByType(!groupByType)}
                    checked = {groupByType}
                />
                <SelectFilter
                    defaultValue = {filters.types?.map(filter => {
                        return filterOptions.find(defaultFilter => defaultFilter.value === filter);
                    })}
                    isMulti
                    options = {filterOptions}
                    onChange = {handleFilterChange}

                />
                <InputFilter
                    defaultValue = {minPrice || ''}
                    placeholder = {t('Min value')}
                    type = {'number'}
                    onChange = {minPriceHandler}
                />
                <InputFilter
                    defaultValue = {filters.name || ''}
                    type = {'text'}
                    placeholder = {t('btc, graphics e.t.c')}
                    onChange={handleFilterNameChange}
                />
            </Filter>
            {itemChunks.map((items, index) =>
                <ItemGrid
                    key = {`barter-group-${groupNames[index]}`}
                    name = {capitalizeFirst(groupNames[index])}
                    items = {items}
                />
            )}
        </div>,
    ];
};

export default LootTier;


