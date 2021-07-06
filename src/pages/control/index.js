import { useRef, useEffect, useMemo } from 'react';
import Select from 'react-select';
import { useSelector, useDispatch } from 'react-redux';

import Connect from './Connect.jsx';
import { selectAllItems, fetchItems } from '../../features/items/itemsSlice';

import ammoData from '../../data/ammo.json';
import mapData from '../../data/maps.json';

import './index.css';

const ammoTypes = [...new Set(ammoData.data.map((ammoData) => {
    return ammoData.type
}))].sort();


function Control(props) {
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

    const itemList = useMemo(() => {
        return items
            .map((item) => {
                return {
                    label: item.name,
                    value: item.id,
                };
            })
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [items])

    const typeRefs = {
        ammo: useRef(null),
        map: useRef(null),
        lootTier: useRef(null),
    };

    const handleMapChange = () => {
        handleViewChange('map', typeRefs['map'].current.value);
    };

    const handleAmmoChange = () => {
        const ammoValues = [];

        for(const option of typeRefs['ammo'].current.children){
            if(!option.selected){
                continue;
            }

            ammoValues.push(option.value);
        }

        ammoValues.sort();
        handleViewChange('ammo', ammoValues.join(','));
    };

    // const handleLootTierChange = () => {
    //     handleViewChange('loot-tier', typeRefs['lootTier'].current.value);
    // };

    const handleViewChange = (view, eventOrValue) => {
        let value = eventOrValue.target?.value || eventOrValue;

        if(!props.send){
            return false;
        }

        props.send({
            type: 'command',
            data: {
                type: view,
                value: value,
            },
        });
    };

    const handleSelectChange = (event) => {
        handleViewChange('item', event.value);
    };

    return <div
        className="control-wrapper"
        key = ''
    >
        <div
            className = {'control-section'}
        >
            <span>View map:</span>
            <select
                name="map"
                onChange={handleMapChange}
                ref = {typeRefs['map']}
            >
                {mapData.map(map =>
                    <option
                        key = {map.key}
                        value = {map.key}
                    >
                        {map.displayText}
                    </option>
                )}
            </select>
            <button
                onClick = {handleMapChange}
            >
                Go
            </button>
        </div>
        <div
            className = {'control-section'}
        >
            <span>View caliber:</span>
            <select
                multiple
                name="ammo"
                onChange={handleAmmoChange}
                ref = {typeRefs['ammo']}
            >
                {ammoTypes.map((ammoType) => (
                    <option
                        key = {ammoType}
                        value = {ammoType}
                    >
                        {ammoType}
                    </option>
                ))}
            </select>
            <button
                onClick = {handleAmmoChange}
            >
                Go
            </button>
        </div>
        <Select
                // defaultValue = {defaultValue}
                // isMulti = {isMulti}
                name = "colors"
                options = {itemList}
                className = "basic-multi-select"
                onChange = {handleSelectChange}
                classNamePrefix = "select"
                // onMenuClose = {onMenuClose}
                // onMenuOpen = {onMenuOpen}
        />
        {/* <div
            className = {'control-section'}
        >
            <span>View loot tiers:</span>
            <select
                name="loot-tier"
                onChange={handleLootTierChange}
                ref = {typeRefs['lootTier']}
            >
                <option
                    value = 'grid-items'
                >
                    {'Barter items'}
                </option>
                <option
                    value = 'mods'
                >
                    {'Mods'}
                </option>
                <option
                    value = 'keys'
                >
                    {'Keys'}
                </option>
            </select>
            <button
                onClick = {handleLootTierChange}
            >
                Go
            </button>
        </div> */}
        <div className="info-wrapper">
            Load tarkov-tools in another browser or window to control it from here
        </div>
        <Connect />
    </div>;
}

export default Control;


