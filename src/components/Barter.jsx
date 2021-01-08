import { useState, useEffect } from 'react';
import {
    useParams,
} from "react-router-dom";
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

const allowedGroups = [
    'barter-items',
    'mods',
    'keys',
];

const groupMap = {
    'barter-items': 'barter',
    'mods': 'mod',
    'keys': 'key',
};

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
    const [items, setItems] = useState([]);
    const [updateDate, setUpdateDate] = useState(new Date());
    const {currentLoot} = useParams();
    const [nameFilter, setNameFilter] = useState('');
    const [numberFilter, setNumberFilter] = useState(244);
    const [includeFlea, setIncludeFlea] = useState(true);
    const [includeMarked, setIncludeMarked] = useState(false);
    const [filteredItems, setFilteredItems] = useState([]);
    const [filters, setFilters] = useState({
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
        async function fetchData(){
            let itemFilter = currentLoot;
            let dataSources = [];
            if(!currentLoot || currentLoot === 'barter'){
                itemFilter = 'barter-items';
            }

            if(itemFilter.includes(',')){
                dataSources = itemFilter
                    .split(',')
                    .filter((potentialGroup) => {
                        return allowedGroups.includes(potentialGroup);
                    });
            } else {
                dataSources.push(itemFilter);
            }

            let allowedTypes = dataSources.map(source => groupMap[source]);

            let allItems = Object.values(Items).filter((item) => {
                if(item.types.includes('un-lootable')){
                    return false;
                }

                if(!includeMarked && item.types.includes('marked-only')){
                    return false;
                }

                const intersection = item.types.filter(type => filters.types?.includes(type));

                return intersection.length > 0;
            });

            setUpdateDate(new Date());

            setItems(allItems);
        }

        fetchData();
    }, [currentLoot, setItems, filters, includeMarked]);

    useEffect(() => {
        const filteredItems = items.map((item) => {
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

        const sortedItems = filteredItems
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
    }, [items, setFilteredItems, includeFlea]);

    const itemChunks = arrayChunk(filteredItems.slice(0, Math.min(filteredItems.length, numberFilter)), Math.min(items.length, numberFilter) / 7);

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

    // console.log(displayItems)

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
                    {`Prices updated: ${updateDate.toLocaleDateString()}`}
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
                    onChange = {e => setNameFilter(e.target.value.toLowerCase())}
                />
            </div>
        </div>
        {itemChunks.map((items, index) =>
            <BarterGroup
                filter = {nameFilter}
                key = {`barter-group-${groupNames[index]}`}
                name = {groupNames[index]}
                items = {items}
            />
        )}
    </div>;
}

export default Barter;


