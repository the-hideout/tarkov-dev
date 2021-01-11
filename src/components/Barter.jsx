import { useState, useEffect } from 'react';
import Switch from "react-switch";
import Select from 'react-select'

import BarterGroup from './BarterGroup';
import FilterIcon from './FilterIcon.jsx';
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



const arrayChunk = (inputArray, chunkLength) => {
    return inputArray.reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index / chunkLength);

        if(!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = []; // start a new chunk
        }

        resultArray[chunkIndex].push(item);

        return resultArray
    }, []);
};

function Barter() {
    const [numberFilter] = useState(244);
    const [minPrice, setMinPrice] = useStateWithLocalStorage('minPrice', 0);
    // const [includeFlea, setIncludeFlea] = useState(true);
    const [includeFlea, setIncludeFlea] = useStateWithLocalStorage('includeFlea', true);
    const [includeMarked, setIncludeMarked] = useStateWithLocalStorage('includeMarked', false);
    const [filteredItems, setFilteredItems] = useState([]);
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
        setFilters({
            ...filters,
            types: selectedFilters?.map((selectedValue) => {
                return selectedValue.value;
            }),
        });
    };

    useEffect(() => {
        const itemData = Object.values(Items)
            .map((item) => {
                if(!includeFlea){
                    return {
                        ...item,
                        sellTo: item.traderName,
                        pricePerSlot: Math.floor(item.traderPrice / item.slots),
                    };
                }

                let sellTo = 'Flea Market';
                const fleaPrice = item.price - item.fee;

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

                if(!includeMarked && item.types.includes('marked-only')){
                    return false;
                }

                const intersection = item.types.filter(type => filters.types?.includes(type));

                // No categories matching
                if(intersection.length === 0){
                    return false;
                }

                if (filters.name.length > 0 && (item.name.toLowerCase().indexOf(filters.name) === -1 && item.shortName?.toLowerCase().indexOf(filters.name) === -1)){
                    return false;
                }

                if(minPrice && item.pricePerSlot < minPrice){
                    return false;
                }

                return true;
        });

        const sortedItems = itemData
            .sort((itemA, itemB) => {
                if(itemA.pricePerSlot > itemB.pricePerSlot){
                    return -1;
                }

                if(itemA.pricePerSlot < itemB.pricePerSlot){
                    return 1;
                }

                return 0;
            });

        setFilteredItems(sortedItems);
    }, [setFilteredItems, includeFlea, filters, includeMarked, minPrice]);

    let itemChunks = arrayChunk(filteredItems.slice(0, Math.min(filteredItems.length, numberFilter)), Math.min(filteredItems.length, numberFilter) / 7);
    let groupNames = defaultGroupNames;

    if(groupByType){
        groupNames = [];
        const chunkMap = {};
        const selectedItems = filteredItems.slice(0, Math.min(filteredItems.length, numberFilter));

        for(const item of selectedItems){
            for(const activeFilter of filters.types){
                if(!item.types.includes(activeFilter)){
                    continue;
                }

                if(!chunkMap[activeFilter]){
                    chunkMap[activeFilter] = [];
                    groupNames.push(activeFilter);
                }

                chunkMap[activeFilter].push(item);
            }
        }

        itemChunks = Object.values(chunkMap);
    }

    for(let i = 0; i < itemChunks.length; i = i + 1){
        itemChunks[i] = itemChunks[i].sort((itemA, itemB) => {
            if(itemA.slots > itemB.slots){
                return -1;
            }

            if(itemA.slots < itemB.slots){
                return 1;
            }

            return 0;
        });
    };

    return <div
        className="barter-wrapper"
    >
        <div
            className = {'filter-toggle-icon-wrapper'}
            onClick = {e => setShowFilter(!showFilter)}
        >
            <FilterIcon />
        </div>
        <div
            className = {`barter-group-wrapper filter-wrapper ${showFilter ? 'open': ''}`}
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
                    defaultValue={filters.types.map(filter => {
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
                    onChange = {e => setMinPrice(Number(e.target.value))}
                />
                <input
                    type = {'text'}
                    placeholder = {'btc, graphics e.t.c'}
                    onChange = {e => setFilters({
                        ...filters,
                        name: e.target.value.toLowerCase(),
                    })}
                />
            </div>
        </div>
        {itemChunks.map((items, index) =>
            <BarterGroup
                key = {`barter-group-${groupNames[index]}`}
                name = {groupNames[index]}
                items = {items}
            />
        )}
    </div>;
}

export default Barter;


