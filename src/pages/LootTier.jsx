import { useState, useCallback, useMemo } from 'react';
import Switch from 'react-switch';
import Select from 'react-select'
import {Helmet} from 'react-helmet';
import debounce from 'lodash.debounce';

import QueueBrowserTask from '../modules/queue-browser-task';
import ID from '../components/ID.jsx';
import ItemGrid from '../components/item-grid/';
import FilterIcon from '../components/FilterIcon.jsx';
import useStateWithLocalStorage from '../hooks/useStateWithLocalStorage';

import Items from '../Items';

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
    // const [includeFlea, setIncludeFlea] = useState(true);
    const [includeFlea, setIncludeFlea] = useStateWithLocalStorage('includeFlea', true);
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
    const [showFilter, setShowFilter] = useState(false);

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
        return Object.values(Items)
            .map((item) => {
                if(!includeFlea){
                    return {
                        ...item,
                        sellTo: item.traderName,
                        pricePerSlot: Math.floor(item.traderPrice / item.slots),
                    };
                }

                let sellTo = 'Flea Market';
                const fleaPrice = item.bestPrice - item.bestPriceFee;

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
                if(item.types.includes('un-lootable')){
                    return false;
                }

                return true;
            });
    }, [includeFlea]);

    const typeFilteredItems = useMemo(() => {
        const innerTypeFilteredItems = itemData
            .filter((item) => {
                if (!includeMarked && item.types.includes('marked-only')) {
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

    const groupNames = useMemo(() => {
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

            return Array.from(activeFiltersSet);
        }

        return defaultGroupNames;
    }, [groupByType, selectedItems, filters.types]);

    const itemChunks = useMemo(() => {
        let innerItemChunks = arrayChunk(
            selectedItems,
            selectedItems.length / 7,
        );

        if (groupByType) {
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

        return innerItemChunks;
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
            <title>Tarkov loot tiers</title>
            <meta
                name="description"
                content="Visualization of all different valuable loot"
            />
        </Helmet>,
        <div
            className="display-wrapper"
            style = {{
                backgroundColor: '#000',
                height: 'auto',
            }}
            key = {'display-wrapper'}
        >
            <div
                className = {'filter-toggle-icon-wrapper'}
                onClick = {e => setShowFilter(!showFilter)}
            >
                <FilterIcon />
            </div>
            <div
                className = {`item-group-wrapper filter-wrapper ${showFilter ? 'open': ''}`}
            >
                <div
                    className = {'filter-content-wrapper'}
                >
                    <div
                        className = {'text-label'}
                    >
                        {`Prices updated: ${new Date().toLocaleDateString()}`}
                    </div>
                    <label
                        className = {'filter-toggle-wrapper'}
                    >
                        <span
                            className = {'filter-toggle-label'}
                        >
                            Include Flea
                        </span>
                        <Switch
                            className = {'filter-toggle'}
                            onChange = {e => setIncludeFlea(!includeFlea)}
                            checked = {includeFlea}
                        />
                    </label>
                    <label
                        className = {'filter-toggle-wrapper'}
                    >
                        <span
                            className = {'filter-toggle-label'}
                        >
                            Include Marked
                        </span>
                        <Switch
                            className = {'filter-toggle'}
                            onChange = {e => setIncludeMarked(!includeMarked)}
                            checked = {includeMarked}
                        />
                    </label>
                    <label
                        className = {'filter-toggle-wrapper'}
                    >
                        <span
                            className = {'filter-toggle-label'}
                        >
                            Group by type
                        </span>
                        <Switch
                            className = {'filter-toggle'}
                            onChange = {e => setGroupByType(!groupByType)}
                            checked = {groupByType}
                        />
                    </label>
                    <Select
                        defaultValue={filters.types?.map(filter => {
                            return filterOptions.find(defaultFilter => defaultFilter.value === filter);
                        })}
                        isMulti
                        name="colors"
                        options={filterOptions}
                        className="basic-multi-select"
                        onChange = {handleFilterChange}
                        classNamePrefix="select"
                    />
                    {/* <input
                        type = {'number'}
                        placeholder = {'max items'}
                        onChange = {e => setNumberFilter(Math.max(7, Number(e.target.value)))}
                    /> */}
                    <input
                        defaultValue = {minPrice || ''}
                        type = {'number'}
                        placeholder = {'min value'}
                        onChange = {minPriceHandler}
                    />
                    <input
                        defaultValue = {filters.name || ''}
                        type = {'text'}
                        placeholder = {'btc, graphics e.t.c'}
                        onChange={handleFilterNameChange}
                    />
                </div>
            </div>
            {itemChunks.map((items, index) =>
                <ItemGrid
                    key = {`barter-group-${groupNames[index]}`}
                    name = {groupNames[index]}
                    items = {items}
                />
            )}
        </div>,
        <ID
            key = {'session-id'}
            sessionID = {props.sessionID}
        />
    ];
};

export default LootTier;


