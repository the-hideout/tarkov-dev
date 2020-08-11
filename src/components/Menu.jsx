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
            <a
                className = "branding"
                href={process.env.PUBLIC_URL}
            >
            Tarkov Tools
            </a>
            <div
                className = "submenu-button"
            >
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
            </div>
            <div
                className = "submenu-button"
            >
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
            </div>
            <a 
                href="https://developertracker.com/escape-from-tarkov/"
            >
                Dev tracker    
            </a>
    </div>;
}

export default Menu;


