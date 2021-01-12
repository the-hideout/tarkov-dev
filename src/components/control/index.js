import { useRef } from 'react';

import Connect from './Connect.jsx';

import ammoData from '../../data/ammo.json';
import mapData from '../../data/maps.json';

import './index.css';

const ammoTypes = [...new Set(ammoData.data.map((ammoData) => {
    return ammoData.type
}))].sort();

function Control(props) {
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

        props.send({
            type: 'command',
            data: {
                type: view,
                value: value,
            },
        });
    };

    return <div className="control-wrapper">
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
        <Connect
            send = {props.send}
            setID = {props.setID}
            sessionID = {props.sessionID}
            socketConnected = {props.socketConnected}
        />
    </div>
}

export default Control;


