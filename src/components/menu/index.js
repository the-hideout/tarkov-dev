import {useState} from 'react';
import {
    Link
} from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Icon from '@mdi/react';
import {mdiCogOutline} from '@mdi/js';

import MenuItem from './MenuItem';
import MenuIcon from './MenuIcon.jsx';

import ammoData from '../../data/ammo.json';
import mapData from '../../data/maps.json';

import './index.css';

const ammoTypes = [...new Set(ammoData.data.map((ammoData) => {
    return ammoData.type
}))].sort();

const Menu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const handleMenuClick = () => {
        setIsOpen(!isOpen);
    };
    const { t } = useTranslation();

    return <nav
            key = 'main-navigation'
            className = "navigation"
        >
            <Link
                className = "branding"
                to = '/'
            >
                Tarkov Tools
            </Link>
            <Link
                className = 'mobile-settings-link'
                to = '/settings/'
                onClick = {setIsOpen.bind(this, false)}
            >
                <Icon
                    path={mdiCogOutline}
                    size={1}
                    className = 'icon-with-text'
                />
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
                        to = '/'
                        onClick = {setIsOpen.bind(this, false)}
                    >
                        {t('Home')}
                    </Link>
                </li>
                <li
                    className = "submenu-wrapper"
                >
                    <Link
                        to = '/ammo/'
                    >
                        {t('Ammo')}
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
                        {t('Maps')}
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
                        {t('Loot tiers')}
                    </Link>
                </li>
                <li
                    className = "submenu-wrapper"
                >
                    <Link
                        to = '/gear/'
                    >
                        {t('Gear')}
                    </Link>
                    <ul>
                        <MenuItem
                            displayText = {t('Armor')}
                            to = {`/gear/armor`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                        <MenuItem
                            displayText = {t('Backpacks')}
                            to = {`/gear/backpacks`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                        <MenuItem
                            displayText = {t('Helmets')}
                            to = {`/gear/helmets`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                        <MenuItem
                            displayText = {t('Glasses')}
                            to = {`/gear/glasses`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                        <MenuItem
                            displayText = {t('Rigs')}
                            to = {`/gear/rigs`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                        <MenuItem
                            displayText = {t('Suppressors')}
                            to = {`/gear/suppressors`}
                            onClick = {setIsOpen.bind(this, false)}
                        />
                    </ul>
                </li>
                <li
                    className = "submenu-wrapper"
                >
                    <Link
                        to = '/control/'
                        onClick = {setIsOpen.bind(this, false)}
                    >
                        {t('Remote')}
                    </Link>
                </li>
                <li
                    className = "submenu-wrapper"
                >
                    <Link
                        to = '/barters/'
                        onClick = {setIsOpen.bind(this, false)}
                    >
                        {t('Barter profit')}
                    </Link>
                </li>
                <li
                    className = "submenu-wrapper"
                >
                    <Link
                        to = '/hideout-profit/'
                        onClick = {setIsOpen.bind(this, false)}
                    >
                        {t('Hideout profit')}
                    </Link>
                </li>
                <li
                    className = "submenu-wrapper desktop-settings-link"
                >
                    <Link
                        to = '/settings/'
                        onClick = {setIsOpen.bind(this, false)}
                    >
                        <Icon
                            path={mdiCogOutline}
                            size={1}
                            className = 'icon-with-text'
                        />
                    </Link>
                </li>
            </ul>
    </nav>;
}

export default Menu;


