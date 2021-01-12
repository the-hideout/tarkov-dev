import {useState, useRef} from 'react';
import {
    Link
} from "react-router-dom";

import MenuItem from './MenuItem';
import {ReactComponent as PatreonIcon} from './Patreon.svg';
import MenuIcon from './MenuIcon.jsx';
import useObserver from '../../hooks/useObserver';

import ammoData from '../../data/ammo.json';
import mapData from '../../data/maps.json';

import './index.css';

const ammoTypes = [...new Set(ammoData.data.map((ammoData) => {
    return ammoData.type
}))].sort();

const Menu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navEl = useRef(null);
    const handleMenuClick = () => {
        setIsOpen(!isOpen);
    };
    let lastHeight = 0;

    const setCSSVar = () => {
        const viewableHeight = window.innerHeight - navEl.current?.offsetHeight || 0;

        if(viewableHeight === lastHeight){
            return true;
        }

        document.documentElement.style.setProperty('--display-height', `${viewableHeight}px`);
        lastHeight = viewableHeight;
    }

    useObserver({
        callback: setCSSVar,
        element: navEl,
    });

    return <nav
            className = "navigation"
            ref={navEl}
        >
            <Link
                className = "branding"
                to = '/'
            >
                Tarkov Tools
            </Link>
            <MenuIcon
                onClick = {handleMenuClick}
            />
            <ul
                className = {`menu${isOpen ? ' open': ''}`}
            >

                <li
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
                            onClick = {setIsOpen.bind(this, false)}
                        />
                    )}
                    </ul>
                </li>
                <li
                    className = "submenu-wrapper"
                >
                    <Link
                        to = '/maps/'
                    >
                        Maps
                    </Link>
                    <ul>
                    {mapData.map(map =>
                        <MenuItem
                            displayText = {map.displayText}
                            key = {map.key}
                            to = {`/map/${map.key}`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                    )}
                    </ul>
                </li>
                <li
                    className = "submenu-wrapper"
                >
                    <Link
                        to = '/loot-tier/'
                        onClick = {setIsOpen.bind(this, false)}
                    >
                        Loot tiers
                    </Link>
                    {/* <ul>
                        <MenuItem
                            displayText = {'Barter Items'}
                            to = {`/loot-tier/barter-items`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                        <MenuItem
                            displayText = {'Mods'}
                            to = {`/loot-tier/mods`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                        <MenuItem
                            displayText = {'Keys'}
                            to = {`/loot-tier/keys`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                    </ul> */}
                </li>
                <li
                    className = "submenu-wrapper"
                >
                    <Link
                        to = '/control/'
                        onClick = {setIsOpen.bind(this, false)}
                    >
                        Remote control
                    </Link>
                </li>
                <a
                    className = {'external-link'}
                    href="https://developertracker.com/escape-from-tarkov/"
                >
                    Dev tracker
                </a>
                <a
                    href="https://www.patreon.com/kokarn"
                >
                    <PatreonIcon />
                </a>
                <Link
                    className = {'last-link'}
                        to = '/about/'
                        onClick = {setIsOpen.bind(this, false)}
                    >
                        About
                </Link>
            </ul>
    </nav>;
}

export default Menu;


