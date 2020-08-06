import React, { useState, useRef } from 'react';

function Control(props) {
    const [connectionText, setConnectionText] = useState('Connect');
    const [connectID, setConnectID] = useState();
    
    const inputRef = useRef(null);
    
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
    
    const handleMapChange = (event) => {
        props.send({
            type: 'command',
            data: {
                type: 'map',
                value: event.target.value,
            },
        });
    };
    
    const handleAmmoChange = (event) => {
        props.send({
            type: 'command',
            data: {
                type: 'ammo',
                value: event.target.value,
            }
        });
    };
    
    return <div className="control-wrapper">
        <span>View map:</span>
        <select name="map" onChange={handleMapChange}>
            <option value="customs">Customs</option>
            <option value="dorms">Customs - Dorms</option>
            <option value="factory">Factory</option>
            <option value="interchange">Interchange</option>
            <option value="reserve">Reserve</option>
            <option value="shoreline">Shoreline</option>
            <option value="resort">Shoreline - Resort</option>
            <option value="woods">Woods</option>
        </select>
        <span>View caliber:</span>
        <select name="ammo" onChange={handleAmmoChange}>
            <option value=".366">.366</option>
            <option value=".45">.45</option>
            <option value="12 Gauge Shot">12 Gauge Shot</option>
            <option value="12 Gauge Slugs">12 Gauge Slugs</option>
            <option value="12.7x55 mm">12.7x55 mm</option>
            <option value="20 Gauge">20 Gauge</option>
            <option value="4.6x30 mm">4.6x30 mm</option>
            <option value="5.45x39 mm">5.45x39 mm</option>
            <option value="5.56x45 mm">5.56x45 mm</option>
            <option value="5.7x28 mm">5.7x28 mm</option>
            <option value="7.62x25mm">7.62x25mm</option>
            <option value="7.62x39 mm">7.62x39 mm</option>
            <option value="7.62x51 mm">7.62x51 mm</option>
            <option value="7.62x54R">7.62x54R</option>
            <option value="9x18mm">9x18mm</option>
            <option value="9x19mm">9x19mm</option>
            <option value="9x21mm">9x21mm</option>
            <option value="9x39mm">9x39mm</option>
            <option value="Other">Other</option>
        </select>
        <div className="info-wrapper">
            Load this page in another browser to control it from here
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


