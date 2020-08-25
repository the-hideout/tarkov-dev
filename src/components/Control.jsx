import React, { useState, useRef } from 'react';

import ammoData from '../data.json';
import mapData from '../map-data.json';

const ammoTypes = [...new Set(ammoData.data.map((ammoData) => {
    return ammoData.type
}))].sort();

function Control(props) {
    const [connectionText, setConnectionText] = useState('Connect');
    const [connectID, setConnectID] = useState();
    
    const inputRef = useRef(null);
    const typeRefs = {
        ammo: useRef(null),
        map: useRef(null),
        lootTier: useRef(null),
    };
    
    const handleConnectClick = (event) => {
        if(connectID.length !== 4){            
            inputRef.current.focus();
            
            return true;
        }
        
        setConnectionText(`Connected to ${props.sessionID}`);
        
        props.send({
            type: 'command',
            data: {
                type: 'map',
                value: document.querySelector('[name="map"]').value,
            },
        });  
    };
    
    const handleIDChange = (event) => {
        const tempConnectID = event.target.value.trim().toUpperCase().substring(0, 4);
        props.setID(tempConnectID);
        
        setConnectID(tempConnectID);
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
    
    const handleLootTierChange = () => {
        handleViewChange('loot-tier', typeRefs['lootTier'].current.value);
    };

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
        <div
            className = {'control-section'}
        >
            <span>View loot tiers:</span>
            <select
                name="loot-tier"
                onChange={handleLootTierChange}
                ref = {typeRefs['lootTier']}    
            >
                <option
                    value = 'barter-items'
                >
                    {'Barter items'}
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
        </div>
        <div className="info-wrapper">
            Load this page in another browser to control it from here.
            <p>
                Wanna view the desktop version? Flip your phone to landscape mode.
            </p>
        </div>
        <div className="connection-wrapper">
            <input
                maxLength = "4"
                minLength = "4"
                name = "session-id"
                onChange = {handleIDChange}
                placeholder = "desktop id"
                ref = {inputRef}
                type = "text"
            />
            <input 
                disabled = {!props.socketConnected}
                onClick = {handleConnectClick}
                type = "submit"
                value = {connectionText} 
            />
        </div>
    </div>
}

export default Control;


