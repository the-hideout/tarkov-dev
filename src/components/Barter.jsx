import { useState, useEffect } from 'react';
import Switch from "react-switch";
import Select from 'react-select'

import BarterGroup from './BarterGroup';
import FilterIcon from './FilterIcon.jsx';

import Items from '../Items';

const groupNames = [
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
    const [numberFilter, setNumberFilter] = useState(244);
    const [includeFlea, setIncludeFlea] = useState(true);
    const [includeMarked, setIncludeMarked] = useState(false);
    const [filteredItems, setFilteredItems] = useState([]);
    const [filters, setFilters] = useState({
        name: '',
        types: filterOptions.map(filter => {
            if(filter.default){
                return filter.value;
            }

            return false;
        }).filter(Boolean),
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
        const filteredItems = Object.values(Items)
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

                if(filters.name.length <= 0 ){
                    return true;
                }

                if (item.name.toLowerCase().indexOf(filters.name) > -1){
                    return true;
                }

                if(item.shortName?.toLowerCase().indexOf(filters.name) > -1){
                    return true;
                }

                return false;
        });

        const itemData = filteredItems.map((item) => {
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
    }, [setFilteredItems, includeFlea, filters, includeMarked]);

    const itemChunks = arrayChunk(filteredItems.slice(0, Math.min(filteredItems.length, numberFilter)), Math.min(Object.values(Items).length, numberFilter) / 7);

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
                <Select
                    defaultValue={filterOptions.map(filter => {
                        if(filter.default) {
                            return filter;
                        }

                        return false;
                    }).filter(Boolean)}
                    isMulti
                    name="colors"
                    options={filterOptions}
                    className="basic-multi-select"
                    onChange = {handleFilterChange}
                    classNamePrefix="select"
                />
                <input
                    type = {'number'}
                    placeholder = {'max items'}
                    onChange = {e => setNumberFilter(Math.max(7, Number(e.target.value)))}
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


