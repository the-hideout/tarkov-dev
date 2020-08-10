import React from 'react';

import MenuItem from './MenuItem';

import ammoData from '../data.json';
import mapData from '../map-data.json';

const ammoTypes = [...new Set(ammoData.data.map((ammoData) => {
    return ammoData.type
}))].sort();

function Menu(props) {
    const setMap = (mapKey, event) => {
        event.preventDefault();
        props.setCurrentView('map');
        props.setCurrentMap(mapKey);
    };
    
    const setAmmo = (ammo, event) => {
        event.preventDefault();
        props.setCurrentView('ammo');
        props.setCurrentAmmo(ammo);
    };
    
    return <div
            className="menu" 
        >
            <span
                className="branding"
            >
            Tarkov Tools
            </span>
            <a href="">
                Ammo
                <ul>
                {ammoTypes.map(ammoType => 
                    <MenuItem
                        handleClick={setAmmo.bind(this, ammoType)}
                        key = {ammoType}
                    >
                        {ammoType}
                    </MenuItem>
                )} 
                </ul>
            </a>
            <a href="">
                Maps
                <ul>
                {mapData.map(map => 
                    <MenuItem
                        handleClick={setMap.bind(this, map.key)}
                        key = {map.key}
                    >
                        {map.displayText}
                    </MenuItem>
                )} 
                </ul>
            </a>
    </div>;
}

export default Menu;


