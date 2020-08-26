import React from 'react';
import {
    Link
  } from "react-router-dom";

import MenuItem from './MenuItem';
import Supporter from './Supporter';
import {ReactComponent as PatreonIcon} from './Patreon.svg';

import ammoData from '../data.json';
import mapData from '../map-data.json';

const ammoTypes = [...new Set(ammoData.data.map((ammoData) => {
    return ammoData.type
}))].sort();

function Menu() {    
    return <div
            className="menu" 
        >
            
            <Link
                className = "branding"
                to = '/'
            >
                Tarkov Tools
            </Link>
            <div
                className = "submenu-wrapper"
            >
                <Link
                    to = '/ammo/'
                >
                    Ammo
                </Link>
                <ul>
                {ammoTypes.map(ammoType => 
                    <MenuItem
                        checkbox
                        displayText = {ammoType}
                        key = {ammoType}
                        prefix = '/ammo'
                        to = {`/ammo/${ammoType}`}
                    />
                )} 
                </ul>
            </div>
            <div
                className = "submenu-wrapper"
            >
                Maps
                <ul>
                {mapData.map(map => 
                    <MenuItem
                        displayText = {map.displayText}
                        key = {map.key}
                        to = {`/map/${map.key}`}
                    />
                )} 
                </ul>
            </div>
            <div
                className = "submenu-wrapper"
            >
                <Link
                    to = '/loot-tier/barter-items'
                >        
                    Loot tiers
                </Link>
                <ul>
                    <MenuItem
                        displayText = {'Barter Items'}
                        to = {`/loot-tier/barter-items`}
                    />
                    <MenuItem
                        displayText = {'Keys'}
                        to = {`/loot-tier/keys`}
                    />
                </ul>
            </div>
            <a 
                className = {'external-link'}
                href="https://developertracker.com/escape-from-tarkov/"
            >
                Dev tracker    
            </a>
            <a 
                className = {'external-link last-link'}
                href="https://www.patreon.com/kokarn"
            >
                <PatreonIcon />
                Support me  
                <div
                    className = {'supporters-wrapper'}
                >
                    Current supporters: 
                    <Supporter
                        name = {'Gustav Ahlberg'}
                        patreon
                        github
                    />
                    <Supporter
                        name = {'Tippidy'}
                        patreon
                    />
                </div>
            </a>
            
    </div>;
}

export default Menu;


